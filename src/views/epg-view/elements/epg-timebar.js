import { html, css } from 'lit';
import { EpgElementBase } from './epg-element-base.js';

export class EpgTimebar extends EpgElementBase {
  static className = 'EpgTimebar';

  static properties = {
    ...super.properties,
    timeSlots: { type: Array },
  };

  static styles = [
    super.styles,
    css`
      :host {
        --epg-border-color: black;
        --epg-time-color: black;
        display: block;
        width: 100%;
        height: 60px;
        overflow: hidden;
        margin: 0px;
        padding: 0px;
        --epg-timebar-border: 1px solid var(--epg-border-color, #ccc);
      }
      .timebar {
        position: relative;
        width: 100%;
        height: 100%;
        background-color: var(--epg-timebar-bg, #f0f0f0);
        border-bottom: 1px solid var(--epg-border-color, #ccc);
        overflow-x: auto;
        overflow-y: hidden;
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE und Edge */
      }
      .timebar::-webkit-scrollbar {
        display: none; /* Chrome, Safari, Opera */
      }
      .now-marker {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 2px;
        background-color: var(--epg-now-marker-color);
        z-index: 1;
      }
      table.epg-timebar-table {
        height: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        width: auto;
        min-width: max-content;
      }
      tr.row1 {
        height: 40% !important;
      }
      tr.row2,
      tr.row3,
      tr.row4 {
        height: 20% !important;
      }

      tr.row1 > td {
        box-sizing: border-box;
        text-align: center;
        color: var(--epg-time-color, black);
        font-size: clamp(6px, 2vw, 14px);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding: 0;
        margin: 0;
      }
      tr.row2 > td,
      tr.row3 > td,
      tr.row4 > td {
        box-sizing: border-box;
        border-right: var(--epg-timebar-border);
        padding: 0;
        margin: 0;
      }
      tr.row2 > td.nohourend {
        border-right: none;
      }
      tr.row4 > td {
        width: calc(var(--epg-scale) * var(--epg-itemwidth));
      }
      tr.row4 > td:last-child {
        border-right: none;
      }
      // /* Optional: optische Trennung der Zeilen */
      // tr.row1 > td { background: var(--epg-timebar-bg, #f0f0f0); }
      // tr.row2 > td,
      // tr.row3 > td,
      // tr.row4 > td { background: #fff; }
    `,
  ];

  constructor() {
    super();
    this.timeSlots = [];
    this.scale = null;
    this.earliestProgramStart = null;
    this.latestProgramStop = null;
    this.propsNumbers = ['earliestProgramStart', 'latestProgramStop', 'scale'];
  }

  async firstUpdated() {
    await super.firstUpdated();
    this._debug('EpgTimebar: firstUpdated', {
      earliestProgramStart: this.earliestProgramStart,
      latestProgramStop: this.latestProgramStop,
      scale: this.scale,
    });
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    // Prüfe ob relevante Properties geändert wurden
    if (
      changedProperties.has('earliestProgramStart') ||
      changedProperties.has('latestProgramStop') ||
      changedProperties.has('scale')
    ) {
      this._debug('EpgTimebar: Relevante Properties geändert', {
        earliestProgramStart: this.earliestProgramStart,
        latestProgramStop: this.latestProgramStop,
        scale: this.scale,
        changedProperties: Array.from(changedProperties.keys()),
      });
    }
  }

  /**
   * Callback für Änderungen in der epg-box (über registerInformMeAtViewChanges)
   * @param {Object} changedProperties - Geänderte Properties
   */
  onTimeBarValuesChanged(changedProperties) {
    this._debug('EpgTimebar: Werte-Änderungen von epg-box empfangen', {
      changedProperties: Array.from(changedProperties.keys()),
      currentValues: {
        earliestProgramStart: this.earliestProgramStart,
        latestProgramStop: this.latestProgramStop,
        scale: this.scale,
      },
    });

    // Setze die Werte direkt, da sie keine Lit-Properties mehr sind
    let updated = false;

    // Schleife über alle relevanten Properties
    for (const prop of this.propsNumbers) {
      if (
        changedProperties.has(prop) &&
        changedProperties.get(prop) !== undefined &&
        changedProperties.get(prop) !== null
      ) {
        const newValue = changedProperties.get(prop);
        if (this[prop] !== newValue) {
          this[prop] = newValue;
          updated = true;
        }
      }
    }

    // Trigger Update nur wenn sich Werte geändert haben
    if (updated) {
      this._debug('EpgTimebar: Timebar-relevante Änderungen erkannt, aktualisiere Rendering');
      this.requestUpdate();
    }
  }

  _createSlot(type, start, end) {
    const viertel = 900;
    const width = end - start;
    let row4 = [];
    let row2 = [];
    let row3 = [];
    let row1 = [];
    if (width <= 0) {
      return null;
    }
    const timetext = this._formatTime(start);
    const viertels = Math.floor(width / viertel);
    const viertelsRest = width % viertel;
    const cols4 = viertels + (viertelsRest > 0 ? 1 : 0);
    let viertelcounter = 0;

    if (type == 'start') {
      if (viertelsRest > 0) {
        row4.push(
          html`<td
            class="tabcell"
            groupmarker="${timetext}"
            style="--epg-itemwidth: ${viertelsRest}px"
          ></td>`
        );
      }
      if (cols4 % 2 != 0) {
        viertelcounter++;
        row2.push(
          html`<td
            class="tabcell ${viertelcounter == cols4 ? 'hourend' : 'nohourend'}"
            groupmarker="${timetext}"
            colspan="1"
          ></td>`
        );
        row3.push(html`<td class="tabcell" groupmarker="${timetext}" colspan="1"></td>`);
      }
    }
    for (let i = 0; i < cols4; i++) {
      row4.push(
        html`<td
          class="tabcell"
          groupmarker="${timetext}"
          style="--epg-itemwidth: ${viertel}px"
        ></td>`
      );
      if (i % 2 == 0) {
        viertelcounter += 2;
        row2.push(
          html`<td
            class="tabcell ${viertelcounter == cols4 ? 'hourend' : 'nohourend'}"
            cols="${cols4}"
            groupmarker="${timetext}"
            colspan="2"
          ></td>`
        );
        row3.push(html`<td class="tabcell" groupmarker="${timetext}" colspan="2"></td>`);
      }
    }

    if (type == 'end') {
      if (viertelsRest > 0) {
        row4.push(
          html`<td
            class="tabcell"
            groupmarker="${timetext}"
            style="--epg-itemwidth: ${viertelsRest}px"
          ></td>`
        );
      }
      if (cols4 % 2 != 0) {
        row2.push(
          html`<td class="tabcell" cols="${cols4}" groupmarker="${timetext}" colspan="1"></td>`
        );
        row3.push(html`<td class="tabcell" groupmarker="${timetext}" colspan="1"></td>`);
      }
    }
    if (width >= viertel * 2) {
      row1.push(
        html`<td class="tabcell" groupmarker="${timetext}" colspan="${cols4}">${timetext}</td>`
      );
    } else {
      row1.push(html`<td class="tabcell" groupmarker="${timetext}" colspan="${cols4}"></td>`);
    }

    return {
      row1: row1,
      row2: row2,
      row3: row3,
      row4: row4,
    };
  }
  _createTimeSlots() {
    const viertel = 900;
    const startDate = new Date(this.earliestProgramStart * 1000);
    const endDate = new Date(this.latestProgramStop * 1000);

    // Berechne die nächste volle halbe Stunde (xx:30) nach startDate
    let firstHalfHour;
    if (startDate.getMinutes() < 30) {
      firstHalfHour = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
        startDate.getHours(),
        30,
        0,
        0
      );
    } else {
      firstHalfHour = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
        startDate.getHours() + 1,
        30,
        0,
        0
      );
    }
    const firstHalfHourSeconds = firstHalfHour.getTime() / 1000;

    // Berechne die letzte volle halbe Stunde (xx:30) vor endDate
    let lastHalfHour;
    if (endDate.getMinutes() < 30) {
      lastHalfHour = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate(),
        endDate.getHours() - 1,
        30,
        0,
        0
      );
    } else {
      lastHalfHour = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate(),
        endDate.getHours(),
        30,
        0,
        0
      );
    }
    const lastHalfHourSeconds = lastHalfHour.getTime() / 1000;

    let slots = [];
    // Start-Slot
    slots.push(this._createSlot('start', this.earliestProgramStart, firstHalfHourSeconds));
    // Mittlere Slots (volle Stunden)
    let stunde = firstHalfHourSeconds;
    while (stunde < lastHalfHourSeconds) {
      slots.push(this._createSlot('middle', stunde, stunde + viertel * 4));
      stunde += viertel * 4;
    }
    // End-Slot
    slots.push(this._createSlot('end', lastHalfHourSeconds, this.latestProgramStop));
    let row1 = [];
    let row2 = [];
    let row3 = [];
    let row4 = [];
    for (const slot of slots) {
      if (slot !== null && slot !== undefined) {
        row1.push(...slot.row1);
        row2.push(...slot.row2);
        row3.push(...slot.row3);
        row4.push(...slot.row4);
      }
    }
    // NEUES TABLE-SKELETT BEGINN
    return html`
      <table class="epg-timebar-table">
        <tr class="row1">
          ${row1}
        </tr>
        <tr class="row2">
          ${row2}
        </tr>
        <tr class="row3">
          ${row3}
        </tr>
        <tr class="row4">
          ${row4}
        </tr>
      </table>
    `;
    // return html`
    //   <div class="time-slot tab">
    //     <div class="tabrow">
    //       ${slots}
    //     </div>
    //   </div>
    // `;
  }

  _formatTime(timestamp) {
    // Auf nächste volle Stunde aufrunden
    let date = new Date(timestamp * 1000);
    if (date.getMinutes() > 0 || date.getSeconds() > 0 || date.getMilliseconds() > 0) {
      date.setHours(date.getHours() + 1);
      date.setMinutes(0, 0, 0);
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  _calculateNowMarkerPosition() {
    if (!this.earliestProgramStart || !this.latestProgramStop || !this.currentTime) {
      return -100; // Außerhalb des sichtbaren Bereichs
    }

    if (this.currentTime < this.earliestProgramStart || this.currentTime > this.latestProgramStop) {
      return -100; // Außerhalb des sichtbaren Bereichs
    }

    const totalDuration = this.latestProgramStop - this.earliestProgramStart;
    const currentPosition = this.currentTime - this.earliestProgramStart;
    return (currentPosition / totalDuration) * 100;
  }

  render() {
    let allFine = true;
    for (const prop of this.propsNumbers) {
      if (!this[prop] || isNaN(this[prop])) {
        allFine = false;
        break;
      }
    }
    if (!allFine) {
      return html`<div class="timebar">Loading...</div>`;
    }

    const nowMarkerPosition = this._calculateNowMarkerPosition();

    //   <epg-timemarker
    //   .earliestProgramStart=${this.earliestProgramStart}
    //   .latestProgramStop=${this.latestProgramStop}
    //   .currentTime=${this.currentTime}
    //   .scale=${this.scale}
    //   style="left: ${nowMarkerPosition}%"
    // ></epg-timemarker>

    return html`
      <div class="timebar" style="--epg-scale: ${this.scale}">${this._createTimeSlots()}</div>
    `;
  }
}

if (!customElements.get('epg-timebar')) {
  customElements.define('epg-timebar', EpgTimebar);
}
