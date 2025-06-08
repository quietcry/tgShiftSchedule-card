import { html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { SuperBase } from './super-base';
import { CardName, CardVersion, DebugMode } from './card-config';

if (DebugMode) console.debug(`[${CardName}] CardBase-Modul wird geladen`);

export class CardBase extends SuperBase {
  static properties = {
    ...super.properties,
    _selectedTab: { type: Number }
  };

  constructor() {
    super();
    this._selectedTab = 0;
  }

  async firstUpdated() {
    this._debug('firstUpdated wird aufgerufen');
    await super.firstUpdated();
    this._debug('firstUpdated abgeschlossen');
  }

  setConfig(config) {
    this._debug('setConfig wird aufgerufen mit:', config);
    if (!config) {
      throw new Error('Keine Konfiguration angegeben');
    }
    
    // Prüfe, ob es sich um eine neue Konfiguration handelt
    const isNewConfig = !this.config || Object.keys(this.config).length === 0;
    
    // Wenn es eine neue Konfiguration ist, verwende sie direkt
    if (isNewConfig) {
      this.config = {
        ...this.getDefaultConfig(),
        ...config
      };
    } else {
      // Ansonsten behalte die bestehende Konfiguration bei und aktualisiere nur geänderte Werte
      this.config = {
        ...this.config,
        ...config
      };
    }
    
    this._debug('config nach setConfig:', this.config);
  }

  getDefaultConfig() {
    this._debug('getDefaultConfig wird aufgerufen');
    return {
      entity: '',
      time_window: 'C',
      date: '',
      max_items: 10,
      show_channel: true,
      show_time: true,
      show_duration: true,
      show_title: true,
      show_description: true,
      view_mode: 'Liste'
    };
  }

  static styles = css`
    :host {
      display: block;
    }
  `;
} 