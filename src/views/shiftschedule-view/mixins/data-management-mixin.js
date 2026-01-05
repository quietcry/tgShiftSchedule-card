/**
 * DataManagementMixin - Serialisierung und Parsing von WorkingDays
 * 
 * Wiederverwendbar in anderen Projekten!
 * 
 * **Abhängigkeiten (müssen in der Hauptklasse initialisiert werden):**
 * - `this._workingDays` - Objekt mit WorkingDays-Daten: `{"year:month": {day: [elements]}}`
 * - `this.formatTwoDigits()` - Methode aus DateUtils (wird per Object.assign hinzugefügt)
 * 
 * @example
 * import { DataManagementMixin } from './mixins/data-management-mixin';
 * import { DateUtils } from '../../utils/date-utils';
 * class MyView extends LitElement {
 *   constructor() {
 *     super();
 *     this._workingDays = {};
 *     Object.assign(this, DateUtils, DataManagementMixin);
 *   }
 * }
 */
export const DataManagementMixin = {
  /**
   * Serialisiert WorkingDays zu String-Format
   * Format: <jahr>:<monat>:<tag><elementen>,<tag><elementen>;<jahr>:<monat>:<tag><elementen>
   * Beispiel: "25:11:01a,02ab,03b;25:12:01a,09a"
   * @returns {string} Serialisierte Daten
   */
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
  },

  /**
   * Parst Daten-String zu WorkingDays-Objekt
   * @param {string} dataString - Serialisierte Daten
   */
  parseWorkingDays(dataString) {
    this._workingDays = {};
    this._parseWorkingDaysIntoObject(dataString, this._workingDays);
  },

  /**
   * Parst Daten-String in ein Ziel-Objekt
   * @private
   * @param {string} dataString - Serialisierte Daten
   * @param {Object} targetObject - Ziel-Objekt für die geparsten Daten
   */
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
  },

  /**
   * Parst Tage mit Elementen: "01a,02ah,03b" -> {1: ["a"], 2: ["a", "h"], 3: ["b"]}
   * Oder altes Format ohne Elemente: "01,02,03" -> {1: [], 2: [], 3: []}
   * @private
   * @param {string} daysStr - String mit Tagen und Elementen
   * @returns {Object} Objekt mit Tagen als Keys und Elementen als Arrays
   */
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
        // Debug-Log wenn kein Match gefunden wurde (nur wenn _debug vorhanden)
        if (trimmed.includes('03') && this._debug) {
          this._debug(`[Parsing] Kein Match für "${trimmed}"`);
        }
      }
    }

    return result;
  },
};

