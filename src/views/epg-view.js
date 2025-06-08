import { html, css, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { EPGViewBase } from '../lib/epgElements/epg-view-base';
import { EPGTimebar } from '../lib/epgElements/epg-timebar';
import { EPGChannelList } from '../lib/epgElements/epg-channel-list';
import { EPGProgramList } from '../lib/epgElements/epg-program-list';

export class EPGView extends LitElement {
  static properties = {
    config: { type: Object },
    epgData: { type: Array },
    selectedChannel: { type: String },
    currentTime: { type: Number },
    startTime: { type: Number },
    endTime: { type: Number },
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
  `;

  constructor() {
    super();
    this.config = {};
    this.epgData = [];
    this.selectedChannel = '';
    this.currentTime = Math.floor(Date.now() / 1000);
    this.startTime = 0;
    this.endTime = 0;
    this._calculateTimeRange();
  }

  updated(changedProperties) {
    if (changedProperties.has('epgData')) {
      this._calculateTimeRange();
    }
  }

  _calculateTimeRange() {
    if (!this.epgData || this.epgData.length === 0) {
      this.startTime = this.currentTime;
      this.endTime = this.currentTime + 7200; // 2 Stunden
      return;
    }

    let minTime = Infinity;
    let maxTime = -Infinity;

    this.epgData.forEach(channel => {
      if (channel.epg && channel.epg.length > 0) {
        channel.epg.forEach(program => {
          minTime = Math.min(minTime, program.start);
          maxTime = Math.max(maxTime, program.end);
        });
      }
    });

    this.startTime = minTime === Infinity ? this.currentTime : minTime;
    this.endTime = maxTime === -Infinity ? this.currentTime + 7200 : maxTime;
  }

  _onChannelSelected(event) {
    this.selectedChannel = event.detail.channel.id;
    this.dispatchEvent(
      new CustomEvent('channel-selected', {
        detail: { channel: event.detail.channel },
        bubbles: true,
        composed: true,
      })
    );
  }

  _onProgramSelected(event) {
    this.dispatchEvent(
      new CustomEvent('program-selected', {
        detail: { program: event.detail.program },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    const selectedChannelData = this.epgData.find(channel => channel.id === this.selectedChannel);
    const programs = selectedChannelData?.epg || [];

    return html`
      <epg-view-base>
        <div slot="header">
          <h2>${this.config.title || 'EPG'}</h2>
        </div>
        <epg-channel-list
          slot="channels"
          .channels=${this.epgData}
          .selectedChannel=${this.selectedChannel}
          @channel-selected=${this._onChannelSelected}
        ></epg-channel-list>
        <epg-timebar
          slot="timebar"
          .startTime=${this.startTime}
          .endTime=${this.endTime}
          .currentTime=${this.currentTime}
        ></epg-timebar>
        <epg-program-list
          slot="programs"
          .programs=${programs}
          .currentTime=${this.currentTime}
          .startTime=${this.startTime}
          .endTime=${this.endTime}
          @program-selected=${this._onProgramSelected}
        ></epg-program-list>
      </epg-view-base>
    `;
  }
}

customElements.define('epg-view', EPGView);
