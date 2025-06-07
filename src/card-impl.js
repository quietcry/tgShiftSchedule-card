import { html, css, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { CardBase } from './card-base';
const { CardVersion, DebugMode } = require('./card-config');

if (DebugMode) console.debug(`[${CardBase.cardName}] CardImpl-Modul wird geladen`);

export class CardImpl extends CardBase {
  static properties = {
    hass: { type: Object },
    _config: { type: Object },
    version: { type: String, reflect: true }
  };

  static cardName = CardBase.cardName;

  constructor() {
    super();
    if (DebugMode) console.debug(`[${this.constructor.cardName}] CardImpl-Konstruktor wird aufgerufen`);
    this.version = CardVersion;
    this._config = {
      text: '',
      auswahl: 'option1',
      schalter: false
    };
    if (DebugMode) console.debug(`[${this.constructor.cardName}] CardImpl _config nach Konstruktor:`, this._config);
  }

  static getConfigElement() {
    if (DebugMode) console.debug(`[${this.cardName}] CardImpl getConfigElement wird aufgerufen`);
    return document.createElement('tgeditor-card-editor');
  }

  async firstUpdated() {
    if (DebugMode) console.debug(`[${this.constructor.cardName}] CardImpl firstUpdated wird aufgerufen`);
    await super.firstUpdated();
    if (DebugMode) console.debug(`[${this.constructor.cardName}] CardImpl firstUpdated abgeschlossen`);
  }

  setConfig(config) {
    if (DebugMode) console.debug(`[${this.constructor.cardName}] CardImpl setConfig wird aufgerufen mit:`, config);
    if (!config) {
      throw new Error('Keine Konfiguration vorhanden');
    }
    this._config = { ...this._config, ...config };
    if (DebugMode) console.debug(`[${this.constructor.cardName}] CardImpl _config nach setConfig:`, this._config);
  }

  render() {
    if (DebugMode) console.debug(`[${this.constructor.cardName}] CardImpl render wird aufgerufen`);
    if (!this.hass || !this._config) {
      if (DebugMode) console.debug(`[${this.constructor.cardName}] CardImpl render: Kein hass oder config`);
      return html`<div>Konfiguration fehlt</div>`;
    }

    if (DebugMode) console.debug(`[${this.constructor.cardName}] CardImpl render mit _config:`, this._config);
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
    if (DebugMode) console.debug(`[${this.constructor.cardName}] CardImpl renderValueDisplay wird aufgerufen`);
    return html`
      <div>Text: ${this._config.text || ''}</div>
      <div>Auswahl: ${this._config.auswahl || ''}</div>
      <div>Schalter: ${this._config.schalter ? 'An' : 'Aus'}</div>
    `;
  }
} 