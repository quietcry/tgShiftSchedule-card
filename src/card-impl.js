import { html, css, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { CardBase } from './card-base';
const { DebugMode } = require('./card-config');

export class CardImpl extends CardBase {
  static properties = {
    ...CardBase.properties,
    _epgData: { type: Array },
    _loading: { type: Boolean }
  };

  constructor() {
    super();
    if (DebugMode) console.debug(`[${this.constructor.cardName}] CardImpl-Konstruktor wird aufgerufen`);
    this._config = {
      entity: '',
      time_window: 'C',
      date: '',
      max_items: 10,
      show_channel: true,
      show_time: true,
      show_duration: true,
      show_title: true,
      show_description: true
    };
    this._epgData = [];
    this._loading = false;
  }

  static getConfigElement() {
    return document.createElement('tgepg-card-editor');
  }

  async firstUpdated() {
    await super.firstUpdated();
    if (DebugMode) console.debug(`[${this.constructor.cardName}] firstUpdated: Starte _loadEpgData`);
    this._loadEpgData();
  }

  setConfig(config) {
    if (!config) {
      throw new Error('Keine Konfiguration vorhanden');
    }
    if (DebugMode) console.debug(`[${this.constructor.cardName}] setConfig: Starte _loadEpgData`);
    this._config = { ...this._config, ...config };
    this._loadEpgData();
  }

  async _loadEpgData() {
    if (!this.hass || !this._config.entity) {
      if (DebugMode) console.debug(`[${this.constructor.cardName}] _loadEpgData: Übersprungen - hass oder entity fehlt`, {
        hass: !!this.hass,
        entity: this._config.entity
      });
      return;
    }

    this._loading = true;
    try {
      if (DebugMode) console.debug(`[${this.constructor.cardName}] Serviceaufruf wird gestartet:`, {
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

      if (DebugMode) console.debug(`[${this.constructor.cardName}] Serviceaufruf erfolgreich:`, response);

      this._epgData = response.response?.epg_data || [];
      if (DebugMode) console.debug(`[${this.constructor.cardName}] EPG-Daten verarbeitet:`, {
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

  _formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }

  _formatDuration(start, stop) {
    const duration = (stop - start) / 60; // in Minuten
    const hours = Math.floor(duration / 60);
    const minutes = Math.floor(duration % 60);
    return `${hours > 0 ? hours + 'h ' : ''}${minutes}min`;
  }

  render() {

    return super.render(html`
 
 
          ${this._config.show_header ? html`
            <div class="header">
              <div class="title">EPG Anzeige</div>
            </div>
          ` : ''}
          
          ${this._loading ? html`
            <div class="loading">Lade EPG-Daten...</div>
          ` : html`
            <div class="epg-content">
              ${this._epgData.length === 0 ? html`
                <div class="no-data">Keine EPG-Daten verfügbar</div>
              ` : html`
                <table>
                  <thead>
                    <tr>
                      ${this._config.show_channel ? html`<th>Kanal</th>` : ''}
                      ${this._config.show_time ? html`<th>Zeit</th>` : ''}
                      ${this._config.show_duration ? html`<th>Dauer</th>` : ''}
                      ${this._config.show_title ? html`<th>Titel</th>` : ''}
                      ${this._config.show_description ? html`<th>Beschreibung</th>` : ''}
                    </tr>
                  </thead>
                  <tbody>
                    ${this._epgData.slice(0, this._config.max_items).map(channel => 
                      channel.epg.map(show => html`
                        <tr>
                          ${this._config.show_channel ? html`<td>${channel.channel_name}</td>` : ''}
                          ${this._config.show_time ? html`<td>${this._formatTime(show.start)}</td>` : ''}
                          ${this._config.show_duration ? html`<td>${this._formatDuration(show.start, show.stop)}</td>` : ''}
                          ${this._config.show_title ? html`<td>${show.title}</td>` : ''}
                          ${this._config.show_description ? html`<td>${show.shorttext || ''}</td>` : ''}
                        </tr>
                      `)
                    )}
                  </tbody>
                </table>
              `}
            </div>
          `}

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