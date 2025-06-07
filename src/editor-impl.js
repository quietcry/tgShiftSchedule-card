import { html } from 'lit';
import { EditorBase } from './editor-base';

export class EditorImpl extends EditorBase {
  static get properties() {
    return {
      hass: {},
      config: {}
    };
  }

  async firstUpdated() {
    await super.firstUpdated();
  }

  setConfig(config) {
    this.config = config;
  }

  _valueChanged(ev) {
    const value = ev.detail.value;
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: value },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    if (!this.hass) {
      return html`<div>Loading...</div>`;
    }

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
} 