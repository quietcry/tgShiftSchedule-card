export class EpgScaleManager {
  constructor(epgBox) {
    this.epgBox = epgBox;
  }

  /**
   * Berechnet den Scale für die Darstellung
   */
  calculateScale() {
    // Verwende die gemessene Container-Breite oder geschätzte Breite
    const containerWidth = this.epgBox.containerWidth - this.epgBox.channelWidth || 1000;
    const showWidth = this.epgBox.epgShowFutureTime + this.epgBox.epgShowPastTime || 180; // Minuten sichtbar

    // Berechne Scale: Container-Breite / Anzeigebreite in Sekunden
    // showWidth ist in Minuten, daher * 60 für Sekunden
    const scale = containerWidth / (showWidth * 60);
    const oldScale = this.epgBox.scale;
    this.epgBox.scale = scale;

    this.epgBox._debug('EpgScaleManager: Scale! berechnet', {
      containerWidth,
      showWidth,
      scale,
      oldScale: oldScale,
      newScale: this.epgBox.scale,
      epgShowFutureTime: this.epgBox.epgShowFutureTime,
      epgShowPastTime: this.epgBox.epgShowPastTime,
      containerWidthFromGetter: this.epgBox.containerWidth,
      channelWidth: this.epgBox.channelWidth
    });

    this.epgBox.updated(new Map([['scale', scale]]));
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

  /**
   * Berechnet die Startzeit für die EPG-Anzeige
   */
  getStartTime() {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Minuten seit Mitternacht
    const epgShowPastTime = this.epgBox.epgShowPastTime || 60;

    // Startzeit = aktuelle Zeit - epgShowPastTime
    return currentTime - epgShowPastTime;
  }
}
