import { css } from 'lit';
import { SuperBase } from '../super-base.js';

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
    if (this.constructor.debugMode)
      console.debug(`[${this.constructor.cardName}] EditorBase-Modul wird geladen`);
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
          `[${this.constructor.cardName}] [EditorBase] Fehler beim Laden von custom-card-helpers:`,
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
}
