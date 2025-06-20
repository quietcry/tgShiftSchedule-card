import { html, css } from 'lit';
import { ViewBase } from '../../views/view-base.js';

export class EpgBox extends ViewBase {
  static properties = {
    epgData: { type: Object },
    currentTime: { type: Number },
    timeWindow: { type: Number },
    showChannel: { type: Boolean },
    showTime: { type: Boolean },
    showDuration: { type: Boolean },
    showTitle: { type: Boolean },
    showDescription: { type: Boolean },
    selectedChannel: { type: String },
    channelOrder: { type: Array }, // Array mit Kanaldefinitionen { name: string, style?: string, channels?: Array }
    showChannelGroups: { type: Boolean }, // Zeigt Kanalgruppen an
  };

  constructor() {
    super();
    this._channels = new Map(); // Speichert die Kanäle mit ihren Programmen
    this._sortedChannels = []; // Neue detaillierte Sortierungsstruktur
    this._channelOrderInitialized = false; // Flag für initialisierte Sortierung
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
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      overflow: auto;
      position: relative;
    }

    :host(.epgBox) {
      display: grid;
      grid-template-columns: auto 1fr;
      grid-template-areas: 'channelBox programBox';
    }

    .channelBox {
      grid-area: channelBox;
      min-width: 120px;
      border-right: 1px solid var(--divider-color);
    }

    .programBox {
      grid-area: programBox;
      overflow-x: auto;
    }

    .channelGroup {
      padding: 4px 8px;
      background-color: var(--primary-color);
      color: var(--text-primary-color);
      font-weight: bold;
    }

    .channelRow {
      padding: 8px;
      border-bottom: 1px solid var(--divider-color);
      cursor: pointer;
    }

    .channelRow.selected {
      background-color: var(--accent-color);
      color: var(--text-primary-color);
    }

    .programSlot {
      padding: 8px;
      border: 1px solid var(--divider-color);
      margin: 4px;
      cursor: pointer;
      min-width: 100px;
    }

    .programSlot.current {
      background-color: var(--accent-color);
      color: var(--text-primary-color);
    }

    .programTitle {
      font-weight: bold;
      margin-bottom: 4px;
    }

    .programTime {
      font-size: 0.8em;
      color: var(--secondary-text-color);
    }
  `;

  render() {
    if (!this._channels.size) {
      console.log('epg-box: Erste Renderung - noch keine Daten');
      return this._renderLoading();
    }

    // Verwende die neue Sortierungsstruktur
    if (!this._channelOrderInitialized) {
      this._debug('sortedChannels: Initialisiere Sortierung in render Methode', {
        anzahlKanäle: this._channels.size,
        sortedChannels: this._sortedChannels,
      });
      this._initializeChannelOrder();
      this._updateAllChannelSorting();
    }

    console.log('epg-box: Rendere mit', this._sortedChannels.length, 'Gruppen');

    // Sammle alle Kanäle aus allen Gruppen
    const allChannels = this._sortedChannels.flatMap(group =>
      group.patterns.flatMap(p => p.channels)
    );

    this._debug('sortedChannels: Render-Status', {
      anzahlGruppen: this._sortedChannels.length,
      gesamtAnzahlKanäle: allChannels.length,
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

    return html`
      <div class="channelBox">${this._renderSortedChannels()}</div>
      <div class="programBox">
        ${allChannels.map(
          channel => html`
            <div class="programRow">
              ${this._getProgramsForChannel(channel, this._generateTimeSlots()).map(
                program => html`
                  <div
                    class="programSlot ${this._isCurrentProgram(program) ? 'current' : ''}"
                    style="width: ${this._calculateProgramWidth(program)}px"
                    @click=${() => this._onProgramSelected(program)}
                  >
                    <div class="programTitle">${program.title}</div>
                    <div class="programTime">
                      ${this._formatTime(new Date(program.start))} -
                      ${this._formatTime(new Date(program.end))}
                    </div>
                  </div>
                `
              )}
            </div>
          `
        )}
      </div>
    `;
  }

  // Neue Methode: Rendert die sortierten Kanäle
  _renderSortedChannels() {
    return this._sortedChannels.map(group => {
      // Sammle alle Kanäle aus allen Patterns der Gruppe
      const groupChannels = group.patterns.flatMap(p => p.channels);

      if (groupChannels.length === 0) {
        return html``;
      }

      return html`
        ${this.showChannelGroups
          ? html`<div class="channelGroup" style="${group.style || ''}">${group.name}</div>`
          : ''}
        ${groupChannels.map(
          channel => html`
            <div
              class="channelRow ${this.selectedChannel === channel.id ? 'selected' : ''}"
              style="${channel.style || ''}"
              @click=${() => this._onChannelSelected(channel)}
            >
              ${channel.name}
            </div>
          `
        )}
      `;
    });
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
    const startTime = new Date(now);
    startTime.setHours(0, 0, 0, 0);

    for (let i = 0; i < 24; i++) {
      const slot = new Date(startTime);
      slot.setHours(i);
      slots.push(slot);
    }

    return slots;
  }

  _formatTime(date) {
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  _isCurrentTimeSlot(slot, currentTime) {
    return slot.getHours() === currentTime.getHours();
  }

  _isCurrentProgram(program) {
    const now = new Date();
    const start = new Date(program.start);
    const end = new Date(program.end);
    return now >= start && now <= end;
  }

  _calculateProgramWidth(program) {
    const start = new Date(program.start);
    const end = new Date(program.end);
    const duration = (end - start) / (1000 * 60); // Dauer in Minuten
    return (duration / 60) * 120; // 120px pro Stunde
  }

  _getProgramsForChannel(channel, timeSlots) {
    if (!channel.programs) return [];

    const startTime = timeSlots[0];
    const endTime = new Date(timeSlots[timeSlots.length - 1]);
    endTime.setHours(23, 59, 59, 999);

    return channel.programs.filter(program => {
      const programStart = new Date(program.start);
      const programEnd = new Date(program.end);
      return programStart >= startTime && programEnd <= endTime;
    });
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

      // Initialisiere die Sortierungsstruktur beim ersten Kanal
      if (!this._channelOrderInitialized) {
        this._debug('sortedChannels: Initialisiere Sortierung beim ersten Teil-EPG', {
          kanalName: teilEpg.channel.name,
          sortedChannels: this._sortedChannels,
        });
        this._initializeChannelOrder();
      }

      // Sortiere den neuen Kanal in die Struktur ein
      this._sortChannelIntoStructure(teilEpg.channel);

      this._debug('EPG-Box: Teil-EPG gespeichert', {
        kanal: teilEpg.channel.name,
        anzahlProgramme: teilEpg.programs.length,
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
}

customElements.define('epg-box', EpgBox);
