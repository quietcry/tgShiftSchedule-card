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
    }

    .epgbox {
      display: grid;
      grid-template-columns: 1fr;
      grid-template-rows: 1fr;
      grid-template-areas:
        "scrollBox";
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .scrollBox {
      grid-area: scrollBox;
      overflow: auto;
      position: relative;
    }
  `;

  render() {
    return html`
      <div class="epgbox">
        <div class="scrollBox">
          <slot name="content"></slot>
        </div>
      </div>
    `;
  }
}

customElements.define('epg-box', EpgBox);