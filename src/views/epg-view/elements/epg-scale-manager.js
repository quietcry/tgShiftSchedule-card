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

    // Berechne Scale: Container-Breite / Anzeigebreite in Sekunden
    // showWidth ist in Minuten, daher * 60 für Sekunden
    const scale = containerWidth / (showWidth * 60);

    return scale;
  }

  /**
   * Validiert die epgShowPastTime Konfiguration
   */
  validateEpgShowPastTime() {
    const epgPastTime = this.epgBox.epgPastTime || 30;
    const epgShowFutureTime = this.epgBox.epgShowFutureTime || 180;
    const epgShowPastTime = this.epgBox.epgShowPastTime || 0;

    // epgShowPastTime darf nicht größer als epgPastTime oder epgShowFutureTime sein
    if (epgShowPastTime > epgPastTime || epgShowPastTime > epgShowFutureTime) {
      this.epgBox._debug('EpgScaleManager: epgShowPastTime zu groß, wird auf 0 gesetzt', {
        epgShowPastTime,
        epgPastTime,
        epgShowFutureTime,
      });
      this.epgBox.epgShowPastTime = 0;
    }
  }
}
