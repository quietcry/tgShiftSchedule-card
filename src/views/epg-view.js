import { html, css } from 'lit';
import { ViewBase } from './view-base';
import { CardName, DebugMode } from '../card-config';
import { EPGViewBase } from '../lib/epgElements/epg-view-base';
import { EPGTimebar } from '../lib/epgElements/epg-timebar';
import { EPGChannelList } from '../lib/epgElements/epg-channel-list';
import { EPGProgramList } from '../lib/epgElements/epg-program-list';
import { DataProvider } from '../data-provider';
import { EpgBox } from '../lib/epgElements/epg-box.js';

export class EPGView extends ViewBase {
  static properties = {
    ...ViewBase.properties,
    _currentTime: { type: Number },
    _timeWindow: { type: String },
    _selectedChannel: { type: String },
    _isDataReady: { type: Boolean },
    _filteredChannels: { type: Array },
    _processedChannels: { type: Array },
    _lastUpdate: { type: String },
    _epgData: { type: Object },
  };

  static styles = css`
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

  constructor() {
    super();
    this._currentTime = Math.floor(Date.now() / 1000);
    this._timeWindow = 'C';
    this._selectedChannel = null;
    this._isDataReady = false;
    this._filteredChannels = [];
    this._processedChannels = [];
    this._lastUpdate = null;
    this._epgData = { channels: [] };
  }

  set hass(value) {
    if (this._hass !== value) {
      const oldState = this._hass?.states[this.config.entity];
      const newState = value?.states[this.config.entity];
      const oldLastUpdate = oldState?.attributes?.last_update;
      const newLastUpdate = newState?.attributes?.last_update;

      // Nur wenn sich last_update ändert oder hass zum ersten Mal gesetzt wird
      if (newLastUpdate !== this._lastUpdate || !this._hass) {
        if (!this._dataProvider) {
          this._debug('EPGView: Initialisiere neuen DataProvider');
          this._dataProvider = new DataProvider();
        }
        this._hass = value;
        this._dataProvider.hass = value;

        if (this._hass && this.config.entity) {
          if (newLastUpdate !== this._lastUpdate) {
            this._debug('EPGView: last_update hat sich geändert, starte Update', {
              old: this._lastUpdate,
              new: newLastUpdate,
            });
            this._lastUpdate = newLastUpdate;
            this._loadData();
          }
        }
      } else {
        // Nur hass aktualisieren ohne Update und Rendering
        this._hass = value;
        if (this._dataProvider) {
          this._dataProvider.hass = value;
        }
        this._debug('EPGView: last_update unverändert, überspringe Update und Rendering', {
          lastUpdate: this._lastUpdate,
        });
      }
    }
  }

  async _filterChannels(channels) {
    this._debug('Filtere und sortiere Kanäle:', channels);

    if (!Array.isArray(channels)) {
      this._debug('Keine Kanäle zum Filtern vorhanden');
      return [];
    }

    // Filtere nach black/white Liste
    let filteredChannels = channels;
    if (this.config.channel_blacklist && this.config.channel_blacklist.length > 0) {
      filteredChannels = channels.filter(
        channel => !this.config.channel_blacklist.includes(channel.name)
      );
    }
    if (this.config.channel_whitelist && this.config.channel_whitelist.length > 0) {
      filteredChannels = channels.filter(channel =>
        this.config.channel_whitelist.includes(channel.name)
      );
    }

    this._debug('Gefilterte und sortierte Kanäle:', filteredChannels);
    return filteredChannels;
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

  async _fetchViewData() {
    try {
      this._debug('EPGView _fetchViewData wird aufgerufen');
      this._isDataReady = false;

      // Hole Kanal-Liste
      const channelResponse = await this._dataProvider.fetchChannelList(this.config.entity);
      this._debug('Rohdaten der Kanal-Liste:', channelResponse);

      if (!channelResponse || !channelResponse.response) {
        this._debug('Keine Kanal-Daten erhalten');
        throw new Error('Keine Kanal-Daten erhalten');
      }

      // Extrahiere die Kanäle aus der Antwort
      const channels = Array.isArray(channelResponse.response.epg_data)
        ? channelResponse.response.epg_data
        : [];

      this._debug('Verarbeitete Kanal-Liste:', channels);

      if (!Array.isArray(channels)) {
        this._debug('Kanal-Liste ist kein Array:', channels);
        throw new Error('Ungültiges Kanal-Liste Format');
      }

      // Filtere Kanäle nach black/white Liste
      const filteredChannels = await this._filterChannels(channels);
      this._debug('Gefilterte Kanäle:', filteredChannels);

      // Generiere eine flache Liste der Kanäle aus group_order für die Priorisierung
      const prioritizedChannels = this._getPrioritizedChannels(filteredChannels);
      this._debug('Priorisierte Kanäle:', prioritizedChannels);

      // Setze initiale Daten
      this._epgData = { channels: [] };
      this._isDataReady = true;
      this.requestUpdate();

      // Hole EPG-Daten für jeden Kanal sequentiell
      for (const channel of prioritizedChannels) {
        try {
          const response = await this._dataProvider.fetchChannelEpg(this.config.entity, channel.id);
          const processedChannel = this._processChannelData(channel, response.response || []);
          // Übergebe jeden Kanal einzeln an epg-box
          this._epgData = { channel: processedChannel };
          this.requestUpdate();
        } catch (error) {
          this._debug(`Fehler beim Laden des EPG für ${channel.name}:`, error);
        }
      }
    } catch (error) {
      this._debug('Fehler beim Laden der EPG-Daten:', error);
      this._isDataReady = false;
      throw error;
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
}

customElements.define('epg-view', EPGView);
