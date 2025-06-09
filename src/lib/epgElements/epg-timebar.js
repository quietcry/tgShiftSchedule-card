import { html, css, LitElement } from 'lit';

export class EPGTimebar extends LitElement {
  static properties = {
    startTime: { type: Number },
    endTime: { type: Number },
    currentTime: { type: Number },
  };

  static styles = css`
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
    }

    .time-slot {
      flex: 1;
      text-align: center;
      padding: 5px;
      border-right: 1px solid var(--epg-border-color);
      font-size: 12px;
      color: var(--epg-time-color);
    }

    .now-marker {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 2px;
      background-color: var(--epg-now-marker-color);
      z-index: 1;
    }
  `;

  constructor() {
    super();
    this.startTime = 0;
    this.endTime = 0;
    this.currentTime = 0;
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

customElements.define('epg-timebar', EPGTimebar);
