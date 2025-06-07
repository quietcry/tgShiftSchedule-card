import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { loadHaForm } from './load-ha-form';

class TGEditorCardEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object }
  };

  async firstUpdated() {
    await loadHaForm();
    // Setze die Konfiguration nach dem Laden des Formulars
    if (this.config) {
      this.requestUpdate('config');
    }
  }

  setConfig(config) {
    console.debug('Editor setConfig:', config);
    if (config) {
      this.config = {
        type: 'custom:tgeditor-card',
        text: '',
        auswahl: 'option1',
        schalter: false,
        ...config
      };
      // Erzwinge ein Update der Komponente
      this.requestUpdate('config');
    }
    console.debug('Editor config nach setConfig:', this.config);
  }

  _valueChanged(ev) {
    console.debug('Editor valueChanged:', ev.detail);
    const newConfig = {
      ...this.config,
      ...ev.detail.value
    };
    console.debug('Editor neue Konfiguration:', newConfig);
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: newConfig },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    if (!this.hass || !this.config) {
      return html`<ha-card>Loading...</ha-card>`;
    }

    console.debug('Editor render mit config:', this.config);
    return html`
      <div class="card-config">
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
      </div>
    `;
  }

  static get styles() {
    return css`
      .card-config {
        padding: 16px;
      }
    `;
  }
}

customElements.define('tgeditor-card-editor', TGEditorCardEditor); 