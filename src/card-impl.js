import { html, css } from 'lit';
import { CardBase } from './card-base.js';
import { TableView } from './views/table-view/table-view.js';
import { EPGView } from './views/epg-view/epg-view.js';
import { CardName, CardRegname, DebugMode } from './card-config.js';

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
      blacklist: '',
      whitelist: '',
      importantlist: '',
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

    // View initialisieren
    this._debug('CardImpl setConfig: Initialisiere EPG-View');
    this._viewMode = this.config.view_mode || 'epg';
    this._viewType = 'EPGView';
    this._view = new EPGView();
    this._view.config = this.config;
    this._debug('CardImpl setConfig: View initialisiert:', {
      viewMode: this._viewMode,
      viewType: this._viewType,
      config: this.config,
    });
  }

  set hass(hass) {
    this._debug('CardImpl set hass wird aufgerufen');
    if (this._view) {
      this._view.hass = hass;
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
    return this._view;
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
