/**
 * EPG Scale Manager
 * Verwaltet alle scale-bezogenen Funktionen für die EPG-Box
 */
export class EpgScaleManager {
  constructor(epgBox) {
    this.epgBox = epgBox;
  }

  /**
   * Berechnet den Scale für die Darstellung
   */
  calculateScale() {
    // Verwende die gemessene Container-Breite oder geschätzte Breite
    const containerWidth = this.epgBox._containerWidth;
    const showWidth = this.epgBox.epgShowWidth || 180; // Minuten sichtbar

    // Berechne Scale: Container-Breite / Anzeigebreite in Minuten
    const scale = containerWidth / showWidth;

    return scale;
  }

  /**
   * Misst die tatsächliche Container-Breite
   */
  measureContainerWidth() {
    const programBox = this.epgBox.shadowRoot?.querySelector('.programBox');
    if (programBox) {
      const measuredWidth = programBox.clientWidth;
      if (measuredWidth > 0) {
        this.epgBox._containerWidth = measuredWidth;
        this.epgBox._containerWidthMeasured = true;

        // Recalculate scale with new container width
        this.epgBox.scale = this.calculateScale();
        this.epgBox.requestUpdate();
      }
    }
  }

  /**
   * Validiert die epgBackview Konfiguration
   */
  validateEpgBackview() {
    const epgPastTime = this.epgBox.epgPastTime || 30;
    const epgShowWidth = this.epgBox.epgShowWidth || 180;
    const epgBackview = this.epgBox.epgBackview || 0;

    // epgBackview darf nicht größer als epgPastTime oder epgShowWidth sein
    if (epgBackview > epgPastTime || epgBackview > epgShowWidth) {
      this.epgBox._debug('EpgScaleManager: epgBackview zu groß, wird auf 0 gesetzt', {
        epgBackview,
        epgPastTime,
        epgShowWidth,
      });
      this.epgBox.epgBackview = 0;
    }
  }
}
