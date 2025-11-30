import { css } from 'lit';
import { SuperBase } from './super-base.js';

export class CardBase extends SuperBase {
  static className = 'CardBase';

  static properties = {
    ...super.properties,
    _selectedTab: { type: Number },
  };

  constructor() {
    super();
    this.dM = `${this.constructor.className}: `; // debugMsgPrefix - Prefix für Debug-Nachrichten

    this._selectedTab = 0;
    this._debug(`CardBase-Modul wird geladen`);

    // Array für Änderungs-Observer
    this.informAtChangesClients = [];

    // Eigene Verwaltung der registrierten EventTypes
    this._registeredEventTypes = new Set();

    // Registriere Event-Listener für automatische Registrierung
    this.addEventListener('registerMeForChanges', this._onRegisterMeForChanges.bind(this));
  }

  async firstUpdated() {
    this._debug('CardBase firstUpdated: Start');
    await super.firstUpdated();
    this._debug('CardBase firstUpdated: Ende');
  }

  setConfig(config) {
    this._debug('setConfig wird aufgerufen mit:', config);
    if (!config) {
      throw new Error('Keine Konfiguration angegeben');
    }

    // Prüfe, ob es sich um eine neue Konfiguration handelt
    const isNewConfig = !this.config || Object.keys(this.config).length === 0;

    // Wenn es eine neue Konfiguration ist, verwende sie direkt
    if (isNewConfig) {
      this.config = {
        ...this.getDefaultConfig(),
        ...config,
      };
    } else {
      // Ansonsten behalte die bestehende Konfiguration bei und aktualisiere nur geänderte Werte
      this.config = {
        ...this.config,
        ...config,
      };
    }

    this._debug('config nach setConfig:', this.config);
  }

  getDefaultConfig() {
    this._debug('getDefaultConfig wird aufgerufen');
    return {
      entity: 'input_text.arbeitszeiten',
      numberOfMonths: 14,
      initialDisplayedMonths: 2,
      mode: 'single',
      selectedCalendar: 'a', // Standardschicht
      calendars: [
        { shortcut: 'a', name: 'Standardkalender', color: '#ff9800', enabled: true },
        { shortcut: 'b', name: 'Kalender B', color: '#ff0000', enabled: false },
        { shortcut: 'c', name: 'Kalender C', color: '#00ff00', enabled: false },
        { shortcut: 'd', name: 'Kalender D', color: '#0000ff', enabled: false },
        { shortcut: 'e', name: 'Kalender E', color: '#ffff00', enabled: false },
      ],
    };
  }

  render(content = '') {
    this._debug('render wird aufgerufen');
    return html`
      <ha-card>
        <div class="card-content">${content}</div>
        ${this.showVersion ? html` <div class="version">Version: ${this.version}</div> ` : ''}
      </ha-card>
    `;
  }

  static styles = [
    super.styles,
    css`
      :host {
        display: block;
      }

      ha-card {
        padding: 16px;
      }

      .loading {
        text-align: center;
        padding: 20px;
        color: var(--secondary-text-color);
      }

      .error {
        text-align: center;
        padding: 20px;
        color: var(--error-color);
      }
    `,
  ];

  _onRegisterMeForChanges(event) {
    this._debug('Registrierungsanfrage empfangen', {
      component: event.target,
      detail: event.detail,
    });

    const { component, callback, eventType = '', immediately = false } = event.detail;

    if (component && typeof callback === 'function') {
      this.registerInformAtChangesClients(component, eventType, immediately, callback);
      this._debug('Komponente erfolgreich registriert', {
        component: component.tagName || component.constructor.name,
        eventType: eventType,
      });
    } else {
      this._debug('Registrierung fehlgeschlagen', {
        componentExists: !!component,
        hasCallback: typeof callback === 'function',
      });
    }
  }

  /**
   * Registriert einen Observer für View-Änderungen
   * @param {Object} me - Das Objekt, das über Änderungen informiert werden soll
   * @param {string|Array} eventType - Event-Typ als String oder Array von Strings
   * @param {Function} callback - Callback-Funktion, die bei Änderungen aufgerufen wird
   */
  registerInformAtChangesClients(me, eventType = '', immediately = false, callback = null) {
    const dM = `${this.dM || '?: '}registerInformAtChangesClients() `;
    this._debug(`${dM}Anfrage`, {
      me,
      newEventType: eventType,
    });

    // Normalisiere die neuen EventTypes
    const eventTypes = Array.isArray(eventType)
      ? eventType.map(e => e.toLowerCase()).sort()
      : typeof eventType === 'string'
        ? eventType
            .split(',')
            .map(e => e.trim().toLowerCase())
            .filter(e => e.length > 0)
            .sort()
        : [];

    // Prüfe ob bereits ein Observer für denselben me existiert
    const existingMeInformer = this.informAtChangesClients.find(informer => informer.me === me);
    let existingEventTypes = [];
    if (existingMeInformer) {
      // Normalisiere die bestehenden eventTypes
      existingEventTypes = Array.isArray(existingMeInformer.eventType)
        ? existingMeInformer.eventType.map(e => e.toLowerCase()).sort()
        : typeof existingMeInformer.eventType === 'string'
          ? existingMeInformer.eventType
              .split(',')
              .map(e => e.trim().toLowerCase())
              .filter(e => e.length > 0)
              .sort()
          : [];
    }
    // Finde nur die wirklich neuen EventTypes
    const newEventTypes = eventTypes.filter(newType => !existingEventTypes.includes(newType));
    if (existingMeInformer && newEventTypes.length === 0) {
      this._debug(`${dM}Client war bereits mit allen Typen registriert`, {
        me,
        requestedEventTypes: eventTypes,
        existingEventTypes,
      });
      return false;
    }

    if (existingMeInformer) {
      // Füge nur die neuen EventTypes hinzu
      const combinedEventTypes = [...existingEventTypes, ...newEventTypes].sort();
      existingMeInformer.eventType = combinedEventTypes;
      this._debug(`${dM}Neue EventTypes hinzugefügt`, {
        me,
        newEventTypes,
        existingEventTypes,
        combinedEventTypes,
      });
    } else {
      // Füge neuen Client hinzu
      this.informAtChangesClients.push({
        me,
        eventType: newEventTypes,
        callback,
      });
      this._debug(`${dM}Neuer Informer registriert`, {
        me,
        newEventTypes,
        totalObservers: this.informAtChangesClients.length,
      });
    }
    newEventTypes.forEach(eventType => {
      // Prüfe ob bereits ein Listener für diesen EventType existiert
      if (!this._registeredEventTypes.has(eventType)) {
        this._debug(`${dM}Füge Listener für EventType hinzu`, { eventType });
        this.addEventListener(eventType + '-event', this._notifyClientsAtChanges.bind(this));
        this._registeredEventTypes.add(eventType);
      } else {
        this._debug(`${dM}Listener für EventType bereits vorhanden`, { eventType });
      }
      const fkt = '_onRegisterMeFor_' + eventType.charAt(0).toUpperCase() + eventType.slice(1);
      this._debug(`${dM}Registriere Komponente für EnvSniffer-Änderungen`, { fkt });
      if (typeof this[fkt] === 'function') {
        this[fkt](immediately, me);
      }
    });

    return true;
  }

  _notifyClientsAtChanges(event) {
    this._debug('_notifyClientsAtChanges() Anfrage', {
      event,
    });
    // Sichere Extraktion des EventTypes (entferne '-event' Suffix)
    const eventType = event.type.replace('-event', '');
    const fkt = '_on' + eventType.charAt(0).toUpperCase() + eventType.slice(1);
    // const data = {[eventType]: (typeof this[fkt] === 'function') ? this[fkt](event.detail) : event.detail};

    this._debug('_notifyClientsAtChanges() EventType extrahiert', {
      originalEventType: event.type,
      extractedEventType: eventType,
      clients: this.informAtChangesClients,
      fkt: fkt,
    });

    this.informAtChangesClients.forEach(client => {
      // Prüfe ob client.me auf ein existierendes DOM-Element verweist
      if (
        eventType &&
        client.eventType.includes(eventType) &&
        client.me &&
        (client.me instanceof Element || client.me.nodeType)
      ) {
        // Zusätzliche Prüfung: Ist das Element noch im DOM?
        if (document.contains(client.me) || client.me.isConnected) {
          // Client benachrichtigen
          const details =
            typeof this[fkt] === 'function' ? this[fkt](client.me, event) : event.detail || {};
          const data = { [eventType]: details };
          if (details && client.callback && typeof client.callback === 'function') {
            try {
              this._debug('_notifyClientsAtChanges() Client benachrichtigen', {
                client: client.me.constructor.name,
                eventType: eventType,
                data: data,
              });
              client.callback(data);
            } catch (error) {
              // Fehler beim Benachrichtigen des Clients
            }
          }
        }
      }
    });
  }
}
