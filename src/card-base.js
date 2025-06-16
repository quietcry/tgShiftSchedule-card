import { LitElement } from 'lit';
import { html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { SuperBase } from './super-base.js';
import { CardName, Version, DebugMode, showVersion } from './card-config.js';

export class CardBase extends SuperBase {
  static properties = {
    ...super.properties,
    _selectedTab: { type: Number },
  };

  constructor() {
    super();
    this._selectedTab = 0;
    if (this.constructor.debugMode) console.debug(`[${this.constructor.cardName}] CardBase-Modul wird geladen`);
  }

  async firstUpdated() {
    this._debug('filterx: CardBase firstUpdated: Start');
    await super.firstUpdated();
    this._debug('filterx: CardBase firstUpdated: Ende');
  }

  setConfig(config) {
    this._debug('setConfig wird aufgerufen mit:', config);
    if (!config) {
      throw new Error('Keine Konfiguration angegeben');
    }

    // Prüfe, ob es sich um eine neue Konfiguration handelt
    const isNewConfig = !this.config || Object.keys(this.config).length === 0;

    // Wenn es eine neue Konfiguration ist, verwende sie direkt
    if (isNewConfig) {
      this.config = {
        ...this.getDefaultConfig(),
        ...config,
      };
    } else {
      // Ansonsten behalte die bestehende Konfiguration bei und aktualisiere nur geänderte Werte
      this.config = {
        ...this.config,
        ...config,
      };
    }

    this._debug('config nach setConfig:', this.config);
  }

  getDefaultConfig() {
    this._debug('getDefaultConfig wird aufgerufen');
    return {
      entity: '',
      time_window: 'C',
      date: '',
      max_items: 10,
      show_channel: true,
      show_time: true,
      show_duration: true,
      show_title: true,
      show_description: true,
      view_mode: 'Liste',
    };
  }

  render(content = '') {
    this._debug('render wird aufgerufen');
    return html`
      <ha-card>
        <div class="card-content">${content}</div>
        ${this.showVersion ? html` <div class="version">Version: ${this.version}</div> ` : ''}
      </ha-card>
    `;
  }

  static styles = [
    SuperBase.styles,
    css`
      :host {
        display: block;
      }

      ha-card {
        padding: 16px;
      }

      .loading {
        text-align: center;
        padding: 20px;
        color: var(--secondary-text-color);
      }

      .error {
        text-align: center;
        padding: 20px;
        color: var(--error-color);
      }
    `,
  ];
}
