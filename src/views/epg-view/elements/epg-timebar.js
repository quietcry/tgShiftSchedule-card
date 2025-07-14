import { html, css } from 'lit';
import { EpgElementBase } from './epg-element-base.js';

export class EpgTimebar extends EpgElementBase {
  static className = 'EpgTimebar';

  static properties = {
    ...super.properties,
    timeSlots: { type: Array },
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
      .timebar {
        display: flex;
        height: 100%;
        position: relative;
        background-color: var(--epg-timebar-bg);
        height: var(--epg-timebar-height);
      }
      .time-slot {
        flex: 1;
        text-align: center;
        padding: 5px;
        border-right: 1px solid var(--epg-border-color);
        font-size: 12px;
        color: var(--epg-time-color);
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
      }
      .now-marker {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 2px;
        background-color: var(--epg-now-marker-color);
        z-index: 1;
      }
    `,
  ];

  constructor() {
    super();
    this.timeSlots = [];
    this.scale = 1;
  }

  _formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  _calculateTimeSlots() {
    const slots = [];
    const duration = this.endTime - this.startTime;
    const slotCount = Math.ceil(duration / 1800); // 30-Minuten-Slots

    for (let i = 0; i < slotCount; i++) {
      const time = this.startTime + i * 1800;
      slots.push(time);
    }

    return slots;
  }

  _calculateNowMarkerPosition() {
    if (this.currentTime < this.startTime || this.currentTime > this.endTime) {
      return -100; // Außerhalb des sichtbaren Bereichs
    }

    const totalDuration = this.endTime - this.startTime;
    const currentPosition = this.currentTime - this.startTime;
    return (currentPosition / totalDuration) * 100;
  }

  render() {
    const timeSlots = this._calculateTimeSlots();
    const nowMarkerPosition = this._calculateNowMarkerPosition();

    return html`
      <div class="timebar">
        ${timeSlots.map(time => html` <div class="time-slot">${this._formatTime(time)}</div> `)}
        <div class="now-marker" style="left: ${nowMarkerPosition}%"></div>
      </div>
    `;
  }
}

if (!customElements.get('epg-timebar')) {
customElements.define('epg-timebar', EpgTimebar);
}
