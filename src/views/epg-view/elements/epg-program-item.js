import { html, css } from 'lit';
import { EpgElementBase } from './epg-element-base.js';

export class EpgProgramItem extends EpgElementBase {
  static className = 'EpgProgramItem';
  static properties = {
    ...super.properties,
    start: { type: Number },
    stop: { type: Number },
    duration: { type: Number },
    scale: { type: Number },
    title: { type: String },
    description: { type: String },
    shortText: { type: String },
    isCurrent: { type: Boolean },
    showTime: { type: Boolean },
    showDuration: { type: Boolean },
    showDescription: { type: Boolean },
    showShortText: { type: Boolean },
    rowIndex: { type: Number },
    itemIndex: { type: Number },
  };

  constructor() {
    super();
    this.start = 0;
    this.stop = 0;
    this.duration = 0;
    this.scale = 1;
    this.title = '';
    this.description = '';
    this.shortText = '';
    this.isCurrent = false;
    this.showTime = true;
    this.showDuration = true;
    this.showDescription = true;
    this.showShortText = false;
    this.rowIndex = 0;
    this.itemIndex = 0;
  }

  render() {
    const width = this.duration * this.scale;
    const isZeroWidth = width <= 0;

    // Berechne die Farben basierend auf Zeile und Position
    const isOddRow = this.rowIndex % 2 === 1; // 0-basiert, also ungerade Zeilen sind 1, 3, 5...
    const isOddItem = this.itemIndex % 2 === 1; // 0-basiert, also ungerade Items sind 1, 3, 5...

    let bgColor, textColor;

    if (isOddRow) {
      // Ungerade Zeile
      if (isOddItem) {
        bgColor = 'var(--epg-odd-program-odd-bg)';
        textColor = 'var(--epg-odd-program-odd-text)';
      } else {
        bgColor = 'var(--epg-odd-program-even-bg)';
        textColor = 'var(--epg-odd-program-even-text)';
      }
    } else {
      // Gerade Zeile
      if (isOddItem) {
        bgColor = 'var(--epg-even-program-odd-bg)';
        textColor = 'var(--epg-even-program-even-text)';
      } else {
        bgColor = 'var(--epg-even-program-even-bg)';
        textColor = 'var(--epg-even-program-even-text)';
      }
    }

    // Hover und Current überschreiben die normalen Farben
    if (this.isCurrent) {
      bgColor = 'var(--epg-accent)';
      textColor = 'var(--epg-text-color)';
    }

    // Bei Breite 0 alle sichtbaren Styles entfernen
    const style = isZeroWidth
      ? 'width: 0px; padding: 0; border: none; margin: 0; background: transparent;'
      : `width: ${width}px; background-color: ${bgColor}; color: ${textColor};`;

    return html`
      <div
        class="programSlot ${this.isCurrent ? 'current' : ''}"
        style="${style}"
        @click=${this._onClick}
        @mouseenter=${this._onMouseEnter}
        @mouseleave=${this._onMouseLeave}
      >
        ${!isZeroWidth
          ? html`
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
            `
          : ''}
      </div>
    `;
  }

  _onClick() {
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

  _onMouseEnter() {
    this.style.backgroundColor = 'var(--epg-hover-bg)';
    this.style.color = 'var(--epg-text-color)';
  }

  _onMouseLeave() {
    // Berechne die ursprünglichen Farben neu
    const isOddRow = this.rowIndex % 2 === 1;
    const isOddItem = this.itemIndex % 2 === 1;

    let bgColor, textColor;

    if (this.isCurrent) {
      bgColor = 'var(--epg-accent)';
      textColor = 'var(--epg-text-color)';
    } else if (isOddRow) {
      if (isOddItem) {
        bgColor = 'var(--epg-odd-program-odd-bg)';
        textColor = 'var(--epg-odd-program-odd-text)';
      } else {
        bgColor = 'var(--epg-odd-program-even-bg)';
        textColor = 'var(--epg-odd-program-even-text)';
      }
    } else {
      if (isOddItem) {
        bgColor = 'var(--epg-even-program-odd-bg)';
        textColor = 'var(--epg-even-program-odd-text)';
      } else {
        bgColor = 'var(--epg-even-program-even-bg)';
        textColor = 'var(--epg-even-program-even-text)';
      }
    }

    this.style.backgroundColor = bgColor;
    this.style.color = textColor;
  }

  static styles = [
    super.styles,
    css`
      :host {
        /* Das epg-program-item erbt die Höhe von der programRow */
        height: 100%;
        display: flex;
        align-items: stretch;
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
        height: 100%; /* Das innere div nimmt die volle Höhe des Host-Elements */
        transition:
          background-color 0.2s ease,
          color 0.2s ease;
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

customElements.define('epg-program-item', EpgProgramItem);
