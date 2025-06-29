import { html, css } from 'lit';
import { EpgElementBase } from './epg-element-base.js';
import './epg-program-item.js';
import './epg-time-marker.js';
import { EpgScrollManager } from './epg-scroll-manager.js';
import { EpgScaleManager } from './epg-scale-manager.js';
import { EpgChannelManager } from './epg-channel-manager.js';
import { EpgDataManager } from './epg-data-manager.js';
import { EpgRenderManager } from './epg-render-manager.js';
import { EpgUpdateManager } from './epg-update-manager.js';

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
    scale: { type: Number }, // Aktueller Scale-Faktor (wird von ScaleManager, TimeMarker, RenderManager verwendet)
    showShortText: { type: Boolean }, // Zeigt kurze Programmtexte an (wird von RenderManager verwendet)
    channelWidth: { type: Number }, // Breite der Kanalspalte in px (wird von RenderManager verwendet)
    env: { type: Object }, // Umgebungsinformationen vom EnvSniffer (wird von ScaleManager für Container-Breite verwendet)

    // ===== ZEIT-KONFIGURATION (wird von DataManager und ScaleManager verwendet) =====
    epgPastTime: { type: Number }, // Minuten in die Vergangenheit (wird für minTime-Berechnung verwendet)
    epgShowFutureTime: { type: Number }, // Minuten in die Zukunft (wird für maxTime-Berechnung verwendet)
    epgShowPastTime: { type: Number }, // Alternative zu epgPastTime (wird von ScaleManager verwendet)
    epgShowWidth: { type: Number }, // Breite der EPG-Anzeige (wird von ScaleManager verwendet)
    epgBackview: { type: Number }, // Backview-Position (wird von ScaleManager verwendet)
  };

  constructor() {
    super();

    // ===== ÜBERGREIFEND VERWENDETE VARIABLEN =====

    // Kanal-Management
    this._sortedChannels = []; // Array mit allen Kanälen in sortierter Reihenfolge (wird von allen Managern verwendet)
    this._channelOrderInitialized = false; // Flag: true wenn Kanal-Reihenfolge initialisiert wurde (ChannelManager)

    // Scale-Management (wird von ScaleManager, TimeMarker und RenderManager verwendet)
    this.scale = 1; // Aktueller Scale-Faktor für Zeit-zu-Pixel-Konvertierung

    // Zeit-Management (wird von DataManager, ScaleManager, TimeMarker verwendet)
    const now = Math.floor(Date.now() / 1000);
    const pastTime = this.epgPastTime || 30; // Minuten in die Vergangenheit
    const futureTime = this.epgShowFutureTime || 180; // Minuten in die Zukunft

    this._channelsParameters = {
      minTime: now - (pastTime * 60), // Früheste sichtbare Zeit (Unix-Timestamp)
      maxTime: now + (futureTime * 60), // Späteste sichtbare Zeit (Unix-Timestamp)
      earliestProgramStart: now, // Frühester Programmstart aller Kanäle (Unix-Timestamp)
    };

    // Container-Management (wird von ScaleManager und RenderManager verwendet)
    this._containerWidth = 1200; // Geschätzte Container-Breite (wird dynamisch aktualisiert)
    this._containerWidthMeasured = false; // Flag: true wenn Container-Breite gemessen wurde

    // Load-State-Management (wird von allen Managern für Status-Tracking verwendet)
    this.isFirstLoad = 0; // Load-Status: 0=initial, 1=loading, 2=complete
    this.isChannelUpdate = 0; // Counter für aktive Kanal-Updates (wird von DataManager erhöht/verringert)

    // UI-Konfiguration (wird von RenderManager verwendet)
    this.channelWidth = 180; // Breite der Kanalspalte in Pixeln

    // ===== MANAGER-INSTANZEN =====
    // Alle Manager haben Zugriff auf die obigen Variablen über this.epgBox

    this.scrollManager = new EpgScrollManager(this); // Verwaltet Scroll-Verhalten
    this.scaleManager = new EpgScaleManager(this); // Verwaltet Scale-Berechnung
    this.channelManager = new EpgChannelManager(this); // Verwaltet Kanal-Sortierung
    this.dataManager = new EpgDataManager(this); // Verwaltet EPG-Daten
    this.renderManager = new EpgRenderManager(this); // Verwaltet Rendering

    // ===== UPDATE MANAGER (ZENTRAL) =====
    // TODO: Schrittweise Migration - noch nicht aktiv verwendet
    this.updateManager = new EpgUpdateManager(this); // Verwaltet Update-Logik
  }

  /**
   * Getter für die Container-Breite aus dem env-sniffer
   */
  get containerWidth() {
    // Verwende das env Objekt, das direkt übergeben wurde
    if (this.env && this.env.cardWidth) {
      return this.env.cardWidth;
    }

    // Fallback auf Standard-Breite
    return 1200;
  }

  updated(changedProperties) {
    if (changedProperties.has('channelOrder')) {
      this._debug('channelOrder geändert');
      this._channelOrderInitialized = false;
      this.channelManager.initializeChannelOrder();
      this.requestUpdate();
    }

    // Wenn sich epgShowWidth ändert, aktualisiere den Scale
    if (changedProperties.has('epgShowWidth')) {
      this.scale = this.scaleManager.calculateScale();
      this.requestUpdate();
    }

    // Wenn sich env, epgShowFutureTime oder epgShowPastTime ändern, aktualisiere den Scale
    if (changedProperties.has('env') ||
        changedProperties.has('epgShowFutureTime') ||
        changedProperties.has('epgShowPastTime')) {
      this.scale = this.scaleManager.calculateScale();
      this.requestUpdate();
    }

    // Wenn sich epgPastTime oder epgShowFutureTime ändern, aktualisiere die Zeit-Parameter
    if (changedProperties.has('epgPastTime') || changedProperties.has('epgShowFutureTime')) {
      const now = Math.floor(Date.now() / 1000);
      const pastTime = this.epgPastTime || 30;
      const futureTime = this.epgShowFutureTime || 180;

      this._channelsParameters.minTime = now - (pastTime * 60);
      this._channelsParameters.maxTime = now + (futureTime * 60);

      this._debug('EpgBox: Zeit-Parameter aktualisiert', {
        minTime: this._channelsParameters.minTime,
        maxTime: this._channelsParameters.maxTime,
        epgPastTime: this.epgPastTime,
        epgShowFutureTime: this.epgShowFutureTime,
      });

      this.requestUpdate();
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
      // Aktualisiere alle Gap-Elemente mit dem neuen earliestProgramStart-Wert
      // nach dem DOM-Update, damit die Elemente bereits gerendert sind
      this.renderManager.updateGapItems();

      this.isChannelUpdate--;
      this._debug('EpgBox: Update abgeschlossen, isChannelUpdate verringert', {
        neuerWert: this.isChannelUpdate,
        isFirstLoad: this.isFirstLoad,
      });

      // Rufe testIsFirstLoadCompleteUpdated auf, wenn ein Teil-EPG fertig angezeigt wird
      this.testIsFirstLoadCompleteUpdated();
    }
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

    // // Scroll ProgramBox wenn isFirstLoad < 2
    // if (this.isFirstLoad < 2) {
    //   this.scrollManager.scrollToBackviewPosition();
    // }
  }

  firstUpdated() {
    super.firstUpdated();

    // Einrichten der Scroll-Synchronisation
    this.scrollManager.setupScrollSync();

    this._debug('EpgBox: firstUpdated abgeschlossen', {
      containerWidth: this.containerWidth,
      scale: this.scale,
    });
  }

  static styles = [
    super.styles,
    css`
      :host {
        display: flex;
        flex-direction: row;
        width: 100%;
        height: auto; /* Automatische Höhe basierend auf Inhalt */
        overflow: visible; /* Kein Scroll, damit Inhalte sichtbar sind */
        position: relative;
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
        margin: 0; /* Keine äußeren Abstände */
        padding: 0; /* Keine inneren Abstände */
        display: flex;
        flex-direction: column;
        height: auto; /* Automatische Höhe basierend auf Inhalt */
        max-height: none; /* Keine Höhenbegrenzung */
        min-width: 0; /* Erlaubt Schrumpfen */
      }

      .programRow {
        display: flex;
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
    `,
  ];

  render() {
    if (!this._sortedChannels.length) {
      return this.renderManager.renderLoading();
    }

    // Die Logik zur Auswahl des Render-Pfades (gruppiert vs. einfach)
    // ist jetzt direkt im Template. Wir bereiten hier keine flache Liste mehr vor.
    const channelsToRenderForSimpleMode = this._sortedChannels;

    this._debug('EpgBox: Render gestartet', {
      anzahlKanäle: this._sortedChannels.length,
      showChannelGroups: this.showChannelGroups,
      sortedChannelsCount: this._sortedChannels.length,
    });

    return html`
      <!-- Channel-Box -->
      <div
        class="channelBox"
        style="flex-basis: ${this.channelWidth}px; width: ${this.channelWidth}px;"
      >
        ${this.showChannelGroups && this._sortedChannels.length > 0
          ? this.renderManager.renderGroupedChannels(this._sortedChannels)
          : this.renderManager.renderSimpleChannels(channelsToRenderForSimpleMode)}
      </div>

      <!-- Program-Box -->
      <div class="programBox">
        <!-- Time Marker über den Programmen -->
        <epg-time-marker
          .scale=${this.scale}
          .minTime=${this.dataManager.minTime}
        ></epg-time-marker>

        ${this.showChannelGroups && this._sortedChannels.length > 0
          ? this.renderManager.renderGroupedPrograms(this._sortedChannels)
          : this.renderManager.renderSimplePrograms(channelsToRenderForSimpleMode)}
      </div>
    `;
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
    this.dataManager.addTeilEpg(teilEpg);
  }
}

customElements.define('epg-box', EpgBox);
