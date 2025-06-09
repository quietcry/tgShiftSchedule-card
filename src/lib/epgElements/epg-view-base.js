import { html, css, LitElement } from 'lit';

export class EPGViewBase extends LitElement {
  static properties = {
    config: { type: Object },
    epgData: { type: Array },
  };

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      --epg-header-bg: #f5f5f5;
      --epg-border-color: #ddd;
      --epg-channel-width: 200px;
      --epg-timebar-height: 30px;
      --epg-timebar-bg: #f0f0f0;
      --epg-now-marker-color: red;
      --epg-text-color: #333;
      --epg-hover-bg: #f5f5f5;
      --epg-active-bg: #e0e0e0;
      --epg-program-bg: white;
      --epg-current-bg: #e8f0fe;
      --epg-time-color: #666;
      --epg-description-color: #666;
    }

    .epg-container {
      display: grid;
      grid-template-areas:
        'header header'
        'channels timebar'
        'channels programs';
      grid-template-columns: var(--epg-channel-width) 1fr;
      grid-template-rows: auto var(--epg-timebar-height) 1fr;
      height: 100%;
      width: 100%;
      overflow: hidden;
    }

    .epg-header {
      grid-area: header;
      background-color: var(--epg-header-bg);
      padding: 10px;
      border-bottom: 1px solid var(--epg-border-color);
    }

    .epg-channels {
      grid-area: channels;
      overflow-y: auto;
      border-right: 1px solid var(--epg-border-color);
    }

    .epg-timebar {
      grid-area: timebar;
      background-color: var(--epg-timebar-bg);
      border-bottom: 1px solid var(--epg-border-color);
    }

    .epg-programs {
      grid-area: programs;
      overflow: auto;
    }
  `;

  constructor() {
    super();
    this.config = {};
    this.epgData = [];
  }

  render() {
    return html`
      <div class="epg-container">
        <div class="epg-header">
          <slot name="header"></slot>
        </div>
        <div class="epg-channels">
          <slot name="channels"></slot>
        </div>
        <div class="epg-timebar">
          <slot name="timebar"></slot>
        </div>
        <div class="epg-programs">
          <slot name="programs"></slot>
        </div>
      </div>
    `;
  }
}

customElements.define('epg-view-base', EPGViewBase);
