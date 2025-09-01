import { SuperBase } from '../super-base.js';
import { css, html } from 'lit';

/**
 * Custom Element für EPG-Tooltips
 * Übernimmt die komplette Tooltip-Logik inklusive Positionierung und Auto-Scroll
 */
export class EpgTooltip extends SuperBase {
  static className = 'EpgTooltip';

  static properties = {
    data: { type: Object },
    position: { type: String, reflect: true },
    margin: { type: Number },
    initialDelay: { type: Number },
    scrollPause: { type: Number },
    frameElement: { type: Object },
    hostElement: { type: Object },
  };

  static styles = css`
    :host {
      display: block;
      position: absolute;
      top: -9999px;
      left: -9999px;
      opacity: 0;
      visibility: hidden;
      z-index: 10000;
      pointer-events: none;
    }

    :host(.visible) {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }

    .tooltip {
      background-color: rgba(0, 0, 0, 0.9);
      color: white;
      border-radius: 8px;
      padding: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      font-family: Arial, sans-serif;
      font-size: 14px;
      line-height: 1.4;
      max-width: 300px;
      overflow: hidden;
    }

    .tooltip-content {
      display: grid;
      grid-template-rows: auto 1fr;
      height: 100%;
    }

    .tooltip-header {
      margin-bottom: 8px;
    }

    .tooltip-title {
      font-weight: bold;
      font-size: 16px;
      margin-bottom: 4px;
      color: #ffffff;
    }

    .tooltip-subtitle {
      font-size: 13px;
      color: #cccccc;
      margin-bottom: 4px;
      font-style: italic;
    }

    .tooltip-time {
      font-size: 12px;
      color: #aaaaaa;
      margin-bottom: 0;
    }

    .tooltip-description {
      overflow-y: auto;
      overflow-x: hidden;
      padding-right: 4px;
      color: #dddddd;
      font-size: 13px;
      line-height: 1.3;
    }

    .tooltip-description::-webkit-scrollbar {
      width: 6px;
    }

    .tooltip-description::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
    }

    .tooltip-description::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 3px;
    }

    .tooltip-description::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  `;

  constructor() {
    super();

    // Tooltip-Eigenschaften
    this.margin = 8;
    this.initialDelay = 3000;
    this.scrollPause = 4000;

    // Tooltip-Zustand
    this.visible = false;
    this.data = null;
    this.position = 'bottom';

    // Auto-Scroll
    this._autoScrollTimer = null;

    this._debug('EpgTooltip initialisiert');
  }

  /**
   * Debug-Methode
   */
  _debug(message, data = null) {
    this.tgCardHelper._debug(this.constructor.className, message, data);
  }

  /**
   * Render-Methode für das Custom Element
   */
  render() {
    if (!this.data) return html``;

    const startTime = this.formatTime(this.data.start);
    const endTime = this.formatTime(this.data.stop);
    const duration = this.data.duration ? Math.round(this.data.duration / 60) : 0;

    return html`
      <div class="tooltip">
        <div class="tooltip-content">
          <div class="tooltip-header">
            <div class="tooltip-title">${this.data.title || 'Unbekanntes Programm'}</div>
            ${this.data.shortText
              ? html`<div class="tooltip-subtitle">${this.data.shortText}</div>`
              : ''}
            <div class="tooltip-time">
              <span class="tooltip-start">${startTime}</span>
              <span class="tooltip-separator"> - </span>
              <span class="tooltip-end">${endTime}</span>
              ${duration > 0 ? html`<span class="tooltip-duration"> (${duration} Min)</span>` : ''}
            </div>
          </div>
          ${this.data.description
            ? html`<div class="tooltip-description">${this.data.description}</div>`
            : ''}
        </div>
      </div>
    `;
  }



  /**
   * Lifecycle: Wird aufgerufen, wenn das Element entfernt wird
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    this._stopAutoScroll();
  }

  /**
   * Formatiert die Zeit für den Tooltip
   */
  formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Startet den Timer für automatisches Scrollen
   */
  _startAutoScrollTimer() {
    // Stoppe vorherige Timer falls vorhanden
    if (this._autoScrollTimer) {
      clearTimeout(this._autoScrollTimer);
    }

    this._debug(
      'EpgTooltip-Scroll: Starte automatisches Scrollen nach ' +
        this.initialDelay / 1000 +
        ' Sekunden'
    );
    // Starte automatisches Scrollen nach konfigurierbarer Verzögerung
    this._autoScrollTimer = setTimeout(() => {
      this._startAutoScroll();
    }, this.initialDelay);
  }

  /**
   * Startet das automatische Scrollen der Description
   */
  _startAutoScroll() {
    this._debug('EpgTooltip-Scroll: automatisches Scrollen 1');
    if (!this.visible) return;

    const description = this.shadowRoot?.querySelector('.tooltip-description');
    this._debug('EpgTooltip-Scroll: automatisches Scrollen 2');
    if (!description) return;

    const scrollHeight = description.scrollHeight - description.clientHeight;

    // Wenn kein Scroll nötig ist, stoppe
    this._debug('EpgTooltip-Scroll: automatisches Scrollen 3', {
      scrollHeight,
      descriptionScrollHeight: description.scrollHeight,
      descriptionClientHeight: description.clientHeight,
    });
    if (scrollHeight <= 0) return;
    this._debug('EpgTooltip-Scroll: automatisches Scrollen 4');

    this._debug('EpgTooltip-Scroll: Starte automatisches Scrollen', {
      scrollHeight,
      clientHeight: description.clientHeight,
    });

    // Scroll nach unten (langsamer)
    description.scrollTo({ top: scrollHeight, behavior: 'smooth' });

    // Nach Scroll-Ende: längere Pause, dann zurück zum Anfang
    setTimeout(() => {
      if (!this.visible) return;

      // Scroll zurück zum Anfang (langsamer)
      description.scrollTo({ top: 0, behavior: 'smooth' });

      // Nach Zurück-Scroll: längere Pause, dann Loop fortsetzen
      setTimeout(() => {
        if (!this.visible) return;
        this._startAutoScroll(); // Rekursiver Aufruf für endlosen Loop
      }, this.scrollPause); // Konfigurierbare Pause
    }, this.scrollPause); // Konfigurierbare Pause
  }

  /**
   * Setzt die Event-Daten und verarbeitet sie
   */
  setEventData(detail) {
    this._debug('EpgTooltip: setEventData aufgerufen', { detail });

    // Verarbeite die Event-Daten
    this._eventData = detail;

    // Entscheide selbst über show/hide basierend auf action
    if (detail.action === 'show') {
      this.show(detail.data);
    } else if (detail.action === 'hide') {
      this.hide();
    }
  }

  /**
   * Zeigt den Tooltip an
   */
  show(data) {
    this._debug('EpgTooltip: show aufgerufen', { data });

    this.data = data;
    this.visible = false;

    // Explizit Update auslösen für neue Daten
    this.requestUpdate();

    // Berechne optimale Position
    this._calculateOptimalPosition();

    // Tooltip mit neuer Position einblenden
    this.visible = true;

    // CSS-Klasse setzen und Auto-Scroll starten
    this.classList.toggle('visible', this.visible);
    if (this.visible) {
      this._startAutoScrollTimer();
    }
  }

  /**
   * Versteckt den Tooltip
   */
  hide() {
    this._debug('EpgTooltip: hide aufgerufen');

    this.visible = false;

    // CSS-Klasse entfernen
    this.classList.remove('visible');

    // Stoppe Auto-Scroll
    this._stopAutoScroll();
  }

  /**
   * Berechnet die optimale Position für den Tooltip
   */
  _calculateOptimalPosition() {
    if (!this.hostElement) {
      this._debug('EpgTooltip: Kein hostElement gesetzt, verwende Standard-Position');
      return;
    }

    const hostRect = this.hostElement.getBoundingClientRect();
    const tooltipRect = this.getBoundingClientRect();
    this._debug('EpgTooltip: tooltipRect', { tooltipRect });
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Standard-Position (unten rechts vom Host)
    let left = hostRect.right + 10;
    let top = hostRect.top;

    // Prüfe ob rechts genug Platz ist
    if (left + tooltipRect.width > viewportWidth) {
      // Links vom Host positionieren
      left = hostRect.left - tooltipRect.width - 10;
    }

    // Prüfe ob unten genug Platz ist
    if (top + tooltipRect.height > viewportHeight) {
      // Über dem Host positionieren
      top = hostRect.bottom - tooltipRect.height;
    }

    // Stelle sicher, dass der Tooltip nicht außerhalb des Viewports ist
    left = Math.max(10, Math.min(left, viewportWidth - tooltipRect.width - 10));
    top = Math.max(10, Math.min(top, viewportHeight - tooltipRect.height - 10));

    this._debug('EpgTooltip: Position berechnet', { left, top, hostRect, tooltipRect });

    // Setze die Position
    this.style.left = `${left}px`;
    this.style.top = `${top}px`;
  }

  /**
   * Stoppt das automatische Scrollen
   */
  _stopAutoScroll() {
    if (this._autoScrollTimer) {
      clearTimeout(this._autoScrollTimer);
      this._autoScrollTimer = null;
    }
  }
}

// Registriere das Custom Element
if (!customElements.get('epg-tooltip')) {
  customElements.define('epg-tooltip', EpgTooltip);
}
