import { html, css } from 'lit';
import { ViewBase } from '../view-base.js';
import { EpgViewBase } from './epg-view-base.js';
import { EpgTimebar } from './elements/epg-timebar.js';
import { EpgChannelList } from './elements/epg-channel-list.js';
import { EpgProgramList } from './elements/epg-program-list.js';
import { EpgBox } from './elements/epg-box.js';
import { DataProvider } from '../../tools/data-provider.js';

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
    _dataFetchStarted: { type: Boolean },
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
        overflow-x: auto;
      }

      .timeBarContainer {
        display: flex;
        min-width: max-content;
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
        flex-shrink: 0;
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
    this._debug('EPGView-Konstruktor: Start');
    this._dataProvider = new DataProvider();
    this._debug('EPGView-Konstruktor: DataProvider initialisiert');
    this._epgData = { channels: [] };
    this._debug('EPGView-Konstruktor: Initialisierung abgeschlossen');
    this._currentTime = Math.floor(Date.now() / 1000);
    this._timeWindow = 'C';
    this._selectedChannel = null;
    this._isDataReady = false;
    this._processedChannels = [];
    this._lastUpdate = null;
    this._dataFetchStarted = false;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  set hass(value) {
    this._debug('EPGView set hass wird aufgerufen');
    if (this._hass !== value) {
      const oldState = this._hass?.states[this.config.entity];
      const newState = value?.states[this.config.entity];
      const oldLastUpdate = oldState?.attributes?.last_update;
      const newLastUpdate = newState?.attributes?.last_update;

      this._hass = value;
      if (this._dataProvider) {
        this._dataProvider.hass = value;
        this._debug('EPGView set hass: DataProvider hass aktualisiert');
      }

      // Nur wenn sich last_update ändert oder hass zum ersten Mal gesetzt wird
      if (newLastUpdate !== this._lastUpdate || !this._hass) {
        if (this._hass && this.config.entity) {
          if (newLastUpdate !== this._lastUpdate) {
            this._debug('EPGView: last_update hat sich geändert, starte Update', {
              old: this._lastUpdate,
              new: newLastUpdate,
            });
            this._lastUpdate = newLastUpdate;
            this._dataFetchStarted = false; // Reset flag für neuen Datenabruf
            this._loadData();
          }
        }
      } else {
        this._debug('EPGView: last_update unverändert, überspringe Update und Rendering', {
          lastUpdate: this._lastUpdate,
        });
      }
    }
  }

  get hass() {
    return this._hass;
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

    // Starte den Datenabruf direkt
    this._debug('EPG-View: Starte Datenabruf');
    await this._fetchViewData(this.config);
  }

  async _fetchViewData(config) {
    this._debug('_fetchViewData(): _fetchViewData gestartet', {
      entity: config.entity,
      hasDataProvider: !!this._dataProvider,
    });

    if (!this._dataProvider) {
      throw new Error('DataProvider nicht initialisiert');
    }

    // Hole die EPG-Box
    const epgBox = this.shadowRoot?.querySelector('epg-box');
    if (!epgBox) {
      this._debug('_fetchViewData(): EPG-Box nicht gefunden, überspringe Datenabruf');
      return [];
    }

    this._debug('_fetchViewData(): Starte EPG-Daten Abruf', {
      hasEpgBox: !!epgBox,
    });

    const result = await this._dataProvider.fetchEpgData(
      config.entity,
      undefined, // Kein time_window
      undefined, // Kein date
      {
        blacklist: config.blacklist || '',
        whitelist: config.whitelist || '',
      }, // Blacklist/Whitelist-Konfiguration übergeben
      // Callback für EPG-Daten (wird für jeden Kanal aufgerufen)
      data => {
        this._debug('_fetchViewData(): Neue EPG-Daten empfangen', {
          epg: data,
          kanal: data.channeldata.name,
          kanalId: data.channeldata.id,
          anzahlProgramme:
            data.epg && typeof data.epg === 'object' ? Object.keys(data.epg).length : 0,
          programme:
            data.epg && typeof data.epg === 'object'
              ? Object.values(data.epg).map(p => ({
                  title: p.title,
                  start: p.start,
                  end: p.end || p.stop,
                  duration: p.duration,
                }))
              : [],
        });

        // Erstelle ein vollständiges Teil-EPG
        const teilEpg = data;

        this._debug('_fetchViewData(): Übergebe Teil-EPG an Box', {
          teilEpg: teilEpg,
          kanal: teilEpg.channeldata.name,
          anzahlProgramme:
            teilEpg.epg && typeof teilEpg.epg === 'object' ? Object.keys(teilEpg.epg).length : 0,
        });

        // Übergebe das Teil-EPG an die EPG-Box
        epgBox.addTeilEpg(teilEpg);
        this._debug('_fetchViewData(): Teil-EPG an Box übergeben');
      },
      // Callback für Abschluss (wird aufgerufen, wenn alle Daten abgeschlossen sind)
      completeData => {
        this._debug('_fetchViewData(): Alle EPG-Daten abgeschlossen', {
          anzahlKanäle: completeData.length,
          gesamtProgramme: completeData.reduce(
            (sum, c) => sum + (c.epg && typeof c.epg === 'object' ? Object.keys(c.epg).length : 0),
            0
          ),
          kanäle: completeData.map(c => c.channeldata.name),
        });

        // Hier kannst du Aktionen ausführen, die nach Abschluss aller Daten erfolgen sollen
        // z.B. Loading-Status beenden, UI-Updates, etc.
      }
    );

    return result;
  }

  _onEpgBoxReady() {
    this._debug('EPG-View: EPG-Box ist bereit, starte Datenabruf');
    if (!this._dataFetchStarted) {
      this._dataFetchStarted = true;
      this._fetchViewData(this.config);
    } else {
      this._debug('EPG-View: Datenabruf bereits gestartet, überspringe');
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
    });

    // Wenn die EPG-Box bereits verfügbar ist, starte Datenabruf nur wenn noch nicht gestartet
    if (epgBox && !this._dataFetchStarted) {
      this._debug('EPG-View: EPG-Box bereits verfügbar, starte Datenabruf');
      this._dataFetchStarted = true;
      this._fetchViewData(this.config);
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
      this._debug('Keine EPG-Daten für Kanal:', channel.channeldata?.name || channel.name, {
        kanalId: channel.id,
        kanalName: channel.channeldata?.name || channel.name,
        anzahlProgramme: channel.programs ? channel.programs.length : 0,
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

    this._debug('Verarbeitete Programme für Kanal:', channel.channeldata?.name || channel.name, {
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
          .epgPastTime=${this.config.epgPastTime}
          .epgShowWidth=${this.config.epgShowWidth}
          .epgBackview=${this.config.epgBackview}
          .channelWidth=${this.config.channelWidth}
          .showChannelGroups=${this.config.show_channel_groups}
          .showTime=${this.config.show_time}
          .showDuration=${this.config.show_duration}
          .showDescription=${this.config.show_description}
          .showShortText=${this.config.show_shorttext}
          .channelOrder=${this.config.group_order}
          @epg-box-ready=${this._onEpgBoxReady}
          @epg-first-load-complete=${this._onEpgFirstLoadComplete}
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
      <div class="timeBarContainer">
        ${timeSlots.map(
          slot => html`
            <div
              class="timeSlot ${this._isCurrentTimeSlot(slot, this._currentTime) ? 'current' : ''}"
              style="width: 120px; min-width: 120px;"
            >
              ${this._formatTime(slot)}
            </div>
          `
        )}
      </div>
    `;
  }

  _generateTimeSlots() {
    const slots = [];
    const now = new Date();

    // Verwende die konfigurierten Zeitparameter oder Standardwerte
    const pastTime = this.config.epgPastTime || 30; // Minuten in die Vergangenheit
    const futureTime = this.config.epgFutureTime || 120; // Minuten in die Zukunft

    // Berechne Start- und Endzeit basierend auf den Parametern
    const startTime = new Date(now.getTime() - pastTime * 60 * 1000);
    const endTime = new Date(now.getTime() + futureTime * 60 * 1000);

    // Runde auf volle Stunden für bessere Darstellung
    startTime.setMinutes(0, 0, 0);
    endTime.setMinutes(0, 0, 0);

    this._debug('_generateTimeSlots: Zeitparameter', {
      pastTime,
      futureTime,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      now: now.toISOString(),
    });

    // Generiere Zeitslots in 30-Minuten-Intervallen
    const currentSlot = new Date(startTime);
    while (currentSlot <= endTime) {
      slots.push(new Date(currentSlot));
      currentSlot.setMinutes(currentSlot.getMinutes() + 30);
    }

    this._debug('_generateTimeSlots: Generierte Slots', {
      anzahlSlots: slots.length,
      ersteSlot: slots[0]?.toISOString(),
      letzteSlot: slots[slots.length - 1]?.toISOString(),
    });

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

  _onProgramBoxScroll(e) {
    const timeBar = this.shadowRoot?.querySelector('.timeBar');
    if (timeBar) {
      timeBar.scrollLeft = e.detail.scrollLeft;
    }
  }

  _handleRefresh() {
    this._loadData();
  }

  _onEpgFirstLoadComplete(e) {
    this._debug('EPG-View: Erster Load abgeschlossen', {
      isFirstLoad: e.detail.isFirstLoad,
      isChannelUpdate: e.detail.isChannelUpdate,
      channelCount: e.detail.channelCount,
    });

    // Wenn isFirstLoad < 2 dann isFirstLoad = 1
    if (e.detail.isFirstLoad < 2) {
      this._debug('EPG-View: isFirstLoad auf 1 gesetzt', {
        alterWert: e.detail.isFirstLoad,
        neuerWert: 1,
      });

      // Hier könntest du isFirstLoad in der EPG-View setzen, falls benötigt
      // this.isFirstLoad = 1;
    }

    // Rufe testIsFirstLoadCompleteUpdated auf
    const epgBox = this.shadowRoot?.querySelector('epg-box');
    if (epgBox && typeof epgBox.testIsFirstLoadCompleteUpdated === 'function') {
      this._debug('EPG-View: Rufe testIsFirstLoadCompleteUpdated auf');
      epgBox.testIsFirstLoadCompleteUpdated();
    }

    // Hier können Aktionen ausgeführt werden, die nach dem ersten Load erfolgen sollen
    // z.B. Loading-Status beenden, UI-Updates, etc.
  }
}

customElements.define('epg-view', EPGView);
