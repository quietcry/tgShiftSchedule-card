import { LitElement, html, css } from 'lit';
const { DebugMode, CardName } = require('./card-config');

if (DebugMode) console.debug(`[${CardName}] EditorBase-Modul wird geladen`);

export class EditorBase extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object }
  };

  static styles = css`
    :host {
      display: block;
    }
    .editor-container {
      padding: 16px;
    }
  `;

  static cardName = CardName;

  constructor() {
    super();
    if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorBase-Konstruktor wird aufgerufen`);
    this.config = this.getDefaultConfig();
    if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorBase config nach Konstruktor:`, this.config);
  }

  async firstUpdated() {
    if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorBase firstUpdated wird aufgerufen`);
    try {
      await this.loadHaForm();
      if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorBase ha-form geladen`);
    } catch (error) {
      console.error(`[${this.constructor.cardName}] EditorBase Fehler beim Laden von ha-form:`, error);
    }
    if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorBase firstUpdated abgeschlossen`);
    if (this.config && DebugMode) {
      console.debug(`[${this.constructor.cardName}] EditorBase config:`, this.config);
    }
  }

  async loadHaForm() {
    if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorBase loadHaForm wird aufgerufen`);
    if (!customElements.get('ha-form')) {
      if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorBase ha-form nicht gefunden, lade custom-card-helpers`);
      try {
        const cardHelpers = await import('custom-card-helpers');
        if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorBase custom-card-helpers geladen`);
        await cardHelpers.loadHaForm();
        if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorBase ha-form geladen`);
      } catch (error) {
        console.error(`[${this.constructor.cardName}] EditorBase Fehler beim Laden von custom-card-helpers:`, error);
        throw error;
      }
    } else {
      if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorBase ha-form bereits geladen`);
    }
  }

  getDefaultConfig() {
    if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorBase getDefaultConfig wird aufgerufen`);
    return {
      text: '',
      auswahl: 'option1',
      schalter: false
    };
  }

  getStubConfig() {
    if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorBase getStubConfig wird aufgerufen`);
    return {
      type: 'custom:tgeditor-card',
      text: 'Beispieltext',
      auswahl: 'option1',
      schalter: false
    };
  }

  setConfig(config) {
    if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorBase setConfig wird aufgerufen mit:`, config);
    if (!config) {
      throw new Error('Keine Konfiguration angegeben');
    }
    this.config = {
      ...this.getDefaultConfig(),
      ...config
    };
    if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorBase config nach setConfig:`, this.config);
  }

  _valueChanged(ev) {
    if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorBase valueChanged:`, ev.detail);
    if (!this.config) {
      if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorBase valueChanged: Keine Konfiguration vorhanden`);
      return;
    }
    const newConfig = {
      ...this.config,
      ...ev.detail.value
    };
    if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorBase neue Konfiguration:`, newConfig);
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: newConfig },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorBase render wird aufgerufen`);
    if (!this.hass || !this.config) {
      if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorBase render: Kein hass oder config`);
      return html`<div>Konfiguration fehlt</div>`;
    }

    if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorBase render mit config:`, this.config);
    return html`
      <div class="editor-container">
        ${this.renderEditor()}
      </div>
    `;
  }

  renderEditor() {
    if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorBase renderEditor wird aufgerufen`);
    if (!customElements.get('ha-form')) {
      if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorBase renderEditor: ha-form nicht gefunden`);
      return html`<div>Loading ha-form...</div>`;
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