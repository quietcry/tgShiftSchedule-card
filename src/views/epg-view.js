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
    return css`
      :host {
        display: block;
        height: 100%;
        width: 100%;
        --tgepg-topBarHeight: 40px;
        --tgepg-channelRowWidth: 120px;
        --tgepg-appHeight: 100%;
        --tgepg-programHeight: 60px;
        --tgepg-timeSlotWidth: 120px;
      }

      .gridcontainer {
        display: grid;
        grid-auto-rows: 1fr;
        grid-template-columns: var(--tgepg-channelRowWidth) 1fr;
        grid-template-rows: var(--tgepg-topBarHeight) calc(100% - var(--tgepg-topBarHeight));
        gap: 0px 0px;
        grid-template-areas:
          "superbutton timeBar"
          "scrollBox scrollBox";
        width: 100%;
        height: var(--tgepg-appHeight);
        overflow: hidden;
      }

      .superbutton {
        grid-area: superbutton;
        background-color: #b3e5fc;
        padding: 5px;
      }

      .timeBar {
        grid-area: timeBar;
        background-color: #bdbdbd;
        white-space: nowrap;
        overflow-x: auto;
        height: var(--tgepg-topBarHeight);
        padding: 5px;
        display: flex;
      }

      .timeSlot {
        min-width: var(--tgepg-timeSlotWidth);
        text-align: center;
        padding: 5px;
        border-right: 1px solid #9e9e9e;
      }

      .timeSlot.current {
        background-color: #81c784;
        color: white;
      }

      .scrollBox {
        grid-area: scrollBox;
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background-color: #f5f5f5;
      }

      [name="epgOutBox"] {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }

      [name="epgBox"] {
        display: grid;
        grid-auto-rows: 1fr;
        grid-template-columns: var(--tgepg-channelRowWidth) 1fr;
        grid-template-rows: minmax(min-content, max-content);
        gap: 0px 0px;
        grid-template-areas:
          "channelBox programBox";
        width: 100%;
        height: 100%;
        grid-auto-flow: dense;
        overflow-x: auto;
        overflow-y: auto;
      }

      [name="channelBox"] {
        grid-area: channelBox;
        background-color: #e3f2fd;
        padding: 5px;
      }

      .channelRow {
        height: var(--tgepg-programHeight);
        display: flex;
        align-items: center;
        padding: 5px;
        border-bottom: 1px solid #bbdefb;
      }

      [name="programBox"] {
        grid-area: programBox;
        background-color: #e8f5e9;
        padding: 5px;
        position: relative;
      }

      .programRow {
        height: var(--tgepg-programHeight);
        display: flex;
        position: relative;
        border-bottom: 1px solid #c8e6c9;
      }

      .programSlot {
        height: 100%;
        padding: 5px;
        border-right: 1px solid #c8e6c9;
        overflow: hidden;
        background-color: #f1f8e9;
      }

      .programSlot.current {
        background-color: #81c784;
        color: white;
      }

      .programTitle {
        font-weight: bold;
        margin-bottom: 4px;
      }

      .programTime {
        font-size: 0.8em;
        opacity: 0.8;
      }
    `;
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

      // Filtere und sortiere Kanäle
      const filteredChannels = await this._filterAndSortChannels(channels);
      this._debug('Gefilterte Kanäle:', filteredChannels);

      // Hole EPG-Daten für jeden Kanal parallel
      const epgPromises = filteredChannels.map(channel =>
        this._dataProvider.fetchChannelEpg(this.config.entity, channel.id)
          .then(response => ({
            ...channel,
            epg: response.response || []
          }))
      );

      const epgData = await Promise.all(epgPromises);
      this._debug('EPG-Daten:', epgData);

      // Verarbeite die Daten
      this._filteredChannels = this._prepareData(epgData);
      this._isDataReady = true;
      this.requestUpdate();

    } catch (error) {
      this._debug('Fehler beim Laden der EPG-Daten:', error);
      this._isDataReady = false;
      throw error;
    }
  }

  async _filterAndSortChannels(channels) {
    this._debug('Filtere und sortiere Kanäle:', channels);

    // Extrahiere Listen aus der Konfiguration
    const blacklist = this._parseRegexList(this.config.blacklist || '');
    const whitelist = this._parseRegexList(this.config.whitelist || '');
    const importantlist = this._parseRegexList(this.config.importantlist || '');

    // Filtere Kanäle
    let filteredChannels = channels.filter(channel => {
      const channelName = channel.name.toLowerCase();

      // Wenn Whitelist existiert, nur diese Kanäle zulassen
      if (whitelist.length > 0) {
        return whitelist.some(regex => regex.test(channelName));
      }

      // Blacklist prüfen
      if (blacklist.length > 0) {
        return !blacklist.some(regex => regex.test(channelName));
      }

      return true;
    });

    // Sortiere Kanäle nach YAML-Konfiguration
    if (this.config.channel_sorting) {
      try {
        const sortingConfig = this._parseYamlSorting(this.config.channel_sorting);
        filteredChannels = this._sortChannelsByConfig(filteredChannels, sortingConfig);
      } catch (error) {
        this._debug('Fehler beim Parsen der YAML-Sortierung:', error);
      }
    } else {
      // Fallback: Sortiere nach Importantlist und alphabetisch
      filteredChannels.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();

        // Wichtige Kanäle zuerst
        const aImportant = importantlist.some(regex => regex.test(aName));
        const bImportant = importantlist.some(regex => regex.test(bName));

        if (aImportant && !bImportant) return -1;
        if (!aImportant && bImportant) return 1;

        // Alphabetisch sortieren
        return aName.localeCompare(bName);
      });
    }

    this._debug('Gefilterte und sortierte Kanäle:', filteredChannels);
    return filteredChannels;
  }

  _parseRegexList(listString) {
    if (!listString) return [];
    return listString
      .split(',')
      .map(item => item.trim())
      .filter(item => item)
      .map(item => new RegExp(item, 'i'));
  }

  _parseYamlSorting(yamlString) {
    // Einfache YAML-Parsing-Logik für unsere spezifische Struktur
    const lines = yamlString.split('\n');
    const result = [];
    let currentGroup = null;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      if (trimmedLine.startsWith('- ')) {
        const item = trimmedLine.substring(2).trim();
        if (currentGroup) {
          currentGroup.items.push(item);
        } else {
          result.push({ type: 'channel', name: item });
        }
      } else if (trimmedLine.endsWith(':')) {
        currentGroup = { type: 'group', name: trimmedLine.slice(0, -1).trim(), items: [] };
        result.push(currentGroup);
      } else if (trimmedLine.startsWith('  - ')) {
        if (currentGroup) {
          currentGroup.items.push(trimmedLine.substring(4).trim());
        }
      }
    }

    return result;
  }

  _sortChannelsByConfig(channels, sortingConfig) {
    const result = [];
    const remainingChannels = new Set(channels.map(c => c.name.toLowerCase()));

    // Verarbeite die Sortierungskonfiguration
    for (const item of sortingConfig) {
      if (item.type === 'group') {
        // Füge Kanäle in der angegebenen Reihenfolge hinzu
        for (const channelName of item.items) {
          const channel = channels.find(c =>
            c.name.toLowerCase() === channelName.toLowerCase()
          );
          if (channel) {
            result.push(channel);
            remainingChannels.delete(channel.name.toLowerCase());
          }
        }
      } else {
        // Einzelner Kanal
        const channel = channels.find(c =>
          c.name.toLowerCase() === item.name.toLowerCase()
        );
        if (channel) {
          result.push(channel);
          remainingChannels.delete(channel.name.toLowerCase());
        }
      }
    }

    // Füge übrige Kanäle alphabetisch hinzu
    const remainingChannelsList = channels.filter(c =>
      remainingChannels.has(c.name.toLowerCase())
    ).sort((a, b) => a.name.localeCompare(b.name));

    return [...result, ...remainingChannelsList];
  }

  _processChannelData(channel, epgData) {
    if (!epgData || !Array.isArray(epgData)) {
      this._debug('Keine EPG-Daten für Kanal:', channel.name);
      return channel;
    }

    // Sortiere Programme nach Startzeit
    const programs = epgData
      .filter(program => program.start && program.end)
      .sort((a, b) => new Date(a.start) - new Date(b.end));

    this._debug('Verarbeitete Programme für Kanal:', channel.name, programs);
    return {
      ...channel,
      programs
    };
  }

  _prepareData(data) {
    if (!data || !Array.isArray(data)) {
      this._debug('Keine Daten zum Aufbereiten vorhanden');
      return [];
    }

    const processedData = data.map(channel => this._processChannelData(channel, channel.epg));
    this._debug('Aufbereitete Daten:', processedData);
    return processedData;
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
      <div class="loading">
        <ha-circular-progress indeterminate></ha-circular-progress>
        <div>Lade EPG-Daten...</div>
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

  render() {
    if (!this._isDataReady) {
      this._debug('Rendere Ladebildschirm');
      return this._renderLoading();
    }

    const channels = this._filteredChannels;
    this._debug('Rendere EPG mit Kanälen:', channels.length);

    const timeSlots = this._generateTimeSlots();
    const currentTime = new Date();

    return html`
      <div class="gridcontainer">
        <div class="superbutton" name="superbutton">
          <ha-button @click=${this._handleRefresh}>Aktualisieren</ha-button>
        </div>
        <div class="timeBar" name="timeBar">
          ${timeSlots.map(slot => html`
            <div class="timeSlot ${this._isCurrentTimeSlot(slot, currentTime) ? 'current' : ''}">
              ${this._formatTime(slot)}
            </div>
          `)}
        </div>
        <div class="scrollBox" name="scrollBox">
          <div name="epgOutBox">
            <div name="epgBox">
              <div name="channelBox">
                ${channels.map(channel => html`
                  <div class="channelRow ${this._selectedChannel === channel.id ? 'selected' : ''}"
                       @click=${() => this._onChannelSelected(channel)}>
                    ${channel.name}
                  </div>
                `)}
              </div>
              <div name="programBox">
                ${channels.map(channel => html`
                  <div class="programRow">
                    ${this._getProgramsForChannel(channel, timeSlots).map(program => html`
                      <div class="programSlot ${this._isCurrentProgram(program) ? 'current' : ''}"
                           style="width: ${this._calculateProgramWidth(program)}px"
                           @click=${() => this._onProgramSelected(program)}>
                        <div class="programTitle">${program.title}</div>
                        <div class="programTime">
                          ${this._formatTime(new Date(program.start))} -
                          ${this._formatTime(new Date(program.end))}
                        </div>
                      </div>
                    `)}
                  </div>
                `)}
              </div>
            </div>
          </div>
        </div>
      </div>
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
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  _isCurrentTimeSlot(slot, currentTime) {
    return slot.getHours() === currentTime.getHours();
  }

  _isCurrentProgram(program) {
    const now = new Date();
    const start = new Date(program.start);
    const end = new Date(program.end);
    return now >= start && now <= end;
  }

  _calculateProgramWidth(program) {
    const start = new Date(program.start);
    const end = new Date(program.end);
    const duration = (end - start) / (1000 * 60); // Dauer in Minuten
    return (duration / 60) * 120; // 120px pro Stunde
  }

  _getProgramsForChannel(channel, timeSlots) {
    if (!channel.programs) return [];

    const startTime = timeSlots[0];
    const endTime = new Date(timeSlots[timeSlots.length - 1]);
    endTime.setHours(23, 59, 59, 999);

    return channel.programs.filter(program => {
      const programStart = new Date(program.start);
      const programEnd = new Date(program.end);
      return programStart >= startTime && programEnd <= endTime;
    });
  }

  _handleRefresh() {
    this._debug('Manuelles Update gestartet');
    this._loadData();
  }
}

customElements.define('epg-view', EPGView);