import { html, css, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { CardBase } from './card-base';
import { CardName, CardVersion } from './card-config'; // kann entfallen
import { DataProvider } from './data-provider';
import { TableView } from './views/table-view';

export class CardImpl extends CardBase {
  static get properties() {
    console.debug('CardImpl static properties wird aufgerufen');
    return {
      _config: { type: Object },
      _hass: { type: Object },
      _loading: { type: Boolean },
      _error: { type: String },
      _epgData: { type: Array, reflect: true },
      _dataProvider: { type: Object }
    };
  }

  static getConfigElement() {
    console.debug('CardImpl static getConfigElement wird aufgerufen');
    return document.createElement('tg-epg-editor');
  }

  static getStubConfig() {
    console.debug('CardImpl static getStubConfig wird aufgerufen');
    return {
      entity: 'sensor.vdr_vdr_epg_info',
      time_window: 'C',
      date: '',
      view_mode: 'list',
      max_items: 10,
      show_channel: true,
      show_time: true,
      show_duration: true,
      show_title: true,
      show_description: true
    };
  }

  constructor() {
    super();
    this._config = this.getDefaultConfig();
    this._loading = false;
    this._error = null;
    this._epgData = [];
    this._dataProvider = null;
  }

  set hass(hass) {
    this._debug('CardImpl set hass wird aufgerufen');
    this._hass = hass;
    if (!this._dataProvider) {
      this._debug('CardImpl set hass: Initialisiere DataProvider');
      this._dataProvider = new DataProvider(hass);
    }
  }

  get hass() {
    return this._hass;
  }

  setConfig(config) {
    this._debug('CardImpl setConfig wird aufgerufen mit:', config);
    this._config = {
      ...this.getDefaultConfig(),
      ...config
    };
    this._debug('CardImpl setConfig: _config aktualisiert:', this._config);
    
    if (this._config.entity) {
      this._debug('CardImpl setConfig: Starte _loadEpgDataNew');
      this._loadEpgDataNew();
    } else {
      this._debug('CardImpl setConfig: Keine Entity in Config');
    }
  }

  async firstUpdated() {
    super.firstUpdated();
    this._debug('CardImpl firstUpdated wird aufgerufen');
    if (this._config.entity) {
      this._debug('CardImpl firstUpdated: Starte _loadEpgDataNew');
      this._loadEpgDataNew();
    } else {
      this._debug('CardImpl firstUpdated: Keine Entity in Config');
    }
  }

  async _loadEpgData() {
    if (!this.hass || !this._config.entity) {
      this._debug('_loadEpgData: Übersprungen - hass oder entity fehlt', {
        hass: !!this.hass,
        entity: this._config.entity
      });
      return;
    }

    this._loading = true;

    try {
      this._debug('Serviceaufruf wird gestartet:', {
        entity: this._config.entity,
        time_window: this._config.time_window,
        date: this._config.date
      });

      const response = await this.hass.connection.sendMessagePromise({
        type: "call_service",
        domain: "tgvdr",
        service: "get_epg_data",
        service_data: {
          entity_id: this._config.entity,
          time_window: this._config.time_window,
          date: this._config.date
        },
        return_response: true
      });

      this._debug('Serviceaufruf erfolgreich:', response);

      this._epgData = response.response?.epg_data || [];
      this._debug('EPG-Daten verarbeitet:', {
        anzahlKanäle: this._epgData.length,
        beispielKanal: this._epgData[0],
        beispielSendungen: this._epgData[0]?.epg
      });
    } catch (error) {
      console.error('Fehler beim Laden der EPG-Daten:', error);
      this._epgData = [];
    }
    this._loading = false;
  }

  async _loadEpgDataNew() {
   console.debug('_loadEpgDataNew direkt');
   this._debug('_loadEpgDataNew indirekt');
    if (!this._dataProvider || !this._config.entity) {
      this._debug('_loadEpgDataNew: Übersprungen - dataProvider oder entity fehlt', {
        dataProvider: !!this._dataProvider,
        entity: this._config.entity
      });
      return;
    }

    this._loading = true;
    this._debug('Starte Datenabfrage');

    try {
      this._debug('Neuer Serviceaufruf wird gestartet:', {
        entity: this._config.entity,
        time_window: this._config.time_window,
        date: this._config.date
      });

      const newData = await this._dataProvider.fetchEpgData(
        this._config.entity,
        this._config.time_window,
        this._config.date
      );

      this._debug('Neue EPG-Daten empfangen, aktualisiere _epgData');
      this._epgData = newData;
      this._debug('_epgData aktualisiert:', {
        anzahlKanäle: this._epgData.length,
        beispielKanal: this._epgData[0],
        beispielSendungen: this._epgData[0]?.epg
      });

      // Explizit Rendering triggern
      this.requestUpdate('_epgData');
      this._debug('requestUpdate für _epgData aufgerufen');
    } catch (error) {
      console.error('Fehler beim Laden der EPG-Daten (neu):', error);
      this._epgData = [];
    } finally {
      this._loading = false;
    }
  }

  _formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }

  _formatDuration(start, stop) {
    if (!start || !stop) return '';
    const duration = (stop - start) / 60;
    return `${duration} min`;
  }

  render() {
    this._debug('CardImpl render wird aufgerufen');
    if (!this._hass) {
      this._debug('CardImpl render: Kein hass');
      return html`<div>Loading...</div>`;
    }

    this._debug('CardImpl render mit config und epgData:', {
      config: this._config,
      epgDataLength: this._epgData?.length,
      loading: this._loading
    });

    if (this._loading) {
      return html`<div>Lade EPG-Daten...</div>`;
    }

    if (this._error) {
      return html`<div class="error">${this._error}</div>`;
    }

    const tableView = new TableView(this._config, this._epgData);

    return html`
      <div class="card-content">
        <div class="header">
          <div class="title">${this._config.entity}</div>
        </div>
        ${tableView.render()}
        <div class="version">Version: ${this.version}</div>
      </div>
    `;
  }

  static styles = css`
    .card-content {
      padding: 16px;
    }
    .header {
      margin-bottom: 16px;
    }
    .title {
      font-size: 16px;
      font-weight: 500;
    }
    .epg-content {
      min-height: 200px;
    }
    .loading {
      text-align: center;
      padding: 20px;
      color: var(--secondary-text-color);
    }
    .no-data {
      text-align: center;
      padding: 20px;
      color: var(--secondary-text-color);
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid var(--divider-color);
    }
    th {
      font-weight: 500;
      color: var(--primary-text-color);
    }
    td {
      color: var(--secondary-text-color);
    }
    .version {
      font-size: 10px;
      color: var(--secondary-text-color);
      text-align: right;
      margin-top: 8px;
    }
  `;
}