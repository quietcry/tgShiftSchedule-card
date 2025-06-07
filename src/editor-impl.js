import { html, css, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { EditorBase } from './editor-base';
const { DebugMode } = require('./card-config');

if (DebugMode) console.debug(`[${EditorBase.cardName}] EditorImpl-Modul wird geladen`);

export class EditorImpl extends EditorBase {
  constructor() {
    super();
    if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorImpl-Konstruktor wird aufgerufen`);
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
    super.setConfig(config);
    if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorImpl config nach setConfig:`, this.config);
  }

  renderEditor() {
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this.config}
        .schema=${[
          {
            name: 'text',
            selector: {
              text: {}
            }
          },
          {
            name: 'auswahl',
            selector: {
              select: {
                options: [
                  { value: 'option1', label: 'Option 1' },
                  { value: 'option2', label: 'Option 2' },
                  { value: 'option3', label: 'Option 3' }
                ]
              }
            }
          },
          {
            name: 'schalter',
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
    this.config = { ...this.config, ...value };
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorImpl render wird aufgerufen`);
    if (!this.hass || !this.config) {
      if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorImpl render: Kein hass oder config`);
      return html`<div>Konfiguration fehlt</div>`;
    }

    if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorImpl render mit config:`, this.config);
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