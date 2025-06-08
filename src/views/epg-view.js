import { html, css } from 'lit';
import { CardBase } from '../card-base.js';

export class EPGView extends CardBase {
  static get properties() {
    return {
      ...super.properties,
      config: { type: Object },
      epgData: { type: Array },
    };
  }

  static get styles() {
    return [
      super.styles,
      css`
        .epg-container {
          padding: 16px;
        }
        .epg-item {
          padding: 8px;
          margin: 4px 0;
          border: 1px solid var(--divider-color);
          border-radius: 4px;
          cursor: pointer;
        }
        .epg-item:hover {
          background-color: var(--hover-color);
        }
        .epg-item.selected {
          background-color: var(--primary-color);
          color: var(--text-primary-color);
        }
      `,
    ];
  }

  constructor(config, epgData) {
    super();
    this.config = config;
    this.epgData = epgData;
  }

  render() {
    if (!this.epgData || this.epgData.length === 0) {
      return html`<div class="no-data">Keine EPG-Daten verfügbar</div>`;
    }

    return html`
      <div class="epg-container">
        ${this.epgData.map(
          (channel, index) => html`
            <div class="epg-item">
              <div class="channel-name">${channel.name}</div>
              ${channel.epg.map(
                program => html`
                  <div class="program">
                    <div class="time">${this._formatTime(program.start)}</div>
                    <div class="title">${program.title}</div>
                  </div>
                `
              )}
            </div>
          `
        )}
      </div>
    `;
  }

  _formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }
}
