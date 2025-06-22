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
          <div class="channelRowContent">${channel.name}</div>
        </div>
      `;
    });
  }

  /**
   * Rendert gruppierte Kanäle
   */
  renderGroupedChannels() {
    return this.epgBox._sortedChannels.map(group => {
      // Sammle alle Kanäle aus allen Patterns der Gruppe
      const groupChannels = group.patterns.flatMap(pattern => pattern.channels);

      if (groupChannels.length === 0) {
        return html``; // Leere Gruppe nicht anzeigen
      }

      return html`
        <!-- Gruppen-Header -->
        <div class="channelGroup">${group.name}</div>
        <!-- Kanäle der Gruppe -->
        ${groupChannels.map(channel => {
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
              <div class="channelRowContent">${channel.name}</div>
            </div>
          `;
        })}
      `;
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
        kanal: channel.name,
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
  renderGroupedPrograms() {
    this.epgBox._debug('EpgRenderManager: _renderGroupedPrograms gestartet', {
      anzahlGruppen: this.epgBox._sortedChannels.length,
      gruppen: this.epgBox._sortedChannels.map(g => ({
        name: g.name,
        anzahlKanäle: g.patterns.flatMap(p => p.channels).length,
      })),
    });

    let rowIndex = 0;
    return this.epgBox._sortedChannels.map(group => {
      // Sammle alle Kanäle aus allen Patterns der Gruppe
      const groupChannels = group.patterns.flatMap(pattern => pattern.channels);

      if (groupChannels.length === 0) {
        return html``; // Leere Gruppe nicht anzeigen
      }

      this.epgBox._debug('EpgRenderManager: Rendere gruppierte Programme für Gruppe', {
        gruppenName: group.name,
        anzahlKanäle: groupChannels.length,
        kanalNamen: groupChannels.map(c => c.name),
      });

      return html`
        <!-- Leere Zeilen für Gruppen-Header -->
        <div class="programRow epg-row-height">
          <div class="noPrograms">
            <!-- Platzhalter für Gruppen-Header -->
          </div>
        </div>
        <!-- Programme der Gruppe -->
        ${groupChannels.map(channel => {
          // Hole den vollständigen Kanal mit Programmen aus der _channels Map
          const fullChannel = this.epgBox._channels.get(channel.id);
          const programs = fullChannel
            ? this.epgBox.dataManager.getProgramsForChannel(
                fullChannel,
                this.epgBox.dataManager.generateTimeSlots()
              )
            : [];
          const currentRowIndex = rowIndex++;

          this.epgBox._debug('EpgRenderManager: Rendere gruppierte Programme für Kanal', {
            gruppenName: group.name,
            kanal: channel.name,
            kanalId: channel.id,
            hatVollständigenKanal: !!fullChannel,
            rowIndex: currentRowIndex,
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
                          <div
                            class="noPrograms"
                            style="width: ${gapDuration * this.epgBox.scale}px;"
                          >
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
        })}
      `;
    });
  }
}
