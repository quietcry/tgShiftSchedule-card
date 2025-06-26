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
    return item && item.type === 'group' && typeof item.pattern === 'string';
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
   * Rendert einfache Programme (ohne Gruppierung)
   */
  renderSimplePrograms(channels) {
    return channels.map(channel => {
      const programs = this.epgBox.dataManager.getProgramsForChannel(
        channel,
        this.epgBox.dataManager.generateTimeSlots()
      );

      this.epgBox._debug('EpgRenderManager: Rendere einfache Programme für Kanal', {
        kanal: channel.channeldata?.name || channel.name,
        kanalId: channel.id,
        anzahlProgramme: programs.length,
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
            true, // Zeit ist verfügbar für Programme
            true, // Dauer ist verfügbar für Programme
            false, // Beschreibung wird pro Programm-Item berechnet
            this.epgBox.showShortText // ShortText-Option
          )}"
        >
          ${programs.length > 0
            ? (() => {
                // Füge leeres Programm-Item am Anfang hinzu, wenn minTime gesetzt ist
                const items = [];
                let itemIndex = 0;

                if (this.epgBox._channelsParameters.minTime > 0) {
                  const firstProgram = programs[0];
                  const gapDuration = this.epgBox._calculateDuration(
                    this.epgBox._channelsParameters.minTime,
                    firstProgram.start
                  );
                  if (gapDuration > 0) {
                    items.push(html`
                      <div class="noPrograms" style="width: ${gapDuration * this.epgBox.scale}px;">
                        <!-- Leerer Bereich vor dem ersten Programm -->
                      </div>
                    `);
                    itemIndex++;
                  }
                }

                // Füge alle Programme hinzu
                programs.forEach((program, index) => {
                  const duration = this.epgBox._calculateDuration(
                    program.start,
                    program.end || program.stop
                  );
                  const width = duration * this.epgBox.scale;

                  // Füge Lücke zwischen Programmen hinzu
                  if (index > 0) {
                    const prevProgram = programs[index - 1];
                    const gapDuration = this.epgBox._calculateDuration(
                      prevProgram.end || prevProgram.stop,
                      program.start
                    );
                    if (gapDuration > 0) {
                      items.push(html`
                        <div
                          class="noPrograms"
                          style="width: ${gapDuration * this.epgBox.scale}px;"
                        >
                          <!-- Leerer Bereich zwischen Programmen -->
                        </div>
                      `);
                      itemIndex++;
                    }
                  }

                  items.push(html`
                    <epg-program-item
                      .program=${program}
                      .scale=${this.epgBox.scale}
                      .showTime=${this.epgBox.showTime}
                      .showDuration=${this.epgBox.showDuration}
                      .showDescription=${this.epgBox.showDescription}
                      .showShortText=${this.epgBox.showShortText}
                      style="width: ${width}px;"
                      @program-selected=${e => this.epgBox._onProgramSelected(e.detail)}
                    ></epg-program-item>
                  `);
                  itemIndex++;
                });

                return items;
              })()
            : html` <div class="noPrograms">Keine Programme verfügbar</div> `}
        </div>
      `;
    });
  }

  /**
   * Rendert gruppierte Programme
   */
  renderGroupedPrograms(sortedChannels) {
    let rowIndex = 0;
    return sortedChannels.map(item => {
      if (this.isGroup(item)) {
        const groupChannels = item.channels;
        if (!groupChannels.length) return html``;
        return html`
          <div class="programRow" style="height: var(--epg-row-height);">
            <div class="noPrograms" style="width: 100%; height: 100%;">
              <!-- Platzhalter für Gruppen-Header -->
              ${item.name}
            </div>
          </div>
          ${groupChannels.map(channel => {
            // Programme für diesen Kanal holen
            const programs = channel.programs || [];
            const currentRowIndex = rowIndex++;
            return html`
              <div class="programRow epg-row-height">
                ${programs.length > 0
                  ? programs.map(
                      program => html`<epg-program-item .program=${program}></epg-program-item>`
                    )
                  : html` <div class="noPrograms">Keine Programme verfügbar</div> `}
              </div>
            `;
          })}
        `;
      } else if (this.isPattern(item)) {
        // Einzelner Kanal ohne Gruppen-Header
        return item.channels.map(channel => {
          const programs = channel.programs || [];
          return html`
            <div class="programRow epg-row-height">
              ${programs.length > 0
                ? programs.map(
                    program => html`<epg-program-item .program=${program}></epg-program-item>`
                  )
                : html` <div class="noPrograms">Keine Programme verfügbar</div> `}
            </div>
          `;
        });
      }
      return null;
    });
  }
}
