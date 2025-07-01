import { html, css } from 'lit';

/**
 * EPG Time Marker Manager
 * Verwaltet die Zeitmarker-Funktionalität für die EPG-Box
 */
export class EpgTimeMarkerManager {
  constructor(epgBox) {
    this.epgBox = epgBox;
    this.currentTime = Date.now() / 1000;
    this.updateInterval = null;
    this.startTimeUpdate();
  }

  /**
   * Startet das automatische Update der aktuellen Zeit
   */
  startTimeUpdate() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    // Update alle 30 Sekunden
    this.updateInterval = setInterval(() => {
      this.updateCurrentTime();
    }, 30000);
  }

  /**
   * Stoppt das automatische Update der aktuellen Zeit
   */
  stopTimeUpdate() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Aktualisiert die aktuelle Zeit
   */
  updateCurrentTime() {
    this.currentTime = Date.now() / 1000;
    this.updateTimeMarkerPosition();
  }

  /**
   * Berechnet die Position des Zeitmarkers basierend auf der aktuellen Zeit
   */
  calculateTimeMarkerPosition() {
    const now = new Date();
    const pastTime = this.epgBox.epgPastTime || 30;
    const showWidth = this.epgBox.epgShowFutureTime || 180;
    const totalTimeMinutes = pastTime + showWidth;

    // Berechne die Zeit seit dem Start der EPG-Anzeige
    const startTime = new Date(now.getTime() - pastTime * 60 * 1000);
    const timeDiffMinutes = (now.getTime() - startTime.getTime()) / (1000 * 60);

    // Berechne die Position als Prozentsatz der Gesamtzeit
    const positionPercent = Math.max(0, Math.min(1, timeDiffMinutes / totalTimeMinutes));

    // Berechne die tatsächliche Position in Pixeln
    const actualWidth = this.calculateActualProgramWidth();
    const positionPixels = positionPercent * actualWidth;

    this.epgBox._debug('EpgTimeMarkerManager: Zeitmarker-Position berechnet', {
      currentTime: now.toISOString(),
      timeDiffMinutes,
      totalTimeMinutes,
      positionPercent,
      positionPixels,
      actualWidth,
    });

    return {
      positionPercent,
      positionPixels,
      currentTime: now,
    };
  }

  /**
   * Aktualisiert die Position des Zeitmarkers im DOM
   */
  updateTimeMarkerPosition() {
    const timeMarker = this.epgBox.shadowRoot?.querySelector('.time-marker');
    if (!timeMarker) {
      return;
    }

    const position = this.calculateTimeMarkerPosition();
    timeMarker.style.left = `${position.positionPixels}px`;

    // Aktualisiere auch die Tooltip-Zeit
    const timeTooltip = timeMarker.querySelector('.time-tooltip');
    if (timeTooltip) {
      timeTooltip.textContent = position.currentTime.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  }

  /**
   * Rendert den Zeitmarker-Balken
   */
  renderTimeMarker() {
    const position = this.calculateTimeMarkerPosition();

    return html`
      <div
        class="time-marker"
        style="left: ${position.positionPixels}px;"
        title="${position.currentTime.toLocaleTimeString('de-DE', {
          hour: '2-digit',
          minute: '2-digit',
        })}"
      >
        <div class="time-marker-line"></div>
        <div class="time-marker-dot"></div>
        <div class="time-tooltip">
          ${position.currentTime.toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    `;
  }

  /**
   * CSS-Styles für den Zeitmarker
   */
  static get styles() {
    return css`
      .time-marker {
        position: absolute;
        top: 0;
        bottom: 0;
        z-index: 10;
        pointer-events: none;
        transition: left 0.3s ease;
      }

      .time-marker-line {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 50%;
        width: 2px;
        background-color: var(--epg-now-marker-color, #ff4444);
        box-shadow: 0 0 4px rgba(255, 68, 68, 0.6);
      }

      .time-marker-dot {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 8px;
        height: 8px;
        background-color: var(--epg-now-marker-color, #ff4444);
        border-radius: 50%;
        box-shadow: 0 0 6px rgba(255, 68, 68, 0.8);
      }

      .time-tooltip {
        position: absolute;
        top: -25px;
        left: 50%;
        transform: translateX(-50%);
        background-color: var(--primary-background-color, #ffffff);
        color: var(--primary-text-color, #000000);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        white-space: nowrap;
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      .time-marker:hover .time-tooltip {
        opacity: 1;
      }

      /* Animation für den Zeitmarker */
      .time-marker-line {
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0% {
          opacity: 1;
        }
        50% {
          opacity: 0.6;
        }
        100% {
          opacity: 1;
        }
      }
    `;
  }

  /**
   * Scrollt die ProgramBox zur Backview-Position
   */
  scrollToBackviewPosition() {
    const programBox = this.epgBox.shadowRoot?.querySelector('.programBox');
    if (!programBox) {
      this.epgBox._debug('EpgTimeMarkerManager: ProgramBox nicht gefunden für Scroll');
      return;
    }

    const now = new Date();
    const backviewMinutes = this.epgBox.epgShowPastTime > 0 ? this.epgBox.epgShowPastTime : 60;
    const targetTime = new Date(now.getTime() - backviewMinutes * 60 * 1000);

    this.epgBox._debug('EpgTimeMarkerManager: Scroll zu Backview-Position', {
      jetzt: now.toISOString(),
      backviewMinutes,
      targetTime: targetTime.toISOString(),
      isFirstLoad: this.epgBox.isFirstLoad,
    });

    // Berechne Scroll-Position basierend auf der Zeit
    const scrollPosition = this.calculateScrollPositionForTime(targetTime);

    if (scrollPosition !== null) {
      programBox.scrollLeft = scrollPosition;
      this.epgBox._debug('EpgTimeMarkerManager: ProgramBox gescrollt', {
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
    const showWidth = this.epgBox.epgShowFutureTime || 180;

    // Berechne die tatsächliche Gesamtbreite basierend auf der Zeit
    const totalTimeMinutes = pastTime + showWidth;
    const timeDiffMinutes = (now.getTime() - targetTime.getTime()) / (1000 * 60);

    // Berechne die Position als Prozentsatz der Gesamtzeit
    const positionPercent = Math.max(0, Math.min(1, timeDiffMinutes / totalTimeMinutes));

    // Berechne die tatsächliche Breite der Program-Items
    const actualWidth = this.calculateActualProgramWidth();

    // Berechne die Scroll-Position basierend auf der tatsächlichen Breite
    const scrollPosition = positionPercent * actualWidth;

    this.epgBox._debug('EpgTimeMarkerManager: Scroll-Position berechnet', {
      targetTime: targetTime.toISOString(),
      timeDiffMinutes,
      totalTimeMinutes,
      positionPercent,
      scrollPosition,
      actualWidth,
      containerWidth: this.epgBox.containerWidth,
    });

    return scrollPosition;
  }

  /**
   * Berechnet die tatsächliche Breite der Program-Items
   */
  calculateActualProgramWidth() {
    // Berechne die tatsächliche Breite basierend auf der Zeit und dem Scale
    const pastTime = this.epgBox.epgPastTime || 30;
    const showWidth = this.epgBox.epgShowFutureTime || 180;
    const totalTimeMinutes = pastTime + showWidth;

    // Verwende den Scale um die tatsächliche Breite zu berechnen
    const scale = this.epgBox.scale || 1;
    const actualWidth = totalTimeMinutes * scale;

    this.epgBox._debug('EpgTimeMarkerManager: Tatsächliche Breite berechnet', {
      pastTime,
      showWidth,
      totalTimeMinutes,
      scale,
      actualWidth,
    });

    return Math.max(actualWidth, this.epgBox.containerWidth || 1200);
  }

  /**
   * Prüft und validiert die epgBackview Einstellungen
   */
  validateEpgBackview() {
    const backview = this.epgBox.epgShowPastTime || 0;
    const pastTime = this.epgBox.epgPastTime || 30;
    const showWidth = this.epgBox.epgShowFutureTime || 180;

    if (backview > pastTime) {
      this.epgBox._debug('EpgTimeMarkerManager: Backview-Warnung', {
        backview,
        pastTime,
        showWidth,
        message: 'Backview ist größer als PastTime - könnte zu Problemen führen',
      });
    }

    return {
      isValid: backview <= pastTime,
      backview,
      pastTime,
      showWidth,
    };
  }

  /**
   * Testet ob der erste Load abgeschlossen ist und führt Time Marker Aktionen durch
   */
  testIsFirstLoadCompleteUpdated() {
    this.epgBox._debug('EpgTimeMarkerManager: testIsFirstLoadCompleteUpdated aufgerufen', {
      isFirstLoad: this.epgBox.isFirstLoad,
      isChannelUpdate: this.epgBox.isChannelUpdate,
    });

    // Wenn isFirstLoad == 1 && isChannelUpdate == 0 dann isFirstLoad = 2
    if (this.epgBox.isFirstLoad === 1 && this.epgBox.isChannelUpdate === 0) {
      this.epgBox.isFirstLoad = 2;
      this.epgBox._debug(
        'EpgTimeMarkerManager: testIsFirstLoadCompleteUpdated - isFirstLoad auf 2 gesetzt',
        {
          isFirstLoad: this.epgBox.isFirstLoad,
          isChannelUpdate: this.epgBox.isChannelUpdate,
        }
      );

      // Sende Event, dass der erste Load abgeschlossen ist
      this.epgBox.dispatchEvent(
        new CustomEvent('epg-first-load-complete', {
          detail: {
            isFirstLoad: this.epgBox.isFirstLoad,
            isChannelUpdate: this.epgBox.isChannelUpdate,
            channelCount: this.epgBox._sortedChannels.length,
          },
          bubbles: true,
          composed: true,
        })
      );
    }

    // Scroll ProgramBox wenn isFirstLoad < 2
    if (this.epgBox.isFirstLoad < 2) {
      this.scrollToBackviewPosition();
    }
  }

  /**
   * Cleanup beim Zerstören des Managers
   */
  destroy() {
    this.stopTimeUpdate();
  }
}
