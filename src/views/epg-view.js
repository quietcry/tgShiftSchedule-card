import { html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { ViewBase } from './view-base.js';
import { EPGViewBase } from '../lib/epgElements/epg-view-base.js';
import { EPGTimebar } from '../lib/epgElements/epg-timebar.js';
import { EPGChannelList } from '../lib/epgElements/epg-channel-list.js';
import { EPGProgramList } from '../lib/epgElements/epg-program-list.js';
import { EpgBox } from '../lib/epgElements/epg-box.js';
import { DataProvider } from '../data-provider.js';

export class EPGView extends ViewBase {
  static properties = {
    ...ViewBase.properties,
    _currentTime: { type: Number },
    _timeWindow: { type: String },
    _selectedChannel: { type: String },
    _isDataReady: { type: Boolean },
    _processedChannels: { type: Array },
    _lastUpdate: { type: String },
    _epgData: { type: Object },
    _dataProvider: { type: Object },
    _dataLoaded: { type: Boolean },
    _pendingConfig: { type: Object },
  };

  static get styles() {
    return css`
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }

      .gridcontainer {
        display: grid;
        grid-template-columns: auto 1fr;
        grid-template-rows: auto 1fr;
        grid-template-areas:
          'superbutton timeBar'
          'scrollBox scrollBox';
        width: 100%;
        height: 100%;
        overflow: hidden;
      }

      .superbutton {
        grid-area: superbutton;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 8px;
        background-color: var(--primary-background-color);
        border-right: 1px solid var(--divider-color);
      }

      .timeBar {
        grid-area: timeBar;
        display: flex;
        align-items: center;
        padding: 8px;
        background-color: var(--primary-background-color);
        border-bottom: 1px solid var(--divider-color);
      }

      epg-box {
        grid-area: scrollBox;
        width: 100%;
        height: 100%;
      }

      .timeSlot {
        padding: 4px 8px;
        border-right: 1px solid var(--divider-color);
        min-width: 60px;
        text-align: center;
      }

      .timeSlot.current {
        background-color: var(--accent-color);
        color: var(--text-primary-color);
      }

      .channelRow {
        padding: 8px;
        border-bottom: 1px solid var(--divider-color);
        cursor: pointer;
      }

      .channelRow.selected {
        background-color: var(--accent-color);
        color: var(--text-primary-color);
      }

      .programSlot {
        padding: 8px;
        border: 1px solid var(--divider-color);
        margin: 4px;
        cursor: pointer;
        min-width: 100px;
      }

      .programSlot.current {
        background-color: var(--accent-color);
        color: var(--text-primary-color);
      }

      .programTitle {
        font-weight: bold;
        margin-bottom: 4px;
      }

      .programTime {
        font-size: 0.8em;
        color: var(--secondary-text-color);
      }
    `;
  }

  constructor() {
    super();
    this._debug('filterx: EPGView-Konstruktor: Start');
    this._dataProvider = new DataProvider();
    this._debug('filterx: EPGView-Konstruktor: DataProvider initialisiert');
    this._epgData = { channels: [] };
    this._pendingConfig = null;
    this._debug('filterx: EPGView-Konstruktor: Initialisierung abgeschlossen');
    this._currentTime = Math.floor(Date.now() / 1000);
    this._timeWindow = 'C';
    this._selectedChannel = null;
    this._isDataReady = false;
    this._processedChannels = [];
    this._lastUpdate = null;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  set hass(value) {
    this._debug('filterx: EPGView set hass wird aufgerufen');
    if (this._hass !== value) {
      const oldState = this._hass?.states[this.config.entity];
      const newState = value?.states[this.config.entity];
      const oldLastUpdate = oldState?.attributes?.last_update;
      const newLastUpdate = newState?.attributes?.last_update;

      this._hass = value;
      if (this._dataProvider) {
        this._dataProvider.hass = value;
        this._debug('filterx: EPGView set hass: DataProvider hass aktualisiert');
      }

      // Nur wenn sich last_update ändert oder hass zum ersten Mal gesetzt wird
      if (newLastUpdate !== this._lastUpdate || !this._hass) {
        if (this._hass && this.config.entity) {
          if (newLastUpdate !== this._lastUpdate) {
            this._debug('filterx: EPGView: last_update hat sich geändert, starte Update', {
              old: this._lastUpdate,
              new: newLastUpdate,
            });
            this._lastUpdate = newLastUpdate;
            this._loadData();
          }
        }
      } else {
        this._debug('filterx: EPGView: last_update unverändert, überspringe Update und Rendering', {
          lastUpdate: this._lastUpdate,
        });
      }
    }
  }

  get hass() {
    return this._hass;
  }

  async _fetchViewData(config) {
    this._debug('EPG-View: _fetchViewData gestartet', {
      entity: config.entity,
      hasDataProvider: !!this._dataProvider
    });

    if (!this._dataProvider) {
      throw new Error('DataProvider nicht initialisiert');
    }

    // Hole die EPG-Box
    const epgBox = this.shadowRoot?.querySelector('epg-box');
    if (!epgBox) {
      this._debug('EPG-View: EPG-Box nicht gefunden');
      return [];
    }

    this._debug('EPG-View: Starte EPG-Daten Abruf', {
      hasEpgBox: !!epgBox
    });

    return this._dataProvider.fetchEpgData(
      config.entity,
      undefined, // Kein time_window
      undefined, // Kein date
      config,
      // Callback für EPG-Daten
      (data) => {
        this._debug('EPG-View: Neue EPG-Daten empfangen', {
          kanal: data.channel.name,
          anzahlProgramme: data.programs.length
        });

        // Erstelle ein vollständiges Teil-EPG
        const teilEpg = {
          channel: data.channel,
          programs: data.programs
        };

        // Übergebe das Teil-EPG an die EPG-Box
        epgBox.addTeilEpg(teilEpg);
        this._debug('EPG-View: Teil-EPG an Box übergeben');
      }
    );
  }

  _onEpgBoxReady() {
    this._debug('EPG-View: EPG-Box ist bereit');
    if (this._pendingConfig) {
      this._debug('EPG-View: Starte Datenabruf');
      this._fetchViewData(this._pendingConfig);
      this._pendingConfig = null;
    }
  }

  firstUpdated() {
    super.firstUpdated();
    this._debug('EPG-View: firstUpdated - Prüfe auf ausstehende Konfiguration');

    // Prüfe, ob die EPG-Box bereits verfügbar ist
    const epgBox = this.shadowRoot?.querySelector('epg-box');
    this._debug('EPG-View: firstUpdated - EPG-Box Status', {
      hasShadowRoot: !!this.shadowRoot,
      hasEpgBox: !!epgBox,
      pendingConfig: !!this._pendingConfig
    });

    // Wenn die EPG-Box bereits verfügbar ist und wir eine ausstehende Konfiguration haben
    if (epgBox && this._pendingConfig) {
      this._debug('EPG-View: EPG-Box bereits verfügbar, starte Datenabruf');
      this._fetchViewData(this._pendingConfig);
      this._pendingConfig = null;
    }
  }

  _processChannelData(channel, epgData) {
    this._debug('Verarbeite Kanal-Daten:', {
      channel,
      epgData,
      response: epgData?.response,
      epg_data: epgData?.response?.epg_data,
    });

    // Extrahiere die EPG-Daten aus der Service-Antwort
    const epgResponse = epgData?.response || [];

    if (!Array.isArray(epgResponse) || epgResponse.length === 0) {
      this._debug('Keine EPG-Daten für Kanal:', channel.name, {
        epgData,
        response: epgData?.response,
      });
      return {
        ...channel,
        programs: [],
      };
    }

    // Verarbeite die EPG-Daten
    const programs = epgResponse.map(program => ({
      title: program.title || '',
      description: program.description || '',
      start: program.start || '',
      end: program.end || '',
      duration: program.duration || 0,
    }));

    this._debug('Verarbeitete Programme für Kanal:', channel.name, {
      programs,
      epgResponse,
    });

    return {
      ...channel,
      programs,
    };
  }

  _getPrioritizedChannels(channels) {
    if (!this.config.group_order?.length) return channels;

    const prioritizedChannels = [];
    const remainingChannels = new Set(channels.map(c => c.id));

    // Extrahiere Kanäle aus group_order in der angegebenen Reihenfolge
    this.config.group_order.forEach(group => {
      if (group.channels) {
        group.channels.forEach(channelConfig => {
          const regex = new RegExp(channelConfig.name);
          const matchingChannels = channels.filter(
            c => regex.test(c.name) && remainingChannels.has(c.id)
          );

          matchingChannels.forEach(channel => {
            prioritizedChannels.push(channel);
            remainingChannels.delete(channel.id);
          });
        });
      }
    });

    // Füge die übrigen Kanäle hinzu
    channels.forEach(channel => {
      if (remainingChannels.has(channel.id)) {
        prioritizedChannels.push(channel);
      }
    });

    return prioritizedChannels;
  }

  render() {
    return html`
      <div class="gridcontainer">
        <div class="superbutton">${this._renderSuperButton()}</div>
        <div class="timeBar">${this._renderTimeBar()}</div>
        <epg-box
          class="epgBox"
          .epgData=${this._epgData}
          .currentTime=${this._currentTime}
          .timeWindow=${this.config.time_window}
          .showChannel=${this.config.show_channel}
          .showTime=${this.config.show_time}
          .showDuration=${this.config.show_duration}
          .showTitle=${this.config.show_title}
          .showDescription=${this.config.show_description}
          .selectedChannel=${this._selectedChannel}
          .channelOrder=${this.config.group_order || []}
          @channel-selected=${this._onChannelSelected}
          @program-selected=${this._onProgramSelected}
          @epg-box-ready=${this._onEpgBoxReady}
        ></epg-box>
      </div>
    `;
  }

  _renderSuperButton() {
    return html`
      <button @click=${this._handleRefresh}>
        <ha-icon icon="mdi:refresh"></ha-icon>
      </button>
    `;
  }

  _renderTimeBar() {
    const timeSlots = this._generateTimeSlots();
    return html`
      ${timeSlots.map(
        slot => html`
          <div
            class="timeSlot ${this._isCurrentTimeSlot(slot, this._currentTime) ? 'current' : ''}"
          >
            ${this._formatTime(slot)}
          </div>
        `
      )}
    `;
  }

  _generateTimeSlots() {
    const slots = [];
    const now = new Date();
    const startTime = new Date(now);
    startTime.setHours(0, 0, 0, 0);

    for (let i = 0; i < 24; i++) {
      const slot = new Date(startTime);
      slot.setHours(i);
      slots.push(slot);
    }

    return slots;
  }

  _formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  _isCurrentTimeSlot(slot, currentTime) {
    const slotTime = slot.getTime() / 1000;
    return Math.abs(slotTime - currentTime) < 1800; // 30 Minuten
  }

  _onChannelSelected(e) {
    this._selectedChannel = e.detail.channel;
    this.requestUpdate();
  }

  _onProgramSelected(e) {
    // Hier können Sie die Logik für die Programmauswahl implementieren
  }

  _handleRefresh() {
    this._loadData();
  }

  async _loadData() {
    this._debug('EPG-View: _loadData wird aufgerufen');
    if (!this._dataProvider || !this.config.entity) {
      this._debug('EPG-View: _loadData: Übersprungen - dataProvider oder entity fehlt', {
        dataProvider: !!this._dataProvider,
        entity: this.config.entity,
      });
      return;
    }

    // Speichere die Konfiguration für späteren Abruf
    this._pendingConfig = this.config;
    this._debug('EPG-View: Konfiguration gespeichert für EPG-Box Bereitschaft');
  }
}

customElements.define('epg-view', EPGView);