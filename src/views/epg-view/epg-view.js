import { html, css } from 'lit';
import { ViewBase } from '../view-base.js';
import { EpgBox } from './elements/epg-box.js';
import { DataProvider } from '../../tools/data-provider.js';
import '../../tools/tooltip-manager.js'; // Import für Custom Element Registrierung

export class EPGView extends ViewBase {
  static className = 'EPGView';

  static properties = {
    ...super.properties,
    _dataProvider: { type: Object },
    env: { type: Object },
    // Timebar-Werte von der epg-box
    _timeBarEarliestProgramStart: { type: Number },
    _timeBarLatestProgramStop: { type: Number },
    _timeBarScale: { type: Number },
    // Tooltip Custom Element Referenz
    _tooltipElement: { type: Object },
  };

  static styles = [
    super.styles,
    css`
      :host {
        display: block;
        width: 100%;
        position: relative;
        /* Höhe wird über JavaScript berechnet: viewport_height - epg-view_top */
        overflow: visible; /* Erlaubt Tooltips außerhalb des Hosts */
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
        height: fit-content;
        max-height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
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

      /* Horizontale Scrollbar für epg-box */
      .scrollbarx {
        position: absolute;
        bottom: 0;
        left: var(--epg-channel-width, 200px);
        right: 0;
        height: 5px;
        background-color: rgba(0, 0, 0, 0.1);
        border-radius: 2px;
        cursor: pointer;
        z-index: 10;
        transition: height 0.2s ease;
      }

      .scrollbarx:hover {
        height: 15px;
        background-color: rgba(0, 0, 0, 0.3);
      }

      .scrollbarx .scrollbarx-content {
        width: 100%;
        height: 100%;
        background-color: transparent;
      }

      .scrollbarx .scrollbarx-thumb {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        background-color: var(--accent-color, #03a9f4);
        border-radius: 2px;
        min-width: 20px;
        cursor: grab;
      }

      .scrollbarx .scrollbarx-thumb:active {
        cursor: grabbing;
      }

      /* Tooltip-Styling - Portal-ähnlicher Ansatz */
      epg-tooltip {
        position: fixed; /* Positioniert relativ zum Viewport */
        z-index: 9999; /* Höchste Priorität */
        pointer-events: none; /* Verhindert Interaktion mit darunterliegenden Elementen */
      }

      epg-tooltip.visible {
        pointer-events: auto; /* Erlaubt Interaktion nur wenn sichtbar */
      }
    `,
  ];

  constructor() {
    super();

    // Initialisiere Properties
    this._hass = null;
    this._config = null;
    this._env = null;
    this._dataProvider = null;
    this._lastUpdate = null;
    this._lastMetaUpdate = null;

    // Tooltip Custom Element Referenz
    this._tooltipElement = null;
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
      const oldLastMetaUpdate = oldState?.attributes?.last_meta_update;
      const newLastMetaUpdate = newState?.attributes?.last_meta_update;

      this._debug('EPGView set hass: Vergleiche last_update und last_meta_update', {
        oldLastUpdate,
        newLastUpdate,
        oldLastMetaUpdate,
        newLastMetaUpdate,
        oldHass: !!this._hass,
        newHass: !!value,
        entity: this.config?.entity,
        thisLastUpdate: this._lastUpdate,
        thisLastMetaUpdate: this._lastMetaUpdate,
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
      if (this._lastUpdate === null || newLastUpdate !== this._lastUpdate) {
        this._debug('EPGView: last_update Vergleich', {
          newLastUpdate,
          thisLastUpdate: this._lastUpdate,
          hasHass: !!this._hass,
          hasConfig: !!this.config,
          entity: this.config?.entity,
        });

        if (this._hass && this.config?.entity) {
          this._debug(
            'EPGView: last_update hat sich geändert oder erstmaliger Aufruf, starte Update',
            {
              old: this._lastUpdate,
              new: newLastUpdate,
            }
          );
          this._lastUpdate = newLastUpdate; // Aktualisiere sofort
          // Fange async Fehler ab
          this._loadData().catch(error => {
            this._debug('EPGView: Fehler beim Laden der Daten im hass Setter', {
              error: error.message,
            });
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

      // Prüfe last_meta_update für Record-Synchronisation
      if (this._lastMetaUpdate === null || newLastMetaUpdate !== this._lastMetaUpdate) {
        this._debug('EPGView: last_meta_update Vergleich', {
          newLastMetaUpdate,
          thisLastMetaUpdate: this._lastMetaUpdate,
          hasHass: !!this._hass,
          hasConfig: !!this.config,
          entity: this.config?.entity,
        });

        if (this._hass && this.config?.entity) {
          this._debug(
            'EPGView: last_meta_update hat sich geändert oder erstmaliger Aufruf, starte Meta-Update',
            {
              old: this._lastMetaUpdate,
              new: newLastMetaUpdate,
            }
          );
          this._lastMetaUpdate = newLastMetaUpdate; // Aktualisiere sofort
          // Fange async Fehler ab
          this._loadMetaData().catch(error => {
            this._debug('EPGView: Fehler beim Laden der Meta-Daten im hass Setter', {
              error: error.message,
            });
          });
        } else {
          this._debug('EPGView: hass oder entity nicht verfügbar für Meta-Update', {
            hasHass: !!this._hass,
            hasConfig: !!this.config,
            entity: this.config?.entity,
          });
        }
      } else {
        this._debug('EPGView: last_meta_update unverändert, überspringe Meta-Update', {
          lastMetaUpdate: this._lastMetaUpdate,
          newLastMetaUpdate: newLastMetaUpdate,
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

      // Aktualisiere TooltipCustomElement mit neuer env
      if (this._tooltipElement) {
        this._tooltipElement.env = value;
      }
    }
  }

  get env() {
    return this._env;
  }

  async _loadData() {
    this._debug('EPG-View: _loadData wird aufgerufen');

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
  }

  async _loadMetaData() {
    this._debug('EPG-View: _loadMetaData wird aufgerufen');

    if (!this._dataProvider || !this.config.entity) {
      this._debug('EPG-View: _loadMetaData: Übersprungen - dataProvider oder entity fehlt', {
        dataProvider: !!this._dataProvider,
        entity: this.config.entity,
      });
      return;
    }

    // Starte den Meta-Datenabruf direkt
    this._debug('EPG-View: Starte Meta-Datenabruf für Record-Synchronisation');
    await this._fetchMetaData(this.config);
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
        // Deaktiviere Zeitfilterung, um alle Programme zu laden
        disableTimeFilter: true,
        // Erweitere den Zeitbereich für veraltete Daten
        extendedTimeRange: true,
      }, // Blacklist/Whitelist-Konfiguration übergeben
      // Callback für EPG-Daten (wird für jeden Kanal aufgerufen)
      data => {
        this._debug('_fetchViewData(): Neue EPG-Daten empfangen', {
          epg: data,
          kanal: data.channeldata.name,
          kanalId: data.channeldata.channelid,
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

  async _fetchMetaData(config) {
    this._debug('_fetchMetaData(): _fetchMetaData gestartet', {
      entity: config.entity,
      hasDataProvider: !!this._dataProvider,
    });

    if (!this._dataProvider) {
      throw new Error('DataProvider nicht initialisiert');
    }

    // Hole die EPG-Box
    const epgBox = this.shadowRoot?.querySelector('epg-box');
    if (!epgBox) {
      this._debug('_fetchMetaData(): EPG-Box nicht gefunden, überspringe Meta-Datenabruf');
      return [];
    }

    this._debug('_fetchMetaData(): Starte Meta-Datenabruf für Record-Synchronisation');
    
    // Rufe Meta-Daten über DataProvider ab
    const metaData = await this._dataProvider.fetchMetaData(config.entity);
    this._debug('_fetchMetaData(): Meta-Daten empfangen', { 
      metaData,
      hasRecords: !!metaData?.records,
      recordCount: metaData?.records ? Object.keys(metaData.records).length : 0
    });
    
    // Verarbeite Meta-Daten und aktualisiere Programme mit Record-Status
    if (metaData?.records) {
      epgBox.updateRecordStatus(metaData.records);
    }
    
    this._debug('_fetchMetaData(): Meta-Datenabruf abgeschlossen');
    return metaData;
  }

  _onEpgBoxReady() {
    this._debug('EPG-View: _onEpgBoxReady aufgerufen');

    // Initialisiere DataProvider, falls noch nicht geschehen
    if (!this._dataProvider && this._hass && this.config) {
      this._debug('EPG-View: Initialisiere DataProvider in _onEpgBoxReady');
      this._dataProvider = new DataProvider();
      this._dataProvider.hass = this._hass;
    }

    // Initialisiere TooltipCustomElement mit ProgramBox-Referenz
    //this._initializeTooltipElement();

    // Lade die Daten, wenn die EPG-Box bereit ist
    this._debug('EPG-View: EPG-Box ist bereit, starte Datenladung');
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

    // Registriere mich für Environment-Änderungen
    this.dispatchEvent(
      new CustomEvent('registerMeForChanges', {
        bubbles: true,
        composed: true,
        detail: {
          component: this,
          callback: this._handleChangeNotifys.bind(this),
          eventType: 'envChanges',
          immediately: true,
        },
      })
    );

    // Registriere Tooltip-Event-Listener (TooltipCustomElement wird später initialisiert)
    this.addEventListener('tooltip-event', event => {
      this._pipeTooltipEvent(event.detail);
    });

    // Prüfe ob epgBox bereits vorhanden ist
    const epgBox = this.shadowRoot.querySelector('epg-box');
    if (epgBox) {
      this._debug('EPG-View: epgBox bereits vorhanden, starte Datenladung');
      this._loadData();
    } else {
      this._debug('EPG-View: epgBox noch nicht vorhanden, warte auf _onEpgBoxReady');
    }

    // Berechne optimale Höhe
    this._calculateOptimalHeight();
  }

  _pipeTooltipEvent(details, counter=0) {
    this._debug('EPG-View: Tooltip-Event empfangen', { details });
    if (! this._tooltipElement) {
      const epgBox = this.shadowRoot.querySelector('epg-box');
      const programBox = epgBox?.shadowRoot?.querySelector('epg-program-box');
      this._tooltipElement = (epgBox && programBox) ? this.shadowRoot.querySelector('epg-tooltip') : null;
      if (! this._tooltipElement ) {
        if (counter < 10) {
          this._debug('EPG-View: TooltipCustomElement nicht gefunden, versuche es später', { counter });
          setTimeout(() => {
            this._pipeTooltipEvent(details, counter + 1);
            }, 100);
        }
        return;
      } else {
        this._debug('EPG-View: TooltipCustomElement gefunden, setze Konfiguration');
        this._tooltipElement.initialDelay = 3000;
        this._tooltipElement.scrollPause = 4000;
        this._tooltipElement.frameElement = epgBox;
        this._tooltipElement.hostElement = programBox;
      }
    }
    this._tooltipElement.setEventData(details);

  }

  /**
   * Behandelt Änderungen von anderen Komponenten
   * @param {Object} eventdata - Event-Daten mit verschiedenen Event-Typen
   */
  _handleChangeNotifys(eventdata) {
    this._debug('EPG-View: _handleChangeNotifys() aufgerufen', { eventdata });

    for (const eventType of Object.keys(eventdata)) {
      if (eventType === 'envchanges') {
        const { oldState, newState } = eventdata[eventType];

        this._debug('EPG-View: Environment-Änderungen empfangen', {
          oldState,
          newState,
        });

        // Update Environment-Properties
        if (newState) {
          let updated = false;

          if (
            newState.envSnifferTypeOfView !== undefined &&
            this.env?.envSnifferTypeOfView !== newState.envSnifferTypeOfView
          ) {
            this.env = { ...this.env, envSnifferTypeOfView: newState.envSnifferTypeOfView };
            updated = true;
          }
          if (this.env?.envSnifferTypeOfView == 'panel') {
            if (
              newState.envSnifferCardHeight !== undefined &&
              this.env?.envSnifferCardHeight !== newState.envSnifferCardHeight
            ) {
              this.env = { ...this.env, envSnifferCardHeight: newState.envSnifferCardHeight };
              updated = true;
            }
            if (
              newState.envSnifferScreenHeight !== undefined &&
              this.env?.envSnifferScreenHeight !== newState.envSnifferScreenHeight
            ) {
              this.env = { ...this.env, envSnifferScreenHeight: newState.envSnifferScreenHeight };
              updated = true;
            }
          }
          if (updated) {
            this._debug('EPG-View: Environment-Properties aktualisiert', {
              env: this.env,
            });

            // Höhe neu berechnen wenn sich der View-Typ ändert
            this._calculateOptimalHeight();
          }
        }
      }
    }
  }

  /**
   * Berechnet die optimale Höhe der epg-view: viewport_height - epg-view_top
   * Nur im Panel-Modus, im Card-Modus wird normale Höhe verwendet
   */
  _calculateOptimalHeight() {
    // Prüfe ob wir im Panel-Modus sind
    if (this.env?.envSnifferTypeOfView !== 'panel') {
      this._debug('EPG-View: Nicht im Panel-Modus, verwende normale Höhe');
      return;
    }

    const viewportHeight = window.innerHeight;
    const epgViewRect = this.getBoundingClientRect();
    const optimalHeight = viewportHeight - epgViewRect.top;

    this._debug('EPG-View: Höhe berechnet (Panel-Modus)', {
      viewportHeight,
      epgViewTop: epgViewRect.top,
      optimalHeight,
      envSnifferTypeOfView: this.env?.envSnifferTypeOfView,
    });

    // Höhe setzen
    this.style.height = optimalHeight + 'px';
  }

  /**
   * Richtet die Scroll-Synchronisation zwischen TimeBar und ProgramBox ein
   */
  _setupScrollSync() {
    this._debug('EPG-View: Setup Scroll-Synchronisation');

    // Registriere Scroll-Event-Listener für Synchronisation
    this.addEventListener('scroll-sync', event => {
      const { direction, element } = event.detail;
      this._debug('EPG-View: Scroll-Synchronisation empfangen', { direction, element });

      // Hier kann die Scroll-Synchronisation implementiert werden
      // z.B. zwischen verschiedenen EPG-Komponenten
    });
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

      <!-- Tooltip Custom Element - Außerhalb des Grids für bessere Kontrolle -->
      <epg-tooltip
        .data=${this._tooltipElement?.data}
        .visible=${this._tooltipElement?.visible}
        .initialDelay=${3000}
        .scrollPause=${4000}
      >
      </epg-tooltip>
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
