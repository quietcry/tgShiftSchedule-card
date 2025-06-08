import { html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { SuperBase } from './super-base';
import { CardName, CardVersion } from './card-config';
const { DebugMode } = require('./card-config');

if (DebugMode) console.debug(`[${CardName}] EditorBase-Modul wird geladen`);

export class EditorBase extends SuperBase {
  static properties = {
    ...super.properties,
    _selectedTab: { type: Number },
  };

  static styles = css`
    :host {
      display: block;
    }
    .editor-container {
      padding: 16px;
    }
  `;

  constructor(defaultConfig = {}) {
    super();
    this._debug('[EditorBase] EditorBase-Konstruktor wird aufgerufen');
    this.config = {
      type: 'custom:tgeditor-card',
      ...defaultConfig,
    };
    this._debug('[EditorBase] EditorBase config nach Konstruktor:', this.config);
  }

  async firstUpdated() {
    this._debug('[EditorBase] EditorBase firstUpdated wird aufgerufen');
    await super.firstUpdated();
    this._debug('[EditorBase] EditorBase firstUpdated abgeschlossen');
  }

  async loadHaForm() {
    this._debug('[EditorBase] EditorBase loadHaForm wird aufgerufen');
    if (!customElements.get('ha-form')) {
      this._debug('[EditorBase] EditorBase ha-form nicht gefunden, lade custom-card-helpers');
      try {
        const cardHelpers = await import('custom-card-helpers');
        this._debug('[EditorBase] EditorBase custom-card-helpers geladen');
        await cardHelpers.loadHaForm();
        this._debug('[EditorBase] EditorBase ha-form geladen');
      } catch (error) {
        console.error(
          `[${CardName}] [EditorBase] Fehler beim Laden von custom-card-helpers:`,
          error
        );
        throw error;
      }
    } else {
      this._debug('[EditorBase] EditorBase ha-form bereits geladen');
    }
  }

  getDefaultConfig() {
    this._debug('[EditorBase] EditorBase getDefaultConfig wird aufgerufen');
    throw new Error('getDefaultConfig muss in der abgeleiteten Klasse implementiert werden');
  }

  getStubConfig() {
    this._debug('[EditorBase] EditorBase getStubConfig wird aufgerufen');
    return this.getDefaultConfig();
  }

  setConfig(config) {
    this._debug('[EditorBase] EditorBase setConfig wird aufgerufen mit:', config);
    if (!config) {
      throw new Error('Keine Konfiguration angegeben');
    }

    // Prüfe, ob es sich um eine neue Konfiguration handelt
    const isNewConfig = !this.config || Object.keys(this.config).length === 0;

    // Wenn es eine neue Konfiguration ist, verwende sie direkt
    if (isNewConfig) {
      this.config = {
        ...this.getDefaultConfig(),
        ...config,
      };
    } else {
      // Ansonsten behalte die bestehende Konfiguration bei und aktualisiere nur geänderte Werte
      this.config = {
        ...this.config,
        ...config,
      };
    }

    this._debug('[EditorBase] EditorBase config nach setConfig:', this.config);
  }

  _valueChanged(ev) {
    this._debug('[EditorBase] EditorBase valueChanged:', ev.detail);
    if (!this.config) {
      this._debug('[EditorBase] EditorBase valueChanged: Keine Konfiguration vorhanden');
      return;
    }
    const newConfig = {
      ...this.config,
      ...ev.detail.value,
    };
    this._debug('[EditorBase] EditorBase neue Konfiguration:', newConfig);
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config: newConfig },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    this._debug('[EditorBase] EditorBase render wird aufgerufen');
    if (!this.hass || !this.config) {
      this._debug('[EditorBase] EditorBase render: Keine hass oder config vorhanden');
      return html`<div class="editor-container">Lade Editor...</div>`;
    }
    return html`<div class="editor-container">Editor wird geladen...</div>`;
  }
}
