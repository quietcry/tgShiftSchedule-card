import { LitElement, html, css } from 'lit';
const { DebugMode, CardName } = require('./card-config');

if (DebugMode) console.debug(`[${CardName}] CardBase-Modul wird geladen`);

export class CardBase extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
  `;

  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _config: { type: Object }
  };

  static cardName = CardName;

  constructor() {
    super();
    if (DebugMode) console.debug(`[${this.constructor.cardName}] CardBase-Konstruktor wird aufgerufen`);
    this.hass = null;
    this.config = this.getDefaultConfig();
    if (DebugMode) console.debug(`[${this.constructor.cardName}] CardBase _config nach Konstruktor:`, this.config);
  }

  async firstUpdated() {
    if (DebugMode) console.debug(`[${this.constructor.cardName}] CardBase firstUpdated wird aufgerufen`);
    await this.loadHaForm();
    if (DebugMode) console.debug(`[${this.constructor.cardName}] CardBase firstUpdated abgeschlossen`);
    if (this.config && DebugMode) {
      console.debug(`[${this.constructor.cardName}] CardBase config:`, this.config);
    }
  }

  async loadHaForm() {
    if (DebugMode) console.debug(`[${this.constructor.cardName}] CardBase loadHaForm wird aufgerufen`);
    if (!customElements.get('ha-form')) {
      if (DebugMode) console.debug(`[${this.constructor.cardName}] CardBase ha-form nicht gefunden, lade custom-card-helpers`);
      const cardHelpers = await import('custom-card-helpers');
      if (DebugMode) console.debug(`[${this.constructor.cardName}] CardBase custom-card-helpers geladen`);
      await cardHelpers.loadHaForm();
      if (DebugMode) console.debug(`[${this.constructor.cardName}] CardBase ha-form geladen`);
    } else {
      if (DebugMode) console.debug(`[${this.constructor.cardName}] CardBase ha-form bereits geladen`);
    }
  }

  getDefaultConfig() {
    if (DebugMode) console.debug(`[${this.constructor.cardName}] CardBase getDefaultConfig wird aufgerufen`);
    return {
      text: '',
      auswahl: 'option1',
      schalter: false
    };
  }

  getStubConfig() {
    if (DebugMode) console.debug(`[${this.constructor.cardName}] CardBase getStubConfig wird aufgerufen`);
    return {
      type: 'custom:tgeditor-card',
      text: 'Beispieltext',
      auswahl: 'option1',
      schalter: false
    };
  }

  setConfig(config) {
    if (DebugMode) console.debug(`[${this.constructor.cardName}] CardBase setConfig wird aufgerufen mit:`, config);
    if (!config) {
      throw new Error('Keine Konfiguration angegeben');
    }
    this._config = {
      ...this.getDefaultConfig(),
      ...config
    };
    if (DebugMode) console.debug(`[${this.constructor.cardName}] CardBase _config nach setConfig:`, this._config);
  }

  _valueChanged(ev) {
    if (DebugMode) console.debug(`[${this.constructor.cardName}] CardBase valueChanged:`, ev.detail);
    if (!this._config) {
      if (DebugMode) console.debug(`[${this.constructor.cardName}] CardBase valueChanged: Keine Konfiguration vorhanden`);
      return;
    }
    const newConfig = {
      ...this._config,
      ...ev.detail.value
    };
    if (DebugMode) console.debug(`[${this.constructor.cardName}] CardBase neue Konfiguration:`, newConfig);
    this._config = newConfig;
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: newConfig },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    if (DebugMode) console.debug(`[${this.constructor.cardName}] CardBase render wird aufgerufen`);
    if (!this.hass || !this._config) {
      if (DebugMode) console.debug(`[${this.constructor.cardName}] CardBase render: Kein hass oder config`);
      return html`<div>Loading...</div>`;
    }

    if (DebugMode) console.debug(`[${this.constructor.cardName}] CardBase render mit config:`, this._config);
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
    if (DebugMode) console.debug(`[${this.constructor.cardName}] CardBase renderEditor wird aufgerufen`);
    if (!customElements.get('ha-form')) {
      if (DebugMode) console.debug(`[${this.constructor.cardName}] CardBase renderEditor: ha-form nicht gefunden`);
      return html`<div>Loading ha-form...</div>`;
    }
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

  renderValueDisplay() {
    throw new Error('renderValueDisplay muss in der Kindklasse implementiert werden');
  }
} 