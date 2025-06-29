import { html, css } from 'lit';
import { EpgElementBase } from './epg-element-base.js';

export class EpgTimeMarker extends EpgElementBase {
  static className = 'EpgTimeMarker';

  static properties = {
    ...super.properties,
    currentTime: { type: Number },
    scale: { type: Number },
    minTime: { type: Number },
    showWidth: { type: Number },
    position: { type: Number },
    showTooltip: { type: Boolean },
  };

  constructor() {
    super();
    this.currentTime = Date.now() / 1000;
    this.scale = 1;
    this.minTime = 0;
    this.showWidth = 180;
    this.position = 0;
    this.showTooltip = false;
    this.updateInterval = null;
    this.startTimeUpdate();
  }

  /**
   * Startet das automatische Update der aktuellen Zeit
   */
  startTimeUpdate() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    // Update alle 30 Sekunden
    this.updateInterval = setInterval(() => {
      this.updateCurrentTime();
    }, 30000);
  }

  /**
   * Stoppt das automatische Update der aktuellen Zeit
   */
  stopTimeUpdate() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Aktualisiert die aktuelle Zeit
   */
  updateCurrentTime() {
    this.currentTime = Date.now() / 1000;
    this.calculateAndSetPosition();
  }

  /**
   * Berechnet und setzt die Position des Zeitmarkers
   */
  calculateAndSetPosition() {
    const position = this.calculatePosition();
    this.setPosition(position);
  }

  /**
   * Setzt die Position des Zeitmarkers
   */
  setPosition(position) {
    this.position = position;
    if (this.shadowRoot?.host) {
      this.shadowRoot.host.style.left = `${position}px`;
    }
  }

  /**
   * Berechnet die Position basierend auf der aktuellen Zeit und den eigenen Properties
   */
  calculatePosition() {
    const now = Date.now() / 1000; // Aktuelle Zeit in Sekunden
    const positionPixels = (now - this.minTime) * this.scale;

    this._debug('EpgTimeMarker: Position berechnet', {
      currentTime: new Date(now * 1000).toISOString(),
      now,
      minTime: this.minTime,
      scale: this.scale,
      positionPixels,
    });

    return Math.max(0, positionPixels); // Position darf nicht negativ sein
  }

  /**
   * Scrollt zur Backview-Position
   */
  scrollToBackviewPosition(epgBox) {
    const programBox = epgBox.shadowRoot?.querySelector('.programBox');
    if (!programBox) {
      this._debug('EpgTimeMarker: ProgramBox nicht gefunden für Scroll');
      return;
    }

    const now = new Date();
    const backviewMinutes = epgBox.epgShowPastTime > 0 ? epgBox.epgShowPastTime : 60;
    const targetTime = new Date(now.getTime() - backviewMinutes * 60 * 1000);

    this._debug('EpgTimeMarker: Scroll zu Backview-Position', {
      jetzt: now.toISOString(),
      backviewMinutes,
      targetTime: targetTime.toISOString(),
      isFirstLoad: epgBox.isFirstLoad,
    });

    // Berechne Scroll-Position basierend auf der Zeit
    const scrollPosition = this.calculateScrollPositionForTime(targetTime, epgBox);

    if (scrollPosition !== null) {
      programBox.scrollLeft = scrollPosition;
      this._debug('EpgTimeMarker: ProgramBox gescrollt', {
        scrollPosition,
        targetTime: targetTime.toISOString(),
      });
    }
  }

  /**
   * Berechnet die Scroll-Position basierend auf der Ziel-Zeit
   */
  calculateScrollPositionForTime(targetTime, epgBox) {
    const now = new Date();
    const pastTime = epgBox.epgPastTime || 30;
    const showWidth = epgBox.epgShowFutureTime || 180;

    // Berechne die tatsächliche Gesamtbreite basierend auf der Zeit
    const totalTimeMinutes = pastTime + showWidth;
    const timeDiffMinutes = (now.getTime() - targetTime.getTime()) / (1000 * 60);

    // Berechne die Position als Prozentsatz der Gesamtzeit
    const positionPercent = Math.max(0, Math.min(1, timeDiffMinutes / totalTimeMinutes));

    // Berechne die tatsächliche Breite der Program-Items
    const actualWidth = this.calculateActualProgramWidth(epgBox);

    // Berechne die Scroll-Position basierend auf der tatsächlichen Breite
    const scrollPosition = positionPercent * actualWidth;

    this._debug('EpgTimeMarker: Scroll-Position berechnet', {
      targetTime: targetTime.toISOString(),
      timeDiffMinutes,
      totalTimeMinutes,
      positionPercent,
      scrollPosition,
      actualWidth,
      containerWidth: epgBox.containerWidth,
    });

    return scrollPosition;
  }

  /**
   * Prüft und validiert die epgBackview Einstellungen
   */
  validateEpgBackview(epgBox) {
    const backview = epgBox.epgShowPastTime || 0;
    const pastTime = epgBox.epgPastTime || 30;
    const showWidth = epgBox.epgShowFutureTime || 180;

    if (backview > pastTime) {
      this._debug('EpgTimeMarker: Backview-Warnung', {
        backview,
        pastTime,
        showWidth,
        message: 'Backview ist größer als PastTime - könnte zu Problemen führen',
      });
    }

    return {
      isValid: backview <= pastTime,
      backview,
      pastTime,
      showWidth,
    };
  }

  /**
   * Testet ob der erste Load abgeschlossen ist und führt Time Marker Aktionen durch
   */
  testIsFirstLoadCompleteUpdated(epgBox) {
    this._debug('EpgTimeMarker: testIsFirstLoadCompleteUpdated aufgerufen', {
      isFirstLoad: epgBox.isFirstLoad,
      isChannelUpdate: epgBox.isChannelUpdate,
    });

    // Nur ausführen wenn der erste Load abgeschlossen ist und keine Kanal-Updates mehr laufen
    if (epgBox.isFirstLoad === 2 && epgBox.isChannelUpdate === 0) {
      this._debug('EpgTimeMarker: Erster Load abgeschlossen, führe Time Marker Aktionen aus');

      // Validiere Backview-Einstellungen
      const validation = this.validateEpgBackview(epgBox);
      if (!validation.isValid) {
        this._debug('EpgTimeMarker: Backview-Validierung fehlgeschlagen', validation);
      }

      // Scroll zur Backview-Position
      this.scrollToBackviewPosition(epgBox);

      // Aktualisiere die Position
      this.calculateAndSetPosition();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stopTimeUpdate();
  }

  firstUpdated() {
    super.firstUpdated();
    // Initialisiere die Position
    this.calculateAndSetPosition();
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    // Wenn sich scale oder minTime ändern, berechne die Position neu
    if (changedProperties.has('scale') || changedProperties.has('minTime')) {
      this._debug('EpgTimeMarker: Properties geändert, berechne Position neu', {
        scale: this.scale,
        minTime: this.minTime,
      });
      this.calculateAndSetPosition();
    }
  }

  static styles = [
    super.styles,
    css`
      :host {
        position: absolute;
        top: 0;
        bottom: 0;
        z-index: 10;
        pointer-events: none;
        transition: left 0.3s ease;
      }

      .time-marker-line {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 2px;
        background-color: var(--epg-now-marker-color, #ff4444);
        box-shadow: 0 0 4px rgba(255, 68, 68, 0.6);
      }

      .time-marker-dot {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 8px;
        height: 8px;
        background-color: var(--epg-now-marker-color, #ff4444);
        border-radius: 50%;
        box-shadow: 0 0 6px rgba(255, 68, 68, 0.8);
      }

      .time-tooltip {
        position: absolute;
        top: -25px;
        left: 50%;
        transform: translateX(-50%);
        background-color: var(--primary-background-color, #ffffff);
        color: var(--primary-text-color, #000000);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        white-space: nowrap;
        opacity: 0;
        transition: opacity 0.2s ease;
        pointer-events: auto;
      }

      :host(:hover) .time-tooltip {
        opacity: 1;
      }

      /* Animation für den Zeitmarker */
      .time-marker-line {
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0% {
          opacity: 1;
        }
        50% {
          opacity: 0.6;
        }
        100% {
          opacity: 1;
        }
      }
    `,
  ];

  render() {
    const currentTime = new Date(this.currentTime * 1000);
    const timeString = currentTime.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return html`
      <div
        class="time-marker-line"
        title="${timeString}"
      ></div>
      <div
        class="time-marker-dot"
      ></div>
      <div
        class="time-tooltip"
      >
        ${timeString}
      </div>
    `;
  }
}

if (!customElements.get('epg-time-marker')) {
  customElements.define('epg-time-marker', EpgTimeMarker);
}