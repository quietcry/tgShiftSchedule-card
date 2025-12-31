import { html, css, unsafeCSS } from 'lit';
import { ViewBase } from '../view-base.js';
import { SaveDebounceTime } from '../../card-config.js';

export class ShiftScheduleView extends ViewBase {
  static className = 'ShiftScheduleView';

  // Zentrale Definition der Standardfarbe für ausgewählte Tage im Single-Modus
  static DEFAULT_SELECTED_DAY_COLOR = '#ff9800'; // Orange

  // Fixe Schicht-Definition: 5 gleichberechtigte Schichten (a, b, c, d, e)
  static CALENDARS = [
    { shortcut: 'a', name: 'Schicht A', defaultColor: '#ff9800' },
    { shortcut: 'b', name: 'Schicht B', defaultColor: '#ff0000' },
    { shortcut: 'c', name: 'Schicht C', defaultColor: '#00ff00' },
    { shortcut: 'd', name: 'Schicht D', defaultColor: '#0000ff' },
    { shortcut: 'e', name: 'Schicht E', defaultColor: '#ffff00' },
  ];

  static get properties() {
    return {
      ...super.properties,
      hass: { type: Object },
      config: { type: Object },
      lovelace: { type: Object },
      _workingDays: { type: Object },
      _storageWarning: { type: Object },
      _configWarning: { type: Object },
      _statusWarning: { type: Object },
      _displayedMonths: { type: Number },
      _startMonthOffset: { type: Number },
      _selectedCalendar: { type: String },
    };
  }

  constructor() {
    super();
    this._workingDays = {}; // {"year:month": {day: [elements]}} - z.B. {"25:11": {1: ["a"], 2: ["a", "h"], 3: ["b"]}}
    this._storageWarning = null; // { show: boolean, currentLength: number, maxLength: number, percentage: number }
    this._configWarning = null; // { show: boolean, configEntityId: string }
    this._statusWarning = null; // { show: boolean, statusEntityId: string }
    this._knownEntityIds = null; // Cache für bekannte Entities [mainEntity, ...additionalEntities]
    this._cleanupDone = false; // Flag, ob die Bereinigung bereits beim initialen Laden ausgeführt wurde
    this._displayedMonths = 2; // Anzahl der angezeigten Monate (wird aus config.numberOfMonths initialisiert)
    this._startMonthOffset = 0; // Offset für den Startmonat (0 = aktueller Monat, -1 = Vormonat, +1 = nächster Monat)
    this._isWriting = false; // Flag, ob gerade geschrieben wird
    this._writeLockTimer = null; // Timer für das 5-Sekunden-Lock nach dem Schreiben
    this._selectedCalendar = null; // Shortcut des ausgewählten Kalenders (wird beim Setzen der Config initialisiert)
    this._isInitialLoad = true; // Flag, ob gerade der initiale Load läuft (verhindert Config-Schreiben beim Laden)
    this._directDOMUpdateInProgress = new Set(); // Set von Button-Keys, die gerade per direkter DOM-Manipulation aktualisiert werden
    // Performance-Caches
    this._holidayCache = {}; // Cache für Feiertage: {"2025-12": {1: true, 25: true, ...}}
    this._cachedHolidayEntities = null; // Cache für Holiday-Entities (wird bei hass-Update invalidiert)
    this._editorModeCache = null; // Cache für Editor-Mode-Erkennung
    this._editorModeCacheTime = 0; // Zeitstempel für Cache-Invalidierung
    // Debouncing für Speicher-Operationen
    this._saveDebounceTimer = null; // Timer für Debouncing beim Speichern
  }

  // Formatiert eine Zahl auf zwei Ziffern (z.B. 1 -> "01", 25 -> "25")
  formatTwoDigits(num) {
    return String(num).padStart(2, '0');
  }

  // Prüft, ob die Karte im Editor-Modus angezeigt wird (mit Cache)
  _isInEditorMode() {
    // Cache: Prüfe ob Cache noch gültig ist (5 Sekunden)
    const now = Date.now();
    if (this._editorModeCache !== null && now - this._editorModeCacheTime < 5000) {
      return this._editorModeCache;
    }

    let result = false;

    // Methode 1: Prüfe URL-Parameter ?edit=1
    if (typeof window !== 'undefined' && window.location) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('edit') === '1') {
        result = true;
      }
    }

    if (!result) {
      // Methode 2: Prüfe lovelace.editMode
      if (this.lovelace?.editMode === true) {
        result = true;
      }
    }

    if (!result) {
      // Methode 3: Prüfe, ob hui-dialog-edit-card im DOM existiert
      if (typeof document !== 'undefined') {
        const editDialog = document.querySelector('hui-dialog-edit-card');
        if (editDialog) {
          result = true;
        }
      }
    }

    if (!result) {
      // Methode 4: Prüfe, ob die Karte in einem Editor-Container ist
      let element = this;
      let depth = 0;
      const maxDepth = 20; // Erhöht für bessere Erkennung

      while (element && depth < maxDepth) {
        // Prüfe auf hui-dialog-edit-card im Parent-Baum
        if (element.tagName?.toLowerCase() === 'hui-dialog-edit-card') {
          result = true;
          break;
        }

        // Prüfe auf Editor-spezifische Klassen oder Attribute
        if (
          element.classList?.contains('card-editor') ||
          element.classList?.contains('hui-card-editor') ||
          element.classList?.contains('edit-mode') ||
          element.classList?.contains('hui-card-config-editor') ||
          element.getAttribute?.('data-card-editor') === 'true' ||
          element.tagName?.toLowerCase().includes('editor') ||
          element.tagName?.toLowerCase() === 'hui-card-element-editor'
        ) {
          result = true;
          break;
        }

        // Prüfe auf Editor-spezifische IDs
        if (element.id && (element.id.includes('editor') || element.id.includes('config'))) {
          result = true;
          break;
        }

        // Prüfe auf Editor-spezifische Attribute
        if (
          element.hasAttribute &&
          (element.hasAttribute('data-card-editor') || element.hasAttribute('data-editor'))
        ) {
          result = true;
          break;
        }

        element = element.parentElement || element.parentNode;
        depth++;
      }
    }

    if (!result) {
      // Methode 5: Prüfe, ob die Karte in einem Shadow DOM mit Editor-Klassen ist
      const root = this.getRootNode();
      if (root && root !== document) {
        const host = root.host;
        if (host) {
          if (
            host.tagName?.toLowerCase() === 'hui-dialog-edit-card' ||
            host.classList?.contains('card-editor') ||
            host.classList?.contains('hui-card-editor') ||
            host.classList?.contains('edit-mode') ||
            host.classList?.contains('hui-card-config-editor') ||
            host.tagName?.toLowerCase() === 'hui-card-element-editor'
          ) {
            result = true;
          }
        }
      }
    }

    if (!result) {
      // Methode 6: Prüfe URL-Pfad (falls im Editor-Modus)
      if (typeof window !== 'undefined' && window.location) {
        const url = window.location.href || window.location.pathname;
        if (url && (url.includes('/config/lovelace/dashboards') || url.includes('/editor'))) {
          result = true;
        }
      }
    }

    // Cache speichern
    this._editorModeCache = result;
    this._editorModeCacheTime = now;

    return result;
  }

  // Berechnet die Kontrastfarbe (schwarz oder weiß) für eine gegebene Hintergrundfarbe
  _getContrastColor(hexColor) {
    if (!hexColor) return '#000000';

    // Entferne # falls vorhanden
    const hex = hexColor.replace('#', '');

    // Konvertiere zu RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Berechne relative Luminanz (nach WCAG)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Wenn Luminanz > 0.5, verwende schwarz, sonst weiß
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }

  // Berechnet das Osterdatum für ein gegebenes Jahr (nach Gauß-Algorithmus)
  _getEasterDate(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
  }

  // Prüft ob ein Datum ein Feiertag ist (mit Cache)
  // Versucht zuerst Home Assistant Holiday-Sensoren zu verwenden, falls vorhanden
  _isHoliday(year, month, day) {
    // Cache-Key: "2025-12" für Monat/Jahr
    const cacheKey = `${year}-${String(month + 1).padStart(2, '0')}`;

    // Prüfe Cache
    if (this._holidayCache[cacheKey] && this._holidayCache[cacheKey][day] !== undefined) {
      return this._holidayCache[cacheKey][day];
    }

    // Initialisiere Cache für diesen Monat
    if (!this._holidayCache[cacheKey]) {
      this._holidayCache[cacheKey] = {};
    }

    let result = false;

    // Prüfe ob Home Assistant Holiday-Sensoren verfügbar sind
    if (this._hass && this._hass.states) {
      // Suche nach Holiday-Sensoren (z.B. sensor.germany_holidays, sensor.holidays, etc.)
      // OPTIMIERUNG: Cache Holiday-Entities, nicht bei jedem Aufruf suchen
      if (!this._cachedHolidayEntities) {
        this._cachedHolidayEntities = Object.keys(this._hass.states).filter(entityId => {
          return (
            entityId.startsWith('sensor.') &&
            (entityId.includes('holiday') || entityId.includes('feiertag')) &&
            this._hass.states[entityId].state === 'on'
          );
        });
      }

      const holidayEntities = this._cachedHolidayEntities;

      if (holidayEntities.length > 0) {
        // Prüfe ob das Datum in den Holiday-Attributen enthalten ist
        for (const entityId of holidayEntities) {
          const entity = this._hass.states[entityId];
          if (entity && entity.attributes) {
            // Prüfe verschiedene mögliche Attribute-Formate
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dateStrShort = `${String(day).padStart(2, '0')}.${String(month + 1).padStart(2, '0')}.${year}`;

            // Prüfe verschiedene Attribute-Namen
            const possibleAttrs = [
              'dates',
              'holidays',
              'feiertage',
              'date',
              'next_date',
              'upcoming',
            ];
            for (const attr of possibleAttrs) {
              if (entity.attributes[attr]) {
                const attrValue = entity.attributes[attr];
                if (Array.isArray(attrValue)) {
                  if (
                    attrValue.some(
                      d =>
                        d === dateStr ||
                        d === dateStrShort ||
                        d.includes(dateStr) ||
                        d.includes(dateStrShort)
                    )
                  ) {
                    result = true;
                    break;
                  }
                } else if (typeof attrValue === 'string') {
                  if (attrValue.includes(dateStr) || attrValue.includes(dateStrShort)) {
                    result = true;
                    break;
                  }
                }
              }
            }
          }
        }
      }
    }

    // Hole Feiertags-Konfiguration aus der Config (Standard: alle aktiviert)
    const holidaysConfig = this.config?.holidays || {};
    const isHolidayEnabled = key => holidaysConfig[key] !== false; // Default: true wenn nicht gesetzt

    // Fallback: Berechne deutsche Feiertage selbst
    const easter = this._getEasterDate(year);

    // Feste Feiertage mit Konfigurationsprüfung
    const fixedHolidays = [
      { month: 0, day: 1, key: 'neujahr' }, // Neujahr
      { month: 0, day: 6, key: 'heilige_drei_koenige' }, // Heilige Drei Könige
      { month: 4, day: 1, key: 'tag_der_arbeit' }, // Tag der Arbeit
      { month: 7, day: 8, key: 'friedensfest' }, // Friedensfest (nur in Augsburg)
      { month: 7, day: 15, key: 'mariae_himmelfahrt' }, // Mariä Himmelfahrt
      { month: 9, day: 3, key: 'tag_der_deutschen_einheit' }, // Tag der Deutschen Einheit
      { month: 9, day: 31, key: 'reformationstag' }, // Reformationstag
      { month: 10, day: 1, key: 'allerheiligen' }, // Allerheiligen
      { month: 11, day: 25, key: 'weihnachten_1' }, // 1. Weihnachtsfeiertag
      { month: 11, day: 26, key: 'weihnachten_2' }, // 2. Weihnachtsfeiertag
    ];

    if (!result) {
      // Prüfe feste Feiertage
      for (const holiday of fixedHolidays) {
        if (month === holiday.month && day === holiday.day && isHolidayEnabled(holiday.key)) {
          result = true;
          break;
        }
      }
    }

    if (!result) {
      // Bewegliche Feiertage (abhängig von Ostern)
      const easterTime = easter.getTime();
      const oneDay = 24 * 60 * 60 * 1000;

      // Buß- und Bettag: Mittwoch vor dem 23. November (oder am 23. November, falls es ein Mittwoch ist)
      const nov23 = new Date(year, 10, 23); // 23. November (month ist 0-basiert)
      const dayOfWeekNov23 = nov23.getDay(); // 0 = Sonntag, 1 = Montag, ..., 3 = Mittwoch, ..., 6 = Samstag
      // Berechne wie viele Tage zurück zum Mittwoch
      // Wenn Mittwoch (3): 0 Tage zurück
      // Wenn Donnerstag (4): 1 Tag zurück → 4 - 3 = 1
      // Wenn Freitag (5): 2 Tage zurück → 5 - 3 = 2
      // Wenn Samstag (6): 3 Tage zurück → 6 - 3 = 3
      // Wenn Sonntag (0): 4 Tage zurück → (0 + 7) - 3 = 4
      // Wenn Montag (1): 5 Tage zurück → (1 + 7) - 3 = 5
      // Wenn Dienstag (2): 6 Tage zurück → (2 + 7) - 3 = 6
      const daysToSubtract = dayOfWeekNov23 <= 3 ? 3 - dayOfWeekNov23 : dayOfWeekNov23 + 7 - 3;
      const busstag = new Date(year, 10, 23 - daysToSubtract);

      const movableHolidays = [
        { date: new Date(easterTime - 2 * oneDay), key: 'karfreitag' }, // Karfreitag
        { date: new Date(easterTime + 1 * oneDay), key: 'ostermontag' }, // Ostermontag
        { date: new Date(easterTime + 39 * oneDay), key: 'christi_himmelfahrt' }, // Christi Himmelfahrt
        { date: new Date(easterTime + 50 * oneDay), key: 'pfingstmontag' }, // Pfingstmontag
        { date: new Date(easterTime + 60 * oneDay), key: 'fronleichnam' }, // Fronleichnam (nur in bestimmten Bundesländern)
        { date: busstag, key: 'busstag' }, // Buß- und Bettag (nur in Sachsen)
      ];

      // Prüfe bewegliche Feiertage
      for (const holiday of movableHolidays) {
        if (
          holiday.date.getFullYear() === year &&
          holiday.date.getMonth() === month &&
          holiday.date.getDate() === day &&
          isHolidayEnabled(holiday.key)
        ) {
          result = true;
          break;
        }
      }
    }

    // Cache speichern
    this._holidayCache[cacheKey][day] = result;

    return result;
  }

  // Prüft ob ein Datum ein Wochenende ist
  _isWeekend(year, month, day) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sonntag = 0, Samstag = 6
  }

  get hass() {
    return this._hass;
  }

  set hass(hass) {
    // Ignoriere Updates während des Schreibens und 5 Sekunden danach
    if (this._isWriting) {
      this._hass = hass; // Aktualisiere hass trotzdem, aber lade keine Daten
      this.requestUpdate();
      return;
    }

    const previousEntityState = this._hass?.states[this._config?.entity]?.state;
    const newEntityState = hass?.states[this._config?.entity]?.state;

    // Prüfe auch zusätzliche Entities auf Änderungen
    let hasAnyEntityChanged = previousEntityState !== newEntityState;
    if (!hasAnyEntityChanged && this._config && this._knownEntityIds) {
      // Prüfe alle bekannten zusätzlichen Entities
      for (let i = 1; i < this._knownEntityIds.length; i++) {
        const entityId = this._knownEntityIds[i];
        const prevState = this._hass?.states[entityId]?.state;
        const newState = hass?.states[entityId]?.state;
        if (prevState !== newState) {
          hasAnyEntityChanged = true;
          break;
        }
      }
    }

    this._hass = hass;

    // Cache-Invalidierung: Holiday-Entities Cache zurücksetzen bei hass-Update
    this._cachedHolidayEntities = null;

    if (this._config) {
      // Nur laden, wenn sich ein State tatsächlich geändert hat (nicht bei jedem Update)
      if (hasAnyEntityChanged) {
        this.loadWorkingDays();
      }
      // Prüfe Config-Entity und Status-Entity nur bei text_entity Modus
      // (bei Saver werden diese nicht benötigt)
      if (this._config.store_mode !== 'saver') {
        this.checkConfigEntity();
        this.checkStatusEntity();
      }
    }
    this.requestUpdate();
  }

  get config() {
    return this._config;
  }

  set config(config) {
    const wasInitialLoad = this._isInitialLoad;
    this._config = config;

    // Initialisiere _displayedMonths aus der Config
    if (config && config.initialDisplayedMonths) {
      // Verwende initialDisplayedMonths als Standardwert
      const maxMonths = config.numberOfMonths || 14;
      this._displayedMonths = Math.min(config.initialDisplayedMonths, maxMonths);
    } else if (config && config.numberOfMonths && !this._displayedMonths) {
      // Fallback: Verwende numberOfMonths, falls initialDisplayedMonths nicht gesetzt ist
      this._displayedMonths = config.numberOfMonths;
    } else if (config && config.numberOfMonths) {
      // Stelle sicher, dass _displayedMonths nicht größer als numberOfMonths ist
      this._displayedMonths = Math.min(this._displayedMonths || 2, config.numberOfMonths);
    }

    // Initialisiere _selectedCalendar - prüfe nur aktivierte Kalender
    // Setze _config zuerst, damit _getAllCalendars() funktioniert
    this._config = config;
    const allCalendars = this._getAllCalendars();

    // Synchronisiere _selectedCalendar immer mit config.selectedCalendar
    if (config && config.selectedCalendar) {
      // Prüfe ob der ausgewählte Kalender aktiviert ist
      const exists = allCalendars.some(cal => cal.shortcut === config.selectedCalendar);
      if (exists) {
        // Aktualisiere _selectedCalendar, auch wenn es bereits gesetzt ist
        this._selectedCalendar = config.selectedCalendar;
      } else {
        // Wenn der ausgewählte Kalender nicht aktiviert ist, verwende den ersten aktivierten
        if (allCalendars.length > 0) {
          this._selectedCalendar = allCalendars[0].shortcut;
          if (config) {
            config.selectedCalendar = this._selectedCalendar;
            // Nur config-changed Event auslösen, wenn nicht initialer Load
            if (!wasInitialLoad) {
              this.dispatchEvent(
                new CustomEvent('config-changed', {
                  detail: { config: config },
                  bubbles: true,
                  composed: true,
                })
              );
            }
          }
        } else {
          // Ausgewählter Kalender ist nicht aktiviert, verwende den ersten aktivierten
          if (allCalendars.length > 0) {
            this._selectedCalendar = allCalendars[0].shortcut;
            if (config) {
              config.selectedCalendar = this._selectedCalendar;
              // Nur config-changed Event auslösen, wenn nicht initialer Load
              if (!wasInitialLoad) {
                this.dispatchEvent(
                  new CustomEvent('config-changed', {
                    detail: { config: config },
                    bubbles: true,
                    composed: true,
                  })
                );
              }
            }
          } else {
            // Kein Kalender aktiviert - keine automatische Aktivierung
            this._selectedCalendar = null;
            if (config) {
              config.selectedCalendar = null;
            }
          }
        }
      }
    } else {
      // Wenn kein selectedCalendar gesetzt ist, verwende den ersten aktivierten Kalender
      if (allCalendars.length > 0) {
        this._selectedCalendar = allCalendars[0].shortcut;
        if (config) {
          config.selectedCalendar = this._selectedCalendar;
          // Nur config-changed Event auslösen, wenn nicht initialer Load
          if (!wasInitialLoad) {
            this.dispatchEvent(
              new CustomEvent('config-changed', {
                detail: { config: config },
                bubbles: true,
                composed: true,
              })
            );
          }
        }
      } else {
        // Kein Kalender aktiviert - keine automatische Aktivierung
        this._selectedCalendar = null;
        if (config) {
          config.selectedCalendar = null;
        }
      }
    }

    if (this._hass) {
      this.loadWorkingDays();
      // Prüfe Config-Entity und Status-Entity nur bei text_entity Modus
      // (bei Saver werden diese nicht benötigt)
      if (this._config && this._config.store_mode !== 'saver') {
        this.checkConfigEntity();
        this.checkStatusEntity();
      }
      // saveConfigToEntity() wird nur durch config-changed Events aufgerufen,
      // nicht beim initialen Laden im config Setter
    }

    // Markiere initialen Load als abgeschlossen NACH dem ersten Rendering
    // (nicht hier, sondern in firstUpdated oder nach dem ersten config-changed Event)

    this.requestUpdate();
  }

  // Wird aufgerufen, wenn ein config-changed Event empfangen wird
  // (nur dann wird die Config gespeichert, nicht beim initialen Laden)
  _handleConfigChanged() {
    // Verhindere Speichern beim initialen Load
    if (this._isInitialLoad) {
      this._debug('[Config] _handleConfigChanged: Initialer Load, überspringe Config-Speichern');
      // Markiere initialen Load als abgeschlossen NACH dem ersten Event
      this._isInitialLoad = false;
      return;
    }
    if (this._hass && this._config) {
      this.saveConfigToEntity();
    }
  }

  // Liest eine Saver-Variable (z.B. "Schichtplan" aus saver.saver.attributes.variables)
  _readSaverVariable(key) {
    if (!this._hass || !this._hass.states || !key) {
      this._debug('[Saver] _readSaverVariable: Kein hass oder key vorhanden');
      return null;
    }

    // Saver-Variablen sind in saver.saver.attributes.variables gespeichert
    const saverEntity = this._hass.states['saver.saver'];
    if (saverEntity && saverEntity.attributes && saverEntity.attributes.variables) {
      const variables = saverEntity.attributes.variables;
      const variableValue = variables[key];

      if (variableValue !== undefined && variableValue !== null) {
        // Konvertiere zu String und trimme
        const value = String(variableValue).trim();
        if (value !== '') {
          this._debug(
            `[Saver] _readSaverVariable: Variable "${key}" gefunden in saver.saver.attributes.variables, Länge: ${value.length} Zeichen`
          );
          // Zeige ersten 100 Zeichen der Daten für Debug
          if (value.length > 0) {
            const preview = value.substring(0, 100);
            this._debug(
              `[Saver] _readSaverVariable: Daten-Vorschau: "${preview}${value.length > 100 ? '...' : ''}"`
            );
          }
          return value;
        }
      }

      // Debug: Zeige verfügbare Variablen
      const availableKeys = Object.keys(variables);
      this._debug(
        `[Saver] _readSaverVariable: Variable "${key}" nicht gefunden. Verfügbare Variablen: ${availableKeys.length > 0 ? availableKeys.join(', ') : 'keine'}`
      );
    } else {
      this._debug(
        `[Saver] _readSaverVariable: saver.saver Entity nicht gefunden oder hat keine variables-Attribute`
      );
    }

    this._debug(`[Saver] _readSaverVariable: Variable "${key}" nicht gefunden oder leer`);
    return null;
  }

  // Prüft ob Saver verfügbar ist (mindestens eine Saver-Entity existiert)
  _isSaverAvailable() {
    if (!this._hass || !this._hass.states) {
      return false;
    }
    // Prüfe ob irgendeine saver.* Entity existiert
    return Object.keys(this._hass.states).some(entityId => entityId.startsWith('saver.'));
  }

  // Liest Daten vom Saver (wenn store_mode == 'saver' und Saver verfügbar)
  _loadDataFromSaver() {
    if (!this._config || this._config.store_mode !== 'saver') {
      this._debug('[Saver] _loadDataFromSaver: store_mode ist nicht "saver"');
      return null;
    }

    const saverKey = this._config.saver_key || 'Schichtplan';
    this._debug(
      `[Saver] _loadDataFromSaver: Versuche Daten von Saver-Variable "${saverKey}" zu laden`
    );
    const data = this._readSaverVariable(saverKey);

    // Wenn Daten vorhanden, gib sie zurück
    if (data && data.trim() !== '') {
      this._debug(
        `[Saver] _loadDataFromSaver: Daten erfolgreich geladen, Länge: ${data.length} Zeichen`
      );
      return data;
    }

    this._debug('[Saver] _loadDataFromSaver: Keine Daten gefunden');
    return null;
  }

  // Liest Config vom Saver (wenn store_mode == 'saver' und Saver verfügbar)
  _loadConfigFromSaver() {
    if (!this._config || this._config.store_mode !== 'saver') {
      this._debug('[Saver] _loadConfigFromSaver: store_mode ist nicht "saver"');
      return null;
    }

    const saverKey = this._config.saver_key || 'Schichtplan';
    const configKey = `${saverKey}_config`;
    this._debug(
      `[Saver] _loadConfigFromSaver: Versuche Config von Saver-Variable "${configKey}" zu laden`
    );
    const config = this._readSaverVariable(configKey);

    // Wenn Config vorhanden, gib sie zurück
    if (config && config.trim() !== '') {
      this._debug(
        `[Saver] _loadConfigFromSaver: Config erfolgreich geladen, Länge: ${config.length} Zeichen`
      );
      return config;
    }

    this._debug('[Saver] _loadConfigFromSaver: Keine Config gefunden');
    return null;
  }

  async loadWorkingDays() {
    if (!this._hass || !this._config || !this._config.entity) {
      this._debug('[Laden] loadWorkingDays: Kein hass, config oder entity vorhanden');
      return;
    }

    this._debug(
      `[Laden] loadWorkingDays: Start, store_mode: "${this._config.store_mode}", entity: "${this._config.entity}"`
    );

    let dataString = null;
    let dataSource = 'none';

    // Versuche zuerst Saver (wenn store_mode == 'saver')
    if (this._config.store_mode === 'saver') {
      this._debug('[Laden] loadWorkingDays: Versuche Daten vom Saver zu laden');
      const saverData = this._loadDataFromSaver();
      if (saverData) {
        dataString = saverData;
        dataSource = 'saver';
        this._debug(
          `[Laden] loadWorkingDays: Daten vom Saver geladen, Länge: ${dataString.length} Zeichen`
        );
      } else {
        this._debug('[Laden] loadWorkingDays: Keine Daten vom Saver, Fallback zu Entities');
      }
    } else {
      this._debug(
        '[Laden] loadWorkingDays: store_mode ist nicht "saver", lade direkt von Entities'
      );
    }

    // Fallback: Lade von Entities (wenn Saver-Daten fehlen oder store_mode != 'saver')
    if (!dataString || dataString.trim() === '') {
      this._debug('[Laden] loadWorkingDays: Lade Daten von Entities');
      // Ermittle die maximale Länge für alle Entities
      const maxLengths = this.getAllEntityMaxLengths();

      // Sammle alle Daten-Strings aus der Haupt-Entity und zusätzlichen Entities
      const dataStrings = [];

      // Prüfe auf zusätzliche Entities (z.B. input_text.arbeitszeiten_001, _002, etc.)
      const baseEntityId = this._config.entity;
      const additionalEntities = this.findAdditionalEntities(baseEntityId);
      this._debug(
        `[Laden] loadWorkingDays: Gefundene Entities: Haupt: "${baseEntityId}", Zusätzliche: ${additionalEntities.length}`
      );

      // Speichere die Liste der bekannten Entities für späteres Schreiben
      // Diese Liste enthält: Haupt-Entity + alle zusätzlichen Entities
      this._knownEntityIds = [baseEntityId, ...additionalEntities];

      // Lade Daten aus allen Entities (Haupt-Entity + zusätzliche)
      for (const entityId of this._knownEntityIds) {
        const entity = this._hass.states[entityId];
        if (entity && entity.state && entity.state.trim() !== '') {
          const entityData = entity.state;
          dataStrings.push(entityData);
          this._debug(
            `[Laden] loadWorkingDays: Entity "${entityId}" hat Daten, Länge: ${entityData.length} Zeichen`
          );
        } else {
          this._debug(
            `[Laden] loadWorkingDays: Entity "${entityId}" ist leer oder nicht vorhanden`
          );
        }
      }

      // Füge alle Strings zusammen (mit ";" als Trennzeichen)
      if (dataStrings.length > 0) {
        dataString = dataStrings.join(';');
        dataSource = 'entities';
        this._debug(
          `[Laden] loadWorkingDays: Daten von Entities kombiniert, Gesamtlänge: ${dataString.length} Zeichen`
        );
      } else {
        this._debug('[Laden] loadWorkingDays: Keine Daten in Entities gefunden');
      }
    }

    // Parse die Daten (egal ob von Saver oder Entities)
    if (dataString && dataString.trim() !== '') {
      this._debug(`[Laden] loadWorkingDays: Parse Daten von Quelle: "${dataSource}"`);
      this.parseWorkingDays(dataString);
      const workingDaysCount = Object.keys(this._workingDays).length;
      this._debug(`[Laden] loadWorkingDays: Daten geparst, ${workingDaysCount} Monate gefunden`);
    } else {
      this._debug(
        '[Laden] loadWorkingDays: Keine Daten zum Parsen vorhanden, setze _workingDays auf {}'
      );
      this._workingDays = {};
    }

    // Prüfe Speicherverbrauch und zeige Warnung bei 90%+
    // Nur bei text_entity Modus (Saver hat keine Längenbegrenzung)
    if (this._config.store_mode !== 'saver') {
      this.checkStorageUsage();
    } else {
      // Bei Saver-Modus keine Speicherwarnung nötig
      this._storageWarning = null;
    }

    // Bereinige alte Monate: entferne alle Monate, die nicht angezeigt werden
    // Die Karte zeigt numberOfMonths Monate an (ab aktueller Monat)
    // Behalten wir: Vormonat (aktuell - 1) und alle angezeigten Monate (aktuell bis aktuell + numberOfMonths - 1)
    // Führe die Bereinigung nur beim initialen Laden aus, nicht bei jedem State-Update
    // (um zu verhindern, dass gerade geschriebene Daten sofort wieder gelöscht werden)
    if (Object.keys(this._workingDays).length > 0 && !this._cleanupDone) {
      this._cleanupDone = true;
      const numberOfMonths = this._config.numberOfMonths || 2;
      const now = new Date();
      const currentMonth = now.getMonth() + 1; // 1-12
      const currentYearFull = now.getFullYear();
      const currentYear = currentYearFull % 100; // Kurzform, z.B. 25

      // Berechne Vormonat und sein Jahr
      let previousMonth, previousYear;
      if (currentMonth === 1) {
        previousMonth = 12;
        previousYear = (currentYearFull - 1) % 100; // Jahr des Vormonats (Dezember des Vorjahres)
      } else {
        previousMonth = currentMonth - 1;
        previousYear = currentYear;
      }

      // Erstelle Liste aller Monate, die behalten werden sollen
      const monthsToKeep = [];

      // Füge Vormonat hinzu
      monthsToKeep.push({ year: previousYear, month: previousMonth });

      // Füge alle angezeigten Monate hinzu
      for (let i = 0; i < numberOfMonths; i++) {
        const date = new Date(currentYearFull, currentMonth - 1 + i, 1);
        const year = date.getFullYear() % 100;
        const month = date.getMonth() + 1;
        monthsToKeep.push({ year, month });
      }

      let hasChanges = false;

      for (const key of Object.keys(this._workingDays)) {
        // Parse den Key um zu prüfen, ob er behalten werden soll
        const keyParts = key.split(':');
        if (keyParts.length === 2) {
          const keyYear = parseInt(keyParts[0]);
          const keyMonth = parseInt(keyParts[1]);

          // Prüfe ob dieser Key in der Liste der zu behaltenden Monate ist
          const shouldKeep = monthsToKeep.some(m => m.year === keyYear && m.month === keyMonth);

          //   key,
          //   keyYear,
          //   keyMonth,
          //   shouldKeep,
          //   monthsToKeep: monthsToKeep.map(m => `${m.year}:${m.month}`)
          // });

          if (!shouldKeep) {
            delete this._workingDays[key];
            hasChanges = true;
          }
        } else {
          // Ungültiges Format, entfernen
          delete this._workingDays[key];
          hasChanges = true;
        }
      }

      // Wenn Änderungen vorgenommen wurden, speichere die bereinigten Daten
      if (hasChanges) {
        const cleanedValue = this.serializeWorkingDays();
        try {
          await this._hass.callService('input_text', 'set_value', {
            entity_id: this._config.entity,
            value: cleanedValue,
          });
        } catch (error) {}
      }
    }

    this.requestUpdate();
  }

  _parseWorkingDaysIntoObject(dataString, targetObject) {
    if (!dataString || dataString.trim() === '') return;

    const parts = dataString.split(';').filter(p => p.trim() !== '');
    for (const part of parts) {
      const trimmedPart = part.trim();
      if (!trimmedPart) continue;

      // Format: <jahr>:<monat>:<tag><elementen>,<tag><elementen> oder altes Format
      // Beispiel: "25:11:01a,02ah,03b" oder "25:11:01,02,03" (altes Format ohne Elemente)
      const colons = trimmedPart.split(':');

      if (colons.length === 2) {
        // Altes Format ohne Jahr (Kompatibilität): <monat>:<tag>,<tag>
        const month = colons[0].trim();
        const daysStr = colons[1].trim();
        if (month && daysStr) {
          const monthNum = parseInt(month);
          if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
            // Verwende aktuelles Jahr
            const now = new Date();
            const year = now.getFullYear() % 100;
            const key = `${this.formatTwoDigits(year)}:${this.formatTwoDigits(monthNum)}`;
            targetObject[key] = this._parseDaysWithElements(daysStr);
          }
        }
      } else if (colons.length >= 3) {
        // Prüfe ob erstes Element ein Jahr ist (kleiner als 13) oder ein Monat
        const first = parseInt(colons[0].trim());
        const second = parseInt(colons[1].trim());

        if (first <= 12 && second > 12) {
          // Altes Format: <monat>:<jahr>:<tag>,<tag> - konvertiere zu neuem Format
          const monthNum = first;
          const yearNum = second;
          const daysStr = colons.slice(2).join(':');
          if (daysStr && monthNum >= 1 && monthNum <= 12 && !isNaN(yearNum)) {
            const key = `${this.formatTwoDigits(yearNum)}:${this.formatTwoDigits(monthNum)}`;
            targetObject[key] = this._parseDaysWithElements(daysStr);
          }
        } else if (first > 12 && second <= 12) {
          // Neues Format: <jahr>:<monat>:<tag><elementen>,<tag><elementen>
          const yearNum = first;
          const monthNum = second;
          const daysStr = colons.slice(2).join(':');
          if (daysStr && monthNum >= 1 && monthNum <= 12 && !isNaN(yearNum)) {
            const key = `${this.formatTwoDigits(yearNum)}:${this.formatTwoDigits(monthNum)}`;
            targetObject[key] = this._parseDaysWithElements(daysStr);
          }
        }
      }
    }
  }

  // Parst Tage mit Elementen: "01a,02ah,03b" -> {1: ["a"], 2: ["a", "h"], 3: ["b"]}
  // Oder altes Format ohne Elemente: "01,02,03" -> {1: [], 2: [], 3: []}
  _parseDaysWithElements(daysStr) {
    const result = {};
    const dayEntries = daysStr.split(',').filter(d => d.trim() !== '');

    for (const entry of dayEntries) {
      const trimmed = entry.trim();
      if (!trimmed) continue;

      // Extrahiere Tag und Elemente: "01a" -> day=1, elements=["a"]
      // Oder: "02ah" -> day=2, elements=["a", "h"]
      // Oder altes Format: "01" -> day=1, elements=[]
      const match = trimmed.match(/^(\d+)([a-z]*)$/i);
      if (match) {
        const dayNum = parseInt(match[1]);
        const elementsStr = match[2] || '';
        // WICHTIG: Filtere nur leere Strings heraus, nicht einzelne Buchstaben
        // split('') teilt jeden Buchstaben in ein separates Array-Element
        const elements = elementsStr.split('').filter(e => e && e.trim() !== '');

        if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= 31) {
          // Wenn der Tag bereits existiert, füge Elemente hinzu (keine Duplikate)
          if (result[dayNum]) {
            // Vereinige Arrays und entferne Duplikate
            result[dayNum] = [...new Set([...result[dayNum], ...elements])];
          } else {
            result[dayNum] = elements;
          }
        }
      } else {
        // Debug-Log wenn kein Match gefunden wurde
        if (trimmed.includes('03')) {
          this._debug(`[Parsing] Kein Match für "${trimmed}"`);
        }
      }
    }

    return result;
  }

  parseWorkingDays(dataString) {
    this._workingDays = {};
    this._parseWorkingDaysIntoObject(dataString, this._workingDays);
  }

  findAdditionalEntities(baseEntityId) {
    const additionalEntities = [];

    if (!this._hass || !this._hass.states) {
      return additionalEntities;
    }

    // Extrahiere den Domain-Teil (z.B. "input_text.arbeitszeiten")
    const entityParts = baseEntityId.split('.');
    if (entityParts.length !== 2) {
      return additionalEntities;
    }

    const [domain, baseName] = entityParts;

    // Suche nach Entities mit _001, _002, etc. (bis _999)
    for (let i = 1; i <= 999; i++) {
      const suffix = String(i).padStart(3, '0'); // _001, _002, ..., _999
      const additionalEntityId = `${domain}.${baseName}_${suffix}`;

      if (this._hass.states[additionalEntityId]) {
        additionalEntities.push(additionalEntityId);
      } else {
        // Wenn eine Entity nicht existiert, breche ab (Entities sind sequenziell)
        // Es macht keinen Sinn weiterzusuchen, wenn _001 fehlt
        break;
      }
    }

    return additionalEntities;
  }

  getEntityMaxLength(entityId) {
    if (!this._hass || !this._hass.states || !entityId) {
      return null;
    }

    const entity = this._hass.states[entityId];
    if (!entity || !entity.attributes) {
      return null;
    }

    // input_text Entities haben ein 'max' Attribut, das die maximale Länge definiert
    const maxLength = entity.attributes.max;

    if (maxLength !== undefined && maxLength !== null) {
      return parseInt(maxLength);
    }

    return null;
  }

  getAllEntityMaxLengths() {
    const maxLengths = {};

    if (!this._hass || !this._config || !this._config.entity) {
      return maxLengths;
    }

    // Prüfe Haupt-Entity
    const mainEntityId = this._config.entity;
    const mainMaxLength = this.getEntityMaxLength(mainEntityId);
    if (mainMaxLength !== null) {
      maxLengths[mainEntityId] = mainMaxLength;
    }

    // Prüfe zusätzliche Entities
    const additionalEntities = this.findAdditionalEntities(mainEntityId);
    for (const additionalEntityId of additionalEntities) {
      const additionalMaxLength = this.getEntityMaxLength(additionalEntityId);
      if (additionalMaxLength !== null) {
        maxLengths[additionalEntityId] = additionalMaxLength;
      }
    }

    return maxLengths;
  }

  checkStorageUsage(serializedDataLength = null) {
    // Warnungen nur bei text_entity Modus (Saver hat keine Längenbegrenzung)
    if (this._config && this._config.store_mode === 'saver') {
      this._storageWarning = null;
      this._updateStorageWarningDirectly();
      return;
    }

    if (!this._hass || !this._config || !this._config.entity) {
      this._storageWarning = null;
      this._updateStorageWarningDirectly();
      return;
    }

    // Verwende _knownEntityIds falls verfügbar, sonst suche neu
    let allEntityIds;
    if (this._knownEntityIds && this._knownEntityIds.length > 0) {
      allEntityIds = [...this._knownEntityIds];
    } else {
      // Fallback: Suche Entities neu
      allEntityIds = [this._config.entity, ...this.findAdditionalEntities(this._config.entity)];
    }

    const maxLengths = this.getAllEntityMaxLengths();
    if (Object.keys(maxLengths).length === 0) {
      this._storageWarning = null;
      this._updateStorageWarningDirectly();
      return;
    }

    // Berechne Gesamtlänge und maximale Gesamtlänge
    let totalCurrentLength = 0;
    let totalMaxLength = 0;

    // Wenn eine serializedDataLength übergeben wurde, verwende diese (z.B. nach toggleDay)
    // Ansonsten lese die Längen aus den aktuellen States
    if (serializedDataLength !== null && serializedDataLength !== undefined) {
      totalCurrentLength = serializedDataLength;
    } else {
      // Lese Längen aus den aktuellen States
      for (const entityId of allEntityIds) {
        const entity = this._hass.states[entityId];
        if (entity && entity.state) {
          totalCurrentLength += entity.state.length;
        }
      }
    }

    // Berechne maximale Gesamtlänge
    for (const entityId of allEntityIds) {
      const maxLength = maxLengths[entityId];
      if (maxLength !== undefined && maxLength !== null) {
        totalMaxLength += maxLength;
      }
    }

    if (totalMaxLength === 0) {
      this._storageWarning = null;
      this._updateStorageWarningDirectly();
      return;
    }

    const percentage = (totalCurrentLength / totalMaxLength) * 100;

    // Prüfe ob 90% überschritten werden
    if (percentage >= 90) {
      this._storageWarning = {
        show: true,
        currentLength: totalCurrentLength,
        maxLength: totalMaxLength,
        percentage: Math.round(percentage * 10) / 10,
      };
    } else {
      this._storageWarning = null;
    }

    // Aktualisiere Warnung direkt im DOM ohne Re-Rendering
    this._updateStorageWarningDirectly();
  }

  getConfigEntityId() {
    // Leite die Config-Entity-ID aus der Haupt-Entity ab
    if (!this._config || !this._config.entity) {
      return null;
    }
    // Füge "_config" an die Entity-ID an
    // z.B. "input_text.arbeitszeiten" -> "input_text.arbeitszeiten_config"
    return this._config.entity + '_config';
  }

  getStatusEntityId() {
    // Leite die Status-Entity-ID aus der Haupt-Entity ab
    if (!this._config || !this._config.entity) {
      return null;
    }
    // Füge "_status" an die Entity-ID an
    // z.B. "input_text.arbeitszeiten" -> "input_text.arbeitszeiten_status"
    return this._config.entity + '_status';
  }

  checkConfigEntity() {
    // Warnungen nur bei text_entity Modus (bei Saver wird Config anders gespeichert)
    if (this._config && this._config.store_mode === 'saver') {
      this._configWarning = null;
      this._updateConfigWarningDirectly();
      return;
    }

    // Prüfe ob die Config-Entity existiert
    if (!this._config || !this._config.entity) {
      this._configWarning = null;
      this._updateConfigWarningDirectly();
      return;
    }

    const configEntityId = this.getConfigEntityId();
    if (!configEntityId) {
      this._configWarning = null;
      this._updateConfigWarningDirectly();
      return;
    }

    // Wenn kein hass vorhanden ist (z.B. im Editor), zeige Warnung im Editor-Modus
    if (!this._hass) {
      if (this._isInEditorMode()) {
        this._configWarning = {
          show: true,
          type: 'missing',
          configEntityId: configEntityId,
        };
      } else {
        this._configWarning = null;
      }
      this._updateConfigWarningDirectly();
      return;
    }

    const configEntity = this._hass.states[configEntityId];
    if (!configEntity) {
      this._configWarning = {
        show: true,
        type: 'missing',
        configEntityId: configEntityId,
      };
    } else {
      // Prüfe ob es eine Größen-Warnung gibt, die beibehalten werden soll
      if (this._configWarning && this._configWarning.type === 'size') {
        // Behalte die Größen-Warnung
      } else {
        this._configWarning = null;
      }
    }

    this._updateConfigWarningDirectly();
  }

  // Rendert eine Warnung für eine fehlende Entity
  _renderMissingEntityWarning(entityId, entityName, maxLength = 255, isConfig = false) {
    const entityNameShort = entityId.replace('input_text.', '');
    return html`
      <div class="storage-warning">
        <div class="warning-icon">⚠️</div>
        <div class="warning-content">
          <div class="warning-title">${entityName} fehlt!</div>
          <div class="warning-message">
            Die Entity <code>${entityId}</code> wurde nicht gefunden.
          </div>
          <div class="warning-action">
            Bitte legen Sie diese Entity über die UI an:
            <ul>
              <li>Einstellungen → Automatisierungen &amp; Szenen → Hilfsmittel</li>
              <li>Hinzufügen → Text</li>
              <li>Name: <code>${entityNameShort}</code></li>
              <li>Maximale Länge: <code>${maxLength}</code> Zeichen</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  checkStatusEntity() {
    // Warnungen nur bei text_entity Modus (bei Saver wird Status anders gespeichert)
    if (this._config && this._config.store_mode === 'saver') {
      this._statusWarning = null;
      this._updateStatusWarningDirectly();
      return;
    }

    // Prüfe ob die Status-Entity existiert
    if (!this._config || !this._config.entity) {
      this._statusWarning = null;
      this._updateStatusWarningDirectly();
      return;
    }

    const statusEntityId = this.getStatusEntityId();
    if (!statusEntityId) {
      this._statusWarning = null;
      this._updateStatusWarningDirectly();
      return;
    }

    // Wenn kein hass vorhanden ist (z.B. im Editor), zeige Warnung im Editor-Modus
    if (!this._hass) {
      if (this._isInEditorMode()) {
        this._statusWarning = {
          show: true,
          type: 'missing',
          statusEntityId: statusEntityId,
        };
      } else {
        this._statusWarning = null;
      }
      this._updateStatusWarningDirectly();
      return;
    }

    const statusEntity = this._hass.states[statusEntityId];
    if (!statusEntity) {
      this._statusWarning = {
        show: true,
        type: 'missing',
        statusEntityId: statusEntityId,
      };
    } else {
      this._statusWarning = null;
    }

    this._updateStatusWarningDirectly();
  }

  // Erstellt die Config-Daten im komprimierten Format (für text_input Entities)
  _createCompressedConfig(activeShifts) {
    // Speichere als JSON (direktes Array, kein Objekt-Wrapper)
    let configJson = JSON.stringify(activeShifts);

    // Entferne die äußere Klammer (erstes [ und letztes ])
    if (configJson.startsWith('[') && configJson.endsWith(']')) {
      configJson = configJson.slice(1, -1);
    }

    // Entferne "null" aus dem String (behalte Kommas)
    // Wiederhole die Ersetzung, bis keine null mehr vorhanden sind (für mehrere null hintereinander)
    let previousLength;
    do {
      previousLength = configJson.length;
      // Ersetze ,null, durch ,, (mehrfach, bis keine null mehr vorhanden sind)
      configJson = configJson.replace(/,null,/g, ',,');
      // Ersetze ,null] durch ,] (falls am Ende eines Arrays)
      configJson = configJson.replace(/,null\]/g, ',]');
      // Ersetze [null, durch [, (falls am Anfang eines Arrays)
      configJson = configJson.replace(/\[null,/g, '[,');
      // Ersetze ,null, am Ende des Strings (falls letztes Element null ist)
      configJson = configJson.replace(/,null$/g, ',');
    } while (configJson.length !== previousLength);

    // Entferne Anführungszeichen um Strings
    // Ersetze "," durch , (Anführungszeichen um Kommas)
    configJson = configJson.replace(/","/g, ',');
    // Ersetze [" durch [ (Anführungszeichen am Anfang eines Arrays)
    configJson = configJson.replace(/\["/g, '[');
    // Ersetze "] durch ] (Anführungszeichen am Ende eines Arrays)
    configJson = configJson.replace(/"\]/g, ']');
    // Ersetze ," durch , (Anführungszeichen nach Komma)
    configJson = configJson.replace(/,"/g, ',');
    // Ersetze ", durch , (Anführungszeichen vor Komma)
    configJson = configJson.replace(/",/g, ',');

    return configJson;
  }

  // Erstellt die Config-Daten im vollständigen JSON-Format (für Saver)
  _createFullJsonConfig(activeShifts) {
    // Vollständiges JSON-Format: Array mit Anführungszeichen und null-Werten
    return JSON.stringify(activeShifts);
  }

  async saveConfigToEntity() {
    // Speichere die Konfiguration in der Config-Entity oder im Saver
    // Verhindere Speichern beim initialen Load
    if (this._isInitialLoad) {
      this._debug('[Config] saveConfigToEntity: Initialer Load, überspringe Config-Speichern');
      return;
    }
    if (!this._hass || !this._config || !this._config.entity) {
      return;
    }

    // Sammle aktive Schichten als Array mit Subarrays [shortcut, name, start1, end1, start2, end2, statusRelevant]
    // Reihenfolge: [0] = shortcut, [1] = name, [2] = Startzeit 1, [3] = Endzeit 1, [4] = Startzeit 2, [5] = Endzeit 2, [6] = statusRelevant (0 oder 1)
    // Leere Positionen bleiben leer (null) wenn Zeiträume nicht gesetzt sind
    const activeShifts = [];
    if (this._config.calendars) {
      for (const calendar of this._config.calendars) {
        if (
          calendar &&
          calendar.shortcut &&
          (calendar.enabled === true || calendar.enabled === 'true' || calendar.enabled === 1)
        ) {
          const shiftData = [
            calendar.shortcut,
            calendar.name || `Schicht ${calendar.shortcut.toUpperCase()}`,
          ];

          // Füge Zeiträume hinzu (feste Positionen, flach ohne Verschachtelung)
          if (calendar.timeRanges && Array.isArray(calendar.timeRanges)) {
            // Zeitraum 1: [2] = Startzeit 1, [3] = Endzeit 1
            const range1 = calendar.timeRanges[0];
            if (range1 && Array.isArray(range1) && range1.length >= 2) {
              const start1 = range1[0] && range1[0].trim() !== '' ? range1[0].trim() : null;
              const end1 = range1[1] && range1[1].trim() !== '' ? range1[1].trim() : null;
              // Nur hinzufügen wenn beide Zeiten gesetzt sind (vollständiger Zeitraum)
              if (start1 && end1) {
                shiftData.push(start1, end1);
              } else {
                shiftData.push(null, null);
              }
            } else {
              shiftData.push(null, null);
            }

            // Zeitraum 2: [4] = Startzeit 2, [5] = Endzeit 2
            const range2 = calendar.timeRanges[1];
            if (range2 && Array.isArray(range2) && range2.length >= 2) {
              const start2 = range2[0] && range2[0].trim() !== '' ? range2[0].trim() : null;
              const end2 = range2[1] && range2[1].trim() !== '' ? range2[1].trim() : null;
              // Nur hinzufügen wenn beide Zeiten gesetzt sind (vollständiger Zeitraum)
              if (start2 && end2) {
                shiftData.push(start2, end2);
              } else {
                shiftData.push(null, null);
              }
            } else {
              shiftData.push(null, null);
            }
          } else {
            // Keine Zeiträume definiert, füge leere Positionen hinzu
            shiftData.push(null, null, null, null);
          }

          // Füge statusRelevant hinzu: [6] = statusRelevant (0 oder 1)
          // Default: true (1), wenn nicht explizit auf false gesetzt
          const statusRelevant = calendar.statusRelevant !== false ? 1 : 0;
          shiftData.push(statusRelevant);

          activeShifts.push(shiftData);
        }
      }
    }

    this._debug(`[Config] saveConfigToEntity: ${activeShifts.length} aktive Schichten gefunden`);

    // Unterschiedliche Formate je nach store_mode
    if (this._config.store_mode === 'saver') {
      // Saver: Vollständiges JSON-Format
      const saverKey = this._config.saver_key || 'Schichtplan';
      const configKey = `${saverKey}_config`;
      const configJson = this._createFullJsonConfig(activeShifts);
      this._debug(
        `[Config] saveConfigToEntity: Speichere Config in Saver "${configKey}", Länge: ${configJson.length} Zeichen (vollständiges JSON)`
      );

      try {
        // Prüfe ob die Saver-Variable existiert und ob sich der Wert geändert hat
        // Suche in saver.saver.attributes.variables (nicht als direkte Entity)
        const saverEntity = this._hass.states['saver.saver'];
        let oldValue = '';

        if (saverEntity && saverEntity.attributes && saverEntity.attributes.variables) {
          const existingValue = saverEntity.attributes.variables[configKey];
          if (existingValue !== undefined && existingValue !== null) {
            oldValue = String(existingValue).trim();
          }
        }

        this._debug(
          `[Config] saveConfigToEntity: Saver-Variable "${configKey}" existiert: ${oldValue !== ''}, alte Länge: ${oldValue.length} Zeichen`
        );

        // Nur schreiben wenn Variable nicht existiert oder Wert sich geändert hat
        if (oldValue === '' || oldValue !== configJson) {
          this._debug(
            `[Config] saveConfigToEntity: Schreibe Config in Saver (Variable existiert nicht oder Wert hat sich geändert)`
          );
          await this._hass.callService('saver', 'set_variable', {
            name: configKey,
            value: configJson,
          });
          this._debug(`[Config] saveConfigToEntity: Erfolgreich in Saver geschrieben`);
        } else {
          this._debug(
            `[Config] saveConfigToEntity: Kein Schreiben nötig, Wert hat sich nicht geändert`
          );
        }
        // Warnung entfernen, da Saver erfolgreich beschrieben wurde
        this._configWarning = null;
        this._updateConfigWarningDirectly();
      } catch (error) {
        // Fehler beim Schreiben - könnte bedeuten, dass Saver nicht verfügbar ist
        // Fallback: Versuche Entity
        this._debug(
          `[Config] saveConfigToEntity: Fehler beim Schreiben in Saver, Fallback zu Entity: ${error.message}`,
          error
        );
        this._saveConfigToEntityFallback(activeShifts);
      }
    } else {
      // text_entity: Komprimiertes Format
      this._debug(`[Config] saveConfigToEntity: Speichere Config in Entity (komprimiertes Format)`);
      this._saveConfigToEntityFallback(activeShifts);
    }
  }

  async _saveConfigToEntityFallback(activeShifts) {
    const configEntityId = this.getConfigEntityId();
    if (!configEntityId) {
      this._debug('[Config] _saveConfigToEntityFallback: Keine configEntityId');
      return;
    }

    this._debug(`[Config] _saveConfigToEntityFallback: Start, configEntityId: "${configEntityId}"`);

    // Prüfe ob die Entity existiert
    const configEntity = this._hass.states[configEntityId];
    if (!configEntity) {
      // Entity existiert nicht, zeige Warnung
      this._debug(
        `[Config] _saveConfigToEntityFallback: Entity "${configEntityId}" existiert nicht`
      );
      this.checkConfigEntity();
      return;
    }

    // Komprimiertes Format für text_input Entities
    const configJson = this._createCompressedConfig(activeShifts);
    const configJsonLength = configJson.length;
    this._debug(
      `[Config] _saveConfigToEntityFallback: Config erstellt (komprimiert), Länge: ${configJsonLength} Zeichen`
    );

    // Prüfe ob der JSON-Text in das Entity passt
    const maxLength = this.getEntityMaxLength(configEntityId);
    if (maxLength !== null && configJsonLength > maxLength) {
      // JSON ist zu lang, zeige Warnung
      const percentage = (configJsonLength / maxLength) * 100;
      this._configWarning = {
        show: true,
        type: 'size',
        configEntityId: configEntityId,
        currentLength: configJsonLength,
        maxLength: maxLength,
        percentage: Math.round(percentage * 10) / 10,
      };
      this._updateConfigWarningDirectly();
      return;
    }

    try {
      this._debug(
        `[Config] _saveConfigToEntityFallback: Schreibe Config in Entity "${configEntityId}"`
      );
      await this._hass.callService('input_text', 'set_value', {
        entity_id: configEntityId,
        value: configJson,
      });
      this._debug(`[Config] _saveConfigToEntityFallback: Erfolgreich in Entity geschrieben`);
      // Warnung entfernen, da Entity existiert und erfolgreich beschrieben wurde
      this._configWarning = null;
      this._updateConfigWarningDirectly();
    } catch (error) {
      // Fehler beim Schreiben - könnte bedeuten, dass Entity nicht existiert
      this._debug(
        `[Config] _saveConfigToEntityFallback: Fehler beim Schreiben in Entity: ${error.message}`,
        error
      );
      this.checkConfigEntity();
    }
  }

  serializeWorkingDays() {
    const parts = [];
    // Sortiere nach Jahr:Monat
    const keys = Object.keys(this._workingDays).sort((a, b) => {
      const [yearA, monthA] = a.split(':').map(x => parseInt(x));
      const [yearB, monthB] = b.split(':').map(x => parseInt(x));
      if (yearA !== yearB) return yearA - yearB;
      return monthA - monthB;
    });

    for (const key of keys) {
      const days = this._workingDays[key];
      if (!days || typeof days !== 'object' || Array.isArray(days)) continue;

      // Struktur: {day: [elements]}
      const dayEntries = Object.keys(days)
        .map(d => parseInt(d))
        .filter(d => !isNaN(d))
        .sort((a, b) => a - b);

      if (dayEntries.length > 0) {
        // Format: <jahr>:<monat>:<tag><elementen>,<tag><elementen>
        // Beispiel: "25:11:01a,02ab,03b"
        const formattedDays = dayEntries
          .map(dayNum => {
            const elements = days[dayNum];
            const dayStr = this.formatTwoDigits(dayNum);
            if (Array.isArray(elements) && elements.length > 0) {
              // Sortiere die Kalender-Shortcuts alphabetisch (a, b, c, d, e) für konsistente Reihenfolge
              const sortedElements = [...elements].sort();
              // Tag mit Elementen: "01a", "02ab", etc.
              return dayStr + sortedElements.join('');
            } else {
              // Tag ohne Elemente
              return dayStr;
            }
          })
          .join(',');
        parts.push(`${key}:${formattedDays}`);
      }
    }
    return parts.join(';');
  }

  async distributeDataToEntities(serializedData) {
    if (!this._hass || !this._config || !this._config.entity) {
      this._debug('[Speichern] distributeDataToEntities: Kein hass, config oder entity vorhanden');
      return;
    }

    this._debug(
      `[Speichern] distributeDataToEntities: Start, Datenlänge: ${serializedData ? serializedData.length : 0} Zeichen`
    );

    // Setze Schreib-Lock
    this._isWriting = true;
    this._debug('[Speichern] distributeDataToEntities: Schreib-Lock gesetzt');

    // Lösche vorhandenen Timer, falls vorhanden
    if (this._writeLockTimer) {
      clearTimeout(this._writeLockTimer);
      this._writeLockTimer = null;
    }

    try {
      // Verwende die gecachte Liste der Entities, falls verfügbar
      // Prüfe aber auch, ob neue Entities hinzugekommen sind
      let allEntityIds;
      if (this._knownEntityIds && this._knownEntityIds.length > 0) {
        // Verwende gecachte Liste
        allEntityIds = [...this._knownEntityIds];

        // Prüfe ob neue Entities hinzugekommen sind
        const currentAdditionalEntities = this.findAdditionalEntities(this._config.entity);
        const knownAdditionalCount = this._knownEntityIds.length - 1; // -1 für Haupt-Entity
        if (currentAdditionalEntities.length > knownAdditionalCount) {
          // Neue Entities gefunden, aktualisiere die Liste
          const newEntities = currentAdditionalEntities.slice(knownAdditionalCount);
          allEntityIds.push(...newEntities);
          this._knownEntityIds = [...allEntityIds];
        }
      } else {
        // Keine gecachte Liste vorhanden, sammle Entities neu
        allEntityIds = [this._config.entity];
        const additionalEntities = this.findAdditionalEntities(this._config.entity);
        allEntityIds.push(...additionalEntities);
        this._knownEntityIds = [...allEntityIds];
      }

      this._debug(
        `[Speichern] distributeDataToEntities: Verwende ${allEntityIds.length} Entities: ${allEntityIds.join(', ')}`
      );

      // Ermittle die maximale Länge für jede Entity
      const maxLengths = {};
      let totalMaxLength = 0;
      for (const entityId of allEntityIds) {
        const maxLength = this.getEntityMaxLength(entityId);
        if (maxLength !== null) {
          maxLengths[entityId] = maxLength;
          totalMaxLength += maxLength;
        } else {
          // Wenn keine max-Länge bekannt ist, verwende einen Standardwert (z.B. 255)
          maxLengths[entityId] = 255;
          totalMaxLength += 255;
        }
      }

      // Debug: Zeige wie viele Zeichen wir schreiben wollen vs. können
      const dataLength = serializedData ? serializedData.length : 0;
      this._debug(
        `[Speichern] distributeDataToEntities: Datenlänge: ${dataLength} Zeichen, verfügbarer Speicher: ${totalMaxLength} Zeichen`
      );

      // Wenn keine Daten vorhanden sind, setze alle Entities auf leer
      if (!serializedData || serializedData.trim() === '') {
        this._debug(
          '[Speichern] distributeDataToEntities: Keine Daten vorhanden, setze alle Entities auf leer'
        );
        for (const entityId of allEntityIds) {
          try {
            await this._hass.callService('input_text', 'set_value', {
              entity_id: entityId,
              value: '',
            });
            this._debug(
              `[Speichern] distributeDataToEntities: Entity "${entityId}" auf leer gesetzt`
            );
          } catch (error) {
            this._debug(
              `[Speichern] distributeDataToEntities: Fehler beim Leeren von "${entityId}": ${error.message}`
            );
          }
        }
        // Setze Timer auch wenn keine Daten vorhanden waren
        this._writeLockTimer = setTimeout(() => {
          this._isWriting = false;
          this._writeLockTimer = null;
          this._debug(
            '[Speichern] distributeDataToEntities: Schreib-Lock nach 5 Sekunden entfernt (keine Daten)'
          );
        }, 5000);
        return;
      }

      // Verteile die Daten zeichenweise auf die Entities (umgekehrt zum Einlesen)
      // Wir haben einen Datenstring über alles und schreiben nur so viele Zeichen wie aufgenommen werden können
      const entityValues = {};
      let currentEntityIndex = 0;
      let remainingData = serializedData;

      // Verteile die Daten auf die verfügbaren Entities
      while (remainingData.length > 0 && currentEntityIndex < allEntityIds.length) {
        const currentEntityId = allEntityIds[currentEntityIndex];
        const maxLength = maxLengths[currentEntityId];

        // Nimm so viele Zeichen wie möglich aus remainingData
        const charsToTake = Math.min(remainingData.length, maxLength);
        const valueToWrite = remainingData.substring(0, charsToTake);

        entityValues[currentEntityId] = valueToWrite;
        remainingData = remainingData.substring(charsToTake);

        // Wenn noch Daten übrig sind, wechsle zur nächsten Entity
        if (remainingData.length > 0) {
          currentEntityIndex++;
        }
      }

      // Wenn am Ende noch Text über ist, prüfe ob zwischenzeitlich eine zusätzliche Entität angelegt wurde
      if (remainingData.length > 0) {
        // Prüfe ob neue Entities hinzugekommen sind
        const currentAdditionalEntities = this.findAdditionalEntities(this._config.entity);
        const knownAdditionalCount = this._knownEntityIds ? this._knownEntityIds.length - 1 : 0; // -1 für Haupt-Entity

        if (currentAdditionalEntities.length > knownAdditionalCount) {
          // Neue Entities gefunden
          const newEntities = currentAdditionalEntities.slice(knownAdditionalCount);

          // Aktualisiere die Liste
          allEntityIds.push(...newEntities);
          this._knownEntityIds = [...allEntityIds];

          // Ermittle max-Längen für neue Entities
          for (const newEntityId of newEntities) {
            const maxLength = this.getEntityMaxLength(newEntityId);
            if (maxLength !== null) {
              maxLengths[newEntityId] = maxLength;
            } else {
              maxLengths[newEntityId] = 255;
            }
          }

          // Verteile die verbleibenden Daten auf die neuen Entities
          currentEntityIndex = allEntityIds.length - newEntities.length;
          while (remainingData.length > 0 && currentEntityIndex < allEntityIds.length) {
            const currentEntityId = allEntityIds[currentEntityIndex];
            const maxLength = maxLengths[currentEntityId];

            const charsToTake = Math.min(remainingData.length, maxLength);
            const valueToWrite = remainingData.substring(0, charsToTake);

            entityValues[currentEntityId] = valueToWrite;
            remainingData = remainingData.substring(charsToTake);

            if (remainingData.length > 0) {
              currentEntityIndex++;
            }
          }
        } else {
        }
      }

      // Schreibe die Werte in die Entities (sequenziell, um sicherzustellen, dass alle Calls abgeschlossen sind)
      this._debug(
        `[Speichern] distributeDataToEntities: Schreibe in ${allEntityIds.length} Entities`
      );
      for (const entityId of allEntityIds) {
        const value = entityValues[entityId] || '';
        const maxLength = maxLengths[entityId];

        // Der Wert sollte nie die maximale Länge überschreiten, da wir zeichenweise verteilen
        if (value.length > maxLength) {
          // Kürze den Wert auf die maximale Länge (als Notfall-Lösung)
          const truncatedValue = value.substring(0, maxLength);
          this._debug(
            `[Speichern] distributeDataToEntities: Schreibe in "${entityId}" (gekürzt von ${value.length} auf ${truncatedValue.length} Zeichen)`
          );
          try {
            await this._hass.callService('input_text', 'set_value', {
              entity_id: entityId,
              value: truncatedValue,
            });
            this._debug(
              `[Speichern] distributeDataToEntities: Erfolgreich in "${entityId}" geschrieben`
            );
          } catch (error) {
            this._debug(
              `[Speichern] distributeDataToEntities: Fehler beim Schreiben in "${entityId}": ${error.message}`
            );
          }
        } else {
          this._debug(
            `[Speichern] distributeDataToEntities: Schreibe in "${entityId}" (${value.length} Zeichen)`
          );
          try {
            await this._hass.callService('input_text', 'set_value', {
              entity_id: entityId,
              value: value,
            });
            this._debug(
              `[Speichern] distributeDataToEntities: Erfolgreich in "${entityId}" geschrieben`
            );
          } catch (error) {
            this._debug(
              `[Speichern] distributeDataToEntities: Fehler beim Schreiben in "${entityId}": ${error.message}`
            );
          }
        }
      }

      // Leere alle zusätzlichen Entities, die nicht verwendet wurden (um alte Daten zu entfernen)
      // Wir müssen alle bekannten zusätzlichen Entities prüfen, nicht nur die in allEntityIds
      const allAdditionalEntities = this.findAdditionalEntities(this._config.entity);
      this._debug(
        `[Speichern] distributeDataToEntities: Prüfe ${allAdditionalEntities.length} zusätzliche Entities zum Leeren`
      );
      for (const additionalEntityId of allAdditionalEntities) {
        // Wenn diese Entity nicht in entityValues ist, bedeutet das, dass sie nicht verwendet wurde
        if (!(additionalEntityId in entityValues)) {
          this._debug(
            `[Speichern] distributeDataToEntities: Leere nicht verwendete Entity "${additionalEntityId}"`
          );
          try {
            await this._hass.callService('input_text', 'set_value', {
              entity_id: additionalEntityId,
              value: '',
            });
            this._debug(
              `[Speichern] distributeDataToEntities: Entity "${additionalEntityId}" erfolgreich geleert`
            );
          } catch (error) {
            this._debug(
              `[Speichern] distributeDataToEntities: Fehler beim Leeren von "${additionalEntityId}": ${error.message}`
            );
          }
        }
      }

      // Wenn noch Daten übrig sind, die nicht gespeichert werden konnten
      if (remainingData.length > 0) {
        this._debug(
          `[Speichern] distributeDataToEntities: WARNUNG - ${remainingData.length} Zeichen konnten nicht gespeichert werden!`
        );
      }
    } catch (error) {
      this._debug(
        `[Speichern] distributeDataToEntities: Fehler beim Verteilen der Daten: ${error.message}`,
        error
      );
    } finally {
      // Schreib-Lock für weitere 5 Sekunden aufrechterhalten (um sicherzustellen, dass alle Updates verarbeitet wurden)
      this._writeLockTimer = setTimeout(() => {
        this._isWriting = false;
        this._writeLockTimer = null;
        this._debug('[Speichern] distributeDataToEntities: Schreib-Lock nach 5 Sekunden entfernt');
      }, 5000);
      this._debug(
        '[Speichern] distributeDataToEntities: Abgeschlossen, Schreib-Lock wird in 5 Sekunden entfernt'
      );
    }
  }

  async toggleDay(month, day, year = null) {
    // Stelle sicher, dass month und day Zahlen sind
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);

    if (isNaN(monthNum) || isNaN(dayNum)) {
      return;
    }

    // Prüfe ob dieser Monat der Vormonat ist (schreibgeschützt)
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYearFull = now.getFullYear();
    const currentYear = currentYearFull % 100;

    // Bestimme das Jahr (Kurzform, z.B. 25 für 2025)
    if (!year) {
      year = currentYear;
    }
    const yearNum = parseInt(year);

    let isPreviousMonth = false;
    if (currentMonth === 1) {
      // Aktuell ist Januar, Vormonat ist Dezember des Vorjahres
      isPreviousMonth = monthNum === 12 && yearNum === (currentYearFull - 1) % 100;
    } else {
      // Vormonat ist aktueller Monat - 1 im gleichen Jahr
      isPreviousMonth = monthNum === currentMonth - 1 && yearNum === currentYear;
    }

    if (isPreviousMonth) {
      return;
    }

    if (!this._hass || !this._config || !this._config.entity) {
      return;
    }

    // yearNum wurde bereits oben deklariert
    const key = `${this.formatTwoDigits(yearNum)}:${this.formatTwoDigits(monthNum)}`;

    // Stelle sicher, dass die Struktur ein Objekt ist (nicht Array)
    if (!this._workingDays[key] || Array.isArray(this._workingDays[key])) {
      this._workingDays[key] = {};
    }

    // Hole das ausgewählte Kalender-Shortcut
    const selectedCalendarShortcut = this._getSelectedCalendarShortcut();

    if (!selectedCalendarShortcut) {
      // Kein Kalender ausgewählt - kann nicht togglen
      return;
    }

    // Tag mit Kalender
    if (!this._workingDays[key][dayNum]) {
      this._workingDays[key][dayNum] = [];
    }

    // WICHTIG: Erstelle eine Kopie des Arrays, um sicherzustellen, dass wir mit dem richtigen Array arbeiten
    const elements = [...(this._workingDays[key][dayNum] || [])];

    const elementIndex = elements.indexOf(selectedCalendarShortcut);

    // MARKIERE BUTTON ALS "WIRD DIREKT AKTUALISIERT" BEVOR _workingDays GEÄNDERT WIRD
    // Dies verhindert, dass Lit ein Update auslöst, während wir direkt manipulieren
    const buttonKey = `${yearNum}:${monthNum}:${dayNum}`;
    this._directDOMUpdateInProgress.add(buttonKey);

    let finalElements = [];

    if (elementIndex > -1) {
      // Kalender entfernen
      elements.splice(elementIndex, 1);
      // Speichere die finalen Elemente BEVOR wir möglicherweise den Monat löschen
      finalElements = elements;
      // Wenn keine Kalender mehr vorhanden sind, entferne den Tag
      if (elements.length === 0) {
        delete this._workingDays[key][dayNum];
        // Wenn keine Tage mehr vorhanden sind, entferne den Monat
        if (Object.keys(this._workingDays[key]).length === 0) {
          delete this._workingDays[key];
        }
      } else {
        // Aktualisiere das Array im _workingDays
        this._workingDays[key][dayNum] = elements;
      }
    } else {
      // Kalender hinzufügen (nur wenn noch nicht vorhanden)
      if (!elements.includes(selectedCalendarShortcut)) {
        elements.push(selectedCalendarShortcut);
        // Aktualisiere das Array im _workingDays
        this._workingDays[key][dayNum] = elements;
      }
      // Speichere die finalen Elemente
      finalElements =
        this._workingDays[key] && this._workingDays[key][dayNum]
          ? this._workingDays[key][dayNum]
          : elements;
    }

    // OPTIMIERUNG: Direkte DOM-Manipulation statt komplettes Re-Rendering
    // Verwende die finalen elements (bereits vor dem möglichen Löschen gespeichert)
    this._updateDayButtonDirectly(monthNum, dayNum, yearNum, key, finalElements);

    // OPTIMIERUNG: Debounced Speichern - warte nach dem letzten Klick, bevor gespeichert wird
    this._scheduleDebouncedSave();
  }

  // Plant ein debounced Speichern der Daten
  _scheduleDebouncedSave() {
    // Lese Debounce-Zeit aus der Config (Standard: 300ms)
    const debounceTime = this._getSaveDebounceTime();

    // Wenn Debounce-Zeit 0 ist, speichere sofort
    if (debounceTime === 0) {
      this._saveToHA();
      return;
    }

    // Lösche vorhandenen Timer
    if (this._saveDebounceTimer) {
      clearTimeout(this._saveDebounceTimer);
      this._saveDebounceTimer = null;
    }

    // Setze neuen Timer
    this._saveDebounceTimer = setTimeout(() => {
      this._saveDebounceTimer = null;
      this._saveToHA();
    }, debounceTime);
  }

  // Speichert die Daten asynchron in Home Assistant
  async _saveToHA() {
    try {
      this._debug('[Speichern] _saveToHA: Start');
      const serializedData = this.serializeWorkingDays();
      this._debug(
        `[Speichern] _saveToHA: Daten serialisiert, Länge: ${serializedData.length} Zeichen, store_mode: "${this._config.store_mode}"`
      );

      // Unterschiedliche Speicherung je nach store_mode
      if (this._config.store_mode === 'saver') {
        // Saver-Modus: Schreibe direkt in Saver-Variable
        this._debug('[Speichern] _saveToHA: Speichere in Saver');
        await this._saveDataToSaver(serializedData);
      } else {
        // text_entity-Modus: Verteile die Daten auf mehrere Entities, falls nötig
        this._debug('[Speichern] _saveToHA: Speichere in Entities');
        await this.distributeDataToEntities(serializedData);
      }

      // Prüfe Speicherverbrauch nach dem Toggle (nur bei text_entity)
      // Verwende die Länge der serialisierten Daten, da die States noch nicht aktualisiert sind
      if (this._config.store_mode !== 'saver') {
        this.checkStorageUsage(serializedData.length);
      }
      this._debug('[Speichern] _saveToHA: Erfolgreich abgeschlossen');
    } catch (error) {
      this._debug(`[Speichern] _saveToHA: Fehler beim Speichern: ${error.message}`, error);
      console.error('[TG Schichtplan] Fehler beim Speichern:', error);
      // Optional: Hier könnte man eine Fehlermeldung anzeigen
    }
  }

  // Speichert Daten in den Saver
  async _saveDataToSaver(serializedData) {
    if (!this._hass || !this._config || !this._config.saver_key) {
      this._debug('[Speichern] _saveDataToSaver: Kein hass, config oder saver_key vorhanden');
      return;
    }

    const saverKey = this._config.saver_key || 'Schichtplan';
    this._debug(
      `[Speichern] _saveDataToSaver: Start, saver_key: "${saverKey}", Datenlänge: ${serializedData.length} Zeichen`
    );

    try {
      // Prüfe ob die Saver-Variable existiert und ob sich der Wert geändert hat
      // Saver-Variablen sind in saver.saver.attributes.variables gespeichert
      const saverEntity = this._hass.states['saver.saver'];
      let oldValue = '';

      if (saverEntity && saverEntity.attributes && saverEntity.attributes.variables) {
        const existingValue = saverEntity.attributes.variables[saverKey];
        if (existingValue !== undefined && existingValue !== null) {
          oldValue = String(existingValue).trim();
        }
      }

      this._debug(
        `[Speichern] _saveDataToSaver: Saver-Variable "${saverKey}" existiert: ${oldValue !== ''}, alte Länge: ${oldValue.length} Zeichen`
      );

      // Nur schreiben wenn Variable nicht existiert oder Wert sich geändert hat
      if (oldValue === '' || oldValue !== serializedData) {
        this._debug(
          `[Speichern] _saveDataToSaver: Schreibe in Saver (Variable existiert nicht oder Wert hat sich geändert)`
        );
        await this._hass.callService('saver', 'set_variable', {
          name: saverKey,
          value: serializedData || '',
        });
        this._debug(`[Speichern] _saveDataToSaver: Erfolgreich in Saver geschrieben`);
      } else {
        this._debug(
          `[Speichern] _saveDataToSaver: Kein Schreiben nötig, Wert hat sich nicht geändert`
        );
      }
    } catch (error) {
      // Fehler beim Schreiben in Saver - Fallback zu Entities
      this._debug(
        `[Speichern] _saveDataToSaver: Fehler beim Schreiben in Saver, Fallback zu Entities: ${error.message}`,
        error
      );
      console.warn('[TG Schichtplan] Fehler beim Schreiben in Saver, Fallback zu Entities:', error);
      await this.distributeDataToEntities(serializedData);
    }
  }

  // Liest die Debounce-Zeit aus der Config
  _getSaveDebounceTime() {
    // Versuche aus Config zu lesen
    if (this._config && typeof this._config.saveDebounceTime === 'number') {
      return Math.max(0, this._config.saveDebounceTime); // Mindestens 0
    }

    // Fallback: Verwende Standard-Wert aus card-config.js
    return SaveDebounceTime || 300; // Standard: 300ms
  }

  // Aktualisiert einen einzelnen Button direkt im DOM ohne komplettes Re-Rendering
  _updateDayButtonDirectly(monthNum, dayNum, yearNum, key, dayElements) {
    if (!this.shadowRoot) {
      // Shadow DOM noch nicht bereit, Fallback zu requestUpdate
      this.requestUpdate();
      return;
    }

    // Button sollte bereits in _directDOMUpdateInProgress sein (wurde in toggleDay gesetzt)
    // Falls nicht, füge ihn hinzu (Fallback für direkte Aufrufe)
    const buttonKey = `${yearNum}:${monthNum}:${dayNum}`;
    if (!this._directDOMUpdateInProgress.has(buttonKey)) {
      this._directDOMUpdateInProgress.add(buttonKey);
    }

    // Finde den Button im DOM
    const button = this.shadowRoot.querySelector(
      `button[data-month="${monthNum}"][data-day="${dayNum}"][data-year="${yearNum}"]`
    );

    if (!button) {
      // Button nicht gefunden, Fallback zu requestUpdate
      this._directDOMUpdateInProgress.delete(buttonKey);
      this.requestUpdate();
      return;
    }

    // Berechne die neuen Werte für diesen Button
    const selectedShortcut = this._getSelectedCalendarShortcut();
    const hasSelectedShift = selectedShortcut && dayElements.includes(selectedShortcut);
    const selectedCalendar = this._getCalendarByShortcut(selectedShortcut);

    // Finde die erste aktivierte Schicht
    let firstActiveShift = null;
    const shiftOrder = ['a', 'b', 'c', 'd', 'e'];
    for (const shortcut of shiftOrder) {
      if (dayElements.includes(shortcut)) {
        const calendar = this._getCalendarByShortcut(shortcut);
        if (calendar && calendar.enabled) {
          firstActiveShift = shortcut;
          break;
        }
      }
    }

    // Bestimme welche Schicht den Tag färben soll
    let activeShiftForColor = null;
    if (hasSelectedShift && selectedCalendar && selectedCalendar.enabled) {
      activeShiftForColor = selectedShortcut;
    } else if (firstActiveShift) {
      activeShiftForColor = firstActiveShift;
    }

    const isWorking = activeShiftForColor !== null;

    // Aktualisiere CSS-Klasse
    if (isWorking) {
      button.classList.add('working');
    } else {
      button.classList.remove('working');
    }

    // Aktualisiere Hintergrundfarbe
    if (activeShiftForColor) {
      const activeCalendar = this._getCalendarByShortcut(activeShiftForColor);
      if (activeCalendar && activeCalendar.color) {
        button.style.backgroundColor = activeCalendar.color;
      } else {
        button.style.backgroundColor = '';
      }
    } else {
      button.style.backgroundColor = '';
    }

    // Aktualisiere Shift-Indikatoren
    // Entferne zuerst alle vorhandenen Container und Indikatoren
    const existingContainer = button.querySelector('.shifts-container');
    if (existingContainer) {
      existingContainer.remove();
    }

    // Erstelle neue Indikatoren für alle Schichten außer der, die den Tag färbt
    const shiftIndicators = dayElements
      .filter(shortcut => shortcut !== activeShiftForColor)
      .map(shortcut => {
        const calendar = this._getCalendarByShortcut(shortcut);
        if (calendar && calendar.enabled && calendar.color) {
          const indicator = document.createElement('span');
          indicator.className = 'shift-indicator';
          indicator.style.backgroundColor = calendar.color;
          indicator.title = calendar.name || `Schicht ${shortcut.toUpperCase()}`;
          return indicator;
        }
        return null;
      })
      .filter(indicator => indicator !== null);

    // Füge Indikatoren nur hinzu, wenn welche vorhanden sind
    if (shiftIndicators.length > 0) {
      const container = document.createElement('div');
      container.className = 'shifts-container';
      // Markiere Container als manuell erstellt, damit das Template sie nicht überschreibt
      container.setAttribute('data-manual-update', 'true');
      shiftIndicators.forEach(ind => container.appendChild(ind));
      button.appendChild(container);
    }

    // Entferne Markierung nach Abschluss der direkten DOM-Manipulation
    // Verzögert, damit Lit-Updates, die durch _workingDays-Änderung ausgelöst werden, übersprungen werden können
    setTimeout(() => {
      this._directDOMUpdateInProgress.delete(buttonKey);
    }, 100); // Länger warten, damit Lit-Updates abgeschlossen sind
  }

  getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
  }

  getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }

  getMonthName(month) {
    const months = [
      'Januar',
      'Februar',
      'März',
      'April',
      'Mai',
      'Juni',
      'Juli',
      'August',
      'September',
      'Oktober',
      'November',
      'Dezember',
    ];
    return months[month];
  }

  /**
   * Rendert einen einzelnen Tag-Button für den Kalender
   * @param {number} currentDay - Der Tag (1-31)
   * @param {number} monthKey - Der Monat (1-12)
   * @param {number} yearKey - Das Jahr in Kurzform (z.B. 25 für 2025)
   * @param {string} key - Der Schlüssel für diesen Monat (z.B. "25:11")
   * @param {number[]} workingDays - Array der Arbeitstage für diesen Monat
   * @param {boolean} isPreviousMonth - Ob dieser Monat der Vormonat ist (schreibgeschützt)
   * @param {number} year - Das vollständige Jahr
   * @param {number} month - Der Monat (0-11)
   * @returns {TemplateResult} HTML-Template für den Tag-Button
   */
  renderDay(currentDay, monthKey, yearKey, key, workingDays, isPreviousMonth, year, month) {
    const now = new Date();
    const today = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const dayElements = this._getDayElements(key, currentDay);
    const isToday = year === currentYear && month === currentMonth && currentDay === today;

    // Prüfe ob der ausgewählte Kalender an diesem Tag aktiv ist
    const selectedShortcut = this._getSelectedCalendarShortcut();
    const hasSelectedShift = selectedShortcut && dayElements.includes(selectedShortcut);
    const selectedCalendar = this._getCalendarByShortcut(selectedShortcut);
    let buttonStyle = '';

    // Finde die erste aktivierte Schicht (in der Reihenfolge a, b, c, d, e)
    // die an diesem Tag aktiv ist
    let firstActiveShift = null;
    const shiftOrder = ['a', 'b', 'c', 'd', 'e'];
    for (const shortcut of shiftOrder) {
      if (dayElements.includes(shortcut)) {
        const calendar = this._getCalendarByShortcut(shortcut);
        if (calendar && calendar.enabled) {
          firstActiveShift = shortcut;
          break;
        }
      }
    }

    // Bestimme welche Schicht den Tag färben soll
    let activeShiftForColor = null;
    if (hasSelectedShift && selectedCalendar && selectedCalendar.enabled) {
      // Wenn der ausgewählte Kalender aktiv ist, verwende diesen
      activeShiftForColor = selectedShortcut;
    } else if (firstActiveShift) {
      // Ansonsten verwende die erste aktivierte Schicht
      activeShiftForColor = firstActiveShift;
    }

    // isWorking ist true, wenn eine Schicht den Tag färbt
    const isWorking = activeShiftForColor !== null;

    // Verwende die Farbe der aktiven Schicht
    if (activeShiftForColor) {
      const activeCalendar = this._getCalendarByShortcut(activeShiftForColor);
      if (activeCalendar && activeCalendar.color) {
        buttonStyle = `background-color: ${activeCalendar.color};`;
      }
    }

    // Prüfe ob es ein Wochenende oder Feiertag ist
    const isWeekend = this._isWeekend(year, month, currentDay);
    const isHoliday = this._isHoliday(year, month, currentDay);

    // Erstelle visuelle Darstellung der Kalender (alle außer der Schicht, die den Tag färbt)
    // Nur aktivierte Kalender werden angezeigt
    const shiftIndicators = dayElements
      .filter(shortcut => shortcut !== activeShiftForColor) // Filtere die Schicht heraus, die den Tag färbt
      .map(shortcut => {
        const calendar = this._getCalendarByShortcut(shortcut);
        // Nur anzeigen, wenn der Kalender aktiviert ist
        if (calendar && calendar.enabled && calendar.color) {
          return html`
            <span
              class="shift-indicator"
              style="background-color: ${calendar.color};"
              title="${calendar.name || `Schicht ${shortcut.toUpperCase()}`}"
            >
            </span>
          `;
        }
        return null; // Nicht anzeigen, wenn Kalender deaktiviert ist
      })
      .filter(indicator => indicator !== null); // Entferne null-Werte

    return html`
      <td>
        <button
          class="day-button ${isWorking ? 'working' : ''} ${isToday
            ? 'today'
            : ''} ${isPreviousMonth ? 'readonly' : ''} ${isWeekend ? 'weekend' : ''} ${isHoliday
            ? 'holiday'
            : ''}"
          style="${buttonStyle}"
          @click=${e => {
            if (!isPreviousMonth) {
              this.toggleDay(monthKey, currentDay, yearKey);
              // Entferne Fokus nach Klick (wichtig für mobile Geräte)
              // Setze Fokus explizit auf die Karte selbst
              setTimeout(() => {
                e.target.blur();
                // Setze Fokus auf das Hauptcontainer-Element der Karte
                if (this.shadowRoot) {
                  const wrapper = this.shadowRoot.querySelector('.calendar-wrapper');
                  if (wrapper) {
                    // Stelle sicher, dass das Element fokussierbar ist
                    if (!wrapper.hasAttribute('tabindex')) {
                      wrapper.setAttribute('tabindex', '-1');
                    }
                    wrapper.focus();
                  } else {
                    // Fallback: Setze Fokus auf die Komponente selbst
                    if (this.focus) {
                      this.focus();
                    }
                  }
                }
              }, 0);
            }
          }}
          ?disabled=${isPreviousMonth}
          data-month="${monthKey}"
          data-day="${currentDay}"
          data-year="${yearKey}"
        >
          <span class="day-number">${currentDay}</span>
          ${(() => {
            // Prüfe ob dieser Button bereits manuell aktualisiert wurde
            // Wenn ja, rendere keine Indikatoren (werden per direkter DOM-Manipulation verwaltet)
            const buttonKey = `${yearKey}:${monthKey}:${currentDay}`;
            if (this._directDOMUpdateInProgress && this._directDOMUpdateInProgress.has(buttonKey)) {
              return '';
            }
            // Prüfe auch, ob im DOM bereits ein manuell erstellter Container existiert
            if (this.shadowRoot) {
              const existingButton = this.shadowRoot.querySelector(
                `button[data-month="${monthKey}"][data-day="${currentDay}"][data-year="${yearKey}"]`
              );
              if (
                existingButton &&
                existingButton.querySelector('.shifts-container[data-manual-update="true"]')
              ) {
                return '';
              }
            }
            return shiftIndicators.length > 0
              ? html`<div class="shifts-container">${shiftIndicators}</div>`
              : '';
          })()}
        </button>
      </td>
    `;
  }

  renderMonth(year, month) {
    const daysInMonth = this.getDaysInMonth(year, month);
    const firstDay = this.getFirstDayOfMonth(year, month);
    const firstDayMonday = (firstDay + 6) % 7;

    const monthKey = month + 1;
    const yearKey = year % 100; // Kurzform, z.B. 25 für 2025
    const key = `${this.formatTwoDigits(yearKey)}:${this.formatTwoDigits(monthKey)}`;

    // Hole alle Tage für diesen Monat (neue Struktur: {day: [elements]})
    let workingDays = [];
    if (this._workingDays[key]) {
      if (Array.isArray(this._workingDays[key])) {
        // Kompatibilität: Altes Format [days]
        workingDays = this._workingDays[key].map(d => parseInt(d)).filter(d => !isNaN(d));
      } else if (typeof this._workingDays[key] === 'object') {
        // Neue Struktur: {day: [elements]}
        workingDays = Object.keys(this._workingDays[key])
          .map(d => parseInt(d))
          .filter(d => !isNaN(d));
      }
    }

    const now = new Date();
    const today = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Prüfe ob dieser Monat der Vormonat ist (schreibgeschützt)
    let isPreviousMonth = false;
    if (currentMonth === 0) {
      // Aktuell ist Januar, Vormonat ist Dezember des Vorjahres
      isPreviousMonth = month === 11 && year === currentYear - 1;
    } else {
      // Vormonat ist aktueller Monat - 1 im gleichen Jahr
      isPreviousMonth = month === currentMonth - 1 && year === currentYear;
    }

    const rows = [];
    let day = 1;

    // Erste Woche
    const firstDate = new Date(year, month, 1);
    const weekNumber = this.getWeekNumber(firstDate);
    const firstRowCells = [html`<td class="week-label">${weekNumber}</td>`];

    for (let i = 0; i < firstDayMonday; i++) {
      firstRowCells.push(html`<td></td>`);
    }

    for (let i = firstDayMonday; i < 7 && day <= daysInMonth; i++) {
      firstRowCells.push(
        this.renderDay(day, monthKey, yearKey, key, workingDays, isPreviousMonth, year, month)
      );
      day++;
    }
    rows.push(
      html`<tr>
        ${firstRowCells}
      </tr>`
    );

    // Weitere Wochen
    while (day <= daysInMonth) {
      const date = new Date(year, month, day);
      const weekNum = this.getWeekNumber(date);
      const rowCells = [html`<td class="week-label">${weekNum}</td>`];

      // Rendere immer 7 Zellen pro Woche (Tage oder leere Zellen)
      for (let i = 0; i < 7; i++) {
        if (day <= daysInMonth) {
          rowCells.push(
            this.renderDay(day, monthKey, yearKey, key, workingDays, isPreviousMonth, year, month)
          );
          day++;
        } else {
          // Leere Zelle am Ende der letzten Woche
          rowCells.push(html`<td></td>`);
        }
      }
      rows.push(
        html`<tr>
          ${rowCells}
        </tr>`
      );
    }

    return html`
      <div class="month-container">
        <div class="month-header">${this.getMonthName(month)} ${year}</div>
        <table class="calendar-table">
          <thead>
            <tr>
              <th class="week-label">KW</th>
              <th>Mo</th>
              <th>Di</th>
              <th>Mi</th>
              <th>Do</th>
              <th>Fr</th>
              <th>Sa</th>
              <th>So</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  }

  changeDisplayedMonths(delta) {
    const maxMonths = this._config?.numberOfMonths || 14;
    const newValue = Math.max(1, Math.min(maxMonths, (this._displayedMonths || 2) + delta));
    if (newValue !== this._displayedMonths) {
      this._displayedMonths = newValue;
      this.requestUpdate();
    }
  }

  changeStartMonth(delta) {
    const maxMonths = this._config?.numberOfMonths || 14;
    const displayedMonths = this._displayedMonths || 2;
    const currentOffset = this._startMonthOffset || 0;

    // Berechne die Grenzen für die Navigation
    // Minimum: -1 (Vormonat)
    // Maximum: maxMonths - displayedMonths (damit der letzte angezeigte Monat nicht über maxMonths hinausgeht)
    const minOffset = -1;
    const maxOffset = maxMonths - displayedMonths;

    const newOffset = Math.max(minOffset, Math.min(maxOffset, currentOffset + delta));

    if (newOffset !== currentOffset) {
      this._startMonthOffset = newOffset;
      this.requestUpdate();
    }
  }

  getNavigationBounds() {
    const maxMonths = this._config?.numberOfMonths || 14;
    const displayedMonths = this._displayedMonths || 2;
    const currentOffset = this._startMonthOffset || 0;

    const minOffset = -1;
    const maxOffset = maxMonths - displayedMonths;

    return {
      canGoBack: currentOffset > minOffset,
      canGoForward: currentOffset < maxOffset,
    };
  }

  _getSelectedCalendarShortcut() {
    // Gibt den Shortcut des ausgewählten Kalenders zurück

    // Prüfe zuerst _selectedCalendar
    if (
      this._selectedCalendar !== null &&
      this._selectedCalendar !== undefined &&
      this._selectedCalendar !== ''
    ) {
      return this._selectedCalendar;
    }

    // Falls _selectedCalendar nicht gesetzt ist, prüfe die Config
    if (this._config?.selectedCalendar) {
      this._selectedCalendar = this._config.selectedCalendar;
      return this._selectedCalendar;
    }

    // Fallback: Verwende den ersten aktivierten Kalender
    const allCalendars = this._getAllCalendars();
    if (allCalendars.length > 0) {
      return allCalendars[0].shortcut;
    }
    // Wenn kein Kalender aktiviert ist, gibt es keinen Fallback
    return null;
  }

  _getCalendarByShortcut(shortcut) {
    // Gibt das Kalender-Objekt für einen gegebenen Shortcut zurück
    if (!this._config?.calendars) {
      return null;
    }

    return this._config.calendars.find(cal => cal.shortcut === shortcut) || null;
  }

  _getAllCalendars() {
    // Gibt nur aktivierte Kalender zurück
    if (!this._config?.calendars) {
      return [];
    }

    // Filtere nur aktivierte Kalender und sortiere nach Shortcut (a, b, c, d, e)
    return this._config.calendars
      .filter(
        cal =>
          cal &&
          cal.shortcut &&
          (cal.enabled === true || cal.enabled === 'true' || cal.enabled === 1)
      )
      .sort((a, b) => a.shortcut.localeCompare(b.shortcut));
  }

  _getSelectedCalendarValue() {
    const allCalendars = this._getAllCalendars();

    if (allCalendars.length === 0) {
      // Wenn keine Kalender aktiviert sind, gibt es keinen ausgewählten Kalender
      if (this._selectedCalendar !== null) {
        this._selectedCalendar = null;
        if (this._config) {
          this._config.selectedCalendar = null;
        }
        this.requestUpdate();
      }
      return null;
    }

    // Wenn _selectedCalendar noch nicht gesetzt ist, setze es auf den ersten aktivierten Kalender
    if (this._selectedCalendar === null || this._selectedCalendar === undefined) {
      this._selectedCalendar = allCalendars[0].shortcut;
      // Speichere es auch in der Config
      if (this._config) {
        this._config.selectedCalendar = this._selectedCalendar;
      }
      // Aktualisiere die Ansicht
      this.requestUpdate();
      return this._selectedCalendar;
    }

    // Prüfe ob der ausgewählte Kalender aktiviert ist
    const exists = allCalendars.some(cal => cal.shortcut === this._selectedCalendar);
    if (!exists) {
      // Wenn der ausgewählte Kalender nicht aktiviert ist, verwende den ersten aktivierten
      this._selectedCalendar = allCalendars[0].shortcut;
      if (this._config) {
        this._config.selectedCalendar = this._selectedCalendar;
      }
      this.requestUpdate();
      return this._selectedCalendar;
    }

    return this._selectedCalendar;
  }

  _onCalendarSelectedByIndex(shortcut) {
    if (shortcut !== '' && shortcut !== null && shortcut !== undefined) {
      this._selectedCalendar = shortcut;

      // Aktualisiere die Config mit der neuen Auswahl
      if (this._config) {
        this._config = {
          ...this._config,
          selectedCalendar: shortcut,
        };

        // Dispatch config-changed Event, damit die Card die Config aktualisiert
        // (nur wenn nicht initialer Load)
        if (!this._isInitialLoad) {
          this.dispatchEvent(
            new CustomEvent('config-changed', {
              detail: { config: this._config },
              bubbles: true,
              composed: true,
            })
          );
          // Speichere die Config in die Entity (nur bei Benutzeraktionen)
          this.saveConfigToEntity();
        }
      }

      // Aktualisiere alle Buttons, die die neue aktive Schicht haben
      // Dies ist notwendig, um die Hintergrundfarben und Indikatoren korrekt zu aktualisieren
      // (z.B. wenn Tag 2 die Schicht "a" hat und wir zu "a" wechseln, sollte Tag 2 orange werden)
      // ABER: Nur wenn es sich nicht um den initialen Load handelt UND die Daten bereits geladen sind
      // Beim initialen Load werden die Buttons bereits korrekt durch Lit gerendert
      if (
        !this._isInitialLoad &&
        this.shadowRoot &&
        this._workingDays &&
        Object.keys(this._workingDays).length > 0
      ) {
        // Verwende setTimeout, um sicherzustellen, dass _selectedCalendar bereits aktualisiert wurde
        setTimeout(() => {
          this._updateAllDayButtonsForCalendarChange();
        }, 0);
      }
    }
  }

  // Aktualisiert alle Tag-Buttons nach Kalender-Auswahl (nur Farben/Klassen, kein komplettes Re-Rendering)
  _updateAllDayButtonsForCalendarChange() {
    if (!this.shadowRoot) return;

    const buttons = this.shadowRoot.querySelectorAll('button.day-button');
    const selectedShortcut = this._getSelectedCalendarShortcut();
    const selectedCalendar = this._getCalendarByShortcut(selectedShortcut);

    buttons.forEach(button => {
      const monthKey = button.getAttribute('data-month');
      const dayNum = parseInt(button.getAttribute('data-day'));
      const yearKey = button.getAttribute('data-year');

      if (!monthKey || !dayNum || !yearKey) return;

      const key = `${yearKey}:${monthKey}`;
      const dayElements = this._getDayElements(key, dayNum);
      const hasSelectedShift = selectedShortcut && dayElements.includes(selectedShortcut);

      // Finde die erste aktivierte Schicht
      let firstActiveShift = null;
      const shiftOrder = ['a', 'b', 'c', 'd', 'e'];
      for (const shortcut of shiftOrder) {
        if (dayElements.includes(shortcut)) {
          const calendar = this._getCalendarByShortcut(shortcut);
          if (calendar && calendar.enabled) {
            firstActiveShift = shortcut;
            break;
          }
        }
      }

      // Bestimme welche Schicht den Tag färben soll
      let activeShiftForColor = null;
      if (hasSelectedShift && selectedCalendar && selectedCalendar.enabled) {
        activeShiftForColor = selectedShortcut;
      } else if (firstActiveShift) {
        activeShiftForColor = firstActiveShift;
      }

      const isWorking = activeShiftForColor !== null;

      // Aktualisiere CSS-Klasse
      if (isWorking) {
        button.classList.add('working');
      } else {
        button.classList.remove('working');
      }

      // Aktualisiere Hintergrundfarbe
      if (activeShiftForColor) {
        const activeCalendar = this._getCalendarByShortcut(activeShiftForColor);
        if (activeCalendar && activeCalendar.color) {
          button.style.backgroundColor = activeCalendar.color;
        } else {
          button.style.backgroundColor = '';
        }
      } else {
        button.style.backgroundColor = '';
      }

      // Aktualisiere Shift-Indikatoren (ähnlich wie in _updateDayButtonDirectly)
      // Entferne zuerst alle vorhandenen Container und Indikatoren
      const existingContainer = button.querySelector('.shifts-container');
      if (existingContainer) {
        existingContainer.remove();
      }

      const shiftIndicators = dayElements
        .filter(shortcut => shortcut !== activeShiftForColor)
        .map(shortcut => {
          const calendar = this._getCalendarByShortcut(shortcut);
          if (calendar && calendar.enabled && calendar.color) {
            const indicator = document.createElement('span');
            indicator.className = 'shift-indicator';
            indicator.style.backgroundColor = calendar.color;
            indicator.title = calendar.name || `Schicht ${shortcut.toUpperCase()}`;
            return indicator;
          }
          return null;
        })
        .filter(indicator => indicator !== null);

      // Füge Indikatoren nur hinzu, wenn welche vorhanden sind
      if (shiftIndicators.length > 0) {
        const container = document.createElement('div');
        container.className = 'shifts-container';
        // Markiere Container als manuell erstellt, damit das Template sie nicht überschreibt
        container.setAttribute('data-manual-update', 'true');
        shiftIndicators.forEach(ind => container.appendChild(ind));
        button.appendChild(container);
      }
      // Wenn keine Indikatoren vorhanden sind, wurde der Container bereits oben entfernt
    });
  }

  // Aktualisiert die Storage-Warnung direkt im DOM ohne Re-Rendering
  _updateStorageWarningDirectly() {
    if (!this.shadowRoot) {
      // Shadow DOM noch nicht bereit, Fallback zu requestUpdate
      this.requestUpdate();
      return;
    }

    const wrapper = this.shadowRoot.querySelector('.calendar-wrapper');
    if (!wrapper) {
      // Wrapper nicht gefunden, Fallback zu requestUpdate
      this.requestUpdate();
      return;
    }

    const isEditorMode = this._isInEditorMode();
    const hasStorageWarning = this._storageWarning && this._storageWarning.show;

    // Aktualisiere CSS-Klasse
    if (hasStorageWarning) {
      wrapper.classList.add('storage-warning-active');
    } else {
      wrapper.classList.remove('storage-warning-active');
    }

    // Finde oder erstelle Storage-Warnung
    let storageWarningEl = wrapper.querySelector('.storage-warning[data-warning-type="storage"]');

    if (hasStorageWarning) {
      if (!storageWarningEl) {
        // Erstelle neue Warnung
        storageWarningEl = document.createElement('div');
        storageWarningEl.className = 'storage-warning';
        storageWarningEl.setAttribute('data-warning-type', 'storage');
        wrapper.insertBefore(storageWarningEl, wrapper.firstChild);
      }

      // Aktualisiere Inhalt
      const additionalEntities = this.findAdditionalEntities(this._config.entity);
      const nextEntitySuffix = String(additionalEntities.length + 1).padStart(3, '0');
      storageWarningEl.innerHTML = `
        <div class="warning-icon">⚠️</div>
        <div class="warning-content">
          <div class="warning-title">Speicherplatz fast voll!</div>
          <div class="warning-message">
            ${this._storageWarning.percentage}% der verfügbaren Speicherkapazität verwendet
            (${this._storageWarning.currentLength} / ${this._storageWarning.maxLength} Zeichen).
          </div>
          <div class="warning-action">
            Bitte legen Sie ein zusätzliches Input-Text-Feld an (z.B. ${this._config.entity}_${nextEntitySuffix}).
          </div>
        </div>
      `;
    } else if (storageWarningEl) {
      // Entferne Warnung wenn nicht mehr nötig
      storageWarningEl.remove();
    }
  }

  // Aktualisiert die Config-Warnung direkt im DOM ohne Re-Rendering
  _updateConfigWarningDirectly() {
    if (!this.shadowRoot) {
      // Shadow DOM noch nicht bereit, Fallback zu requestUpdate
      this.requestUpdate();
      return;
    }

    const wrapper = this.shadowRoot.querySelector('.calendar-wrapper');
    if (!wrapper) {
      // Wrapper nicht gefunden, Fallback zu requestUpdate
      this.requestUpdate();
      return;
    }

    const isEditorMode = this._isInEditorMode();
    const hasConfigWarning =
      this._configWarning &&
      this._configWarning.show &&
      (this._configWarning.type === 'size' ||
        (this._configWarning.type === 'missing' && isEditorMode));

    // Finde alle Config-Warnungen (size und missing)
    const configWarningSize = wrapper.querySelector(
      '.storage-warning[data-warning-type="config-size"]'
    );
    const configWarningMissing = wrapper.querySelector(
      '.storage-warning[data-warning-type="config-missing"]'
    );

    if (hasConfigWarning && this._configWarning.type === 'size') {
      // Size-Warnung anzeigen/aktualisieren
      let warningEl = configWarningSize;
      if (!warningEl) {
        warningEl = document.createElement('div');
        warningEl.className = 'storage-warning';
        warningEl.setAttribute('data-warning-type', 'config-size');
        // Füge nach Storage-Warnung ein, falls vorhanden
        const storageWarning = wrapper.querySelector(
          '.storage-warning[data-warning-type="storage"]'
        );
        if (storageWarning) {
          storageWarning.insertAdjacentElement('afterend', warningEl);
        } else {
          wrapper.insertBefore(warningEl, wrapper.firstChild);
        }
      }
      warningEl.innerHTML = `
        <div class="warning-icon">⚠️</div>
        <div class="warning-content">
          <div class="warning-title">Konfigurations-Entity zu klein!</div>
          <div class="warning-message">
            Die Konfiguration passt nicht in die Entity <code>${this._configWarning.configEntityId}</code>.
            ${this._configWarning.percentage}% der verfügbaren Speicherkapazität benötigt
            (${this._configWarning.currentLength} / ${this._configWarning.maxLength} Zeichen).
          </div>
          <div class="warning-action">
            Bitte erhöhen Sie die maximale Länge der Entity über die UI:
            <ul>
              <li>Einstellungen → Automatisierungen &amp; Szenen → Hilfsmittel</li>
              <li>Entity <code>${this._configWarning.configEntityId.replace('input_text.', '')}</code> bearbeiten</li>
              <li>Maximale Länge auf mindestens <code>${Math.ceil(this._configWarning.currentLength * 1.2)}</code> Zeichen erhöhen</li>
            </ul>
          </div>
        </div>
      `;
    } else if (configWarningSize) {
      configWarningSize.remove();
    }

    if (hasConfigWarning && this._configWarning.type === 'missing' && isEditorMode) {
      // Missing-Warnung anzeigen/aktualisieren
      let warningEl = configWarningMissing;
      if (!warningEl) {
        warningEl = document.createElement('div');
        warningEl.className = 'storage-warning';
        warningEl.setAttribute('data-warning-type', 'config-missing');
        // Füge nach anderen Warnungen ein
        const lastWarning = wrapper.querySelector('.storage-warning:last-of-type');
        if (lastWarning) {
          lastWarning.insertAdjacentElement('afterend', warningEl);
        } else {
          wrapper.insertBefore(warningEl, wrapper.firstChild);
        }
      }
      // Erstelle HTML-String für missing entity warning
      const entityNameShort = this._configWarning.configEntityId.replace('input_text.', '');
      warningEl.innerHTML = `
        <div class="warning-icon">⚠️</div>
        <div class="warning-content">
          <div class="warning-title">Konfigurations-Entity fehlt!</div>
          <div class="warning-message">
            Die Entity <code>${this._configWarning.configEntityId}</code> wurde nicht gefunden.
          </div>
          <div class="warning-action">
            Bitte legen Sie diese Entity über die UI an:
            <ul>
              <li>Einstellungen → Automatisierungen &amp; Szenen → Hilfsmittel</li>
              <li>Hilfsmittel hinzufügen → Text</li>
              <li>Entity-ID: <code>${this._configWarning.configEntityId}</code></li>
              <li>Maximale Länge: <code>255</code> Zeichen (oder mehr)</li>
            </ul>
          </div>
        </div>
      `;
    } else if (configWarningMissing) {
      configWarningMissing.remove();
    }
  }

  // Aktualisiert die Status-Warnung direkt im DOM ohne Re-Rendering
  _updateStatusWarningDirectly() {
    if (!this.shadowRoot) {
      // Shadow DOM noch nicht bereit, Fallback zu requestUpdate
      this.requestUpdate();
      return;
    }

    const wrapper = this.shadowRoot.querySelector('.calendar-wrapper');
    if (!wrapper) {
      // Wrapper nicht gefunden, Fallback zu requestUpdate
      this.requestUpdate();
      return;
    }

    const isEditorMode = this._isInEditorMode();
    const hasStatusWarning = this._statusWarning && this._statusWarning.show && isEditorMode;

    const statusWarningEl = wrapper.querySelector('.storage-warning[data-warning-type="status"]');

    if (hasStatusWarning) {
      let warningEl = statusWarningEl;
      if (!warningEl) {
        warningEl = document.createElement('div');
        warningEl.className = 'storage-warning';
        warningEl.setAttribute('data-warning-type', 'status');
        // Füge nach anderen Warnungen ein
        const lastWarning = wrapper.querySelector('.storage-warning:last-of-type');
        if (lastWarning) {
          lastWarning.insertAdjacentElement('afterend', warningEl);
        } else {
          wrapper.insertBefore(warningEl, wrapper.firstChild);
        }
      }
      warningEl.innerHTML = `
        <div class="warning-icon">⚠️</div>
        <div class="warning-content">
          <div class="warning-title">Status-Entity fehlt!</div>
          <div class="warning-message">
            Die Entity <code>${this._statusWarning.statusEntityId}</code> wurde nicht gefunden.
          </div>
          <div class="warning-action">
            Bitte legen Sie diese Entity über die UI an:
            <ul>
              <li>Einstellungen → Automatisierungen &amp; Szenen → Hilfsmittel</li>
              <li>Hilfsmittel hinzufügen → Text</li>
              <li>Entity-ID: <code>${this._statusWarning.statusEntityId}</code></li>
              <li>Maximale Länge: <code>255</code> Zeichen (oder mehr)</li>
            </ul>
          </div>
        </div>
      `;
    } else if (statusWarningEl) {
      statusWarningEl.remove();
    }
  }

  _getDayElements(monthKey, day) {
    // Gibt die Elemente für einen bestimmten Tag zurück
    if (!this._workingDays[monthKey] || typeof this._workingDays[monthKey] !== 'object') {
      return [];
    }

    if (Array.isArray(this._workingDays[monthKey])) {
      // Altes Format: Array von Tagen
      return [];
    }

    const elements = this._workingDays[monthKey][day] || [];

    return elements;
  }

  // Optimierung: Verhindere unnötige Re-Renderings
  shouldUpdate(changedProperties) {
    // Prüfe ob sich relevante Properties geändert haben
    const relevantProps = [
      'hass',
      'config',
      '_workingDays',
      '_displayedMonths',
      '_startMonthOffset',
      '_selectedCalendar',
      '_storageWarning',
      '_configWarning',
      '_statusWarning',
    ];

    // Wenn nur _workingDays geändert wurde und direkte DOM-Updates im Gange sind,
    // überspringe das Update, um Verdopplungen zu vermeiden
    if (
      changedProperties.has('_workingDays') &&
      changedProperties.size === 1 &&
      this._directDOMUpdateInProgress.size > 0
    ) {
      // Überspringe Update, da direkte DOM-Manipulation verwendet wird
      return false;
    }

    return relevantProps.some(prop => changedProperties.has(prop));
  }

  render() {
    if (!this._config || !this._config.entity) {
      return html`<div class="error">Keine Entity konfiguriert</div>`;
    }

    const maxMonths = this._config.numberOfMonths || 14;
    const displayedMonths = this._displayedMonths || 2;
    const startMonthOffset = this._startMonthOffset || 0;
    const now = new Date();
    const months = [];

    for (let i = 0; i < displayedMonths; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + startMonthOffset + i, 1);
      const year = date.getFullYear();
      const month = date.getMonth();
      months.push({ year, month });
    }

    const isEditorMode = this._isInEditorMode();
    // Speicherwarnung wird immer angezeigt (auch im normalen Modus)
    const hasStorageWarning = this._storageWarning && this._storageWarning.show;
    // Config-Warnung: "missing" nur im Editor, "size" immer (auch im normalen Modus)
    const hasConfigWarning =
      this._configWarning &&
      this._configWarning.show &&
      (this._configWarning.type === 'size' || // Speicherplatz-Warnung immer anzeigen
        (this._configWarning.type === 'missing' && isEditorMode)); // Fehlende Entity nur im Editor
    // Status-Warnung wird nur im Editor-Modus angezeigt
    const hasStatusWarning = this._statusWarning && this._statusWarning.show && isEditorMode;
    const navBounds = this.getNavigationBounds();

    return html`
      <div class="calendar-wrapper ${hasStorageWarning ? 'storage-warning-active' : ''}">
        ${hasStorageWarning
          ? html`
              <div class="storage-warning" data-warning-type="storage">
                <div class="warning-icon">⚠️</div>
                <div class="warning-content">
                  <div class="warning-title">Speicherplatz fast voll!</div>
                  <div class="warning-message">
                    ${this._storageWarning.percentage}% der verfügbaren Speicherkapazität verwendet
                    (${this._storageWarning.currentLength} / ${this._storageWarning.maxLength}
                    Zeichen).
                  </div>
                  <div class="warning-action">
                    Bitte legen Sie ein zusätzliches Input-Text-Feld an (z.B.
                    ${this._config.entity}_${String(
                      this.findAdditionalEntities(this._config.entity).length + 1
                    ).padStart(3, '0')}).
                  </div>
                </div>
              </div>
            `
          : ''}
        ${hasConfigWarning && this._configWarning.type === 'size'
          ? html`
              <div class="storage-warning" data-warning-type="config-size">
                <div class="warning-icon">⚠️</div>
                <div class="warning-content">
                  <div class="warning-title">Konfigurations-Entity zu klein!</div>
                  <div class="warning-message">
                    Die Konfiguration passt nicht in die Entity
                    <code>${this._configWarning.configEntityId}</code>.
                    ${this._configWarning.percentage}% der verfügbaren Speicherkapazität benötigt
                    (${this._configWarning.currentLength} / ${this._configWarning.maxLength}
                    Zeichen).
                  </div>
                  <div class="warning-action">
                    Bitte erhöhen Sie die maximale Länge der Entity über die UI:
                    <ul>
                      <li>Einstellungen → Automatisierungen &amp; Szenen → Hilfsmittel</li>
                      <li>
                        Entity
                        <code
                          >${this._configWarning.configEntityId.replace('input_text.', '')}</code
                        >
                        bearbeiten
                      </li>
                      <li>
                        Maximale Länge auf mindestens
                        <code>${Math.ceil(this._configWarning.currentLength * 1.2)}</code> Zeichen
                        erhöhen
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            `
          : ''}
        ${hasConfigWarning && this._configWarning.type === 'missing'
          ? html`
              <div class="storage-warning" data-warning-type="config-missing">
                ${this._renderMissingEntityWarning(
                  this._configWarning.configEntityId,
                  'Konfigurations-Entity',
                  255,
                  true
                )}
              </div>
            `
          : ''}
        ${hasStatusWarning
          ? html`
              <div class="storage-warning" data-warning-type="status">
                ${this._renderMissingEntityWarning(
                  this._statusWarning.statusEntityId,
                  'Status-Entity',
                  255,
                  false
                )}
              </div>
            `
          : ''}
        <div class="menu-bar">
          <button
            class="menu-button navigation-button"
            @click=${() => this.changeStartMonth(-1)}
            ?disabled=${!navBounds.canGoBack}
            title="Vorheriger Monat"
          >
            ←
          </button>
          <button
            class="menu-button decrease-button"
            @click=${() => this.changeDisplayedMonths(-1)}
            ?disabled=${displayedMonths <= 1}
            title="Weniger Monate anzeigen"
          >
            −
          </button>
          <div class="menu-number">${displayedMonths}</div>
          <button
            class="menu-button increase-button"
            @click=${() => this.changeDisplayedMonths(1)}
            ?disabled=${displayedMonths >= maxMonths}
            title="Mehr Monate anzeigen"
          >
            +
          </button>
          <button
            class="menu-button navigation-button"
            @click=${() => this.changeStartMonth(1)}
            ?disabled=${!navBounds.canGoForward}
            title="Nächster Monat"
          >
            →
          </button>
          ${(() => {
            const allCalendars = this._getAllCalendars();
            const selectedValue = this._getSelectedCalendarValue();
            return html`
              <div class="calendar-selector">
                <ha-select
                  .value=${selectedValue || 'a'}
                  @selected=${e => {
                    try {
                      // Verhindere Event-Propagation zu Home Assistant's Card-Picker
                      if (e) {
                        if (typeof e.stopPropagation === 'function') {
                          e.stopPropagation();
                        }
                        if (typeof e.stopImmediatePropagation === 'function') {
                          e.stopImmediatePropagation();
                        }
                      }

                      if (!e || !e.detail) {
                        return;
                      }

                      const index = e.detail.index;
                      if (
                        index !== undefined &&
                        index !== null &&
                        index >= 0 &&
                        allCalendars &&
                        allCalendars[index]
                      ) {
                        const selectedCalendar = allCalendars[index];
                        if (selectedCalendar && selectedCalendar.shortcut) {
                          if (typeof this._onCalendarSelectedByIndex === 'function') {
                            this._onCalendarSelectedByIndex(selectedCalendar.shortcut);
                          }
                        }
                      }
                    } catch (error) {
                      console.error('Error in calendar selection handler:', error);
                    }
                  }}
                  naturalMenuWidth
                  fixedMenuPosition
                >
                  ${allCalendars.map(calendar => {
                    const bgColor = calendar.color || '';
                    const textColor = calendar.color ? this._getContrastColor(calendar.color) : '';
                    return html`
                      <mwc-list-item
                        value="${calendar.shortcut}"
                        data-calendar-color="${bgColor}"
                        data-calendar-text-color="${textColor}"
                        style="${bgColor
                          ? `--calendar-bg-color: ${bgColor}; --calendar-text-color: ${textColor};`
                          : ''}"
                      >
                        ${calendar.name || `Schicht ${calendar.shortcut.toUpperCase()}`}
                      </mwc-list-item>
                    `;
                  })}
                </ha-select>
              </div>
            `;
          })()}
        </div>
        <div class="calendar-container">
          ${months.map(({ year, month }) => this.renderMonth(year, month))}
        </div>
      </div>
    `;
  }

  static styles = [
    super.styles || [],
    css`
      :host {
        display: block;
        --tgshiftschedule-default-selected-day-color: ${unsafeCSS(
          ShiftScheduleView.DEFAULT_SELECTED_DAY_COLOR
        )};
      }

      .calendar-wrapper {
        display: block;
        transition: border-color 0.3s ease;
      }

      .calendar-wrapper.storage-warning-active {
        border: 3px solid var(--error-color, #f44336);
        border-radius: 4px;
        padding: 8px;
        box-shadow: 0 0 10px rgba(244, 67, 54, 0.3);
      }

      .menu-bar {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 12px;
        margin-bottom: 16px;
        background-color: var(--card-background-color, #ffffff);
        border-radius: 4px;
        border: 1px solid var(--divider-color, #e0e0e0);
        flex-wrap: wrap;
      }

      .menu-button {
        width: 32px;
        height: 32px;
        border-radius: 4px;
        border: 1px solid var(--divider-color, #e0e0e0);
        background-color: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #ffffff);
        font-size: 20px;
        font-weight: bold;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition:
          background-color 0.2s ease,
          opacity 0.2s ease;
      }

      .menu-button.navigation-button {
        background-color: var(--secondary-color, #757575);
      }

      .menu-button.navigation-button:hover:not(:disabled) {
        background-color: var(--secondary-color-dark, #616161);
      }

      .menu-button:hover:not(:disabled) {
        background-color: var(--primary-color-dark, #0288d1);
      }

      .menu-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .menu-number {
        font-size: 18px;
        font-weight: bold;
        min-width: 40px;
        text-align: center;
        color: var(--primary-text-color, #212121);
      }

      .element-selector {
        margin-left: 20px;
        min-width: 200px;
      }

      .calendar-selector {
        flex: 1;
        min-width: 0;
        max-width: 100%;
        margin-left: 12px;
      }

      .calendar-selector ha-select {
        width: 100%;
        max-width: 100%;
      }

      /* Stelle sicher, dass alle Items die Schichtfarbe als Hintergrund haben */
      .calendar-selector mwc-list-item[data-calendar-color] {
        background-color: var(--calendar-bg-color) !important;
        color: var(--calendar-text-color) !important;
      }

      /* Stelle sicher, dass auch das ausgewählte/aktivierte Item die Schichtfarbe behält */
      .calendar-selector mwc-list-item[data-calendar-color][selected],
      .calendar-selector mwc-list-item[data-calendar-color][activated],
      .calendar-selector mwc-list-item[data-calendar-color].selected,
      .calendar-selector mwc-list-item[data-calendar-color].activated {
        background-color: var(--calendar-bg-color) !important;
        color: var(--calendar-text-color) !important;
        --mdc-list-item-selected-background-color: var(--calendar-bg-color) !important;
        --mdc-list-item-activated-background-color: var(--calendar-bg-color) !important;
      }

      /* Überschreibe die Standard-Hintergrundfarbe für ausgewählte Items (::before Pseudo-Element) */
      .calendar-selector mwc-list-item[data-calendar-color][selected]::before,
      .calendar-selector mwc-list-item[data-calendar-color][activated]::before,
      .calendar-selector mwc-list-item[data-calendar-color].selected::before,
      .calendar-selector mwc-list-item[data-calendar-color].activated::before {
        background-color: var(--calendar-bg-color) !important;
        opacity: 1 !important;
      }

      /* Überschreibe auch für den Hover-State */
      .calendar-selector mwc-list-item[data-calendar-color]:hover {
        background-color: var(--calendar-bg-color) !important;
        opacity: 0.9 !important;
      }

      .calendar-container {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .month-container {
        display: flex;
        flex-direction: column;
      }

      .month-header {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 12px;
        text-align: center;
      }

      .calendar-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
      }

      .calendar-table th {
        padding: 8px 4px;
        text-align: center;
        font-weight: bold;
        font-size: 12px;
        border-bottom: 2px solid var(--divider-color, #e0e0e0);
      }

      .calendar-table td {
        padding: 4px;
        text-align: center;
        vertical-align: middle;
      }

      .day-button {
        width: 100%;
        min-width: 32px;
        min-height: 32px;
        padding: 2px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 4px;
        background-color: var(--card-background-color, #ffffff);
        color: var(--primary-text-color, #000000);
        cursor: pointer;
        transition: all 0.2s;
        font-size: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2px;
      }

      .day-number {
        font-size: 12px;
        font-weight: bold;
        line-height: 1;
      }

      .shifts-container {
        display: flex;
        flex-wrap: wrap;
        gap: 2px;
        justify-content: center;
        align-items: center;
        max-width: 100%;
      }

      .shift-indicator {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        border: 1px solid rgba(0, 0, 0, 0.2);
        flex-shrink: 0;
      }

      .day-button:hover:not(.working) {
        background-color: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #ffffff);
      }

      .day-button.working:hover {
        /* Behalte die Hintergrundfarbe bei, aber mache sie etwas dunkler */
        opacity: 0.9;
        filter: brightness(0.9);
      }

      /* Verhindere visuelle Markierung nach Klick auf mobilen Geräten */
      .day-button:active,
      .day-button:focus {
        outline: none !important;
        box-shadow: none !important;
      }

      /* Touch-spezifische Behandlung: Verhindere aktiven State nach Touch */
      .day-button {
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        touch-action: manipulation;
      }

      .day-button.working {
        /* background-color wird jetzt dynamisch per style gesetzt, wenn eine Schicht ausgewählt ist */
        color: var(--text-primary-color, #ffffff);
        font-weight: bold;
      }

      /* Fallback: Wenn keine Schicht ausgewählt ist, verwende die Standardfarbe */
      .day-button.working:not([style*='background-color']) {
        background-color: var(--accent-color, var(--tgshiftschedule-default-selected-day-color));
      }

      /* Basis: Heute-Markierung mit Outline (wird außerhalb des Borders gerendert) */
      .day-button.today {
        outline: 3px solid var(--primary-color, #03a9f4);
        outline-offset: 2px;
      }

      .day-button.weekend {
        border: 4px solid var(--secondary-color, #757575);
      }

      /* Feiertage haben Vorrang vor Wochenenden */
      .day-button.holiday {
        border: 4px solid var(--error-color, #f44336);
      }

      /* Wenn sowohl Wochenende als auch Feiertag, verwende Feiertagsfarbe (stärkere Umrandung) */
      .day-button.weekend.holiday {
        border: 5px solid var(--error-color, #f44336);
      }

      /* Heute + Wochenende: Border für Wochenende, Outline für heute */
      .day-button.today.weekend {
        border: 4px solid var(--secondary-color, #757575);
        outline: 3px solid var(--primary-color, #03a9f4);
        outline-offset: 2px;
      }

      /* Heute + Feiertag: Border für Feiertag, Outline für heute */
      .day-button.today.holiday {
        border: 4px solid var(--error-color, #f44336);
        outline: 3px solid var(--primary-color, #03a9f4);
        outline-offset: 2px;
      }

      /* Heute + Wochenende + Feiertag: Border für Feiertag (stärker), Outline für heute */
      .day-button.today.weekend.holiday {
        border: 5px solid var(--error-color, #f44336);
        outline: 3px solid var(--primary-color, #03a9f4);
        outline-offset: 2px;
      }

      .day-button.readonly,
      .day-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background-color: var(--disabled-color, #f5f5f5);
        color: var(--secondary-text-color, #888888);
      }

      .day-button.readonly:hover,
      .day-button:disabled:hover {
        background-color: var(--disabled-color, #f5f5f5);
        color: var(--secondary-text-color, #888888);
      }

      .day-number {
        font-size: 12px;
        font-weight: bold;
        line-height: 1;
      }

      .shifts-container {
        display: flex;
        flex-wrap: wrap;
        gap: 2px;
        justify-content: center;
        align-items: center;
        max-width: 100%;
      }

      .shift-indicator {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        border: 1px solid rgba(0, 0, 0, 0.2);
        flex-shrink: 0;
      }

      .day-button.working .day-number {
        color: var(--text-primary-color, #ffffff);
      }

      .week-label {
        font-size: 11px;
        color: var(--secondary-text-color, #888888);
        padding-right: 8px;
        text-align: right;
        width: 40px;
      }

      .error {
        text-align: center;
        padding: 20px;
        color: var(--error-color);
      }

      .storage-warning {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 16px;
        margin-bottom: 16px;
        background-color: var(--warning-color, var(--tgshiftschedule-default-selected-day-color));
        color: var(--text-primary-color, #ffffff);
        border-radius: 4px;
        border-left: 4px solid var(--error-color, #f44336);
      }

      .warning-icon {
        font-size: 24px;
        flex-shrink: 0;
      }

      .warning-content {
        flex: 1;
      }

      .warning-title {
        font-weight: bold;
        font-size: 16px;
        margin-bottom: 8px;
      }

      .warning-message {
        font-size: 14px;
        margin-bottom: 8px;
        line-height: 1.5;
      }

      .warning-action {
        font-size: 14px;
        font-weight: 500;
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.3);
      }

      .warning-action ul {
        margin: 8px 0 0 0;
        padding-left: 20px;
        list-style-type: disc;
      }

      .warning-action li {
        margin: 4px 0;
        line-height: 1.5;
      }

      .warning-action code {
        background-color: rgba(0, 0, 0, 0.2);
        padding: 2px 6px;
        border-radius: 3px;
        font-family: 'Courier New', monospace;
        font-size: 13px;
      }
    `,
  ];
}

// Registriere ShiftScheduleView als Custom Element
if (!customElements.get('shiftschedule-view')) {
  customElements.define('shiftschedule-view', ShiftScheduleView);
}
