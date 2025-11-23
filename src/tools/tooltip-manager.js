import { SuperBase } from '../super-base.js';
import { css, html } from 'lit';

/**
 * Custom Element für EPG-Tooltips
 * Übernimmt die komplette Tooltip-Logik inklusive Positionierung und Auto-Scroll
 */
export class EpgTooltip extends SuperBase {
  static className = 'EpgTooltip';
  static tooltipStartWidth = 300;

  static properties = {
    data: { type: Object },
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
      opacity: 0;
      visibility: hidden;
      z-index: 10000;
      pointer-events: none;
      max-width: ${EpgTooltip.tooltipStartWidth}px;
      width: ${EpgTooltip.tooltipStartWidth}px;
      box-sizing: border-box;
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
      width: 100%;  /* ✅ Einfach und elegant! */
      height: var(--tooltip-height);
      overflow: hidden;

      /* Wichtig: Padding in Breite einrechnen */
      box-sizing: border-box;

      /* Smooth Transition für Breitenänderungen */
      transition: max-width 0.2s ease, width 0.2s ease;
    }

    .tooltip-content {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .tooltip-header {
      flex-shrink: 0;
      margin-bottom: 8px;
    }

    .tooltip-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }

    .tooltip-title {
      font-weight: bold;
      font-size: 16px;
      color: #ffffff;
      flex: 1;
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
      margin-bottom: 4px;
    }

    .tooltip-channel {
      font-size: 14px;
      color: #cccccc;
      font-weight: 500;
      margin-left: 8px;
    }

    .tooltip-description {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding-right: 4px;
      color: #dddddd;
      font-size: 13px;
      line-height: 1.3;
      vertical-align: top;
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

    /* Tooltip-Toolbar Styles */
    .tooltip-toolbar {
      display: var(--tooltip-topbar);
      justify-content: space-between;
      align-items: center;
      padding: 4px 8px;
      background-color: rgba(255, 255, 255, 0.1);
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px 8px 0 0;
    }

    .tooltip-toolbar-left {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .tooltip-toolbar-right {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .tooltip-close {
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      transition: all 0.2s ease;
    }

    .tooltip-close:hover {
      background: rgba(255, 255, 255, 0.3);
      border-color: rgba(255, 255, 255, 0.5);
      transform: scale(1.1);
    }

    .tooltip-close:active {
      background: rgba(255, 255, 255, 0.4);
      transform: scale(0.95);
    }

    .tooltip-record {
      background: rgba(128, 128, 128, 0.2);
      border: 1px solid rgba(128, 128, 128, 0.3);
      color: #888888;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s ease;
    }

    .tooltip-record.recorded {
      background: rgba(255, 0, 0, 0.2);
      border: 1px solid rgba(255, 0, 0, 0.3);
      color: #ff4444;
    }

    .tooltip-record:hover {
      background: rgba(255, 0, 0, 0.3);
      border-color: rgba(255, 0, 0, 0.5);
      transform: scale(1.1);
    }

    .tooltip-record.recorded:hover {
      background: rgba(255, 0, 0, 0.4);
      border-color: rgba(255, 0, 0, 0.6);
    }

    .tooltip-record:active {
      background: rgba(255, 0, 0, 0.4);
      transform: scale(0.95);
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

    // Auto-Scroll
    this._autoScrollTimer = null;

    // Event-Handler Flags
    this._closeButtonRegistered = false;

    this._debug('EpgTooltip initialisiert');
  }

  /**
   * Lifecycle-Hook: Wird nach dem ersten Render aufgerufen
   */
  firstUpdated() {
    super.firstUpdated();
    this._debug('EpgTooltip: firstUpdated aufgerufen');
  }

  /**
   * Event-Handler für Close-Button
   */
  _handleCloseClick(event) {
    // event.preventDefault();
    // event.stopPropagation();

    this._debug('EpgTooltip: Close-Button geklickt', {
      tooltipVisible: this.visible,
      tooltipData: this.data?.title
    });

    // Tooltip schließen
    this.hide();
  }

  /**
   * Event-Handler für Record-Button
   */
  _handleRecordClick(event) {
    event.preventDefault();
    event.stopPropagation();

    this._debug('EpgTooltip: Record-Button geklickt', {
      tooltipVisible: this.visible,
      tooltipData: this.data?.title,
      programId: this.data?.programId,
      channelId: this.data?.channelId
    });

    // TODO: Aufnahme-Funktionalität implementieren
    // Hier können Sie die Aufnahme-Logik hinzufügen
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
          <div class="tooltip-toolbar">
            <div class="tooltip-toolbar-left">
              <button class="tooltip-record ${this.data.record ? 'recorded' : ''}" title="Aufnahme planen">
                <ha-icon icon="mdi:record"></ha-icon>
              </button>
            </div>
            <div class="tooltip-toolbar-right">
              <button class="tooltip-close">X</button>
            </div>
          </div>
          <div class="tooltip-header">
            <div class="tooltip-title-row">
              <div class="tooltip-title">${this.data.title || 'Unbekanntes Programm'}</div>
              ${this.data.channelName && this.data.action === 'info'
                ? html`<div class="tooltip-channel">${this.data.channelName}</div>`
                : ''}
            </div>
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
            ? html`<div class="tooltip-description">${this.data.description.split(/\|\*?/).map(line => html`${line}<br/>`)}</div>`
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
  /**
   * Prüft ob der Beschreibungsbereich überläuft
   */
  _hasDescriptionOverflow() {
    const description = this.shadowRoot?.querySelector('.tooltip-description');
    if (!description) return false;

    const hasOverflow = description.scrollHeight > description.clientHeight;

    this._debug('EpgTooltip: Überlauf-Prüfung', {
      scrollHeight: description.scrollHeight,
      clientHeight: description.clientHeight,
      hasOverflow: hasOverflow
    });

    return hasOverflow;
  }

  _startAutoScroll() {
    this._debug('EpgTooltip-Scroll: automatisches Scrollen 1');
    if (!this.visible) return;

    // Prüfe ob Scroll überhaupt nötig ist
    if (!this._hasDescriptionOverflow()) {
      this._debug('EpgTooltip-Scroll: Kein Überlauf, Scrollen übersprungen');
      return;
    }

    const description = this.shadowRoot?.querySelector('.tooltip-description');
    this._debug('EpgTooltip-Scroll: automatisches Scrollen 2');
    if (!description) return;

    const scrollHeight = description.scrollHeight - description.clientHeight;

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
    this._debug('EpgTooltip: setEventData aufgerufen', { detail: detail, frameElement: this.frameElement, hostElement: this.hostElement });

    // Verarbeite die Event-Daten
    if (this.data?.action !== "info") {
    this._eventData = detail;

    // Entscheide selbst über show/hide basierend auf action
    if (detail.action === 'show') {
      this.show(detail.data);
    } else if (detail.action === 'hide') {
      this.hide();
    } else if (detail.action === 'info') {
      this.showInfo(detail.data);
      }
    }
  }

  /**
   * Lifecycle-Hook: Wird nach DOM-Update aufgerufen
   */
  updated(changedProperties) {
    super.updated(changedProperties);

    // Event-Handler registrieren (nur einmal)
    if (!this._closeButtonRegistered && this.data) {
      const closeButton = this.shadowRoot.querySelector('.tooltip-close');
      const recordButton = this.shadowRoot.querySelector('.tooltip-record');
      
      if (closeButton) {
        this._debug('EpgTooltip: updated closeButton gefunden und registriert');
        closeButton.addEventListener('click', this._handleCloseClick.bind(this));
      } else {
        this._debug('EpgTooltip: updated closeButton nicht gefunden');
      }
      
      if (recordButton) {
        this._debug('EpgTooltip: updated recordButton gefunden und registriert');
        recordButton.addEventListener('click', this._handleRecordClick.bind(this));
      } else {
        this._debug('EpgTooltip: updated recordButton nicht gefunden');
      }
      
      this._closeButtonRegistered = true;
    }

    // Position berechnen wenn Tooltip gezeigt werden soll
    if (this.data?.action === 'show' && !this.visible) {
      // Jetzt ist der DOM garantiert aktualisiert
      this._calculateOptimalPosition();

      // Tooltip einblenden
      this.visible = true;
      this.classList.toggle('visible', this.visible);

      if (this.visible) {
        this._startAutoScrollTimer();
      }
    } else if (this.data?.action === 'info' ) {
      this._debug('EpgTooltip: showInfo II');
      this._calculateOptimalPosition();
      // Tooltip einblenden
      this.visible = true;
      this.classList.toggle('visible', this.visible);

      if (this.visible) {
        this._startAutoScrollTimer();
        }
    }
  }

  /**
   * Zeigt den Tooltip an
   */
  show(data) {
    this._debug('EpgTooltip: show aufgerufen', { data });

    this.data = data;
    this.data.action = 'show';
    // this.visible = false;

    // Explizit Update auslösen für neue Daten
    this.requestUpdate();

  }
  /**
   * Zeigt den Tooltip als Info an
   */
  showInfo(data) {
    this._debug('EpgTooltip: showInfo aufgerufen', { data });

    this.data = data;
    this.data.action = 'info';
    // this.visible = false;

    // Explizit Update auslösen für neue Daten
    this.requestUpdate();

  }

  /**
   * Versteckt den Tooltip
   */
  hide() {
    this._debug('EpgTooltip: hide aufgerufen');

    if (this.data?.action === 'show' || this.data?.action === 'info') {
      this.visible = false;
      this.data.action = 'hide';

    // CSS-Klasse entfernen
    this.classList.remove('visible');

    // Stoppe Auto-Scroll
    this._stopAutoScroll();
    }
  }

  _clipToViewport(rect) {
    return {
      left: Math.max(0, rect.left),
      right: Math.min(rect.right, window.innerWidth),
      top: Math.max(0, rect.top),
      bottom: Math.min(rect.bottom, window.innerHeight),
      width: Math.min(rect.width, window.innerWidth - rect.left),
      height: Math.min(rect.height, window.innerHeight - rect.top),
    };
  }
  /**
   * Berechnet die optimale Position für den Tooltip
   */
  _setDefaultCSS(width=this.constructor.tooltipStartWidth) {
    this.style.maxWidth = `${width}px`;
    this.style.width = `${width}px`;
    this.style.height = "auto";
    this.style.top = "auto";
    this.style.left = "auto";
    this.style.bottom = "auto";
    this.style.right = "auto";
    this.style.setProperty('--tooltip-topbar', 'none');
    this.style.setProperty('--tooltip-height', 'auto');
  }

  _calculateOptimalPosition() {
    if (!this.hostElement) {
      this._debug('EpgTooltip: Kein hostElement gesetzt, verwende Standard-Position');
      return;
    }
    const rand=10;
    const elemRect=this._clipToViewport(this._eventData.element.getBoundingClientRect());
    this._setDefaultCSS();
    let tooltipRect = this.getBoundingClientRect();
    this._debug("epgtooltip: >",{width:tooltipRect.width})
    const rects=[
      this._clipToViewport(this.hostElement.getBoundingClientRect()),
      this._clipToViewport(this.frameElement.getBoundingClientRect())
    ]
    let pos=null
    let space=null
    const maxWidth=rects[rects.length-1].width / 3;
    const startWidth=tooltipRect.width;
    const widthStep=Math.abs((maxWidth-startWidth)/10);
    let width=startWidth<maxWidth?startWidth:maxWidth;
    if (this.data?.action === 'info') {
      this.style.setProperty('--tooltip-height', '100%');
      this.style.setProperty('--tooltip-topbar', 'flex');
      this.style.maxWidth = `${rects[rects.length-1].width}px`;
      this.style.width = `${rects[rects.length-1].width}px`;
      this.style.left = `${rects[rects.length-1].left}px`;
      this.style.height = `${rects[rects.length-1].height}px`;
      this.style.top = `${rects[rects.length-1].top}px`;
      this._debug('EpgTooltip: showInfo III', rects[rects.length-1] );
      return;
    }
    this.style.setProperty('--tooltip-height', 'auto');
    this.style.setProperty('--tooltip-topbar', 'none');
    this._debug('EpgTooltip: Position default', { width: width, length: rects.length });
    while (width<=maxWidth) {
      // Setze Breite direkt - CSS width: 100% macht den Rest
      this._setDefaultCSS(width);
      tooltipRect = this.getBoundingClientRect();

      for (const rect of rects) {
        const topheight=elemRect.top-rect.top
        const bottomheight=rect.bottom-elemRect.bottom
        const leftwidth=elemRect.left-rect.left
        const rightwidth=rect.right-elemRect.right
        // Position top
        if (topheight >= tooltipRect.height + 2*rand && rect.width >= tooltipRect.width + 2*rand) {
          pos="top"
        }
        // Position bottom
        else if (bottomheight >= tooltipRect.height + 2*rand && rect.width >= tooltipRect.width + 2*rand) {
          pos="bottom"
        }
        // Position left
        else if (leftwidth >= tooltipRect.width + 2*rand && rect.height >= tooltipRect.height + 2*rand) {
          pos="left"
        }
        // Position right
        else if (rightwidth >= tooltipRect.width + 2*rand && rect.height >= tooltipRect.height + 2*rand) {
          pos="right"
        }
        this._debug('EpgTooltip: Position vordefiniert',
          { rect: rect,
            elemRect: elemRect,
            topheight: topheight,
            bottomheight: bottomheight,
            leftwidth: leftwidth,
            rightwidth: rightwidth,
            pos: pos,
            width: width,

          });
        if (pos) {
          space={rand:rand, rect: rect, topheight: topheight, bottomheight: bottomheight, leftwidth: leftwidth, rightwidth: rightwidth}
          break
        }
      }

      if (pos) {
        break;
      }
      width+=widthStep;
    }

    let ttPos={left:null, top:null, width:null, height:null, bottom:null, right:null}
    switch (pos) {
      case "top":
      case "bottom":
        ttPos.left = elemRect.left + (elemRect.width / 2) - (tooltipRect.width / 2)
        if (ttPos.left < space.rect.left+space.rand) {
          ttPos.left = space.rect.left+space.rand;
        }
        if (ttPos.left + tooltipRect.width > space.rect.left + space.rect.width-space.rand) {
          ttPos.left = space.rect.left + space.rect.width - tooltipRect.width-space.rand;
        }
        break
      case "left":
      case "right":
        ttPos.top = elemRect.top + (elemRect.height / 2) - (tooltipRect.height / 2)
        if (ttPos.top < space.rect.top+space.rand) {
          ttPos.top = space.rect.top+space.rand;
        }
        if (ttPos.top + tooltipRect.height > space.rect.top + space.rect.height-space.rand) {
          ttPos.top = space.rect.top + space.rect.height - tooltipRect.height-space.rand;
        }
        break
      }
    switch (pos) {
        case "top":
          ttPos.top = elemRect.top - tooltipRect.height - space.rand;  // ✅ Tooltip ÜBER dem Element
          break
        case "bottom":
          ttPos.top = elemRect.bottom + space.rand;  // ✅ Tooltip UNTER dem Element
          break
        case "left":
          ttPos.left = elemRect.left - (tooltipRect.width + space.rand);  // ✅ Tooltip LINKS vom Element
          break
        case "right":
          ttPos.left = elemRect.right + space.rand;  // ✅ Tooltip RECHTS vom Element
          break
        default:
          ttPos.left = ((rects[0].left - elemRect.left) > (rects[0].right - elemRect.right)) ? rects[0].left + rand : rects[0].left+rects[0].width - tooltipRect.width - rand;
          ttPos.top = rects[0].top + rand;
        }

    this._debug('EpgTooltip: Position berechnet', { that: this,pos: pos, ttPos: ttPos, space: space, width: width, rects: rects, elemRect: elemRect, tooltipRect: tooltipRect });

    // Setze die Position
    this.style.left = ttPos.left ? `${ttPos.left}px` : ``;
    this.style.top = ttPos.top ? `${ttPos.top}px` : ``;
    // right und bottom werden nicht mehr verwendet, da wir position: fixed mit left/top verwenden

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
