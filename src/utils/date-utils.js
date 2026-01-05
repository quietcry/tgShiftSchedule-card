/**
 * DateUtils - Wiederverwendbare Datum-Utilities
 * 
 * Diese Utilities können in anderen Projekten verwendet werden.
 * 
 * @example
 * import { DateUtils } from './utils/date-utils';
 * class MyView extends LitElement {
 *   constructor() {
 *     super();
 *     Object.assign(this, DateUtils);
 *   }
 * }
 */
export const DateUtils = {
  /**
   * Formatiert eine Zahl auf zwei Ziffern (z.B. 1 -> "01", 25 -> "25")
   * @param {number} num - Die zu formatierende Zahl
   * @returns {string} Formatierte Zahl als String mit führender Null
   */
  formatTwoDigits(num) {
    return String(num).padStart(2, '0');
  },

  /**
   * Gibt die Anzahl der Tage in einem Monat zurück
   * @param {number} year - Jahr (z.B. 2025)
   * @param {number} month - Monat (0-11, 0 = Januar)
   * @returns {number} Anzahl der Tage im Monat
   */
  getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  },

  /**
   * Gibt den Wochentag des ersten Tages eines Monats zurück
   * @param {number} year - Jahr (z.B. 2025)
   * @param {number} month - Monat (0-11, 0 = Januar)
   * @returns {number} Wochentag (0 = Sonntag, 1 = Montag, ..., 6 = Samstag)
   */
  getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
  },

  /**
   * Gibt den deutschen Monatsnamen zurück
   * @param {number} month - Monat (0-11, 0 = Januar)
   * @returns {string} Monatsname auf Deutsch
   */
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
    return months[month] || '';
  },

  /**
   * Gibt den ersten Wochentag eines Monats zurück (Montag = 0)
   * @param {number} year - Jahr (z.B. 2025)
   * @param {number} month - Monat (0-11, 0 = Januar)
   * @returns {number} Wochentag mit Montag = 0 (0 = Montag, 1 = Dienstag, ..., 6 = Sonntag)
   */
  getFirstDayOfWeekMondayBased(year, month) {
    const firstDay = this.getFirstDayOfMonth(year, month);
    // Konvertiere von Sonntag=0 zu Montag=0
    return (firstDay + 6) % 7;
  },
};

