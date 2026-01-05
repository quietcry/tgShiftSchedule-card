/**
 * ColorUtils - Wiederverwendbare Farb-Utilities
 * 
 * Diese Utilities können in anderen Projekten verwendet werden.
 * 
 * @example
 * import { ColorUtils } from './utils/color-utils';
 * class MyView extends LitElement {
 *   constructor() {
 *     super();
 *     Object.assign(this, ColorUtils);
 *   }
 * }
 */
export const ColorUtils = {
  /**
   * Berechnet die Kontrastfarbe (schwarz oder weiß) für eine gegebene Hintergrundfarbe
   * Verwendet WCAG-Luminanz-Berechnung
   * @param {string} hexColor - Hex-Farbe (z.B. "#ff9800" oder "ff9800")
   * @returns {string} "#000000" für helle Hintergründe, "#ffffff" für dunkle Hintergründe
   */
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
  },

  /**
   * Konvertiert eine Hex-Farbe zu RGB
   * @param {string} hex - Hex-Farbe (z.B. "#ff9800" oder "ff9800")
   * @returns {Object} {r, g, b} oder null bei Fehler
   */
  hexToRgb(hex) {
    if (!hex) return null;

    const cleanHex = hex.replace('#', '');
    if (cleanHex.length !== 6) return null;

    return {
      r: parseInt(cleanHex.substr(0, 2), 16),
      g: parseInt(cleanHex.substr(2, 2), 16),
      b: parseInt(cleanHex.substr(4, 2), 16),
    };
  },

  /**
   * Konvertiert RGB zu Hex-Farbe
   * @param {number} r - Rot (0-255)
   * @param {number} g - Grün (0-255)
   * @param {number} b - Blau (0-255)
   * @returns {string} Hex-Farbe (z.B. "#ff9800")
   */
  rgbToHex(r, g, b) {
    const toHex = (n) => {
      const hex = Math.round(n).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  },
};

