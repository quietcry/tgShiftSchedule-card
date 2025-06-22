/**
 * EPG Scroll Manager
 * Verwaltet alle scroll-bezogenen Funktionen für die EPG-Box
 */
export class EpgScrollManager {
  constructor(epgBox) {
    this.epgBox = epgBox;
  }

  /**
   * Scrollt die ProgramBox zur Backview-Position
   */
  scrollToBackviewPosition() {
    const programBox = this.epgBox.shadowRoot?.querySelector('.programBox');
    if (!programBox) {
      this.epgBox._debug('EpgScrollManager: ProgramBox nicht gefunden für Scroll');
      return;
    }

    const now = new Date();
    const backviewMinutes = this.epgBox.epgBackview || 0;
    const targetTime = new Date(now.getTime() - backviewMinutes * 60 * 1000);

    this.epgBox._debug('EpgScrollManager: Scroll zu Backview-Position', {
      jetzt: now.toISOString(),
      backviewMinutes,
      targetTime: targetTime.toISOString(),
      isFirstLoad: this.epgBox.isFirstLoad,
    });

    // Berechne Scroll-Position basierend auf der Zeit
    const scrollPosition = this.calculateScrollPositionForTime(targetTime);

    if (scrollPosition !== null) {
      programBox.scrollLeft = scrollPosition;
      this.epgBox._debug('EpgScrollManager: ProgramBox gescrollt', {
        scrollPosition,
        targetTime: targetTime.toISOString(),
      });
    }
  }

  /**
   * Berechnet die Scroll-Position basierend auf der Ziel-Zeit
   */
  calculateScrollPositionForTime(targetTime) {
    // Berechne die Scroll-Position basierend auf der Ziel-Zeit
    const now = new Date();
    const pastTime = this.epgBox.epgPastTime || 30;
    const showWidth = this.epgBox.epgShowWidth || 180;

    // Berechne die tatsächliche Gesamtbreite basierend auf der Zeit
    const totalTimeMinutes = pastTime + showWidth;
    const timeDiffMinutes = (now.getTime() - targetTime.getTime()) / (1000 * 60);

    // Berechne die Position als Prozentsatz der Gesamtzeit
    const positionPercent = Math.max(0, Math.min(1, timeDiffMinutes / totalTimeMinutes));

    // Berechne die tatsächliche Breite der Program-Items
    const actualWidth = this.calculateActualProgramWidth();

    // Berechne die Scroll-Position basierend auf der tatsächlichen Breite
    const scrollPosition = positionPercent * actualWidth;

    this.epgBox._debug('EpgScrollManager: Scroll-Position berechnet', {
      targetTime: targetTime.toISOString(),
      timeDiffMinutes,
      totalTimeMinutes,
      positionPercent,
      scrollPosition,
      actualWidth,
      containerWidth: this.epgBox._containerWidth,
    });

    return scrollPosition;
  }

  /**
   * Berechnet die tatsächliche Breite der Program-Items
   */
  calculateActualProgramWidth() {
    // Berechne die tatsächliche Breite basierend auf der Zeit und dem Scale
    const pastTime = this.epgBox.epgPastTime || 30;
    const showWidth = this.epgBox.epgShowWidth || 180;
    const totalTimeMinutes = pastTime + showWidth;

    // Verwende den Scale um die tatsächliche Breite zu berechnen
    const scale = this.epgBox.scale || 1;
    const actualWidth = totalTimeMinutes * scale;

    this.epgBox._debug('EpgScrollManager: Tatsächliche Breite berechnet', {
      pastTime,
      showWidth,
      totalTimeMinutes,
      scale,
      actualWidth,
    });

    return Math.max(actualWidth, this.epgBox._containerWidth || 1200);
  }

  /**
   * Richtet die Scroll-Synchronisation zwischen ChannelBox und ProgramBox ein
   */
  setupScrollSync() {
    const channelBox = this.epgBox.shadowRoot?.querySelector('.channelBox');
    const programBox = this.epgBox.shadowRoot?.querySelector('.programBox');

    if (!channelBox || !programBox) {
      this.epgBox._debug('EpgScrollManager: ChannelBox oder ProgramBox nicht gefunden für Scroll-Sync');
      return;
    }

    // Synchronisiere vertikales Scrollen zwischen ChannelBox und ProgramBox
    channelBox.addEventListener('scroll', () => {
      programBox.scrollTop = channelBox.scrollTop;
    });

    programBox.addEventListener('scroll', () => {
      channelBox.scrollTop = programBox.scrollTop;
    });

    this.epgBox._debug('EpgScrollManager: Scroll-Synchronisation eingerichtet');
  }
}