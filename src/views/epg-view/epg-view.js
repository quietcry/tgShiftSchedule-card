import { html, css } from 'lit';
import { ViewBase } from '../view-base.js';
import { EpgViewBase } from './epg-view-base.js';
import { EpgTimebar } from './elements/epg-timebar.js';
import { EpgChannelList } from './elements/epg-channel-list.js';
import { EpgProgramList } from './elements/epg-program-list.js';
import { EpgBox } from './elements/epg-box.js';
import { DataProvider } from '../../tools/data-provider.js';
import { EpgScrollManager } from './elements/epg-scroll-manager.js';

export class EPGView extends ViewBase {
  static className = 'EPGView';

  static properties = {
    ...super.properties,
    _dataProvider: { type: Object },
    _dataFetchStarted: { type: Boolean },
    env: { type: Object },
    // Timebar-Werte von der epg-box
    _timeBarEarliestProgramStart: { type: Number },
    _timeBarLatestProgramStop: { type: Number },
    _timeBarScale: { type: Number },
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
        grid-template-columns: 1fr;
        grid-template-rows: auto 1fr;
        grid-template-areas:
          'headline'
          'scrollBox';
        width: 100%;
        height: 100%;
        overflow: hidden;
      }

      .headline {
        grid-area: headline;
        display: grid;
        grid-template-columns: auto 1fr;
        grid-template-rows: auto;
        grid-template-areas: 'superbutton timeBar';
        width: 100%;
        height: auto;
      }

      .superbutton {
        grid-area: superbutton;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 0px;
        margin: 0px;
        background-color: var(--primary-background-color);
        border-right: 1px solid var(--divider-color);
        width: var(--epg-channel-width, 180px);
        min-width: var(--epg-channel-width, 180px);
        max-width: var(--epg-channel-width, 180px);
      }

      .timeBar {
        grid-area: timeBar;
        display: flex;
        flex-direction: column;
        background-color: var(--primary-background-color);
        border-bottom: 1px solid var(--divider-color);
        overflow-x: auto;
        height: 60px;
        padding: 0px;
        margin: 0px;
      }

      .timeBarContainer {
        display: flex;
        flex-direction: column;
        min-width: max-content;
        height: 100%;
      }

      .timeBarTop {
        height: 8px;
        background-color: #34495e;
        position: relative;
        border-bottom: 1px solid #2c3e50;
      }

      .timeBarMiddle {
        height: 32px;
        background-color: #ecf0f1;
        position: relative;
        display: flex;
        align-items: center;
        border-bottom: 1px solid #bdc3c7;
      }

      .timeBarBottom {
        height: 20px;
        background-color: #3498db;
        position: relative;
      }

      .timeMarker {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 1px;
        background-color: #95a5a6;
        z-index: 1;
      }

      .timeMarker.hour {
        width: 2px;
        background-color: #2c3e50;
      }

      .timeMarker.quarter {
        width: 1px;
        background-color: #7f8c8d;
      }

      .timeLabel {
        position: absolute;
        top: 4px;
        transform: translateX(-50%);
        font-size: 11px;
        color: #2c3e50;
        font-weight: bold;
        white-space: nowrap;
        z-index: 2;
        background-color: rgba(236, 240, 241, 0.9);
        padding: 1px 3px;
        border-radius: 2px;
      }

      .currentTimeMarker {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 2px;
        background-color: #e74c3c;
        z-index: 3;
        box-shadow: 0 0 4px rgba(231, 76, 60, 0.6);
      }

      .progressSegment {
        position: absolute;
        top: 0;
        bottom: 0;
        background-color: #2980b9;
        z-index: 1;
        border-radius: 0 2px 2px 0;
      }

      .timeBarTop .currentTimeIndicator {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 4px;
        height: 8px;
        background-color: #ffffff;
        z-index: 2;
        border-radius: 0 0 2px 2px;
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

    // Initialisiere Properties
    this._hass = null;
    this._config = null;
    this._env = null;
    this._dataProvider = null;
    this._lastUpdate = null;
    this._dataFetchStarted = false;

    // Array für View-Änderungs-Observer
    // this.informMeAtViewChanges = [];
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

      this._debug('EPGView set hass: Vergleiche last_update', {
        oldLastUpdate,
        newLastUpdate,
        oldHass: !!this._hass,
        newHass: !!value,
        entity: this.config?.entity,
        thisLastUpdate: this._lastUpdate,
      });

      this._hass = value;
      if (this._dataProvider) {
        this._dataProvider.hass = value;
        this._debug('EPGView set hass: DataProvider hass aktualisiert');
      } else if (this._config) {
        // Initialisiere DataProvider, wenn config bereits verfügbar ist
        this._debug('EPGView set hass: Initialisiere DataProvider', {
          hasHass: !!value,
          hasConfig: !!this._config,
          entity: this._config.entity,
        });
        this._dataProvider = new DataProvider();
        this._dataProvider.hass = value;
      }

      // Nur wenn sich last_update tatsächlich ändert oder beim ersten Mal
      if (newLastUpdate !== this._lastUpdate || this._lastUpdate === null || this._dataFetchStarted === false) {
        this._debug('EPGView: last_update Vergleich', {
          newLastUpdate,
          thisLastUpdate: this._lastUpdate,
          hasHass: !!this._hass,
          hasConfig: !!this.config,
          entity: this.config?.entity,
          dataFetchStarted: this._dataFetchStarted,
        });

        if (this._hass && this.config?.entity) {
          this._debug('EPGView: last_update hat sich geändert oder erstmaliger Aufruf, starte Update', {
              old: this._lastUpdate,
              new: newLastUpdate,
            });
          this._lastUpdate = newLastUpdate; // Aktualisiere sofort
          // Fange async Fehler ab
          this._loadData().catch(error => {
            this._debug('EPGView: Fehler beim Laden der Daten im hass Setter', { error: error.message });
          });
        } else {
          this._debug('EPGView: hass oder entity nicht verfügbar', {
            hasHass: !!this._hass,
            hasConfig: !!this.config,
            entity: this.config?.entity,
          });
        }
      } else {
        this._debug('EPGView: last_update unverändert, überspringe Update und Rendering', {
          lastUpdate: this._lastUpdate,
          newLastUpdate: newLastUpdate,
        });
      }
    } else {
      this._debug('EPGView set hass: hass unverändert, überspringe');
    }
  }

  get hass() {
    return this._hass;
  }

  set config(value) {
    this._debug('EPG-View: config wird gesetzt', {
      epgShowPastTime: value?.epgShowPastTime,
      epgShowFutureTime: value?.epgShowFutureTime,
      configKeys: value ? Object.keys(value) : [],
    });
    this._config = value;

    // Aktualisiere CSS-Variable für Channel-Breite
    if (value?.channelWidth) {
      this.style.setProperty('--epg-channel-width', `${value.channelWidth}px`);
    }

    // Initialisiere DataProvider, wenn hass bereits verfügbar ist
    if (this._hass && value && !this._dataProvider) {
      this._debug('EPGView set config: Initialisiere DataProvider', {
        hasHass: !!this._hass,
        hasConfig: !!value,
        entity: value.entity,
      });
      this._dataProvider = new DataProvider();
      this._dataProvider.hass = this._hass;
    }
  }

  get config() {
    return this._config;
  }

  set env(value) {
    this._debug('EPG-View: env wird gesetzt', {
      cardWidth: value?.cardWidth,
      typeOfView: value?.typeOfView,
      isDesktop: value?.isDesktop,
    });

    if (this._env !== value) {
      this._env = value;

    }
  }

  get env() {
    return this._env;
  }

  async _loadData() {
    // Verhindere parallele Aufrufe
    if (this._dataFetchStarted) {
      this._debug('EPG-View: _loadData bereits in Bearbeitung, überspringe Aufruf');
      return;
    }

    this._dataFetchStarted = true;
    this._debug('EPG-View: _loadData wird aufgerufen');

    try {
      // Hole die EPG-Box
      const epgBox = this.shadowRoot?.querySelector('epg-box');
      if (!epgBox) {
        this._debug('EPG-View: _loadData: EPG-Box nicht gefunden, überspringe Datenabruf');
        return;
      }
      this._debug('EPG-View: _loadData: Datenabruf wird gestartet');

      // Prüfe, ob Dummy-Daten verwendet werden sollen (Build-Variable)
      if (this.useDummyData && this.useDummyData.toLowerCase() === 'true') {
        this._debug('EPG-View: _loadData: Verwende Dummy-Daten (Build-Variable)', {
          useDummyData: this.useDummyData,
        });

        try {
          // Rufe die Dummy-Daten-Generierung im DataManager auf
          const dummyData = epgBox.dataManager.generateDummyData();

          if (dummyData && dummyData.length > 0) {
            this._debug('EPG-View: Dummy-Daten erfolgreich generiert', {
              anzahlKanäle: dummyData.length,
              kanäle: dummyData.map(channel => ({
                id: channel.id,
                name: channel.name,
                anzahlProgramme: channel.programs?.length || 0,
              })),
            });

            // Füge jeden Kanal als Teil-EPG hinzu
            dummyData.forEach(channelData => {
              epgBox.addTeilEpg(channelData);
            });

            this._debug('EPG-View: Dummy-Daten erfolgreich geladen', {
              anzahlKanäle: dummyData.length,
            });
          } else {
            this._debug('EPG-View: Keine Dummy-Daten generiert');
          }
        } catch (error) {
          this._debug('EPG-View: Fehler beim Laden der Dummy-Daten', { error: error.message });
        }
        return;
      }

      // Normale EPG-Daten laden
    if (!this._dataProvider || !this.config.entity) {
      this._debug('EPG-View: _loadData: Übersprungen - dataProvider oder entity fehlt', {
        dataProvider: !!this._dataProvider,
        entity: this.config.entity,
      });
      return;
    }

    // Starte den Datenabruf direkt
      this._debug('EPG-View: Starte Datenabruf für echte EPG-Daten');
    await this._fetchViewData(this.config);
    } finally {
      this._dataFetchStarted = false;
    }
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
    this._debug('EPG-View: _onEpgBoxReady aufgerufen');
    this._loadData();

    // Setup Scroll-Synchronisation
    this._setupScrollSync();
  }

  firstUpdated() {
    this._debug('EPG-View: firstUpdated');

    // Initialisiere DataProvider falls noch nicht geschehen
    if (!this._dataProvider) {
      this._dataProvider = new DataProvider(this._hass);
    }

    // Registriere Event-Listener für automatische Registrierung
    // this.addEventListener('registerMeForChanges', this._onRegisterMeForChanges.bind(this));

    // Prüfe ob epgBox bereits vorhanden ist
    const epgBox = this.shadowRoot.querySelector('epg-box');
    if (epgBox) {
      this._debug('EPG-View: epgBox bereits vorhanden, starte Datenladung');
      this._loadData();
    } else {
      this._debug('EPG-View: epgBox noch nicht vorhanden, warte auf _onEpgBoxReady');
    }
  }

  /**
   * Richtet die Scroll-Synchronisation zwischen TimeBar und ProgramBox ein
   */
  _setupScrollSync() {
    this._debug('EPG-View: Setup Scroll-Synchronisation');

    // Finde die benötigten Elemente
    const epgBox = this.shadowRoot.querySelector('epg-box');
    const timeBar = this.shadowRoot.querySelector('.timeBar');

    if (!epgBox || !timeBar) {
      this._debug('EPG-View: Scroll-Sync Setup übersprungen - Elemente nicht gefunden', {
        epgBoxFound: !!epgBox,
        timeBarFound: !!timeBar,
      });
      return;
    }

    // Richte Scroll-Synchronisation zwischen ProgramBox und TimeBar ein
    const scrollManager = new EpgScrollManager();
    scrollManager.setupScrollSync(epgBox, timeBar);

    this._debug('EPG-View: Scroll-Synchronisation eingerichtet');
  }

  render() {
    // Debug: Überprüfe die Konfigurationswerte
    this._debug('EPG-View render: Konfigurationswerte', {
      epgShowPastTime: this.config.epgShowPastTime,
      epgShowFutureTime: this.config.epgShowFutureTime,
      configKeys: Object.keys(this.config),
    });

    return html`
      <div class="gridcontainer">
        <div class="headline">
        <div class="superbutton">${this._renderSuperButton()}</div>
          <div class="timeBar">
            <epg-timebar
              .scale=${this._timeBarScale}
              .earliestProgramStart=${this._timeBarEarliestProgramStart}
              .latestProgramStop=${this._timeBarLatestProgramStop}
            ></epg-timebar>
          </div>
        </div>
        <epg-box
          .epgPastTime=${this.config.epgPastTime}
          .epgFutureTime=${this.config.epgFutureTime}
          .epgShowFutureTime=${this.config.epgShowFutureTime}
          .epgShowPastTime=${this.config.epgShowPastTime}
          .channelWidth=${this.config.channelWidth}
          .showChannelGroups=${this.config.show_channel_groups}
          .showTime=${this.config.show_time}
          .showDuration=${this.config.show_duration}
          .showDescription=${this.config.show_description}
          .showShortText=${this.config.show_shorttext}
          .channelOrder=${this.config.group_order}
          @epg-box-ready=${this._onEpgBoxReady}
          @epg-first-load-complete=${this._onEpgFirstLoadComplete}
          @scale-changed=${this._onScaleChanged}
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

  _handleRefresh() {
    // Fange async Fehler ab
    this._loadData().catch(error => {
      this._debug('EPG-View: Fehler beim Laden der Daten im Refresh', { error: error.message });
    });
  }


  _onScaleChanged(e) {
    this._debug('EPG-View: scale geändert', {
      oldValue: this._timeBarScale,
      newValue: e.detail.value,
    });
    this._timeBarScale = e.detail.value;
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

if (!customElements.get('epg-view')) {
customElements.define('epg-view', EPGView);
}
