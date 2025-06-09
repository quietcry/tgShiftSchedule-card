import { html, css } from 'lit';
import { ViewBase } from './view-base';
import { CardName, DebugMode } from '../card-config';
import { EPGViewBase } from '../lib/epgElements/epg-view-base';
import { EPGTimebar } from '../lib/epgElements/epg-timebar';
import { EPGChannelList } from '../lib/epgElements/epg-channel-list';
import { EPGProgramList } from '../lib/epgElements/epg-program-list';
import { DataProvider } from '../data-provider';

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
  };

  static get styles() {
    return css``;
  }

  constructor() {
    super();
    this._currentTime = Math.floor(Date.now() / 1000);
    this._timeWindow = 'C';
    this._selectedChannel = null;
    this._isDataReady = false;
    this._filteredChannels = [];
    this._processedChannels = [];
    this._lastUpdate = null;
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
            this.requestUpdate(); // Explizites Rendering nur bei Änderung
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

  async _fetchViewData() {
    try {
      this._debug('EPGView _fetchViewData wird aufgerufen');

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

      // Filtere und sortiere Kanäle
      const filteredChannels = await this._filterAndSortChannels(channels);
      this._debug('Gefilterte Kanäle:', filteredChannels);

      // Hole EPG-Daten für jeden Kanal einzeln
      const epgData = await Promise.all(
        filteredChannels.map(async channel => {
          const channelEpg = await this._dataProvider.fetchChannelEpg(
            this.config.entity,
            channel.id
          );
          return {
            ...channel,
            epg: channelEpg.response || [],
          };
        })
      );

      this._debug('EPG-Daten:', epgData);

      return {
        channels: filteredChannels,
        epgData: epgData,
      };
    } catch (error) {
      this._debug('Fehler beim Laden der Daten:', error);
      throw error;
    }
  }

  async _filterAndSortChannels(channels) {
    // RegEx-Listen aus Konfiguration parsen
    const blacklist = this._parseRegexList(this.config.blacklist);
    const whitelist = this._parseRegexList(this.config.whitelist);
    const importantlist = this._parseRegexList(this.config.importantlist);

    // Filtern
    let filtered = channels.filter(channel => {
      // Blacklist prüfen
      if (blacklist.some(regex => regex.test(channel.name))) {
        return false;
      }

      // Whitelist prüfen (wenn nicht leer)
      if (whitelist.length > 0) {
        return whitelist.some(regex => regex.test(channel.name));
      }

      return true;
    });

    // Sortieren nach Importantlist
    if (importantlist.length > 0) {
      filtered.sort((a, b) => {
        const aImportant = importantlist.some(regex => regex.test(a.name));
        const bImportant = importantlist.some(regex => regex.test(b.name));

        if (aImportant && !bImportant) return -1;
        if (!aImportant && bImportant) return 1;
        return 0;
      });
    }

    return filtered;
  }

  _parseRegexList(listString) {
    if (!listString) return [];
    return listString
      .split(',')
      .map(item => item.trim())
      .filter(item => item)
      .map(item => new RegExp(item, 'i'));
  }

  _processChannelData(channel, epgData) {
    return {
      id: channel.id,
      name: channel.name,
      logo: channel.logo,
      programs: epgData.programs || [],
    };
  }

  _prepareData(data) {
    if (!data || !data.length) return;

    // Ersten Kanal als ausgewählt setzen
    this._selectedChannel = data[0]?.id;
    this._isDataReady = true;

    this._debug('EPGView _prepareData: Daten aufbereitet', {
      selectedChannel: this._selectedChannel,
      channelCount: data.length,
      processedChannels: data.map(c => c.name),
    });
  }

  _renderContent() {
    // Leeres EPG mit Platzhaltern rendern
    return html`
      <epg-view-base>
        <epg-timebar
          slot="timebar"
          .startTime=${this._currentTime}
          .endTime=${this._currentTime + 7200}
          .currentTime=${this._currentTime}
        ></epg-timebar>
        <epg-channel-list
          slot="channels"
          .channels=${this._isDataReady ? this.epgData : this._getPlaceholderChannels()}
          .selectedChannel=${this._selectedChannel}
          @channel-selected=${this._onChannelSelected}
        ></epg-channel-list>
        <epg-program-list
          slot="programs"
          .programs=${this._isDataReady ? this._getSelectedChannelPrograms() : []}
          .currentTime=${this._currentTime}
          .startTime=${this._currentTime}
          .endTime=${this._currentTime + 7200}
          @program-selected=${this._onProgramSelected}
        ></epg-program-list>
      </epg-view-base>
    `;
  }

  _getPlaceholderChannels() {
    // Platzhalter für Kanäle während des Ladens
    return Array(5)
      .fill()
      .map((_, index) => ({
        id: `placeholder-${index}`,
        name: 'Lade Kanal...',
        epg: [],
      }));
  }

  _getSelectedChannelPrograms() {
    if (!this._isDataReady || !this._selectedChannel) return [];
    const channel = this.epgData.find(c => c.id === this._selectedChannel);
    return channel?.epg || [];
  }

  _onChannelSelected(e) {
    this._selectedChannel = e.detail.channel.id;
    this.requestUpdate();
  }

  _onProgramSelected(e) {
    // Programm-Auswahl-Handler
    this._debug('EPGView _onProgramSelected:', e.detail.program);
  }

  _renderLoading() {
    return html`
      <div class="epg-loading">
        <div class="loading-spinner"></div>
        <div class="loading-text">Lade EPG-Daten...</div>
      </div>
    `;
  }

  _renderError() {
    return html`
      <div class="epg-error">
        <div class="error-icon">⚠️</div>
        <div class="error-text">${this._error}</div>
      </div>
    `;
  }
}

customElements.define('epg-view', EPGView);
