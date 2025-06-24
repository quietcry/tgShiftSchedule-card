/**
 * EPG Channel Manager
 * Verwaltet alle kanal-bezogenen Funktionen für die EPG-Box
 */
export class EpgChannelManager {
  constructor(epgBox) {
    this.epgBox = epgBox;
  }

  /**
   * Initialisiert die Kanal-Reihenfolge basierend auf channelOrder
   */
  initializeChannelOrder() {
    if (this.epgBox._channelOrderInitialized) {
      return;
    }

    // Direkt auf die Property der epgBox zugreifen, um Timing-Probleme zu umgehen
    const channelOrder = this.epgBox.channelOrder;

    this.epgBox._debug('EpgChannelManager: Initialisiere Kanal-Reihenfolge', {
      channelOrder: channelOrder,
    });

    // Leere die Sortierungsstruktur
    this.epgBox._sortedChannels = [];

    if (channelOrder && Array.isArray(channelOrder)) {
      // Verarbeite jede Kanaldefinition
      channelOrder.forEach(channelDef => {
        if (typeof channelDef === 'string') {
          // Einfache String-Definition
          this.epgBox._sortedChannels.push({
            name: channelDef,
            patterns: [
              {
                pattern: channelDef,
                channels: [],
              },
            ],
          });
        } else if (channelDef && typeof channelDef === 'object') {
          // Objekt-Definition mit name und style
          const group = {
            name: channelDef.name || 'Unbekannt',
            patterns: [],
          };

          if (channelDef.style) {
            // Style-basierte Definition
            group.patterns.push({
              pattern: channelDef.style,
              channels: [],
            });
          } else if (channelDef.channels && Array.isArray(channelDef.channels)) {
            // Explizite Kanal-Liste
            channelDef.channels.forEach(channelName => {
              group.patterns.push({
                pattern: channelName,
                channels: [],
              });
            });
          }

          if (group.patterns.length > 0) {
            this.epgBox._sortedChannels.push(group);
          }
        }
      });
    } else {
      // Fallback: Erstelle eine Standard-Gruppe für alle Kanäle
      this.epgBox._sortedChannels.push({
        name: 'Alle Kanäle',
        patterns: [
          {
            pattern: '.*',
            channels: [],
          },
        ],
      });
    }

    this.epgBox._channelOrderInitialized = true;
    this.epgBox._debug('EpgChannelManager: Kanal-Reihenfolge initialisiert', {
      sortedChannels: this.epgBox._sortedChannels,
    });
  }

  /**
   * Parst einen YAML-String für Kanal-Definitionen
   */
  parseYamlString(yamlString) {
    if (!yamlString || typeof yamlString !== 'string') {
      return [];
    }

    try {
      // Einfache YAML-Parsing für Kanal-Definitionen
      const lines = yamlString.split('\n');
      const result = [];
      let currentGroup = null;

      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) {
          return; // Leere Zeilen und Kommentare überspringen
        }

        if (trimmedLine.startsWith('-')) {
          // Kanal-Definition
          const channelName = trimmedLine.substring(1).trim();
          if (channelName) {
            if (!currentGroup) {
              // Erstelle Standard-Gruppe
              currentGroup = {
                name: 'Kanäle',
                patterns: [],
              };
              result.push(currentGroup);
            }
            currentGroup.patterns.push({
              pattern: channelName,
              channels: [],
            });
          }
        } else if (trimmedLine.endsWith(':')) {
          // Gruppen-Definition
          const groupName = trimmedLine.slice(0, -1).trim();
          currentGroup = {
            name: groupName,
            patterns: [],
          };
          result.push(currentGroup);
        }
      });

      return result;
    } catch (error) {
      this.epgBox._debug('EpgChannelManager: Fehler beim Parsen des YAML-Strings', {
        error: error.message,
        yamlString,
      });
      return [];
    }
  }

  /**
   * Sortiert einen Kanal in die Struktur ein
   */
  sortChannelIntoStructure(channel) {
    if (!this.epgBox._channelOrderInitialized) {
      this.initializeChannelOrder();
    }

    this.epgBox._debug('EpgChannelManager: Sortiere Kanal in Struktur ein', {
      kanal: channel.name,
      kanalId: channel.id,
      sortedChannels: this.epgBox._sortedChannels.length,
    });

    // Gehe durch alle Gruppen und Patterns
    this.epgBox._sortedChannels.forEach(group => {
      group.patterns.forEach(pattern => {
        // Prüfe, ob der Kanal zum Pattern passt
        if (this.channelMatchesPattern(channel, pattern.pattern)) {
          // Prüfe, ob der Kanal bereits in diesem Pattern ist
          const existingChannelIndex = pattern.channels.findIndex(c => c.id === channel.id);
          if (existingChannelIndex >= 0) {
            // Aktualisiere bestehenden Kanal mit Programmen
            pattern.channels[existingChannelIndex] = {
              ...pattern.channels[existingChannelIndex],
              ...channel,
              programs: channel.programs || pattern.channels[existingChannelIndex].programs || [],
            };
          } else {
            // Füge neuen Kanal mit Programmen hinzu
            pattern.channels.push({
              id: channel.id,
              name: channel.name,
              programs: channel.programs || [],
            });
          }

          this.epgBox._debug('EpgChannelManager: Kanal zu Pattern hinzugefügt/aktualisiert', {
            kanal: channel.name,
            gruppe: group.name,
            pattern: pattern.pattern,
            anzahlProgramme: channel.programs ? channel.programs.length : 0,
          });
        }
      });
    });

    // Sortiere alle Pattern-Kanäle alphanumerisch
    this.sortAllPatternChannels();
  }

  /**
   * Prüft, ob ein Kanal zu einem Pattern passt
   */
  channelMatchesPattern(channel, pattern) {
    if (!pattern || pattern === '.*') {
      return true; // Alle Kanäle
    }

    try {
      const regex = new RegExp(pattern, 'i');
      return regex.test(channel.name);
    } catch (error) {
      // Fallback: Exakte Übereinstimmung
      return channel.name.toLowerCase().includes(pattern.toLowerCase());
    }
  }

  /**
   * Sortiert alle Kanäle in allen Patterns alphanumerisch
   */
  sortAllPatternChannels() {
    this.epgBox._sortedChannels.forEach(group => {
      group.patterns.forEach(pattern => {
        if (pattern.channels.length > 1) {
          pattern.channels.sort((a, b) => a.name.localeCompare(b.name, 'de', { numeric: true }));
        }
      });
    });
  }
}
