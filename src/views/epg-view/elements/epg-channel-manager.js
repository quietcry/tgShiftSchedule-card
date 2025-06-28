/**
 * EPG Channel Manager
 * Verwaltet alle kanal-bezogenen Funktionen für die EPG-Box
 */
import yaml from 'js-yaml';

export class EpgChannelManager {
  constructor(epgBox) {
    this.epgBox = epgBox;
  }

  /**
   * Hilfsfunktionen für die neue Struktur
   */
  isGroup(item) {
    return item && item.type === 'group' && typeof item.pattern === 'string';
  }
  isPattern(item) {
    return item && item.type === 'channel' && typeof item.pattern === 'string';
  }

  /**
   * Initialisiert die Kanal-Reihenfolge basierend auf channelOrder
   */
  initializeChannelOrder() {
    if (this.epgBox._channelOrderInitialized) {
      return;
    }

    const channelOrder = this.epgBox.channelOrder;
    this.epgBox._debug('EpgChannelManager: Initialisiere Kanal-Reihenfolge', {
      channelOrder: channelOrder,
    });

    this.epgBox._sortedChannels = [];
    const fallback = {
      type: 'unvisiblegroup',
      name: 'Alle Kanäle',
      pattern: null,
      channels: [],
    };
    if (channelOrder && typeof channelOrder === 'string') {
      const parsed = this.parseYamlString(channelOrder);
      if (parsed && parsed.length > 0) {
        this.epgBox._sortedChannels = parsed;
      }
    }
    this.epgBox._sortedChannels.push(fallback);

    this.epgBox._channelOrderInitialized = true;
    this.epgBox._debug(
      'EpgChannelManager: Kanal-Reihenfolge Grundstruktur extrahiert',
      this.epgBox._sortedChannels
    );
  }

  /**
   * Parst einen YAML-String für Kanal-Definitionen
   */
  parseYamlString(yamlString) {
    if (!yamlString || typeof yamlString !== 'string') {
      return [];
    }

    try {
      this.epgBox._debug('EpgChannelManager: Parse YAML-String', {
        yamlString: yamlString,
        length: yamlString.length,
      });

      let parsed;
      try {
        parsed = yaml.load(yamlString);
      } catch (e) {
        this.epgBox._debug('EpgChannelManager: Fehler beim YAML-Parsing', { error: e.message });
        return [];
      }

      if (!Array.isArray(parsed)) {
        this.epgBox._debug('EpgChannelManager: YAML ist kein Array', { parsed });
        return [];
      }

      const result = [];
      parsed.forEach((item, idx) => {
        if (item.type === 'group') {
          const group = {
            type: 'group',
            name: item.name || `Gruppe ${idx + 1}`,
            patterns: [],
          };
          if (Array.isArray(item.patterns)) {
            group.patterns = item.patterns.map(pat => {
              const { type, ...rest } = pat;
              return {
                ...rest,
                channels: [],
              };
            });
          }
          result.push(group);
        } else if (item.type === 'channel') {
          const pattern = {
            type: 'channel',
            pattern: item.pattern,
            channels: [],
          };
          Object.keys(item).forEach(key => {
            if (!['type', 'pattern', 'channels'].includes(key)) {
              pattern[key] = item[key];
            }
          });
          result.push(pattern);
        } else if (item.type === 'unvisiblegroup') {
          const pattern = {
            type: 'unvisiblegroup',
            channels: [],
            name: item.name || `Gruppe ${idx + 1}`,
          };
          result.push(pattern);
        }
      });

      this.epgBox._debug('EpgChannelManager: YAML-Parsing abgeschlossen', result);

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
    let matched = false;
    for (const item of this.epgBox._sortedChannels) {
      if (item.type === 'group' && Array.isArray(item.patterns)) {
        for (const patternObj of item.patterns) {
          if (this.channelMatchesPattern(channel, patternObj.pattern)) {
            patternObj.channels = patternObj.channels || [];
            if (!patternObj.channels.find(c => c.id === channel.id)) {
              patternObj.channels.push(channel);
              // Debug-Ausgabe: Was wird in die Gruppe einsortiert?
              console.log('DEBUG: Kanal in Gruppe einsortiert', {
                gruppe: item.name,
                pattern: patternObj.pattern,
                kanal: channel,
                programme: channel.programs,
              });
            }
            matched = true;
            break;
          }
        }
        if (matched) break;
      } else if (item.type === 'channel' && item.pattern) {
        if (this.channelMatchesPattern(channel, item.pattern)) {
          item.channels = item.channels || [];
          if (!item.channels.find(c => c.id === channel.id)) {
            item.channels.push(channel);
          }
          matched = true;
          break;
        }
      }
    }
    // Falls kein Match: Fallback
    if (!matched) {
      const fallback = this.epgBox._sortedChannels.find(i => i.type === 'unvisiblegroup');
      if (fallback) {
        fallback.channels = fallback.channels || [];
        if (!fallback.channels.find(c => c.id === channel.id)) {
          fallback.channels.push(channel);
        }
      }
    }
    // Debug-Ausgabe der aktuellen Struktur nach jedem Einsortieren
    this.epgBox._debug(
      'EpgChannelManager: _sortedChannels nach Einsortierung',
      this.epgBox._sortedChannels
    );
  }

  /**
   * Prüft, ob ein Kanal zu einem Pattern passt
   */
  channelMatchesPattern(channel, pattern) {
    if (!pattern || pattern === '.*') {
      return true; // Alle Kanäle
    }

    const channelName = channel.channeldata?.name || channel.name;

    try {
      const regex = new RegExp(pattern, 'i');
      return regex.test(channelName);
    } catch (error) {
      // Fallback: Exakte Übereinstimmung
      return channelName.toLowerCase().includes(pattern.toLowerCase());
    }
  }

  /**
   * Sortiert alle Kanäle in allen Patterns alphanumerisch
   */
  sortAllPatternChannels() {
    this.epgBox._sortedChannels.forEach(item => {
      if (
        (this.isGroup(item) || this.isPattern(item)) &&
        item.channels &&
        item.channels.length > 1
      ) {
        item.channels.sort((a, b) => {
          const nameA = a.channeldata?.name || a.name;
          const nameB = b.channeldata?.name || b.name;
          return nameA.localeCompare(nameB, 'de', { numeric: true });
        });
      }
    });

    // Debug-Log
    this.epgBox._debug(
      'EpgChannelManager: Finale _sortedChannels Struktur nach Einsortierung',
      this.epgBox._sortedChannels
    );
  }
}
