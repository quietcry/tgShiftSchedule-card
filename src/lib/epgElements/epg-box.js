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
      grid-template-columns: auto 1fr;
      grid-template-rows: auto 1fr;
      grid-template-areas:
        "superbutton timeBar"
        "scrollBox scrollBox";
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .superbutton {
      grid-area: superbutton;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 8px;
      background-color: var(--primary-background-color);
      border-right: 1px solid var(--divider-color);
    }

    .timeBar {
      grid-area: timeBar;
      display: flex;
      align-items: center;
      padding: 8px;
      background-color: var(--primary-background-color);
      border-bottom: 1px solid var(--divider-color);
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
        <div class="superbutton">
          <slot name="superbutton"></slot>
        </div>
        <div class="timeBar">
          <slot name="timebar"></slot>
        </div>
        <div class="scrollBox">
          <slot name="content"></slot>
        </div>
      </div>
    `;
  }
}

customElements.define('epg-box', EpgBox);