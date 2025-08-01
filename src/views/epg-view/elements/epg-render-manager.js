import { html } from 'lit';
import { CardName, DebugMode } from '../../../card-config.js';
import { TgCardHelper } from '../../../tools/tg-card-helper.js';

/**
 * EPG Render Manager
 * Verwaltet alle render-bezogenen Funktionen für die EPG-Box
 */
export class EpgRenderManager extends TgCardHelper {
  static className = 'EpgRenderManager';

  constructor(epgBox) {
    super();
    this.epgBox = epgBox;
    this.endgapUpdateTimeout = null; // Timeout für verzögerte Endgap-Updates
    this.startgapUpdateTimeout = null; // Timeout für verzögerte Startgap-Updates
    this._debug('EpgRenderManager initialisiert');
  }

  /**
   * Rendert den Loading-Zustand
   */
  renderLoading() {
    return html`
      <div class="loading">
        <div>Lade EPG-Daten...</div>
      </div>
    `;
  }

  /**
   * Rendert einfache Kanäle (ohne Gruppierung)
   */
  renderSimpleChannels(channels) {
    return channels.map(channel => {
      // Berechne Höhenklassen für Channel-Row basierend auf den Anzeigeoptionen
      const heightClasses = this.epgBox._calculateHeightClasses(
        this.epgBox.showTime,
        this.epgBox.showDuration,
        this.epgBox.showDescription,
        true, // Zeit ist verfügbar
        true, // Dauer ist verfügbar
        false, // Channel hat keine Beschreibung
        this.epgBox.showShortText // ShortText-Option
      );

      return html`
        <div class="channelRow epg-row-height ${heightClasses}">
          <div class="channelRowContent">${channel.channeldata?.name || channel.name}</div>
        </div>
      `;
    });
  }

  // Hilfsfunktionen für die neue Struktur
  isGroup(item) {
    return item && item.type === 'group' && Array.isArray(item.patterns);
  }
  isPattern(item) {
    return item && item.type === 'channel' && typeof item.pattern === 'string';
  }

  /**
   * Rendert gruppierte Kanäle
   */
  renderGroupedChannels(sortedChannels) {
    return sortedChannels.map(item => {
      if (item.type === 'group' && Array.isArray(item.patterns)) {
        const allChannels = item.patterns.flatMap(patternObj => patternObj.channels || []);
        if (!allChannels.length) return html``;
        return html`
          <div class="channelGroup">${item.name}</div>
          ${allChannels.map(
            channel => html`
              <div class="channelRowContent">${channel.channeldata?.name || channel.name}</div>
            `
          )}
        `;
      } else if (item.type === 'channel' && Array.isArray(item.channels)) {
        return item.channels.map(
          channel => html`
            <div class="channelRowContent">${channel.channeldata?.name || channel.name}</div>
          `
        );
      } else if (item.type === 'unvisiblegroup' && Array.isArray(item.channels)) {
        // KEIN Header, aber Kanäle anzeigen!
        return item.channels.map(
          channel => html`
            <div class="channelRowContent">${channel.channeldata?.name || channel.name}</div>
          `
        );
      }
      return null;
    });
  }

  /**
   * Rendert ein einzelnes Programm-Item
   */
  renderProgramItem(program, channelId) {
    // Prüfe, ob es sich um ein Gap-Element handelt
    if (program.type === 'startgap' || program.type === 'endgap' || program.type === 'noprogram') {
      // Gap-Element - rendere es als leeres Element mit korrekter Breite
      return html`
        <epg-program-item
          .start=${program.start || 0}
          .stop=${program.stop || 0}
          .duration=${(program.stop || 0) - (program.start || 0)}
          .title=${''}
          .description=${''}
          .shortText=${''}
          .isCurrent=${false}
          .showTime=${false}
          .showDuration=${false}
          .showDescription=${false}
          .showShortText=${false}
          .id=${channelId + '_' + program.id || ''}
          .type=${program.type}
          @program-selected=${e => this.epgBox._onProgramSelected(e.detail)}
        ></epg-program-item>
      `;
    } else {
      // Normales Programm-Item - verwende bereits berechnete isCurrent Property
    return html`
      <epg-program-item
        .start=${program.start || 0}
        .stop=${program.end || program.stop || 0}
        .duration=${program.duration || 0}
        .title=${program.title || ''}
        .description=${program.description || ''}
        .shortText=${program.shorttext || ''}
          .isCurrent=${program.isCurrent || false}
        .showTime=${this.epgBox.showTime}
        .showDuration=${this.epgBox.showDuration}
        .showDescription=${this.epgBox.showDescription}
        .showShortText=${this.epgBox.showShortText}
        .id=${channelId + '_' + program.id || ''}
          .type=${'item'}
        @program-selected=${e => this.epgBox._onProgramSelected(e.detail)}
      ></epg-program-item>
    `;
    }
  }

  /**
   * Rendert eine einzelne Programmzeile
   */
  renderProgramRow(channel, rowIndex = 0) {
    const programs = channel.programs || [];

    // Debug komplett ausgeschaltet für Performance
    // this._debug('EpgRenderManager: Rendere Programmzeile für Kanal', {
    //   kanal: channel.channeldata?.name || channel.name,
    //   kanalId: channel.id,
    //   anzahlProgramme: programs.length,
    // });

    let allElements = [];

    if (programs.length > 0) {
      // Startgap: Von earliestProgramStart bis zum ersten Programm (immer einfügen, auch bei 0 Breite)
      const firstProgramStart = programs[0].start;
      const lastProgramStop = programs[programs.length - 1].stop;

      // Aktualisiere latestProgramStop wenn nötig
      if (lastProgramStop > this.epgBox.latestProgramStop) {
        this._debug('EpgRenderManager: latestProgramStop aktualisiert', {
          alterWert: this.epgBox.latestProgramStop,
          neuerWert: lastProgramStop,
          kanal: channel.channeldata?.name || channel.name,
        });
        this.epgBox.latestProgramStop = lastProgramStop;

        // Simuliere ein Lit-Update mit den geänderten Properties
        const changedProperties = new Map();
        changedProperties.set('latestProgramStop', lastProgramStop);
        this.epgBox.updated(changedProperties);

        // Verzögere die Aktualisierung der Endgaps mit Debouncing
        this.scheduleEndgapUpdate();
      }

      // Aktualisiere earliestProgramStart wenn nötig
      if (firstProgramStart < this.epgBox.earliestProgramStart) {
        this._debug('EpgRenderManager: earliestProgramStart aktualisiert', {
          alterWert: this.epgBox.earliestProgramStart,
          neuerWert: firstProgramStart,
      kanal: channel.channeldata?.name || channel.name,
        });
        this.epgBox.earliestProgramStart = firstProgramStart;

        // Simuliere ein Lit-Update mit den geänderten Properties
        const changedProperties = new Map();
        changedProperties.set('earliestProgramStart', firstProgramStart);
        this.epgBox.updated(changedProperties);

        // Verzögere die Aktualisierung der Startgaps mit Debouncing
        this.scheduleStartgapUpdate();
      }

      const startgapItem = {
        start: this.epgBox.earliestProgramStart,
        stop: firstProgramStart,
        id: 'startgap',
        type: 'startgap',
      };
      const endgapItem = {
        start: lastProgramStop,
        stop: this.epgBox.latestProgramStop,
        id: 'endgap',
        type: 'endgap',
      };

      allElements = [startgapItem, ...programs, endgapItem];
    } else {
      // Keine Programme - zeige ein großes Gap über das gesamte Zeitfenster
      const nogapItem = {
        start: this.epgBox.earliestProgramStart,
        stop: this.epgBox.latestProgramStop,
        id: 'nogaps',
        type: 'noprogram',
      };
      allElements = [nogapItem];
      this._debug('EpgRenderManager: Keine Programme - großes Gap hinzugefügt');
    }

    return html`
      <div
        class="programRow epg-row-height ${this.epgBox._calculateHeightClasses(
          this.epgBox.showTime,
          this.epgBox.showDuration,
          this.epgBox.showDescription,
          true,
          true,
          false,
          this.epgBox.showShortText
        )}"
        id="programRow-${channel.id}"
      >
        ${allElements && allElements.length > 0
          ? allElements.map((element, itemIndex) => {
              return this.renderProgramItem(element, channel.id);
            })
          : html` <div class="noPrograms">Keine Programme verfügbar</div> `}
      </div>
    `;
  }

  /**
   * Berechnet die Scroll-Position für die Programmbox
   * Formel: ((now - epgShowPastTime) - earliestProgramStart) * scale
   */
  calculateScrollPosition() {
    const now = Math.floor(Date.now() / 1000);
    const pastTime = this.epgBox.epgShowPastTime || 30; // Minuten in die Vergangenheit
    const pastTimeSeconds = pastTime * 60;

    // Hole scale aus CSS-Properties oder verwende this.epgBox.scale
    let scale = this.epgBox.scale;
    if (!scale && this.epgBox.programBox) {
      const computedStyle = getComputedStyle(this.epgBox.programBox);
      const cssScale = computedStyle.getPropertyValue('--epg-scale');
      scale = parseFloat(cssScale) || 1;
    }

    const scrollPosition = ((now - pastTimeSeconds) - this.epgBox.earliestProgramStart) * scale;

    this._debug('EpgRenderManager: Berechne Scroll-Position', {
      now: new Date(now * 1000).toISOString(),
      nowLocal: new Date(now * 1000).toLocaleString(),
      pastTimeMinutes: pastTime,
      pastTimeSeconds: pastTimeSeconds,
      earliestProgramStart: new Date(this.epgBox.earliestProgramStart * 1000).toISOString(),
      earliestProgramStartLocal: new Date(this.epgBox.earliestProgramStart * 1000).toLocaleString(),
      scale: scale,
      cssScale: this.epgBox.programBox ? getComputedStyle(this.epgBox.programBox).getPropertyValue('--epg-scale') : 'nicht verfügbar',
      scrollPosition: scrollPosition,
      calculation: `((${now} - ${pastTimeSeconds}) - ${this.epgBox.earliestProgramStart}) * ${scale} = ${scrollPosition}`,
    });

    return Math.max(0, scrollPosition); // Nicht negativ
  }

  /**
   * Führt das Scrolling in der Programmbox aus
   */
  scrollProgramBox() {
    this._debug('EpgRenderManager: scrollProgramBox aufgerufen');

    if (!this.epgBox.programBox) {
      this._debug('EpgRenderManager: ProgramBox nicht gefunden für Scrolling');
      return;
    }

    const scrollPosition = this.calculateScrollPosition();

    this._debug('EpgRenderManager: Scrolle ProgramBox', {
      scrollPosition: scrollPosition,
      programBoxExists: !!this.epgBox.programBox,
      programBoxScrollLeft: this.epgBox.programBox.scrollLeft,
    });

    this.epgBox.programBox.scrollLeft = scrollPosition;

    this._debug('EpgRenderManager: Scrolling abgeschlossen', {
      newScrollLeft: this.epgBox.programBox.scrollLeft,
    });
  }

  /**
   * Rendert einfache Programme (ohne Gruppierung)
   */
  renderSimplePrograms(channels) {
    return channels.map(channel => this.renderProgramRow(channel, 0));
  }

  /**
   * Rendert gruppierte Programme
   */
  renderGroupedPrograms(sortedChannels) {
    let rowIndex = 0;
    return sortedChannels.map(item => {
      if (this.isGroup(item)) {
        // Korrigiert: Alle Kanäle aus allen Patterns der Gruppe sammeln
        const allChannels = item.patterns.flatMap(p => p.channels || []);
        // Debug-Ausgabe: Welche Kanäle und wie viele Programme werden gerendert?
        console.log(
          'DEBUG: Render Gruppe',
          item.name,
          allChannels.map(c => ({
            id: c.id,
            name: c.channeldata?.name || c.name,
            programme: c.programs ? c.programs.length : 0,
          }))
        );
        if (!allChannels.length) return html``;
        return html`
          <div class="programRow" style="height: var(--epg-row-height);">
            <div class="noPrograms" style="width: 100%; height: 100%;">
              <!-- Platzhalter für Gruppen-Header -->
              ${item.name}
            </div>
          </div>
          ${allChannels.map(channel => this.renderProgramRow(channel, rowIndex++))}
        `;
      } else if (
        (item.type === 'channel' || item.type === 'unvisiblegroup') &&
        Array.isArray(item.channels)
      ) {
        return item.channels.map(channel => this.renderProgramRow(channel, rowIndex++));
      } else if (this.isPattern(item)) {
        // Einzelner Kanal ohne Gruppen-Header
        return item.channels.map(channel => this.renderProgramRow(channel, rowIndex++));
      }
      return null;
    });
  }

  /**
   * Plant eine verzögerte Aktualisierung der Startgaps mit Debouncing
   */
  scheduleStartgapUpdate() {
    this._debug('updateGapTimeAttributes - startgap', 'Schedule');

    // Lösche vorherigen Timeout, falls vorhanden
    if (this.startgapUpdateTimeout) {
      clearTimeout(this.startgapUpdateTimeout);
    }

    // Setze neuen Timeout für verzögerte Ausführung
    this.startgapUpdateTimeout = setTimeout(() => {
      this.updateStartgapStarts();
      this.startgapUpdateTimeout = null;
    }, 100); // 100ms Verzögerung, analog zum ResizeObserver
  }
  /**
   * Plant eine verzögerte Aktualisierung der Endgaps mit Debouncing
   */
  scheduleEndgapUpdate() {
    this._debug('updateGapTimeAttributes - endgap', 'Schedule');

    // Lösche vorherigen Timeout, falls vorhanden
    if (this.endgapUpdateTimeout) {
      clearTimeout(this.endgapUpdateTimeout);
    }

    // Setze neuen Timeout für verzögerte Ausführung
    this.endgapUpdateTimeout = setTimeout(() => {
      this.updateEndgapStops();
      this.endgapUpdateTimeout = null;
    }, 100); // 100ms Verzögerung, analog zum ResizeObserver
  }

  /**
   * Aktualisiert nur die stop-Attribute der bereits im DOM vorhandenen Endgaps
   * Ohne ein komplettes Update zu machen
   */
  updateEndgapStops() {
    this._debug('updateGapTimeAttributes - endgap', 'Aktualisiere stop-Attribute der Endgaps', {
      latestProgramStop: this.epgBox.latestProgramStop,
    });

    // Verwende die gespeicherte programBox Referenz
    if (!this.epgBox.programBox) {
      this._debug('updateEndgapStops()', 'ProgramBox nicht gefunden');
      return;
    }

    // Finde alle Endgap- und Noprogram-Elemente in der programBox (rekursiv in allen programRow Elementen)
    const gapElements =
      this.epgBox.programBox.querySelectorAll(
        'epg-program-item.type-endgap, epg-program-item.type-noprogram, epg-program-item.type-group'
      ) || [];
    this._debug('updateGapTimeAttributes - Endgaps', { elements: gapElements });

    gapElements.forEach(element => {
      element.stop = this.epgBox.latestProgramStop;
      // Aktualisiere die CSS-Variablen für die Breitenberechnung
      element.updateCSSVariables();
    });

    this._debug('updateGapTimeAttributes - endgap-Updates abgeschlossen', {
      gefundeneElemente: gapElements.length,
    });
  }
  /**
   * Aktualisiert nur die start-Attribute der bereits im DOM vorhandenen startgaps
   * Ohne ein komplettes Update zu machen
   */

  updateStartgapStarts() {
    this._debug(
      'updateGapTimeAttributes - startgap',
      'Aktualisiere start-Attribute der Startgaps',
      {
        earliestProgramStart: this.epgBox.earliestProgramStart,
      }
    );

    // Verwende die gespeicherte programBox Referenz
    if (!this.epgBox.programBox) {
      this._debug('updateStartgapStarts()', 'ProgramBox nicht gefunden');
      return;
    }

    // Finde alle Startgap- und Noprogram-Elemente in der programBox (rekursiv in allen programRow Elementen)
    const gapElements =
      this.epgBox.programBox.querySelectorAll(
        'epg-program-item.type-startgap, epg-program-item.type-noprogram, epg-program-item.type-group'
      ) || [];
    this._debug('updateGapTimeAttributes - startgap', gapElements.length);

    gapElements.forEach(element => {
      element.start = this.epgBox.earliestProgramStart;
      // Aktualisiere die CSS-Variablen für die Breitenberechnung
      element.updateCSSVariables();
    });

    this._debug('updateGapTimeAttributes - startgap-Updates abgeschlossen', {
      gefundeneElemente: gapElements.length,
    });
  }

  /**
   * Aktualisiert alle Gap-Elemente mit dem neuen earliestProgramStart-Wert
   * Nur die ersten epg-program-item Elemente in jeder programRow sind Gap-Elemente
   * @deprecated Diese Methode ist nicht mehr nötig mit der repeat-Direktive
   */
  updateGapItems() {
    this._debug(
      'EpgRenderManager: WARNUNG - updateGapItems() ist deprecated! Mit repeat-Direktive nicht mehr nötig'
    );

    // Mit der repeat-Direktive werden Startgaps automatisch korrekt berechnet
    // Diese Methode ist nur noch für Kompatibilität vorhanden
    return;
  }
}
