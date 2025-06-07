import { LitElement, html, css } from 'lit';

export class EditorBase extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object }
  };

  static styles = css`
    :host {
      display: block;
    }
  `;

  async firstUpdated() {
    await this.loadHaForm();
    console.debug('Basis-Editor firstUpdated');
    if (this.config) {
      console.debug('Basis-Editor config:', this.config);
    }
  }

  async loadHaForm() {
    if (!customElements.get('ha-form')) {
      const cardHelpers = await import('custom-card-helpers');
      await cardHelpers.loadHaForm();
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