import { html, css, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { EditorBase } from './editor-base';
import { CardName, CardVersion } from './card-config';
const { DebugMode } = require('./card-config');

if (DebugMode) console.debug(`[${EditorBase.cardName}] EditorImpl-Modul wird geladen`);

export class EditorImpl extends EditorBase {
  static properties = {
    ...super.properties,
    _selectedTab: { type: Number },
  };

  constructor() {
    super({
      entity: '',
      time_window: 'C',
      date: '',
      max_items: 10,
      show_channel: true,
      show_time: true,
      show_duration: true,
      show_title: true,
      show_description: true,
      view_mode: 'Liste',
    });
    if (DebugMode)
      console.debug(`[${this.constructor.cardName}] EditorImpl-Konstruktor wird aufgerufen`);
    this._selectedTab = 0;
  }

  async firstUpdated() {
    if (DebugMode)
      console.debug(`[${this.constructor.cardName}] EditorImpl firstUpdated wird aufgerufen`);
    await super.firstUpdated();
    if (DebugMode)
      console.debug(`[${this.constructor.cardName}] EditorImpl firstUpdated abgeschlossen`);
  }

  render() {
    this._debug('EditorImpl render wird aufgerufen');
    if (!this.hass) {
      if (DebugMode) console.debug(`[${this.constructor.cardName}] EditorImpl render: Kein hass`);
      return html`<div>Loading...</div>`;
    }

    if (DebugMode)
      console.debug(`[${this.constructor.cardName}] EditorImpl render mit config:`, this.config);
    return html`
      <div class="card-config">
        <ha-form
          .hass=${this.hass}
          .data=${this.config}
          .schema=${[
            {
              name: 'entity',
              selector: {
                entity: {
                  domain: 'sensor',
                  filter: {
                    attribute: 'epg_info',
                  },
                },
              },
            },
          ]}
          .computeLabel=${this._computeLabel}
          @value-changed=${this._valueChanged}
        ></ha-form>

        <ha-expansion-panel>
          <span slot="header">Anzeige</span>
          <div class="expander-content">
            <ha-expansion-panel>
              <div slot="header" class="expander-header">
                <ha-switch
                  .checked=${this.config.view_mode === 'Liste'}
                  @change=${(e) => this._handleViewModeChange('Liste', e)}
                  @click=${(e) => e.stopPropagation()}
                ></ha-switch>
                <span>Liste</span>
              </div>
              <ha-form
                .hass=${this.hass}
                .data=${this.config}
                .schema=${[
                  {
                    name: 'show_channel',
                    selector: { boolean: {} },
                  },
                  {
                    name: 'show_time',
                    selector: { boolean: {} },
                  },
                  {
                    name: 'show_duration',
                    selector: { boolean: {} },
                  },
                  {
                    name: 'show_title',
                    selector: { boolean: {} },
                  },
                  {
                    name: 'show_description',
                    selector: { boolean: {} },
                  },
                ]}
                .computeLabel=${this._computeLabel}
                @value-changed=${this._valueChanged}
              ></ha-form>
            </ha-expansion-panel>

            <ha-expansion-panel>
              <div slot="header" class="expander-header">
                <ha-switch
                  .checked=${this.config.view_mode === 'epg'}
                  @change=${(e) => this._handleViewModeChange('epg', e)}
                  @click=${(e) => e.stopPropagation()}
                ></ha-switch>
                <span>epg</span>
              </div>
              <ha-form
                .hass=${this.hass}
                .data=${this.config}
                .schema=${[
                  {
                    name: 'sortierung',
                    selector: {
                      template: {
                        multiline: true,
                      },
                    },
                  },
                ]}
                .computeLabel=${this._computeLabel}
                @value-changed=${this._valueChanged}
              ></ha-form>
            </ha-expansion-panel>

            <ha-expansion-panel>
              <div slot="header" class="expander-header">
                <ha-switch
                  .checked=${this.config.view_mode === 'Tabelle'}
                  @change=${(e) => this._handleViewModeChange('Tabelle', e)}
                  @click=${(e) => e.stopPropagation()}
                ></ha-switch>
                <span>Tabelle</span>
              </div>
              <ha-form
                .hass=${this.hass}
                .data=${this.config}
                .schema=${[
                  {
                    name: 'show_channel',
                    selector: { boolean: {} },
                  },
                  {
                    name: 'show_time',
                    selector: { boolean: {} },
                  },
                  {
                    name: 'show_duration',
                    selector: { boolean: {} },
                  },
                  {
                    name: 'show_title',
                    selector: { boolean: {} },
                  },
                  {
                    name: 'show_description',
                    selector: { boolean: {} },
                  },
                  {
                    name: 'time_window',
                    selector: {
                      select: {
                        options: [
                          { value: 'C', label: 'Aktuell' },
                          { value: 'D', label: 'Heute' },
                          { value: 'W', label: 'Diese Woche' },
                        ],
                      },
                    },
                  },
                  {
                    name: 'date',
                    selector: {
                      text: {},
                    },
                  },
                  {
                    name: 'max_items',
                    selector: {
                      number: {
                        min: 1,
                        max: 100,
                        mode: 'box',
                      },
                    },
                  },
                ]}
                .computeLabel=${this._computeLabel}
                @value-changed=${this._valueChanged}
              ></ha-form>
            </ha-expansion-panel>
          </div>
        </ha-expansion-panel>

        <ha-expansion-panel>
          <span slot="header">Filter</span>
          <ha-form
            .hass=${this.hass}
            .data=${this.config}
            .schema=${[
              {
                name: 'whitelist',
                selector: {
                  template: {
                    multiline: true,
                  },
                },
              },
              {
                name: 'blacklist',
                selector: {
                  template: {
                    multiline: true,
                  },
                },
              },
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
      case 'whitelist':
        return 'Whitelist (YAML)';
      case 'blacklist':
        return 'Blacklist (YAML)';
      case 'sortierung':
        return 'Sortierung (YAML)';
      default:
        return schema.name;
    }
  }

  _valueChanged(ev) {
    this._debug('EditorImpl _valueChanged wird aufgerufen mit:', ev.detail);
    const newValue = ev.detail.value;

    // Prüfe, ob ein Unter-Expander geöffnet wurde
    if (newValue.expanded) {
      // Schließe alle anderen Unter-Expander
      const allExpanders = ['Liste', 'epg', 'Tabelle'];
      allExpanders.forEach(expander => {
        if (expander !== newValue.name) {
          this.config[`${expander.toLowerCase()}_expanded`] = false;
        }
      });

      // Setze den view_mode basierend auf dem geöffneten Expander
      this.config.view_mode = newValue.name;
    }

    this.config = {
      ...this.config,
      ...newValue,
    };
    this._debug('EditorImpl config nach _valueChanged:', this.config);
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config: this.config },
        bubbles: true,
        composed: true,
      })
    );
  }

  _handleViewModeChange(mode, event) {
    this._debug('EditorImpl _handleViewModeChange wird aufgerufen mit:', mode, event);

    // Nur wenn der Schalter aktiviert wird, ändern wir den view_mode
    if (event.target.checked) {
      this.config.view_mode = mode;
      this.requestUpdate();
      this.dispatchEvent(
        new CustomEvent('config-changed', {
          detail: { config: this.config },
          bubbles: true,
          composed: true,
        })
      );
    } else {
      // Wenn der Schalter deaktiviert werden soll, setzen wir ihn wieder auf checked
      event.target.checked = true;
    }
  }

  static styles = css`
    .card-config {
      padding: 16px;
    }
    .expander-content {
      padding: 16px;
    }
    .expander-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    ha-expansion-panel {
      --expansion-panel-header-color: var(--primary-color);
      --expansion-panel-header-background: var(--primary-background-color);
      --expansion-panel-header-padding: 16px;
      --expansion-panel-header-border-radius: 4px;
      --expansion-panel-header-margin: 8px 0;
    }
    ha-expansion-panel[expanded] {
      --expansion-panel-header-background: var(--secondary-background-color);
    }
    ha-expansion-panel:not([expanded]) {
      --expansion-panel-header-background: var(--primary-background-color);
    }
  `;

  static getConfigElement() {
    return document.createElement(`${CardRegname}-editor`);
  }

  static getStubConfig() {
    return {
      entity: 'sensor.vdr_vdr_epg_info',
      time_window: 'C',
      date: '',
      view_mode: 'epg',
      max_items: 10,
      show_channel: true,
      show_time: true,
      show_duration: true,
      show_title: true,
      show_description: true,
      blacklist: '',
      whitelist: '',
      importantlist: '',
    };
  }

  getConfigSchema() {
    return [
      {
        type: 'string',
        name: 'entity',
        label: 'Entity',
        required: true,
      },
      {
        type: 'string',
        name: 'blacklist',
        label: 'Blacklist (RegEx, kommagetrennt)',
        description: 'Kanäle, die ausgeschlossen werden sollen',
      },
      {
        type: 'string',
        name: 'whitelist',
        label: 'Whitelist (RegEx, kommagetrennt)',
        description: 'Kanäle, die eingeschlossen werden sollen',
      },
      {
        type: 'string',
        name: 'importantlist',
        label: 'Wichtige Kanäle (RegEx, kommagetrennt)',
        description: 'Kanäle, die zuerst angezeigt werden sollen',
      },
    ];
  }
}
