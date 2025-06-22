import { html, css } from 'lit';
import { EpgElementBase } from './epg-element-base.js';
import './epg-program-item.js';

export class EpgBox extends EpgElementBase {
  static className = 'EpgBox';

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
    this.isFirstLoad = 0; // Indikator für ersten Datenabruf (0=initial, 1=loading, 2=complete)
    this.isChannelUpdate = 0; // Counter für aktive Kanal-Updates
  }

  updated(changedProperties) {
    if (changedProperties.has('channelOrder')) {
      this._debug('channelOrder geändert');
      this._channelOrderInitialized = false;
      this._initializeChannelOrder();
      this._updateAllChannelSorting();
      this.requestUpdate();
    }

    if (changedProperties.has('epgData')) {
      if (this.epgData?.channel) {
        this._channels.set(this.epgData.channel.id, this.epgData.channel);

        // Initialisiere die Sortierungsstruktur beim ersten Kanal
        if (!this._channelOrderInitialized) {
          this._initializeChannelOrder();
        }

        // Sortiere den neuen Kanal in die Struktur ein
        this._sortChannelIntoStructure(this.epgData.channel);

        this.requestUpdate();
      }
    }

    // Wenn sich epgShowWidth ändert, aktualisiere den Scale
    if (changedProperties.has('epgShowWidth')) {
      this.scale = this._calculateScale();
      this.requestUpdate();
    }

    // Prüfe epgBackview Validierung
    if (changedProperties.has('epgBackview') || changedProperties.has('epgPastTime') || changedProperties.has('epgShowWidth')) {
      this._validateEpgBackview();
    }

    // Verringere isChannelUpdate nach erfolgreichem Update
    if (this.isChannelUpdate > 0) {
      this.isChannelUpdate--;
      this._debug('EpgBox: Update abgeschlossen, isChannelUpdate verringert', {
        neuerWert: this.isChannelUpdate,
        isFirstLoad: this.isFirstLoad,
      });

      // Rufe testIsFirstLoadCompleteUpdated auf, wenn ein Teil-EPG fertig angezeigt wird
      this.testIsFirstLoadCompleteUpdated();
    }
  }

  testIsFirstLoadCompleteUpdated() {
    this._debug('EpgBox: testIsFirstLoadCompleteUpdated aufgerufen', {
      isFirstLoad: this.isFirstLoad,
      isChannelUpdate: this.isChannelUpdate,
    });

    // Wenn isFirstLoad == 1 && isChannelUpdate == 0 dann isFirstLoad = 2
    if (this.isFirstLoad === 1 && this.isChannelUpdate === 0) {
      this.isFirstLoad = 2;
      this._debug('EpgBox: testIsFirstLoadCompleteUpdated - isFirstLoad auf 2 gesetzt', {
        isFirstLoad: this.isFirstLoad,
        isChannelUpdate: this.isChannelUpdate,
      });

      // Sende Event, dass der erste Load abgeschlossen ist
      this.dispatchEvent(
        new CustomEvent('epg-first-load-complete', {
          detail: {
            isFirstLoad: this.isFirstLoad,
            isChannelUpdate: this.isChannelUpdate,
            channelCount: this._channels.size,
          },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  _validateEpgBackview() {
    const epgPastTime = this.epgPastTime || 30;
    const epgShowWidth = this.epgShowWidth || 180;
    const epgBackview = this.epgBackview || 0;

    this._debug('EpgBox: Validiere epgBackview', {
      epgBackview,
      epgPastTime,
      epgShowWidth,
      isValid: epgBackview <= epgPastTime && epgBackview <= epgShowWidth,
    });

    // Prüfe ob epgBackview <= epgPastTime && epgBackview <= epgShowWidth
    if (!(epgBackview <= epgPastTime && epgBackview <= epgShowWidth)) {
      this._debug('EpgBox: epgBackview ungültig, setze auf 0', {
        epgBackview,
        epgPastTime,
        epgShowWidth,
      });
      this.epgBackview = 0;
    }
  }

  firstUpdated() {
    super.firstUpdated();

    // Initialisiere die Sortierung für alle vorhandenen Kanäle
    if (this._channels.size > 0 && !this._channelOrderInitialized) {
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
        height: var(--epg-row-height);
        box-sizing: border-box;
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
        /* Höhenklassen werden über epg-row-height angewendet */
        height: calc(
          var(--epg-row-height) + var(--has-time) + var(--has-duration) + var(--has-description) +
            var(--has-shorttext)
        );
        box-sizing: border-box;
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
    if (!this._channels.size) {
      return this._renderLoading();
    }

    // Berechne Scale für die Darstellung
    this.scale = this._calculateScale();

    // Verwende gruppierte Kanäle wenn showChannelGroups aktiviert ist
    let channelsToRender = [];
    if (this.showChannelGroups && this._sortedChannels.length > 0) {
      // Verwende die gruppierte Struktur
      this._sortedChannels.forEach(group => {
        group.patterns.forEach(pattern => {
          channelsToRender.push(...pattern.channels);
        });
      });
    } else {
      // Verwende alle verfügbaren Kanäle direkt
      channelsToRender = Array.from(this._channels.values());
    }

    return html`
      <div class="channelBox">
        ${this.showChannelGroups && this._sortedChannels.length > 0
          ? this._renderGroupedChannels()
          : this._renderSimpleChannels(channelsToRender)}
      </div>
      <div class="programBox">
        ${this.showChannelGroups && this._sortedChannels.length > 0
          ? this._renderGroupedPrograms()
          : this._renderSimplePrograms(channelsToRender)}
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
    // startTime.setMinutes(0, 0, 0);
    // endTime.setMinutes(0, 0, 0);

    // Generiere Zeitslots in 30-Minuten-Intervallen
    const currentSlot = new Date(startTime);
    while (currentSlot <= endTime) {
      slots.push(new Date(currentSlot));
      currentSlot.setMinutes(currentSlot.getMinutes() + 30);
    }

    return slots;
  }

  _isCurrentTimeSlot(slot, currentTime) {
    return slot.getHours() === currentTime.getHours();
  }

  _getProgramsForChannel(channel, timeSlots) {
    this._debug('EpgBox: _getProgramsForChannel gestartet', {
      kanal: channel.name,
      anzahlProgrammeVorher: channel.programs?.length || 0,
      pastTime: this.epgPastTime || 30,
      futureTime: this.epgFutureTime || 120,
    });

    if (!channel.programs) {
      this._debug('EpgBox: Keine Programme für Kanal', { kanal: channel.name });
      return [];
    }

    if (!Array.isArray(channel.programs) || channel.programs.length === 0) {
      this._debug('EpgBox: Leeres Programm-Array für Kanal', { kanal: channel.name });
      return [];
    }

    // Verwende die konfigurierten Zeitparameter für die Filterung
    const pastTime = this.epgPastTime || 30; // Minuten in die Vergangenheit
    const futureTime = this.epgFutureTime || 120; // Minuten in die Zukunft

    const now = new Date();
    const startTime = new Date(now.getTime() - pastTime * 60 * 1000);
    const endTime = new Date(now.getTime() + futureTime * 60 * 1000);

    this._debug('EpgBox: Zeitfenster für Filterung', {
      kanal: channel.name,
      now: now.toISOString(),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      pastTime,
      futureTime,
    });

    const filteredPrograms = channel.programs.filter(program => {
      // Stelle sicher, dass die Programme gültige Zeitstempel haben
      if (!program.start || !(program.end || program.stop)) {
        this._debug('EpgBox: Programm ohne gültige Zeitstempel verworfen', {
          kanal: channel.name,
          program: {
            title: program.title,
            start: program.start,
            end: program.end,
            stop: program.stop,
          },
        });
        return false;
      }

      // Konvertiere Unix-Timestamps zu Date-Objekten
      const programStart = new Date(program.start * 1000);
      const programEnd = new Date((program.end || program.stop) * 1000);

      // Zeige Programme an, die sich mit dem Zeitfenster überschneiden
      const overlaps = programStart < endTime && programEnd > startTime;

      if (!overlaps) {
        this._debug('EpgBox: Programm außerhalb Zeitfenster verworfen', {
          kanal: channel.name,
          program: {
            title: program.title,
            start: programStart.toISOString(),
            end: programEnd.toISOString(),
            overlaps,
          },
        });
      }

      return overlaps;
    });

    this._debug('EpgBox: Filterung abgeschlossen', {
      kanal: channel.name,
      anzahlVorher: channel.programs.length,
      anzahlNachher: filteredPrograms.length,
      gefilterteProgramme: filteredPrograms.map(p => ({
        title: p.title,
        start: new Date(p.start * 1000).toISOString(),
        end: new Date((p.end || p.stop) * 1000).toISOString(),
      })),
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

      this._debug('EpgBox: Zeitparameter aktualisiert', {
        kanal: channel.name,
        minStart: new Date(minStart * 1000).toISOString(),
        maxEnd: new Date(maxEnd * 1000).toISOString(),
        channelsParameters: {
          minTime: new Date(this._channelsParameters.minTime * 1000).toISOString(),
          maxTime: new Date(this._channelsParameters.maxTime * 1000).toISOString(),
        },
      });
    }

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
    this._debug('EPG-Daten empfangen (addEpgData)', {
      kanal: data?.channel?.name,
      kanalId: data?.channel?.id,
      anzahlProgramme: data?.programs?.length,
      programme: data?.programs?.map(p => ({
        title: p.title,
        start: p.start,
        end: p.end || p.stop,
        duration: p.duration,
      })),
    });

    if (data?.channel?.id) {
      const channel = this._channels.get(data.channel.id);
      if (channel) {
        this._debug('EpgBox: Aktualisiere Programme für bestehenden Kanal', {
          kanal: channel.name,
          alteAnzahl: channel.programs.length,
          neueAnzahl: data.programs.length,
        });
        channel.programs = data.programs || [];
        this._channels.set(data.channel.id, channel);
        this.requestUpdate();
      } else {
        this._debug('EpgBox: Kanal nicht gefunden in addEpgData', {
          kanalId: data.channel.id,
          verfügbareKanäle: Array.from(this._channels.keys()),
        });
      }
    } else {
      this._debug('EpgBox: Ungültige EPG-Daten in addEpgData', {
        hatKanal: !!data?.channel,
        hatKanalId: !!data?.channel?.id,
        data: data,
      });
    }
  }

  addTeilEpg(teilEpg) {
    this._debug('EpgBox: Teil-EPG empfangen', {
      kanal: teilEpg?.channel?.name,
      kanalId: teilEpg?.channel?.id,
      anzahlProgramme: teilEpg?.programs?.length,
      isFirstLoad: this.isFirstLoad,
      isChannelUpdate: this.isChannelUpdate,
      programme: teilEpg?.programs?.map(p => ({
        title: p.title,
        start: p.start,
        end: p.end || p.stop,
        duration: p.duration,
      })),
    });

    if (teilEpg?.channel?.id && teilEpg?.programs) {
      // Erhöhe isChannelUpdate Counter für eingehendes Teil-EPG
      this.isChannelUpdate++;
      this._debug('EpgBox: isChannelUpdate erhöht', {
        neuerWert: this.isChannelUpdate,
        kanal: teilEpg.channel.name,
      });

      // Wenn isFirstLoad < 2 dann isFirstLoad = 1 (erster Teil-EPG)
      if (this.isFirstLoad < 2) {
        this.isFirstLoad = 1;
        this._debug('EpgBox: isFirstLoad auf 1 gesetzt (erster Teil-EPG)', {
          alterWert: 0,
          neuerWert: this.isFirstLoad,
          kanal: teilEpg.channel.name,
        });
      }

      // Speichere das Teil-EPG direkt
      this._channels.set(teilEpg.channel.id, {
        ...teilEpg.channel,
        programs: teilEpg.programs,
      });

      // Initialisiere die Sortierungsstruktur beim ersten Kanal
      if (!this._channelOrderInitialized) {
        this._initializeChannelOrder();
      }

      // Sortiere den neuen Kanal in die Struktur ein
      this._sortChannelIntoStructure(teilEpg.channel);

      this._debug('EpgBox: Kanal erfolgreich gespeichert', {
        kanal: teilEpg.channel.name,
        anzahlProgramme: teilEpg.programs.length,
        gesamtKanale: this._channels.size,
        isChannelUpdate: this.isChannelUpdate,
        sortedChannels: this._sortedChannels.map(g => ({
          name: g.name,
          patterns: g.patterns.map(p => ({
            pattern: p.pattern,
            anzahlKanäle: p.channels.length,
            kanalNamen: p.channels.map(c => c.name),
          })),
        })),
      });

      this.requestUpdate();
    } else {
      this._debug('EpgBox: Ungültiges Teil-EPG - Daten werden verworfen', {
        hatKanal: !!teilEpg?.channel,
        hatKanalId: !!teilEpg?.channel?.id,
        hatProgramme: !!teilEpg?.programs,
        teilEpg: teilEpg,
      });
    }
  }

  // Neue Methode: Initialisiert die Sortierungsstruktur basierend auf channelOrder
  _initializeChannelOrder() {
    // Parse YAML-String zu Array, falls channelOrder ein String ist
    let parsedChannelOrder = this.channelOrder;
    if (typeof this.channelOrder === 'string' && this.channelOrder.trim()) {
      try {
        // Einfacher YAML-Parser für unsere spezifische Struktur
        parsedChannelOrder = this._parseYamlString(this.channelOrder);
      } catch (error) {
        parsedChannelOrder = [];
      }
    }

    if (
      !parsedChannelOrder ||
      !Array.isArray(parsedChannelOrder) ||
      parsedChannelOrder.length === 0
    ) {
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
  }

  // Neue Methode: Parst YAML-String zu Array
  _parseYamlString(yamlString) {
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
      }
      // channels: Zeile
      else if (line === 'channels:' && currentGroup) {
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
          }
          j++;
        }
        i = j - 1; // Überspringe die verarbeiteten Zeilen
      }
    }

    return result;
  }

  // Neue Methode: Sortiert einen Kanal in die Struktur ein
  _sortChannelIntoStructure(channel) {
    // Prüfe, ob der Kanal bereits in einem Pattern ist
    for (const group of this._sortedChannels) {
      for (const patternConfig of group.patterns) {
        if (patternConfig.channels.some(c => c.id === channel.id)) {
          return;
        }
      }
    }

    // Suche nach passender Gruppe und Pattern
    for (const group of this._sortedChannels) {
      for (const patternConfig of group.patterns) {
        try {
          const regex = new RegExp(patternConfig.pattern, 'i');
          const match = regex.test(channel.name);
          if (match) {
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
            }

            return;
          }
        } catch (error) {
          // Ignoriere ungültige Regex-Patterns
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
      }
    }
  }

  // Neue Methode: Aktualisiert die Sortierung für alle vorhandenen Kanäle
  _updateAllChannelSorting() {
    // Leere alle Pattern-Kanäle
    this._sortedChannels.forEach(group => {
      group.patterns.forEach(pattern => {
        pattern.channels = [];
      });
    });

    // Sortiere alle Kanäle neu ein
    Array.from(this._channels.values()).forEach(channel => {
      this._sortChannelIntoStructure(channel);
    });

    // Sortiere alle Pattern-Kanäle alphanumerisch
    this._sortAllPatternChannels();
  }

  // Neue Hilfsmethode: Sortiert alle Kanäle in allen Patterns alphanumerisch
  _sortAllPatternChannels() {
    this._sortedChannels.forEach(group => {
      group.patterns.forEach(pattern => {
        if (pattern.channels.length > 1) {
          pattern.channels.sort((a, b) => a.name.localeCompare(b.name, 'de', { numeric: true }));
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

        // Recalculate scale with new container width
        this.scale = this._calculateScale();
        this.requestUpdate();
      }
    }
  }

  _renderSimpleChannels(channels) {
    return channels.map(channel => {
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
    });
  }

  _renderGroupedChannels() {
    return this._sortedChannels.map(group => {
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
      `;
    });
  }

  _renderGroupedPrograms() {
    this._debug('EpgBox: _renderGroupedPrograms gestartet', {
      anzahlGruppen: this._sortedChannels.length,
      gruppen: this._sortedChannels.map(g => ({
        name: g.name,
        anzahlKanäle: g.patterns.flatMap(p => p.channels).length,
      })),
    });

    let rowIndex = 0;
    return this._sortedChannels.map(group => {
      // Sammle alle Kanäle aus allen Patterns der Gruppe
      const groupChannels = group.patterns.flatMap(pattern => pattern.channels);

      if (groupChannels.length === 0) {
        return html``; // Leere Gruppe nicht anzeigen
      }

      this._debug('EpgBox: Rendere gruppierte Programme für Gruppe', {
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
          const fullChannel = this._channels.get(channel.id);
          const programs = fullChannel
            ? this._getProgramsForChannel(fullChannel, this._generateTimeSlots())
            : [];
          const currentRowIndex = rowIndex++;

          this._debug('EpgBox: Rendere gruppierte Programme für Kanal', {
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
                          .rowIndex=${currentRowIndex}
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
                          .rowIndex=${currentRowIndex}
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
      `;
    });
  }

  _renderSimplePrograms(channels) {
    this._debug('EpgBox: _renderSimplePrograms gestartet', {
      anzahlKanäle: channels.length,
      kanalNamen: channels.map(c => c.name),
    });

    return channels.map((channel, rowIndex) => {
      // Hole den vollständigen Kanal mit Programmen aus der _channels Map
      const fullChannel = this._channels.get(channel.id);
      const programs = fullChannel
        ? this._getProgramsForChannel(fullChannel, this._generateTimeSlots())
        : [];

      this._debug('EpgBox: Rendere einfache Programme für Kanal', {
        kanal: channel.name,
        kanalId: channel.id,
        hatVollständigenKanal: !!fullChannel,
        rowIndex,
        anzahlProgramme: programs.length,
        programme: programs.map(p => ({
          title: p.title,
          start: new Date(p.start * 1000).toISOString(),
          end: new Date((p.end || p.stop) * 1000).toISOString(),
        })),
      });

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
    });
  }
}

customElements.define('epg-box', EpgBox);
