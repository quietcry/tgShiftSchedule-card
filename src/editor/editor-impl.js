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
  DefaultConfig,
} from '../card-config.js';
import yaml from 'js-yaml';

export class EditorImpl extends EditorBase {
  static properties = {
    ...super.properties,
    _selectedTab: { type: Number },
    _selectedEpgTab: { type: Number },
    _yamlError: { type: String },
    _groupOrderError: { type: String },
    _viewModeDropdownOpen: { type: Boolean },
  };

  constructor() {
    super({
      ...DefaultConfig,
      ...{
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
        channelWidth: 180,
        epgShowPastTime: 60, // Minuten für Rückblick (Backview)
        epgShowFutureTime: 180, // Minuten sichtbar in der Ansicht
        epgPastTime: 30, // Minuten in die Vergangenheit
        epgFutureTime: 120, // Minuten in die Zukunft
        epgExtendConfig: '', // Erweiterte Konfiguration
      },
    });

    this._debug(`EditorImpl-Modul wird geladen`);
    this._selectedTab = 0;
    this._selectedEpgTab = 0;
    this._yamlError = '';
    this._groupOrderError = '';
    this._viewModeDropdownOpen = false;
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
        <!-- Tab-Navigation -->
        <div class="tab-navigation">
          <button
            class="tab-button ${this._selectedTab === 0 ? 'active' : ''}"
            @click=${() => (this._selectedTab = 0)}
          >
            Basic
          </button>
          <div class="tab-button-split ${this._selectedTab === 1 ? 'active' : ''}">
            <div class="tab-button-text" @click=${() => (this._selectedTab = 1)}>
              View [${this.config.view_mode}]
            </div>
            <div
              class="tab-button-chevron"
              @click=${e => {
                e.stopPropagation();
                this._toggleViewModeDropdown();
              }}
            >
              <ha-icon
                icon="mdi:chevron-down"
                class="chevron ${this._viewModeDropdownOpen ? 'open' : ''}"
              ></ha-icon>
            </div>

            ${this._viewModeDropdownOpen
              ? html`
                  <div class="view-mode-dropdown-panel">
                    <div
                      class="view-mode-option ${this.config.view_mode === 'Liste'
                        ? 'selected'
                        : ''}"
                      @click=${() => this._selectViewMode('Liste')}
                    >
                      <div
                        class="option-indicator ${this.config.view_mode === 'Liste'
                          ? 'selected'
                          : ''}"
                      ></div>
                      Liste
                    </div>
                    <div
                      class="view-mode-option ${this.config.view_mode === 'epg' ? 'selected' : ''}"
                      @click=${() => this._selectViewMode('epg')}
                    >
                      <div
                        class="option-indicator ${this.config.view_mode === 'epg'
                          ? 'selected'
                          : ''}"
                      ></div>
                      EPG
                    </div>
                    <div
                      class="view-mode-option ${this.config.view_mode === 'Tabelle'
                        ? 'selected'
                        : ''}"
                      @click=${() => this._selectViewMode('Tabelle')}
                    >
                      <div
                        class="option-indicator ${this.config.view_mode === 'Tabelle'
                          ? 'selected'
                          : ''}"
                      ></div>
                      Tabelle
                    </div>
                  </div>
                `
              : ''}
          </div>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          ${this._selectedTab === 0 ? this._renderBasicTab() : this._renderViewTab()}
        </div>
      </div>
    `;
  }

  _renderBasicTab() {
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this.config}
        .schema=${this._getBasicSchema()}
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
    `;
  }

  _renderViewTab() {
    return html` ${this._renderViewModePanel()} `;
  }

  _renderViewModePanel() {
    switch (this.config.view_mode) {
      case 'epg':
        return this._renderEpgViewPanel();
      case 'Liste':
        return this._renderListViewPanel();
      case 'Tabelle':
        return this._renderGridViewPanel();
      default:
        return this._renderEpgViewPanel();
    }
  }

  _renderEpgViewPanel() {
    return html`
      <div class="view-mode-panel">
        <!-- EPG Tab-Navigation -->
        <div class="epg-tab-navigation">
          <button
            class="epg-tab-button ${this._selectedEpgTab === 0 ? 'active' : ''}"
            @click=${() => (this._selectedEpgTab = 0)}
          >
            Anzeige
          </button>
          <button
            class="epg-tab-button ${this._selectedEpgTab === 1 ? 'active' : ''}"
            @click=${() => (this._selectedEpgTab = 1)}
          >
            Daten
          </button>
          <button
            class="epg-tab-button ${this._selectedEpgTab === 2 ? 'active' : ''}"
            @click=${() => (this._selectedEpgTab = 2)}
          >
            Zeit
          </button>
          <button
            class="epg-tab-button ${this._selectedEpgTab === 3 ? 'active' : ''}"
            @click=${() => (this._selectedEpgTab = 3)}
          >
            Layout
          </button>
        </div>

        <!-- EPG Tab Content -->
        <div class="epg-tab-content">${this._renderEpgTabContent()}</div>
      </div>
    `;
  }

  _renderEpgTabContent() {
    switch (this._selectedEpgTab) {
      case 0:
        return this._renderEpgDisplayTab();
      case 1:
        return this._renderEpgDataTab();
      case 2:
        return this._renderEpgTimeTab();
      case 3:
        return this._renderEpgLayoutTab();
      default:
        return this._renderEpgDisplayTab();
    }
  }

  _renderEpgDisplayTab() {
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this.config}
        .schema=${this._getEpgDisplaySchema()}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  _renderEpgDataTab() {
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this.config}
        .schema=${this._getEpgDataSchema()}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  _renderEpgTimeTab() {
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this.config}
        .schema=${this._getEpgTimeSchema()}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  _renderEpgLayoutTab() {
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this.config}
        .schema=${this._getEpgLayoutSchema()}
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
    `;
  }

  _renderListViewPanel() {
    return html`
      <div class="view-mode-panel">
        <h3>Liste View Konfiguration</h3>
        <p>Hier werden die Konfigurationsoptionen für die Listenansicht angezeigt.</p>
        <p>Diese Ansicht zeigt die Programme in einer kompakten Liste an.</p>
      </div>
    `;
  }

  _renderGridViewPanel() {
    return html`
      <div class="view-mode-panel">
        <h3>Tabelle View Konfiguration</h3>
        <ha-form
          .hass=${this.hass}
          .data=${this.config}
          .schema=${this._getTableSchema()}
          .computeLabel=${this._computeLabel}
          @value-changed=${this._valueChanged}
        ></ha-form>
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
      case 'epgExtendConfig':
        return 'Erweiterte Konfiguration (YAML)';
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

  _toggleViewModeDropdown() {
    this._viewModeDropdownOpen = !this._viewModeDropdownOpen;

    // Wenn Dropdown geöffnet wird, automatisch zum View-Tab wechseln
    if (this._viewModeDropdownOpen) {
      this._selectedTab = 1;
    }

    this.requestUpdate();
  }

  _selectViewMode(mode) {
    this._debug('EditorImpl _selectViewMode wird aufgerufen mit:', mode);

    this.config.view_mode = mode;
    this._selectedTab = 1; // Automatisch zum View-Tab wechseln
    this._viewModeDropdownOpen = false; // Dropdown schließen nach Auswahl
    this.requestUpdate();
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config: this.config },
        bubbles: true,
        composed: true,
      })
    );
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

  static styles = [
    super.styles,
    css`
      :host {
      }

      .card-config {
        padding: 10px;
      }

      /* Tab Navigation */
      .tab-navigation {
        display: flex;
        border-bottom: 1px solid var(--divider-color);
        margin-bottom: 16px;
      }

      .tab-button {
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-bottom: none;
        padding: 12px 24px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        color: var(--secondary-text-color);
        border-radius: 8px 8px 0 0;
        transition: all 0.2s ease;
        flex-shrink: 0; /* Verhindert, dass Tab-Buttons zu viel Platz einnehmen */
        margin-right: 2px;
      }

      .tab-button:hover {
        color: var(--primary-text-color);
        background-color: var(--primary-background-color);
        border-color: var(--primary-color);
      }

      .tab-button.active {
        color: var(--primary-color);
        background-color: var(--primary-background-color);
        border-color: var(--primary-color);
        border-bottom-color: var(--primary-background-color);
        z-index: 1;
        position: relative;
      }

      /* Split Tab-Button */
      .tab-button-split {
        display: flex;
        border: 1px solid var(--divider-color);
        border-bottom: none;
        transition: all 0.2s ease;
        background: var(--card-background-color);
        padding: 0;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        color: var(--secondary-text-color);
        flex-shrink: 0; /* Verhindert, dass er die gesamte Breite einnimmt */
        position: relative; /* Wichtig für absolute Positionierung des Dropdowns */
        border-radius: 8px 8px 0 0;
        margin-right: 2px;
      }

      .tab-button-split:hover {
        color: var(--primary-text-color);
        background-color: var(--primary-background-color);
        border-color: var(--primary-color);
      }

      .tab-button-split.active {
        border: 1px solid var(--primary-color);
        border-bottom-color: var(--primary-background-color);
        background-color: var(--primary-background-color);
        color: var(--primary-color);
        z-index: 1;
      }

      .tab-button-text {
        padding: 12px 16px 12px 24px;
        cursor: pointer;
        transition: all 0.2s ease;
        flex-shrink: 0; /* Verhindert, dass er die gesamte Breite einnimmt */
      }

      .tab-button-split.active .tab-button-text {
        color: var(--primary-color);
      }

      .tab-button-text:hover {
        color: var(--primary-color);
      }

      .tab-button-chevron {
        padding: 12px 16px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        border-left: 1px solid var(--divider-color);
      }

      .tab-button-split.active .tab-button-chevron {
        color: var(--primary-color);
      }

      .tab-button-chevron:hover {
        color: var(--primary-color);
      }

      .chevron {
        transition: transform 0.2s ease;
      }

      .chevron.open {
        transform: rotate(180deg);
      }

      .tab-content {
        min-height: 400px;
      }

      /* View Mode Panels */
      .view-mode-panel {
        padding: 5px;
        background-color: var(--card-background-color);
        border-radius: 8px;
        margin: 10px 0;
      }

      .view-mode-panel h3 {
        margin: 0 0 16px 0;
        color: var(--primary-text-color);
        font-size: 18px;
        font-weight: 500;
      }

      .view-mode-panel p {
        margin: 8px 0;
        color: var(--secondary-text-color);
        line-height: 1.5;
      }

      /* EPG Tab Navigation */
      .epg-tab-navigation {
        display: flex;
        border-bottom: 1px solid var(--divider-color);
        margin: 16px 0;
      }

      .epg-tab-button {
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-bottom: none;
        padding: 8px 16px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        color: var(--secondary-text-color);
        border-radius: 6px 6px 0 0;
        transition: all 0.2s ease;
        margin-right: 2px;
      }

      .epg-tab-button:hover {
        color: var(--primary-text-color);
        background-color: var(--primary-background-color);
        border-color: var(--primary-color);
      }

      .epg-tab-button.active {
        color: var(--primary-color);
        background-color: var(--primary-background-color);
        border-color: var(--primary-color);
        border-bottom-color: var(--primary-background-color);
        z-index: 1;
        position: relative;
      }

      .epg-tab-content {
        padding: 16px 0;
      }

      /* Dropdown Panel */
      .view-mode-dropdown-panel {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background-color: red !important; /* Test-Style */
        border: 1px solid var(--divider-color);
        border-top: none;
        border-radius: 0 0 6px 6px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        min-width: 200px; /* Mindestbreite */
      }

      .view-mode-option {
        padding: 12px 16px;
        cursor: pointer;
        font-size: 14px;
        color: var(--primary-text-color);
        display: flex;
        align-items: center;
        gap: 12px;
        transition: background-color 0.2s ease;
      }

      .view-mode-option:hover {
        background-color: var(--secondary-background-color);
      }

      .view-mode-option.selected {
        background-color: var(--primary-color);
        color: white;
      }

      .option-indicator {
        width: 16px;
        height: 16px;
        border: 2px solid var(--divider-color);
        border-radius: 50%;
        transition: all 0.2s ease;
      }

      .option-indicator.selected {
        border-color: white;
        background-color: white;
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
    `,
  ];

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
      epgPastTime: DefaultConfig.epgPastTime,
      epgFutureTime: DefaultConfig.epgFutureTime,
      epgShowFutureTime: DefaultConfig.epgShowFutureTime,
      epgShowPastTime: DefaultConfig.epgShowPastTime,
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
        default: DefaultConfig.epgPastTime,
      },
      {
        type: 'number',
        name: 'epgFutureTime',
        label: 'EPG Zukunft (Minuten)',
        description: 'Anzahl der Minuten in die Zukunft',
        default: DefaultConfig.epgFutureTime,
      },
      {
        type: 'number',
        name: 'epgShowFutureTime',
        label: 'EPG Anzeigebreite (Minuten)',
        description: 'Anzahl der sichtbaren Minuten in der Ansicht',
        default: DefaultConfig.epgShowFutureTime,
      },
      {
        type: 'number',
        name: 'epgShowPastTime',
        label: 'EPG Rückblick (Minuten)',
        description: 'Anzahl der Minuten für Rückblick (0-180)',
        default: DefaultConfig.epgShowPastTime,
      },
    ];
  }

  _getBasicSchema() {
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
      {
        name: 'epgExtendConfig',
        selector: {
          text: {
            multiline: true,
          },
        },
      },
    ];
  }

  _getViewSchema() {
    return [
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
        name: 'show_channel_groups',
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
        name: 'group_order',
        selector: {
          text: {
            multiline: true,
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
    ];
  }

  _getTableSchema() {
    return [
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
    ];
  }

  _getEpgDisplaySchema() {
    return [
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
    ];
  }

  _getEpgDataSchema() {
    return [
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
    ];
  }

  _getEpgTimeSchema() {
    return [
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
    ];
  }

  _getEpgLayoutSchema() {
    return [
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
        name: 'group_order',
        selector: {
          text: {
            multiline: true,
          },
        },
      },
    ];
  }
}
