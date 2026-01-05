/**
 * RenderingMixin - DOM-Manipulation und Rendering-Helper
 * 
 * **Abhängigkeiten (müssen in der Hauptklasse initialisiert werden):**
 * - `this._workingDays` - WorkingDays-Daten
 * - `this._storageWarning` - Storage-Warnung
 * - `this._configWarning` - Config-Warnung
 * - `this._statusWarning` - Status-Warnung
 * - `this._config` - Konfiguration
 * - `this._isInEditorMode()` - Methode aus Hauptklasse
 * - `this._getSelectedCalendarShortcut()` - Methode aus CalendarMixin
 * - `this._getCalendarByShortcut()` - Methode aus CalendarMixin
 * - `this._isHoliday()` - Methode aus HolidayMixin
 * - `this._isWeekend()` - Methode aus HolidayMixin
 * - `this._getContrastColor()` - Methode aus ColorUtils
 * - `this.formatTwoDigits()` - Methode aus DateUtils
 * - `this.getDaysInMonth()` - Methode aus DateUtils
 * - `this.getFirstDayOfMonth()` - Methode aus DateUtils
 * - `this.getMonthName()` - Methode aus DateUtils
 * 
 * @example
 * import { RenderingMixin } from './mixins/rendering-mixin';
 * import { HolidayMixin } from './mixins/holiday-mixin';
 * import { CalendarMixin } from './mixins/calendar-mixin';
 * import { DateUtils } from '../../utils/date-utils';
 * import { ColorUtils } from '../../utils/color-utils';
 * 
 * class MyView extends LitElement {
 *   constructor() {
 *     super();
 *     Object.assign(this, HolidayMixin, CalendarMixin, DateUtils, ColorUtils, RenderingMixin);
 *   }
 * }
 */
export const RenderingMixin = {
  /**
   * Gibt die Elemente für einen bestimmten Tag zurück
   * @param {string} monthKey - Monats-Key (z.B. "25:11")
   * @param {number} day - Tag (1-31)
   * @returns {Array} Array von Elementen (z.B. ["a", "b"])
   */
  _getDayElements(monthKey, day) {
    // Gibt die Elemente für einen bestimmten Tag zurück
    // Reduziere Debug-Ausgaben: Nur bei ersten 3 Tagen oder wenn keine Daten gefunden werden
    const shouldDebug = day <= 3 || !this._workingDays[monthKey];
    
    if (shouldDebug && this._debug) {
      this._debug(`[Render] _getDayElements: Suche nach monthKey="${monthKey}", day=${day}`);
    }
    
    if (!this._workingDays[monthKey] || typeof this._workingDays[monthKey] !== 'object') {
      if (shouldDebug && this._debug) {
        this._debug(`[Render] _getDayElements: Keine Daten für monthKey="${monthKey}" gefunden oder kein Objekt`);
        this._debug(`[Render] _getDayElements: Verfügbare Keys in _workingDays:`, Object.keys(this._workingDays));
      }
      return [];
    }

    if (Array.isArray(this._workingDays[monthKey])) {
      // Altes Format: Array von Tagen
      if (shouldDebug && this._debug) {
        this._debug(`[Render] _getDayElements: Altes Format (Array) für monthKey="${monthKey}"`);
      }
      return [];
    }

    const elements = this._workingDays[monthKey][day] || [];
    if (shouldDebug && elements.length > 0 && this._debug) {
      this._debug(`[Render] _getDayElements: Gefundene Elemente für "${monthKey}", Tag ${day}:`, elements);
    }

    return elements;
  },

  /**
   * Rendert eine Warnung für eine fehlende Entity
   * @param {string} entityId - Entity-ID (z.B. "input_text.config")
   * @param {string} entityName - Name der Entity (z.B. "Konfigurations-Entity")
   * @param {number} maxLength - Maximale Länge (Standard: 255)
   * @param {boolean} isConfig - Ob es eine Config-Entity ist
   * @returns {TemplateResult} HTML-Template
   */
  _renderMissingEntityWarning(entityId, entityName, maxLength = 255, isConfig = false) {
    const entityNameShort = entityId.replace('input_text.', '');
    // html muss aus lit importiert werden - wird in Hauptklasse verwendet
    const { html } = this.constructor.litHtml || {};
    if (!html) {
      // Fallback wenn html nicht verfügbar ist
      return null;
    }
    
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
  },
};

