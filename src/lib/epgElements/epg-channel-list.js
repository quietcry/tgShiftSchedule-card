import { html, css, LitElement } from 'lit';

export class EPGChannelList extends LitElement {
  static properties = {
    channels: { type: Array },
    selectedChannel: { type: String },
  };

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .channel-list {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .channel-item {
      padding: 10px;
      border-bottom: 1px solid var(--epg-border-color);
      cursor: pointer;
      transition: background-color 0.2s;
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
  `;

  constructor() {
    super();
    this.channels = [];
    this.selectedChannel = '';
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
    return html`
      <div class="channel-list">
        ${this.channels.map(
          channel => html`
            <div
              class="channel-item ${channel.id === this.selectedChannel ? 'selected' : ''}"
              @click=${() => this._onChannelClick(channel)}
            >
              <div class="channel-name">${channel.name}</div>
            </div>
          `
        )}
      </div>
    `;
  }
}

customElements.define('epg-channel-list', EPGChannelList);
