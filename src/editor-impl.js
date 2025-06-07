import { html, css, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { EditorBase } from './editor-base';
const { DebugMode } = require('./card-config');

if (DebugMode) console.debug(`[${EditorBase.cardName}] EditorImpl-Modul wird geladen`);

export class EditorImpl extends EditorBase {
  static properties = {
    hass: { type: Object },
    _config: { type: Object }
  };

  constructor() {
    super();
    if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorImpl-Konstruktor wird aufgerufen`);
    this._config = {
      entity: '',
      time_window: 'C',
      date: '',
      max_items: 10,
      show_channel: true,
      show_time: true,
      show_duration: true,
      show_title: true,
      show_description: true
    };
  }

  async firstUpdated() {
    if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorImpl firstUpdated wird aufgerufen`);
    await super.firstUpdated();
    if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorImpl firstUpdated abgeschlossen`);
  }

  setConfig(config) {
    if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorImpl setConfig wird aufgerufen mit:`, config);
    if (!config) {
      throw new Error('Keine Konfiguration vorhanden');
    }
    this._config = { ...this._config, ...config };
    if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorImpl config nach setConfig:`, this._config);
  }

  renderEditor() {
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${[
          {
            name: 'entity',
            required: true,
            selector: {
              entity: {
                domain: ['sensor']
              }
            }
          },
          {
            name: 'time_window',
            selector: {
              select: {
                options: [
                  { value: 'A', label: 'Vormittag (6-12 Uhr)' },
                  { value: 'P', label: 'Nachmittag (12-18 Uhr)' },
                  { value: 'R', label: 'Abend (18-23 Uhr)' },
                  { value: 'C', label: 'Aktuelle Sendungen' }
                ]
              }
            }
          },
          {
            name: 'date',
            selector: {
              date: {}
            }
          },
          {
            name: 'max_items',
            selector: {
              number: {
                min: 1,
                max: 50,
                mode: 'box'
              }
            }
          },
          {
            name: 'show_channel',
            selector: {
              boolean: {}
            }
          },
          {
            name: 'show_time',
            selector: {
              boolean: {}
            }
          },
          {
            name: 'show_duration',
            selector: {
              boolean: {}
            }
          },
          {
            name: 'show_title',
            selector: {
              boolean: {}
            }
          },
          {
            name: 'show_description',
            selector: {
              boolean: {}
            }
          }
        ]}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  _valueChanged(ev) {
    const value = ev.detail.value;
    this._config = { ...this._config, ...value };
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorImpl render wird aufgerufen`);
    if (!this.hass) {
      if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorImpl render: Kein hass`);
      return html`<div>Loading...</div>`;
    }

    if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorImpl render mit config:`, this._config);
    return html`
      <div class="editor-container">
        ${this.renderEditor()}
      </div>
    `;
  }

  static styles = css`
    .editor-container {
      padding: 16px;
    }
  `;
} 