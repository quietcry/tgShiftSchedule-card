/**
 * CalendarMixin - Kalender-Management und -Berechnungen
 * 
 * Wiederverwendbar in anderen Projekten!
 * 
 * **Abhängigkeiten (müssen in der Hauptklasse initialisiert werden):**
 * - `this.config` - Konfigurationsobjekt mit `calendars` Array
 * - `this._selectedCalendar` - String mit dem Shortcut des ausgewählten Kalenders
 * 
 * **Statische Konstante (muss in Hauptklasse definiert werden):**
 * - `ShiftScheduleView.CALENDARS` - Array mit Standard-Kalender-Definitionen
 * 
 * @example
 * import { CalendarMixin } from './mixins/calendar-mixin';
 * class MyView extends LitElement {
 *   static CALENDARS = [
 *     { shortcut: 'a', name: 'Schicht A', defaultColor: '#ff9800' },
 *     // ...
 *   ];
 *   
 *   constructor() {
 *     super();
 *     this._selectedCalendar = null;
 *     Object.assign(this, CalendarMixin);
 *   }
 * }
 */
export const CalendarMixin = {
  /**
   * Gibt alle aktivierten Kalender zurück
   * @returns {Array} Array von Kalender-Objekten, sortiert nach Shortcut
   */
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
  },

  /**
   * Gibt das Kalender-Objekt für einen gegebenen Shortcut zurück
   * @param {string} shortcut - Shortcut des Kalenders (z.B. 'a', 'b', 'c')
   * @returns {Object|null} Kalender-Objekt oder null wenn nicht gefunden
   */
  _getCalendarByShortcut(shortcut) {
    // Gibt das Kalender-Objekt für einen gegebenen Shortcut zurück
    if (!this._config?.calendars) {
      return null;
    }

    return this._config.calendars.find(cal => cal.shortcut === shortcut) || null;
  },

  /**
   * Gibt die Standardfarbe für einen gegebenen Shortcut zurück
   * @param {string} shortcut - Shortcut des Kalenders (z.B. 'a', 'b', 'c')
   * @returns {string} Hex-Farbe (z.B. '#ff9800')
   */
  _getDefaultColorForShortcut(shortcut) {
    // Gibt die Standardfarbe für einen gegebenen Shortcut zurück
    // Prüfe ob die Hauptklasse eine CALENDARS-Konstante hat
    const CalendarsClass = this.constructor;
    if (CalendarsClass && CalendarsClass.CALENDARS) {
      const defaultCalendar = CalendarsClass.CALENDARS.find(cal => cal.shortcut === shortcut);
      return defaultCalendar ? defaultCalendar.defaultColor : '#ff9800';
    }
    // Fallback, falls CALENDARS nicht definiert ist
    return '#ff9800';
  },

  /**
   * Gibt den Shortcut des ausgewählten Kalenders zurück
   * @returns {string|null} Shortcut des ausgewählten Kalenders oder null
   */
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
  },
};

