import { html, css } from 'lit';
import { render } from 'lit/html.js';
import { repeat } from 'lit/directives/repeat.js';
import { EpgElementBase } from './epg-element-base.js';
import './epg-program-item.js';
import './epg-time-marker.js';
import { EpgScrollManager } from './epg-scroll-manager.js';
import { EpgScaleManager } from './epg-scale-manager.js';
import { EpgChannelManager } from './epg-channel-manager.js';
import { EpgDataManager } from './epg-data-manager.js';
import { EpgRenderManager } from './epg-render-manager.js';
import { EpgUpdateManager } from './epg-update-manager.js';
import { EpgProgramBox } from './epg-program-box.js';

export class EpgBox extends EpgElementBase {
  static className = 'EpgBox';

  static properties = {
    ...super.properties,
    // ===== EXTERNE PROPERTIES (von Parent-Komponenten) =====
    timeWindow: { type: Number }, // Zeitfenster für EPG-Anzeige (wird von ScaleManager verwendet)
    showChannel: { type: Boolean }, // Zeigt Kanalspalte an/aus (wird von RenderManager verwendet)
    selectedChannel: { type: String }, // Aktuell ausgewählter Kanal (wird von ChannelManager verwendet)
    channelOrder: { type: Array }, // Array mit Kanaldefinitionen { name: string, style?: string, channels?: Array } (wird von ChannelManager verwendet)
    showChannelGroups: { type: Boolean }, // Zeigt Kanalgruppen an (wird von RenderManager verwendet)

    showShortText: { type: Boolean }, // Zeigt kurze Programmtexte an (wird von RenderManager verwendet)
    showTime: { type: Boolean }, // Zeigt Zeit an (wird von RenderManager verwendet)
    showDuration: { type: Boolean }, // Zeigt Dauer an (wird von RenderManager verwendet)
    showDescription: { type: Boolean }, // Zeigt Beschreibung an (wird von RenderManager verwendet)
    channelWidth: { type: Number }, // Breite der Kanalspalte in px (wird von RenderManager verwendet)
    // Environment-Properties werden als normale Instanzvariablen verwaltet (nicht als Lit-Properties)
    // um Konflikte zwischen Constructor-Initialisierung und Lit-Property-Management zu vermeiden

    // ===== ZEIT-KONFIGURATION (wird von DataManager und ScaleManager verwendet) =====
    epgPastTime: { type: Number }, // Minuten in die Vergangenheit (wird für minTime-Berechnung verwendet)
    epgShowFutureTime: { type: Number }, // Minuten in die Zukunft (wird für maxTime-Berechnung verwendet)
    epgShowPastTime: { type: Number }, // Alternative zu epgPastTime (wird von ScaleManager verwendet)
    epgShowWidth: { type: Number }, // Breite der EPG-Anzeige (wird von ScaleManager verwendet)
    epgBackview: { type: Number }, // Backview-Position (wird von ScaleManager verwendet)
    _sortedChannels: { type: Array },
    _flatChannels: { type: Array }, // Flaches Array für repeat
    _channelGroups: { type: Array }, // Gruppierungsinformationen
    _channelsParameters: { type: Object },
    _channelOrderInitialized: { type: Boolean },
    isFirstLoad: { type: Number },
    isChannelUpdate: { type: Number },
    epgFutureTime: { type: Number },
  };

  constructor() {
    super();

    // ===== ÜBERGREIFEND VERWENDETE VARIABLEN =====

    // Kanal-Management
    this._sortedChannels = []; // Array mit allen Kanälen in sortierter Reihenfolge (wird von allen Managern verwendet)
    this._flatChannels = []; // Flaches Array für repeat-Direktive
    this._channelGroups = []; // Gruppierungsinformationen für UI
    this._channelOrderInitialized = false; // Flag: true wenn Kanal-Reihenfolge initialisiert wurde (ChannelManager)

    // Scale-Management (wird von ScaleManager, TimeMarker und RenderManager verwendet)
    this.scale = 1; // Aktueller Scale-Faktor für Zeit-zu-Pixel-Konvertierung

    // Zeit-Management (wird von DataManager, ScaleManager, TimeMarker verwendet)
    const now = Math.floor(Date.now() / 1000);
    const pastTime = this.epgPastTime || 30; // Minuten in die Vergangenheit
    const futureTime = this.epgShowFutureTime || 180; // Minuten in die Zukunft

    this._channelsParameters = {
      minTime: now - pastTime * 60, // Früheste sichtbare Zeit (Unix-Timestamp)
      maxTime: now + futureTime * 60, // Späteste sichtbare Zeit (Unix-Timestamp)
    };

    // Eigenständige Zeit-Variablen
    this.earliestProgramStart = 0; // Wird auf echte Programm-Startzeit gesetzt
    this.latestProgramStop = 0; // Wird auf echte Programm-Stoppzeit gesetzt

    // DOM-Referenzen (werden in firstUpdated gesetzt)
    this.programBox = null;
    this.channelBox = null;
    this.scrollbarX = null;

    // Scroll-Debouncing
    this.scrollAnimationFrame = null;
    this.lastScrollLeft = 0;
    this.scrollPositionSeconds = 0;

    // Load-State-Management (wird von allen Managern für Status-Tracking verwendet)
    this.isFirstLoad = 0; // Load-Status: 0=initial, 1=loading, 2=complete
    this.isChannelUpdate = 0; // Counter für aktive Kanal-Updates (wird von DataManager erhöht/verringert)

    // UI-Konfiguration (wird von RenderManager verwendet)
    this.channelWidth = 180; // Breite der Kanalspalte in Pixeln

    // Environment-Initialisierung (Standardwerte bis echte Werte empfangen werden)
    this.envSnifferCardWidth = 800; // Realistischer Standardwert
    this.envSnifferCardHeight = 600;
    this.envSnifferIsDesktop = true;
    this.envSnifferIsMobile = false;
    this.envSnifferIsHorizontal = true;
    this.envSnifferIsVertical = false;
    this.envSnifferIsTouchscreen = false;
    this.envSnifferScreenWidth = 1920;
    this.envSnifferScreenHeight = 1080;
    this.envSnifferTypeOfView = 'tile';

    // ===== MANAGER-INSTANZEN =====
    // Hinweis: Instanziierung erfolgt in firstUpdated(), um Upgrades zu vermeiden
    this.updateManager = null;
    this.scrollManager = null;
    this.scaleManager = null;
    this.channelManager = null;
    this.dataManager = null;
    this.renderManager = null;
  }

  /**
   * Getter für die Container-Breite aus dem env-sniffer
   */
  get containerWidth() {
    // Verwende die envSnifferCardWidth Property direkt
    return this.envSnifferCardWidth || 1999;
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    // Debug: Zeige scale-Änderungen
    if (changedProperties.has('scale')) {
      this._debug('EpgBox: scale geändert', {
        oldScale: changedProperties.get('scale'),
        newScale: this.scale,
        scaleType: typeof this.scale,
      });
    }

    // Prüfe ob ScaleManager verfügbar ist
    if (this.scaleManager) {
      this._debug('EpgBox: ScaleManager verfügbar', {
        scale: this.scale,
        containerWidth: this.containerWidth,
        channelWidth: this.channelWidth,
      });
    } else {
      this._debug('EpgBox: ScaleManager nicht verfügbar');
    }

    // Ignoriere leere Property-Änderungen
    if (changedProperties.size === 0) {
      return;
    }

    this.updateManager.handleUpdate(changedProperties);

    // ===== REPEAT-DIREKTIVE OPTIMIERUNGEN =====

    if (changedProperties.has('channelOrder')) {
      this._channelOrderInitialized = false;
    }

    // Aktualisiere das flache Array, wenn sich _sortedChannels ändert
    if (changedProperties.has('_sortedChannels')) {
      // Mit repeat-Direktive ist requestUpdate() nicht mehr nötig
    }

    // ===== ZEIT-UPDATES (über DataManager) =====
    if (this._isTimeRelevant(changedProperties)) {
      // this.dataManager.updateTimeParameters();
    }

    // ===== SCALE-UPDATES (über ScaleManager) =====
    if (this._isScaleRelevant(changedProperties)) {
      this._debug('EpgBox: Scale-relevante Änderungen erkannt', {
        changedProperties: Array.from(changedProperties.keys()),
        scale: this.scale,
      });
      this.scaleManager.calculateScale();

      // Benachrichtige epg-view über Scale-Änderung
      this.dispatchEvent(
        new CustomEvent('scale-changed', {
          detail: { value: this.scale },
          bubbles: true,
          composed: true,
        })
      );
    }

    // ===== CHANNEL-WIDTH UPDATES =====
    if (changedProperties.has('channelWidth')) {
      // Setze CSS-Variable für horizontale Scrollbar
      this.style.setProperty('--epg-channel-width', `${this.channelWidth}px`);
    }

    // ===== KANAL-UPDATES (über DataManager) =====
    if (this._isChannelRelevant(changedProperties)) {
      // Mit repeat-Direktive werden Kanal-Updates automatisch gehandhabt
    }

    // ===== SCROLLING NACH PROGRAMM-ÄNDERUNGEN =====
    if (
      changedProperties.has('_sortedChannels') ||
      changedProperties.has('earliestProgramStart') ||
      changedProperties.has('latestProgramStop')
    ) {
      this._debug('EpgBox: Scrolling-Trigger erkannt', {
        hasSortedChannels: changedProperties.has('_sortedChannels'),
        hasEarliestProgramStart: changedProperties.has('earliestProgramStart'),
        hasLatestProgramStop: changedProperties.has('latestProgramStop'),
        earliestProgramStart: this.earliestProgramStart,
        latestProgramStop: this.latestProgramStop,
        sortedChannelsLength: this._sortedChannels?.length,
      });

      // Führe Scrolling nach Programm-Änderungen aus
      this.renderManager.scrollProgramBox();
    }

    // Prüfe epgBackview Validierung
    if (
      changedProperties.has('epgBackview') ||
      changedProperties.has('epgPastTime') ||
      changedProperties.has('epgShowWidth')
    ) {
      //this.scaleManager.validateEpgBackview();
    }

    // Verringere isChannelUpdate nach erfolgreichem Update
    if (this.isChannelUpdate > 0) {
      // Mit repeat-Direktive sind manuelle Gap-Updates nicht mehr nötig
      // this.renderManager.updateGapItems();

      this.isChannelUpdate--;
      this._debug('EpgBox: Update abgeschlossen, isChannelUpdate verringert', {
        neuerWert: this.isChannelUpdate,
        isFirstLoad: this.isFirstLoad,
      });

      // Rufe testIsFirstLoadCompleteUpdated auf, wenn ein Teil-EPG fertig angezeigt wird
      this.testIsFirstLoadCompleteUpdated();
    }
  }

  /**
   * Hilfsmethode für Scale-relevante Änderungen
   */
  _isScaleRelevant(changedProperties) {
    const scaleRelevantProps = ['epgShowFutureTime', 'epgShowPastTime', 'epgShowWidth'];
    return scaleRelevantProps.some(prop => changedProperties.has(prop));
  }

  /**
   * Hilfsmethode für Zeit-relevante Änderungen
   */
  _isTimeRelevant(changedProperties) {
    const timeRelevantProps = ['epgPastTime', 'epgShowFutureTime'];
    return timeRelevantProps.some(prop => changedProperties.has(prop));
  }

  /**
   * Hilfsmethode für Kanal-relevante Änderungen
   */
  _isChannelRelevant(changedProperties) {
    const channelRelevantProps = ['showChannel', 'showChannelGroups', 'selectedChannel'];
    return channelRelevantProps.some(prop => changedProperties.has(prop));
  }

  testIsFirstLoadCompleteUpdated() {
    this._debug('EpgBox: testIsFirstLoadCompleteUpdated aufgerufen', {
      isFirstLoad: this.isFirstLoad,
      isChannelUpdate: this.isChannelUpdate,
    });

    // Wenn isFirstLoad == 1 && isChannelUpdate == 0 dann isFirstLoad = 2
    if (this.isFirstLoad === 1 && this.isChannelUpdate === 0) {
      this.isFirstLoad = 2;
      this._debug('EpgBox: testIsFirstLoadCompleteUpdated - isFirstLoad auf 2 gesetzt', {
        isFirstLoad: this.isFirstLoad,
        isChannelUpdate: this.isChannelUpdate,
      });

      // Sende Event, dass der erste Load abgeschlossen ist
      this.dispatchEvent(
        new CustomEvent('epg-first-load-complete', {
          detail: {
            isFirstLoad: this.isFirstLoad,
            isChannelUpdate: this.isChannelUpdate,
            channelCount: this._sortedChannels.length,
          },
          bubbles: true,
          composed: true,
        })
      );
    }

    this._debug('EpgBox: testIsFirstLoadCompleteUpdated - Status', {
      isFirstLoad: this.isFirstLoad,
      isChannelUpdate: this.isChannelUpdate,
    });
  }

  firstUpdated() {
    super.firstUpdated();

    // Manager jetzt instanziieren (nachdem das Element vollständig konstruiert ist)
    if (!this.updateManager) this.updateManager = new EpgUpdateManager(this);
    if (!this.scrollManager) this.scrollManager = new EpgScrollManager(this);
    if (!this.scaleManager) this.scaleManager = new EpgScaleManager(this);
    if (!this.channelManager) this.channelManager = new EpgChannelManager(this);
    if (!this.dataManager) this.dataManager = new EpgDataManager(this);
    if (!this.renderManager) this.renderManager = new EpgRenderManager(this);

    // Speichere DOM-Referenzen für einfacheren Zugriff
    this.programBox = this.shadowRoot?.querySelector('.programBox');
    this.channelBox = this.shadowRoot?.querySelector('.channelBox');
    this.scrollbarX = this.shadowRoot?.querySelector('.scrollbarx');

    this._debug('EpgBox: DOM-Referenzen gesetzt', {
      programBox: !!this.programBox,
      channelBox: !!this.channelBox,
      scrollbarX: !!this.scrollbarX,
    });

    // Debug: Zeige Werte vor Scale-Berechnung
    this._debug('EpgBox: Werte vor Scale-Berechnung', {
      scale: this.scale,
      containerWidth: this.containerWidth,
      channelWidth: this.channelWidth,
      envSnifferCardWidth: this.envSnifferCardWidth,
      epgShowFutureTime: this.epgShowFutureTime,
      epgShowPastTime: this.epgShowPastTime,
      epgShowWidth: this.epgShowWidth,
    });

    // Berechne Scale beim ersten Laden
    this.scaleManager.calculateScale();
    this._debug('EpgBox: Scale beim ersten Laden berechnet', {
      scale: this.scale,
      containerWidth: this.containerWidth,
      channelWidth: this.channelWidth,
    });

    // DEBUG: Dummy-Daten werden jetzt über EPGView._loadData() geladen
    // this._loadDummyDataForDebug();

    // Einrichten der Scroll-Synchronisation
    // this.scrollManager.setupScrollSync();

    // Event-Listener für horizontale Scrollbar
    // if (this.programBox) {
    //   this.programBox.addEventListener('scroll', this._onProgramBoxScroll.bind(this));
    // }

    // Setze initiale CSS-Variable für horizontale Scrollbar
    this.style.setProperty('--epg-channel-width', `${this.channelWidth}px`);

    // Registriere bei CardImpl für Umgebungsänderungen
    // this._registerForEnvironmentUpdates();

    // Event-Listener für Environment-Änderungen
    // this.addEventListener('environment-changed', this._handleEnvironmentChanged.bind(this));

    // Registriere als Environment Observer bei CardImpl
    // Registriere mich automatisch für View-Änderungen
    this.dispatchEvent(
      new CustomEvent('registerMeForChanges', {
        bubbles: true,
        composed: true,
        detail: {
          component: this,
          callback: this._handleChangeNotifys.bind(this),
          eventType: 'envChanges,viewChanges,progScrollX',
          immediately: true,
        },
      })
    );

    // this.dispatchEvent(
    //   new CustomEvent('register-observer-client', {
    //     bubbles: true,
    //     composed: true,
    //     detail: {
    //       client: this,
    //     },
    //   })
    // );

    // // Prüfe, ob env bereits gesetzt ist, falls nicht, stößt den EnvSniffer an
    // if (!this.env || !this.env.cardWidth) {
    //   this._debug('EpgBox: env nicht gesetzt, stößt EnvSniffer an');
    //   // Dispatch ein Event, um den EnvSniffer anzustoßen
    //   this.dispatchEvent(
    //     new CustomEvent('request-environment', {
    //       bubbles: true,
    //       composed: true,
    //     })
    //   );
    // }

    this._debug('EpgBox: firstUpdated abgeschlossen', {
      containerWidth: this.containerWidth,
      scale: this.scale,
      envSnifferCardWidth: this.envSnifferCardWidth,
      envSnifferCardHeight: this.envSnifferCardHeight,
    });
    this.scrollbarX.addEventListener('scroll', this._onScrollbarScroll.bind(this));
    this.dispatchEvent(
      new CustomEvent('epg-box-ready', {
        bubbles: true,
        composed: true,
        detail: {
          client: this,
        },
      })
    );

  }

  /**
   * Scroll-Event-Handler mit Debouncing
   */
  _onScrollbarScroll(event) {
    // Hole das programBox Div-Element
    if (!this.scrollbarX) {
      this._debug('EpgBox: scrollbarX Element nicht gefunden');
      return;
    }
    this._debug('EpgBox: scrollbarX scroll event triggered');
    // Prüfe ob es sich um horizontales Scrollen handelt
    const isHorizontalScroll = !this.scrollbarX.scrollLeft !== this.lastScrollLeft;

    // Speichere aktuelle Scroll-Position für nächsten Vergleich
    this.lastScrollLeft = this.scrollbarX.scrollLeft;

    // Verarbeite nur horizontales Scrollen
    if (isHorizontalScroll) {
      // Speichere Event-Daten für requestAnimationFrame
      const eventData = {
        scrollLeft: this.scrollbarX.scrollLeft,
        eventTarget: event.currentTarget,
        eventType: event.type,
        timeStamp: event.timeStamp,
        scrollLeftSeconds: this.scrollbarX.scrollLeft / this.scale,
      };
      this.scrollPositionSeconds = eventData.scrollLeftSeconds;

      // Debouncing: Lösche vorherigen Timer falls vorhanden
      if (this.scrollAnimationFrame) {
        cancelAnimationFrame(this.scrollAnimationFrame);
      }

      // Setze neuen Timer für debounced Event
      this.scrollAnimationFrame = requestAnimationFrame(() => {
        this._debug('EPG-Box: Horizontal scroll event (debounced)', {
          scrollLeft: eventData.scrollLeft,
          eventTarget: eventData.eventTarget,
          eventType: eventData.eventType,
          timeStamp: eventData.timeStamp,
        });

        this.dispatchEvent(
          new CustomEvent('progscrollx-event', {
            bubbles: true,
            composed: true,
            detail: {
              scrollLeft: eventData.scrollLeft,
              scrollLeftSeconds: eventData.scrollLeftSeconds,
              component: this,
            },
          })
        );

        // Timer zurücksetzen
        this.scrollAnimationFrame = null;
      });
    }
  }

  /**
   * Behandelt Environment-Änderungen über Events
   */
  _handleChangeNotifys(eventdata) {
    this._debug('_handleEnvironmentChanged(): Environment-Änderung/Update empfangen', {
      eventdata,
    });

    // Durchlaufe alle Keys in eventdata
    for (const eventType of Object.keys(eventdata)) {
      if (eventType === 'envchanges') {
        const { oldState, newState } = eventdata[eventType];
        this._debug('_handleEnvironmentChanged(): Environment-Änderung/Update empfangen', {
          oldState,
          newState,
          newStateKeys: newState ? Object.keys(newState) : [],
          currentEnvSnifferCardWidth: this.envSnifferCardWidth,
          newCardWidth: newState?.envSnifferCardWidth,
        });

        // Aktualisiere Environment-Properties dynamisch
        if (newState) {
          const oldCardWidth = this.envSnifferCardWidth;

          // Durchlaufe alle Keys von newState und aktualisiere entsprechende Properties
          for (const [key, value] of Object.entries(newState)) {
            if (this.hasOwnProperty(key)) {
              this[key] = value;
            }
          }

          this._debug('_handleEnvironmentChanged(): Properties aktualisiert', {
            oldCardWidth,
            newCardWidth: this.envSnifferCardWidth,
            cardHeight: this.envSnifferCardHeight,
            updatedKeys: Object.keys(newState),
          });

          // Berechne Scale neu nach Environment-Änderungen
          this.scaleManager.calculateScale();
          this._debug('_handleEnvironmentChanged(): Scale nach Environment-Änderung berechnet', {
            scale: this.scale,
            containerWidth: this.containerWidth,
            channelWidth: this.channelWidth,
          });
        }

        // Benachrichtige UpdateManager über env-Änderung
        this.updateManager.handleUpdate(new Map([['env', newState]]));
      } else if (eventType === 'viewchanges') {
        // Verarbeitung für viewChanges
        this._handleViewChanges(eventdata[eventType]);
      } else if (eventType === 'progscrollx') {
        // Verarbeitung für progScrollX - Scrollbar-Position setzen
        this._handleProgScrollX(eventdata[eventType]);
      }
    }
  }

  /**
   * Behandelt View-Änderungen
   * @param {Object} data - View-Änderungsdaten
   */
  _handleViewChanges(data) {
    this._debug('_handleViewChanges(): View-Änderungen empfangen', { data });
    // Hier können View-spezifische Änderungen verarbeitet werden
    if (data && data.earliestProgramStart !== undefined && data.latestProgramStop !== undefined) {
      const scrollBarX = this.shadowRoot?.querySelector('.scrollbarx');
      if (scrollBarX) {
        scrollBarX.style.setProperty(
          '--scrollerWidth',
          `${(data.latestProgramStop - data.earliestProgramStart) * this.scale}px`
        );
        this._debug('_handleViewChanges(): Scrollbar-Breite aktualisiert', {
          earliestProgramStart: data.earliestProgramStart,
          latestProgramStop: data.latestProgramStop,
          scrollerWidth: (data.latestProgramStop - data.earliestProgramStart) * this.scale,
        });
      } else {
        this._debug(
          '_handleViewChanges(): scrollBarX Element nicht gefunden, überspringe Style-Update'
        );
      }
    }
  }

  /**
   * Behandelt Program-Scroll-X Events
   * @param {Object} data - Scroll-Daten
   */
  _handleProgScrollX(data) {
    this._debug('_handleProgScrollX(): Program-Scroll-X Event empfangen', { data });

    if (data && typeof data.scrollLeft === 'number') {
      this.scrollbarX.scrollLeft = data.scrollLeft;
      // Speichere die Scroll-Position für später

      this._debug('_handleProgScrollX(): Scroll-Position gespeichert', {
        scrollLeft: data.scrollLeft,
      });
    }
  }

  static styles = [
    super.styles,
    css`
    :host {
        display: flex;
        flex-direction: row;
      width: 100%;
        height: 100%; /* Feste Höhe für Scrollbalken */
        overflow: hidden; /* Versteckt Overflow, damit ProgramBox scrollen kann */
      position: relative;
    }

      .timeBar {
        width: 100%;
        height: 40px;
        flex-shrink: 0;
    }

    .channelBox {
        border-right: 1px solid var(--epg-border-color);
      margin: 0; /* Keine äußeren Abstände */
      padding: 0; /* Keine inneren Abstände */
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
        /* Die Breite wird dynamisch über einen Inline-Style gesetzt */
        align-items: stretch; /* Verhindert Verteilung über Höhe */
        justify-content: flex-start; /* Startet oben */
        height: fit-content; /* Höhe passt sich an Inhalt an */
        max-height: none; /* Keine Höhenbegrenzung */
    }

    .programBox {
      flex: 1;
      overflow-x: auto;
        overflow-y: auto;
      margin: 0; /* Keine äußeren Abstände */
      padding: 0; /* Keine inneren Abstände */
      display: flex;
      flex-direction: column;
        height: 100%; /* Feste Höhe für Scrollbalken */
        min-width: 0; /* Erlaubt Schrumpfen */
        position: relative; /* Für absolute Positionierung des TimeMarkers */
    }

    .programRow {
      display: flex;
        flex-direction: row; /* Explizit horizontal anordnen */
        align-items: stretch; /* Items nehmen volle Höhe ein */
        justify-content: flex-start; /* Items am Anfang ausrichten */
        border-bottom: none; /* Kein Border */
      margin: 0; /* Keine äußeren Abstände */
      padding: 0; /* Keine inneren Abstände */
      flex-shrink: 0;
        flex-grow: 0; /* Verhindert Wachsen */
        /* Höhenklassen werden über epg-row-height angewendet */
        height: calc(
          var(--epg-row-height) + var(--has-time) + var(--has-duration) + var(--has-description) +
            var(--has-shorttext)
        );
        min-width: 100%; /* Mindestens so breit wie die sichtbare Box */
        width: fit-content; /* Wächst mit dem Inhalt */
      }

      /* Alternierende Farben für Programm-Items in Zeilen */
      .programRow:nth-child(odd) epg-program-item:nth-child(even) {
        background-color: var(--epg-odd-program-even-bg);
        color: var(--epg-odd-program-even-text);
      }

      .programRow:nth-child(odd) epg-program-item:nth-child(odd) {
        background-color: var(--epg-odd-program-odd-bg);
        color: var(--epg-odd-program-odd-text);
      }

      .programRow:nth-child(even) epg-program-item:nth-child(even) {
        background-color: var(--epg-even-program-even-bg);
        color: var(--epg-even-program-even-text);
      }

      .programRow:nth-child(even) epg-program-item:nth-child(odd) {
        background-color: var(--epg-even-program-odd-bg);
        color: var(--epg-even-program-odd-text);
      }

      /* Current-Zustand überschreibt alle anderen Farben */
      epg-program-item.current {
        background-color: var(--epg-accent) !important;
        color: var(--epg-text-color) !important;
      }

      /* Hover-Zustand */
      epg-program-item:hover {
        background-color: var(--epg-hover-bg) !important;
        color: var(--epg-text-color) !important;
    }

    .channelGroup {
        padding: 4px var(--epg-padding);
        background-color: var(--epg-header-bg);
        color: var(--epg-text-color);
      font-weight: bold;
      display: flex;
      align-items: center;
      margin: 0; /* Keine äußeren Abstände */
      flex-shrink: 0; /* Verhindert Schrumpfen */
        height: var(--epg-row-height);
        box-sizing: border-box;
      }

      /* Gruppen-Header Styles */
      .group-header {
        background-color: var(--epg-header-bg);
        color: var(--epg-text-color);
        font-weight: bold;
        border: 2px solid var(--epg-accent);
        border-radius: var(--epg-radius);
        margin: 0; /* Keine Margins, damit Höhe gleich bleibt */
        height: calc(
          var(--epg-row-height) + var(--has-time) + var(--has-duration) + var(--has-description) +
            var(--has-shorttext)
        ); /* Gleiche Höhe wie normale Kanäle */
        box-sizing: border-box;
      }

      .group-header-content {
        background-color: var(--epg-header-bg) !important;
        color: var(--epg-text-color) !important;
        font-weight: bold;
        text-align: center;
        justify-content: center;
        border: none !important;
        padding: var(--epg-padding);
        font-size: 1.1em;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        height: 100%; /* Volle Höhe des Containers */
        box-sizing: border-box;
      }

      /* Gruppen-Header überschreibt die abwechselnden Farben */
      .group-header:nth-child(odd) .channelRowContent,
      .group-header:nth-child(even) .channelRowContent {
        background-color: var(--epg-header-bg) !important;
        color: var(--epg-text-color) !important;
      }

      .group-header:nth-child(odd) .programRowContent,
      .group-header:nth-child(even) .programRowContent {
        background-color: var(--epg-header-bg) !important;
        color: var(--epg-text-color) !important;
    }

    .channelRow {
        padding: 0; /* Kein Padding */
        border: none; /* Kein Border auf der Row selbst */
      cursor: pointer;
      display: flex;
      align-items: center;
      margin: 0; /* Keine äußeren Abstände */
      flex-shrink: 0; /* Verhindert Schrumpfen */
        flex-grow: 0; /* Verhindert Wachsen */
        /* Höhenklassen werden über epg-row-height angewendet */
        height: calc(
          var(--epg-row-height) + var(--has-time) + var(--has-duration) + var(--has-description) +
            var(--has-shorttext)
        );
        box-sizing: border-box;
      }

      .channelRow:nth-child(odd) .channelRowContent {
        background-color: var(--epg-odd-channel-bg);
        color: var(--epg-odd-channel-text);
      }

      .channelRow:nth-child(even) .channelRowContent {
        background-color: var(--epg-even-channel-bg);
        color: var(--epg-even-channel-text);
      }

      .channelRowContent {
        padding: var(--epg-padding);
        border: 1px solid var(--epg-border-color);
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        border-radius: var(--epg-radius);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-height: 100%;
      }

      .programRowContent {
        padding: var(--epg-padding);
        border: 1px solid var(--epg-border-color);
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        border-radius: var(--epg-radius);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-height: 100%;
      }

      /* Selected-Zustand überschreibt die abwechselnden Farben */
      .channelRow.selected .channelRowContent {
        background-color: var(--epg-accent);
        color: var(--epg-text-color);
    }

    .programSlot {
        padding: var(--epg-padding);
        border: 1px solid var(--epg-border-color);
      margin: 4px;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .programSlot:hover {
        background-color: var(--epg-hover-bg);
    }

    .programSlot.current {
        background-color: var(--epg-accent);
        color: var(--epg-text-color);
    }

    .programTitle {
      font-weight: bold;
      margin-bottom: 4px;
    }

    .programTime {
      font-size: 0.8em;
        color: var(--epg-time-color);
    }

    .programDescription {
      font-size: 0.8em;
        color: var(--epg-description-color);
      margin-top: 4px;
      }

      .loading {
      display: flex;
      justify-content: center;
        align-items: center;
        height: 200px;
        color: var(--epg-text-color);
    }

      .error {
      display: flex;
        justify-content: center;
      align-items: center;
        height: 200px;
        color: #f44336;
      }

      .noPrograms {
        display: flex;
      justify-content: center;
        align-items: center;
        padding: var(--epg-padding);
        color: var(--epg-text-color);
        font-style: italic;
        /* Höhenklassen werden über epg-row-height angewendet */
        height: calc(
          var(--epg-row-height) + var(--has-time) + var(--has-duration) + var(--has-description) +
            var(--has-shorttext)
        );
        box-sizing: border-box;
      }

      /* DEBUG: Hintergrundfarben für verschiedene Elemente */
      .programBox {
        background-color: #ff0000 !important;
        /* Scrollbar-Anzeige unterdrücken */
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE/Edge */
      }

      /* Chrome/Safari Scrollbar verstecken */
      .programBox::-webkit-scrollbar {
        display: none;
      }

      epg-program-item.type-startgap {
        background-color: #0000ff !important;
        color: white !important;
      }

      epg-program-item.type-endgap {
        background-color: #ffff00 !important;
        color: black !important;
      }

      epg-program-item.type-noprogram {
        background-color: #ff8800 !important;
        color: white !important;
      }

      /* Horizontale Scrollbar */
      .scrollbarx {
        position: absolute;
        bottom: 0;
        left: var(--epg-channel-width, 200px);
        right: 0;
        height: 15px;
        background-color: transparent;
        cursor: pointer;
        --scrollerWidth: 0px;
        overflow-x: auto;
      }

      .scrollbarx:hover {
        height: 20px;
        background-color: rgba(128, 128, 128, 0.1);
      }
      .scrollbarx:hover .scrollbarx-scroller {
        height: 1px;
        background-color: transparent;
      }

      .scrollbarx .scrollbarx-scroller {
        width: var(--scrollerWidth, 0px);
        height: 1px;
        background-color: transparent;
        display: block;
      }
    `,
  ];

  render() {
    // Generiere das flache Array, falls noch nicht geschehen
    if (this._flatChannels.length === 0 && this._sortedChannels.length > 0) {
      this.channelManager.updateFlatChannels();
    }

    // Verwende die optimierte renderWithRepeat-Methode
    return this.renderWithRepeat();
  }

  /**
   * Alternative render-Methode mit repeat-Direktive (viel einfacher!)
   * Diese Version würde automatisch alle DOM-Updates handhaben
   */
  renderWithRepeat() {
    this._debug('EpgBox: renderWithRepeat() aufgerufen', {
      scale: this.scale,
      scaleType: typeof this.scale,
      flatChannelsLength: this._flatChannels.length,
      containerWidth: this.containerWidth,
      channelWidth: this.channelWidth,
    });

    return html`
      <!-- Channel-Box -->
      <div
        class="channelBox"
        style="flex-basis: ${this.channelWidth}px; width: ${this.channelWidth}px;"
      >
        <!-- Channel-Inhalte mit repeat -->
        ${this._flatChannels.length > 0
          ? repeat(
              this._flatChannels,
              item => item.id || `header-${item.name}`, // Key-Funktion für Kanäle und Headers
              (item, index) => this.renderChannelItem(item, index)
            )
          : html`<div class="loading">Kanäle werden geladen...</div>`}
      </div>

      <!-- Program-Box -->
      <!-- <div class="programBox"> -->
      <epg-program-box
        class="programBox"
        .epgBox=${this}
        .programs=${this.programs}
                          .scale=${this.scale}
        .containerWidth=${this.containerWidth}
        .channelWidth=${this.channelWidth}
        .env=${this.env}
        .earliestProgramStart=${this.earliestProgramStart}
        .latestProgramStop=${this.latestProgramStop}
        .showChannelGroups=${this.showChannelGroups}
        .showShortText=${this.showShortText}
                          .showTime=${this.showTime}
                          .showDuration=${this.showDuration}
                          .showDescription=${this.showDescription}
        ._sortedChannels=${this._sortedChannels}
        ._flatChannels=${this._flatChannels}
        ._channelGroups=${this._channelGroups}
        ._channelsParameters=${this._channelsParameters}
        ._channelOrderInitialized=${this._channelOrderInitialized}
        .isFirstLoad=${this.isFirstLoad}
        .isChannelUpdate=${this.isChannelUpdate}
        .epgFutureTime=${this.epgFutureTime}
        ._onChannelSelected=${this._onChannelSelected.bind(this)}
        ._onProgramSelected=${this._onProgramSelected.bind(this)}
      >
      </epg-program-box>
      <!-- </div> -->

      <!-- Horizontale Scrollbar -->
      <div class="scrollbarx">
        <div class="scrollbarx-scroller"></div>
      </div>
    `;
  }

  /**
   * Rendert ein einzelnes Channel-Item (Kanal oder Gruppen-Header)
   */
  renderChannelItem(item, index) {
    if (this.channelManager.isGroupHeader(item)) {
      // Gruppen-Header als epg-program-item
    return html`
        <epg-program-item
          id="group-channel-${item.name}"
          .type=${'group'}
          .start=${this._channelsParameters?.minTime || 0}
          .stop=${this._channelsParameters?.maxTime || 0}
          .title=${item.name}
        ></epg-program-item>
      `;
    } else {
      // Normaler Kanal
      return html`
        <div class="channelRow epg-row-height">
          <div class="channelRowContent">${item.channeldata?.name || item.name}</div>
      </div>
    `;
  }
  }

  /**
   * Rendert ein einzelnes Program-Item (Kanal oder Gruppen-Header)
   */
  renderProgramItem(item, index) {
    if (this.channelManager.isGroupHeader(item)) {
      // Gruppen-Header als epg-program-item
      return html`
        <epg-program-item
          id="group-${item.name}"
          .type=${'group'}
          .start=${this._channelsParameters?.minTime || 0}
          .stop=${this._channelsParameters?.maxTime || 0}
          .title=${item.name}
        ></epg-program-item>
      `;
    } else {
      // Normaler Kanal mit Programmen
      return this.renderManager.renderProgramRow(item, index);
    }
  }

  _onChannelSelected(channel) {
    this._debug('EpgBox: Verarbeite Kanal', {
      kanal: channel.channeldata?.name || channel.name,
      kanalId: channel.id,
      anzahlProgramme: channel.programs ? channel.programs.length : 0,
    });

    this.dispatchEvent(
      new CustomEvent('channel-selected', {
        detail: { channel },
        bubbles: true,
        composed: true,
      })
    );
  }

  _onProgramSelected(program) {
    this._debug('EpgBox: Programm ausgewählt', {
      programm: program.title,
      start: new Date(program.start * 1000).toISOString(),
    });

    this.dispatchEvent(
      new CustomEvent('program-selected', {
        detail: { program },
        bubbles: true,
        composed: true,
      })
    );
  }

  addTeilEpg(teilEpg) {
    // Setze isFirstLoad auf 1 beim ersten Teil-EPG
    if (this.isFirstLoad === 0) {
      this.isFirstLoad = 1;
      this._debug('EpgBox: isFirstLoad auf 1 gesetzt - erstes Teil-EPG geladen');
    }

    this.dataManager.addTeilEpg(teilEpg);
  }

  /**
   * Optimierte Methode: Aktualisiert nur die Programme eines Kanals
   * Für effiziente Updates mit der repeat-Direktive
   * @param {string} channelId - ID des Kanals
   * @param {Array} newPrograms - Neue Programme
   */
  updateChannelPrograms(channelId, newPrograms) {
    this._debug('EpgBox: Update Programme für Kanal (repeat-optimiert)', {
      channelId,
      anzahlProgramme: newPrograms.length,
    });

    // Verwende den DataManager für effiziente Updates
    const success = this.dataManager.updateChannelPrograms(channelId, newPrograms);

    if (success) {
      this._debug('EpgBox: Programme erfolgreich aktualisiert');
      // Mit repeat-Direktive ist requestUpdate() nicht mehr nötig
    }

    return success;
  }

  /**
   * Optimierte Methode: Fügt Programme zu einem Kanal hinzu
   * Für effiziente Updates mit der repeat-Direktive
   * @param {string} channelId - ID des Kanals
   * @param {Array} additionalPrograms - Zusätzliche Programme
   */
  addProgramsToChannel(channelId, additionalPrograms) {
    this._debug('EpgBox: Füge Programme zu Kanal hinzu (repeat-optimiert)', {
      channelId,
      anzahlProgramme: additionalPrograms.length,
    });

    // Verwende den DataManager für effiziente Updates
    const success = this.dataManager.addProgramsToChannel(channelId, additionalPrograms);

    if (success) {
      this._debug('EpgBox: Programme erfolgreich hinzugefügt');
      // Mit repeat-Direktive ist requestUpdate() nicht mehr nötig
    }

    return success;
  }

  /**
   * Optimierte Methode: Entfernt Programme aus einem Kanal
   * Für effiziente Updates mit der repeat-Direktive
   * @param {string} channelId - ID des Kanals
   * @param {Array} programStartTimes - Startzeiten der zu entfernenden Programme
   */
  removeProgramsFromChannel(channelId, programStartTimes) {
    this._debug('EpgBox: Entferne Programme von Kanal (repeat-optimiert)', {
      channelId,
      anzahlProgramme: programStartTimes.length,
    });

    // Verwende den DataManager für effiziente Updates
    const success = this.dataManager.removeProgramsFromChannel(channelId, programStartTimes);

    if (success) {
      this._debug('EpgBox: Programme erfolgreich entfernt');
      // Mit repeat-Direktive ist requestUpdate() nicht mehr nötig
    }

    return success;
  }

  /**
   * Optimierte Methode: Aktualisiert die Current-Zustände aller Programme
   * Für effiziente Updates mit der repeat-Direktive
   * @param {number} currentTime - Aktuelle Zeit für Current-Berechnung
   */
  updateAllCurrentStates(currentTime) {
    this._debug('EpgBox: Update Current-Zustände für alle Programme (repeat-optimiert)', {
      currentTime: new Date(currentTime * 1000).toISOString(),
    });

    // Verwende den DataManager für effiziente Updates
    const updated = this.dataManager.updateAllCurrentStates(currentTime);

    if (updated) {
      this._debug('EpgBox: Current-Zustände erfolgreich aktualisiert');
      // Mit repeat-Direktive ist requestUpdate() nicht mehr nötig
    }

    return updated;
  }

  /**
   * Optimierte Methode: Bereinigt alte Programme außerhalb des sichtbaren Zeitfensters
   * Für bessere Performance mit der repeat-Direktive
   */
  cleanupOldPrograms() {
    this._debug('EpgBox: Bereinige alte Programme (repeat-optimiert)');

    // Verwende den DataManager für effiziente Bereinigung
    const cleanedChannels = this.dataManager.cleanupOldPrograms();

    if (cleanedChannels > 0) {
      this._debug('EpgBox: Bereinigung abgeschlossen', {
        bereinigteKanäle: cleanedChannels,
      });
      // Mit repeat-Direktive ist requestUpdate() nicht mehr nötig
    }

    return cleanedChannels;
  }

  /**
   * Optimierte Methode: Aktualisiert die Zeit-Parameter
   * Für effiziente Updates mit der repeat-Direktive
   */
  updateTimeParameters() {
    this._debug('EpgBox: Update Zeit-Parameter (repeat-optimiert)');

    // Verwende den DataManager für effiziente Updates
    const timeSlots = this.dataManager.updateTimeParameters();

    this._debug('EpgBox: Zeit-Parameter erfolgreich aktualisiert', {
      minTime: this.dataManager.minTime,
      maxTime: this.dataManager.maxTime,
    });

    return timeSlots;
  }

  /**
   * Performance-Optimierung: Bereinigt das flache Array für bessere repeat-Direktive Performance
   * Entfernt leere Kanäle und optimiert die Struktur
   */
  optimizeFlatArray() {
    this._debug('EpgBox: Optimiere flaches Array für repeat-Direktive');

    if (!this._flatChannels || this._flatChannels.length === 0) {
      return 0;
    }

    let removedItems = 0;
    const optimizedArray = [];

    this._flatChannels.forEach(item => {
      if (this.channelManager.isGroupHeader(item)) {
        // Gruppen-Header immer behalten
        optimizedArray.push(item);
      } else if (item && item.id && (item.programs || item.channeldata)) {
        // Kanal mit Daten behalten
        optimizedArray.push(item);
      } else {
        // Leere oder ungültige Items entfernen
        removedItems++;
        this._debug('EpgBox: Entferne leeres Item', { item });
      }
    });

    if (removedItems > 0) {
      this._flatChannels = optimizedArray;
      this._debug('EpgBox: Flaches Array optimiert', {
        entfernteItems: removedItems,
        neueAnzahl: this._flatChannels.length,
      });
    }

    return removedItems;
  }

  /**
   * Performance-Optimierung: Aktualisiert nur die sichtbaren Programme
   * Für bessere Performance mit der repeat-Direktive
   */
  updateVisiblePrograms() {
    this._debug('EpgBox: Update nur sichtbare Programme (repeat-optimiert)');

    const { minTime, maxTime } = this.dataManager;
    let updatedChannels = 0;

    this._flatChannels.forEach(item => {
      if (!this.channelManager.isGroupHeader(item) && item.programs) {
        // Filtere Programme, die im sichtbaren Zeitfenster liegen
        const visiblePrograms = item.programs.filter(program => {
          const programStart = program.start;
          const programEnd = program.end || program.stop || programStart + 3600;
          return programStart < maxTime && programEnd > minTime;
        });

        // Aktualisiere nur, wenn sich die Anzahl geändert hat
        if (visiblePrograms.length !== item.programs.length) {
          item.programs = visiblePrograms;
          updatedChannels++;
        }
      }
    });

    if (updatedChannels > 0) {
      this._debug('EpgBox: Sichtbare Programme aktualisiert', {
        aktualisierteKanäle: updatedChannels,
      });
    }

    return updatedChannels;
  }

  /**
   * Performance-Überwachung: Überwacht die Effizienz der repeat-Direktive
   * Gibt Statistiken über die Performance der Updates aus
   */
  getRepeatPerformanceStats() {
    const stats = {
      totalItems: this._flatChannels.length,
      groupHeaders: this._flatChannels.filter(item => this.channelManager.isGroupHeader(item))
        .length,
      channels: this._flatChannels.filter(item => !this.channelManager.isGroupHeader(item)).length,
      channelsWithPrograms: this._flatChannels.filter(
        item =>
          !this.channelManager.isGroupHeader(item) && item.programs && item.programs.length > 0
      ).length,
      totalPrograms: this._flatChannels.reduce((total, item) => {
        if (!this.channelManager.isGroupHeader(item) && item.programs) {
          return total + item.programs.length;
        }
        return total;
      }, 0),
      updateCount: this.isChannelUpdate,
      isFirstLoad: this.isFirstLoad,
    };

    this._debug('EpgBox: Repeat-Direktive Performance Statistiken', stats);
    return stats;
  }

  /**
   * Performance-Optimierung: Führt alle Performance-Optimierungen aus
   * Für maximale Effizienz der repeat-Direktive
   */
  performFullOptimization() {
    this._debug('EpgBox: Führe vollständige Performance-Optimierung aus');

    const results = {
      optimizedArray: this.optimizeFlatArray(),
      cleanedPrograms: this.cleanupOldPrograms(),
      updatedVisible: this.updateVisiblePrograms(),
      performanceStats: this.getRepeatPerformanceStats(),
    };

    this._debug('EpgBox: Vollständige Optimierung abgeschlossen', results);
    return results;
  }

  // ===== HORIZONTALE SCROLLBAR METHODEN =====

  /**
   * Berechnet die Breite des Scrollbar-Thumbs basierend auf dem sichtbaren Bereich
   */
  _getScrollbarThumbWidth() {
    if (!this.programBox) return 100;

    const scrollWidth = this.programBox.scrollWidth || 1000;
    const clientWidth = this.programBox.clientWidth || 800;

    // Thumb-Breite proportional zum sichtbaren Bereich
    const thumbWidth = Math.max(
      20,
      (clientWidth / scrollWidth) * (this.containerWidth - this.channelWidth)
    );
    return Math.min(thumbWidth, this.containerWidth - this.channelWidth - 20);
  }

  /**
   * Berechnet die Position des Scrollbar-Thumbs basierend auf der aktuellen Scroll-Position
   */
  _getScrollbarThumbLeft() {
    if (!this.programBox) return 0;

    const scrollLeft = this.programBox.scrollLeft || 0;
    const scrollWidth = this.programBox.scrollWidth || 1000;
    const clientWidth = this.programBox.clientWidth || 800;

    // Thumb-Position proportional zur Scroll-Position
    const maxScroll = scrollWidth - clientWidth;
    const maxThumbTravel = this.containerWidth - this.channelWidth - this._getScrollbarThumbWidth();

    if (maxScroll <= 0) return 0;
    return (scrollLeft / maxScroll) * maxThumbTravel;
  }

  /**
   * Event-Handler für Mausklick auf die Scrollbar
   */
  _onScrollbarMouseDown(event) {
    event.preventDefault();
    this._startScrollbarDrag(event.clientX, event.target);
  }

  /**
   * Event-Handler für Touch-Start auf die Scrollbar
   */
  _onScrollbarTouchStart(event) {
    event.preventDefault();
    const touch = event.touches[0];
    this._startScrollbarDrag(touch.clientX, event.target);
  }

  /**
   * Startet das Scrollbar-Dragging
   */
  _startScrollbarDrag(startX, targetElement) {
    if (!this.programBox || !targetElement) return;

    const scrollbarElement = targetElement.closest('.scrollbarx');
    if (!scrollbarElement) return;

    const scrollbarRect = scrollbarElement.getBoundingClientRect();
    const scrollbarLeft = scrollbarRect.left;
    const scrollbarWidth = scrollbarRect.width;
    const thumbWidth = this._getScrollbarThumbWidth();

    const onMouseMove = moveEvent => {
      const currentX = moveEvent.clientX;
      const relativeX = currentX - scrollbarLeft;
      const scrollRatio = Math.max(0, Math.min(1, relativeX / (scrollbarWidth - thumbWidth)));

      const maxScroll = this.programBox.scrollWidth - this.programBox.clientWidth;
      const newScrollLeft = scrollRatio * maxScroll;

      this.programBox.scrollLeft = newScrollLeft;
      this._updateScrollbarThumb();
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  /**
   * Aktualisiert die Position des Scrollbar-Thumbs
   */
  _updateScrollbarThumb() {
    const thumb = this.shadowRoot?.querySelector('.scrollbarx-thumb');
    if (thumb) {
      thumb.style.left = `${this._getScrollbarThumbLeft()}px`;
    }
  }

  /**
   * Event-Listener für Scroll-Events von der programBox
   */
  _onProgramBoxScroll() {
    this._updateScrollbarThumb();
  }

  /**
   * Aktualisiert den Record-Status aller Programme basierend auf Meta-Daten
   * @param {Object} records - Record-Daten von der Integration
   */
  updateRecordStatus(records) {
    this._debug('EpgBox: updateRecordStatus aufgerufen', {
      recordCount: records ? Object.keys(records).length : 0,
      records: records
    });

    if (!records || typeof records !== 'object') {
      this._debug('EpgBox: updateRecordStatus - Keine gültigen Record-Daten');
      return;
    }

    let updatedCount = 0;

    // Gehe durch alle Kanäle und Programme
    this._flatChannels.forEach(channel => {
      if (channel.programs && Array.isArray(channel.programs)) {
        channel.programs.forEach(program => {
          // Prüfe ob für dieses Programm ein Record existiert
          const programId = program.id;
          const channelId = program.channelId;
          
          // Suche nach Record basierend auf programId oder channelId + start/stop
          const recordKey = this._findRecordKey(records, program);
          
          if (recordKey && records[recordKey]) {
            const recordData = records[recordKey];
            const wasRecorded = program.record || false;
            const isRecorded = recordData.recorded || false;
            
            if (wasRecorded !== isRecorded) {
              program.record = isRecorded;
              updatedCount++;
              
              this._debug('EpgBox: Record-Status aktualisiert', {
                programId: programId,
                channelId: channelId,
                title: program.title,
                wasRecorded: wasRecorded,
                isRecorded: isRecorded,
                recordKey: recordKey
              });
            }
          }
        });
      }
    });

    if (updatedCount > 0) {
      this._debug('EpgBox: Record-Status Updates abgeschlossen', {
        updatedCount: updatedCount,
        totalRecords: Object.keys(records).length
      });
      
      // Trigger ein Update, damit Lit die Änderungen rendert
      this.requestUpdate();
    } else {
      this._debug('EpgBox: Keine Record-Status Änderungen');
    }
  }

  /**
   * Findet den passenden Record-Key für ein Programm
   * @param {Object} records - Record-Daten
   * @param {Object} program - Programm-Objekt
   * @returns {string|null} Record-Key oder null
   */
  _findRecordKey(records, program) {
    const programId = program.id;
    const channelId = program.channelId;
    const start = program.start;
    const stop = program.stop;

    // Versuche verschiedene Matching-Strategien
    const possibleKeys = [
      programId, // Direkte programId
      `${channelId}_${start}_${stop}`, // channelId + Zeit
      `${programId}_${start}`, // programId + start
    ];

    for (const key of possibleKeys) {
      if (records[key]) {
        return key;
      }
    }

    // Fallback: Suche nach programId in allen Keys
    for (const key of Object.keys(records)) {
      if (key.includes(programId) || records[key].programId === programId) {
        return key;
      }
    }

    return null;
  }
}

customElements.define('epg-box', EpgBox);
