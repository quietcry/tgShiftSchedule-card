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
    selectedChannel: { type: String },
  };

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      overflow: auto;
      position: relative;
    }

    .timeSlot {
      padding: 4px 8px;
      border-right: 1px solid var(--divider-color);
      min-width: 60px;
      text-align: center;
    }

    .timeSlot.current {
      background-color: var(--accent-color);
      color: var(--text-primary-color);
    }

    .channelRow {
      padding: 8px;
      border-bottom: 1px solid var(--divider-color);
      cursor: pointer;
    }

    .channelRow.selected {
      background-color: var(--accent-color);
      color: var(--text-primary-color);
    }

    .programSlot {
      padding: 8px;
      border: 1px solid var(--divider-color);
      margin: 4px;
      cursor: pointer;
      min-width: 100px;
    }

    .programSlot.current {
      background-color: var(--accent-color);
      color: var(--text-primary-color);
    }

    .programTitle {
      font-weight: bold;
      margin-bottom: 4px;
    }

    .programTime {
      font-size: 0.8em;
      color: var(--secondary-text-color);
    }
  `;

  render() {
    return this._renderContent();
  }

  _renderContent() {
    if (!this.channels?.length) {
      return this._renderLoading();
    }

    const timeSlots = this._generateTimeSlots();

    return html`
      <div name="epgOutBox">
        <div name="epgBox">
          <div name="channelBox">
            ${this.channels.map(channel => html`
              <div class="channelRow ${this.selectedChannel === channel.id ? 'selected' : ''}"
                   @click=${() => this._onChannelSelected(channel)}>
                ${channel.name}
              </div>
            `)}
          </div>
          <div name="programBox">
            ${this.channels.map(channel => html`
              <div class="programRow">
                ${this._getProgramsForChannel(channel, timeSlots).map(program => html`
                  <div class="programSlot ${this._isCurrentProgram(program) ? 'current' : ''}"
                       style="width: ${this._calculateProgramWidth(program)}px"
                       @click=${() => this._onProgramSelected(program)}>
                    <div class="programTitle">${program.title}</div>
                    <div class="programTime">
                      ${this._formatTime(new Date(program.start))} -
                      ${this._formatTime(new Date(program.end))}
                    </div>
                  </div>
                `)}
              </div>
            `)}
          </div>
        </div>
      </div>
    `;
  }

  _renderLoading() {
    return html`
      <div class="loading">
        <ha-circular-progress indeterminate></ha-circular-progress>
        <div>Lade EPG-Daten...</div>
      </div>
    `;
  }

  _generateTimeSlots() {
    const slots = [];
    const now = new Date();
    const startTime = new Date(now);
    startTime.setHours(0, 0, 0, 0);

    for (let i = 0; i < 24; i++) {
      const slot = new Date(startTime);
      slot.setHours(i);
      slots.push(slot);
    }

    return slots;
  }

  _formatTime(date) {
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  _isCurrentTimeSlot(slot, currentTime) {
    return slot.getHours() === currentTime.getHours();
  }

  _isCurrentProgram(program) {
    const now = new Date();
    const start = new Date(program.start);
    const end = new Date(program.end);
    return now >= start && now <= end;
  }

  _calculateProgramWidth(program) {
    const start = new Date(program.start);
    const end = new Date(program.end);
    const duration = (end - start) / (1000 * 60); // Dauer in Minuten
    return (duration / 60) * 120; // 120px pro Stunde
  }

  _getProgramsForChannel(channel, timeSlots) {
    if (!channel.programs) return [];

    const startTime = timeSlots[0];
    const endTime = new Date(timeSlots[timeSlots.length - 1]);
    endTime.setHours(23, 59, 59, 999);

    return channel.programs.filter(program => {
      const programStart = new Date(program.start);
      const programEnd = new Date(program.end);
      return programStart >= startTime && programEnd <= endTime;
    });
  }

  _onChannelSelected(channel) {
    this.selectedChannel = channel.id;
    this.dispatchEvent(new CustomEvent('channel-selected', {
      detail: { channel },
      bubbles: true,
      composed: true
    }));
  }

  _onProgramSelected(program) {
    this.dispatchEvent(new CustomEvent('program-selected', {
      detail: { program },
      bubbles: true,
      composed: true
    }));
  }
}

customElements.define('epg-box', EpgBox);