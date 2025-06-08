import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';

const { DebugMode, CardName, Version, showVersion } = require('./card-config');

if (DebugMode) console.debug(`[${CardName}] CardBase-Modul wird geladen`);

export class CardBase extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    .card-content {
      position: relative;
      min-height: 100px;
    }
    .version {
      position: absolute;
      bottom: 4px;
      right: 8px;
      font-size: 10px;
      color: var(--secondary-text-color);
      opacity: 1;
    }
  `;

  static properties = {
    hass: { type: Object },
    _config: { type: Object },
    version: { type: String, reflect: true },
    _showVersion: { type: Boolean }
  };

  static cardName = CardName;

  constructor() {
    super();
    this._debug('CardBase-Konstruktor wird aufgerufen');
    this._config = this.getDefaultConfig();
    this._debug('CardBase _config nach Konstruktor:', this._config);
    this.DebugMode = DebugMode;  // DebugMode von card-config verwenden
    this.version = Version;
    this._showVersion = showVersion;
  }

  static getConfigElement() {
    if (DebugMode) console.debug(`[${this.constructor.cardName}] CardBase getConfigElement wird aufgerufen`);
    return document.createElement('tgeditor-card-editor');
  }

  firstUpdated() {
    this._debug('CardBase firstUpdated wird aufgerufen');
    super.firstUpdated();
    this._debug('CardBase firstUpdated abgeschlossen');
  }

  _debug(message, data = null) {
    if (this.DebugMode) {
      if (data) {
        console.debug(`[${CardName}] ${message}`, data);
      } else {
        console.debug(`[${CardName}] ${message}`);
      }
    }
  }

  getDefaultConfig() {
    this._debug('CardBase getDefaultConfig wird aufgerufen');
    return {
      text: '',
      auswahl: 'option1',
      schalter: false
    };
  }

  getStubConfig() {
    if (DebugMode) console.debug(`[${this.constructor.cardName}] CardBase getStubConfig wird aufgerufen`);
    return {
      type: 'custom:tgeditor-card',
      text: 'Beispieltext',
      auswahl: 'option1',
      schalter: false
    };
  }

  setConfig(config) {
    if (DebugMode) console.debug(`[${this.constructor.cardName}] CardBase setConfig wird aufgerufen mit:`, config);
    if (!config) {
      throw new Error('Keine Konfiguration vorhanden');
    }
    this._config = { ...this._config, ...config };
    if (DebugMode) console.debug(`[${this.constructor.cardName}] CardBase _config nach setConfig:`, this._config);
  }

  render(content="") {
    if (DebugMode) console.debug(`[${this.constructor.cardName}] CardBase render wird aufgerufen`);
    if (!this.hass || !this._config) {
      if (DebugMode) console.debug(`[${this.constructor.cardName}] CardBase render: Kein hass oder config`);
      return html`<div>Konfiguration fehlt</div>`;
    }

    if (DebugMode) console.debug(`[${this.constructor.cardName}] CardBase render mit _config:`, this._config);
    return html`
      <ha-card>
        <div class="card-content">
          ${content}
          ${this._showVersion ? html`<div class="version">v${this.version || 'unbekannt'}</div>` : ''}
        </div>
      </ha-card>
    `;
  }
} 