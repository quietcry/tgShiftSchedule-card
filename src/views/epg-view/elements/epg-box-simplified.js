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

export class EpgBoxSimplified extends EpgElementBase {
  static className = 'EpgBoxSimplified';

  static properties = {
    ...super.properties,
    // ===== EXTERNE PROPERTIES (von Parent-Komponenten) =====
    timeWindow: { type: Number }, // Zeitfenster für EPG-Anzeige
    showChannel: { type: Boolean }, // Zeigt Kanalspalte an/aus
    selectedChannel: { type: String }, // Aktuell ausgewählter Kanal
    channelOrder: { type: Array }, // Array mit Kanaldefinitionen
    showChannelGroups: { type: Boolean }, // Zeigt Kanalgruppen an
    scale: { type: Number }, // Aktueller Scale-Faktor
    showShortText: { type: Boolean }, // Zeigt kurze Programmtexte an
    channelWidth: { type: Number }, // Breite der Kanalspalte in px
    env: { type: Object }, // Umgebungsinformationen vom EnvSniffer

    // ===== ZEIT-KONFIGURATION =====
    epgPastTime: { type: Number }, // Minuten in die Vergangenheit
    epgShowFutureTime: { type: Number }, // Minuten in die Zukunft
    epgShowPastTime: { type: Number }, // Alternative zu epgPastTime
    epgShowWidth: { type: Number }, // Breite der EPG-Anzeige
    epgBackview: { type: Number }, // Backview-Position
  };

  constructor() {
    super();

    // ===== ÜBERGREIFEND VERWENDETE VARIABLEN =====

    // Kanal-Management
    this._sortedChannels = []; // Array mit allen Kanälen in sortierter Reihenfolge
    this._channelOrderInitialized = false; // Flag: true wenn Kanal-Reihenfolge initialisiert wurde

    // Scale-Management
    this.scale = 1; // Aktueller Scale-Faktor für Zeit-zu-Pixel-Konvertierung

    // Zeit-Management
    const now = Math.floor(Date.now() / 1000);
    const pastTime = this.epgPastTime || 30;
    const futureTime = this.epgShowFutureTime || 180;

    this._channelsParameters = {
      minTime: now - (pastTime * 60), // Früheste sichtbare Zeit (Unix-Timestamp)
      maxTime: now + (futureTime * 60), // Späteste sichtbare Zeit (Unix-Timestamp)
      earliestProgramStart: now, // Frühester Programmstart aller Kanäle (Unix-Timestamp)
    };

    // Container-Management
    this._containerWidth = 1200; // Geschätzte Container-Breite
    this._containerWidthMeasured = false; // Flag: true wenn Container-Breite gemessen wurde

    // Load-State-Management
    this.isFirstLoad = 0; // Load-Status: 0=initial, 1=loading, 2=complete
    this.isChannelUpdate = 0; // Counter für aktive Kanal-Updates

    // UI-Konfiguration
    this.channelWidth = 180; // Breite der Kanalspalte in Pixeln

    // ===== MANAGER-INSTANZEN =====
    this.scrollManager = new EpgScrollManager(this);
    this.scaleManager = new EpgScaleManager(this);
    this.channelManager = new EpgChannelManager(this);
    this.dataManager = new EpgDataManager(this);
    this.renderManager = new EpgRenderManager(this);

    // ===== UPDATE MANAGER (ZENTRAL) =====
    this.updateManager = new EpgUpdateManager(this);
  }

  /**
   * Getter für die Container-Breite aus dem env-sniffer
   */
  get containerWidth() {
    if (this.env && this.env.cardWidth) {
      return this.env.cardWidth;
    }
    return 1200;
  }

  /**
   * VEREINFACHTE UPDATED-METHODE
   * Alle Änderungen gehen über den UpdateManager
   */
  updated(changedProperties) {
    // Alle Änderungen an den UpdateManager weiterleiten
    this.updateManager.handleUpdate('PROPERTY_CHANGE', changedProperties);
  }

  /**
   * VEREINFACHTE EVENT-HANDLER
   * Alle Events gehen über den UpdateManager
   */
  _onChannelSelected(channel) {
    this.updateManager.onChannelSelected(channel);

    // Event weiterleiten
    this.dispatchEvent(
      new CustomEvent('channel-selected', {
        detail: { channel },
        bubbles: true,
        composed: true,
      })
    );
  }

  _onProgramSelected(program) {
    this.updateManager.onProgramSelected(program);

    // Event weiterleiten
    this.dispatchEvent(
      new CustomEvent('program-selected', {
        detail: { program },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * VEREINFACHTE DATEN-AUFNAHME
   * Alle Daten gehen über den UpdateManager
   */
  addTeilEpg(teilEpg) {
    this.updateManager.onEpgDataReceived(teilEpg);
  }

  /**
   * VEREINFACHTE LOAD-STATUS-PRÜFUNG
   */
  testIsFirstLoadCompleteUpdated() {
    if (this.isFirstLoad === 1 && this.isChannelUpdate === 0) {
      this.isFirstLoad = 2;

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
  }

  firstUpdated() {
    super.firstUpdated();
    this.scrollManager.setupScrollSync();
  }

  render() {
    if (!this._sortedChannels.length) {
      return this.renderManager.renderLoading();
    }

    const channelsToRenderForSimpleMode = this._sortedChannels;

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

  // Styles bleiben gleich...
  static styles = [
    super.styles,
    css`
      :host {
        display: flex;
        flex-direction: row;
        width: 100%;
        height: auto;
        overflow: visible;
        position: relative;
      }

      .channelBox {
        border-right: 1px solid var(--epg-border-color);
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
        align-items: stretch;
        justify-content: flex-start;
        height: fit-content;
        max-height: none;
      }

      .programBox {
        flex: 1;
        overflow-x: auto;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        height: auto;
        max-height: none;
        min-width: 0;
      }
    `,
  ];
}

customElements.define('epg-box-simplified', EpgBoxSimplified);