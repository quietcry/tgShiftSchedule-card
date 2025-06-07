import { html, css, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { CardBase } from './card-base';
const { CardVersion } = require('./card-config');

export class CardImpl extends CardBase {
  static properties = {
    hass: { type: Object },
    _config: { type: Object },
    version: { type: String, reflect: true }
  };

  constructor() {
    super();
    this.version = CardVersion;
    this._config = {
      text: '',
      auswahl: 'option1',
      schalter: false
    };
  }

  static getConfigElement() {
    return document.createElement('tgeditor-card-editor');
  }

  async firstUpdated() {
    await super.firstUpdated();
  }

  setConfig(config) {
    if (!config) {
      throw new Error('Keine Konfiguration vorhanden');
    }
    this._config = { ...this._config, ...config };
  }

  render() {
    if (!this.hass || !this._config) {
      return html`<div>Konfiguration fehlt</div>`;
    }

    return html`
      <ha-card>
        <div class="card-content">
          <div class="text">${this._config.text}</div>
          <div class="auswahl">${this._config.auswahl}</div>
          <div class="schalter">${this._config.schalter ? 'An' : 'Aus'}</div>
          <div class="version">v${this.version}</div>
        </div>
      </ha-card>
    `;
  }

  static styles = css`
    .card-content {
      padding: 16px;
    }
    .version {
      font-size: 10px;
      color: var(--secondary-text-color);
      text-align: right;
      margin-top: 8px;
    }
  `;

  renderValueDisplay() {
    return html`
      <div>Text: ${this._config.text || ''}</div>
      <div>Auswahl: ${this._config.auswahl || ''}</div>
      <div>Schalter: ${this._config.schalter ? 'An' : 'Aus'}</div>
    `;
  }
} 