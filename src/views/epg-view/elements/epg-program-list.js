import { html, css } from 'lit';
import { EpgElementBase } from './epg-element-base.js';
import './epg-program-item.js';

export class EpgProgramList extends EpgElementBase {
  static properties = {
    ...super.properties,
    programs: { type: Array },
    scale: { type: Number },
  };

  static styles = [
    super.styles,
    css`
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
      .program-list {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      .program-item {
        padding: var(--epg-padding);
        border-bottom: 1px solid var(--epg-border-color);
        cursor: pointer;
        transition: background-color 0.2s;
        height: var(--epg-row-height);
        display: flex;
        flex-direction: column;
        justify-content: center;
        box-sizing: border-box;
      }
      .program-item:hover {
        background-color: var(--epg-hover-bg);
      }
      .program-item.current {
        background-color: var(--epg-current-bg);
      }
      .program-time {
        font-size: 12px;
        color: var(--epg-time-color);
        margin-bottom: 4px;
      }
      .program-title {
        font-weight: bold;
        color: var(--epg-text-color);
        margin-bottom: 4px;
      }
      .program-description {
        font-size: 12px;
        color: var(--epg-description-color);
      }
    `,
  ];

  constructor() {
    super();
    this.programs = [];
    this.scale = 1;
  }

  _formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  _isCurrentProgram(program) {
    return this.currentTime >= program.start && this.currentTime < program.end;
  }

  _calculateProgramPosition(program) {
    const totalDuration = this.endTime - this.startTime;
    const startPosition = ((program.start - this.startTime) / totalDuration) * 100;
    const duration = program.end - program.start;
    const width = (duration / totalDuration) * 100;
    return { startPosition, width };
  }

  _onProgramClick(program) {
    this.dispatchEvent(
      new CustomEvent('program-selected', {
        detail: { program },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      <div class="program-list">
        ${this.programs.map(program => {
          const { startPosition, width } = this._calculateProgramPosition(program);
          return html`
            <div
              class="program-item ${this._isCurrentProgram(program) ? 'current' : ''}"
              @click=${() => this._onProgramClick(program)}
              style="margin-left: ${startPosition}%; width: ${width}%"
            >
              <div class="program-time">
                ${this._formatTime(program.start)} - ${this._formatTime(program.end)}
              </div>
              <div class="program-title">${program.title}</div>
              ${program.description
                ? html` <div class="program-description">${program.description}</div> `
                : ''}
            </div>
          `;
        })}
      </div>
    `;
  }
}

customElements.define('epg-program-list', EpgProgramList);
