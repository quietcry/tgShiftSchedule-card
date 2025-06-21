import { html, css } from 'lit';
import { EpgElementBase } from './epg-element-base.js';
import './epg-program-item.js';

export class EpgBox extends EpgElementBase {
  static properties = {
    ...super.properties,
    timeWindow: { type: Number },
    showChannel: { type: Boolean },
    selectedChannel: { type: String },
    channelOrder: { type: Array }, // Array mit Kanaldefinitionen { name: string, style?: string, channels?: Array }
    showChannelGroups: { type: Boolean }, // Zeigt Kanalgruppen an
    scale: { type: Number },
    showShortText: { type: Boolean },
  };

  constructor() {
    super();
    this._channels = new Map(); // Speichert die Kanäle mit ihren Programmen
    this._sortedChannels = []; // Neue detaillierte Sortierungsstruktur
    this._channelOrderInitialized = false; // Flag für initialisierte Sortierung
    this.scale = 1; // Standard-Scale
    this._channelsParameters = { minTime: 0, maxTime: 0 };
    this._containerWidth = 1200; // Geschätzte Container-Breite, wird nach erstem Render aktualisiert
    this._containerWidthMeasured = false; // Flag für gemessene Container-Breite
  }

  updated(changedProperties) {
    if (changedProperties.has('channelOrder')) {
      this._debug('sortedChannels: channelOrder wurde gesetzt', {
        channelOrder: this.channelOrder,
        channelOrderType: typeof this.channelOrder,
        isArray: Array.isArray(this.channelOrder),
        channelOrderLength: this.channelOrder?.length,
      });
    }

    if (changedProperties.has('epgData')) {
      console.log('epg-box: Neue Daten erhalten:', this.epgData);

      if (this.epgData?.channel) {
        console.log('epg-box: Neuer Kanal wird hinzugefügt:', this.epgData.channel.name);
        this._channels.set(this.epgData.channel.id, this.epgData.channel);

        // Initialisiere die Sortierungsstruktur beim ersten Kanal
        if (!this._channelOrderInitialized) {
          this._debug('sortedChannels: Initialisiere Sortierung beim ersten Kanal', {
            kanalName: this.epgData.channel.name,
            sortedChannels: this._sortedChannels,
            channelOrder: this.channelOrder,
            channelOrderInitialized: this._channelOrderInitialized,
          });
          this._initializeChannelOrder();
        }

        // Sortiere den neuen Kanal in die Struktur ein
        this._sortChannelIntoStructure(this.epgData.channel);

        console.log(
          'epg-box: Aktuelle Kanäle:',
          Array.from(this._channels.values()).map(c => c.name)
        );
        this.requestUpdate();
      }
    }

    // Wenn sich die channelOrder ändert, aktualisiere die Sortierung
    if (changedProperties.has('channelOrder')) {
      this._debug('sortedChannels: channelOrder hat sich geändert, aktualisiere Sortierung', {
        neueChannelOrder: this.channelOrder,
        sortedChannels: this._sortedChannels,
      });
      this._channelOrderInitialized = false;
      this._initializeChannelOrder();
      this._updateAllChannelSorting();
      this.requestUpdate();
    }

    // Wenn sich epgShowWidth ändert, aktualisiere den Scale
    if (changedProperties.has('epgShowWidth')) {
      this._debug('epgShowWidth hat sich geändert, aktualisiere Scale', {
        neueEpgShowWidth: this.epgShowWidth,
        containerWidth: this._containerWidth,
      });
      this.scale = this._calculateScale();
      this.requestUpdate();
    }
  }

  firstUpdated() {
    super.firstUpdated();
    this._debug('EPG-Box: firstUpdated - Sende Bereitschaft-Event');

    // Initialisiere die Sortierung für alle vorhandenen Kanäle
    if (this._channels.size > 0 && !this._channelOrderInitialized) {
      this._debug(
        'sortedChannels: Initialisiere Sortierung für vorhandene Kanäle in firstUpdated',
        {
          anzahlVorhandeneKanäle: this._channels.size,
          sortedChannels: this._sortedChannels,
        }
      );
      this._initializeChannelOrder();
      this._updateAllChannelSorting();
    }

    // Sende Event, dass die EPG-Box bereit ist
    this.dispatchEvent(
      new CustomEvent('epg-box-ready', {
        bubbles: true,
        composed: true,
      })
    );

    // Füge Scroll-Event-Listener hinzu für Synchronisation mit Zeitleiste
    this._setupScrollSync();

    // Messen der Container-Breite nach dem ersten Render
    setTimeout(() => {
      this._measureContainerWidth();
    }, 0);
  }

  _setupScrollSync() {
    const programBox = this.shadowRoot?.querySelector('.programBox');
    if (programBox) {
      programBox.addEventListener('scroll', e => {
        this.dispatchEvent(
          new CustomEvent('program-box-scroll', {
            detail: { scrollLeft: e.target.scrollLeft },
            bubbles: true,
            composed: true,
          })
        );
      });
    }
  }

  static styles = [
    super.styles,
    css`
      :host {
        display: block;
        width: 100%;
        height: auto; /* Automatische Höhe basierend auf Inhalt */
        overflow: visible; /* Kein Scroll, damit Inhalte sichtbar sind */
        position: relative;
      }

      :host(.epgBox) {
        display: flex;
        flex-direction: row;
        height: auto; /* Automatische Höhe basierend auf Inhalt */
      }

      .channelBox {
        border-right: 1px solid var(--epg-border-color);
        margin: 0; /* Keine äußeren Abstände */
        padding: 0; /* Keine inneren Abstände */
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
        flex-basis: auto; /* Automatische Basis-Höhe */
        align-items: stretch; /* Verhindert Verteilung über Höhe */
        justify-content: flex-start; /* Startet oben */
        height: fit-content; /* Höhe passt sich an Inhalt an */
        max-height: none; /* Keine Höhenbegrenzung */
      }

      .programBox {
        flex: 1;
        overflow-x: auto;
        margin: 0; /* Keine äußeren Abstände */
        padding: 0; /* Keine inneren Abstände */
        display: flex;
        flex-direction: column;
        height: auto; /* Automatische Höhe basierend auf Inhalt */
        max-height: none; /* Keine Höhenbegrenzung */
      }

      .programRow {
        display: flex;
        border-bottom: none; /* Kein Border */
        margin: 0; /* Keine äußeren Abstände */
        padding: 0; /* Keine inneren Abstände */
        flex-shrink: 0;
        /* Höhenklassen werden über epg-row-height angewendet */
        height: calc(
          var(--epg-row-height) + var(--has-time) + var(--has-duration) + var(--has-description) +
            var(--has-shorttext)
        );
      }

      .channelGroup {
        padding: 4px var(--epg-padding);
        background-color: var(--epg-header-bg);
        color: var(--epg-text-color);
        font-weight: bold;
        display: flex;
        align-items: center;
        margin: 0; /* Keine äußeren Abstände */
        flex-shrink: 0; /* Verhindert Schrumpfen */
      }

      .channelRow {
        padding: 0; /* Kein Padding */
        border: none; /* Kein Border auf der Row selbst */
        cursor: pointer;
        display: flex;
        align-items: center;
        margin: 0; /* Keine äußeren Abstände */
        flex-shrink: 0; /* Verhindert Schrumpfen */
        flex-grow: 0; /* Verhindert Wachsen */
      }

      .channelRow:nth-child(odd) .channelRowContent {
        background-color: var(--epg-odd-channel-bg);
        color: var(--epg-odd-channel-text);
      }

      .channelRow:nth-child(even) .channelRowContent {
        background-color: var(--epg-even-channel-bg);
        color: var(--epg-even-channel-text);
      }

      .channelRowContent {
        padding: var(--epg-padding);
        border: 1px solid var(--epg-border-color);
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        border-radius: var(--epg-radius);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-height: 100%;
      }

      /* Selected-Zustand überschreibt die abwechselnden Farben */
      .channelRow.selected .channelRowContent {
        background-color: var(--epg-accent);
        color: var(--epg-text-color);
      }

      .programSlot {
        padding: var(--epg-padding);
        border: 1px solid var(--epg-border-color);
        margin: 4px;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      .programSlot:hover {
        background-color: var(--epg-hover-bg);
      }

      .programSlot.current {
        background-color: var(--epg-accent);
        color: var(--epg-text-color);
      }

      .programTitle {
        font-weight: bold;
        margin-bottom: 4px;
      }

      .programTime {
        font-size: 0.8em;
        color: var(--epg-time-color);
      }

      .programDescription {
        font-size: 0.8em;
        color: var(--epg-description-color);
        margin-top: 4px;
      }

      .loading {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 200px;
        color: var(--epg-text-color);
      }

      .error {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 200px;
        color: #f44336;
      }

      .noPrograms {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: var(--epg-padding);
        color: var(--epg-text-color);
        font-style: italic;
        /* Höhenklassen werden über epg-row-height angewendet */
        height: calc(
          var(--epg-row-height) + var(--has-time) + var(--has-duration) + var(--has-description) +
            var(--has-shorttext)
        );
        box-sizing: border-box;
      }
    `,
  ];

  render() {
    this._debug('EPG-Box: Render wird aufgerufen', {
      anzahlKanale: this._channels.size,
    });

    if (!this._channels.size) {
      console.log('epg-box: Erste Renderung - noch keine Daten');
      return this._renderLoading();
    }

    console.log('=== DEBUG: KANÄLE VORHANDEN ===');
    console.log('Anzahl Kanäle:', this._channels.size);

    // Berechne Scale für die Darstellung
    this.scale = this._calculateScale();

    // Verwende alle verfügbaren Kanäle direkt
    const allChannels = Array.from(this._channels.values());

    console.log(
      'EPG-Box: Alle Kanäle:',
      allChannels.map(c => ({
        name: c.name,
        id: c.id,
        anzahlProgramme: c.programs?.length || 0,
        programme: c.programs?.map(p => p.title) || [],
      }))
    );

    this._debug('EPG-Box: Verwende Kanäle für Rendering', {
      anzahlKanale: allChannels.length,
      kanalNamen: allChannels.map(c => c.name),
      scale: this.scale,
      channelsParameters: this._channelsParameters,
    });

    return html`
      <div class="channelBox">
        ${allChannels.map(channel => {
          // Berechne Höhenklassen für Channel-Row basierend auf den Anzeigeoptionen
          const heightClasses = this._calculateHeightClasses(
            this.showTime,
            this.showDuration,
            this.showDescription,
            true, // Zeit ist verfügbar
            true, // Dauer ist verfügbar
            false, // Channel hat keine Beschreibung
            this.showShortText // ShortText-Option
          );

          return html`
            <div class="channelRow epg-row-height ${heightClasses}">
              <div class="channelRowContent">${channel.name}</div>
            </div>
          `;
        })}
      </div>
      <div class="programBox">
        ${allChannels.map((channel, rowIndex) => {
          const programs = this._getProgramsForChannel(channel, this._generateTimeSlots());

          console.log(
            `EPG-Box: Programme für ${channel.name}:`,
            programs.length,
            programs.map(p => p.title)
          );

          return html`
            <div
              class="programRow epg-row-height ${this._calculateHeightClasses(
                this.showTime,
                this.showDuration,
                this.showDescription,
                true, // Zeit ist verfügbar für Programme
                true, // Dauer ist verfügbar für Programme
                false, // Beschreibung wird pro Programm-Item berechnet
                this.showShortText // ShortText-Option
              )}"
            >
              ${programs.length > 0
                ? (() => {
                    // Füge leeres Programm-Item am Anfang hinzu, wenn minTime gesetzt ist
                    const items = [];
                    let itemIndex = 0;

                    if (this._channelsParameters.minTime > 0) {
                      const firstProgram = programs[0];
                      const gapDuration = this._calculateDuration(
                        this._channelsParameters.minTime,
                        firstProgram.start
                      );

                      // Füge leeres Item immer hinzu, auch wenn gapDuration 0 ist
                      items.push(html`
                        <epg-program-item
                          .start=${this._channelsParameters.minTime}
                          .stop=${firstProgram.start}
                          .duration=${gapDuration}
                          .scale=${this.scale}
                          .title=${''}
                          .description=${''}
                          .shortText=${''}
                          .isCurrent=${false}
                          .showTime=${false}
                          .showDuration=${false}
                          .showDescription=${false}
                          .showShortText=${this.showShortText}
                          .rowIndex=${rowIndex}
                          .itemIndex=${itemIndex++}
                        ></epg-program-item>
                      `);
                    }

                    // Füge alle echten Programme hinzu
                    programs.forEach(program => {
                      const duration = this._calculateDuration(
                        program.start,
                        program.end || program.stop
                      );

                      items.push(html`
                        <epg-program-item
                          .start=${program.start}
                          .stop=${program.end || program.stop}
                          .duration=${duration}
                          .scale=${this.scale}
                          .title=${program.title}
                          .description=${program.description || ''}
                          .shortText=${program.shorttext || ''}
                          .isCurrent=${this._isCurrentProgram(program)}
                          .showTime=${this.showTime}
                          .showDuration=${this.showDuration}
                          .showDescription=${this.showDescription}
                          .showShortText=${this.showShortText}
                          .rowIndex=${rowIndex}
                          .itemIndex=${itemIndex++}
                          @program-selected=${e => this._onProgramSelected(e.detail)}
                        ></epg-program-item>
                      `);
                    });

                    return items;
                  })()
                : html`<div
                    class="noPrograms epg-row-height ${this._calculateHeightClasses(
                      this.showTime,
                      this.showDuration,
                      this.showDescription,
                      false, // Keine Zeit
                      false, // Keine Dauer
                      false, // Keine Beschreibung
                      false // Kein ShortText
                    )}"
                  >
                    Keine Programme verfügbar
                  </div>`}
            </div>
          `;
        })}
      </div>
    `;
  }

  _renderLoading() {
    return html`
      <div class="loading">
        <ha-circular-progress indeterminate></ha-circular-progress>
        <div>Lade EPG-Daten...</div>
      </div>
    `;
  }

  _generateTimeSlots() {
    const slots = [];
    const now = new Date();

    // Verwende die konfigurierten Zeitparameter oder Standardwerte
    const pastTime = this.epgPastTime || 30; // Minuten in die Vergangenheit
    const futureTime = this.epgFutureTime || 120; // Minuten in die Zukunft
    const showWidth = this.epgShowWidth || 180; // Minuten sichtbar

    // Berechne Start- und Endzeit basierend auf den Parametern
    const startTime = new Date(now.getTime() - pastTime * 60 * 1000);
    const endTime = new Date(now.getTime() + futureTime * 60 * 1000);

    // Runde auf volle Stunden für bessere Darstellung
    startTime.setMinutes(0, 0, 0);
    endTime.setMinutes(0, 0, 0);

    this._debug('_generateTimeSlots: Zeitparameter', {
      pastTime,
      futureTime,
      showWidth,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      now: now.toISOString(),
    });

    // Generiere Zeitslots in 30-Minuten-Intervallen
    const currentSlot = new Date(startTime);
    while (currentSlot <= endTime) {
      slots.push(new Date(currentSlot));
      currentSlot.setMinutes(currentSlot.getMinutes() + 30);
    }

    this._debug('_generateTimeSlots: Generierte Slots', {
      anzahlSlots: slots.length,
      ersteSlot: slots[0]?.toISOString(),
      letzteSlot: slots[slots.length - 1]?.toISOString(),
    });

    return slots;
  }

  _isCurrentTimeSlot(slot, currentTime) {
    return slot.getHours() === currentTime.getHours();
  }

  _getProgramsForChannel(channel, timeSlots) {
    if (!channel.programs) {
      this._debug('_getProgramsForChannel: Keine Programme für Kanal', {
        kanal: channel.name,
        hatProgramme: !!channel.programs,
      });
      return [];
    }

    if (!Array.isArray(channel.programs) || channel.programs.length === 0) {
      this._debug('_getProgramsForChannel: Leeres Programm-Array für Kanal', {
        kanal: channel.name,
        programme: channel.programs,
      });
      return [];
    }

    // Verwende die konfigurierten Zeitparameter für die Filterung
    const pastTime = this.epgPastTime || 30; // Minuten in die Vergangenheit
    const futureTime = this.epgFutureTime || 120; // Minuten in die Zukunft

    const now = new Date();
    const startTime = new Date(now.getTime() - pastTime * 60 * 1000);
    const endTime = new Date(now.getTime() + futureTime * 60 * 1000);

    this._debug('_getProgramsForChannel: Zeitfilterung', {
      kanal: channel.name,
      anzahlProgramme: channel.programs.length,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      now: now.toISOString(),
      programme: channel.programs.map(p => ({
        title: p.title,
        start: p.start,
        stop: p.stop,
        end: p.end,
        startDate: new Date(p.start * 1000).toISOString(),
        endDate: new Date((p.end || p.stop) * 1000).toISOString(),
      })),
    });

    const filteredPrograms = channel.programs.filter(program => {
      // Stelle sicher, dass die Programme gültige Zeitstempel haben
      if (!program.start || !(program.end || program.stop)) {
        this._debug('_getProgramsForChannel: Programm ohne gültige Zeitstempel', {
          title: program.title,
          start: program.start,
          end: program.end,
          stop: program.stop,
        });
        return false;
      }

      // Konvertiere Unix-Timestamps zu Date-Objekten
      const programStart = new Date(program.start * 1000);
      const programEnd = new Date((program.end || program.stop) * 1000);

      // Zeige Programme an, die sich mit dem Zeitfenster überschneiden
      const overlaps = programStart < endTime && programEnd > startTime;

      this._debug('_getProgramsForChannel: Programm-Prüfung', {
        title: program.title,
        startTimestamp: program.start,
        stopTimestamp: program.stop,
        endTimestamp: program.end,
        programStart: programStart.toISOString(),
        programEnd: programEnd.toISOString(),
        overlaps,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

      return overlaps;
    });

    // Berechne minTime und maxTime über alle gefilterten Programme
    if (filteredPrograms.length > 0) {
      const allStarts = filteredPrograms.map(p => p.start);
      const allEnds = filteredPrograms.map(p => p.end || p.stop);

      const minStart = Math.min(...allStarts);
      const maxEnd = Math.max(...allEnds);

      // Aktualisiere _channelsParameters nur wenn neue Werte größer/kleiner sind
      if (this._channelsParameters.minTime === 0 || minStart < this._channelsParameters.minTime) {
        this._channelsParameters.minTime = minStart;
      }
      if (maxEnd > this._channelsParameters.maxTime) {
        this._channelsParameters.maxTime = maxEnd;
      }

      this._debug('_getProgramsForChannel: _channelsParameters aktualisiert', {
        kanal: channel.name,
        anzahlGefilterteProgramme: filteredPrograms.length,
        minStart,
        maxEnd,
        channelsParameters: this._channelsParameters,
      });
    }

    this._debug('_getProgramsForChannel: Gefilterte Programme', {
      kanal: channel.name,
      anzahlVorher: channel.programs.length,
      anzahlNachher: filteredPrograms.length,
      gefilterteProgramme: filteredPrograms.map(p => p.title),
    });

    return filteredPrograms;
  }

  _onChannelSelected(channel) {
    this.selectedChannel = channel.id;
    this.dispatchEvent(
      new CustomEvent('channel-selected', {
        detail: { channel },
        bubbles: true,
        composed: true,
      })
    );
  }

  _onProgramSelected(program) {
    this.dispatchEvent(
      new CustomEvent('program-selected', {
        detail: { program },
        bubbles: true,
        composed: true,
      })
    );
  }

  addEpgData(data) {
    this._debug('EPG-Box: EPG-Daten empfangen', {
      kanal: data?.channel?.name,
      anzahlProgramme: data?.programs?.length,
    });

    if (data?.channel?.id) {
      const channel = this._channels.get(data.channel.id);
      if (channel) {
        this._debug('EPG-Box: Aktualisiere Programme für Kanal', {
          kanal: channel.name,
          alteAnzahl: channel.programs.length,
          neueAnzahl: data.programs.length,
        });
        channel.programs = data.programs || [];
        this._channels.set(data.channel.id, channel);
        this.requestUpdate();
        this._debug('EPG-Box: Update angefordert');
      } else {
        this._debug('EPG-Box: Kanal nicht gefunden', {
          kanalId: data.channel.id,
        });
      }
    } else {
      this._debug('EPG-Box: Ungültige EPG-Daten', {
        hatKanal: !!data?.channel,
        hatKanalId: !!data?.channel?.id,
      });
    }
  }

  addTeilEpg(teilEpg) {
    this._debug('EPG-Box: Teil-EPG empfangen', {
      kanal: teilEpg?.channel?.name,
      anzahlProgramme: teilEpg?.programs?.length,
    });

    if (teilEpg?.channel?.id && teilEpg?.programs) {
      // Speichere das Teil-EPG direkt
      this._channels.set(teilEpg.channel.id, {
        ...teilEpg.channel,
        programs: teilEpg.programs,
      });

      this._debug('EPG-Box: Kanal gespeichert', {
        kanal: teilEpg.channel.name,
        anzahlProgramme: teilEpg.programs.length,
        gesamtKanale: this._channels.size,
      });

      this.requestUpdate();
      this._debug('EPG-Box: Update angefordert');
    } else {
      this._debug('EPG-Box: Ungültiges Teil-EPG', {
        hatKanal: !!teilEpg?.channel,
        hatKanalId: !!teilEpg?.channel?.id,
        hatProgramme: !!teilEpg?.programs,
      });
    }
  }

  // Neue Methode: Initialisiert die Sortierungsstruktur basierend auf channelOrder
  _initializeChannelOrder() {
    this._debug('EpgBox: Initialisiere Sortierungsstruktur', {
      channelOrder: this.channelOrder,
      channelOrderType: typeof this.channelOrder,
      isArray: Array.isArray(this.channelOrder),
      channelOrderLength: this.channelOrder?.length,
    });

    // Parse YAML-String zu Array, falls channelOrder ein String ist
    let parsedChannelOrder = this.channelOrder;
    if (typeof this.channelOrder === 'string' && this.channelOrder.trim()) {
      try {
        // Einfacher YAML-Parser für unsere spezifische Struktur
        parsedChannelOrder = this._parseYamlString(this.channelOrder);
        this._debug('sortedChannels: YAML erfolgreich geparst', {
          originalString: this.channelOrder,
          parsedResult: parsedChannelOrder,
        });
      } catch (error) {
        this._debug('sortedChannels: Fehler beim YAML-Parsing', {
          error: error.message,
          originalString: this.channelOrder,
        });
        parsedChannelOrder = [];
      }
    }

    if (
      !parsedChannelOrder ||
      !Array.isArray(parsedChannelOrder) ||
      parsedChannelOrder.length === 0
    ) {
      this._debug('EpgBox: Keine gültige channelOrder definiert, verwende Standard-Sortierung');
      this._sortedChannels = [
        {
          name: 'Alle Kanäle',
          style: '',
          patterns: [
            {
              pattern: '.*',
              style: '',
              channels: [],
            },
          ],
        },
      ];
      this._channelOrderInitialized = true;
      this._debug('sortedChannels: Standard-Struktur erstellt', {
        anzahlGruppen: this._sortedChannels.length,
        gruppen: this._sortedChannels.map(g => ({
          name: g.name,
          patterns: g.patterns.map(p => ({
            pattern: p.pattern,
            anzahlKanäle: p.channels.length,
          })),
        })),
        sortedChannels: this._sortedChannels,
      });
      return;
    }

    this._sortedChannels = [];
    this._channelsParameters = { minTime: 0, maxTime: 0 };

    parsedChannelOrder.forEach(item => {
      if (!item) return;

      // Ignoriere "channels:" als ungültigen Kanal-Namen
      if (item.name === 'channels:') return;

      if (item.channels && Array.isArray(item.channels) && item.channels.length > 0) {
        // Gruppe mit definierten Kanälen
        const patterns = item.channels
          .filter(channelConfig => channelConfig && channelConfig.name)
          .map(channelConfig => ({
            pattern: channelConfig.name,
            style: channelConfig.style || item.style || '',
            channels: [], // Kanäle werden direkt hier gespeichert
          }));

        this._sortedChannels.push({
          name: item.name,
          style: item.style || '',
          patterns: patterns,
        });

        this._debug('sortedChannels: Gruppe mit definierten Kanälen hinzugefügt', {
          gruppenName: item.name,
          patterns: patterns.map(p => ({ pattern: p.pattern, style: p.style })),
          anzahlPatterns: patterns.length,
          aktuelleAnzahlGruppen: this._sortedChannels.length,
          sortedChannels: this._sortedChannels,
        });
      } else if (item.name) {
        // Einzelner Kanal oder Gruppe ohne definierte Kanäle
        this._sortedChannels.push({
          name: item.name,
          style: item.style || '',
          patterns: [
            {
              pattern: item.name,
              style: item.style || '',
              channels: [], // Kanäle werden direkt hier gespeichert
            },
          ],
        });

        this._debug('sortedChannels: Einzelgruppe hinzugefügt', {
          gruppenName: item.name,
          pattern: item.name,
          aktuelleAnzahlGruppen: this._sortedChannels.length,
          sortedChannels: this._sortedChannels,
        });
      }
    });

    // Füge eine Gruppe für nicht zugeordnete Kanäle hinzu
    this._sortedChannels.push({
      name: 'Sonstige',
      style: '',
      patterns: [
        {
          pattern: '.*',
          style: '',
          channels: [],
        },
      ],
    });

    this._channelOrderInitialized = true;
    this._debug('sortedChannels: Sortierungsstruktur vollständig initialisiert', {
      anzahlGruppen: this._sortedChannels.length,
      gruppen: this._sortedChannels.map(g => ({
        name: g.name,
        patterns: g.patterns.map(p => ({
          pattern: p.pattern,
          anzahlKanäle: p.channels.length,
        })),
      })),
      sortedChannels: this._sortedChannels,
    });
  }

  // Neue Methode: Parst YAML-String zu Array
  _parseYamlString(yamlString) {
    this._debug('sortedChannels: Starte YAML-Parsing', {
      yamlString: yamlString,
    });

    const lines = yamlString.split('\n');
    const result = [];
    let currentGroup = null;
    let currentIndent = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('#')) continue;

      const indent = lines[i].length - lines[i].trimStart().length;

      // Neue Gruppe (beginnt mit -)
      if (line.startsWith('- ')) {
        const groupName = line.substring(2).replace(':', '');
        currentGroup = {
          name: groupName,
          style: '',
          channels: [],
        };
        result.push(currentGroup);
        currentIndent = indent;
        this._debug('sortedChannels: Neue Gruppe erkannt', {
          groupName: groupName,
          indent: indent,
        });
      }
      // channels: Zeile
      else if (line === 'channels:' && currentGroup) {
        this._debug('sortedChannels: channels-Sektion erkannt');
        // Nächste Zeilen sind Kanäle
        let j = i + 1;
        while (j < lines.length) {
          const nextLine = lines[j].trim();
          const nextIndent = lines[j].length - lines[j].trimStart().length;

          // Wenn Einrückung kleiner wird, sind wir aus der channels-Sektion raus
          if (nextIndent <= indent) break;

          if (nextLine.startsWith('- name:')) {
            const channelName = nextLine.substring(7).trim();
            currentGroup.channels.push({
              name: channelName,
              style: '',
            });
            this._debug('sortedChannels: Kanal zu Gruppe hinzugefügt', {
              groupName: currentGroup.name,
              channelName: channelName,
            });
          }
          j++;
        }
        i = j - 1; // Überspringe die verarbeiteten Zeilen
      }
    }

    this._debug('sortedChannels: YAML-Parsing abgeschlossen', {
      result: result,
    });

    return result;
  }

  // Neue Methode: Sortiert einen Kanal in die Struktur ein
  _sortChannelIntoStructure(channel) {
    this._debug('sortedChannels: Starte Einsortierung von Kanal', {
      kanalName: channel.name,
      kanalId: channel.id,
      aktuelleAnzahlGruppen: this._sortedChannels.length,
      sortedChannels: this._sortedChannels,
    });

    // Prüfe, ob der Kanal bereits in einem Pattern ist
    for (const group of this._sortedChannels) {
      for (const patternConfig of group.patterns) {
        if (patternConfig.channels.some(c => c.id === channel.id)) {
          this._debug('sortedChannels: Kanal bereits in Pattern vorhanden', {
            kanalName: channel.name,
            gruppe: group.name,
            pattern: patternConfig.pattern,
            sortedChannels: this._sortedChannels,
          });
          return;
        }
      }
    }

    // Suche nach passender Gruppe und Pattern
    for (const group of this._sortedChannels) {
      for (const patternConfig of group.patterns) {
        try {
          const regex = new RegExp(patternConfig.pattern, 'i');
          if (regex.test(channel.name)) {
            // Kanal passt zu diesem Pattern
            const channelWithStyle = {
              ...channel,
              style: patternConfig.style,
            };

            patternConfig.channels.push(channelWithStyle);

            // Sortiere die Kanäle alphanumerisch nach Namen, wenn mehr als ein Kanal vorhanden ist
            if (patternConfig.channels.length > 1) {
              patternConfig.channels.sort((a, b) =>
                a.name.localeCompare(b.name, 'de', { numeric: true })
              );
              this._debug('sortedChannels: Kanäle in Pattern alphanumerisch sortiert', {
                pattern: patternConfig.pattern,
                gruppe: group.name,
                anzahlKanäle: patternConfig.channels.length,
                sortierteKanalNamen: patternConfig.channels.map(c => c.name),
                sortedChannels: this._sortedChannels,
              });
            }

            this._debug('sortedChannels: Kanal erfolgreich zu Pattern hinzugefügt', {
              kanalName: channel.name,
              gruppe: group.name,
              pattern: patternConfig.pattern,
              style: patternConfig.style,
              neueAnzahlKanäleInPattern: patternConfig.channels.length,
              gesamtAnzahlKanäle: this._sortedChannels.flatMap(g =>
                g.patterns.flatMap(p => p.channels)
              ).length,
              sortedChannels: this._sortedChannels,
            });
            return;
          }
        } catch (error) {
          this._debug('sortedChannels: Fehler beim Pattern-Matching', {
            pattern: patternConfig.pattern,
            kanalName: channel.name,
            gruppe: group.name,
            error: error.message,
            sortedChannels: this._sortedChannels,
          });
        }
      }
    }

    // Kanal passt zu keiner Gruppe, füge zur "Sonstige"-Gruppe hinzu
    const sonstigeGroup = this._sortedChannels.find(g => g.name === 'Sonstige');
    if (sonstigeGroup) {
      // Erstelle ein Pattern für die Sonstige-Gruppe, falls noch keines existiert
      if (sonstigeGroup.patterns.length === 0) {
        sonstigeGroup.patterns.push({
          pattern: '.*',
          style: '',
          channels: [],
        });
      }

      sonstigeGroup.patterns[0].channels.push(channel);

      // Sortiere die Kanäle alphanumerisch nach Namen, wenn mehr als ein Kanal vorhanden ist
      if (sonstigeGroup.patterns[0].channels.length > 1) {
        sonstigeGroup.patterns[0].channels.sort((a, b) =>
          a.name.localeCompare(b.name, 'de', { numeric: true })
        );
        this._debug('sortedChannels: Kanäle in Sonstige-Gruppe alphanumerisch sortiert', {
          anzahlKanäle: sonstigeGroup.patterns[0].channels.length,
          sortierteKanalNamen: sonstigeGroup.patterns[0].channels.map(c => c.name),
          sortedChannels: this._sortedChannels,
        });
      }

      this._debug('sortedChannels: Kanal zur Sonstige-Gruppe hinzugefügt', {
        kanalName: channel.name,
        neueAnzahlKanäleInSonstige: sonstigeGroup.patterns[0].channels.length,
        gesamtAnzahlKanäle: this._sortedChannels.flatMap(g => g.patterns.flatMap(p => p.channels))
          .length,
        sortedChannels: this._sortedChannels,
      });
    } else {
      this._debug('sortedChannels: FEHLER - Sonstige-Gruppe nicht gefunden', {
        kanalName: channel.name,
        verfügbareGruppen: this._sortedChannels.map(g => g.name),
        sortedChannels: this._sortedChannels,
      });
    }
  }

  // Neue Methode: Aktualisiert die Sortierung für alle vorhandenen Kanäle
  _updateAllChannelSorting() {
    this._debug('sortedChannels: Starte Neusortierung aller Kanäle', {
      anzahlVorhandeneKanäle: this._channels.size,
      anzahlGruppen: this._sortedChannels.length,
      sortedChannels: this._sortedChannels,
    });

    // Leere alle Pattern-Kanäle
    this._sortedChannels.forEach(group => {
      group.patterns.forEach(pattern => {
        const alteAnzahl = pattern.channels.length;
        pattern.channels = [];
        this._debug('sortedChannels: Pattern geleert', {
          gruppenName: group.name,
          pattern: pattern.pattern,
          alteAnzahlKanäle: alteAnzahl,
          neueAnzahlKanäle: 0,
          sortedChannels: this._sortedChannels,
        });
      });
    });

    // Sortiere alle Kanäle neu ein
    Array.from(this._channels.values()).forEach(channel => {
      this._sortChannelIntoStructure(channel);
    });

    // Sortiere alle Pattern-Kanäle alphanumerisch
    this._sortAllPatternChannels();

    this._debug('sortedChannels: Neusortierung aller Kanäle abgeschlossen', {
      gesamtAnzahlKanäle: this._sortedChannels.flatMap(g => g.patterns.flatMap(p => p.channels))
        .length,
      gruppenStatus: this._sortedChannels.map(g => ({
        name: g.name,
        patterns: g.patterns.map(p => ({
          pattern: p.pattern,
          anzahlKanäle: p.channels.length,
          kanalNamen: p.channels.map(c => c.name),
        })),
      })),
      sortedChannels: this._sortedChannels,
    });
  }

  // Neue Hilfsmethode: Sortiert alle Kanäle in allen Patterns alphanumerisch
  _sortAllPatternChannels() {
    this._sortedChannels.forEach(group => {
      group.patterns.forEach(pattern => {
        if (pattern.channels.length > 1) {
          pattern.channels.sort((a, b) => a.name.localeCompare(b.name, 'de', { numeric: true }));
          this._debug('sortedChannels: Pattern-Kanäle alphanumerisch sortiert', {
            gruppe: group.name,
            pattern: pattern.pattern,
            anzahlKanäle: pattern.channels.length,
            sortierteKanalNamen: pattern.channels.map(c => c.name),
            sortedChannels: this._sortedChannels,
          });
        }
      });
    });
  }

  _calculateScale() {
    // Verwende die gemessene Container-Breite oder geschätzte Breite
    const containerWidth = this._containerWidth;
    const showWidth = this.epgShowWidth || 180; // Minuten sichtbar

    // Berechne Scale: Container-Breite / Anzeigebreite in Minuten
    const scale = containerWidth / showWidth;

    this._debug('_calculateScale', {
      containerWidth,
      showWidth,
      scale,
      containerWidthMeasured: this._containerWidthMeasured,
    });

    return scale;
  }

  // Neue Methode: Misst die tatsächliche Container-Breite
  _measureContainerWidth() {
    const programBox = this.shadowRoot?.querySelector('.programBox');
    if (programBox) {
      const measuredWidth = programBox.clientWidth;
      if (measuredWidth > 0) {
        this._containerWidth = measuredWidth;
        this._containerWidthMeasured = true;

        this._debug('_measureContainerWidth', {
          measuredWidth,
          oldWidth: this._containerWidth,
          containerWidthMeasured: this._containerWidthMeasured,
        });

        // Recalculate scale with new container width
        this.scale = this._calculateScale();
        this.requestUpdate();
      }
    }
  }
}

customElements.define('epg-box', EpgBox);
