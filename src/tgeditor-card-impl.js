import { html } from 'lit';
import { BaseCard } from './base-card';

export class TGEditorCardImpl extends BaseCard {
  static getConfigElement() {
    return document.createElement('tgeditor-card-editor');
  }

  static getStubConfig() {
    return {
      type: 'custom:tgeditor-card',
      text: '',
      auswahl: 'option1',
      schalter: false
    };
  }

  getDefaultConfig() {
    return {
      type: 'custom:tgeditor-card',
      text: '',
      auswahl: 'option1',
      schalter: false
    };
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
        @value-changed=${this._handleConfigChanged}
      ></ha-form>
    `;
  }

  renderValueDisplay() {
    return html`
      <div>Text: ${this._config.text || ''}</div>
      <div>Auswahl: ${this._config.auswahl || ''}</div>
      <div>Schalter: ${this._config.schalter ? 'An' : 'Aus'}</div>
    `;
  }
} 