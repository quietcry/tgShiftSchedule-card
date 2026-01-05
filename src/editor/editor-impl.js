import { html, css } from 'lit';
import { EditorBase } from './editor-base.js';
import { CardRegname } from '../card-config.js';

export class EditorImpl extends EditorBase {
  static properties = {
    ...super.properties,
  };

  constructor() {
    super({
      numberOfMonths: 14,
      initialDisplayedMonths: 2,
      selectedCalendar: 'a',
      store_mode: 'saver',
      saver_key: 'Schichtplan',
      calendars: [
        { shortcut: 'a', name: 'Schicht A', color: '#ff9800', enabled: true, statusRelevant: true },
        {
          shortcut: 'b',
          name: 'Schicht B',
          color: '#ff0000',
          enabled: false,
          statusRelevant: true,
        },
        {
          shortcut: 'c',
          name: 'Schicht C',
          color: '#00ff00',
          enabled: false,
          statusRelevant: true,
        },
        {
          shortcut: 'd',
          name: 'Schicht D',
          color: '#0000ff',
          enabled: false,
          statusRelevant: true,
        },
        {
          shortcut: 'e',
          name: 'Schicht E',
          color: '#ffff00',
          enabled: false,
          statusRelevant: true,
        },
      ],
      holidays: {
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
      },
    });

    this._debug(`EditorImpl-Modul wird geladen`);
  }

  async firstUpdated() {
    this._debug(`EditorImpl firstUpdated wird aufgerufen`);
    await super.firstUpdated();
    this._debug(`EditorImpl firstUpdated abgeschlossen`);
  }

  render() {
    this._debug('EditorImpl render wird aufgerufen');
    if (!this.hass) {
      this._debug(`EditorImpl render: Kein hass`);
      return html`<div>Loading...</div>`;
    }

    this._debug(`EditorImpl render mit config:`, this.config);

    // Stelle sicher, dass calendars Array vorhanden ist und alle 5 Kalender enthält
    if (!this.config.calendars || !Array.isArray(this.config.calendars)) {
      this.config.calendars = [
        {
          shortcut: 'a',
          name: 'Schicht A',
          color: '#ff9800',
          enabled: false,
          statusRelevant: true,
        },
        {
          shortcut: 'b',
          name: 'Schicht B',
          color: '#ff0000',
          enabled: false,
          statusRelevant: true,
        },
        {
          shortcut: 'c',
          name: 'Schicht C',
          color: '#00ff00',
          enabled: false,
          statusRelevant: true,
        },
        {
          shortcut: 'd',
          name: 'Schicht D',
          color: '#0000ff',
          enabled: false,
          statusRelevant: true,
        },
        {
          shortcut: 'e',
          name: 'Schicht E',
          color: '#ffff00',
          enabled: false,
          statusRelevant: true,
        },
      ];
    }

    // Stelle sicher, dass genau 5 Kalender vorhanden sind (a, b, c, d, e)
    const defaultCalendars = [
      { shortcut: 'a', name: 'Schicht A', color: '#ff9800', enabled: false, statusRelevant: true },
      { shortcut: 'b', name: 'Schicht B', color: '#ff0000', enabled: false, statusRelevant: true },
      { shortcut: 'c', name: 'Schicht C', color: '#00ff00', enabled: false, statusRelevant: true },
      { shortcut: 'd', name: 'Schicht D', color: '#0000ff', enabled: false, statusRelevant: true },
      { shortcut: 'e', name: 'Schicht E', color: '#ffff00', enabled: false, statusRelevant: true },
    ];

    // Initialisiere oder aktualisiere Kalender-Array
    const calendarsMap = new Map();
    this.config.calendars.forEach(cal => calendarsMap.set(cal.shortcut, cal));

    // Füge fehlende Kalender hinzu oder aktualisiere vorhandene
    this.config.calendars = defaultCalendars.map(defaultCal => {
      const existing = calendarsMap.get(defaultCal.shortcut);
      if (existing) {
        // Behalte konfigurierte Werte, aber stelle sicher, dass shortcut fix bleibt
        // Stelle sicher, dass statusRelevant vorhanden ist (Default: true)
        return {
          ...defaultCal,
          ...existing,
          shortcut: defaultCal.shortcut,
          statusRelevant: existing.statusRelevant !== undefined ? existing.statusRelevant : true,
        };
      }
      return defaultCal;
    });

    // Stelle sicher, dass store_mode immer 'saver' ist und saver_key gesetzt ist
    this.config.store_mode = 'saver';
    if (!this.config.saver_key) {
      this.config.saver_key = 'Schichtplan';
    }

    return html`
      <div class="card-config">
        <div class="saver-info-message">
          <p>
            <strong>💾 Saver-Integration:</strong> Diese Karte verwendet die 
            <a href="https://github.com/PiotrMachowski/Home-Assistant-custom-components-Saver" target="_blank" rel="noopener noreferrer">Saver-Integration</a> 
            zur Speicherung der Schichtdaten. Die Daten werden in Saver-Variablen gespeichert, ohne Längenbegrenzung.
          </p>
        </div>
        <ha-form
          .hass=${this.hass}
          .data=${this.config}
          .schema=${this._getBasicSchema()}
          .computeLabel=${this._computeLabel}
          @value-changed=${this._valueChanged}
        ></ha-form>
        <div class="elements-section">${this._renderHolidays()}</div>
      </div>
    `;
  }

  _updateUseElements(value) {
    this.config = {
      ...this.config,
      useElements: value,
    };

    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config: this.config },
        bubbles: true,
        composed: true,
      })
    );
    this.requestUpdate();
  }

  _getColorOptions() {
    // Liste von vordefinierten Farben
    return [
      { value: '#ff0000', name: 'Rot' },
      { value: '#00ff00', name: 'Grün' },
      { value: '#0000ff', name: 'Blau' },
      { value: '#ffff00', name: 'Gelb' },
      { value: '#ff00ff', name: 'Magenta' },
      { value: '#00ffff', name: 'Cyan' },
      { value: '#ff8800', name: 'Orange' },
      { value: '#8800ff', name: 'Violett' },
      { value: '#0088ff', name: 'Hellblau' },
      { value: '#ff0088', name: 'Pink' },
      { value: '#88ff00', name: 'Lime' },
      { value: '#008888', name: 'Türkis' },
      { value: '#888888', name: 'Grau' },
      { value: '#000000', name: 'Schwarz' },
      { value: '#ffffff', name: 'Weiß' },
    ];
  }

  _validateTime(timeString) {
    if (!timeString || timeString.trim() === '') {
      return true; // Leer ist erlaubt (optional)
    }
    const timePattern = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    return timePattern.test(timeString.trim());
  }

  _validateTimeRange(range) {
    if (!range || !Array.isArray(range) || range.length < 2) {
      return { isValid: true, message: '' }; // Leer ist erlaubt
    }
    const start = range[0];
    const end = range[1];
    const hasStart = start && start.trim() !== '';
    const hasEnd = end && end.trim() !== '';

    // Beide leer = OK (optional)
    if (!hasStart && !hasEnd) {
      return { isValid: true, message: '' };
    }

    // Beide gesetzt = prüfe Format
    if (hasStart && hasEnd) {
      const startValid = this._validateTime(start);
      const endValid = this._validateTime(end);
      if (!startValid) {
        return {
          isValid: false,
          message: 'Ungültiges Format für Startzeit. Bitte HH:MM verwenden (z.B. 08:30)',
        };
      }
      if (!endValid) {
        return {
          isValid: false,
          message: 'Ungültiges Format für Endzeit. Bitte HH:MM verwenden (z.B. 17:00)',
        };
      }
      return { isValid: true, message: '' };
    }

    // Nur eine Zeit gesetzt = Fehler
    if (hasStart && !hasEnd) {
      return { isValid: false, message: 'Bitte auch die Endzeit angeben' };
    }
    if (!hasStart && hasEnd) {
      return { isValid: false, message: 'Bitte auch die Startzeit angeben' };
    }

    return { isValid: true, message: '' };
  }

  _renderCalendar(index, calendar) {
    const colorOptions = this._getColorOptions();
    const currentColor = calendar.color || '#ff0000';
    const timeRanges = calendar.timeRanges || [
      [null, null],
      [null, null],
    ];

    const shiftName = calendar.name || `Schicht ${calendar.shortcut.toUpperCase()}`;
    const isEnabled = calendar.enabled || false;

    // Validiere Zeiträume für visuelles Feedback
    const range1Validation = this._validateTimeRange(timeRanges[0]);
    const range2Validation = this._validateTimeRange(timeRanges[1]);

    // Prüfe einzelne Zeiten für Format-Validierung
    const isValidTimeRange1Start =
      !timeRanges[0] || !timeRanges[0][0] || this._validateTime(timeRanges[0][0]);
    const isValidTimeRange1End =
      !timeRanges[0] || !timeRanges[0][1] || this._validateTime(timeRanges[0][1]);
    const isValidTimeRange2Start =
      !timeRanges[1] || !timeRanges[1][0] || this._validateTime(timeRanges[1][0]);
    const isValidTimeRange2End =
      !timeRanges[1] || !timeRanges[1][1] || this._validateTime(timeRanges[1][1]);

    // Kombiniere Format- und Vollständigkeits-Validierung
    const range1StartError = !isValidTimeRange1Start || !range1Validation.isValid;
    const range1EndError = !isValidTimeRange1End || !range1Validation.isValid;
    const range2StartError = !isValidTimeRange2Start || !range2Validation.isValid;
    const range2EndError = !isValidTimeRange2End || !range2Validation.isValid;

    return html`
      <details class="calendar-item">
        <summary class="calendar-summary">
          <span class="calendar-summary-title"
            >Schicht ${calendar.shortcut.toUpperCase()}: ${shiftName}</span
          >
          <span class="calendar-summary-status">
            ${isEnabled
              ? html`<span class="status-badge status-enabled">Aktiviert</span>`
              : html`<span class="status-badge status-disabled">Deaktiviert</span>`}
          </span>
        </summary>
        <div class="calendar-fields">
          <ha-textfield
            label="Name"
            .value=${calendar.name || ''}
            maxlength="30"
            @input=${e => this._updateCalendar(calendar.shortcut, 'name', e.target.value)}
          ></ha-textfield>
          <div class="switch-item">
            <label class="switch-label">Aktiviert</label>
            <ha-switch
              .checked=${calendar.enabled || false}
              @change=${e => this._updateCalendar(calendar.shortcut, 'enabled', e.target.checked)}
            ></ha-switch>
          </div>
          <div class="switch-item">
            <label class="switch-label">Status relevant</label>
            <ha-switch
              .checked=${calendar.statusRelevant !== false}
              @change=${e =>
                this._updateCalendar(calendar.shortcut, 'statusRelevant', e.target.checked)}
            ></ha-switch>
          </div>
          <div class="color-selector">
            <div class="color-selector-label">Farbe</div>
            <ha-combo-box
              label="Farbe"
              .value=${currentColor}
              .items=${colorOptions.map(color => ({
                value: color.value,
                label: `${color.name} (${color.value})`,
              }))}
              @value-changed=${e => {
                const value = e.detail?.value;
                if (value) {
                  this._updateCalendar(calendar.shortcut, 'color', value);
                }
              }}
            ></ha-combo-box>
            <div class="color-selected-preview">
              <span class="color-preview-large" style="background-color: ${currentColor};"></span>
              <span class="color-selected-value">${currentColor}</span>
            </div>
          </div>
          <div class="time-ranges">
            <div class="time-range-label">Zeiträume (optional)</div>
            <div class="time-range-item">
              <ha-textfield
                label="Startzeit 1"
                .value=${timeRanges[0] && timeRanges[0][0] ? timeRanges[0][0] : ''}
                placeholder="HH:MM"
                pattern="^([0-1][0-9]|2[0-3]):[0-5][0-9]$"
                .error=${range1StartError}
                .helper=${range1StartError
                  ? range1Validation.message ||
                    'Ungültiges Format. Bitte HH:MM verwenden (z.B. 08:30)'
                  : ''}
                @input=${e => {
                  const value = e.target.value.trim() || null;
                  const formatValid = !value || this._validateTime(value);
                  this._updateTimeRange(calendar.shortcut, 0, 0, value);
                  // Prüfe Vollständigkeit nach Update
                  setTimeout(() => {
                    const updatedCal = this.config.calendars?.find(
                      c => c.shortcut === calendar.shortcut
                    );
                    const updatedRange = updatedCal?.timeRanges?.[0] || [null, null];
                    const rangeValidation = this._validateTimeRange(updatedRange);
                    const hasError = !formatValid || !rangeValidation.isValid;
                    e.target.error = hasError;
                    e.target.helper = hasError
                      ? rangeValidation.message ||
                        'Ungültiges Format. Bitte HH:MM verwenden (z.B. 08:30)'
                      : '';
                    this.requestUpdate();
                  }, 0);
                }}
                @blur=${e => {
                  const value = e.target.value.trim() || null;
                  const formatValid = !value || this._validateTime(value);
                  const updatedCal = this.config.calendars?.find(
                    c => c.shortcut === calendar.shortcut
                  );
                  const updatedRange = updatedCal?.timeRanges?.[0] || [null, null];
                  const rangeValidation = this._validateTimeRange(updatedRange);
                  const hasError = !formatValid || !rangeValidation.isValid;
                  e.target.error = hasError;
                  e.target.helper = hasError
                    ? rangeValidation.message ||
                      'Ungültiges Format. Bitte HH:MM verwenden (z.B. 08:30)'
                    : '';
                  this.requestUpdate();
                }}
              ></ha-textfield>
              <span class="time-separator">-</span>
              <ha-textfield
                label="Endzeit 1"
                .value=${timeRanges[0] && timeRanges[0][1] ? timeRanges[0][1] : ''}
                placeholder="HH:MM"
                pattern="^([0-1][0-9]|2[0-3]):[0-5][0-9]$"
                .error=${range1EndError}
                .helper=${range1EndError
                  ? range1Validation.message ||
                    'Ungültiges Format. Bitte HH:MM verwenden (z.B. 17:00)'
                  : ''}
                @input=${e => {
                  const value = e.target.value.trim() || null;
                  const formatValid = !value || this._validateTime(value);
                  this._updateTimeRange(calendar.shortcut, 0, 1, value);
                  setTimeout(() => {
                    const updatedCal = this.config.calendars?.find(
                      c => c.shortcut === calendar.shortcut
                    );
                    const updatedRange = updatedCal?.timeRanges?.[0] || [null, null];
                    const rangeValidation = this._validateTimeRange(updatedRange);
                    const hasError = !formatValid || !rangeValidation.isValid;
                    e.target.error = hasError;
                    e.target.helper = hasError
                      ? rangeValidation.message ||
                        'Ungültiges Format. Bitte HH:MM verwenden (z.B. 17:00)'
                      : '';
                    this.requestUpdate();
                  }, 0);
                }}
                @blur=${e => {
                  const value = e.target.value.trim() || null;
                  const formatValid = !value || this._validateTime(value);
                  const updatedCal = this.config.calendars?.find(
                    c => c.shortcut === calendar.shortcut
                  );
                  const updatedRange = updatedCal?.timeRanges?.[0] || [null, null];
                  const rangeValidation = this._validateTimeRange(updatedRange);
                  const hasError = !formatValid || !rangeValidation.isValid;
                  e.target.error = hasError;
                  e.target.helper = hasError
                    ? rangeValidation.message ||
                      'Ungültiges Format. Bitte HH:MM verwenden (z.B. 17:00)'
                    : '';
                  this.requestUpdate();
                }}
              ></ha-textfield>
            </div>
            <div class="time-range-item">
              <ha-textfield
                label="Startzeit 2"
                .value=${timeRanges[1] && timeRanges[1][0] ? timeRanges[1][0] : ''}
                placeholder="HH:MM"
                pattern="^([0-1][0-9]|2[0-3]):[0-5][0-9]$"
                .error=${range2StartError}
                .helper=${range2StartError
                  ? range2Validation.message ||
                    'Ungültiges Format. Bitte HH:MM verwenden (z.B. 08:30)'
                  : ''}
                @input=${e => {
                  const value = e.target.value.trim() || null;
                  const formatValid = !value || this._validateTime(value);
                  this._updateTimeRange(calendar.shortcut, 1, 0, value);
                  setTimeout(() => {
                    const updatedCal = this.config.calendars?.find(
                      c => c.shortcut === calendar.shortcut
                    );
                    const updatedRange = updatedCal?.timeRanges?.[1] || [null, null];
                    const rangeValidation = this._validateTimeRange(updatedRange);
                    const hasError = !formatValid || !rangeValidation.isValid;
                    e.target.error = hasError;
                    e.target.helper = hasError
                      ? rangeValidation.message ||
                        'Ungültiges Format. Bitte HH:MM verwenden (z.B. 08:30)'
                      : '';
                    this.requestUpdate();
                  }, 0);
                }}
                @blur=${e => {
                  const value = e.target.value.trim() || null;
                  const formatValid = !value || this._validateTime(value);
                  const updatedCal = this.config.calendars?.find(
                    c => c.shortcut === calendar.shortcut
                  );
                  const updatedRange = updatedCal?.timeRanges?.[1] || [null, null];
                  const rangeValidation = this._validateTimeRange(updatedRange);
                  const hasError = !formatValid || !rangeValidation.isValid;
                  e.target.error = hasError;
                  e.target.helper = hasError
                    ? rangeValidation.message ||
                      'Ungültiges Format. Bitte HH:MM verwenden (z.B. 08:30)'
                    : '';
                  this.requestUpdate();
                }}
              ></ha-textfield>
              <span class="time-separator">-</span>
              <ha-textfield
                label="Endzeit 2"
                .value=${timeRanges[1] && timeRanges[1][1] ? timeRanges[1][1] : ''}
                placeholder="HH:MM"
                pattern="^([0-1][0-9]|2[0-3]):[0-5][0-9]$"
                .error=${range2EndError}
                .helper=${range2EndError
                  ? range2Validation.message ||
                    'Ungültiges Format. Bitte HH:MM verwenden (z.B. 17:00)'
                  : ''}
                @input=${e => {
                  const value = e.target.value.trim() || null;
                  const formatValid = !value || this._validateTime(value);
                  this._updateTimeRange(calendar.shortcut, 1, 1, value);
                  setTimeout(() => {
                    const updatedCal = this.config.calendars?.find(
                      c => c.shortcut === calendar.shortcut
                    );
                    const updatedRange = updatedCal?.timeRanges?.[1] || [null, null];
                    const rangeValidation = this._validateTimeRange(updatedRange);
                    const hasError = !formatValid || !rangeValidation.isValid;
                    e.target.error = hasError;
                    e.target.helper = hasError
                      ? rangeValidation.message ||
                        'Ungültiges Format. Bitte HH:MM verwenden (z.B. 17:00)'
                      : '';
                    this.requestUpdate();
                  }, 0);
                }}
                @blur=${e => {
                  const value = e.target.value.trim() || null;
                  const formatValid = !value || this._validateTime(value);
                  const updatedCal = this.config.calendars?.find(
                    c => c.shortcut === calendar.shortcut
                  );
                  const updatedRange = updatedCal?.timeRanges?.[1] || [null, null];
                  const rangeValidation = this._validateTimeRange(updatedRange);
                  const hasError = !formatValid || !rangeValidation.isValid;
                  e.target.error = hasError;
                  e.target.helper = hasError
                    ? rangeValidation.message ||
                      'Ungültiges Format. Bitte HH:MM verwenden (z.B. 17:00)'
                    : '';
                  this.requestUpdate();
                }}
              ></ha-textfield>
            </div>
          </div>
        </div>
      </details>
    `;
  }

  _renderHolidays() {
    // Stelle sicher, dass holidays Konfiguration existiert
    if (!this.config.holidays) {
      this.config.holidays = {
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
      <details class="holidays-item">
        <summary class="holidays-summary">
          <span class="holidays-summary-title">Feiertage</span>
        </summary>
        <div class="holidays-fields">
          ${holidays.map(
            holiday => html`
              <div class="holiday-switch-item">
                <label class="holiday-label">${holiday.label}</label>
                <ha-switch
                  .checked=${this.config.holidays[holiday.key] !== false}
                  @change=${e => this._updateHoliday(holiday.key, e.target.checked)}
                ></ha-switch>
              </div>
            `
          )}
        </div>
      </details>
    `;
  }

  _updateHoliday(key, enabled) {
    if (!this.config.holidays) {
      this.config.holidays = {};
    }

    // Aktualisiere die Config direkt (immutable update)
    const newConfig = {
      ...this.config,
      holidays: {
        ...this.config.holidays,
        [key]: enabled,
      },
    };

    // Aktualisiere die Config direkt
    this.config = newConfig;

    // Aktualisiere die Ansicht sofort
    this.requestUpdate();

    // Dispatch config-changed Event
    setTimeout(() => {
      this.dispatchEvent(
        new CustomEvent('config-changed', {
          detail: { config: newConfig },
          bubbles: true,
          composed: true,
        })
      );
    }, 0);
  }

  _updateTimeRange(shortcut, rangeIndex, timeIndex, value) {
    // rangeIndex: 0 oder 1 (erster oder zweiter Zeitraum)
    // timeIndex: 0 oder 1 (Start oder End)
    if (!this.config.calendars) {
      this.config.calendars = [
        { shortcut: 'a', name: 'Schicht A', color: '#ff9800', enabled: false },
        { shortcut: 'b', name: 'Schicht B', color: '#ff0000', enabled: false },
        { shortcut: 'c', name: 'Schicht C', color: '#00ff00', enabled: false },
        { shortcut: 'd', name: 'Schicht D', color: '#0000ff', enabled: false },
        { shortcut: 'e', name: 'Schicht E', color: '#ffff00', enabled: false },
      ];
    }

    // Erstelle eine neue Kopie des Arrays und aktualisiere den betroffenen Kalender
    const newCalendars = this.config.calendars.map(cal => {
      if (cal.shortcut === shortcut) {
        // Stelle sicher, dass timeRanges Array existiert
        const timeRanges = cal.timeRanges || [
          [null, null],
          [null, null],
        ];
        // Erstelle eine Kopie des timeRanges Arrays
        const newTimeRanges = timeRanges.map((range, idx) => {
          if (idx === rangeIndex) {
            // Erstelle eine Kopie des Zeitraums
            const newRange = [...range];
            newRange[timeIndex] = value || null;
            return newRange;
          }
          return range;
        });

        return {
          ...cal,
          timeRanges: newTimeRanges,
        };
      }
      return cal;
    });

    // Aktualisiere die Config direkt (immutable update)
    const newConfig = {
      ...this.config,
      calendars: newCalendars,
    };

    // Aktualisiere die Config direkt
    this.config = newConfig;

    // Aktualisiere die Ansicht sofort
    this.requestUpdate();

    // Dispatch config-changed Event
    setTimeout(() => {
      this.dispatchEvent(
        new CustomEvent('config-changed', {
          detail: { config: newConfig },
          bubbles: true,
          composed: true,
        })
      );
    }, 0);
  }

  _updateCalendar(shortcut, property, value) {
    if (!this.config.calendars) {
      this.config.calendars = [
        { shortcut: 'a', name: 'Schicht A', color: '#ff9800', enabled: false },
        { shortcut: 'b', name: 'Schicht B', color: '#ff0000', enabled: false },
        { shortcut: 'c', name: 'Schicht C', color: '#00ff00', enabled: false },
        { shortcut: 'd', name: 'Schicht D', color: '#0000ff', enabled: false },
        { shortcut: 'e', name: 'Schicht E', color: '#ffff00', enabled: false },
      ];
    }

    // Erstelle eine neue Kopie des Arrays und aktualisiere den betroffenen Kalender
    const newCalendars = this.config.calendars.map(cal => {
      if (cal.shortcut === shortcut) {
        return {
          ...cal,
          [property]: value,
        };
      }
      return cal;
    });

    // Aktualisiere die Config direkt (immutable update)
    const newConfig = {
      ...this.config,
      calendars: newCalendars,
    };

    // Aktualisiere die Config direkt
    this.config = newConfig;

    // Aktualisiere die Ansicht sofort
    this.requestUpdate();

    // Dispatch config-changed Event - Home Assistant speichert die Config automatisch
    // Verwende setTimeout, um sicherzustellen, dass das Event nicht den Editor schließt
    setTimeout(() => {
      this.dispatchEvent(
        new CustomEvent('config-changed', {
          detail: { config: newConfig },
          bubbles: true,
          composed: true,
        })
      );
    }, 0);
  }

  _computeLabel(schema) {
    switch (schema.name) {
      case 'numberOfMonths':
        return 'Maximale Anzahl Monate';
      case 'initialDisplayedMonths':
        return 'Standardwert sichtbare Monate';
      case 'saver_key':
        return 'Saver-Variablenname';
      default:
        return schema.name;
    }
  }

  _valueChanged(ev) {
    this._debug('EditorImpl _valueChanged wird aufgerufen mit:', ev.detail);

    const newValue = ev.detail.value;
    const oldStoreMode = this.config.store_mode;

    // Stelle sicher, dass initialDisplayedMonths nicht größer als numberOfMonths ist
    if (newValue.initialDisplayedMonths !== undefined && newValue.numberOfMonths !== undefined) {
      newValue.initialDisplayedMonths = Math.min(
        newValue.initialDisplayedMonths,
        newValue.numberOfMonths
      );
    } else if (newValue.initialDisplayedMonths !== undefined && this.config.numberOfMonths) {
      newValue.initialDisplayedMonths = Math.min(
        newValue.initialDisplayedMonths,
        this.config.numberOfMonths
      );
    } else if (newValue.numberOfMonths !== undefined && this.config.initialDisplayedMonths) {
      // Wenn numberOfMonths geändert wird, passe initialDisplayedMonths an, falls nötig
      if (this.config.initialDisplayedMonths > newValue.numberOfMonths) {
        newValue.initialDisplayedMonths = newValue.numberOfMonths;
      }
    }

    // Stelle sicher, dass store_mode immer 'saver' ist und saver_key gesetzt ist
    newValue.store_mode = 'saver';
    if (newValue.saver_key === undefined) {
      newValue.saver_key = this.config.saver_key || 'Schichtplan';
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

  static styles = [
    super.styles,
    css`
      :host {
        display: block;
      }

      .card-config {
        padding: 10px;
      }

      .elements-section {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid var(--divider-color, #e0e0e0);
      }

      .elements-header {
        margin-bottom: 15px;
      }

      .elements-header ha-combo-box {
        width: 100%;
      }

      .saver-info-message {
        margin-bottom: 20px;
        padding: 12px;
        background-color: var(--info-color, #2196f3);
        color: white;
        border-radius: 4px;
      }

      .saver-info-message p {
        margin: 0;
      }

      .saver-info-message a {
        color: white;
        text-decoration: underline;
        font-weight: 500;
      }

      .saver-info-message a:hover {
        text-decoration: none;
      }

      .info-message {
        margin-top: 15px;
        padding: 12px;
        background-color: var(--info-color, #2196f3);
        color: white;
        border-radius: 4px;
      }

      .info-message p {
        margin: 0;
      }

      .calendar-item {
        margin-bottom: 12px;
        background-color: var(--card-background-color, #ffffff);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 4px;
        overflow: hidden;
      }

      .calendar-item[open] {
        border-color: var(--primary-color, #03a9f4);
      }

      .calendar-summary {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 15px;
        cursor: pointer;
        list-style: none;
        user-select: none;
        background-color: var(--card-background-color, #ffffff);
        transition: background-color 0.2s ease;
      }

      .calendar-summary::-webkit-details-marker {
        display: none;
      }

      .calendar-summary::before {
        content: '▶';
        display: inline-block;
        margin-right: 8px;
        transition: transform 0.2s ease;
        color: var(--primary-color, #03a9f4);
        font-size: 10px;
      }

      .calendar-item[open] .calendar-summary::before {
        transform: rotate(90deg);
      }

      .calendar-summary:hover {
        background-color: var(--divider-color, #f5f5f5);
      }

      .calendar-summary-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color, #000000);
        flex: 1;
      }

      .calendar-summary-status {
        display: flex;
        align-items: center;
        margin-left: 12px;
      }

      .status-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 500;
        text-transform: uppercase;
      }

      .status-enabled {
        background-color: var(--success-color, #4caf50);
        color: white;
      }

      .status-disabled {
        background-color: var(--disabled-color, #9e9e9e);
        color: white;
      }

      .calendar-fields {
        display: grid;
        grid-template-columns: 1fr;
        gap: 15px;
        padding: 15px;
        border-top: 1px solid var(--divider-color, #e0e0e0);
      }

      .calendar-fields ha-textfield,
      .calendar-fields ha-switch,
      .calendar-fields .color-selector {
        width: 100%;
      }

      .switch-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .switch-label {
        flex: 1;
        font-size: 14px;
        color: var(--primary-text-color, #000000);
        cursor: pointer;
      }

      .calendar-fields ha-switch {
        flex-shrink: 0;
      }

      ha-switch {
        display: flex;
        align-items: center;
      }

      .color-selector {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .color-selector-label {
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color, #000000);
      }

      .color-selector ha-combo-box {
        width: 100%;
      }

      .color-option {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 4px 0;
      }

      .color-preview {
        display: inline-block;
        width: 24px;
        height: 24px;
        border-radius: 4px;
        border: 1px solid var(--divider-color, #e0e0e0);
        flex-shrink: 0;
      }

      .color-preview-large {
        display: inline-block;
        width: 32px;
        height: 32px;
        border-radius: 4px;
        border: 2px solid var(--divider-color, #e0e0e0);
        flex-shrink: 0;
      }

      .color-name {
        flex: 1;
        font-weight: 500;
      }

      .color-value {
        font-size: 12px;
        color: var(--secondary-text-color, #888888);
        font-family: monospace;
      }

      .color-selected-preview {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px;
        background-color: var(--card-background-color, #f5f5f5);
        border-radius: 4px;
        border: 1px solid var(--divider-color, #e0e0e0);
      }

      .color-selected-value {
        font-size: 14px;
        font-family: monospace;
        color: var(--primary-text-color, #000000);
        font-weight: 500;
      }

      .time-ranges {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 15px;
        padding: 12px;
        background-color: var(--card-background-color, #f5f5f5);
        border-radius: 4px;
        border: 1px solid var(--divider-color, #e0e0e0);
      }

      .time-range-label {
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color, #000000);
        margin-bottom: 8px;
      }

      .time-range-item {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .time-range-item ha-textfield {
        flex: 1;
      }

      .time-separator {
        font-size: 16px;
        font-weight: 500;
        color: var(--primary-text-color, #000000);
        flex-shrink: 0;
      }

      .holidays-item {
        margin-bottom: 12px;
        background-color: var(--card-background-color, #ffffff);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 4px;
        overflow: hidden;
      }

      .holidays-item[open] {
        border-color: var(--primary-color, #03a9f4);
      }

      .holidays-summary {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 15px;
        cursor: pointer;
        list-style: none;
        user-select: none;
        background-color: var(--card-background-color, #ffffff);
        transition: background-color 0.2s ease;
      }

      .holidays-summary::-webkit-details-marker {
        display: none;
      }

      .holidays-summary::before {
        content: '▶';
        display: inline-block;
        margin-right: 8px;
        transition: transform 0.2s ease;
        color: var(--primary-color, #03a9f4);
        font-size: 10px;
      }

      .holidays-item[open] .holidays-summary::before {
        transform: rotate(90deg);
      }

      .holidays-summary:hover {
        background-color: var(--divider-color, #f5f5f5);
      }

      .holidays-summary-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color, #000000);
        flex: 1;
      }

      .holidays-fields {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
        padding: 15px;
        border-top: 1px solid var(--divider-color, #e0e0e0);
      }

      .holiday-switch-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .holiday-label {
        flex: 1;
        font-size: 14px;
        color: var(--primary-text-color, #000000);
        cursor: pointer;
      }

      .holidays-fields ha-switch {
        flex-shrink: 0;
      }
    `,
  ];

  static getConfigElement() {
    return document.createElement(`${CardRegname}-editor`);
  }

  static getStubConfig() {
    return {
      numberOfMonths: 14,
      initialDisplayedMonths: 2,
      store_mode: 'saver',
      saver_key: 'Schichtplan',
      useElements: false,
      selectedElement: null,
      elements: [
        { benennung: 'Element 1', aktiv: true, color: '#ff0000', shortcut: '1' },
        { benennung: 'Element 2', aktiv: true, color: '#00ff00', shortcut: '2' },
        { benennung: 'Element 3', aktiv: true, color: '#0000ff', shortcut: '3' },
        { benennung: 'Element 4', aktiv: true, color: '#ffff00', shortcut: '4' },
      ],
      holidays: {
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
      },
    };
  }

  _getBasicSchema() {
    const schema = [
      {
        name: 'saver_key',
        selector: {
          text: {},
        },
      },
      {
        name: 'numberOfMonths',
        selector: {
          number: {
            min: 1,
            max: 14,
            step: 1,
            mode: 'box',
          },
        },
      },
      {
        name: 'initialDisplayedMonths',
        selector: {
          number: {
            min: 1,
            max: 14,
            step: 1,
            mode: 'box',
          },
        },
      },
    ];

    return schema;
  }
}
