import { html, css } from 'lit';
import { EpgElementBase } from './epg-element-base.js';

export class EpgTimeMarker extends EpgElementBase {
  static className = 'EpgTimeMarker';

  static properties = {
    ...super.properties,
    currentTime: { type: Number },
    minTime: { type: Number },
    earliestProgramStart: { type: Number },
    latestProgramStop: { type: Number },
    showWidth: { type: Number },
    position: { type: Number },
    showTooltip: { type: Boolean },
  };

  constructor() {
    super();
    this.currentTime = Date.now() / 1000;
    this.minTime = 0;
    this.earliestProgramStart = 0;
    this.latestProgramStop = 0;
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
    }, 1000);
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

    // Hole den aktuellen Scale von der programBox
    const programBox = this.closest('.programBox');
    const scale = programBox
      ? parseFloat(getComputedStyle(programBox).getPropertyValue('--epg-scale')) || 1
      : 1;

    // Berechne Position direkt
    const positionPixels = Math.max(0, (now - this.earliestProgramStart) * scale);

    // this._debug('EpgTimeMarker: Position berechnet', {
    //   currentTime: new Date(now * 1000).toISOString(),
    //   now,
    //   earliestProgramStart: this.earliestProgramStart,
    //   scale,
    //   positionPixels,
    //   earliestProgramStartDate: new Date(this.earliestProgramStart * 1000).toISOString(),
    //   timeDiff: now - this.earliestProgramStart,
    //   timeDiffMinutes: Math.round((now - this.earliestProgramStart) / 60),
    // });

    return positionPixels;
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

    // Wenn sich earliestProgramStart oder latestProgramStop ändern, berechne die Position neu
    if (
      changedProperties.has('earliestProgramStart') ||
      changedProperties.has('latestProgramStop')
    ) {
      this._debug('EpgTimeMarker: Properties geändert, berechne Position neu', {
        earliestProgramStart: this.earliestProgramStart,
        latestProgramStop: this.latestProgramStop,
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
      <div class="time-marker-line" title="${timeString}"></div>
      <div class="time-marker-dot"></div>
      <div class="time-tooltip">${timeString}</div>
    `;
  }
}

if (!customElements.get('epg-time-marker')) {
  customElements.define('epg-time-marker', EpgTimeMarker);
}
