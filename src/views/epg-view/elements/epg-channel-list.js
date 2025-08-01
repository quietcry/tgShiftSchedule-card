import { html, css } from 'lit';
import { EpgElementBase } from './epg-element-base.js';

export class EpgChannelList extends EpgElementBase {
  static className = 'EpgChannelList';
  static properties = {
    ...super.properties,
    channels: { type: Array },
    selectedChannel: { type: String },
    showChannelGroups: { type: Boolean },
  };

  static styles = [
    super.styles,
    css`
      :host {
        display: block;
        width: 100%;
        height: auto; /* Automatische Höhe basierend auf Inhalt */
      }
      .channel-list {
        display: flex;
        flex-direction: column;
        height: auto; /* Automatische Höhe basierend auf Inhalt */
      }
      .channel-item {
        padding: var(--epg-padding);
        border-bottom: 1px solid var(--epg-border-color);
        border-radius: var(--epg-radius);
        cursor: pointer;
        height: var(--epg-row-height);
        display: flex;
        align-items: center;
        box-sizing: border-box;
      }
      .channel-item:hover {
        background-color: var(--epg-hover-bg);
      }
      .channel-item.selected {
        background-color: var(--epg-active-bg);
      }
      .channel-name {
        font-weight: bold;
        color: var(--epg-text-color);
      }
    `,
  ];

  constructor() {
    super();
    this.channels = [];
    this.selectedChannel = '';
    this.showChannelGroups = false;
  }

  _onChannelClick(channel) {
    this.dispatchEvent(
      new CustomEvent('channel-selected', {
        detail: { channel },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    // Neue Hilfsfunktionen für die flache Struktur
    const isGroup = item => item && item.type === 'group' && typeof item.pattern === 'string';
    const isPattern = item => item && item.type === 'channel' && typeof item.pattern === 'string';

    return html`
      <div class="channel-list">
        ${this.channels.map(item =>
          isGroup(item)
            ? html`
                <div class="channelGroup">${item.name}</div>
                ${item.channels.map(
                  channel => html`
                    <div
                      class="channel-item ${channel.id === this.selectedChannel ? 'selected' : ''}"
                      @click=${() => this._onChannelClick(channel)}
                    >
                      <div class="channel-name">${channel.channeldata?.name || channel.name}</div>
                    </div>
                  `
                )}
              `
            : isPattern(item)
              ? html`
                  ${item.channels.map(
                    channel => html`
                      <div
                        class="channel-item ${channel.id === this.selectedChannel
                          ? 'selected'
                          : ''}"
                        @click=${() => this._onChannelClick(channel)}
                      >
                        <div class="channel-name">${channel.channeldata?.name || channel.name}</div>
                      </div>
                    `
                  )}
                `
              : null
        )}
      </div>
    `;
  }
}

if (!customElements.get('epg-channel-list')) {
customElements.define('epg-channel-list', EpgChannelList);
}
