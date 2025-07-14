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
import { EpgTimeMarkerManager } from './epg-timemarker-manager.js';

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
    showTime: { type: Boolean }, // Zeigt Zeit an (wird von RenderManager verwendet)
    showDuration: { type: Boolean }, // Zeigt Dauer an (wird von RenderManager verwendet)
    showDescription: { type: Boolean }, // Zeigt Beschreibung an (wird von RenderManager verwendet)
    channelWidth: { type: Number }, // Breite der Kanalspalte in px (wird von RenderManager verwendet)
    env: { type: Object }, // Umgebungsinformationen vom EnvSniffer (wird von ScaleManager für Container-Breite verwendet)

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
      earliestProgramStart: Math.floor(Date.now() / 1000), // Aktuelle Zeit als Unix-Timestamp
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

    // ===== FLAT CHANNELS FÜR REPEAT =====
    this._flatChannels = []; // Flaches Array für repeat-Direktive
    this._channelGroups = []; // Gruppierungsinformationen
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
    // Ignoriere leere Property-Änderungen
    if (changedProperties.size === 0) {
      return;
    }

    this._debug('updated requested', { scale: this.scale, changedProperties });

    // ===== REPEAT-DIREKTIVE OPTIMIERUNGEN =====

    if (changedProperties.has('channelOrder')) {
      this._debug('channelOrder geändert');
      this._channelOrderInitialized = false;
      this.channelManager.initializeChannelOrder();
      // Mit repeat-Direktive ist requestUpdate() nicht mehr nötig
    }

    // Aktualisiere das flache Array, wenn sich _sortedChannels ändert
    if (changedProperties.has('_sortedChannels')) {
      this._debug('_sortedChannels geändert - aktualisiere flaches Array');
      this.channelManager.updateFlatChannels();
      // Mit repeat-Direktive ist requestUpdate() nicht mehr nötig
    }

    // ===== SCALE-UPDATES (über UpdateManager) =====
    if (this._isScaleRelevant(changedProperties)) {
      this._debug('EpgBox: Scale-relevante Änderung erkannt, leite an UpdateManager weiter');
      this.updateManager.handleUpdate('SCALE_UPDATE', changedProperties);
    }

    // ===== ZEIT-UPDATES (über DataManager) =====
    if (this._isTimeRelevant(changedProperties)) {
      this._debug('EpgBox: Zeit-relevante Änderung erkannt, leite an DataManager weiter');
      this.dataManager.updateTimeParameters();
    }

    // ===== KANAL-UPDATES (über DataManager) =====
    if (this._isChannelRelevant(changedProperties)) {
      this._debug('EpgBox: Kanal-relevante Änderung erkannt');
      // Mit repeat-Direktive werden Kanal-Updates automatisch gehandhabt
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
    const scaleRelevantProps = ['env', 'epgShowFutureTime', 'epgShowPastTime', 'epgShowWidth'];
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

    // // Scroll ProgramBox wenn isFirstLoad < 2
    // if (this.isFirstLoad < 2) {
    //   this.scrollManager.scrollToBackviewPosition();
    // }
  }

  firstUpdated() {
    super.firstUpdated();

    // Einrichten der Scroll-Synchronisation
    this.scrollManager.setupScrollSync();

    // Prüfe, ob env bereits gesetzt ist, falls nicht, stößt den EnvSniffer an
    if (!this.env || !this.env.cardWidth) {
      this._debug('EpgBox: env nicht gesetzt, stößt EnvSniffer an');
      // Dispatch ein Event, um den EnvSniffer anzustoßen
      this.dispatchEvent(
        new CustomEvent('request-environment', {
          bubbles: true,
          composed: true,
        })
      );
    }

    this._debug('EpgBox: firstUpdated abgeschlossen', {
      containerWidth: this.containerWidth,
      scale: this.scale,
      env: this.env,
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
    `,
  ];

  render() {
    // Generiere das flache Array, falls noch nicht geschehen
    if (this._flatChannels.length === 0 && this._sortedChannels.length > 0) {
      this.channelManager.updateFlatChannels();
    }

    // Verwende die optimierte renderWithRepeat-Methode
    this._debug('EpgBox: Render mit repeat-Direktive gestartet');
    return this.renderWithRepeat();
  }

  /**
   * Alternative render-Methode mit repeat-Direktive (viel einfacher!)
   * Diese Version würde automatisch alle DOM-Updates handhaben
   */
  renderWithRepeat() {
    this._debug('EpgBox: Render mit repeat-Direktive');

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
      <div class="programBox">
        <!-- Time Marker über den Programmen -->
        <epg-time-marker
          .scale=${this.scale}
          .minTime=${this.dataManager.minTime}
        ></epg-time-marker>

        <!-- Program-Inhalte mit repeat -->
        ${this._flatChannels.length > 0
          ? repeat(
              this._flatChannels,
              item => item.id || `header-${item.name}`, // Key-Funktion für Kanäle und Headers
              (item, index) => this.renderProgramItem(item, index)
            )
          : html`<div class="loading">Programme werden geladen...</div>`}
      </div>
    `;
  }

  /**
   * Rendert ein einzelnes Channel-Item (Kanal oder Gruppen-Header)
   */
  renderChannelItem(item, index) {
    if (this.channelManager.isGroupHeader(item)) {
      // Gruppen-Header
      return html`
        <div class="channelRow epg-row-height group-header">
          <div class="channelRowContent group-header-content">${item.name}</div>
        </div>
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
      // Gruppen-Header - leerer Bereich
      return html`
        <div class="programRow epg-row-height group-header">
          <div class="programRowContent group-header-content">
            <!-- Leerer Bereich für Gruppen-Header -->
          </div>
        </div>
      `;
    } else {
      // Normaler Kanal mit Programmen
      return this.renderManager.renderProgramRow(item, index);
    }
  }

  /**
   * Aktualisiert nur die Channel-Container-Inhalte ohne vollständige Re-Renderung
   * @deprecated Verwende stattdessen die repeat-Direktive - diese Methode ist nicht mehr nötig
   */
  updateChannelContainer() {
    this._debug(
      'EpgBox: WARNUNG - updateChannelContainer() ist deprecated! Verwende repeat-Direktive'
    );

    const channelContainer = this.shadowRoot?.querySelector('#channelContainer');
    if (!channelContainer) {
      this._debug('EpgBox: Channel-Container nicht gefunden');
      return;
    }

    this._debug('EpgBox: Aktualisiere Channel-Container', {
      anzahlKanäle: this._sortedChannels.length,
      showChannelGroups: this.showChannelGroups,
    });

    // Erstelle neuen Inhalt
    const newContent =
      this._sortedChannels.length > 0
        ? this.showChannelGroups
          ? this.renderManager.renderGroupedChannels(this._sortedChannels)
          : this.renderManager.renderSimpleChannels(this._sortedChannels)
        : html`<div class="loading">Kanäle werden geladen...</div>`;

    // Rendere Lit-Template korrekt
    render(newContent, channelContainer);
  }

  /**
   * Effiziente Methode: Fügt eine einzelne Programmzeile hinzu/aktualisiert sie
   * @param {Object} channel - Der Kanal mit seinen Programmdaten
   * @param {number} rowIndex - Index der Zeile (optional)
   * @deprecated Verwende stattdessen die repeat-Direktive - diese Methode ist nicht mehr nötig
   */
  updateSingleProgramRow(channel, rowIndex = 0) {
    this._debug(
      'EpgBox: WARNUNG - updateSingleProgramRow() ist deprecated! Verwende repeat-Direktive'
    );

    const programContainer = this.shadowRoot?.querySelector('#programContainer');
    if (!programContainer) {
      this._debug('EpgBox: Program-Container nicht gefunden');
      return;
    }

    const rowId = `programRow-${channel.id}`;
    let existingRow = programContainer.querySelector(`#${rowId}`);

    this._debug('EpgBox: Update einzelne Programmzeile', {
      kanal: channel.channeldata?.name || channel.name,
      kanalId: channel.id,
      rowId: rowId,
      existingRow: !!existingRow,
    });

    // Erstelle neue Zeile als Lit-Template
    const newRowTemplate = this.renderManager.renderProgramRow(channel, rowIndex);

    if (existingRow) {
      // Ersetze bestehende Zeile mit Lit-Template
      render(newRowTemplate, existingRow.parentNode, { host: this });
      // Das alte Element wird automatisch durch das neue ersetzt
    } else {
      // Füge neue Zeile am Ende hinzu
      render(newRowTemplate, programContainer, { host: this });
    }
  }

  /**
   * Fügt eine einzelne Programmzeile für einen Kanal hinzu/aktualisiert sie
   * @param {Object} channel - Der Kanal mit seinen Programmdaten
   * @param {number} rowIndex - Index der Zeile (optional)
   * @deprecated Verwende stattdessen die repeat-Direktive - diese Methode ist nicht mehr nötig
   */
  updateProgramRow(channel, rowIndex = 0) {
    this._debug('EpgBox: WARNUNG - updateProgramRow() ist deprecated! Verwende repeat-Direktive');
    // Verwende die effiziente Version
    this.updateSingleProgramRow(channel, rowIndex);
  }

  /**
   * Fügt mehrere Programmzeilen hinzu/aktualisiert sie
   * @param {Array} channels - Array von Kanälen
   * @deprecated Verwende stattdessen die repeat-Direktive - diese Methode ist nicht mehr nötig
   */
  updateProgramRows(channels) {
    this._debug('EpgBox: WARNUNG - updateProgramRows() ist deprecated! Verwende repeat-Direktive');

    this._debug('EpgBox: Update mehrere Programmzeilen', {
      anzahlKanäle: channels.length,
    });

    channels.forEach((channel, index) => {
      this.updateProgramRow(channel, index);
    });
  }

  /**
   * Entfernt eine Programmzeile für einen Kanal
   * @param {string} channelId - ID des Kanals
   * @deprecated Verwende stattdessen die repeat-Direktive - diese Methode ist nicht mehr nötig
   */
  removeProgramRow(channelId) {
    this._debug('EpgBox: WARNUNG - removeProgramRow() ist deprecated! Verwende repeat-Direktive');

    const programContainer = this.shadowRoot?.querySelector('#programContainer');
    if (!programContainer) return;

    const rowId = `programRow-${channelId}`;
    const existingRow = programContainer.querySelector(`#${rowId}`);

    if (existingRow) {
      this._debug('EpgBox: Entferne Programmzeile', { channelId, rowId });
      existingRow.remove();
    }
  }

  /**
   * Aktualisiert nur die Program-Container-Inhalte ohne vollständige Re-Renderung
   * @deprecated Verwende stattdessen die repeat-Direktive - diese Methode ist nicht mehr nötig
   */
  updateProgramContainer() {
    this._debug(
      'EpgBox: WARNUNG - updateProgramContainer() ist deprecated! Verwende repeat-Direktive'
    );

    const programContainer = this.shadowRoot?.querySelector('#programContainer');
    if (!programContainer) {
      this._debug('EpgBox: Program-Container nicht gefunden');
      return;
    }

    this._debug('EpgBox: Aktualisiere Program-Container (ineffizient)', {
      anzahlKanäle: this._sortedChannels.length,
      showChannelGroups: this.showChannelGroups,
    });

    // Erstelle neuen Inhalt
    const newContent =
      this._sortedChannels.length > 0
        ? this.showChannelGroups
          ? this.renderManager.renderGroupedPrograms(this._sortedChannels)
          : this.renderManager.renderSimplePrograms(this._sortedChannels)
        : html`<div class="loading">Programme werden geladen...</div>`;

    // Rendere Lit-Template korrekt
    render(newContent, programContainer);
  }

  /**
   * Aktualisiert beide Container selektiv
   * @deprecated Verwende stattdessen die repeat-Direktive - diese Methode ist nicht mehr nötig
   */
  updateContainers() {
    this._debug('EpgBox: WARNUNG - updateContainers() ist deprecated! Verwende repeat-Direktive');
    this.updateChannelContainer();
    this.updateProgramContainer();
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
}

customElements.define('epg-box', EpgBox);
