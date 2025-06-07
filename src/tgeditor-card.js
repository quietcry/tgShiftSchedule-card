import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { loadHaForm } from './load-ha-form';

// Editor für die Karte
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

// Hauptkomponente der Karte
class TGEditorCard extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _config: { type: Object }
  };

  static get styles() {
    return css`
      :host {
        display: block;
        padding: 16px;
      }
      .card-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .editor-container {
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        padding: 16px;
      }
      .value-display {
        margin-top: 8px;
        padding: 8px;
        background: var(--secondary-background-color);
        border-radius: 4px;
      }
    `;
  }

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

  setConfig(config) {
    console.debug('Karte setConfig:', config);
    if (config) {
      this._config = {
        type: 'custom:tgeditor-card',
        text: '',
        auswahl: 'option1',
        schalter: false,
        ...config
      };
      // Erzwinge ein Update der Komponente
      this.requestUpdate('_config');
    }
    console.debug('Karte _config nach setConfig:', this._config);
  }

  render() {
    if (!this.hass) {
      return html`<ha-card>Loading...</ha-card>`;
    }

    console.debug('Karte render mit _config:', this._config);
    return html`
      <ha-card>
        <div class="card-content">
          <div class="editor-container">
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
          </div>
          <div class="value-display">
            <div>Text: ${this._config.text || ''}</div>
            <div>Auswahl: ${this._config.auswahl || ''}</div>
            <div>Schalter: ${this._config.schalter ? 'An' : 'Aus'}</div>
          </div>
        </div>
      </ha-card>
    `;
  }

  _handleConfigChanged(ev) {
    console.debug('Karte configChanged:', ev.detail);
    const newConfig = {
      ...this._config,
      ...ev.detail.value
    };
    console.debug('Karte neue Konfiguration:', newConfig);
    this._config = newConfig;
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: newConfig },
      bubbles: true,
      composed: true
    }));
  }
}

// Registriere die Karte nur, wenn sie noch nicht registriert ist
if (!customElements.get('tgeditor-card')) {
  customElements.define('tgeditor-card', TGEditorCard);
}

if (!customElements.get('tgeditor-card-editor')) {
  customElements.define('tgeditor-card-editor', TGEditorCardEditor);
}

// Registriere die Karte in der UI
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'tgeditor-card',
  name: 'TGEditor Card',
  description: 'Eine Karte mit Editor-Funktionalität',
  preview: true
}); 