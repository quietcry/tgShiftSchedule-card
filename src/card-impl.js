import { html, css, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { CardBase } from './card-base';
import { DataProvider } from './data-provider';
import { TableView } from './views/table-view';
import { EPGView } from './views/epg-view';
import { CardName, CardVersion, DebugMode, CardRegname } from './card-config';

if (DebugMode) console.debug(`[${CardName}] CardImpl-Modul wird geladen`);

export class CardImpl extends CardBase {
  static get properties() {
    if (DebugMode)
      console.debug(`[${CardName}] [CardImpl] CardImpl static properties wird aufgerufen`);
    return {
      _config: { type: Object },
      _hass: { type: Object },
      _loading: { type: Boolean },
      _error: { type: String },
      _epgData: { type: Array, reflect: true },
      _dataProvider: { type: Object },
      _currentView: { type: Object },
      _selectedTab: { type: Number },
    };
  }

  static getConfigElement() {
    if (DebugMode)
      console.debug(`[${CardName}] [CardImpl] CardImpl static getConfigElement wird aufgerufen`);
    return document.createElement(`${CardRegname}-editor`);
  }

  static getStubConfig() {
    if (DebugMode)
      console.debug(`[${CardName}] [CardImpl] CardImpl static getStubConfig wird aufgerufen`);
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
    };
  }

  constructor() {
    super();
    this._loading = false;
    this._error = null;
    this._epgData = [];
    this._dataProvider = null;
    this._selectedTab = 0;
    this._currentView = null;
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
    super.setConfig(config);

    // Normalisiere den view_mode
    if (this.config.view_mode === 'Liste') {
      this.config.view_mode = 'table';
    }

    // Initialisiere die View basierend auf der Konfiguration
    if (this.config.view_mode === 'epg') {
      this._debug('CardImpl setConfig: Initialisiere EPG-View');
      this._currentView = new EPGView();
      this._currentView.config = this.config;
      this._currentView.epgData = this._epgData;
    } else {
      this._debug('CardImpl setConfig: Initialisiere Table-View');
      this._currentView = new TableView();
      this._currentView.config = this.config;
      this._currentView.epgData = this._epgData;
    }

    this._debug('CardImpl setConfig: View initialisiert:', {
      viewMode: this.config.view_mode,
      viewType: this._currentView.constructor.name,
    });
  }

  async firstUpdated() {
    this._debug('CardImpl firstUpdated wird aufgerufen');
    await super.firstUpdated();
    this._debug('CardImpl firstUpdated abgeschlossen');
    if (this.config.entity) {
      this._debug('CardImpl firstUpdated: Starte _loadEpgDataNew');
      this._loadEpgDataNew();
    } else {
      this._debug('CardImpl firstUpdated: Keine Entity in Config');
    }
  }

  async _loadEpgDataNew() {
    this._debug('_loadEpgDataNew wird aufgerufen');
    if (!this._dataProvider || !this.config.entity) {
      this._debug('_loadEpgDataNew: Übersprungen - dataProvider oder entity fehlt', {
        dataProvider: !!this._dataProvider,
        entity: this.config.entity,
      });
      return;
    }

    this._loading = true;
    this._debug('Starte Datenabfrage');

    try {
      this._debug('Neuer Serviceaufruf wird gestartet:', {
        entity: this.config.entity,
        time_window: this.config.time_window,
        date: this.config.date,
      });

      const newData = await this._dataProvider.fetchEpgData(
        this.config.entity,
        this.config.time_window,
        this.config.date
      );

      this._debug('Neue EPG-Daten empfangen, aktualisiere _epgData');
      this._epgData = newData;
      this._debug('_epgData aktualisiert:', {
        anzahlKanäle: this._epgData.length,
        beispielKanal: this._epgData[0],
        beispielSendungen: this._epgData[0]?.epg,
      });

      // View basierend auf Konfiguration auswählen
      switch (this.config.view_mode) {
        case 'table':
          this._debug('TableView wird verwendet');
          this._currentView = new TableView(this.config, this._epgData);
          break;
        case 'epg':
          this._debug('EPGView wird verwendet');
          this._currentView = new EPGView(this.config, this._epgData);
          break;
        default:
          this._debug('Standardmäßig TableView wird verwendet');
          this._currentView = new TableView(this.config, this._epgData);
      }

      // Explizit Rendering triggern
      this.requestUpdate('_epgData');
      this._debug('requestUpdate für _epgData aufgerufen');
    } catch (error) {
      console.error('[CardImpl] Fehler beim Laden der EPG-Daten (neu):', error);
      this._epgData = [];
    } finally {
      this._loading = false;
    }
  }

  async _fetchData() {
    if (this._loading) return;

    this._loading = true;
    this._error = null;

    try {
      this._debug('CardImpl _fetchData: Starte Datenabruf');
      const data = await this._dataProvider.fetchData();
      this._debug('CardImpl _fetchData: Daten empfangen:', data);

      if (data && Array.isArray(data)) {
        this._epgData = data;
        // Aktualisiere die View mit den neuen Daten
        if (this._currentView) {
          this._currentView.epgData = this._epgData;
        }
      } else {
        this._error = 'Ungültiges Datenformat';
      }
    } catch (error) {
      this._error = `Fehler beim Laden der Daten: ${error.message}`;
      this._debug('CardImpl _fetchData: Fehler:', error);
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
    if (!this.hass) {
      this._debug('CardImpl render: Kein hass');
      return html`<div>Loading...</div>`;
    }

    this._debug('CardImpl render mit config:', this.config);
    return super.render(html`
      <div class="card-content">
        ${this._selectedTab === 0
          ? html` <div class="list-view">${this._currentView.render()}</div> `
          : ''}
        ${this._selectedTab === 1
          ? html` <div class="epg-view">${this._currentView.render()}</div> `
          : ''}
        ${this._selectedTab === 2
          ? html`
              <div class="active-view">
                <!-- Aktiv View -->
              </div>
            `
          : ''}
      </div>
    `);
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
    th,
    td {
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
      margin-right: 8px;
    }
    .tabs {
      display: flex;
      margin-bottom: 16px;
      border-bottom: 1px solid var(--divider-color);
    }
    .tab-button {
      padding: 8px 16px;
      border: none;
      background: none;
      cursor: pointer;
      color: var(--primary-text-color);
      opacity: 0.7;
    }
    .tab-button.active {
      opacity: 1;
      border-bottom: 2px solid var(--primary-color);
    }
    .tab-content {
      min-height: 200px;
    }
  `;

  static getDefaultConfig() {
    if (DebugMode)
      console.debug(`[${CardName}] [CardImpl] CardImpl static getDefaultConfig wird aufgerufen`);
    return {
      entity: 'sensor.vdr_vdr_epg_info',
      time_window: 'C',
      date: '',
      view_mode: 'epg', // Standardmäßig EPG-View
      max_items: 10,
      show_channel: true,
      show_time: true,
      show_duration: true,
      show_title: true,
      show_description: true,
    };
  }

  _debug(message, ...args) {
    if (DebugMode) {
      console.debug(`[${CardName}] [CardImpl] ${message}`, ...args);
    }
  }

  _updateView() {
    this._debug('CardImpl _updateView: Aktualisiere View mit neuen Daten');

    if (this._currentView) {
      this._currentView.epgData = this._epgData;
      this._debug('CardImpl _updateView: View aktualisiert', {
        viewMode: this.config.view_mode,
        viewType: this._currentView.constructor.name,
        dataCount: this._epgData.length,
      });
    } else {
      this._debug('CardImpl _updateView: Keine View vorhanden');
    }
  }

  _onEpgDataReceived(data) {
    this._debug('CardImpl _onEpgDataReceived: Neue EPG-Daten empfangen, aktualisiere _epgData');
    this._epgData = data;
    this._debug('CardImpl _onEpgDataReceived: _epgData aktualisiert:', this._epgData);
    this.requestUpdate('_epgData');
    this._updateView();
  }
}
