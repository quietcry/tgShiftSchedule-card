import { html, css, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { EditorBase } from './editor-base';
import { CardName, CardVersion } from './card-config';
const { DebugMode } = require('./card-config');

if (DebugMode) console.debug(`[${EditorBase.cardName}] EditorImpl-Modul wird geladen`);

export class EditorImpl extends EditorBase {
  static properties = {
    ...super.properties,
    _config: { type: Object },
    _selectedTab: { type: Number }
  };

  constructor() {
    super();
    if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorImpl-Konstruktor wird aufgerufen`);
    this._config = {
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
    this._selectedTab = 0;
  }

  async firstUpdated() {
    if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorImpl firstUpdated wird aufgerufen`);
    await super.firstUpdated();
    if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorImpl firstUpdated abgeschlossen`);
  }

  setConfig(config) {
    if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorImpl setConfig wird aufgerufen mit:`, config);
    if (!config) {
      throw new Error('Keine Konfiguration vorhanden');
    }
    this._config = { ...this._config, ...config };
    if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorImpl config nach setConfig:`, this._config);
  }

  _debug(message, data = null) {
    if (this.constructor.DebugMode) {
      if (data) {
        console.debug(`[${this.constructor.cardName}] ${message}`, data);
      } else {
        console.debug(`[${this.constructor.cardName}] ${message}`);
      }
    }
  }

  render() {
    this._debug('EditorImpl render wird aufgerufen');
    if (!this.hass) {
      if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorImpl render: Kein hass`);
      return html`<div>Loading...</div>`;
    }

    if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorImpl render mit config:`, this._config);
    return html`
      <div class="card-config">
        <ha-expansion-panel>
          <span slot="header">Allgemein</span>
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${[
          {
                name: 'entity',
            selector: {
                  entity: {}
            }
          },
          {
                name: 'time_window',
            selector: {
              select: {
                options: [
                      { value: 'C', label: 'Aktuell' },
                      { value: 'D', label: 'Heute' },
                      { value: 'W', label: 'Diese Woche' }
                ]
              }
            }
          },
          {
                name: 'date',
                selector: {
                  text: {}
                }
              }
            ]}
            .computeLabel=${this._computeLabel}
            @value-changed=${this._valueChanged}
          ></ha-form>
        </ha-expansion-panel>

        <ha-expansion-panel>
          <span slot="header">Anzeige</span>
          <ha-form
            .hass=${this.hass}
            .data=${this._config}
            .schema=${[
              {
                name: 'view_mode',
                selector: {
                  select: {
                    options: [
                      { value: 'Liste', label: 'Liste' },
                      { value: 'epg', label: 'EPG' },
                      { value: 'activ', label: 'Aktiv' }
                    ]
                  }
                }
              },
              {
                name: 'max_items',
                selector: {
                  number: {
                    min: 1,
                    max: 100,
                    mode: 'box'
                  }
                }
              }
            ]}
            .computeLabel=${this._computeLabel}
            @value-changed=${this._valueChanged}
          ></ha-form>
        </ha-expansion-panel>

        <ha-expansion-panel>
          <span slot="header">Erweitert</span>
          <ha-form
            .hass=${this.hass}
            .data=${this._config}
            .schema=${[
              {
                name: 'show_channel',
                selector: {
                  boolean: {}
                }
              },
              {
                name: 'show_time',
                selector: {
                  boolean: {}
                }
              },
              {
                name: 'show_duration',
                selector: {
                  boolean: {}
                }
              },
              {
                name: 'show_title',
                selector: {
                  boolean: {}
                }
              },
              {
                name: 'show_description',
            selector: {
              boolean: {}
            }
          }
        ]}
            .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
        </ha-expansion-panel>
      </div>
    `;
  }

  _computeLabel(schema) {
    switch (schema.name) {
      case 'entity':
        return 'Entity';
      case 'time_window':
        return 'Zeitfenster';
      case 'date':
        return 'Datum (YYYY-MM-DD)';
      case 'view_mode':
        return 'Ansicht';
      case 'max_items':
        return 'Maximale Anzahl Einträge';
      case 'show_channel':
        return 'Kanal anzeigen';
      case 'show_time':
        return 'Zeit anzeigen';
      case 'show_duration':
        return 'Dauer anzeigen';
      case 'show_title':
        return 'Titel anzeigen';
      case 'show_description':
        return 'Beschreibung anzeigen';
      default:
        return schema.name;
    }
  }

  _valueChanged(ev) {
    const value = ev.detail.value;
    this._config = { ...this._config, ...value };
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true
    }));
  }

  static styles = css`
    .card-config {
      padding: 16px;
    }
    .config-row {
      margin-bottom: 16px;
    }
    ha-expansion-panel {
      margin-bottom: 8px;
  }
  `;
} 