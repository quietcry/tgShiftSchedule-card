import { LitElement, html, css } from 'lit';

export class EpgBox extends LitElement {
  static properties = {
    channels: { type: Array },
    programs: { type: Array },
    currentTime: { type: Number },
    timeWindow: { type: Number },
    showChannel: { type: Boolean },
    showTime: { type: Boolean },
    showDuration: { type: Boolean },
    showTitle: { type: Boolean },
    showDescription: { type: Boolean },
  };

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      overflow: auto;
      position: relative;
    }
  `;

  render() {
    return html`
      <slot name="content"></slot>
    `;
  }
}

customElements.define('epg-box', EpgBox);