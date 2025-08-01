import { html, css } from 'lit';
import { CardBase } from './card-base.js';
import { TableView } from './views/table-view/table-view.js';
import { EPGView } from './views/epg-view/epg-view.js';
import { EnvSniffer } from './env-sniffer.js';
import { CardName, CardRegname, DebugMode, UseDummyData } from './card-config.js';

export class CardImpl extends CardBase {
  static className = 'CardImpl';
  static get properties() {
    return {
      ...super.properties,
      config: { type: Object },
      hass: { type: Object },
      _view: { type: Object },
      _viewMode: { type: String },
      _viewType: { type: String },
      _envSniffer: { type: Object },
    };
  }

  static getConfigElement() {
    return document.createElement(`${CardRegname}-editor`);
  }

  static getStubConfig() {
    return {
      entity: 'sensor.vdr_vdr_epg_info',
      time_window: 'C',
      date: '',
      view_mode: 'epg',
      max_items: 10,
      show_channel: true,
      show_time: true,
      show_duration: true,
      show_title: true,
      show_description: true,
      show_channel_groups: false,
      test_template: '',
      epgShowPastTime: 60,
      epgShowFutureTime: 180,
      useDummyData: UseDummyData === 'true',
    };
  }

  constructor() {
    super();
    this._debug(`CardImpl-Modul wird geladen`);
    this.config = this.getDefaultConfig();

    // Environment Observer Registry - Array mit Objekten die über Umgebungsänderungen informiert werden sollen
    this._environmentObserverClients = [];

    // EnvSniffer wird nur bei Bedarf initialisiert
    this._envSniffer = null;
    this.env = null;

    // Array für Änderungs-Observer
    this.informAtChangesClients = [];

    // Eigene Verwaltung der registrierten EventTypes
    this._registeredEventTypes = new Set();

    // Registriere Event-Listener für automatische Registrierung
    this.addEventListener('registerMeForChanges', this._onRegisterMeForChanges.bind(this));

    // Event-Listener für Environment-Requests von der epg-box
    this.addEventListener('request-environment', this._handleEnvironmentRequest.bind(this));

    // Event-Listener für Environment Observer Registrierungen
    this.addEventListener(
      'register-observer-client',
      this._handleObserverClientRegistration.bind(this)
    );

    this._debug('CardImpl-Konstruktor: Initialisierung abgeschlossen');
  }

  /**
   * Initialisiert den EnvSniffer bei Bedarf
   */
  _initEnvSnifferIfNeeded() {
    if (!this._envSniffer) {
      this._debug('CardImpl: Initialisiere EnvSniffer bei Bedarf');
    this._envSniffer = new EnvSniffer();
    this._envSniffer.init(this);

      // Warte kurz und prüfe dann die Werte
      setTimeout(() => {
        if (this._envSniffer && this._envSniffer.env) {
          this.env = this._envSniffer.env;
          this._debug('CardImpl: EnvSniffer initialisiert', {
            env: this.env,
            cardWidth: this.env.cardWidth,
            typeOfView: this.env.typeOfView,
          });
        } else {
          this._debug('CardImpl: EnvSniffer initialisiert, aber env noch nicht verfügbar');
        }
      }, 50);

    // this._envSniffer.addEventListener(
    //   'environment-changed',
    //   this._handleEnvironmentChange.bind(this)
    // );
    }
  }

  /**
   * Behandelt Environment-Requests
   */
  _handleEnvironmentRequest(event) {
    this._debug('[_handleEnvironmentRequest()]: Environment-Request erhalten', event);

    // Initialisiere EnvSniffer bei Bedarf
    this._initEnvSnifferIfNeeded();

    // Stößt den EnvSniffer nochmal an
    this._envSniffer.detectEnvironment();
  }

  _onRegisterMeForChanges(event) {
    this._debug('EPG-Card: Registrierungsanfrage empfangen', {
      component: event.target,
      detail: event.detail,
    });

    const { component, callback, eventType = "", immediately = false } = event.detail;

    if (component && typeof callback === 'function') {
      this.registerInformAtChangesClients(component, eventType, immediately, callback);
      this._debug('EPG-Card: Komponente erfolgreich registriert', {
        component: component.tagName || component.constructor.name,
        eventType: eventType,
      });
    } else {
      this._debug('EPG-Card: Registrierung fehlgeschlagen', {
        componentExists: !!component,
        hasCallback: typeof callback === 'function',
      });
    }
  }

  informClientsAtChanges(eventType = "", data = {}) {
    this._debug('EPG-Card: informClientsAtChanges() Anfrage', {
      eventType: eventType,
      data: data,
    });

    // Sichere Behandlung von changedProperties, falls vorhanden
    if (data.changedProperties) {
      if (data.changedProperties instanceof Map) {
        data.changedPropertiesKeys = Array.from(data.changedProperties.keys());
      } else {
        data.changedPropertiesKeys = Object.keys(data.changedProperties || {});
      }
    }

    this.informAtChangesClients.forEach(client => {
      if (client.eventType.includes(eventType)) {
        try {
          client.callback(data);
        } catch (error) {
          this._debug('EPG-Card: Fehler beim Benachrichtigen des Clients', {
            client: client.me?.constructor?.name || 'Unknown',
            eventType: eventType,
            error: error.message,
          });
        }
      }
    });
  }

  /**
   * Registriert einen Observer für View-Änderungen
   * @param {Object} me - Das Objekt, das über Änderungen informiert werden soll
   * @param {string|Array} eventType - Event-Typ als String oder Array von Strings
   * @param {Function} callback - Callback-Funktion, die bei Änderungen aufgerufen wird
   */
  registerInformAtChangesClients(me, eventType = "", immediately = false, callback = null) {
    this._debug('EPG-Card: registerInformAtChangesClients() Anfrage', {
      me,
      newEventType: eventType,
    });

    // Normalisiere die neuen EventTypes
    const eventTypes = Array.isArray(eventType)
      ? eventType.map(e => e.toLowerCase()).sort()
      : typeof eventType === 'string' ? eventType.split(',').map(e => e.trim().toLowerCase()).filter(e => e.length > 0).sort() : [];

    // Prüfe ob bereits ein Observer für denselben me existiert
    const existingMeInformer = this.informAtChangesClients.find(informer => informer.me === me);
    let existingEventTypes = [];
    if (existingMeInformer) {
      // Normalisiere die bestehenden eventTypes
      existingEventTypes = Array.isArray(existingMeInformer.eventType)
        ? existingMeInformer.eventType.map(e => e.toLowerCase()).sort()
        : typeof existingMeInformer.eventType === 'string'
          ? existingMeInformer.eventType.split(',').map(e => e.trim().toLowerCase()).filter(e => e.length > 0).sort()
          : [];
      }
    // Finde nur die wirklich neuen EventTypes
    const newEventTypes = eventTypes.filter(newType => !existingEventTypes.includes(newType));
    if (existingMeInformer && newEventTypes.length === 0) {
      this._debug('EPG-Card: registerInformAtChangesClients() Client war bereits mit allen Typen registriert', {
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
        this._debug('EPG-Card: registerInformAtChangesClients() Neue EventTypes hinzugefügt', {
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
      this._debug('EPG-Card: registerInformAtChangesClients() Neuer Informer registriert', {
        me,
        newEventTypes,
        totalObservers: this.informAtChangesClients.length,
      });
    }
    newEventTypes.forEach(eventType => {
      // Prüfe ob bereits ein Listener für diesen EventType existiert
      if (!this._registeredEventTypes.has(eventType)) {
        this._debug('CardImpl: Füge Listener für EventType hinzu', { eventType });
        this.addEventListener(eventType + '-event', this._notifyClientsAtChanges.bind(this));
        this._registeredEventTypes.add(eventType);
      } else {
        this._debug('CardImpl: Listener für EventType bereits vorhanden', { eventType });
      }

      switch (eventType) {
        case "envchanges":
          this._initEnvSnifferIfNeeded();
          if (immediately) {
            // Stößt den EnvSniffer nochmal an
            this._envSniffer.detectEnvironment();
          }
          break;
        case "viewChanges":
          break;
      }
    })

    return true;


  }


  /**
   * Behandelt Environment Observer Registrierungen via Events
   */
  _handleObserverClientRegistration(event) {
    const client = event.detail;
    this._debug('CardImpl: Environment Observer Registrierung erhalten', {
      client: client.client.constructor.name,
    });

    // Registriere den Observer
    this.registerEnvironmentObserverClient(client);

    // Initialisiere EnvSniffer bei Bedarf
    this._initEnvSnifferIfNeeded();

    // Sende aktuelle Environment-Werte direkt an den neuen Client
    // Warte bis cardWidth > 0 ist, bevor das Event gesendet wird
    this._sendEnvironmentToClientWhenReady(client);
  }

  /**
   * Sendet Environment-Werte an Client, sobald cardWidth > 0 ist
   */
  _sendEnvironmentToClientWhenReady(client) {
    // Initialisiere Retry-Counter falls nicht vorhanden
    if (!client._envRetryCount) {
      client._envRetryCount = 0;
      client._envRetryStartTime = Date.now();
    }

    // Prüfe Max-Versuche (50 Versuche = 5 Sekunden)
    if (client._envRetryCount >= 50) {
      this._debug('CardImpl: Max-Versuche erreicht, verwende Fallback-Werte', {
        client: client.client.constructor.name,
        retryCount: client._envRetryCount,
        elapsedTime: Date.now() - client._envRetryStartTime,
      });

      // Sende Fallback-Werte
      const fallbackEnv = {
        cardWidth: 1200,
        cardHeight: 600,
        isDesktop: true,
        isMobile: false,
        isHorizontal: true,
        isVertical: false,
        isTouchscreen: false,
        screenWidth: 1920,
        screenHeight: 1080,
        typeOfView: 'tile',
      };

      client.client.dispatchEvent(
        new CustomEvent('envchanges-event', {
          detail: {
            oldState: null,
            newState: fallbackEnv,
          },
          bubbles: false,
          composed: false,
        })
      );
      return;
    }

    if (!this._envSniffer || !this._envSniffer.env) {
      this._debug('CardImpl: EnvSniffer noch nicht verfügbar, warte...', {
        retryCount: client._envRetryCount,
      });
      client._envRetryCount++;
      // Warte kurz und versuche es erneut
      setTimeout(() => this._sendEnvironmentToClientWhenReady(client), 100);
      return;
    }

    const currentEnv = this._envSniffer.env;

    // Debug: Zeige alle verfügbaren Informationen
    this._debug('CardImpl: EnvSniffer Status', {
      hasEnvSniffer: !!this._envSniffer,
      hasEnv: !!currentEnv,
      envKeys: currentEnv ? Object.keys(currentEnv) : [],
      cardWidth: currentEnv?.envSnifferCardWidth,
      fullEnv: currentEnv,
    });

    // Prüfe ob cardWidth > 0 ist
    if (!currentEnv.envSnifferCardWidth || currentEnv.envSnifferCardWidth <= 0) {
      this._debug('CardImpl: cardWidth noch 0, warte auf gültige Werte...', {
        cardWidth: currentEnv.cardWidth,
        env: currentEnv,
        retryCount: client._envRetryCount,
      });
      client._envRetryCount++;
      // Warte kurz und versuche es erneut
      setTimeout(() => this._sendEnvironmentToClientWhenReady(client), 100);
      return;
    }

    // Jetzt haben wir gültige Environment-Werte
    this._debug('CardImpl: Sende aktuelle Environment-Werte an neuen Client', {
      client: client.client.constructor.name,
      env: currentEnv,
      retryCount: client._envRetryCount,
      elapsedTime: Date.now() - client._envRetryStartTime,
    });

    client.client.dispatchEvent(
      new CustomEvent('envchanges-event', {
        detail: {
          oldState: null,
          newState: currentEnv,
        },
        bubbles: false,
        composed: false,
      })
    );
  }


  _notifyClientsAtChanges(event) {
    this._debug('EPG-Card: notifyClientsAtChanges() Anfrage', {
      event
    });
    // Sichere Extraktion des EventTypes (entferne '-event' Suffix)
    const eventType = event.type.replace('-event', '');
    const data = {
      [eventType]: event.detail,
    };

    this._debug('EPG-Card: EventType extrahiert', {
      originalEventType: event.type,
      extractedEventType: eventType,
      data: data,
      clients: this.informAtChangesClients,
    });

    this.informAtChangesClients.forEach(client => {
        // Prüfe ob client.me auf ein existierendes DOM-Element verweist
        if (eventType &&
            client.eventType.includes(eventType) &&
            (client.me && (client.me instanceof Element || client.me.nodeType)) ) {
          // Zusätzliche Prüfung: Ist das Element noch im DOM?
          if (document.contains(client.me) || client.me.isConnected) {
            // Client benachrichtigen
            if (client.callback && typeof client.callback === 'function') {
              try {
                this._debug('EPG-Card: notifyClientsAtChanges() Client benachrichtigen', {
                  client: client.me.constructor.name,
                  eventType: eventType,
                  data: data,
                });
                client.callback(data);
              } catch (error) {
                console.error('notifyClientsAtChanges Fehler beim Benachrichtigen des Clients:', error);
              }
            }
          }
        }
      });
  }
  /**
   * Behandelt Umgebungsänderungen
   */
  // _handleEnvironmentChange(event) {
  //   const { oldState, newState } = event.detail;
  //   const data = {
  //     "envchanges": {
  //     oldState,
  //     newState,
  //     }
  //   };
  //   this._debug('CardImpl: ENV Umgebungsänderung erkannt', { oldState, newState });
  //   // Benachrichtige alle registrierten Environment Observer
  //   this._notifyClientsAtChanges("envchanges", data);
  // }
  /**
   * Registriert einen Observer für Umgebungsänderungen
   */
  registerEnvironmentObserverClient(client) {
    if (!this._environmentObserverClients.includes(client)) {
      this._environmentObserverClients.push(client);
      this._debug('CardImpl: Environment Observer registriert', {
        observer: client.constructor.name,
        totalObservers: this._environmentObserverClients.length,
      });
    }
  }

  /**
   * Entfernt einen Observer aus der Registrierung
   */
  unregisterEnvironmentObserver(observer) {
    const index = this._environmentObserverClients.indexOf(observer);
    if (index > -1) {
      this._environmentObserverClients.splice(index, 1);
      this._debug('CardImpl: Environment Observer entfernt', {
        observer: observer.constructor.name,
        totalObservers: this._environmentObserverClients.length,
      });
    }
  }

  /**
   * Benachrichtigt alle registrierten Observer über Umgebungsänderungen
   */
  _notifyEnvironmentObservers(oldState, newState) {
    this._debug('CardImpl: Benachrichtige Environment Observer', {
      observerCount: this._environmentObserverClients.length,
      oldState,
      newState,
    });

    for (const observer of this._environmentObserverClients) {
      try {
        if (observer) {
          // Dispatch Event an den Observer
          observer.dispatchEvent(
            new CustomEvent('envchanges-event', {
              detail: {
                oldState,
                newState,
              },
              bubbles: false,
              composed: false,
            })
          );
        }
      } catch (error) {
        this._debug('CardImpl: Fehler beim Benachrichtigen eines Observers', {
          observer: observer.constructor.name,
          error: error.message,
        });
      }
    }
  }

  /**
   * Passt die View an die neue Umgebung an
   */
  _adaptViewToEnvironment(envState) {
    if (this._view && typeof this._view.adaptToEnvironment === 'function') {
      this._view.adaptToEnvironment(envState);
    }
  }

  getDefaultConfig() {
    this._debug(`CardImpl getDefaultConfig wird aufgerufen`);

    return {
      entity: '',
      time_window: 'C',
      date: '',
      max_items: 10,
      show_channel: true,
      show_time: true,
      show_duration: true,
      show_title: true,
      show_description: true,
      show_channel_groups: false,
      view_mode: 'epg',
      test_template: '',
      epgShowPastTime: 60,
      epgShowFutureTime: 180,
      blacklist: '',
      whitelist: '',
      importantlist: '',
      epgShowPastTime: 60, // Minuten für Rückblick
      epgShowFutureTime: 180, // Minuten sichtbar in der Ansicht
      useDummyData: UseDummyData === 'true', // Verwende Dummy-Daten statt echte EPG-Daten (Build-Variable)
    };
  }

  setConfig(config) {
    this._debug('CardImpl setConfig wird aufgerufen mit:', config);
    if (!config) {
      throw new Error('Keine Konfiguration vorhanden');
    }

    this.config = {
      ...this.getDefaultConfig(),
      ...config,
    };
    this._debug('CardImpl config nach setConfig:', this.config);
    this._debug('CardImpl: Spezifische EPG-Werte', {
      epgShowPastTime: this.config.epgShowPastTime,
      epgShowFutureTime: this.config.epgShowFutureTime,
      configKeys: Object.keys(this.config),
    });

    // View initialisieren
    this._debug('CardImpl setConfig: Initialisiere EPG-View');
    this._viewMode = this.config.view_mode || 'epg';
    this._viewType = 'EPGView';

    try {
    this._view = new EPGView();
      this._debug('CardImpl: Übergebe Konfiguration an EPG-View', {
      epgShowPastTime: this.config.epgShowPastTime,
      epgShowFutureTime: this.config.epgShowFutureTime,
    });
    this._view.config = this.config;
      // this._view.env = this.env; // Nicht mehr nötig - Observer-Pattern übernimmt das

      // Übergebe hass an die View, falls es bereits gesetzt wurde
      if (this._hass) {
        this._debug('CardImpl setConfig: Übergebe gespeicherten hass an EPG-View');
        this._view.hass = this._hass;
      }

    this._debug('CardImpl setConfig: View initialisiert:', {
      viewMode: this._viewMode,
      viewType: this._viewType,
      config: this.config,
        // env: this.env, // Nicht mehr nötig
    });
    } catch (error) {
      this._debug('CardImpl setConfig: Fehler bei View-Initialisierung:', error);
      throw new Error(`Fehler bei der View-Initialisierung: ${error.message}`);
    }
  }

  set hass(hass) {
    this._debug('CardImpl set hass wird aufgerufen');
    this._hass = hass;
    if (this._view) {
      this._view.hass = hass;
    } else {
      this._debug('CardImpl set hass: View noch nicht initialisiert, speichere hass für später');
    }
  }

  get hass() {
    return this._hass;
  }

  firstUpdated() {
    this._debug('CardImpl firstUpdated wird aufgerufen');
    if (this._view) {
      this._view.firstUpdated();
    }
    this._debug('CardImpl firstUpdated abgeschlossen');
  }

  render() {
    if (!this._view) {
      return html`<div class="error">Keine View verfügbar</div>`;
    }

    try {
    return this._view;
    } catch (error) {
      this._debug('CardImpl render: Fehler beim Rendern der View:', error);
      return html`<div class="error">Fehler beim Rendern: ${error.message}</div>`;
    }
  }

  static get styles() {
    return [
      CardBase.styles,
      EPGView.styles,
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
  }
}
