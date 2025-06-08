import { html } from 'lit';

export class TableView {
  constructor(config, epgData) {
    this._config = config;
    this._epgData = epgData;
  }

  _formatTime(time) {
    if (!time) return '';
    const date = new Date(time);
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }

  _formatDuration(start, stop) {
    if (!start || !stop) return '';
    const startDate = new Date(start);
    const stopDate = new Date(stop);
    const duration = (stopDate - startDate) / 1000 / 60; // in Minuten
    return `${duration} min`;
  }

  render() {
    if (!this._epgData || this._epgData.length === 0) {
      return html`<div class="no-data">Keine EPG-Daten verfügbar</div>`;
    }

    return html`
      <div class="epg-content">
        <table>
          <thead>
            <tr>
              ${this._config.show_channel ? html`<th>Kanal</th>` : ''}
              ${this._config.show_time ? html`<th>Zeit</th>` : ''}
              ${this._config.show_duration ? html`<th>Dauer</th>` : ''}
              ${this._config.show_title ? html`<th>Titel</th>` : ''}
              ${this._config.show_description ? html`<th>Beschreibung</th>` : ''}
            </tr>
          </thead>
          <tbody>
            ${this._epgData.slice(0, this._config.max_items).map(channel =>
              channel.epg.map(
                show => html`
                  <tr>
                    ${this._config.show_channel ? html`<td>${channel.channel_name}</td>` : ''}
                    ${this._config.show_time ? html`<td>${this._formatTime(show.start)}</td>` : ''}
                    ${this._config.show_duration
                      ? html`<td>${this._formatDuration(show.start, show.stop)}</td>`
                      : ''}
                    ${this._config.show_title ? html`<td>${show.title}</td>` : ''}
                    ${this._config.show_description ? html`<td>${show.shorttext || ''}</td>` : ''}
                  </tr>
                `
              )
            )}
          </tbody>
        </table>
      </div>
    `;
  }
}
