import { html, css } from 'lit';
import { EpgElementBase } from './epg-element-base.js';
import './epg-program-item.js';
import { EpgScrollManager } from './epg-scroll-manager.js';
import { EpgScaleManager } from './epg-scale-manager.js';
import { EpgChannelManager } from './epg-channel-manager.js';
import { EpgDataManager } from './epg-data-manager.js';
import { EpgRenderManager } from './epg-render-manager.js';

export class EpgBox extends EpgElementBase {
  static className = 'EpgBox';

  static properties = {
    ...super.properties,
    timeWindow: { type: Number },
    showChannel: { type: Boolean },
    selectedChannel: { type: String },
    channelOrder: { type: Array }, // Array mit Kanaldefinitionen { name: string, style?: string, channels?: Array }
    showChannelGroups: { type: Boolean }, // Zeigt Kanalgruppen an
    scale: { type: Number },
    showShortText: { type: Boolean },
    channelWidth: { type: Number }, // Breite der Kanalspalte in px
  };

  constructor() {
    super();
    this._channels = new Map(); // Speichert die Kanäle mit ihren Programmen
    this._sortedChannels = []; // Neue detaillierte Sortierungsstruktur
    this._channelOrderInitialized = false; // Flag für initialisierte Sortierung
    this.scale = 1; // Standard-Scale
    this._channelsParameters = { minTime: 0, maxTime: 0 };
    this._containerWidth = 1200; // Geschätzte Container-Breite, wird nach erstem Render aktualisiert
    this._containerWidthMeasured = false; // Flag für gemessene Container-Breite
    this.isFirstLoad = 0; // Indikator für ersten Datenabruf (0=initial, 1=loading, 2=complete)
    this.isChannelUpdate = 0; // Counter für aktive Kanal-Updates
    this.channelWidth = 180; // Standardbreite der Kanalspalte

    // Initialisiere Manager
    this.scrollManager = new EpgScrollManager(this);
    this.scaleManager = new EpgScaleManager(this);
    this.channelManager = new EpgChannelManager(this);
    this.dataManager = new EpgDataManager(this);
    this.renderManager = new EpgRenderManager(this);
  }

  updated(changedProperties) {
    if (changedProperties.has('channelOrder')) {
      this._debug('channelOrder geändert');
      this._channelOrderInitialized = false;
      this.channelManager.initializeChannelOrder();
      this.channelManager.updateAllChannelSorting();
      this.requestUpdate();
    }

    if (changedProperties.has('epgData')) {
      if (this.epgData?.channel) {
        this.dataManager.addEpgData(this.epgData);
      }
    }

    // Wenn sich epgShowWidth ändert, aktualisiere den Scale
    if (changedProperties.has('epgShowWidth')) {
      this.scale = this.scaleManager.calculateScale();
      this.requestUpdate();
    }

    // Prüfe epgBackview Validierung
    if (changedProperties.has('epgBackview') || changedProperties.has('epgPastTime') || changedProperties.has('epgShowWidth')) {
      this.scaleManager.validateEpgBackview();
    }

    // Verringere isChannelUpdate nach erfolgreichem Update
    if (this.isChannelUpdate > 0) {
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
            channelCount: this._channels.size,
          },
          bubbles: true,
          composed: true,
        })
      );
    }

    // Scroll ProgramBox wenn isFirstLoad < 2
    if (this.isFirstLoad < 2) {
      this.scrollManager.scrollToBackviewPosition();
    }
  }

  firstUpdated() {
    super.firstUpdated();

    // Messen der Container-Breite nach dem ersten Render
    this.scaleManager.measureContainerWidth();

    // Einrichten der Scroll-Synchronisation
    this.scrollManager.setupScrollSync();

    this._debug('EpgBox: firstUpdated abgeschlossen', {
      containerWidth: this._containerWidth,
      scale: this.scale,
    });
  }

  static styles = [
    super.styles,
    css`
      :host {
        display: block;
        width: 100%;
        height: auto; /* Automatische Höhe basierend auf Inhalt */
        overflow: visible; /* Kein Scroll, damit Inhalte sichtbar sind */
        position: relative;
      }

      :host(.epgBox) {
        display: flex;
        flex-direction: row;
        height: auto; /* Automatische Höhe basierend auf Inhalt */
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
    if (!this._channels.size) {
      return this.renderManager.renderLoading();
    }

    // Berechne Scale für die Darstellung
    this.scale = this.scaleManager.calculateScale();

    // Verwende gruppierte Kanäle wenn showChannelGroups aktiviert ist
    let channelsToRender = [];
    if (this.showChannelGroups && this._sortedChannels.length > 0) {
      // Verwende die gruppierte Struktur
      this._sortedChannels.forEach(group => {
        group.patterns.forEach(pattern => {
          channelsToRender.push(...pattern.channels);
        });
      });
    } else {
      // Verwende alle verfügbaren Kanäle direkt
      channelsToRender = Array.from(this._channels.values());
    }

    this._debug('EpgBox: Render gestartet', {
      anzahlKanäle: channelsToRender.length,
      showChannelGroups: this.showChannelGroups,
      sortedChannels: this._sortedChannels.length,
    });

    return html`
      <div class="epgBox">
        <!-- Channel-Box -->
        <div class="channelBox" style="flex-basis: ${this.channelWidth}px; width: ${this.channelWidth}px;">
          ${this.showChannelGroups && this._sortedChannels.length > 0
            ? this.renderManager.renderGroupedChannels()
            : this.renderManager.renderSimpleChannels(channelsToRender)}
        </div>

        <!-- Program-Box -->
        <div class="programBox">
          ${this.showChannelGroups && this._sortedChannels.length > 0
            ? this.renderManager.renderGroupedPrograms()
            : this.renderManager.renderSimplePrograms(channelsToRender)}
        </div>
      </div>
    `;
  }

  _onChannelSelected(channel) {
    this._debug('EpgBox: Kanal ausgewählt', {
      kanal: channel.name,
      kanalId: channel.id,
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

  addEpgData(data) {
    this.dataManager.addEpgData(data);
  }

  addTeilEpg(teilEpg) {
    this.dataManager.addTeilEpg(teilEpg);
  }
}

customElements.define('epg-box', EpgBox);
