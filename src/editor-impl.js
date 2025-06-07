import { html, css, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { EditorBase } from './editor-base';

export class EditorImpl extends EditorBase {
  static properties = {
    hass: { type: Object },
    _config: { type: Object }
  };

  constructor() {
    super();
    this._config = {
      text: '',
      auswahl: 'option1',
      schalter: false
    };
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

  renderEditor() {
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
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
    this._config = { ...this._config, ...value };
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    if (!this.hass) {
      return html`<div>Loading...</div>`;
    }

    return this.renderEditor();
  }
} 