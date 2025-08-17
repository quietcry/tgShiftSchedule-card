import { html, css } from 'lit';
import { EpgElementBase } from './epg-element-base.js';

export class EpgTimeMarker extends EpgElementBase {
  static className = 'EpgTimeMarker';

  static properties = {
    ...super.properties,
    currentTime: { type: Number },
    earliestProgramStart: { type: Number },
    latestProgramStop: { type: Number },
    position: { type: Number },
  };

  constructor() {
    super();
    this.currentTime = Date.now() / 1000;
    this.earliestProgramStart = 0;
    this.latestProgramStop = 0;
    this.position = 0;
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
    }, 10000);
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

    // Hole den aktuellen Scale von diesem Element selbst (geerbt von Container)
    const scale =
      parseFloat(getComputedStyle(this).getPropertyValue('--epg-scale')) || this.scale || 0.8;
    this.scale = scale;

    // Berechne Position direkt
    const positionPixels = Math.max(0, (now - this.earliestProgramStart) * scale);
    return positionPixels;
  }

  /**
   * Manuelle Aktualisierung der Time Marker Properties
   * Wird von der Timebar aufgerufen, wenn sich die Werte ändern
   */
  updateTimeMarkerValues(earliestProgramStart, latestProgramStop, scale) {
    this.earliestProgramStart = earliestProgramStart;
    this.latestProgramStop = latestProgramStop;
    this.scale = scale;

    // Position neu berechnen
    this.calculateAndSetPosition();

    this._debug('EpgTimeMarker: Werte manuell aktualisiert', {
      earliestProgramStart,
      latestProgramStop,
      scale,
      newPosition: this.calculatePosition(),
    });
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
      changedProperties.has('latestProgramStop') ||
      changedProperties.has('scale')
    ) {
      this._debug('EpgTimeMarker: Properties geändert, berechne Position neu', {
        earliestProgramStart: this.earliestProgramStart,
        latestProgramStop: this.latestProgramStop,
        scale: this.scale,
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
    `,
  ];

  render() {
    return html` <div class="time-marker-line"></div> `;
  }
}

if (!customElements.get('epg-time-marker')) {
  customElements.define('epg-time-marker', EpgTimeMarker);
}
