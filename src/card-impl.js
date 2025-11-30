import { html, css } from 'lit';
import { CardBase } from './card-base.js';
import './views/calendar-view/calendar-view.js'; // Import für Custom Element Registrierung
import { CardName, CardRegname } from './card-config.js';

export class CardImpl extends CardBase {
  static className = 'CardImpl';
  static get properties() {
    return {
      ...super.properties,
      config: { type: Object },
      hass: { type: Object },
      _view: { type: Object },
      _viewType: { type: String },
    };
  }

  static getConfigElement() {
    return document.createElement(`${CardRegname}-editor`);
  }

  static getStubConfig() {
    return {
      entity: 'input_text.arbeitszeiten',
      numberOfMonths: 14,
      initialDisplayedMonths: 2,
      useElements: false,
      mode: 'single',
      selectedElement: null,
      elements: [
        { benennung: 'Element 1', aktiv: true, color: '#ff0000', shortcut: '1' },
        { benennung: 'Element 2', aktiv: true, color: '#00ff00', shortcut: '2' },
        { benennung: 'Element 3', aktiv: true, color: '#0000ff', shortcut: '3' },
        { benennung: 'Element 4', aktiv: true, color: '#ffff00', shortcut: '4' },
      ],
    };
  }

  constructor() {
    super();
    this._debug(`CardImpl-Modul wird geladen`);
    this.config = this.getDefaultConfig();
    this._debug('CardImpl-Konstruktor: Initialisierung abgeschlossen');
  }


  getDefaultConfig() {
    this._debug(`CardImpl getDefaultConfig wird aufgerufen`);
    return {
      entity: 'input_text.arbeitszeiten',
      numberOfMonths: 14,
      initialDisplayedMonths: 2,
      mode: 'single',
      selectedCalendar: 'a', // Standardkalender
      calendars: [
        { shortcut: 'a', name: 'Standardkalender', color: '#ff9800', enabled: true },
        { shortcut: 'b', name: 'Kalender B', color: '#ff0000', enabled: false },
        { shortcut: 'c', name: 'Kalender C', color: '#00ff00', enabled: false },
        { shortcut: 'd', name: 'Kalender D', color: '#0000ff', enabled: false },
        { shortcut: 'e', name: 'Kalender E', color: '#ffff00', enabled: false },
      ],
    };
  }

  setConfig(config) {
    this._debug('setConfig wird aufgerufen mit:', config);
    if (!config) {
      throw new Error('Keine Konfiguration vorhanden');
    }

    // Merge Config: Behalte selectedCalendar aus der übergebenen Config, falls vorhanden
    const defaultConfig = this.getDefaultConfig();
    this.config = {
      ...defaultConfig,
      ...config,
      // Stelle sicher, dass selectedCalendar aus der übergebenen Config beibehalten wird
      selectedCalendar: config?.selectedCalendar !== undefined ? config.selectedCalendar : (this.config?.selectedCalendar || defaultConfig.selectedCalendar),
    };

    this._debug('config nach setConfig:', this.config);

    // View initialisieren oder aktualisieren
    this._viewType = 'CalendarView';

    try {
      if (!this._view) {
        // Erstelle CalendarView als Custom Element nur wenn noch nicht vorhanden
        this._debug('setConfig: Erstelle neue Calendar-View');
        this._view = document.createElement('calendar-view');

        // Event-Listener für Config-Änderungen von der View
        this._view.addEventListener('config-changed', (ev) => {
          this._debug('config-changed Event von Calendar-View empfangen:', ev.detail);
          if (ev.detail && ev.detail.config) {
            this.config = ev.detail.config;
            // Dispatch das Event weiter, damit Home Assistant die Config aktualisiert
            this.dispatchEvent(
              new CustomEvent('config-changed', {
                detail: { config: this.config },
                bubbles: true,
                composed: true,
              })
            );
          }
        });

        // Übergebe hass an die View, falls es bereits gesetzt wurde
        if (this._hass) {
          this._debug('setConfig: Übergebe gespeicherten hass an Calendar-View');
          this._view.hass = this._hass;
        }
      } else {
        // View existiert bereits, aktualisiere nur die Config
        this._debug('setConfig: Aktualisiere bestehende Calendar-View');
      }

      // Aktualisiere die Config der View (wichtig: auch wenn View bereits existiert)
      this._view.config = this.config;

      this._debug('setConfig: View initialisiert/aktualisiert:', {
        viewType: this._viewType,
        config: this.config,
      });
    } catch (error) {
      this._debug('setConfig: Fehler bei View-Initialisierung:', error);
      throw new Error(`Fehler bei der View-Initialisierung: ${error.message}`);
    }
  }

  set hass(hass) {
    // this._debug('set hass wird aufgerufen');
    this._hass = hass;
    if (this._view) {
      this._view.hass = hass;
    } else {
      this._debug('set hass: View noch nicht initialisiert, speichere hass für später');
    }
  }

  get hass() {
    return this._hass;
  }

  firstUpdated() {
    this._debug('firstUpdated wird aufgerufen');
    if (this._view) {
      this._view.firstUpdated();
    }
    this._debug('firstUpdated abgeschlossen');
  }

  render() {
    if (!this._view) {
      return html`<div class="error">Keine View verfügbar</div>`;
    }

    try {
      return html`${this._view}`;
    } catch (error) {
      this._debug('render: Fehler beim Rendern der View:', error);
      return html`<div class="error">Fehler beim Rendern: ${error.message}</div>`;
    }
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
}
