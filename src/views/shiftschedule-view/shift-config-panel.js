/**
 * ShiftConfigPanel - Konfigurationspanel für Schichten
 * 
 * Verwaltet die Konfiguration aller Schichten (aktiv/inaktiv, Reihenfolge, etc.)
 */

import { html, css, LitElement } from 'lit';
import { sharedMenuStyles } from './shared-menu-styles.js';
import { renderMenuBar } from './menu-bar-template.js';
import { Version } from '../../card-config.js';

export class ShiftConfigPanel extends LitElement {
  static properties = {
    calendars: {
      type: Array,
      hasChanged(newVal, oldVal) {
        // Verhindere Updates wenn Panel bereits initialisiert wurde
        // Nur beim ersten Setzen (oldVal ist undefined) erlauben wir Updates
        if (oldVal === undefined) {
          return true; // Erste Initialisierung erlauben
        }
        // Nach der Initialisierung: Ignoriere externe Updates
        // Das Panel verwaltet seine eigenen calendars intern
        return false;
      }
    },
    selectedShortcut: { type: String },
    hass: { type: Object },
    _validationErrors: { type: Object, state: true },
    _currentView: { type: String, state: true },
    holidays: { type: Object },
    statusOnlyInTimeRange: { type: Boolean },
  };

  static styles = [
    sharedMenuStyles,
    css`
    :host {
      display: block;
      width: 100%;
    }

    /* Gemeinsame Menu-Styles werden aus shared-menu-styles.js importiert */

    .config-menu-bar {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 12px;
      background-color: var(--card-background-color, #ffffff);
      border-radius: 4px 4px 0 0;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-bottom: none;
    }

    .config-panel {
      background-color: var(--card-background-color, #ffffff);
      border-radius: 0 0 4px 4px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-top: none;
      display: flex;
      flex-direction: column;
      padding: 12px;
      position: relative;
      min-height: 200px;
    }


    /* Gemeinsame Menu-Styles und Farbleisten-Styles werden aus shared-menu-styles.js importiert */

    .control-button {
      width: 40px;
      height: 40px;
      border-radius: 4px;
      border: 1px solid var(--divider-color, #e0e0e0);
      background-color: var(--card-background-color, #ffffff);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s;
      font-size: 18px;
    }

    .control-button:hover:not(:disabled) {
      background-color: var(--divider-color, #e0e0e0);
    }

    .control-button:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .control-button.delete {
      color: var(--error-color, #f44336);
    }

    .control-button.delete:hover:not(:disabled) {
      background-color: var(--error-color, #f44336);
      color: white;
    }

    .add-shift-color-button {
      flex: 0 0 30px !important;
      background-color: var(--divider-color, #e0e0e0) !important;
      color: var(--primary-text-color, #212121);
      font-size: 24px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px dashed var(--divider-color, #e0e0e0) !important;
      min-width: 30px;
      max-width: 30px;
    }

    .add-shift-color-button:hover:not(:disabled) {
      background-color: var(--primary-color, #03a9f4) !important;
      color: white;
      border-color: var(--primary-color, #03a9f4) !important;
    }

    .add-shift-color-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }


    .shift-item.disabled {
      opacity: 0.5;
    }

    .shifts-list {
      margin-bottom: 24px;
    }

    .shift-editor {
      border-top: 1px solid var(--divider-color, #e0e0e0);
      padding-top: 16px;
      margin-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .editor-row {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      flex-wrap: wrap;
    }

    .editor-field {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 150px;
    }

    .editor-field.id-field {
      flex: 0 0 auto;
      min-width: 80px;
      max-width: 100px;
    }

    .editor-field label {
      display: block;
      margin-bottom: 8px;
      font-weight: bold;
      color: var(--primary-text-color, #212121);
    }

    ha-textfield[error] {
      --mdc-text-field-outline-color: var(--error-color, #f44336);
      --mdc-text-field-focus-outline-color: var(--error-color, #f44336);
    }

    .editor-section {
      margin-bottom: 0;
      flex: 1;
      min-width: 100%;
    }

    .editor-section.full-width {
      width: 100%;
    }

    .editor-section label {
      display: block;
      margin-bottom: 8px;
      font-weight: bold;
      color: var(--primary-text-color, #212121);
    }

    .color-input-group {
      display: flex;
      gap: 12px;
      align-items: center;
      position: relative;
    }

    .color-picker-input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
      pointer-events: none;
    }

    .color-preview-large {
      width: 60px;
      height: 60px;
      border-radius: 4px;
      border: 2px solid var(--divider-color, #e0e0e0);
      flex-shrink: 0;
    }

    .color-picker-input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
      pointer-events: none;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .view-switcher {
      display: flex;
      gap: 8px;
      align-items: center;
      justify-content: center;
      padding: 8px;
      margin: 8px 0;
      border-top: 1px solid var(--divider-color, #e0e0e0);
      border-bottom: 1px solid var(--divider-color, #e0e0e0);
    }

    .view-radio-button {
      flex: 1;
      padding: 8px 16px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 4px;
      background-color: var(--card-background-color, #ffffff);
      color: var(--primary-text-color, #212121);
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
      font-size: 14px;
    }

    .view-radio-button:hover {
      background-color: var(--divider-color, #e0e0e0);
    }

    .view-radio-button.selected {
      background-color: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #ffffff);
      border-color: var(--primary-color, #03a9f4);
    }

    .view-content {
      flex: 1;
      overflow-y: auto;
    }

    .no-selection {
      padding: 20px;
      text-align: center;
      color: var(--secondary-text-color);
    }

    .holidays-view,
    .other-view {
      padding: 20px;
    }

    .holidays-view h3,
    .other-view h3 {
      margin-top: 0;
      color: var(--primary-text-color);
    }

    .other-options {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 16px;
    }

    .option-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px;
      background-color: var(--card-background-color, #ffffff);
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 4px;
    }

    .option-label {
      flex: 1;
      font-size: 14px;
      color: var(--primary-text-color, #000000);
      cursor: pointer;
    }

    .holidays-fields {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 16px;
    }

    .holiday-switch-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 8px 0;
    }

    .holiday-label {
      flex: 1;
      font-size: 14px;
      color: var(--primary-text-color);
      cursor: pointer;
    }

    .holidays-fields ha-switch {
      flex-shrink: 0;
    }

    .version-info {
      position: absolute;
      bottom: 8px;
      right: 12px;
      font-size: 11px;
      color: var(--secondary-text-color, #757575);
    }

    .switch-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex: 1;
      min-width: 200px;
    }

    .switch-label {
      flex: 1;
      font-size: 14px;
      color: var(--primary-text-color, #000000);
      cursor: pointer;
    }

    .switch-item ha-switch {
      flex-shrink: 0;
    }

    .time-ranges-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .time-range-add-button {
      width: 28px;
      height: 28px;
      border-radius: 4px;
      border: 1px solid var(--divider-color, #e0e0e0);
      background-color: var(--card-background-color, #ffffff);
      color: var(--primary-color, #03a9f4);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: bold;
      transition: background-color 0.2s;
    }

    .time-range-add-button:hover:not(:disabled) {
      background-color: var(--primary-color, #03a9f4);
      color: white;
    }

    .time-range-add-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .time-ranges-table {
      display: flex;
      flex-direction: column;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 4px;
      overflow: hidden;
    }

    .time-ranges-header-row {
      display: grid;
      grid-template-columns: 60px 1fr 1fr 40px;
      background-color: var(--divider-color, #f5f5f5);
      border-bottom: 1px solid var(--divider-color, #e0e0e0);
    }

    .time-range-header-cell {
      padding: 8px 12px;
      font-weight: bold;
      font-size: 14px;
      color: var(--primary-text-color, #212121);
      border-right: 1px solid var(--divider-color, #e0e0e0);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .time-range-header-cell:last-child {
      border-right: none;
    }

    .time-range-row {
      display: grid;
      grid-template-columns: 60px 1fr 1fr 40px;
      border-bottom: 1px solid var(--divider-color, #e0e0e0);
    }

    .time-range-row:last-child {
      border-bottom: none;
    }

    .time-range-cell {
      padding: 8px 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-right: 1px solid var(--divider-color, #e0e0e0);
    }

    .time-range-cell:last-child {
      border-right: none;
    }

    .time-range-cell.id-cell {
      padding: 8px;
    }

    .time-range-cell.action-cell {
      padding: 4px;
      justify-content: center;
    }

    .time-range-cell ha-textfield {
      width: 100%;
      max-width: 120px;
      margin: 0 auto;
    }

    .time-range-delete-button {
      width: 28px;
      height: 28px;
      border-radius: 4px;
      border: 1px solid var(--divider-color, #e0e0e0);
      background-color: var(--card-background-color, #ffffff);
      color: var(--error-color, #f44336);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: bold;
      transition: background-color 0.2s;
      flex-shrink: 0;
    }

    .time-range-delete-button:hover:not(:disabled) {
      background-color: var(--error-color, #f44336);
      color: white;
    }

    .time-range-delete-button:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    ha-textfield[error] {
      --mdc-text-field-outline-color: var(--error-color, #f44336);
      --mdc-text-field-focus-outline-color: var(--error-color, #f44336);
    }
    `,
  ];

  constructor() {
    super();
    this.calendars = [];
    this.selectedShortcut = null;
    this._validationErrors = {};
    this._currentView = 'shifts'; // 'shifts', 'holidays', 'other'
  }

  connectedCallback() {
    super.connectedCallback();
    this._updateValidationErrors();
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    // Ignoriere calendars-Updates von außen, wenn Panel bereits initialisiert wurde
    // (nur beim ersten Setzen akzeptieren wir externe calendars)
    if (changedProperties.has('calendars')) {
      const oldCalendars = changedProperties.get('calendars');
      console.log('[ConfigPanel] updated() aufgerufen mit calendars-Änderung', {
        oldCalendars: oldCalendars?.length,
        newCalendars: this.calendars?.length,
        hasChanged: this.constructor.properties.calendars.hasChanged
      });

      // Wenn calendars bereits gesetzt waren und sich jetzt ändern, könnte es ein externes Update sein
      // Prüfe ob die Daten wirklich unterschiedlich sind
      if (oldCalendars && oldCalendars.length > 0 && this.calendars && this.calendars.length > 0) {
        const oldStr = JSON.stringify(oldCalendars);
        const newStr = JSON.stringify(this.calendars);
        // Wenn die Daten gleich sind, ignoriere das Update (nur Referenz-Änderung)
        if (oldStr === newStr) {
          console.log('[ConfigPanel] calendars: Update ignoriert (Daten identisch)');
          return; // Ignoriere Update, da Daten identisch sind
        }
      }
      this._updateValidationErrors();
    }

    if (changedProperties.has('selectedShortcut')) {
      this._updateValidationErrors();
    }
  }

  _validateCalendar(calendar) {
    const errors = {};
    
    // Validiere Schicht-ID
    if (!calendar.shortcut || !/^[a-z]$/.test(calendar.shortcut)) {
      errors.shortcut = true;
    }
    
    // Validiere Zeiträume
    if (calendar.timeRanges && Array.isArray(calendar.timeRanges)) {
      const timeRangeIds = [];
      
      calendar.timeRanges.forEach((range, index) => {
        const rangeData = typeof range === 'object' && range.times ? range : { id: null, times: range || [null, null] };
        
        // Validiere Zeitraum-ID
        if (!rangeData.id || !/^[1-9]$/.test(rangeData.id)) {
          errors[`timeRange_${index}_id`] = true;
        } else {
          // Prüfe auf doppelte IDs
          const idNum = parseInt(rangeData.id);
          if (timeRangeIds.includes(idNum)) {
            errors[`timeRange_${index}_id`] = true;
          } else {
            timeRangeIds.push(idNum);
          }
        }
        
        // Validiere Zeit-Format (optional, aber wenn vorhanden, muss es gültig sein)
        if (rangeData.times && rangeData.times[0] && !/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(rangeData.times[0])) {
          errors[`timeRange_${index}_start`] = true;
        }
        if (rangeData.times && rangeData.times[1] && !/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(rangeData.times[1])) {
          errors[`timeRange_${index}_end`] = true;
        }
      });
    }
    
    return errors;
  }

  _hasValidationErrors() {
    if (!this.selectedShortcut) {
      return false;
    }
    const calendar = this.calendars.find(cal => cal.shortcut === this.selectedShortcut);
    if (!calendar) {
      return false;
    }
    const errors = this._validateCalendar(calendar);
    return Object.keys(errors).length > 0;
  }

  _triggerColorPicker(shortcut) {
    // Finde das versteckte Color-Input-Element und triggere den Click
    const colorInput = this.shadowRoot.querySelector(`input[type="color"]`);
    if (colorInput) {
      colorInput.click();
    }
  }

  render() {
    const editingCalendar = this.calendars.find(cal => cal.shortcut === this.selectedShortcut);
    const selectedIndex = this.calendars.findIndex(cal => cal.shortcut === this.selectedShortcut);
    
    return html`
      <div class="config-menu-bar">
        ${renderMenuBar({
          left: html`
            <button class="cancel-button menu-button" @click=${this._handleClose} title="Abbrechen">×</button>
          `,
          center: html`
            <div class="view-switcher">
              <button
                class="view-radio-button ${this._currentView === 'shifts' ? 'selected' : ''}"
                @click=${() => {
                  this._currentView = 'shifts';
                  this.requestUpdate();
                }}
                title="Schichten"
              >
                Schichten
              </button>
              <button
                class="view-radio-button ${this._currentView === 'holidays' ? 'selected' : ''}"
                @click=${() => {
                  this._currentView = 'holidays';
                  this.requestUpdate();
                }}
                title="Feiertage"
              >
                Feiertage
              </button>
              <button
                class="view-radio-button ${this._currentView === 'other' ? 'selected' : ''}"
                @click=${() => {
                  this._currentView = 'other';
                  this.requestUpdate();
                }}
                title="Sonstiges"
              >
                Sonstiges
              </button>
            </div>
          `,
          right: html`
            <button 
              class="confirm-button menu-button" 
              @click=${this._handleSave} 
              title="Speichern"
              ?disabled=${this._hasValidationErrors()}
            >✓</button>
          `,
          fullWidth: this._currentView === 'shifts' ? html`
            <div class="color-bar">
              ${this.calendars.map((calendar, index) => {
                const isSelected = calendar.shortcut === this.selectedShortcut;
                const hasErrors = this._hasValidationErrors() && isSelected;
                return html`
                  <button
                    class="color-button ${isSelected ? 'selected' : ''} ${calendar.enabled ? '' : 'disabled'}"
                    style="background-color: ${calendar.color || '#ff9800'};"
                    @click=${() => {
                      if (!this._hasValidationErrors()) {
                        this.selectedShortcut = calendar.shortcut;
                        this._updateValidationErrors();
                      }
                    }}
                    ?disabled=${hasErrors}
                    title="${calendar.name || `Schicht ${calendar.shortcut.toUpperCase()}`} ${calendar.enabled ? '' : '(deaktiviert)'}${hasErrors ? ' (Fehlerhafte Eingabe)' : ''}"
                  ></button>
                `;
              })}
              <button
                class="color-button add-shift-color-button"
                @click=${this._addShift}
                title="Neue Schicht hinzufügen"
                ?disabled=${this._hasValidationErrors()}
              >
                +
              </button>
            </div>
          ` : '',
        })}
      </div>
      <div class="config-panel">
        <div class="view-content">
          ${this._currentView === 'shifts' ? this._renderShiftsView(editingCalendar, selectedIndex) : ''}
          ${this._currentView === 'holidays' ? this._renderHolidaysView() : ''}
          ${this._currentView === 'other' ? this._renderOtherView() : ''}
        </div>
        <span class="version-info">v${Version}</span>
      </div>
    `;
  }

  _renderShiftsView(editingCalendar, selectedIndex) {
    return editingCalendar
      ? html`
              <div class="shift-editor">
                <!-- Zeile 1: Name, Farbe, ID -->
                <div class="editor-row">
                  <div class="editor-field">
                    <label>Name</label>
                    <ha-textfield
                      .value=${editingCalendar.name || ''}
                      @input=${e => this._updateCalendar(editingCalendar.shortcut, { name: e.target.value })}
                      placeholder="Schichtname"
                    ></ha-textfield>
                  </div>
                  
                  <div class="editor-field">
                    <label>Farbe</label>
                    <div class="color-input-group">
                      <input
                        type="color"
                        .value=${editingCalendar.color || '#ff9800'}
                        @input=${e => this._updateCalendar(editingCalendar.shortcut, { color: e.target.value })}
                        class="color-picker-input"
                        title="Farbauswahl öffnen"
                      />
                      <div
                        class="color-preview-large"
                        style="background-color: ${editingCalendar.color || '#ff9800'}; cursor: pointer;"
                        @click=${() => this._triggerColorPicker(editingCalendar.shortcut)}
                        title="Farbauswahl öffnen"
                      ></div>
                    </div>
                  </div>
                  
                  <div class="editor-field id-field">
                    <label>ID</label>
                    <ha-textfield
                      .value=${editingCalendar.shortcut || ''}
                      @input=${e => {
                        this._updateCalendarId(editingCalendar.shortcut, e.target.value);
                        this._updateValidationErrors();
                      }}
                      placeholder="a"
                      maxlength="1"
                      pattern="[a-z]"
                      .error=${this._validationErrors[`${editingCalendar.shortcut}_shortcut`] || false}
                    ></ha-textfield>
                  </div>
                </div>
                
                <!-- Zeile 2: Aktiviert, Relevant -->
                <div class="editor-row">
                  <div class="switch-item">
                    <label class="switch-label">Aktiviert</label>
                    <ha-switch
                      .checked=${editingCalendar.enabled !== false}
                      @change=${e => this._updateCalendar(editingCalendar.shortcut, { enabled: e.target.checked })}
                    ></ha-switch>
                  </div>
                  <div class="switch-item">
                    <label class="switch-label">Status relevant</label>
                    <ha-switch
                      .checked=${editingCalendar.statusRelevant !== false}
                      @change=${e => this._updateCalendar(editingCalendar.shortcut, { statusRelevant: e.target.checked })}
                    ></ha-switch>
                  </div>
                </div>
                
                <!-- Zeile 3: Zeiträume -->
                <div class="editor-row">
                  <div class="editor-section full-width">
                    <div class="time-ranges-header">
                      <label>Zeiträume</label>
                      <button
                        class="time-range-add-button"
                        @click=${() => this._addTimeRange(editingCalendar.shortcut)}
                        title="Zeitbereich hinzufügen"
                        ?disabled=${(editingCalendar.timeRanges && editingCalendar.timeRanges.length >= 9) || false}
                      >
                        +
                      </button>
                    </div>
                    ${editingCalendar.timeRanges && editingCalendar.timeRanges.length > 0
                      ? html`
                        <div class="time-ranges-table">
                          <div class="time-ranges-header-row">
                            <div class="time-range-header-cell id-header">ID</div>
                            <div class="time-range-header-cell">Start</div>
                            <div class="time-range-header-cell">ENDE</div>
                            <div class="time-range-header-cell action-header"></div>
                          </div>
                          ${editingCalendar.timeRanges.map((range, rangeIndex) => {
                        const rangeData = typeof range === 'object' && range.times ? range : { id: null, times: range || [null, null] };
                        return html`
                        <div class="time-range-row">
                          <div class="time-range-cell id-cell">
                            <ha-textfield
                              .value=${rangeData.id || ''}
                              @input=${e => {
                                this._updateTimeRangeId(editingCalendar.shortcut, rangeIndex, e.target.value);
                                this._updateValidationErrors();
                              }}
                              placeholder="1"
                              maxlength="1"
                              pattern="[1-9]"
                              .error=${this._validationErrors[`${editingCalendar.shortcut}_timeRange_${rangeIndex}_id`] || false}
                            ></ha-textfield>
                          </div>
                          <div class="time-range-cell">
                            <ha-textfield
                              type="time"
                              .value=${rangeData.times[0] || ''}
                              @input=${e => {
                                this._updateTimeRange(editingCalendar.shortcut, rangeIndex, 0, e.target.value || null);
                                this._updateValidationErrors();
                              }}
                              placeholder="HH:MM"
                              pattern="[0-9]{2}:[0-9]{2}"
                              .error=${this._validationErrors[`${editingCalendar.shortcut}_timeRange_${rangeIndex}_start`] || false}
                            ></ha-textfield>
                          </div>
                          <div class="time-range-cell">
                            <ha-textfield
                              type="time"
                              .value=${rangeData.times[1] || ''}
                              @input=${e => {
                                this._updateTimeRange(editingCalendar.shortcut, rangeIndex, 1, e.target.value || null);
                                this._updateValidationErrors();
                              }}
                              placeholder="HH:MM"
                              pattern="[0-9]{2}:[0-9]{2}"
                              .error=${this._validationErrors[`${editingCalendar.shortcut}_timeRange_${rangeIndex}_end`] || false}
                            ></ha-textfield>
                          </div>
                          <div class="time-range-cell action-cell">
                            <button
                              class="time-range-delete-button"
                              @click=${() => this._removeTimeRange(editingCalendar.shortcut, rangeIndex)}
                              title="Zeitbereich entfernen"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                        `;
                          })}
                        </div>
                      `
                      : ''}
                  </div>
                </div>
                
                <!-- Zeile 4: Papierkorb und Pfeile -->
                <div class="editor-row">
                  <div class="action-buttons">
                    <button
                      class="control-button delete"
                      @click=${() => this._deleteShift(editingCalendar.shortcut)}
                      title="Löschen"
                    >
                      🗑️
                    </button>
                    <button
                      class="control-button"
                      @click=${() => this._moveShift(selectedIndex, -1)}
                      ?disabled=${selectedIndex <= 0}
                      title="Nach oben"
                    >
                      ←
                    </button>
                    <button
                      class="control-button"
                      @click=${() => this._moveShift(selectedIndex, 1)}
                      ?disabled=${selectedIndex >= this.calendars.length - 1}
                      title="Nach unten"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
              `
      : html`<div class="no-selection">Bitte wählen Sie eine Schicht aus</div>`;
  }

  _renderHolidaysView() {
    // Stelle sicher, dass holidays Konfiguration existiert
    if (!this.holidays) {
      this.holidays = {
        neujahr: true,
        heilige_drei_koenige: true,
        tag_der_arbeit: true,
        friedensfest: true,
        mariae_himmelfahrt: true,
        tag_der_deutschen_einheit: true,
        reformationstag: true,
        allerheiligen: true,
        weihnachten_1: true,
        weihnachten_2: true,
        karfreitag: true,
        ostermontag: true,
        christi_himmelfahrt: true,
        pfingstmontag: true,
        fronleichnam: true,
        busstag: true,
      };
    }

    const holidays = [
      { key: 'neujahr', label: 'Neujahr (1. Januar)' },
      { key: 'heilige_drei_koenige', label: 'Heilige Drei Könige (6. Januar)' },
      { key: 'tag_der_arbeit', label: 'Tag der Arbeit (1. Mai)' },
      { key: 'friedensfest', label: 'Friedensfest (8. August)' },
      { key: 'mariae_himmelfahrt', label: 'Mariä Himmelfahrt (15. August)' },
      { key: 'tag_der_deutschen_einheit', label: 'Tag der Deutschen Einheit (3. Oktober)' },
      { key: 'reformationstag', label: 'Reformationstag (31. Oktober)' },
      { key: 'allerheiligen', label: 'Allerheiligen (1. November)' },
      { key: 'weihnachten_1', label: '1. Weihnachtsfeiertag (25. Dezember)' },
      { key: 'weihnachten_2', label: '2. Weihnachtsfeiertag (26. Dezember)' },
      { key: 'karfreitag', label: 'Karfreitag' },
      { key: 'ostermontag', label: 'Ostermontag' },
      { key: 'christi_himmelfahrt', label: 'Christi Himmelfahrt' },
      { key: 'pfingstmontag', label: 'Pfingstmontag' },
      { key: 'fronleichnam', label: 'Fronleichnam' },
      { key: 'busstag', label: 'Buß- und Bettag' },
    ];

    return html`
      <div class="holidays-view">
        <h3>Feiertage</h3>
        <div class="holidays-fields">
          ${holidays.map(
            holiday => html`
              <div class="holiday-switch-item">
                <label class="holiday-label">${holiday.label}</label>
                <ha-switch
                  .checked=${this.holidays[holiday.key] !== false}
                  @change=${e => this._updateHoliday(holiday.key, e.target.checked)}
                ></ha-switch>
              </div>
            `
          )}
        </div>
      </div>
    `;
  }

  _updateHoliday(key, enabled) {
    if (!this.holidays) {
      this.holidays = {};
    }
    this.holidays = {
      ...this.holidays,
      [key]: enabled,
    };
    this.requestUpdate();
  }

  _renderOtherView() {
    return html`
      <div class="other-view">
        <h3>Sonstiges</h3>
        <div class="other-options">
          <div class="option-item">
            <label class="option-label">Status nur bei aktivem Zeitraum setzen</label>
            <ha-switch
              .checked=${this.statusOnlyInTimeRange || false}
              @change=${e => {
                this.statusOnlyInTimeRange = e.target.checked;
                this.requestUpdate();
              }}
            ></ha-switch>
          </div>
        </div>
      </div>
    `;
  }


  _handleClose() {
    this._hasLocalCopy = false;
    this.dispatchEvent(new CustomEvent('close'));
  }

  _handleSave() {
    this.dispatchEvent(
      new CustomEvent('save', {
        detail: {
          calendars: this.calendars,
          holidays: this.holidays,
          statusOnlyInTimeRange: this.statusOnlyInTimeRange,
        },
      })
    );
  }

  _moveShift(index, direction) {
    if (index + direction < 0 || index + direction >= this.calendars.length) {
      return;
    }

    const newCalendars = [...this.calendars];
    const [moved] = newCalendars.splice(index, 1);
    newCalendars.splice(index + direction, 0, moved);
    this.calendars = newCalendars;
    this._updateValidationErrors();
  }

  _deleteShift(shortcut) {
    if (this.calendars.length <= 1) {
      return; // Mindestens eine Schicht muss vorhanden sein
    }

    this.calendars = this.calendars.filter(cal => cal.shortcut !== shortcut);
    if (this.selectedShortcut === shortcut) {
      this.selectedShortcut = this.calendars.length > 0 ? this.calendars[0].shortcut : null;
    }
    this._updateValidationErrors();
  }

  _toggleEnabled(shortcut, enabled) {
    this.calendars = this.calendars.map(cal =>
      cal.shortcut === shortcut ? { ...cal, enabled } : cal
    );
    this._updateValidationErrors();
  }

  _addShift() {
    // Finde den nächsten verfügbaren Shortcut
    const existingShortcuts = this.calendars.map(cal => cal.shortcut);
    const allShortcuts = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
    const availableShortcut = allShortcuts.find(s => !existingShortcuts.includes(s));

    if (!availableShortcut) {
      return; // Maximale Anzahl von Schichten erreicht
    }

    const defaultColors = [
      '#ff9800',
      '#ff0000',
      '#00ff00',
      '#0000ff',
      '#ffff00',
      '#ff00ff',
      '#00ffff',
      '#ffa500',
      '#800080',
      '#008000',
    ];

    const newShift = {
      shortcut: availableShortcut,
      name: `Schicht ${availableShortcut.toUpperCase()}`,
      color: defaultColors[this.calendars.length % defaultColors.length],
      enabled: true,
      statusRelevant: true,
      timeRanges: [],
    };

    this.calendars = [...this.calendars, newShift];
    this.selectedShortcut = newShift.shortcut;
    this._updateValidationErrors();
  }

  _updateCalendar(shortcut, updates) {
    this.calendars = this.calendars.map(cal =>
      cal.shortcut === shortcut ? { ...cal, ...updates } : cal
    );
    this._updateValidationErrors();
  }

  _normalizeTimeRange(range) {
    // Konvertiere altes Format [start, end] zu neuem Format { id, times: [start, end] }
    if (Array.isArray(range)) {
      return { id: null, times: range };
    }
    if (typeof range === 'object' && range.times) {
      return range;
    }
    return { id: null, times: [null, null] };
  }

  _normalizeTimeRanges(timeRanges) {
    if (!timeRanges || !Array.isArray(timeRanges)) {
      return [];
    }
    return timeRanges.map((range) => {
      const normalized = this._normalizeTimeRange(range);
      // Keine Default-ID setzen - ID muss explizit gesetzt werden
      return normalized;
    });
  }

  _updateTimeRange(shortcut, rangeIndex, timeIndex, value) {
    this.calendars = this.calendars.map(cal => {
      if (cal.shortcut === shortcut) {
        const timeRanges = this._normalizeTimeRanges(cal.timeRanges);
        const newTimeRanges = [...timeRanges];
        if (!newTimeRanges[rangeIndex]) {
          newTimeRanges[rangeIndex] = { id: null, times: [null, null] };
        }
        newTimeRanges[rangeIndex] = {
          ...newTimeRanges[rangeIndex],
          times: [...newTimeRanges[rangeIndex].times],
        };
        newTimeRanges[rangeIndex].times[timeIndex] = value;
        return { ...cal, timeRanges: newTimeRanges };
      }
      return cal;
    });
    this._updateValidationErrors();
  }

  _updateTimeRangeId(shortcut, rangeIndex, newId) {
    // Validiere die neue ID (nur Ziffern 1-9)
    const normalizedId = newId.trim() || null;

    this.calendars = this.calendars.map(cal => {
      if (cal.shortcut === shortcut) {
        const timeRanges = this._normalizeTimeRanges(cal.timeRanges);
        const newTimeRanges = [...timeRanges];
        if (newTimeRanges[rangeIndex]) {
          newTimeRanges[rangeIndex] = {
            ...newTimeRanges[rangeIndex],
            id: normalizedId,
          };
        }
        return { ...cal, timeRanges: newTimeRanges };
      }
      return cal;
    });
    this._updateValidationErrors();
  }

  _addTimeRange(shortcut) {
    this.calendars = this.calendars.map(cal => {
      if (cal.shortcut === shortcut) {
        const timeRanges = this._normalizeTimeRanges(cal.timeRanges);
        
        // Prüfe ob bereits 9 Zeiträume vorhanden sind
        if (timeRanges.length >= 9) {
          return cal; // Keine weiteren Zeiträume möglich
        }
        
        // Finde die erste verfügbare ID im Bereich 1-9
        const existingIds = timeRanges.map(r => r.id).map(id => parseInt(id) || 0).filter(id => id >= 1 && id <= 9);
        let newId = null;
        // Prüfe alle IDs von 1 bis 9 und finde die erste, die nicht verwendet wird
        for (let i = 1; i <= 9; i++) {
          if (!existingIds.includes(i)) {
            newId = String(i);
            break;
          }
        }
        return { ...cal, timeRanges: [...timeRanges, { id: newId, times: [null, null] }] };
      }
      return cal;
    });
    this._updateValidationErrors();
  }

  _removeTimeRange(shortcut, rangeIndex) {
    this.calendars = this.calendars.map(cal => {
      if (cal.shortcut === shortcut) {
        const timeRanges = this._normalizeTimeRanges(cal.timeRanges);
        const newTimeRanges = [...timeRanges];
        newTimeRanges.splice(rangeIndex, 1);
        // Erlaube leeres Array (keine Zeiträume)
        return { ...cal, timeRanges: newTimeRanges.length > 0 ? newTimeRanges : [] };
      }
      return cal;
    });
    this._updateValidationErrors();
  }

  _updateValidationErrors() {
    const errors = {};
    this.calendars.forEach(cal => {
      const calErrors = this._validateCalendar(cal);
      Object.keys(calErrors).forEach(key => {
        errors[`${cal.shortcut}_${key}`] = true;
      });
    });
    this._validationErrors = errors;
    
    // Debug: Zeige Validierungsergebnis
    const hasErrors = Object.keys(errors).length > 0;
    const selectedCalendar = this.calendars.find(cal => cal.shortcut === this.selectedShortcut);
    const selectedHasErrors = selectedCalendar ? Object.keys(errors).some(key => key.startsWith(`${this.selectedShortcut}_`)) : false;
    
    console.log('[ShiftConfigPanel] Validierung:', {
      erfolgreich: !hasErrors,
      fehlerfrei: !selectedHasErrors,
      gesamtFehler: Object.keys(errors).length,
      fehlerDetails: errors,
      aktuelleSchicht: this.selectedShortcut,
      aktuelleSchichtFehler: selectedHasErrors
    });
    
    this.requestUpdate();
  }

  _updateCalendarId(oldShortcut, newShortcut) {
    // Validiere die neue ID (nur ein Zeichen, a-z)
    const normalizedNewShortcut = newShortcut.toLowerCase().trim();
    if (!normalizedNewShortcut || normalizedNewShortcut.length === 0) {
      this._updateValidationErrors();
      return; // Leere ID nicht erlauben
    }
    
    // Prüfe ob es ein einzelner Kleinbuchstabe ist
    if (normalizedNewShortcut.length !== 1 || !/^[a-z]$/.test(normalizedNewShortcut)) {
      this._updateValidationErrors();
      return;
    }
    
    // Prüfe ob die neue ID bereits verwendet wird
    const existingCalendar = this.calendars.find(cal => cal.shortcut === normalizedNewShortcut && cal.shortcut !== oldShortcut);
    if (existingCalendar) {
      this._updateValidationErrors();
      return;
    }

    // Aktualisiere die ID
    this.calendars = this.calendars.map(cal => {
      if (cal.shortcut === oldShortcut) {
        return { ...cal, shortcut: normalizedNewShortcut };
      }
      return cal;
    });

    // Aktualisiere selectedShortcut falls nötig
    if (this.selectedShortcut === oldShortcut) {
      this.selectedShortcut = normalizedNewShortcut;
    }

    this._updateValidationErrors();
  }
}

customElements.define('shift-config-panel', ShiftConfigPanel);

