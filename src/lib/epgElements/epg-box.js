import { html, css } from 'lit';
import { ViewBase } from '../../views/view-base.js';

export class EpgBox extends ViewBase {
  static properties = {
    epgData: { type: Object },
    currentTime: { type: Number },
    timeWindow: { type: Number },
    showChannel: { type: Boolean },
    showTime: { type: Boolean },
    showDuration: { type: Boolean },
    showTitle: { type: Boolean },
    showDescription: { type: Boolean },
    selectedChannel: { type: String },
    channelOrder: { type: Array }, // Array mit Kanaldefinitionen { name: string, style?: string, channels?: Array }
  };

  constructor() {
    super();
    this._channels = new Map(); // Speichert die Kanäle mit ihren Programmen
  }

  updated(changedProperties) {
    if (changedProperties.has('epgData')) {
      console.log('epg-box: Neue Daten erhalten:', this.epgData);

      if (this.epgData?.channel) {
        console.log('epg-box: Neuer Kanal wird hinzugefügt:', this.epgData.channel.name);
        this._channels.set(this.epgData.channel.id, this.epgData.channel);
        console.log(
          'epg-box: Aktuelle Kanäle:',
          Array.from(this._channels.values()).map(c => c.name)
        );
        this.requestUpdate();
      }
    }
  }

  firstUpdated() {
    super.firstUpdated();
    this._debug('EPG-Box: firstUpdated - Sende Bereitschaft-Event');

    // Sende Event, dass die EPG-Box bereit ist
    this.dispatchEvent(new CustomEvent('epg-box-ready', {
      bubbles: true,
      composed: true
    }));
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      overflow: auto;
      position: relative;
    }

    :host(.epgBox) {
      display: grid;
      grid-template-columns: auto 1fr;
      grid-template-areas: 'channelBox programBox';
    }

    .channelBox {
      grid-area: channelBox;
      min-width: 120px;
      border-right: 1px solid var(--divider-color);
    }

    .programBox {
      grid-area: programBox;
      overflow-x: auto;
    }

    .channelGroup {
      padding: 4px 8px;
      background-color: var(--primary-color);
      color: var(--text-primary-color);
      font-weight: bold;
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
    if (!this._channels.size) {
      console.log('epg-box: Erste Renderung - noch keine Daten');
      return this._renderLoading();
    }

    const { groupedChannels, ungroupedChannels } = this._groupChannels();
    console.log(
      'epg-box: Rendere mit',
      groupedChannels.length,
      'Gruppen und',
      ungroupedChannels.length,
      'ungruppierten Kanälen'
    );

    return html`
      <div class="channelBox">
        ${this._renderGroupedChannels(groupedChannels)}
        ${this._renderUngroupedChannels(ungroupedChannels)}
      </div>
      <div class="programBox">
        ${[...groupedChannels.flatMap(g => g.channels), ...ungroupedChannels].map(
          channel => html`
            <div class="programRow">
              ${this._getProgramsForChannel(channel, this._generateTimeSlots()).map(
                program => html`
                  <div
                    class="programSlot ${this._isCurrentProgram(program) ? 'current' : ''}"
                    style="width: ${this._calculateProgramWidth(program)}px"
                    @click=${() => this._onProgramSelected(program)}
                  >
                    <div class="programTitle">${program.title}</div>
                    <div class="programTime">
                      ${this._formatTime(new Date(program.start))} -
                      ${this._formatTime(new Date(program.end))}
                    </div>
                  </div>
                `
              )}
            </div>
          `
        )}
      </div>
    `;
  }

  _renderGroupedChannels(groupedChannels) {
    return groupedChannels.map(
      group => html`
        <div class="channelGroup" style="${group.style || ''}">${group.name}</div>
        ${group.channels.length > 0
          ? html`
              ${group.channels.map(
                channel => html`
                  <div
                    class="channelRow ${this.selectedChannel === channel.id ? 'selected' : ''}"
                    style="${channel.style || ''}"
                    @click=${() => this._onChannelSelected(channel)}
                  >
                    ${channel.name}
                  </div>
                `
              )}
            `
          : html` <div class="channelRow empty">Keine Kanäle in dieser Gruppe</div> `}
      `
    );
  }

  _renderUngroupedChannels(ungroupedChannels) {
    return ungroupedChannels.map(
      channel => html`
        <div
          class="channelRow ${this.selectedChannel === channel.id ? 'selected' : ''}"
          @click=${() => this._onChannelSelected(channel)}
        >
          ${channel.name}
        </div>
      `
    );
  }

  _groupChannels() {
    if (!this._channels.size) return { groupedChannels: [], ungroupedChannels: [] };

    const channels = Array.from(this._channels.values());
    const groupedChannels = [];
    const ungroupedChannels = [];
    const groupedChannelsSet = new Set();

    // Gruppiere die Kanäle
    if (this.channelOrder?.length) {
      // Erstelle die Gruppen und sortiere einzelne Kanäle
      this.channelOrder.forEach(item => {
        if (item.channels) {
          // Es ist eine Gruppe
          const groupChannels = [];

          item.channels.forEach(channelConfig => {
            const regex = new RegExp(channelConfig.name);
            const matchingChannels = channels.filter(
              c => regex.test(c.name) && !groupedChannelsSet.has(c.id)
            );

            matchingChannels.forEach(channel => {
              groupedChannelsSet.add(channel.id);
              groupChannels.push({
                ...channel,
                style: channelConfig.style,
              });
            });
          });

          if (groupChannels.length > 0) {
            groupedChannels.push({
              name: item.name,
              style: item.style,
              channels: groupChannels,
            });
          }
        } else {
          // Es ist ein einzelner Kanal
          const regex = new RegExp(item.name);
          const matchingChannels = channels.filter(
            c => regex.test(c.name) && !groupedChannelsSet.has(c.id)
          );

          matchingChannels.forEach(channel => {
            groupedChannelsSet.add(channel.id);
            ungroupedChannels.push({
              ...channel,
              style: item.style,
            });
          });
        }
      });

      // Füge die nicht zugeordneten Kanäle hinzu
      channels.forEach(channel => {
        if (!groupedChannelsSet.has(channel.id)) {
          ungroupedChannels.push(channel);
        }
      });
    } else {
      // Wenn keine Konfiguration definiert ist, sind alle Kanäle ungruppiert
      ungroupedChannels.push(...channels);
    }

    return { groupedChannels, ungroupedChannels };
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
      minute: '2-digit',
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
    this.dispatchEvent(
      new CustomEvent('channel-selected', {
        detail: { channel },
        bubbles: true,
        composed: true,
      })
    );
  }

  _onProgramSelected(program) {
    this.dispatchEvent(
      new CustomEvent('program-selected', {
        detail: { program },
        bubbles: true,
        composed: true,
      })
    );
  }

  addEpgData(data) {
    this._debug('EPG-Box: EPG-Daten empfangen', {
      kanal: data?.channel?.name,
      anzahlProgramme: data?.programs?.length
    });

    if (data?.channel?.id) {
      const channel = this._channels.get(data.channel.id);
      if (channel) {
        this._debug('EPG-Box: Aktualisiere Programme für Kanal', {
          kanal: channel.name,
          alteAnzahl: channel.programs.length,
          neueAnzahl: data.programs.length
        });
        channel.programs = data.programs || [];
        this._channels.set(data.channel.id, channel);
        this.requestUpdate();
        this._debug('EPG-Box: Update angefordert');
      } else {
        this._debug('EPG-Box: Kanal nicht gefunden', {
          kanalId: data.channel.id
        });
      }
    } else {
      this._debug('EPG-Box: Ungültige EPG-Daten', {
        hatKanal: !!data?.channel,
        hatKanalId: !!data?.channel?.id
      });
    }
  }

  addTeilEpg(teilEpg) {
    this._debug('EPG-Box: Teil-EPG empfangen', {
      kanal: teilEpg?.channel?.name,
      anzahlProgramme: teilEpg?.programs?.length
    });

    if (teilEpg?.channel?.id && teilEpg?.programs) {
      // Speichere das Teil-EPG direkt
      this._channels.set(teilEpg.channel.id, {
        ...teilEpg.channel,
        programs: teilEpg.programs
      });

      this._debug('EPG-Box: Teil-EPG gespeichert', {
        kanal: teilEpg.channel.name,
        anzahlProgramme: teilEpg.programs.length
      });

      this.requestUpdate();
      this._debug('EPG-Box: Update angefordert');
    } else {
      this._debug('EPG-Box: Ungültiges Teil-EPG', {
        hatKanal: !!teilEpg?.channel,
        hatKanalId: !!teilEpg?.channel?.id,
        hatProgramme: !!teilEpg?.programs
      });
    }
  }
}

customElements.define('epg-box', EpgBox);
