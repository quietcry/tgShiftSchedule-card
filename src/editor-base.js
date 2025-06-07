import { LitElement, html, css } from 'lit';

export class BaseCardEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object }
  };

  static get styles() {
    return css`
      :host {
        display: block;
        padding: 16px;
      }
    `;
  }

  firstUpdated() {
    console.debug('Basis-Editor firstUpdated');
    if (this.config) {
      this._config = { ...this.config };
    }
  }

  setConfig(config) {
    console.debug('Basis-Editor setConfig:', config);
    if (!config) {
      throw new Error('Keine Konfiguration angegeben');
    }
    this.config = config;
  }

  _valueChanged(ev) {
    console.debug('Basis-Editor valueChanged:', ev.detail);
    if (!this.config) {
      return;
    }
    const newConfig = {
      ...this.config,
      ...ev.detail.value
    };
    console.debug('Basis-Editor neue Konfiguration:', newConfig);
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: newConfig },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    if (!this.hass || !this.config) {
      return html`<div>Loading...</div>`;
    }

    console.debug('Basis-Editor render mit config:', this.config);
    return html`
      <div class="editor-container">
        ${this.renderEditor()}
      </div>
    `;
  }

  renderEditor() {
    throw new Error('renderEditor muss in der Kindklasse implementiert werden');
  }
} 