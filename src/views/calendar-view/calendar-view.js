import { html, css, unsafeCSS } from 'lit';
import { ViewBase } from '../view-base.js';

export class CalendarView extends ViewBase {
  static className = 'CalendarView';

  // Zentrale Definition der Standardfarbe für ausgewählte Tage im Single-Modus
  static DEFAULT_SELECTED_DAY_COLOR = '#ff9800'; // Orange

  // Fixe Kalender-Definition: Standard (a) + 4 weitere (b, c, d, e)
  static CALENDARS = [
    { shortcut: 'a', name: 'Standardkalender', defaultColor: '#ff9800' },
    { shortcut: 'b', name: 'Kalender B', defaultColor: '#ff0000' },
    { shortcut: 'c', name: 'Kalender C', defaultColor: '#00ff00' },
    { shortcut: 'd', name: 'Kalender D', defaultColor: '#0000ff' },
    { shortcut: 'e', name: 'Kalender E', defaultColor: '#ffff00' },
  ];

  static get properties() {
    return {
      ...super.properties,
      hass: { type: Object },
      config: { type: Object },
      _workingDays: { type: Object },
      _storageWarning: { type: Object },
      _displayedMonths: { type: Number },
      _startMonthOffset: { type: Number },
      _selectedCalendar: { type: String },
    };
  }

  constructor() {
    super();
    this._workingDays = {}; // {"year:month": {day: [elements]}} - z.B. {"25:11": {1: ["a"], 2: ["a", "h"], 3: ["b"]}}
    this._storageWarning = null; // { show: boolean, currentLength: number, maxLength: number, percentage: number }
    this._knownEntityIds = null; // Cache für bekannte Entities [mainEntity, ...additionalEntities]
    this._cleanupDone = false; // Flag, ob die Bereinigung bereits beim initialen Laden ausgeführt wurde
    this._displayedMonths = 2; // Anzahl der angezeigten Monate (wird aus config.numberOfMonths initialisiert)
    this._startMonthOffset = 0; // Offset für den Startmonat (0 = aktueller Monat, -1 = Vormonat, +1 = nächster Monat)
    this._isWriting = false; // Flag, ob gerade geschrieben wird
    this._writeLockTimer = null; // Timer für das 5-Sekunden-Lock nach dem Schreiben
    this._selectedCalendar = 'a'; // Shortcut des ausgewählten Kalenders (Standard: 'a')
  }

  // Formatiert eine Zahl auf zwei Ziffern (z.B. 1 -> "01", 25 -> "25")
  formatTwoDigits(num) {
    return String(num).padStart(2, '0');
  }

  set hass(hass) {
    // Ignoriere Updates während des Schreibens und 5 Sekunden danach
    if (this._isWriting) {
      console.log('set hass: Update während des Schreibens ignoriert');
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
    if (this._config) {
      // Nur laden, wenn sich ein State tatsächlich geändert hat (nicht bei jedem Update)
      if (hasAnyEntityChanged) {
        this.loadWorkingDays();
      }
    }
    this.requestUpdate();
  }

  set config(config) {
    // Setze _config zuerst, damit _getActiveElements() funktioniert
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

    // Initialisiere _selectedElement - muss nach _config gesetzt werden, damit _getActiveElements() funktioniert

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
        console.log('set config: _selectedCalendar synchronisiert mit config.selectedCalendar:', this._selectedCalendar);
      } else {
        // Wenn der ausgewählte Kalender nicht aktiviert ist, verwende den ersten aktivierten
        if (allCalendars.length > 0) {
          this._selectedCalendar = allCalendars[0].shortcut;
          if (config) {
            config.selectedCalendar = this._selectedCalendar;
            this.dispatchEvent(
              new CustomEvent('config-changed', {
                detail: { config: config },
                bubbles: true,
                composed: true,
              })
            );
          }
        } else {
          // Fallback: Standardkalender (a) - sollte immer aktiviert sein
          this._selectedCalendar = 'a';
          if (config) {
            config.selectedCalendar = 'a';
            this.dispatchEvent(
              new CustomEvent('config-changed', {
                detail: { config: config },
                bubbles: true,
                composed: true,
              })
            );
          }
        }
      }
    } else {
      // Wenn kein selectedCalendar gesetzt ist, verwende den ersten aktivierten Kalender
      if (allCalendars.length > 0) {
        this._selectedCalendar = allCalendars[0].shortcut;
        if (config) {
          config.selectedCalendar = this._selectedCalendar;
          this.dispatchEvent(
            new CustomEvent('config-changed', {
              detail: { config: config },
              bubbles: true,
              composed: true,
            })
          );
        }
      } else {
        // Fallback: Standardkalender (a)
        this._selectedCalendar = 'a';
        if (config) {
          config.selectedCalendar = 'a';
          this.dispatchEvent(
            new CustomEvent('config-changed', {
              detail: { config: config },
              bubbles: true,
              composed: true,
            })
          );
        }
      }
    }

    if (this._hass) {
      this.loadWorkingDays();
    }
    this.requestUpdate();
  }

  async loadWorkingDays() {
    if (!this._hass || !this._config || !this._config.entity) return;

    // Ermittle die maximale Länge für alle Entities
    const maxLengths = this.getAllEntityMaxLengths();

    // Sammle alle Daten-Strings aus der Haupt-Entity und zusätzlichen Entities
    const dataStrings = [];

    // Prüfe auf zusätzliche Entities (z.B. input_text.arbeitszeiten_001, _002, etc.)
    const baseEntityId = this._config.entity;
    const additionalEntities = this.findAdditionalEntities(baseEntityId);

    // Speichere die Liste der bekannten Entities für späteres Schreiben
    // Diese Liste enthält: Haupt-Entity + alle zusätzlichen Entities
    this._knownEntityIds = [baseEntityId, ...additionalEntities];
    console.log('loadWorkingDays: Alle bekannten Entities (Haupt + zusätzliche):', this._knownEntityIds);

    // Lade Daten aus allen Entities (Haupt-Entity + zusätzliche)
    for (const entityId of this._knownEntityIds) {
      const entity = this._hass.states[entityId];
      if (entity && entity.state && entity.state.trim() !== '') {
        dataStrings.push(entity.state);
        const currentLength = entity.state.length;
        const maxLength = maxLengths[entityId];
        if (maxLength !== undefined) {
          console.log(`loadWorkingDays: ${entityId} - Länge: ${currentLength}/${maxLength}`);
        }
      }
    }

    // Füge alle Strings zusammen (mit ";" als Trennzeichen) und parse dann einmal
    console.log('loadWorkingDays: Anzahl dataStrings:', dataStrings.length);
    const additionalEntityIds = this._knownEntityIds ? this._knownEntityIds.slice(1) : [];
    console.log('loadWorkingDays: dataStrings Details:', {
      allEntities: this._knownEntityIds,
      dataLengths: dataStrings.map(s => s?.length || 0),
      mainEntity: this._config.entity,
      additionalEntities: additionalEntityIds
    });
    if (dataStrings.length > 0) {
      const combinedString = dataStrings.join(';');
      console.log('loadWorkingDays: Kombinierter String Länge:', combinedString.length);
      this.parseWorkingDays(combinedString);
    } else {
      this._workingDays = {};
    }

    // Prüfe Speicherverbrauch und zeige Warnung bei 90%+
    this.checkStorageUsage();

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

      console.log('loadWorkingDays: Bereinigung', {
        numberOfMonths,
        currentYear,
        currentMonth,
        monthsToKeep,
        keys: Object.keys(this._workingDays)
      });

      let hasChanges = false;

      for (const key of Object.keys(this._workingDays)) {
        // Parse den Key um zu prüfen, ob er behalten werden soll
        const keyParts = key.split(':');
        if (keyParts.length === 2) {
          const keyYear = parseInt(keyParts[0]);
          const keyMonth = parseInt(keyParts[1]);

          // Prüfe ob dieser Key in der Liste der zu behaltenden Monate ist
          const shouldKeep = monthsToKeep.some(
            m => m.year === keyYear && m.month === keyMonth
          );

          // console.log('loadWorkingDays: Prüfe Key', {
          //   key,
          //   keyYear,
          //   keyMonth,
          //   shouldKeep,
          //   monthsToKeep: monthsToKeep.map(m => `${m.year}:${m.month}`)
          // });

          if (!shouldKeep) {
            console.log('loadWorkingDays: Entferne Key', key);
            delete this._workingDays[key];
            hasChanges = true;
          }
        } else {
          // Ungültiges Format, entfernen
          console.log('loadWorkingDays: Ungültiges Format, entferne Key', key);
          delete this._workingDays[key];
          hasChanges = true;
        }
      }

      // Wenn Änderungen vorgenommen wurden, speichere die bereinigten Daten
      if (hasChanges) {
        const cleanedValue = this.serializeWorkingDays();
        console.log('loadWorkingDays: Alte Monate entfernt, neue Werte:', cleanedValue);
        try {
          await this._hass.callService('input_text', 'set_value', {
            entity_id: this._config.entity,
            value: cleanedValue,
          });
        } catch (error) {
          console.error('loadWorkingDays: Fehler beim Speichern der bereinigten Daten', error);
        }
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
        const elements = elementsStr.split('').filter(e => e.trim() !== '');

        if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= 31) {
          // Wenn der Tag bereits existiert, füge Elemente hinzu (keine Duplikate)
          if (result[dayNum]) {
            // Vereinige Arrays und entferne Duplikate
            result[dayNum] = [...new Set([...result[dayNum], ...elements])];
          } else {
            result[dayNum] = elements;
          }
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
      console.log(`getAllEntityMaxLengths: ${mainEntityId} max length: ${mainMaxLength}`);
    }

    // Prüfe zusätzliche Entities
    const additionalEntities = this.findAdditionalEntities(mainEntityId);
    for (const additionalEntityId of additionalEntities) {
      const additionalMaxLength = this.getEntityMaxLength(additionalEntityId);
      if (additionalMaxLength !== null) {
        maxLengths[additionalEntityId] = additionalMaxLength;
        console.log(`getAllEntityMaxLengths: ${additionalEntityId} max length: ${additionalMaxLength}`);
      }
    }

    return maxLengths;
  }

  checkStorageUsage(serializedDataLength = null) {
    if (!this._hass || !this._config || !this._config.entity) {
      this._storageWarning = null;
      this.requestUpdate();
      return;
    }

    // Verwende _knownEntityIds falls verfügbar, sonst suche neu
    let allEntityIds;
    if (this._knownEntityIds && this._knownEntityIds.length > 0) {
      allEntityIds = [...this._knownEntityIds];
      console.log('checkStorageUsage: Verwende gecachte Entity-Liste:', allEntityIds);
    } else {
      // Fallback: Suche Entities neu
      allEntityIds = [this._config.entity, ...this.findAdditionalEntities(this._config.entity)];
      console.log('checkStorageUsage: Entity-Liste neu gesucht:', allEntityIds);
    }

    const maxLengths = this.getAllEntityMaxLengths();
    if (Object.keys(maxLengths).length === 0) {
      this._storageWarning = null;
      this.requestUpdate();
      return;
    }

    // Berechne Gesamtlänge und maximale Gesamtlänge
    let totalCurrentLength = 0;
    let totalMaxLength = 0;

    // Wenn eine serializedDataLength übergeben wurde, verwende diese (z.B. nach toggleDay)
    // Ansonsten lese die Längen aus den aktuellen States
    if (serializedDataLength !== null && serializedDataLength !== undefined) {
      totalCurrentLength = serializedDataLength;
      console.log('checkStorageUsage: Verwende übergebene Datenlänge:', serializedDataLength);
    } else {
      // Lese Längen aus den aktuellen States
      for (const entityId of allEntityIds) {
        const entity = this._hass.states[entityId];
        if (entity && entity.state) {
          totalCurrentLength += entity.state.length;
        }
      }
      console.log('checkStorageUsage: Lese Längen aus aktuellen States');
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
      this.requestUpdate();
      return;
    }

    const percentage = (totalCurrentLength / totalMaxLength) * 100;
    console.log('checkStorageUsage: Speicherverbrauch:', {
      totalCurrentLength,
      totalMaxLength,
      percentage: Math.round(percentage * 10) / 10
    });

    // Prüfe ob 90% überschritten werden
    if (percentage >= 90) {
      this._storageWarning = {
        show: true,
        currentLength: totalCurrentLength,
        maxLength: totalMaxLength,
        percentage: Math.round(percentage * 10) / 10,
      };
      console.warn('checkStorageUsage: 90% der Gesamtlänge überschritten!', this._storageWarning);
    } else {
      this._storageWarning = null;
    }

    // Wichtig: requestUpdate() aufrufen, damit die Warnung angezeigt wird
    this.requestUpdate();
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
        const formattedDays = dayEntries.map(dayNum => {
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
        }).join(',');
        parts.push(`${key}:${formattedDays}`);
      }
    }
    return parts.join(';');
  }

  async distributeDataToEntities(serializedData) {
    if (!this._hass || !this._config || !this._config.entity) {
      console.error('distributeDataToEntities: hass oder config fehlt');
      return;
    }

    // Setze Schreib-Lock
    this._isWriting = true;
    console.log('distributeDataToEntities: Schreib-Lock aktiviert');

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
      console.log('distributeDataToEntities: Verwende gecachte Entity-Liste:', allEntityIds);

      // Prüfe ob neue Entities hinzugekommen sind
      const currentAdditionalEntities = this.findAdditionalEntities(this._config.entity);
      const knownAdditionalCount = this._knownEntityIds.length - 1; // -1 für Haupt-Entity
      if (currentAdditionalEntities.length > knownAdditionalCount) {
        // Neue Entities gefunden, aktualisiere die Liste
        const newEntities = currentAdditionalEntities.slice(knownAdditionalCount);
        allEntityIds.push(...newEntities);
        this._knownEntityIds = [...allEntityIds];
        console.log('distributeDataToEntities: Neue Entities gefunden und hinzugefügt:', newEntities);
      }
    } else {
      // Keine gecachte Liste vorhanden, sammle Entities neu
      allEntityIds = [this._config.entity];
      const additionalEntities = this.findAdditionalEntities(this._config.entity);
      allEntityIds.push(...additionalEntities);
      this._knownEntityIds = [...allEntityIds];
      console.log('distributeDataToEntities: Entity-Liste neu gesammelt:', allEntityIds);
    }

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
        console.warn(`distributeDataToEntities: Keine max-Länge für ${entityId}, verwende Standardwert 255`);
      }
    }

    // Debug: Zeige wie viele Zeichen wir schreiben wollen vs. können
    const dataLength = serializedData ? serializedData.length : 0;
    console.log('distributeDataToEntities: Zeichen-Statistik:', {
      wollenSchreiben: dataLength,
      koennenSchreiben: totalMaxLength,
      verfuegbar: totalMaxLength - dataLength,
      prozent: totalMaxLength > 0 ? Math.round((dataLength / totalMaxLength) * 100 * 10) / 10 : 0,
      entities: allEntityIds.length,
      maxLengthsPerEntity: maxLengths
    });

    // Wenn keine Daten vorhanden sind, setze alle Entities auf leer
    if (!serializedData || serializedData.trim() === '') {
      console.log('distributeDataToEntities: Keine Daten, setze alle Entities auf leer');
      for (const entityId of allEntityIds) {
        try {
          await this._hass.callService('input_text', 'set_value', {
            entity_id: entityId,
            value: '',
          });
        } catch (error) {
          console.error(`distributeDataToEntities: Fehler beim Leeren von ${entityId}`, error);
        }
      }
      // Setze Timer auch wenn keine Daten vorhanden waren
      this._writeLockTimer = setTimeout(() => {
        this._isWriting = false;
        this._writeLockTimer = null;
        console.log('distributeDataToEntities: Schreib-Lock nach 5 Sekunden deaktiviert (keine Daten)');
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

      console.log(`distributeDataToEntities: ${currentEntityId} - Schreibe ${charsToTake} Zeichen, verbleibend: ${remainingData.length}`);

      // Wenn noch Daten übrig sind, wechsle zur nächsten Entity
      if (remainingData.length > 0) {
        currentEntityIndex++;
      }
    }

    // Wenn am Ende noch Text über ist, prüfe ob zwischenzeitlich eine zusätzliche Entität angelegt wurde
    if (remainingData.length > 0) {
      console.log(`distributeDataToEntities: Noch ${remainingData.length} Zeichen übrig, prüfe auf neue Entities...`);

      // Prüfe ob neue Entities hinzugekommen sind
      const currentAdditionalEntities = this.findAdditionalEntities(this._config.entity);
      const knownAdditionalCount = this._knownEntityIds ? this._knownEntityIds.length - 1 : 0; // -1 für Haupt-Entity

      if (currentAdditionalEntities.length > knownAdditionalCount) {
        // Neue Entities gefunden
        const newEntities = currentAdditionalEntities.slice(knownAdditionalCount);
        console.log(`distributeDataToEntities: ${newEntities.length} neue Entities gefunden:`, newEntities);

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
            console.warn(`distributeDataToEntities: Keine max-Länge für ${newEntityId}, verwende Standardwert 255`);
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

          console.log(`distributeDataToEntities: ${currentEntityId} (neu) - Schreibe ${charsToTake} Zeichen, verbleibend: ${remainingData.length}`);

          if (remainingData.length > 0) {
            currentEntityIndex++;
          }
        }
      } else {
        console.error(`distributeDataToEntities: Keine neuen Entities gefunden, aber noch ${remainingData.length} Zeichen übrig!`);
      }
    }

    // Schreibe die Werte in die Entities (sequenziell, um sicherzustellen, dass alle Calls abgeschlossen sind)
    for (const entityId of allEntityIds) {
      const value = entityValues[entityId] || '';
      const maxLength = maxLengths[entityId];

      // Der Wert sollte nie die maximale Länge überschreiten, da wir zeichenweise verteilen
      if (value.length > maxLength) {
        console.error(`distributeDataToEntities: FEHLER - Wert überschreitet max-Länge für ${entityId}! Länge: ${value.length}, Max: ${maxLength}`);
        // Kürze den Wert auf die maximale Länge (als Notfall-Lösung)
        const truncatedValue = value.substring(0, maxLength);
        console.warn(`distributeDataToEntities: Wert wird auf ${maxLength} Zeichen gekürzt`);
        try {
          await this._hass.callService('input_text', 'set_value', {
            entity_id: entityId,
            value: truncatedValue,
          });
          console.log(`distributeDataToEntities: ${entityId} - Länge: ${truncatedValue.length}/${maxLength} (GEKÜRZT!)`);
        } catch (error) {
          console.error(`distributeDataToEntities: Fehler beim Speichern in ${entityId}`, error);
        }
      } else {
        try {
          await this._hass.callService('input_text', 'set_value', {
            entity_id: entityId,
            value: value,
          });
          console.log(`distributeDataToEntities: ${entityId} - Länge: ${value.length}/${maxLength}`);
        } catch (error) {
          console.error(`distributeDataToEntities: Fehler beim Speichern in ${entityId}`, error);
        }
      }
    }

    // Leere alle zusätzlichen Entities, die nicht verwendet wurden (um alte Daten zu entfernen)
    // Wir müssen alle bekannten zusätzlichen Entities prüfen, nicht nur die in allEntityIds
    const allAdditionalEntities = this.findAdditionalEntities(this._config.entity);
    for (const additionalEntityId of allAdditionalEntities) {
      // Wenn diese Entity nicht in entityValues ist, bedeutet das, dass sie nicht verwendet wurde
      if (!(additionalEntityId in entityValues)) {
        try {
          await this._hass.callService('input_text', 'set_value', {
            entity_id: additionalEntityId,
            value: '',
          });
          console.log(`distributeDataToEntities: ${additionalEntityId} - Leere ungenutzte Entity`);
        } catch (error) {
          console.error(`distributeDataToEntities: Fehler beim Leeren von ${additionalEntityId}`, error);
        }
      }
    }

      // Wenn noch Daten übrig sind, die nicht gespeichert werden konnten
      if (remainingData.length > 0) {
        console.error(`distributeDataToEntities: WARNUNG - ${remainingData.length} Zeichen konnten nicht gespeichert werden!`, remainingData);
      }
    } catch (error) {
      console.error('distributeDataToEntities: Fehler beim Verteilen der Daten', error);
    } finally {
      // Schreib-Lock für weitere 5 Sekunden aufrechterhalten (um sicherzustellen, dass alle Updates verarbeitet wurden)
      this._writeLockTimer = setTimeout(() => {
        this._isWriting = false;
        this._writeLockTimer = null;
        console.log('distributeDataToEntities: Schreib-Lock nach 5 Sekunden deaktiviert');
      }, 5000);
    }
  }

  async toggleDay(month, day, year = null) {
    console.log('toggleDay aufgerufen', { month, day, year, hass: !!this._hass, config: !!this._config });

    // Stelle sicher, dass month und day Zahlen sind
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);

    if (isNaN(monthNum) || isNaN(dayNum)) {
      console.error('toggleDay: Ungültige Werte', { month, day, monthNum, dayNum });
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
      isPreviousMonth = (monthNum === 12 && yearNum === (currentYearFull - 1) % 100);
    } else {
      // Vormonat ist aktueller Monat - 1 im gleichen Jahr
      isPreviousMonth = (monthNum === currentMonth - 1 && yearNum === currentYear);
    }

    if (isPreviousMonth) {
      console.log('toggleDay: Vormonat ist schreibgeschützt, Aktion abgebrochen');
      return;
    }

    if (!this._hass || !this._config || !this._config.entity) {
      console.error('toggleDay: hass oder config fehlt', { hass: !!this._hass, config: !!this._config, entity: this._config?.entity });
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
    console.log('toggleDay: Ausgewählter Kalender-Shortcut:', selectedCalendarShortcut);
    console.log('toggleDay: Vorher - workingDays[key]:', this._workingDays[key]);
    console.log('toggleDay: Vorher - Tag', dayNum, 'hat:', this._workingDays[key]?.[dayNum]);

    if (!selectedCalendarShortcut) {
      // Fallback: Standardkalender (a)
      const defaultShortcut = 'a';
      if (!this._workingDays[key][dayNum]) {
        this._workingDays[key][dayNum] = [];
      }
      const elements = this._workingDays[key][dayNum];
      const elementIndex = elements.indexOf(defaultShortcut);
      if (elementIndex > -1) {
        elements.splice(elementIndex, 1);
        if (elements.length === 0) {
          delete this._workingDays[key][dayNum];
          if (Object.keys(this._workingDays[key]).length === 0) {
            delete this._workingDays[key];
          }
        }
      } else {
        elements.push(defaultShortcut);
      }
    } else {
      // Tag mit Kalender
      if (!this._workingDays[key][dayNum]) {
        this._workingDays[key][dayNum] = [];
      }

      // WICHTIG: Erstelle eine Kopie des Arrays, um sicherzustellen, dass wir mit dem richtigen Array arbeiten
      const elements = [...(this._workingDays[key][dayNum] || [])];
      console.log('toggleDay: Vor Toggle - elements:', elements);
      console.log('toggleDay: Soll Kalender hinzufügen/entfernen:', selectedCalendarShortcut);

      const elementIndex = elements.indexOf(selectedCalendarShortcut);

      if (elementIndex > -1) {
        // Kalender entfernen
        console.log('toggleDay: Entferne Kalender', selectedCalendarShortcut, 'von Tag', dayNum);
        elements.splice(elementIndex, 1);
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
        console.log('toggleDay: Füge Kalender', selectedCalendarShortcut, 'zu Tag', dayNum, 'hinzu');
        if (!elements.includes(selectedCalendarShortcut)) {
          elements.push(selectedCalendarShortcut);
          // Aktualisiere das Array im _workingDays
          this._workingDays[key][dayNum] = elements;
        }
      }
      console.log('toggleDay: Nach Toggle - elements:', this._workingDays[key][dayNum]);
    }

    console.log('toggleDay: Nachher - workingDays[key]:', this._workingDays[key]);

    const serializedData = this.serializeWorkingDays();
    console.log('toggleDay: Neue Werte', { monthNum, yearNum, dayNum, workingDays: this._workingDays[key], serializedData, entity: this._config.entity });

    // Verteile die Daten auf mehrere Entities, falls nötig
    await this.distributeDataToEntities(serializedData);

    // Prüfe Speicherverbrauch nach dem Toggle
    // Verwende die Länge der serialisierten Daten, da die States noch nicht aktualisiert sind
    this.checkStorageUsage(serializedData.length);
    this.requestUpdate();
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
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  getMonthName(month) {
    const months = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
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
    const isToday = (year === currentYear && month === currentMonth && currentDay === today);

    // Prüfe ob der ausgewählte Kalender an diesem Tag aktiv ist
    const selectedShortcut = this._getSelectedCalendarShortcut();
    const hasSelectedShift = selectedShortcut && dayElements.includes(selectedShortcut);
    const selectedCalendar = this._getCalendarByShortcut(selectedShortcut);
    let buttonStyle = '';

    // isWorking sollte nur true sein, wenn der ausgewählte Kalender aktiv ist
    const isWorking = hasSelectedShift;

    // Im Modus "single": Verwende Orange für ausgewählte Tage (nur wenn Kalender "a" aktiv ist)
    if (this._config?.mode === 'single' && isWorking) {
      buttonStyle = `background-color: ${CalendarView.DEFAULT_SELECTED_DAY_COLOR};`;
    } else if (hasSelectedShift && selectedCalendar && selectedCalendar.color) {
      // In Advanced-Modi: Verwende die Farbe des ausgewählten Kalenders
      buttonStyle = `background-color: ${selectedCalendar.color};`;
    }

        // Erstelle visuelle Darstellung der Kalender (alle außer dem ausgewählten)
        // Nur aktivierte Kalender werden angezeigt
        const shiftIndicators = dayElements
          .filter(shortcut => shortcut !== selectedShortcut) // Filtere den ausgewählten Kalender heraus
          .map(shortcut => {
            const calendar = this._getCalendarByShortcut(shortcut);
            // Nur anzeigen, wenn der Kalender aktiviert ist
            if (calendar && calendar.enabled && calendar.color) {
              return html`
                <span
                  class="shift-indicator"
                  style="background-color: ${calendar.color};"
                  title="${calendar.name || `Kalender ${shortcut.toUpperCase()}`}">
                </span>
              `;
            }
            return null; // Nicht anzeigen, wenn Kalender deaktiviert ist
          })
          .filter(indicator => indicator !== null); // Entferne null-Werte

    return html`
      <td>
        <button
          class="day-button ${isWorking ? 'working' : ''} ${isToday ? 'today' : ''} ${isPreviousMonth ? 'readonly' : ''}"
          style="${buttonStyle}"
          @click=${() => !isPreviousMonth && this.toggleDay(monthKey, currentDay, yearKey)}
          ?disabled=${isPreviousMonth}
          data-month="${monthKey}"
          data-day="${currentDay}"
          data-year="${yearKey}">
          <span class="day-number">${currentDay}</span>
          ${shiftIndicators.length > 0 ? html`<div class="shifts-container">${shiftIndicators}</div>` : ''}
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
      isPreviousMonth = (month === 11 && year === currentYear - 1);
    } else {
      // Vormonat ist aktueller Monat - 1 im gleichen Jahr
      isPreviousMonth = (month === currentMonth - 1 && year === currentYear);
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
        firstRowCells.push(this.renderDay(day, monthKey, yearKey, key, workingDays, isPreviousMonth, year, month));
        day++;
      }
    rows.push(html`<tr>${firstRowCells}</tr>`);

    // Weitere Wochen
    while (day <= daysInMonth) {
      const date = new Date(year, month, day);
      const weekNum = this.getWeekNumber(date);
      const rowCells = [html`<td class="week-label">${weekNum}</td>`];

      // Rendere immer 7 Zellen pro Woche (Tage oder leere Zellen)
      for (let i = 0; i < 7; i++) {
        if (day <= daysInMonth) {
          rowCells.push(this.renderDay(day, monthKey, yearKey, key, workingDays, isPreviousMonth, year, month));
          day++;
        } else {
          // Leere Zelle am Ende der letzten Woche
          rowCells.push(html`<td></td>`);
        }
      }
      rows.push(html`<tr>${rowCells}</tr>`);
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
      canGoForward: currentOffset < maxOffset
    };
  }

  _getSelectedCalendarShortcut() {
    // Gibt den Shortcut des ausgewählten Kalenders zurück
    // console.log('_getSelectedCalendarShortcut: _selectedCalendar =', this._selectedCalendar);
    // console.log('_getSelectedCalendarShortcut: config.selectedCalendar =', this._config?.selectedCalendar);

    // Prüfe zuerst _selectedCalendar
    if (this._selectedCalendar !== null && this._selectedCalendar !== undefined && this._selectedCalendar !== '') {
      // console.log('_getSelectedCalendarShortcut: Verwende _selectedCalendar:', this._selectedCalendar);
      return this._selectedCalendar;
    }

    // Falls _selectedCalendar nicht gesetzt ist, prüfe die Config
    if (this._config?.selectedCalendar) {
      this._selectedCalendar = this._config.selectedCalendar;
      // console.log('_getSelectedCalendarShortcut: Verwende selectedCalendar aus Config:', this._selectedCalendar);
      return this._selectedCalendar;
    }

    // Fallback: Standardkalender (a)
    // console.log('_getSelectedCalendarShortcut: Fallback zu Standardkalender (a)');
    return 'a';
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
      .filter(cal => cal && cal.shortcut && (cal.enabled === true || cal.enabled === 'true' || cal.enabled === 1))
      .sort((a, b) => a.shortcut.localeCompare(b.shortcut));
  }

  _getSelectedCalendarValue() {
    const allCalendars = this._getAllCalendars();

    if (allCalendars.length === 0) {
      // Wenn keine Kalender aktiviert sind, verwende Standardkalender (a)
      // Stelle sicher, dass Standardkalender immer verfügbar ist
      if (this._selectedCalendar !== 'a') {
        this._selectedCalendar = 'a';
        if (this._config) {
          this._config.selectedCalendar = 'a';
        }
        this.requestUpdate();
      }
      return 'a';
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
        this.dispatchEvent(
          new CustomEvent('config-changed', {
            detail: { config: this._config },
            bubbles: true,
            composed: true,
          })
        );
      }

      this.requestUpdate();
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

    return this._workingDays[monthKey][day] || [];
  }

  _getElementByShortcut(shortcut) {
    // Gibt das Element-Objekt für einen gegebenen Shortcut zurück
    if (!this._config?.elements) {
      return null;
    }

    return this._config.elements.find(e => e.shortcut === shortcut && e.aktiv) || null;
  }

  _getActiveElements() {
    if (!this._config?.useElements || !this._config?.elements) {
      return [];
    }

    // Filtere nur aktive Elemente und behalte den ursprünglichen Index
    const activeElements = this._config.elements
      .map((element, index) => {
        // Prüfe sowohl auf true als auch auf "true" (String)
        const isActive = element.aktiv === true || element.aktiv === 'true' || element.aktiv === 1;
        return { element, originalIndex: index, isActive };
      })
      .filter(({ isActive }) => isActive)
      .map(({ element, originalIndex }) => ({ element, originalIndex }));

    return activeElements;
  }

  _getSelectedElementValue() {
    const activeElements = this._getActiveElements();

    if (activeElements.length === 0) {
      return '';
    }

    // Wenn _selectedElement noch nicht gesetzt ist, setze es auf das erste aktive Element
    if (this._selectedElement === null || this._selectedElement === undefined) {
      this._selectedElement = activeElements[0].originalIndex;
      // Speichere es auch in der Config
      if (this._config) {
        this._config.selectedElement = this._selectedElement;
      }
      // Aktualisiere die Ansicht, damit der Dropdown den Wert anzeigt
      this.requestUpdate();
      return '1'; // 1-basiert: erstes Element = 1
    }

    // Prüfe ob das ausgewählte Element auch aktiv ist
    const foundIndex = activeElements.findIndex(({ originalIndex }) => originalIndex === this._selectedElement);

    // Wenn das Element nicht in der aktiven Liste gefunden wird, verwende das erste Element
    if (foundIndex < 0) {
      this._selectedElement = activeElements[0].originalIndex;
      if (this._config) {
        this._config.selectedElement = this._selectedElement;
      }
      // Dispatch config-changed Event, damit die Config gespeichert wird
      this.dispatchEvent(
        new CustomEvent('config-changed', {
          detail: { config: this._config },
          bubbles: true,
          composed: true,
        })
      );
      // Aktualisiere die Ansicht, damit der Dropdown den Wert anzeigt
      this.requestUpdate();
      return '1'; // 1-basiert: erstes Element = 1
    }

    // 1-basiert: foundIndex 0 -> Wert 1, foundIndex 1 -> Wert 2, etc.
    const value = String(foundIndex + 1);

    // Stelle sicher, dass der Wert nicht leer ist
    if (value === '' || value === 'undefined' || value === 'null' || isNaN(foundIndex)) {
      return '1';
    }

    return value;
  }

  _onElementSelected(event) {
    // ha-select verwendet event.detail.value für value-changed
    const value = event.detail?.value !== undefined ? event.detail.value : event.target.value;
    let selectedIndex = null;

    if (value !== '' && value !== null && value !== undefined) {
      // Der Wert ist 1-basiert (1 = erstes Element, 2 = zweites Element, etc.)
      // Wir müssen ihn in einen 0-basierten Index umwandeln
      const activeElements = this._getActiveElements();
      const parsedValue = parseInt(value);
      // 1-basiert -> 0-basiert: Wert 1 -> Index 0, Wert 2 -> Index 1, etc.
      const arrayIndex = parsedValue - 1;
      if (!isNaN(arrayIndex) && arrayIndex >= 0 && activeElements[arrayIndex]) {
        selectedIndex = activeElements[arrayIndex].originalIndex;
      } else if (activeElements.length > 0) {
        // Fallback: erstes aktives Element, falls Wert ungültig
        selectedIndex = activeElements[0].originalIndex;
      }
    } else {
      // Wenn kein Wert, aber aktive Elemente vorhanden, verwende das erste
      const activeElements = this._getActiveElements();
      if (activeElements.length > 0) {
        selectedIndex = activeElements[0].originalIndex;
      }
    }

    this._selectedElement = selectedIndex;

    // Aktualisiere die Config mit der neuen Auswahl
    if (this._config && selectedIndex !== null) {
      this._config = {
        ...this._config,
        selectedElement: selectedIndex,
      };

      // Dispatch config-changed Event, damit die Card die Config aktualisiert
      this.dispatchEvent(
        new CustomEvent('config-changed', {
          detail: { config: this._config },
          bubbles: true,
          composed: true,
        })
      );
    }

    this.requestUpdate();
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

    const hasWarning = this._storageWarning && this._storageWarning.show;
    const navBounds = this.getNavigationBounds();

    return html`
      <div class="calendar-wrapper ${hasWarning ? 'storage-warning-active' : ''}">
        ${hasWarning
          ? html`
              <div class="storage-warning">
                <div class="warning-icon">⚠️</div>
                <div class="warning-content">
                  <div class="warning-title">Speicherplatz fast voll!</div>
                  <div class="warning-message">
                    ${this._storageWarning.percentage}% der verfügbaren Speicherkapazität verwendet
                    (${this._storageWarning.currentLength} / ${this._storageWarning.maxLength} Zeichen).
                  </div>
                  <div class="warning-action">
                    Bitte legen Sie ein zusätzliches Input-Text-Feld an (z.B. ${this._config.entity}_${String(this.findAdditionalEntities(this._config.entity).length + 1).padStart(3, '0')}).
                  </div>
                </div>
              </div>
            `
          : ''}
        <div class="menu-bar">
          <button
            class="menu-button navigation-button"
            @click=${() => this.changeStartMonth(-1)}
            ?disabled=${!navBounds.canGoBack}
            title="Vorheriger Monat">
            ←
          </button>
          <button
            class="menu-button decrease-button"
            @click=${() => this.changeDisplayedMonths(-1)}
            ?disabled=${displayedMonths <= 1}
            title="Weniger Monate anzeigen">
            −
          </button>
          <div class="menu-number">${displayedMonths}</div>
          <button
            class="menu-button increase-button"
            @click=${() => this.changeDisplayedMonths(1)}
            ?disabled=${displayedMonths >= maxMonths}
            title="Mehr Monate anzeigen">
            +
          </button>
          <button
            class="menu-button navigation-button"
            @click=${() => this.changeStartMonth(1)}
            ?disabled=${!navBounds.canGoForward}
            title="Nächster Monat">
            →
          </button>
          ${this._config?.mode !== 'single'
            ? (() => {
                const allCalendars = this._getAllCalendars();
                const selectedValue = this._getSelectedCalendarValue();
                return html`
                  <div class="calendar-selector">
                    <ha-select
                      .value=${selectedValue || 'a'}
                      @selected=${(e) => {
                        const index = e.detail?.index;
                        if (index !== undefined && index !== null && index >= 0 && allCalendars[index]) {
                          const selectedCalendar = allCalendars[index];
                          this._onCalendarSelectedByIndex(selectedCalendar.shortcut);
                        }
                      }}
                      naturalMenuWidth
                      fixedMenuPosition
                    >
                      ${allCalendars.map(calendar => {
                        return html`
                          <mwc-list-item value="${calendar.shortcut}">
                            ${calendar.name || `Kalender ${calendar.shortcut.toUpperCase()}`}
                          </mwc-list-item>
                        `;
                      })}
                    </ha-select>
                  </div>
                `;
              })()
            : ''}
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
        --tgcalendar-default-selected-day-color: ${unsafeCSS(CalendarView.DEFAULT_SELECTED_DAY_COLOR)};
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
        transition: background-color 0.2s ease, opacity 0.2s ease;
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

      .calendar-selector ha-select {
        width: 100%;
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

      .day-button.working {
        /* background-color wird jetzt dynamisch per style gesetzt, wenn eine Schicht ausgewählt ist */
        color: var(--text-primary-color, #ffffff);
        font-weight: bold;
      }

      /* Fallback: Wenn keine Schicht ausgewählt ist, verwende die Standardfarbe */
      .day-button.working:not([style*="background-color"]) {
        background-color: var(--accent-color, var(--tgcalendar-default-selected-day-color));
      }

      .day-button.today {
        border: 2px solid var(--primary-color, #03a9f4);
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
        background-color: var(--warning-color, var(--tgcalendar-default-selected-day-color));
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
    `,
  ];
}

// Registriere CalendarView als Custom Element
if (!customElements.get('calendar-view')) {
  customElements.define('calendar-view', CalendarView);
}

