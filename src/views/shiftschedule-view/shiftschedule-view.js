import { html, css, unsafeCSS } from 'lit';
import { ViewBase } from '../view-base.js';
import { SaveDebounceTime } from '../../card-config.js';
import { StorageFactory } from '../../storage/storage-factory.js';
// Mixins für wiederverwendbare Funktionalität
import { HolidayMixin } from './mixins/holiday-mixin.js';
import { DataManagementMixin } from './mixins/data-management-mixin.js';
import { CalendarMixin } from './mixins/calendar-mixin.js';
import { ConfigManagementMixin } from './mixins/config-management-mixin.js';
import { RenderingMixin } from './mixins/rendering-mixin.js';
// Utilities
import { DateUtils } from '../../utils/date-utils.js';
import { ColorUtils } from '../../utils/color-utils.js';
// Gemeinsame Menu-Styles
import { sharedMenuStyles } from './shared-menu-styles.js';
// Menu-Bar Template
import { renderMenuBar } from './menu-bar-template.js';
// Konfigurationspanel
import './shift-config-panel.js';

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
      _showConfigPanel: { type: Boolean },
    };
  }

  constructor() {
    super();
    this._workingDays = {}; // {"year:month": {day: [elements]}} - z.B. {"25:11": {1: ["a"], 2: ["a", "h"], 3: ["b"]}}
    this._storageWarning = null; // { show: boolean, currentLength: number, maxLength: number, percentage: number }
    this._configWarning = null; // { show: boolean, configEntityId: string }
    this._statusWarning = null; // { show: boolean, statusEntityId: string }
    this._knownEntityIds = null; // Cache für bekannte Entities [mainEntity, ...additionalEntities] - WIRD VON ENTITY-STORAGE VERWENDET
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
    // Storage-Adapter (wird bei setConfig oder set hass initialisiert)
    this._storage = null;
    // Konfigurationspanel
    this._showConfigPanel = false;
    
    // Mixins hinzufügen (für wiederverwendbare Funktionalität)
    Object.assign(this, DateUtils);
    Object.assign(this, ColorUtils);
    Object.assign(this, HolidayMixin);
    Object.assign(this, DataManagementMixin);
    Object.assign(this, CalendarMixin);
    Object.assign(this, ConfigManagementMixin);
    Object.assign(this, RenderingMixin);
  }

  // formatTwoDigits() ist jetzt in DateUtils

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
  // _getContrastColor() ist jetzt in ColorUtils
  // _getEasterDate(), _isHoliday(), _isWeekend() sind jetzt in HolidayMixin

  /**
   * Initialisiert den Storage-Adapter basierend auf der Konfiguration
   * @private
   */
  _initializeStorage() {
    if (!this._hass || !this._config) {
      this._debug('[Storage] _initializeStorage: hass oder config fehlt');
      this._storage = null;
      return;
    }

    try {
      this._storage = StorageFactory.createStorage(this._hass, this._config, this._debug.bind(this));
      this._debug(`[Storage] _initializeStorage: Storage-Adapter erstellt, store_mode: "${this._config.store_mode}"`);
    } catch (error) {
      this._debug(`[Storage] _initializeStorage: Fehler beim Erstellen des Storage-Adapters: ${error.message}`, error);
      this._storage = null;
    }
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

    const previousEntityState = this._hass?.states?.[this._config?.entity]?.state;
    const newEntityState = hass?.states?.[this._config?.entity]?.state;

    // Prüfe auch zusätzliche Entities auf Änderungen
    let hasAnyEntityChanged = previousEntityState !== newEntityState;
    if (!hasAnyEntityChanged && this._config && this._knownEntityIds && hass?.states) {
      // Prüfe alle bekannten zusätzlichen Entities
      for (let i = 1; i < this._knownEntityIds.length; i++) {
        const entityId = this._knownEntityIds[i];
        const prevState = this._hass?.states?.[entityId]?.state;
        const newState = hass?.states?.[entityId]?.state;
        if (prevState !== newState) {
          hasAnyEntityChanged = true;
          break;
        }
      }
    }
    
    // Prüfe ob sich die saver_config geändert hat (nur bei store_mode === 'saver')
    let hasSaverConfigChanged = false;
    if (this._config && this._config.store_mode === 'saver' && this._hass && hass && hass?.states) {
      try {
        const saverEntity = hass.states['saver.saver'];
        const previousSaverEntity = this._hass?.states?.['saver.saver'];
        if (saverEntity && saverEntity.attributes && saverEntity.attributes.variables) {
          const configKey = `${this._config.saver_key || 'Schichtplan'}_config`;
          const previousConfigValue = previousSaverEntity?.attributes?.variables?.[configKey];
          const newConfigValue = saverEntity.attributes.variables[configKey];
          if (previousConfigValue !== newConfigValue) {
            hasSaverConfigChanged = true;
            this._debug('[Config] set hass: saver_config hat sich geändert, lade Konfiguration neu');
          }
        }
      } catch (error) {
        this._debug('[Config] set hass: Fehler beim Prüfen der saver_config:', error);
      }
    }

    const wasHassSet = !!this._hass;
    this._hass = hass;

    // Cache-Invalidierung: Holiday-Entities Cache zurücksetzen bei hass-Update
    this._cachedHolidayEntities = null;
    
    // Initialisiere Storage-Adapter neu, falls Config bereits vorhanden
    if (this._config) {
      this._initializeStorage();
    }

    // Wenn hass zum ersten Mal gesetzt wird und die Konfiguration bereits vorhanden ist,
    // markiere initialen Load als abgeschlossen
    if (!wasHassSet && hass && this._config && this._isInitialLoad) {
      this._debug('[Config] set hass: hass zum ersten Mal gesetzt - markiere initialen Load als abgeschlossen');
      this._isInitialLoad = false;
    }

    if (this._config) {
      // Lade Daten beim ersten Setzen von hass oder wenn sich ein State geändert hat
      if ((!wasHassSet || hasAnyEntityChanged) && hass?.states) {
        try {
          this.loadWorkingDays();
        } catch (error) {
          this._debug('[Config] set hass: Fehler beim Laden der Arbeitszeiten:', error);
        }
      }
      
      // Beim ersten Setzen von hass: Lade die Konfiguration aus dem Storage, falls noch nicht geladen
      if (!wasHassSet && this._storage) {
        this._debug('[Config] set hass: hass zum ersten Mal gesetzt - lade Konfiguration aus Storage');
        // Verwende Promise ohne await, da set hass() nicht async ist
        this._storage.loadConfig().then(storageConfig => {
          if (storageConfig) {
            try {
              const parsedConfig = JSON.parse(storageConfig);
              
              // Neues Format: Objekt mit "calendars" Property
              if (parsedConfig && typeof parsedConfig === 'object' && Array.isArray(parsedConfig.calendars)) {
                this._debug('[Config] set hass: Konfiguration aus Storage geladen (neues Format mit calendars) beim ersten hass-Set');
                
                // Ersetze this._config.calendars vollständig mit den geladenen Kalendern
                this._config.calendars = parsedConfig.calendars.map(cal => {
                  // Stelle sicher, dass timeRanges im korrekten Format sind
                  let timeRanges = [];
                  if (cal.timeRanges && Array.isArray(cal.timeRanges)) {
                    timeRanges = cal.timeRanges.map((range, idx) => {
                      // Prüfe zuerst, ob es ein Array ist (altes Format)
                      if (Array.isArray(range)) {
                        // Altes Format: [start, end] - konvertiere zu neuem Format
                        this._debug(`[Config] set hass: Zeitraum ${idx} für "${cal.shortcut}": Altes Format [start, end] erkannt`);
                        return {
                          id: null,
                          times: [...range],
                        };
                      } else if (typeof range === 'object' && range !== null && range.times && Array.isArray(range.times)) {
                        // Neues Format: { id, times: [start, end] }
                        const normalizedRange = {
                          id: range.id || null,
                          times: [...range.times],
                        };
                        this._debug(`[Config] set hass: Zeitraum ${idx} für "${cal.shortcut}": Neues Format erkannt, id="${normalizedRange.id}", times=[${normalizedRange.times.join(',')}]`);
                        return normalizedRange;
                      } else {
                        this._debug(`[Config] set hass: Zeitraum ${idx} für "${cal.shortcut}": Unbekanntes Format, verwende Default`);
                        return { id: null, times: [null, null] };
                      }
                    });
                  }
                  
                  return {
                    shortcut: cal.shortcut,
                    name: cal.name || `Schicht ${cal.shortcut?.toUpperCase() || ''}`,
                    color: cal.color || this._getDefaultColorForShortcut(cal.shortcut),
                    enabled: cal.enabled === true || cal.enabled === 'true' || cal.enabled === 1,
                    statusRelevant: cal.statusRelevant === true || cal.statusRelevant === 'true' || cal.statusRelevant === 1,
                    timeRanges: timeRanges,
                  };
                });
                
                this._debug(`[Config] set hass: ${this._config.calendars.length} Kalender geladen beim ersten hass-Set`);
                this._config.calendars.forEach(cal => {
                  this._debug(`[Config] set hass: Kalender "${cal.shortcut}":`, {
                    name: cal.name,
                    enabled: cal.enabled,
                    statusRelevant: cal.statusRelevant,
                    timeRanges_count: cal.timeRanges?.length || 0,
                  });
                });
                
                this._debug('[Config] set hass: Konfiguration aus Saver geladen und this._config aktualisiert');
                this.requestUpdate();
              } else {
                this._debug('[Config] set hass: Konfiguration konnte nicht geparst werden - erwartetes Format: { calendars: [...] }');
              }
            } catch (error) {
              this._debug('[Config] set hass: Fehler beim Parsen der Konfiguration aus dem Storage:', error);
            }
          }
        }).catch(error => {
          this._debug('[Config] set hass: Fehler beim Laden der Konfiguration aus dem Storage:', error);
        });
      }
      
      // Wenn sich die saver_config geändert hat, lade die Konfiguration neu
      if (hasSaverConfigChanged && this._storage) {
        this._debug('[Config] set hass: Lade Konfiguration aus Storage neu');
        // Lade die Konfiguration aus dem Storage und aktualisiere this._config
        this._storage.loadConfig().then(storageConfig => {
          if (storageConfig) {
            try {
              const parsedConfig = JSON.parse(storageConfig);
              
              // Neues Format: Objekt mit "calendars" Property
              if (parsedConfig && typeof parsedConfig === 'object' && Array.isArray(parsedConfig.calendars)) {
                this._debug('[Config] set hass: Konfiguration aus Saver neu geladen (neues Format mit calendars)');
                
                // Ersetze this._config.calendars vollständig mit den geladenen Kalendern
                this._config.calendars = parsedConfig.calendars.map(cal => {
                  // Stelle sicher, dass timeRanges im korrekten Format sind
                  let timeRanges = [];
                  if (cal.timeRanges && Array.isArray(cal.timeRanges)) {
                    timeRanges = cal.timeRanges.map((range, idx) => {
                      // Prüfe zuerst, ob es ein Array ist (altes Format)
                      if (Array.isArray(range)) {
                        // Altes Format: [start, end] - konvertiere zu neuem Format
                        this._debug(`[Config] set hass: Zeitraum ${idx} für "${cal.shortcut}": Altes Format [start, end] erkannt`);
                        return {
                          id: null,
                          times: [...range],
                        };
                      } else if (typeof range === 'object' && range !== null && range.times && Array.isArray(range.times)) {
                        // Neues Format: { id, times: [start, end] }
                        const normalizedRange = {
                          id: range.id || null,
                          times: [...range.times],
                        };
                        this._debug(`[Config] set hass: Zeitraum ${idx} für "${cal.shortcut}": Neues Format erkannt, id="${normalizedRange.id}", times=[${normalizedRange.times.join(',')}]`);
                        return normalizedRange;
                      } else {
                        this._debug(`[Config] set hass: Zeitraum ${idx} für "${cal.shortcut}": Unbekanntes Format, verwende Default`);
                        return { id: null, times: [null, null] };
                      }
                    });
                  }
                  
                  return {
                    shortcut: cal.shortcut,
                    name: cal.name || `Schicht ${cal.shortcut?.toUpperCase() || ''}`,
                    color: cal.color || this._getDefaultColorForShortcut(cal.shortcut),
                    enabled: cal.enabled === true || cal.enabled === 'true' || cal.enabled === 1,
                    statusRelevant: cal.statusRelevant === true || cal.statusRelevant === 'true' || cal.statusRelevant === 1,
                    timeRanges: timeRanges,
                  };
                });
                
                this._debug(`[Config] set hass: ${this._config.calendars.length} Kalender geladen`);
                this._config.calendars.forEach(cal => {
                  this._debug(`[Config] set hass: Kalender "${cal.shortcut}":`, {
                    name: cal.name,
                    enabled: cal.enabled,
                    statusRelevant: cal.statusRelevant,
                    timeRanges_count: cal.timeRanges?.length || 0,
                  });
                });
                
                this._debug('[Config] set hass: Konfiguration aus Storage neu geladen und this._config aktualisiert');
                // Wichtig: requestUpdate() aufrufen, damit die UI neu gerendert wird
                this.requestUpdate();
              } else {
                this._debug('[Config] set hass: Konfiguration konnte nicht geparst werden - erwartetes Format: { calendars: [...] }');
              }
          } catch (error) {
            this._debug('[Config] set hass: Fehler beim Parsen der neu geladenen Konfiguration:', error);
          }
        }
        }).catch(error => {
          this._debug('[Config] set hass: Fehler beim Neuladen der Konfiguration aus dem Storage:', error);
        });
      }
      
      // Prüfe Config-Entity und Status-Entity nur bei text_entity Modus
      // (bei Saver werden diese nicht benötigt)
      if (this._config.store_mode !== 'saver' && hass?.states) {
        try {
          this.checkConfigEntity();
          this.checkStatusEntity();
        } catch (error) {
          this._debug('[Config] set hass: Fehler beim Prüfen der Config/Status-Entities:', error);
        }
      }
    }
    this.requestUpdate();
  }

  get config() {
    return this._config;
  }

  set config(config) {
    this._debug('[Config] set config: === WIRD AUFGERUFEN ===');
    this._debug('[Config] set config: _isInitialLoad Status:', this._isInitialLoad);
    const wasInitialLoad = this._isInitialLoad;
    
    // Lade Konfiguration aus dem Storage, wenn store_mode == 'saver' und hass verfügbar ist
    // ABER: Nur beim initialen Laden, nicht wenn die Konfiguration vom Editor kommt
    // (beim Editor-Schließen wird die Konfiguration gespeichert, dann sollte sie nicht wieder überschrieben werden)
    if (config && config.store_mode === 'saver' && this._hass && wasInitialLoad) {
      this._debug('[Config] set config: Initialer Load - lade Konfiguration aus dem Storage und merge mit übergebener Config');
      // Initialisiere Storage, falls noch nicht geschehen
      if (!this._storage) {
        this._initializeStorage();
      }
      if (this._storage) {
        // Verwende Promise, da set config() nicht async ist
        this._storage.loadConfig().then(storageConfig => {
          if (storageConfig) {
            try {
              const parsedConfig = JSON.parse(storageConfig);
              
              // Neues Format: Objekt mit "calendars" Property
              if (parsedConfig && typeof parsedConfig === 'object' && Array.isArray(parsedConfig.calendars)) {
                this._debug('[Config] set config: Konfiguration aus Saver geparst (neues Format mit calendars)');
                
                // Starte mit der bestehenden internen Konfiguration (falls vorhanden) oder der übergebenen Config
                // Die übergebene Config hat Vorrang für Darstellungsparameter
                const mergedConfig = {
                  ...this._config, // Starte mit bestehender interner Konfiguration
                  ...config, // Überschreibe mit übergebener Config (Darstellungsparameter)
                };
                
                // Ersetze calendars vollständig mit den geladenen Kalendern aus dem Saver
                mergedConfig.calendars = parsedConfig.calendars.map(cal => {
                  // Stelle sicher, dass timeRanges im korrekten Format sind
                  let timeRanges = [];
                  if (cal.timeRanges && Array.isArray(cal.timeRanges)) {
                    timeRanges = cal.timeRanges.map((range, idx) => {
                      // Prüfe zuerst, ob es ein Array ist (altes Format)
                      if (Array.isArray(range)) {
                        // Altes Format: [start, end] - konvertiere zu neuem Format
                        this._debug(`[Config] set config: Zeitraum ${idx} für "${cal.shortcut}": Altes Format [start, end] erkannt`);
                        return {
                          id: null,
                          times: [...range],
                        };
                      } else if (typeof range === 'object' && range !== null && range.times && Array.isArray(range.times)) {
                        // Neues Format: { id, times: [start, end] }
                        const normalizedRange = {
                          id: range.id || null,
                          times: [...range.times],
                        };
                        this._debug(`[Config] set config: Zeitraum ${idx} für "${cal.shortcut}": Neues Format erkannt, id="${normalizedRange.id}", times=[${normalizedRange.times.join(',')}]`);
                        return normalizedRange;
                      } else {
                        this._debug(`[Config] set config: Zeitraum ${idx} für "${cal.shortcut}": Unbekanntes Format, verwende Default`);
                        return { id: null, times: [null, null] };
                      }
                    });
                  }
                  
                  return {
                    shortcut: cal.shortcut,
                    name: cal.name || `Schicht ${cal.shortcut?.toUpperCase() || ''}`,
                    color: cal.color || this._getDefaultColorForShortcut(cal.shortcut),
                    enabled: cal.enabled === true || cal.enabled === 'true' || cal.enabled === 1,
                    statusRelevant: cal.statusRelevant === true || cal.statusRelevant === 'true' || cal.statusRelevant === 1,
                    timeRanges: timeRanges,
                  };
                });
                
                this._debug(`[Config] set config: ${mergedConfig.calendars.length} Kalender aus Saver geladen`);
                mergedConfig.calendars.forEach(cal => {
                  this._debug(`[Config] set config: Kalender "${cal.shortcut}":`, {
                    name: cal.name,
                    enabled: cal.enabled,
                    statusRelevant: cal.statusRelevant,
                    timeRanges_count: cal.timeRanges?.length || 0,
                  });
                });
                
                // Verwende die gemergte Konfiguration - diese überschreibt vollständig this._config
                config = mergedConfig;
                this._config = mergedConfig;
                this._debug('[Config] set config: Konfiguration vollständig mit storage_config synchronisiert');
                this.requestUpdate();
              } else {
                this._debug('[Config] set config: Konfiguration konnte nicht geparst werden - erwartetes Format: { calendars: [...] }');
              }
            } catch (error) {
              this._debug('[Config] set config: Fehler beim Parsen der Konfiguration aus dem Storage:', error);
            }
          }
        }).catch(error => {
          this._debug('[Config] set config: Fehler beim Laden der Konfiguration aus dem Storage:', error);
        });
      }
    }
    
    this._config = config;
    this._debug('[Config] set config: Neue Konfiguration erhalten', {
      store_mode: config?.store_mode,
      saver_key: config?.saver_key,
      calendars_count: config?.calendars?.length,
      hasHass: !!this._hass,
    });

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

    // Wenn hass vorhanden ist, bedeutet das, dass die Karte bereits initialisiert wurde
    // Setze _isInitialLoad auf false, wenn hass vorhanden ist (Karte ist bereit)
    if (this._hass && this._isInitialLoad) {
      this._debug('[Config] set config: hass vorhanden - markiere initialen Load als abgeschlossen');
      this._isInitialLoad = false;
    }

    if (this._hass) {
      // Initialisiere Storage-Adapter
      this._initializeStorage();
      
      this.loadWorkingDays();
      // Prüfe Warnungen über Storage-Adapter
      this._updateWarnings();
      
      // Wenn die Konfiguration gesetzt wird und es nicht der initiale Load ist,
      // speichere die Konfiguration (z.B. wenn der Editor geschlossen wird)
      // Dies stellt sicher, dass Änderungen im Editor immer gespeichert werden
      // Prüfe jetzt nochmal, da _isInitialLoad möglicherweise gerade auf false gesetzt wurde
      const isStillInitialLoad = this._isInitialLoad;
      if (!isStillInitialLoad && this._config) {
        this._debug('[Config] set config: Konfiguration wurde gesetzt (nicht initialer Load)');
        this._debug('[Config] set config: Editor wurde geschlossen - speichere Konfiguration');
        // Verwende setTimeout, um sicherzustellen, dass die Konfiguration vollständig gesetzt ist
        setTimeout(() => {
          this._debug('[Config] set config: Starte saveConfigToEntity() nach setTimeout');
          this.saveConfigToEntity();
        }, 0);
      } else if (isStillInitialLoad) {
        this._debug('[Config] set config: Initialer Load erkannt - überspringe Speichern');
      }
    } else {
      this._debug('[Config] set config: hass noch nicht verfügbar - warte auf Initialisierung');
    }

    // Markiere initialen Load als abgeschlossen NACH dem ersten Rendering
    // (nicht hier, sondern in firstUpdated oder nach dem ersten config-changed Event)

    this.requestUpdate();
  }

  // Wird aufgerufen, wenn ein config-changed Event empfangen wird
  // (nur dann wird die Config gespeichert, nicht beim initialen Laden)
  _handleConfigChanged() {
    this._debug('[Config] _handleConfigChanged: Event empfangen - Konfiguration wurde geändert');
    
    // Verhindere Speichern beim initialen Load
    if (this._isInitialLoad) {
      this._debug('[Config] _handleConfigChanged: Initialer Load erkannt, überspringe Config-Speichern');
      this._debug('[Config] _handleConfigChanged: Markiere initialen Load als abgeschlossen');
      // Markiere initialen Load als abgeschlossen NACH dem ersten Event
      this._isInitialLoad = false;
      return;
    }
    
    if (!this._hass) {
      this._debug('[Config] _handleConfigChanged: Abbruch - hass nicht verfügbar');
      return;
    }
    
    if (!this._config) {
      this._debug('[Config] _handleConfigChanged: Abbruch - config nicht verfügbar');
      return;
    }
    
    this._debug('[Config] _handleConfigChanged: Starte saveConfigToEntity()');
    this.saveConfigToEntity();
  }

  // Liest eine Saver-Variable (z.B. "Schichtplan" aus saver.saver.attributes.variables)
  _readSaverVariable(key) {
    if (!this._hass || !this._hass.states || !key) {
      this._debug('[Saver] _readSaverVariable: Kein hass oder key vorhanden');
      return null;
    }

    // Saver-Variablen sind in saver.saver.attributes.variables gespeichert
    const saverEntity = this._hass?.states?.['saver.saver'];
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

  /**
   * Aktualisiert Warnungen basierend auf dem Storage-Adapter
   * @private
   */
  _updateWarnings() {
    if (!this._storage) {
      return;
    }

    const warnings = this._storage.getWarnings();
    if (warnings) {
      if (warnings.config) {
        this._configWarning = warnings.config;
        this._updateConfigWarningDirectly();
      }
      if (warnings.status) {
        this._statusWarning = warnings.status;
        this._updateStatusWarningDirectly();
      }
    } else {
      // Keine Warnungen - setze auf null
      if (this._configWarning) {
        this._configWarning = null;
        this._updateConfigWarningDirectly();
      }
      if (this._statusWarning) {
        this._statusWarning = null;
        this._updateStatusWarningDirectly();
      }
    }
  }

  async loadWorkingDays() {
    if (!this._hass || !this._config || !this._config.entity) {
      this._debug('[Laden] loadWorkingDays: Kein hass, config oder entity vorhanden');
      return;
    }

    // Stelle sicher, dass Storage initialisiert ist
    if (!this._storage) {
      this._initializeStorage();
    }

    if (!this._storage) {
      this._debug('[Laden] loadWorkingDays: Kein Storage-Adapter verfügbar');
      return;
    }

    this._debug(
      `[Laden] loadWorkingDays: Start, store_mode: "${this._config.store_mode}", entity: "${this._config.entity}"`
    );

    let dataString = null;
    let dataSource = 'none';

    // Versuche zuerst den primären Storage-Adapter
    try {
      dataString = await this._storage.loadData();
      if (dataString) {
        dataSource = this._config.store_mode === 'saver' ? 'saver' : 'entities';
        this._debug(
          `[Laden] loadWorkingDays: Daten von ${dataSource} geladen, Länge: ${dataString.length} Zeichen`
        );
      }
    } catch (error) {
      this._debug(`[Laden] loadWorkingDays: Fehler beim Laden: ${error.message}`, error);
    }

    // Fallback: Wenn Saver-Modus und keine Daten, versuche EntityStorage
    if ((!dataString || dataString.trim() === '') && this._config.store_mode === 'saver') {
      this._debug('[Laden] loadWorkingDays: Keine Daten vom Saver, Fallback zu Entities');
      try {
        const fallbackStorage = StorageFactory.createStorage(this._hass, { ...this._config, store_mode: 'text_entity' }, this._debug.bind(this));
        dataString = await fallbackStorage.loadData();
        if (dataString) {
          dataSource = 'entities-fallback';
          this._debug(
            `[Laden] loadWorkingDays: Daten von Entities (Fallback) geladen, Länge: ${dataString.length} Zeichen`
          );
        }
      } catch (error) {
        this._debug(`[Laden] loadWorkingDays: Fehler beim Fallback-Laden: ${error.message}`, error);
      }
    }

    // Synchronisiere _knownEntityIds mit EntityStorage (falls verwendet)
    if (this._storage && this._storage._knownEntityIds) {
      this._knownEntityIds = this._storage._knownEntityIds;
    }

    // Parse die Daten (egal ob von Saver oder Entities)
    if (dataString && dataString.trim() !== '') {
      this._debug(`[Laden] loadWorkingDays: Parse Daten von Quelle: "${dataSource}"`);
      this._debug(`[Laden] loadWorkingDays: Daten-String (erste 200 Zeichen): ${dataString.substring(0, 200)}...`);
      this.parseWorkingDays(dataString);
      const workingDaysCount = Object.keys(this._workingDays).length;
      this._debug(`[Laden] loadWorkingDays: Daten geparst, ${workingDaysCount} Monate gefunden`);
      this._debug(`[Laden] loadWorkingDays: Verfügbare Keys in _workingDays:`, Object.keys(this._workingDays));
      // Zeige Details für jeden Monat
      Object.keys(this._workingDays).forEach(key => {
        const monthData = this._workingDays[key];
        if (typeof monthData === 'object' && !Array.isArray(monthData)) {
          const daysCount = Object.keys(monthData).length;
          this._debug(`[Laden] loadWorkingDays: Monat "${key}": ${daysCount} Tage mit Daten`);
          // Zeige erste 5 Tage als Beispiel
          const sampleDays = Object.keys(monthData).slice(0, 5);
          sampleDays.forEach(day => {
            this._debug(`[Laden] loadWorkingDays: Monat "${key}", Tag ${day}:`, monthData[day]);
          });
        }
      });
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

      if (this._hass?.states?.[additionalEntityId]) {
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

    const entity = this._hass?.states?.[entityId];
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
        const entity = this._hass?.states?.[entityId];
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
    if (!this._hass || !this._hass.states) {
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
    if (!this._hass || !this._hass.states) {
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
    // Vollständiges JSON-Format: Objekt mit shifts, setup und lastchange
    // Format: {shifts:[], setup:{}, lastchange:123456789}
    const configObject = {
      shifts: activeShifts,
      setup: {
        timer_entity: this._config?.entity || '',
        store_mode: this._config?.store_mode || 'saver',
      },
      lastchange: Math.floor(Date.now() / 1000), // Unix-Timestamp (Sekunden seit 1970-01-01)
    };
    return JSON.stringify(configObject);
  }

  async saveConfigToEntity() {
    this._debug('[Config] saveConfigToEntity: === START: Speichere Konfiguration ===');
    
    // Speichere die Konfiguration in der Config-Entity oder im Saver
    // Verhindere Speichern beim initialen Load
    if (this._isInitialLoad) {
      this._debug('[Config] saveConfigToEntity: Initialer Load, überspringe Config-Speichern');
      return;
    }
    if (!this._hass || !this._config || !this._config.entity) {
      this._debug('[Config] saveConfigToEntity: Abbruch - hass, config oder entity fehlt', {
        hasHass: !!this._hass,
        hasConfig: !!this._config,
        hasEntity: !!(this._config && this._config.entity),
      });
      return;
    }

    this._debug('[Config] saveConfigToEntity: Prüfe Konfiguration', {
      store_mode: this._config.store_mode,
      saver_key: this._config.saver_key,
      entity: this._config.entity,
      calendars_count: this._config.calendars ? this._config.calendars.length : 0,
    });

    // Debug: Zeige alle empfangenen Kalender-Daten
    if (this._config.calendars && this._config.calendars.length > 0) {
      this._debug('[Config] saveConfigToEntity: Empfangene Kalender-Daten:', 
        JSON.stringify(this._config.calendars, null, 2)
      );
      this._config.calendars.forEach((cal, index) => {
        this._debug(`[Config] saveConfigToEntity: Kalender ${index + 1}:`, {
          shortcut: cal.shortcut,
          name: cal.name,
          color: cal.color,
          enabled: cal.enabled,
          statusRelevant: cal.statusRelevant,
          timeRanges_count: cal.timeRanges ? cal.timeRanges.length : 0,
          timeRanges: cal.timeRanges || []
        });
      });
    } else {
      this._debug('[Config] saveConfigToEntity: Keine Kalender-Daten vorhanden');
    }

    // Verwende direkt das calendars-Format vom Config-Panel (keine Konvertierung mehr nötig)
    const calendars = this._config.calendars || [];
    
    this._debug(`[Config] saveConfigToEntity: Speichere ${calendars.length} Kalender im neuen Format (direkt vom Config-Panel)`);
    
    // Debug: Zeige alle Kalender-Daten
    calendars.forEach((cal, index) => {
      this._debug(`[Config] saveConfigToEntity: Kalender ${index + 1}:`, {
        shortcut: cal.shortcut,
        name: cal.name,
        color: cal.color,
        enabled: cal.enabled,
        statusRelevant: cal.statusRelevant,
        timeRanges_count: cal.timeRanges ? cal.timeRanges.length : 0,
        timeRanges: cal.timeRanges || []
      });
    });

    // Stelle sicher, dass Storage initialisiert ist
    if (!this._storage) {
      this._debug('[Config] saveConfigToEntity: Storage nicht initialisiert, initialisiere...');
      this._initializeStorage();
    }

    if (!this._storage) {
      this._debug('[Config] saveConfigToEntity: Kein Storage-Adapter verfügbar');
      return;
    }

    this._debug('[Config] saveConfigToEntity: Storage-Adapter gefunden, starte Speichern...', {
      storageType: this._config.store_mode,
      storageAdapter: this._storage.constructor.name
    });

    try {
      // Verwende Storage-Adapter zum Speichern der Config
      // Für Saver: Direkt calendars-Format verwenden
      // Für Entity: Konvertierung zu komprimiertem Format (bleibt unverändert)
      this._debug('[Config] saveConfigToEntity: Rufe _storage.saveConfig() auf...');
      if (this._config.store_mode === 'saver') {
        // Saver: Direkt calendars-Format verwenden
        await this._storage.saveConfig(calendars);
      } else {
        // Entity: Konvertierung zu komprimiertem Format (für Rückwärtskompatibilität)
        // TODO: Könnte später auch auf calendars-Format umgestellt werden
        const allShifts = this._convertCalendarsToShifts(calendars);
        await this._storage.saveConfig(allShifts);
      }
      
      // Aktualisiere Warnungen
      this._updateWarnings();
      
      this._debug('[Config] saveConfigToEntity: === ENDE: Erfolgreich gespeichert ===');
    } catch (error) {
      // Fehler beim Schreiben - versuche Fallback
      this._debug(`[Config] saveConfigToEntity: === FEHLER === Beim Schreiben: ${error.message}`, error);
      
      // Fallback: Wenn SaverStorage fehlschlägt, versuche EntityStorage
      if (this._config.store_mode === 'saver') {
        this._debug('[Config] saveConfigToEntity: Fallback zu EntityStorage');
        try {
          const fallbackStorage = StorageFactory.createStorage(this._hass, { ...this._config, store_mode: 'text_entity' }, this._debug.bind(this));
          // Entity-Storage benötigt komprimiertes Format
          const allShifts = this._convertCalendarsToShifts(calendars);
          await fallbackStorage.saveConfig(allShifts);
          this._updateWarnings();
        } catch (fallbackError) {
          this._debug(`[Config] saveConfigToEntity: Auch Fallback fehlgeschlagen: ${fallbackError.message}`, fallbackError);
          this.checkConfigEntity();
        }
      } else {
        this.checkConfigEntity();
      }
    }
  }

  /**
   * Konvertiert calendars-Format zu komprimiertem shifts-Format (für Entity-Storage)
   * @private
   */
  _convertCalendarsToShifts(calendars) {
    const allShifts = [];
    if (calendars && Array.isArray(calendars)) {
      for (const calendar of calendars) {
        if (calendar && calendar.shortcut) {
          const isEnabled = calendar.enabled === true || calendar.enabled === 'true' || calendar.enabled === 1;
          const shiftData = [
            calendar.shortcut,
            calendar.name || `Schicht ${calendar.shortcut.toUpperCase()}`,
          ];

          // Konvertiere Zeiträume vom neuen Format zu altem Format
          if (calendar.timeRanges && Array.isArray(calendar.timeRanges) && calendar.timeRanges.length > 0) {
            // Zeitraum 1
            const range1 = calendar.timeRanges[0];
            let start1 = null;
            let end1 = null;
            if (range1) {
              if (typeof range1 === 'object' && range1.times && Array.isArray(range1.times)) {
                start1 = range1.times[0] && range1.times[0].trim() !== '' ? range1.times[0].trim() : null;
                end1 = range1.times[1] && range1.times[1].trim() !== '' ? range1.times[1].trim() : null;
              } else if (Array.isArray(range1) && range1.length >= 2) {
                start1 = range1[0] && range1[0].trim() !== '' ? range1[0].trim() : null;
                end1 = range1[1] && range1[1].trim() !== '' ? range1[1].trim() : null;
              }
            }
            shiftData.push(start1, end1);

            // Zeitraum 2
            const range2 = calendar.timeRanges[1];
            let start2 = null;
            let end2 = null;
            if (range2) {
              if (typeof range2 === 'object' && range2.times && Array.isArray(range2.times)) {
                start2 = range2.times[0] && range2.times[0].trim() !== '' ? range2.times[0].trim() : null;
                end2 = range2.times[1] && range2.times[1].trim() !== '' ? range2.times[1].trim() : null;
              } else if (Array.isArray(range2) && range2.length >= 2) {
                start2 = range2[0] && range2[0].trim() !== '' ? range2[0].trim() : null;
                end2 = range2[1] && range2[1].trim() !== '' ? range2[1].trim() : null;
              }
            }
            shiftData.push(start2, end2);
          } else {
            shiftData.push(null, null, null, null);
          }

          // statusRelevant
          const statusRelevant = calendar.statusRelevant !== false ? 1 : 0;
          shiftData.push(statusRelevant);

          // enabled
          const enabled = isEnabled ? 1 : 0;
          shiftData.push(enabled);

          allShifts.push(shiftData);
        }
      }
    }
    return allShifts;
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
      
      // Stelle sicher, dass Storage initialisiert ist
      if (!this._storage) {
        this._initializeStorage();
      }
      
      if (!this._storage) {
        this._debug('[Speichern] _saveToHA: Kein Storage-Adapter verfügbar');
        return;
      }

      const serializedData = this.serializeWorkingDays();
      this._debug(
        `[Speichern] _saveToHA: Daten serialisiert, Länge: ${serializedData.length} Zeichen, store_mode: "${this._config.store_mode}"`
      );

      // Setze Schreib-Lock
      this._isWriting = true;
      if (this._writeLockTimer) {
        clearTimeout(this._writeLockTimer);
      }

      try {
        // Verwende Storage-Adapter zum Speichern
        await this._storage.saveData(serializedData);
        
        // Prüfe Speicherverbrauch (nur für EntityStorage relevant)
        const storageUsage = this._storage.checkStorageUsage(serializedData.length);
        if (storageUsage) {
          this._storageWarning = storageUsage;
          this._updateStorageWarningDirectly();
        } else {
          this._storageWarning = null;
          this._updateStorageWarningDirectly();
        }
        
        this._debug('[Speichern] _saveToHA: Erfolgreich abgeschlossen');
      } catch (error) {
        // Fehler beim Speichern - versuche Fallback
        this._debug(`[Speichern] _saveToHA: Fehler beim Speichern, versuche Fallback: ${error.message}`, error);
        
        // Fallback: Wenn SaverStorage fehlschlägt, versuche EntityStorage
        if (this._config.store_mode === 'saver') {
          this._debug('[Speichern] _saveToHA: Fallback zu EntityStorage');
          const fallbackStorage = StorageFactory.createStorage(this._hass, { ...this._config, store_mode: 'text_entity' }, this._debug.bind(this));
          await fallbackStorage.saveData(serializedData);
        } else {
          throw error; // Bei EntityStorage gibt es keinen Fallback
        }
      } finally {
        // Setze Timer für Schreib-Lock (5 Sekunden)
        this._writeLockTimer = setTimeout(() => {
          this._isWriting = false;
          this._writeLockTimer = null;
          this._debug('[Speichern] _saveToHA: Schreib-Lock entfernt');
        }, 5000);
      }
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
      const saverEntity = this._hass?.states?.['saver.saver'];
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

  _getDefaultColorForShortcut(shortcut) {
    // Gibt die Standardfarbe für einen gegebenen Shortcut zurück
    const defaultCalendar = ShiftScheduleView.CALENDARS.find(cal => cal.shortcut === shortcut);
    return defaultCalendar ? defaultCalendar.defaultColor : '#ff9800';
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

      // Formatiere den Key mit formatTwoDigits, damit er mit den gespeicherten Daten übereinstimmt
      const key = `${this.formatTwoDigits(parseInt(yearKey))}:${this.formatTwoDigits(parseInt(monthKey))}`;
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
    // Reduziere Debug-Ausgaben: Nur bei ersten 3 Tagen oder wenn keine Daten gefunden werden
    const shouldDebug = day <= 3 || !this._workingDays[monthKey];
    
    if (shouldDebug) {
      this._debug(`[Render] _getDayElements: Suche nach monthKey="${monthKey}", day=${day}`);
    }
    
    if (!this._workingDays[monthKey] || typeof this._workingDays[monthKey] !== 'object') {
      if (shouldDebug) {
        this._debug(`[Render] _getDayElements: Keine Daten für monthKey="${monthKey}" gefunden oder kein Objekt`);
        this._debug(`[Render] _getDayElements: Verfügbare Keys in _workingDays:`, Object.keys(this._workingDays));
      }
      return [];
    }

    if (Array.isArray(this._workingDays[monthKey])) {
      // Altes Format: Array von Tagen
      if (shouldDebug) {
        this._debug(`[Render] _getDayElements: Altes Format (Array) für monthKey="${monthKey}"`);
      }
      return [];
    }

    const elements = this._workingDays[monthKey][day] || [];
    if (shouldDebug && elements.length > 0) {
      this._debug(`[Render] _getDayElements: Gefundene Elemente für "${monthKey}", Tag ${day}:`, elements);
    }

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
      '_showConfigPanel',
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
    if (!this._config) {
      return html`<div class="error">Keine Konfiguration vorhanden</div>`;
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
        <div class="schichtplan-wrapper">
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
        ${!this._showConfigPanel
          ? html`
              <div class="schichtplan-wrapper">
                <div class="schichtplan-menu-bar">
                  ${renderMenuBar({
                    left: '',
                    center: html`
                      <div class="menu-controls">
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
                      </div>
                    `,
                    right: html`
                      <button
                        class="menu-button config-button"
                        @click=${e => {
                          e.stopPropagation();
                          e.preventDefault();
                          this._showConfigPanel = true;
                          this.requestUpdate();
                        }}
                        title="Schichtkonfiguration"
                      >
                        ⚙️
                      </button>
                    `,
                    fullWidth: (() => {
                      const allCalendars = this._getAllCalendars();
                      const selectedShortcut = this._getSelectedCalendarShortcut();
                      return html`
                        <div class="color-bar">
                          ${allCalendars.map(calendar => {
                            const isSelected = calendar.shortcut === selectedShortcut;
                            const textColor = this._getContrastColor(calendar.color || '#ff9800');
                            return html`
                              <button
                                class="color-button ${isSelected ? 'selected' : ''}"
                                style="background-color: ${calendar.color || '#ff9800'}; color: ${textColor};"
                                @click=${() => this._onCalendarSelectedByIndex(calendar.shortcut)}
                                title="${calendar.name || `Schicht ${calendar.shortcut.toUpperCase()}`}"
                              >${calendar.name || `Schicht ${calendar.shortcut.toUpperCase()}`}</button>
                            `;
                          })}
                        </div>
                      `;
                    })(),
                  })}
                </div>
                <div class="schichtplan-panel">
                  ${months.map(({ year, month }) => this.renderMonth(year, month))}
                </div>
              </div>
            `
          : html``}
        ${this._showConfigPanel
          ? html`
              <div class="config-wrapper">
                <shift-config-panel
                  .calendars=${this._config?.calendars || []}
                  .selectedShortcut=${this._getSelectedCalendarShortcut()}
                  .hass=${this._hass}
                  @close=${() => {
                    this._showConfigPanel = false;
                    this.requestUpdate();
                  }}
                  @save=${e => this._handleConfigPanelSave(e.detail.calendars)}
                ></shift-config-panel>
              </div>
            `
          : html``}
      </div>
    `;
  }

  _handleConfigPanelSave(calendars) {
    // Aktualisiere die Config mit den neuen Kalendern
    if (this._config) {
      this._config.calendars = calendars;
      
      // Speichere nur über Saver (nicht über Editor)
      this.saveConfigToEntity();
      
      // Schließe das Panel
      this._showConfigPanel = false;
      
      // Aktualisiere die Ansicht
      this.requestUpdate();
    }
  }

  static styles = [
    super.styles || [],
    sharedMenuStyles,
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

      .schichtplan-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0;
        margin-bottom: 16px;
      }

      .schichtplan-menu-bar,
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

      /* Gemeinsame Menu-Styles und Farbleisten-Styles werden aus shared-menu-styles.js importiert */

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

      .config-button {
        font-size: 20px;
        background: none !important;
        border: none !important;
        color: var(--primary-text-color, #212121) !important;
        width: auto !important;
        height: auto !important;
        padding: 4px !important;
      }

      .config-button:hover {
        background: none !important;
        color: var(--primary-color, #03a9f4) !important;
        transform: scale(1.1);
      }

      .schichtplan-panel {
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding: 12px;
        background-color: var(--card-background-color, #ffffff);
        border-radius: 0 0 4px 4px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-top: none;
      }

      .config-wrapper {
        margin-bottom: 16px;
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
