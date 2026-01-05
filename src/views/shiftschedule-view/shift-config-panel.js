/**
 * ShiftConfigPanel - Konfigurationspanel für Schichten
 * 
 * Verwaltet die Konfiguration aller Schichten (aktiv/inaktiv, Reihenfolge, etc.)
 */

import { html, css, LitElement } from 'lit';
import { sharedMenuStyles } from './shared-menu-styles.js';
import { renderMenuBar } from './menu-bar-template.js';

export class ShiftConfigPanel extends LitElement {
  static properties = {
    calendars: { type: Array },
    selectedShortcut: { type: String },
    hass: { type: Object },
    _validationErrors: { type: Object, state: true },
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
      padding: 8px 12px;
      display: flex;
      align-items: center;
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
  }

  connectedCallback() {
    super.connectedCallback();
    this._updateValidationErrors();
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('calendars') || changedProperties.has('selectedShortcut')) {
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

  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('calendars') || changedProperties.has('selectedShortcut')) {
      this._updateValidationErrors();
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
          center: '',
          right: html`
            <button 
              class="confirm-button menu-button" 
              @click=${this._handleSave} 
              title="Speichern"
              ?disabled=${this._hasValidationErrors()}
            >✓</button>
          `,
          fullWidth: html`
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
          `,
        })}
      </div>
      <div class="config-panel">
        ${editingCalendar
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
            : ''}
      </div>
    `;
  }


  _handleClose() {
    this.dispatchEvent(new CustomEvent('close'));
  }

  _handleSave() {
    this.dispatchEvent(
      new CustomEvent('save', {
        detail: { calendars: this.calendars },
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

