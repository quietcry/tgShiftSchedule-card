import { html } from 'lit';
import { CardBase } from './card-base';

export class EditorImpl extends CardBase {
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
      ></ha-form>
    `;
  }

  renderValueDisplay() {
    return html`
      <div>Text: ${this.config.text || ''}</div>
      <div>Auswahl: ${this.config.auswahl || ''}</div>
      <div>Schalter: ${this.config.schalter ? 'An' : 'Aus'}</div>
    `;
  }
} 