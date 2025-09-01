import { html, css } from 'lit';
import { EditorBase } from './editor-base.js';
import {
  CardName,
  CardRegname,
  CardDescription,
  CardFilename,
  Version,
  DebugMode,
  showVersion,
  DefaultEpgPastTime,
  DefaultEpgFutureTime,
  DefaultEpgShowFutureTime,
  DefaultEpgShowPastTime,
} from '../card-config.js';
import yaml from 'js-yaml';

export class EditorImpl extends EditorBase {
  static properties = {
    ...super.properties,
    _selectedTab: { type: Number },
    _yamlError: { type: String },
    _groupOrderError: { type: String },
  };

  constructor() {
    super({
      entity: '',
      time_window: 'C',
      date: '',
      max_items: 10,
      show_channel: true,
      show_channel_groups: true,
      show_time: true,
      show_duration: true,
      show_shorttext: false,
      show_description: true,
      view_mode: 'Liste',
      epgPastTime: DefaultEpgPastTime,
      epgFutureTime: DefaultEpgFutureTime,
      epgShowFutureTime: DefaultEpgShowFutureTime,
      epgShowPastTime: DefaultEpgShowPastTime,
      channelWidth: 180,
    });
    this._debug(`EditorImpl-Modul wird geladen`);
    this._selectedTab = 0;
    this._yamlError = '';
    this._groupOrderError = '';
  }

  async firstUpdated() {
    this._debug(`EditorImpl firstUpdated wird aufgerufen`);
    await super.firstUpdated();

    // Initialisiere group_order als YAML-String, falls es als Array vorliegt
    if (this.config.group_order && Array.isArray(this.config.group_order)) {
      const yamlString = this._convertArrayToYaml(this.config.group_order);
      this.config.group_order = yamlString;
      this.config.group_order_parsed = this.config.group_order;
      this._debug('EditorImpl: group_order beim ersten Laden initialisiert:', yamlString);
    }
    this._debug(`EditorImpl firstUpdated abgeschlossen`);
  }

  render() {
    this._debug('EditorImpl render wird aufgerufen');
    if (!this.hass) {
      this._debug(`EditorImpl render: Kein hass`);
      return html`<div>Loading...</div>`;
    }

    this._debug(`EditorImpl render mit config:`, this.config);
    return html`
      <div class="card-config">
        <ha-form
          .hass=${this.hass}
          .data=${this.config}
          .schema=${this._getFormSchema()}
          .computeLabel=${this._computeLabel}
          @value-changed=${this._valueChanged}
          class=${this._yamlError ? 'yaml-error-input' : ''}
        ></ha-form>

        ${this._yamlError
          ? html`
              <div class="yaml-error">
                <ha-icon icon="mdi:alert-circle"></ha-icon>
                <span>YAML-Fehler: ${this._yamlError}</span>
              </div>
            `
          : ''}

        <ha-expansion-panel>
          <span slot="header">Anzeige</span>
          <div class="expander-content">
            <ha-expansion-panel>
              <div slot="header" class="expander-header">
                <ha-switch
                  .checked=${this.config.view_mode === 'Liste'}
                  @change=${e => this._handleViewModeChange('Liste', e)}
                  @click=${e => e.stopPropagation()}
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
                    name: 'show_shorttext',
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
                  @change=${e => this._handleViewModeChange('epg', e)}
                  @click=${e => e.stopPropagation()}
                ></ha-switch>
                <span>epg</span>
              </div>
              <ha-form
                .hass=${this.hass}
                .data=${this.config}
                .schema=${this._getEpgSchema()}
                .computeLabel=${this._computeLabel}
                @value-changed=${this._valueChanged}
                class=${this._groupOrderError ? 'yaml-error-input' : ''}
              ></ha-form>

              ${this._groupOrderError
                ? html`
                    <div class="yaml-error">
                      <ha-icon icon="mdi:alert-circle"></ha-icon>
                      <span>group_order YAML-Fehler: ${this._groupOrderError}</span>
                    </div>
                  `
                : ''}
            </ha-expansion-panel>

            <ha-expansion-panel>
              <div slot="header" class="expander-header">
                <ha-switch
                  .checked=${this.config.view_mode === 'Tabelle'}
                  @change=${e => this._handleViewModeChange('Tabelle', e)}
                  @click=${e => e.stopPropagation()}
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
                    name: 'show_shorttext',
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
                  text: {
                    multiline: true,
                  },
                },
              },
              {
                name: 'blacklist',
                selector: {
                  text: {
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

  updated(changedProps) {
    super.updated?.(changedProps);
    // Nach dem Rendern: Fehler-Outline setzen
    if (this._yamlError) {
      const form = this.renderRoot.querySelector('ha-form');
      if (form) {
        // Versuche mwc-textarea oder ha-textfield zu finden
        const textarea = form.shadowRoot?.querySelector('mwc-textarea, ha-textfield, textarea');
        if (textarea) {
          textarea.setAttribute('invalid', 'true');
          textarea.style.setProperty('border', '2px solid var(--error-color)', 'important');
          textarea.style.setProperty('outline', '2px solid var(--error-color)', 'important');
        }
      }
    } else {
      const form = this.renderRoot.querySelector('ha-form');
      if (form) {
        const textarea = form.shadowRoot?.querySelector('mwc-textarea, ha-textfield, textarea');
        if (textarea) {
          textarea.removeAttribute('invalid');
          textarea.style.removeProperty('border');
          textarea.style.removeProperty('outline');
        }
      }
    }
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
      case 'show_shorttext':
        return 'Kurztext anzeigen';
      case 'show_description':
        return 'Beschreibung anzeigen';
      case 'show_channel_groups':
        return 'Kanalgruppen anzeigen';
      case 'whitelist':
        return 'Whitelist (YAML)';
      case 'blacklist':
        return 'Blacklist (YAML)';
      case 'group_order':
        return 'Sortierung (YAML)';
      case 'epgPastTime':
        return 'EPG Vergangenheit (Minuten)';
      case 'epgFutureTime':
        return 'EPG Zukunft (Minuten)';
      case 'epgShowFutureTime':
        return 'EPG Anzeigebreite (Minuten)';
      case 'epgShowPastTime':
        return 'EPG Rückblick (Minuten)';
      // case 'useDummyData':
      //   return 'Dummy-Daten verwenden';
      case 'show_shorttext':
        return 'Kurztext anzeigen';
      default:
        return schema.name;
    }
  }

  _valueChanged(ev) {
    this._debug('EditorImpl _valueChanged wird aufgerufen mit:', ev.detail);

    const newValue = ev.detail.value;

    // YAML-Validierung für group_order
    if (newValue.group_order !== undefined) {
      const validationResult = this._validateYaml(newValue.group_order);
      if (!validationResult.isValid) {
        this._debug('EditorImpl: group_order YAML-Validierungsfehler:', validationResult.error);
        console.warn('group_order YAML-Validierungsfehler:', validationResult.error);
        this._groupOrderError = validationResult.error;
        this.requestUpdate();
      } else {
        this._debug('EditorImpl: group_order YAML ist gültig');
        if (this._groupOrderError) {
          this._groupOrderError = '';
          this.requestUpdate();
        }

        // Parse den String als YAML für die Verwendung
        try {
          const groupOrder = yaml.load(newValue.group_order);
          this._debug('EditorImpl: group_order YAML geparst:', groupOrder);
          this.config.group_order_parsed = groupOrder;
        } catch (error) {
          this._debug('EditorImpl: Fehler beim Parsen der group_order:', error);
          this.config.group_order_parsed = [];
        }
      }
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

  _parseGroupOrderYaml(yamlString) {
    if (!yamlString || !yamlString.trim()) {
      this._debug('EditorImpl: Leere YAML-String, gebe leeres Array zurück');
      return [];
    }

    this._debug('EditorImpl: Parse YAML-String:', yamlString);

    const lines = yamlString
      .split('\n')
      .map(line => line.trim())
      .filter(line => line);
    const groups = [];
    let currentGroup = null;

    for (const line of lines) {
      this._debug('EditorImpl: Verarbeite Zeile:', line);

      // Prüfe ob es eine Gruppe ist (beginnt mit - und hat keine Unterpunkte)
      if (line.startsWith('- ') && !line.includes('  - ') && !line.includes('name:')) {
        const groupName = line.substring(2).trim();
        if (groupName) {
          this._debug('EditorImpl: Neue Gruppe gefunden:', groupName);
          currentGroup = {
            name: groupName,
            channels: [],
          };
          groups.push(currentGroup);
        }
      }
      // Prüfe ob es ein Kanal ist (hat Einrückung)
      else if (line.startsWith('  - ') && currentGroup) {
        const channelName = line.substring(4).trim();
        if (channelName) {
          this._debug('EditorImpl: Kanal zu Gruppe hinzugefügt:', channelName);
          currentGroup.channels.push({
            name: channelName,
          });
        }
      }
      // Ignoriere andere Zeilen (tolerant)
      else {
        this._debug('EditorImpl: Ignoriere Zeile:', line);
      }
    }

    this._debug('EditorImpl: YAML geparst:', { yamlString, result: groups });

    // Sicherheitscheck: Stelle sicher, dass es ein Array ist
    if (!Array.isArray(groups)) {
      this._debug('EditorImpl: Fehler - Ergebnis ist kein Array:', groups);
      return [];
    }

    return groups;
  }

  _convertArrayToYaml(groupArray) {
    if (!Array.isArray(groupArray) || groupArray.length === 0) {
      return '';
    }

    let yamlString = '';
    groupArray.forEach(group => {
      if (group.name) {
        yamlString += `- ${group.name}\n`;
        if (group.channels && Array.isArray(group.channels)) {
          group.channels.forEach(channel => {
            if (channel.name) {
              yamlString += `  - ${channel.name}\n`;
            }
          });
        }
      }
    });

    return yamlString.trim();
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

  _validateYaml(yamlString) {
    if (!yamlString || yamlString.trim() === '') {
      return { isValid: true, error: null };
    }

    try {
      // Verwende js-yaml für professionelle YAML-Validierung
      yaml.load(yamlString);
      return { isValid: true, error: null };
    } catch (error) {
      // js-yaml gibt detaillierte Fehlermeldungen zurück
      return {
        isValid: false,
        error: `Zeile ${error.mark?.line || 'unbekannt'}: ${error.message}`,
      };
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
    .yaml-error {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 8px 0;
      padding: 12px;
      background-color: var(--error-color);
      color: white;
      border-radius: 4px;
      font-size: 14px;
    }
    .yaml-error ha-icon {
      color: white;
    }
    .yaml-error-input,
    .yaml-error-input ha-textarea,
    .yaml-error-input ha-textfield,
    .yaml-error-input mwc-textarea,
    .yaml-error-input mwc-textfield {
      --mdc-text-field-outline-color: var(--error-color) !important;
      --mdc-text-field-focus-outline-color: var(--error-color) !important;
      --mdc-text-field-hover-outline-color: var(--error-color) !important;
      --mdc-text-field-label-ink-color: var(--error-color) !important;
      --mdc-text-field-ink-color: var(--error-color) !important;
    }
    .yaml-error-input ha-textarea {
      --mdc-text-field-outline-color: var(--error-color) !important;
      --mdc-text-field-focus-outline-color: var(--error-color) !important;
      --mdc-text-field-hover-outline-color: var(--error-color) !important;
    }
    .yaml-error-input ha-textfield {
      --mdc-text-field-outline-color: var(--error-color) !important;
      --mdc-text-field-focus-outline-color: var(--error-color) !important;
      --mdc-text-field-hover-outline-color: var(--error-color) !important;
    }
    .yaml-error-input mwc-textarea {
      --mdc-text-field-outline-color: var(--error-color) !important;
      --mdc-text-field-focus-outline-color: var(--error-color) !important;
      --mdc-text-field-hover-outline-color: var(--error-color) !important;
    }
    .yaml-error-input mwc-textfield {
      --mdc-text-field-outline-color: var(--error-color) !important;
      --mdc-text-field-focus-outline-color: var(--error-color) !important;
      --mdc-text-field-hover-outline-color: var(--error-color) !important;
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
      show_shorttext: false,
      show_description: true,
      blacklist: '',
      whitelist: '',
      importantlist: '',
      epgPastTime: DefaultEpgPastTime,
      epgFutureTime: DefaultEpgFutureTime,
      epgShowFutureTime: DefaultEpgShowFutureTime,
      epgShowPastTime: DefaultEpgShowPastTime,
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
      {
        type: 'number',
        name: 'epgPastTime',
        label: 'EPG Vergangenheit (Minuten)',
        description: 'Anzahl der Minuten in die Vergangenheit',
        default: DefaultEpgPastTime,
      },
      {
        type: 'number',
        name: 'epgFutureTime',
        label: 'EPG Zukunft (Minuten)',
        description: 'Anzahl der Minuten in die Zukunft',
        default: DefaultEpgFutureTime,
      },
      {
        type: 'number',
        name: 'epgShowFutureTime',
        label: 'EPG Anzeigebreite (Minuten)',
        description: 'Anzahl der sichtbaren Minuten in der Ansicht',
        default: DefaultEpgShowFutureTime,
      },
      {
        type: 'number',
        name: 'epgShowPastTime',
        label: 'EPG Rückblick (Minuten)',
        description: 'Anzahl der Minuten für Rückblick (0-180)',
        default: DefaultEpgShowPastTime,
      },
    ];
  }

  _getFormSchema() {
    return [
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
      {
        name: 'epgPastTime',
        selector: {
          number: {
            min: 0,
            max: 1440,
            step: 5,
            unit_of_measurement: 'Minuten',
          },
        },
      },
      {
        name: 'epgFutureTime',
        selector: {
          number: {
            min: 0,
            max: 1440,
            step: 5,
            unit_of_measurement: 'Minuten',
          },
        },
      },
      {
        name: 'epgShowFutureTime',
        selector: {
          number: {
            min: 30,
            max: 1440,
            step: 5,
            unit_of_measurement: 'Minuten',
          },
        },
      },
      {
        name: 'epgShowPastTime',
        selector: {
          number: {
            min: 0,
            max: 180,
            step: 5,
            unit_of_measurement: 'Minuten',
          },
        },
      },
    ];
  }

  _getEpgSchema() {
    const schema = [
      {
        name: 'group_order',
        selector: {
          text: {
            multiline: true,
          },
        },
      },
      // Fehlermeldung als Info-Feld direkt nach group_order
      ...(this._groupOrderError
        ? [
            {
              name: 'group_order_error',
              type: 'custom:markdown',
              content: `**<span style=\"color:var(--error-color)\">${this._groupOrderError}</span>**`,
            },
          ]
        : []),
      {
        name: 'show_channel_groups',
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
        name: 'show_shorttext',
        selector: { boolean: {} },
      },
      {
        name: 'show_description',
        selector: { boolean: {} },
      },
      {
        name: 'channelWidth',
        selector: {
          number: {
            min: 50,
            max: 500,
            step: 10,
            mode: 'slider',
            unit_of_measurement: 'px',
          },
        },
      },
      {
        name: 'epgPastTime',
        selector: {
          number: {
            min: 0,
            max: 1440,
            step: 10,
            mode: 'slider',
            unit_of_measurement: 'min',
          },
        },
      },
      {
        name: 'epgFutureTime',
        selector: {
          number: {
            min: 0,
            max: 1440,
            step: 10,
            mode: 'slider',
            unit_of_measurement: 'min',
          },
        },
      },
      {
        name: 'epgShowFutureTime',
        selector: {
          number: {
            min: 30,
            max: 1440,
            step: 10,
            mode: 'slider',
            unit_of_measurement: 'min',
          },
        },
      },
      {
        name: 'epgShowPastTime',
        selector: {
          number: {
            min: 0,
            max: 180,
            step: 10,
            mode: 'slider',
            unit_of_measurement: 'min',
          },
        },
      },
      // useDummyData ist eine Build-Variable, keine Editor-Option
      // {
      //   name: 'useDummyData',
      //   selector: { boolean: {} },
      // },
      {
        name: 'channelWidth',
        selector: {
          number: {
            min: 50,
            max: 500,
            step: 10,
            mode: 'slider',
            unit_of_measurement: 'px',
          },
        },
      },
    ];
    return schema;
  }
}
