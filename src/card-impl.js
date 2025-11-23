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
    };
  }

  setConfig(config) {
    this._debug('setConfig wird aufgerufen mit:', config);
    if (!config) {
      throw new Error('Keine Konfiguration vorhanden');
    }

    this.config = {
      ...this.getDefaultConfig(),
      ...config,
    };

    this._debug('config nach setConfig:', this.config);

    // View initialisieren
    this._debug('setConfig: Initialisiere Calendar-View');
    this._viewType = 'CalendarView';

    try {
      // Erstelle CalendarView als Custom Element
      this._view = document.createElement('calendar-view');
      this._view.config = this.config;

      // Übergebe hass an die View, falls es bereits gesetzt wurde
      if (this._hass) {
        this._debug('setConfig: Übergebe gespeicherten hass an Calendar-View');
        this._view.hass = this._hass;
      }

      this._debug('setConfig: View initialisiert:', {
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
