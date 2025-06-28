import { html } from 'lit';

/**
 * EPG Render Manager
 * Verwaltet alle render-bezogenen Funktionen für die EPG-Box
 */
export class EpgRenderManager {
  constructor(epgBox) {
    this.epgBox = epgBox;
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
    // Normales Programm-Item
    return html`
      <epg-program-item
        .start=${program.start || 0}
        .stop=${program.end || program.stop || 0}
        .duration=${program.duration || 0}
        .title=${program.title || ''}
        .description=${program.description || ''}
        .shortText=${program.shorttext || ''}
        .isCurrent=${this.epgBox.dataManager.isCurrentTimeSlot(
          program,
          Math.floor(Date.now() / 1000)
        )}
        .scale=${this.epgBox.scale}
        .showTime=${this.epgBox.showTime}
        .showDuration=${this.epgBox.showDuration}
        .showDescription=${this.epgBox.showDescription}
        .showShortText=${this.epgBox.showShortText}
        .id=${channelId + '_' + program.id || ''}
        @program-selected=${e => this.epgBox._onProgramSelected(e.detail)}
      ></epg-program-item>
    `;
  }

  /**
   * Rendert eine einzelne Programmzeile
   */
  renderProgramRow(channel, rowIndex = 0) {
    const programs =
      channel.programs ||
      this.epgBox.dataManager.getProgramsForChannel(
        channel,
        this.epgBox.dataManager.generateTimeSlots()
      );

    this.epgBox._debug('EpgRenderManager: Rendere Programmzeile für Kanal', {
      kanal: channel.channeldata?.name || channel.name,
      kanalId: channel.id,
      anzahlProgramme: programs.length,
      prog: programs[0],
      programme: programs.map(p => ({
        title: p.title,
        start: new Date(p.start * 1000).toISOString(),
        end: new Date((p.end || p.stop) * 1000).toISOString(),
      })),
    });
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
        ${programs.length > 0
          ? [
              this.renderProgramItem(
                {
                  start: this.epgBox._channelsParameters.earliestProgramStart,
                  stop: programs[0].start,
                  scale: this.epgBox.scale,
                  id: 'startgap',
                },
                channel.id
              ),
              ...programs.map((program, itemIndex) => this.renderProgramItem(program, channel.id)),
            ]
          : html` <div class="noPrograms">Keine Programme verfügbar</div> `}
      </div>
    `;
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
   * Aktualisiert alle Gap-Elemente mit dem neuen earliestProgramStart-Wert
   * Nur die ersten epg-program-item Elemente in jeder programRow sind Gap-Elemente
   */
  updateGapItems() {
    const programBox = this.epgBox.shadowRoot.querySelector('.programBox');
    const programRows = programBox?.querySelectorAll('.programRow') || [];
    const gapItems = [];

    programRows.forEach(row => {
      const firstItem = row.querySelector('epg-program-item');
      if (firstItem) firstItem.start = this.epgBox._channelsParameters.earliestProgramStart || 99;
    });
  }
}
