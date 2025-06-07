import { LitElement, html, css } from 'lit';

export class BaseCard extends LitElement {
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
    throw new Error('getConfigElement muss in der Kindklasse implementiert werden');
  }

  static getStubConfig() {
    throw new Error('getStubConfig muss in der Kindklasse implementiert werden');
  }

  setConfig(config) {
    console.debug('Basis-Karte setConfig:', config);
    if (config) {
      this._config = {
        ...this.getDefaultConfig(),
        ...config
      };
      this.requestUpdate('_config');
    }
    console.debug('Basis-Karte _config nach setConfig:', this._config);
  }

  getDefaultConfig() {
    throw new Error('getDefaultConfig muss in der Kindklasse implementiert werden');
  }

  render() {
    if (!this.hass) {
      return html`<ha-card>Loading...</ha-card>`;
    }

    console.debug('Basis-Karte render mit _config:', this._config);
    return html`
      <ha-card>
        <div class="card-content">
          <div class="editor-container">
            ${this.renderEditor()}
          </div>
          <div class="value-display">
            ${this.renderValueDisplay()}
          </div>
        </div>
      </ha-card>
    `;
  }

  renderEditor() {
    throw new Error('renderEditor muss in der Kindklasse implementiert werden');
  }

  renderValueDisplay() {
    throw new Error('renderValueDisplay muss in der Kindklasse implementiert werden');
  }

  _handleConfigChanged(ev) {
    console.debug('Basis-Karte configChanged:', ev.detail);
    const newConfig = {
      ...this._config,
      ...ev.detail.value
    };
    console.debug('Basis-Karte neue Konfiguration:', newConfig);
    this._config = newConfig;
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: newConfig },
      bubbles: true,
      composed: true
    }));
  }
} 