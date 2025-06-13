import { LitElement, html, css } from 'lit';
import { ViewBase } from '../views/view-base.js';

export class EpgBox extends ViewBase {
  static properties = {
    data: { type: Object },
    config: { type: Object },
  };

  constructor() {
    super();
    this._data = null;
    this._config = null;
    this._channels = [];
    this._epgData = {};
    this._groups = {};
    this._ungroupedChannels = [];
  }

  set data(value) {
    if (this._data !== value) {
      this._debug('Neue Daten erhalten:', value);
      this._data = value;
      this._processData();
    }
  }

  get data() {
    return this._data;
  }

  set config(value) {
    if (this._config !== value) {
      this._debug('Neue Konfiguration erhalten:', value);
      this._config = value;
      this._processData();
    }
  }

  get config() {
    return this._config;
  }

  _processData() {
    if (!this._data) return;

    const { channel } = this._data;
    if (!channel) return;

    this._debug('Verarbeite Kanal:', channel.name);

    // Füge den Kanal zur Liste hinzu, wenn er noch nicht existiert
    if (!this._channels.includes(channel.name)) {
      this._debug('Neuer Kanal wird hinzugefügt:', channel.name);
      this._channels.push(channel.name);
      this._debug('Aktuelle Kanäle:', this._channels);
    }

    // Aktualisiere die EPG-Daten für den Kanal
    this._epgData[channel.name] = channel.programs || [];
    this._debug('EPG-Daten für Kanal aktualisiert:', channel.name, this._epgData[channel.name]);

    // Sortiere die Kanäle nach der Reihenfolge in der Konfiguration
    if (this.config.channel_order && this.config.channel_order.length > 0) {
      this._channels.sort((a, b) => {
        const indexA = this.config.channel_order.indexOf(a);
        const indexB = this.config.channel_order.indexOf(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
      this._debug('Kanäle nach Konfiguration sortiert:', this._channels);
    }

    // Gruppiere die Kanäle
    this._groupChannels();
    this._debug('Kanäle gruppiert:', {
      groups: this._groups,
      ungrouped: this._ungroupedChannels,
    });

    this.requestUpdate();
  }

  _groupChannels() {
    this._groups = {};
    this._ungroupedChannels = [...this._channels];

    if (!this.config.channel_groups) return;

    // Verarbeite jede Gruppe
    Object.entries(this.config.channel_groups).forEach(([groupName, channels]) => {
      const groupChannels = channels.filter(channel => this._channels.includes(channel));
      if (groupChannels.length > 0) {
        this._groups[groupName] = groupChannels;
        // Entferne die gruppierten Kanäle aus der ungruppierten Liste
        this._ungroupedChannels = this._ungroupedChannels.filter(
          channel => !groupChannels.includes(channel)
        );
      }
    });

    this._debug(
      'Rendere mit',
      Object.keys(this._groups).length,
      'Gruppen und',
      this._ungroupedChannels.length,
      'ungruppierten Kanälen'
    );
  }

  render() {
    if (!this._data) {
      this._debug('Erste Renderung - noch keine Daten');
      return html`<div class="epg-box">Lade EPG-Daten...</div>`;
    }

    return html`
      <div class="epg-box">${this._renderGroups()} ${this._renderUngroupedChannels()}</div>
    `;
  }

  _renderGroups() {
    if (!this.config.channel_groups || Object.keys(this._groups).length === 0) {
      return '';
    }

    return html`
      ${Object.entries(this._groups).map(
        ([groupName, channels]) => html`
          <div class="channel-group">
            <div class="group-header">${groupName}</div>
            ${channels.map(channel => this._renderChannel(channel))}
          </div>
        `
      )}
    `;
  }

  _renderUngroupedChannels() {
    if (this._ungroupedChannels.length === 0) {
      return '';
    }

    return html`
      <div class="channel-group">
        <div class="group-header">Weitere Kanäle</div>
        ${this._ungroupedChannels.map(channel => this._renderChannel(channel))}
      </div>
    `;
  }

  _renderChannel(channelName) {
    const programs = this._epgData[channelName] || [];
    return html`
      <div class="channel">
        <div class="channel-name">${channelName}</div>
        <div class="programs">
          ${programs.map(
            program => html`
              <div class="program">
                <div class="program-time">${this._formatTime(program.start)}</div>
                <div class="program-title">${program.title}</div>
              </div>
            `
          )}
        </div>
      </div>
    `;
  }

  _formatTime(time) {
    if (!time) return '';
    const date = new Date(time);
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }
}
