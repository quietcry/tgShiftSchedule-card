import { html, css } from 'lit';
import { EpgElementBase } from './epg-element-base.js';

export class EpgProgramItem extends EpgElementBase {
  static className = 'EpgProgramItem';
  static properties = {
    ...super.properties,
    start: { type: Number },
    stop: { type: Number },
    duration: { type: Number },
    title: { type: String },
    description: { type: String },
    shortText: { type: String },

    showTime: { type: Boolean },
    showDuration: { type: Boolean },
    showDescription: { type: Boolean },
    showShortText: { type: Boolean },
    type: { type: String }, // 'endgap', 'startgap', 'item', 'title' oder undefined/null
    rowIndex: { type: Number },
    itemIndex: { type: Number },
  };

  constructor() {
    super();

    this.start = 0;
    this.stop = 0;
    this.duration = 0;
    this.title = '';
    this.description = '';
    this.shortText = '';

    this.showTime = true;
    this.showDuration = true;
    this.showDescription = true;
    this.showShortText = false;
    this.type = undefined; // Standard: normales Programmitem
    this.rowIndex = 0;
    this.itemIndex = 0;

    // Tooltip-Event-Filterung
    this._lastTooltipAction = null;
    this._tooltipTimer = null;
    this._isTooltipVisible = false; // Tracke den aktuellen Tooltip-Status
    this._isUpdating = false; // Verhindert Events während Lit-Updates
    this.dM = `${this.constructor.className}: `; // debugMsgPrefix - Prefix für Debug-Nachrichten
    this._debug(`${this.dM}EpgProgramItem-Modul wird geladen`);
  }

  // Getter für Kompatibilität
  get isGap() {
    return this.type === 'startgap' || this.type === 'endgap' || this.type === 'fillergap';
  }

  get isGroup() {
    return this.type === 'group';
  }

  /**
   * Aktualisiert die CSS-Variablen für die Breitenberechnung
   * Wird aufgerufen, wenn start/stop direkt über JavaScript gesetzt werden
   */
  updateCSSVariables() {
    // Debug: Werte vor dem Update
    const computedStyleBefore = getComputedStyle(this);
    const cssStartBefore = computedStyleBefore.getPropertyValue('--start');
    const cssStopBefore = computedStyleBefore.getPropertyValue('--stop');
    const cssScaleBefore = computedStyleBefore.getPropertyValue('--epg-scale');
    const widthBefore = this.offsetWidth;
    this._debug('EpgProgramItem: VOR CSS-Update', {
      id: this.id,
      start: this.start,
      stop: this.stop,
      type: this.type,
      isGap: this.isGap,
      cssStart: cssStartBefore,
      cssStop: cssStopBefore,
      cssScale: cssScaleBefore,
      width: widthBefore,
      duration: this.stop - this.start,
      calculatedWidth: `(${this.stop} - ${this.start}) * ${this.scale || 'undefined'} * 1px`,
    });

    // Setze CSS-Variablen für automatische Breitenberechnung
    this.style.setProperty('--start', this.start);
    this.style.setProperty('--stop', this.stop);

    // Debug: CSS-Variablen gesetzt
    this._debug('EpgProgramItem: CSS-Variablen gesetzt', {
      '--start': this.start,
      '--stop': this.stop,
      '--epg-scale': getComputedStyle(this).getPropertyValue('--epg-scale'),
    });

    // Debug: Werte nach dem Update
    const computedStyleAfter = getComputedStyle(this);
    const cssStartAfter = computedStyleAfter.getPropertyValue('--start');
    const cssStopAfter = computedStyleAfter.getPropertyValue('--stop');
    const cssScaleAfter = computedStyleAfter.getPropertyValue('--epg-scale');
    const widthAfter = this.offsetWidth;
    this._debug('EpgProgramItem: NACH CSS-Update', {
      id: this.id,
      start: this.start,
      stop: this.stop,
      type: this.type,
      isGap: this.isGap,
      cssStart: cssStartAfter,
      cssStop: cssStopAfter,
      cssScale: cssScaleAfter,
      width: widthAfter,
      cssCalc: `calc((${cssStopAfter} - ${cssStartAfter}) * ${cssScaleAfter} * 1px)`,
    });
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    this._debug('EpgProgramItem: updated requested', changedProperties);

    // Setze nur die CSS-Variablen für die automatische Breitenberechnung
    if (changedProperties.has('start') || changedProperties.has('stop')) {
      this.updateCSSVariables();

      // CSS-Klassen für Gap-Elemente
      if (this.isGap) {
        this.classList.add('gap-element');
      } else {
        this.classList.remove('gap-element');
      }
    }

    // Setze CSS-Klassen basierend auf dem type-Wert für querySelector
    if (changedProperties.has('type')) {
      // Entferne alle type-spezifischen Klassen
      this.classList.remove(
        'type-startgap',
        'type-endgap',
        'type-item',
        'type-noprogram',
        'type-title',
        'type-fillergap',
        'type-group'
      );

      // Füge die entsprechende Klasse hinzu
      if (this.type) {
        this.classList.add(`type-${this.type}`);
      }
    }
  }

  render() {
    // Aktualisiere CSS-Variablen vor dem Rendern
    this.updateCSSVariables();

    // Für Gap-Elemente: Zeige nur einen leeren Bereich
    if (this.isGap) {
      return html`
        <div class="programSlot gap-slot">
          <!-- Leerer Bereich für Gap -->
        </div>
      `;
    }

    // Für Gruppen-Header: Zeige nur den Titel
    if (this.isGroup) {
      return html`
        <div class="programSlot group-slot">
          ${this.title ? html`<div class="groupTitle">${this.title}</div>` : ''}
        </div>
      `;
    }

    // Normales Programm-Element
    return html`
      <div
        class="programSlot"
        @click=${this._onClick}
        @mouseenter=${this._onMouseEnter}
        @mouseleave=${this._onMouseLeave}
      >
        ${this.title ? html`<div class="programTitle">${this.title}</div>` : ''}
        ${this.showShortText && this.shortText
          ? html`<div class="programShortText">${this.shortText}</div>`
          : ''}
        ${this.showTime
          ? html`
              <div class="programTime">
                ${this._formatTime(new Date(this.start * 1000))} -
                ${this._formatTime(new Date(this.stop * 1000))}
              </div>
            `
          : ''}
        ${this.showDuration
          ? html` <div class="programDuration">${this._formatDuration(this.duration)}</div> `
          : ''}
        ${this.showDescription && this.description
          ? html` <div class="programDescription">${this.description}</div> `
          : ''}
      </div>
    `;
  }

  _onClick() {
    // Gap-Elemente haben keine Klick-Events
    if (this.isGap) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent('program-selected', {
        detail: {
          start: this.start,
          stop: this.stop,
          duration: this.duration,
          title: this.title,
          description: this.description,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Lifecycle: Wird aufgerufen, wenn das Element aktualisiert wird
   */
  updated(changedProperties) {
    super.updated(changedProperties);

    // Aktualisiere CSS-Variablen wenn start/stop sich ändern
    if (changedProperties.has('start') || changedProperties.has('stop')) {
      this.updateCSSVariables();
    }

    // Markiere Update als abgeschlossen
    this._isUpdating = false;
  }

  _onMouseEnter() {
    // Gap-Elemente haben keine Hover-Effekte
    if (this.isGap) {
      return;
    }

    // Verhindere Events während Lit-Updates
    if (this._isUpdating) {
      this._debug('EpgProgramItem: Tooltip-Event übersprungen - Lit-Update läuft', {
        title: this.title,
      });
      return;
    }

    // Nur senden wenn der Tooltip noch nicht sichtbar ist UND kein Timer läuft
    if (!this._isTooltipVisible && !this._tooltipTimer) {
      this._isUpdating = true; // Markiere Update als gestartet
      this._sendDelayedTooltipEvent('show');
      this._debug('EpgProgramItem: Tooltip-Event geplant (show)', {
        title: this.title,
        isGap: this.isGap,
        isGroup: this.isGroup,
      });
    } else {
      this._debug('EpgProgramItem: Tooltip-Event übersprungen - bereits geplant oder sichtbar', {
        title: this.title,
        isTooltipVisible: this._isTooltipVisible,
        hasTimer: !!this._tooltipTimer,
      });
    }
  }

  _onMouseLeave() {
    // Gap-Elemente haben keine Hover-Effekte
    if (this.isGap) {
      return;
    }

    // Stoppe den verzögerten Tooltip-Timer
    if (this._tooltipTimer) {
      clearTimeout(this._tooltipTimer);
      this._tooltipTimer = null;
      this._debug('EpgProgramItem: Tooltip-Timer gestoppt');
    }

    // Nur senden wenn der Tooltip sichtbar ist
    if (this._isTooltipVisible) {
      this._sendTooltipEvent('hide');
      this._debug('EpgProgramItem: Tooltip-Event gesendet (hide)', {
        title: this.title,
      });
    }

    // Berechne die ursprünglichen Farben neu
    // const isOddRow = this.rowIndex % 2 === 1;
    // const isOddItem = this.itemIndex % 2 === 1;
    // let bgColor, textColor;
    // if (this.isCurrent) {
    //   bgColor = 'var(--epg-accent)';
    //   textColor = 'var(--epg-text-color)';
    // } else if (isOddRow) {
    //   if (isOddItem) {
    //     bgColor = 'var(--epg-odd-program-odd-bg)';
    //     textColor = 'var(--epg-odd-program-odd-text)';
    //   } else {
    //     bgColor = 'var(--epg-odd-program-even-bg)';
    //     textColor = 'var(--epg-odd-program-even-text)';
    //   }
    // } else {
    //   if (isOddItem) {
    //     bgColor = 'var(--epg-even-program-odd-bg)';
    //     textColor = 'var(--epg-even-program-even-text)';
    //   } else {
    //     bgColor = 'var(--epg-even-program-even-bg)';
    //     textColor = 'var(--epg-even-program-even-text)';
    //   }
    // }
    // this.style.backgroundColor = bgColor;
    // this.style.color = textColor;
  }

  /**
   * Sendet Tooltip-Events an die Kartenebene
   */
  _sendTooltipEvent(action) {
    if (this.isGap || this.isGroup) return;

    // Aktualisiere den lokalen Status
    if (action === 'show') {
      this._isTooltipVisible = true;
    } else if (action === 'hide') {
      this._isTooltipVisible = false;
    }

    // Nur senden wenn sich die Action geändert hat
    if (this._lastTooltipAction === action) {
      this._debug('EpgProgramItem: Tooltip-Event ignoriert - gleiche Action', { action });
      return;
    }

    this._lastTooltipAction = action;
    this.dispatchEvent(
      new CustomEvent('tooltip-event', {
        detail: {
          action: action,
          element: this,
          data: {
            title: this.title,
            shortText: this.shortText,
            description: this.description,
            start: this.start,
            stop: this.stop,
            duration: this.duration,
          },
        },
        bubbles: true,
        composed: true,
      })
    );
    this._debug('EpgProgramItem: Tooltip-Event gesendet', { action });
  }

  /**
   * Sendet verzögerte Tooltip-Events (für mouseenter)
   */
  _sendDelayedTooltipEvent(action) {
    if (this.isGap || this.isGroup) return;

    // Stoppe vorherige Timer falls vorhanden
    if (this._tooltipTimer) {
      clearTimeout(this._tooltipTimer);
    }

    // Längere Verzögerung für besseres Debouncing (500ms statt 200ms)
    this._tooltipTimer = setTimeout(() => {
      this._sendTooltipEvent(action);
    }, 500);
  }

  /**
   * Formatiert die Zeit für den Tooltip
   */
  _formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Formatiert die Dauer für die Anzeige
   */
  _formatDuration(duration) {
    if (!duration) return '';
    const minutes = Math.round(duration / 60);
    if (minutes < 60) {
      return `${minutes} Min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}min`;
    }
  }

  static styles = [
    super.styles,
    css`
      :host {
        /* Das epg-program-item erbt die Höhe von der programRow */
        height: 100%;
        display: flex;
        align-items: stretch;
        /* Breite wird automatisch über CSS-Variable --epg-scale berechnet */
        width: calc((var(--stop, 0) - var(--start, 0)) * var(--epg-scale, 1) * 1px);
        min-width: 0;
        /* Zero-width wird über CSS gehandhabt */
        opacity: calc((var(--stop, 0) - var(--start, 0)) * var(--epg-scale, 1) > 0 ? 1: 0);
      }

      .programSlot {
        padding: var(--epg-padding);
        border: 1px solid var(--epg-border-color);
        margin: 0;
        cursor: pointer;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: center;
        overflow: hidden;
        border-radius: var(--epg-radius);
        flex: 1;
        height: 100%;
        transition:
          background-color 0.2s ease,
          color 0.2s ease;
      }

      /* Gap-Elemente: Leere Bereiche zwischen Programmen */
      :host(.gap-element) .programSlot {
        padding: 0;
        border: none;
        margin: 0;
        background: transparent;
        cursor: default;
        /* Breite wird über CSS-Variable berechnet */
      }

      .gap-slot {
        background: transparent !important;
        border: none !important;
        cursor: default !important;
      }

      /* Gruppen-Header: Spezielle Formatierung für Gruppen */
      :host(.type-group) .programSlot {
        background-color: var(--epg-group-bg, #e8f4fd);
        border: 1px solid var(--epg-group-border, #b3d9ff);
        color: var(--epg-group-text, #0066cc);
        cursor: default;
        font-weight: bold;
      }

      .group-slot {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1em;
        text-align: center;
      }

      .groupTitle {
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .programTitle {
        font-weight: bold;
        margin-top: 1px;
        font-size: 0.9em;
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .programShortText {
        font-size: 0.8em;
        margin-top: 1px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: inherit;
        font-style: italic;
      }

      .programTime {
        font-size: 0.8em;
        margin-top: 1px;
        color: inherit;
        opacity: 0.8;
      }

      .programDuration {
        font-size: 0.7em;
        margin-top: 1px;
        color: inherit;
        opacity: 0.7;
      }

      .programDescription {
        font-size: 0.8em;
        margin-top: 2px;
        line-height: 1.3;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: inherit;
        opacity: 0.9;
      }


        font-size: 0.8em;
        margin-top: 1px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: inherit;
      }

      .programDuration {
        font-size: 0.8em;
        margin-top: 1px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: inherit;
      }

      .programDescription {
        font-size: 0.8em;
        line-height: 1.3;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        color: inherit;
      }
    `,
  ];
}

if (!customElements.get('epg-program-item')) {
  customElements.define('epg-program-item', EpgProgramItem);
}
