import { TgCardHelper } from './tg-card-helper.js';
import { CardName, DebugMode } from '../card-config.js';

export class DataProvider {
  static className = 'DataProvider';

  constructor() {
    this._hass = null;
    this.tgCardHelper = new TgCardHelper(CardName, DebugMode);
    this._debug('DataProvider initialisiert');
  }

  set hass(value) {
    this._debug(
      'DataProvider: hass wird gesetzt:',
      value ? 'hass vorhanden' : 'hass ist null',
      value
    );
    if (this._hass !== value) {
      this._hass = value;
      this._debug('DataProvider: hass aktualisiert:', this._hass);
    }
  }

  get hass() {
    this._debug(
      'DataProvider: hass wird abgerufen:',
      this._hass ? 'hass vorhanden' : 'hass ist null',
      this._hass
    );
    return this._hass;
  }

  _debug(message, data = null) {
    // Versuche verschiedene Methoden, um den echten Klassennamen zu bekommen
    let className = 'Unknown';

    // Methode 1: Statischer Klassennamen (falls definiert)
    if (this.constructor.className) {
      className = this.constructor.className;
    }
    // Methode 2: Tag-Name des Custom Elements
    else if (this.tagName) {
      className = this.tagName.toLowerCase().replace(/[^a-z0-9]/g, '');
    }
    // Methode 3: Constructor name (kann minifiziert sein)
    else if (this.constructor.name && this.constructor.name.length > 2) {
      className = this.constructor.name;
    }
    // Methode 4: Fallback auf cardName
    else if (this.cardName) {
      className = this.cardName;
    }

    this.tgCardHelper._debug(className, message, data);
  }

  async _callService(entity, params = {}) {
    this._debug('_callService wird aufgerufen mit:', {
      entity,
      params,
      hass: this._hass ? 'vorhanden' : 'nicht vorhanden',
      connection: this._hass?.connection ? 'vorhanden' : 'nicht vorhanden',
    });

    if (!this._hass) {
      this._debug('Fehler - hass ist nicht initialisiert');
      throw new Error('hass ist nicht initialisiert');
    }

    if (!this._hass.connection) {
      this._debug('Fehler - hass.connection ist nicht initialisiert');
      throw new Error('hass.connection ist nicht initialisiert');
    }

    try {
      const serviceData = {
        entity_id: entity,
        ...params,
      };
      this._debug('Service-Daten:', serviceData);

      const message = {
        type: 'call_service',
        domain: 'tgvdr',
        service: 'get_epg_data',
        service_data: serviceData,
        return_response: true,
      };
      this._debug('Service-Nachricht:', message);

      const response = await this._hass.connection.sendMessagePromise(message);
      this._debug('Service-Antwort erhalten:', response);

      // Debug: Zeige die vollständige Antwort-Struktur
      this._debug('Service-Antwort Details:', {
        responseType: typeof response,
        hasResponse: !!response,
        responseKeys: response ? Object.keys(response) : [],
        responseResponseType: typeof response?.response,
        responseResponseKeys: response?.response ? Object.keys(response.response) : [],
        responseResponseValue: response?.response,
      });

      // Extrahiere EPG-Daten aus der Antwort
      let epgData = [];

      if (response && response.response) {
        this._debug('Response-Struktur analysieren:', {
          responseType: typeof response.response,
          responseKeys: Object.keys(response.response),
          hasEpgData: !!response.response.epg_data,
          epgDataType: typeof response.response.epg_data,
          epgDataKeys: response.response.epg_data ? Object.keys(response.response.epg_data) : [],
        });

        // Versuche verschiedene mögliche Strukturen
        if (Array.isArray(response.response)) {
          // Direktes Array
          epgData = response.response;
        } else if (response.response.epg_data) {
          // Neue Struktur: response.response.epg_data.epg ist ein Objekt mit Zeitstempel-Schlüsseln
          if (
            response.response.epg_data.epg &&
            typeof response.response.epg_data.epg === 'object'
          ) {
            // Konvertiere das epg-Objekt in ein Array
            const epgObject = response.response.epg_data.epg;
            epgData = Object.values(epgObject).map(program => ({
              ...program,
              // Stelle sicher, dass die Zeitstempel als Zahlen vorliegen
              start: typeof program.start === 'string' ? parseInt(program.start) : program.start,
              stop: typeof program.stop === 'string' ? parseInt(program.stop) : program.stop,
              // Füge end-Feld hinzu falls nicht vorhanden
              end: program.end || program.stop,
            }));

            this._debug('EPG-Objekt konvertiert:', {
              anzahlZeitstempel: Object.keys(epgObject).length,
              zeitstempel: Object.keys(epgObject),
              anzahlProgramme: epgData.length,
            });
          } else if (Array.isArray(response.response.epg_data)) {
            // Verschachteltes epg_data Array
            epgData = response.response.epg_data;
          }
        } else if (response.response.data && Array.isArray(response.response.data)) {
          // Verschachteltes data Array
          epgData = response.response.data;
        } else if (typeof response.response === 'string') {
          // String-Antwort - versuche JSON zu parsen
          try {
            const parsed = JSON.parse(response.response);
            epgData = Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            this._debug('Fehler beim JSON-Parsing der String-Antwort:', e);
            epgData = [];
          }
        } else {
          // Fallback: Versuche response.response als Array zu verwenden
          epgData = Array.isArray(response.response) ? response.response : [];
        }
      }

      this._debug('Extrahierte EPG-Daten:', {
        anzahlProgramme: epgData.length,
        programme: epgData.map(p => ({
          title: p.title,
          start: p.start,
          end: p.end || p.stop,
          starttime: p.starttime,
          endtime: p.endtime,
        })),
      });

      return epgData;
    } catch (error) {
      this._debug('Fehler beim Service-Aufruf:', error);
      throw error;
    }
  }

  async fetchChannelList(entity, config = {}) {
    this._debug('DataProvider: Hole Kanal-Liste');
    const response = await this._callService(entity, {
      channel_id: '?',
    });

    // Verarbeite die Kanal-Liste
    if (Array.isArray(response)) {
      this._debug('Kanal-Liste vor Filterung:', response);

      // Konvertiere YAML-Boxen in Arrays
      const blacklist = config.blacklist ? config.blacklist.split('\n').filter(Boolean) : [];
      const whitelist = config.whitelist ? config.whitelist.split('\n').filter(Boolean) : [];

      this._debug('Filter-Konfiguration:', {
        blacklist,
        whitelist,
        originalBlacklist: config.blacklist,
        originalWhitelist: config.whitelist,
      });

      // Filtere die Kanäle
      const filteredChannels = response.filter(channel => {
        const channelName = channel.name?.toLowerCase() || '';

        // Wenn eine Whitelist existiert, nur diese Kanäle zulassen
        if (whitelist.length > 0) {
          return whitelist.some(pattern => new RegExp(pattern.toLowerCase()).test(channelName));
        }

        // Wenn eine Blacklist existiert, diese Kanäle ausschließen
        if (blacklist.length > 0) {
          return !blacklist.some(pattern => new RegExp(pattern.toLowerCase()).test(channelName));
        }

        // Wenn keine Filter existieren, alle Kanäle zulassen
        return true;
      });

      this._debug('Gefilterte Kanal-Liste:', filteredChannels);
      return filteredChannels;
    }
    return [];
  }

  async fetchChannelEpg(entity, channelId, timeWindow, date) {
    this._debug('DataProvider: Hole EPG-Daten für Kanal', channelId);
    const channelIdStr = String(channelId);
    this._debug('DataProvider: Konvertierte channel_id:', channelIdStr);

    // Erstelle Service-Parameter ohne time_window und date
    const serviceParams = {
      channel_id: channelIdStr,
    };

    const response = await this._callService(entity, serviceParams);

    // Verarbeite die EPG-Daten
    if (Array.isArray(response)) {
      this._debug('EPG-Daten vor Verarbeitung:', response);

      // Stelle sicher, dass alle Programme die erforderlichen Felder haben
      const processedPrograms = response.map(program => ({
        title: program.title || program.name || 'Unbekanntes Programm',
        description: program.description || program.desc || '',
        start: program.start || program.start_time || '',
        end: program.end || program.end_time || '',
        duration: program.duration || 0,
        // Zusätzliche Felder falls vorhanden
        category: program.category || '',
        rating: program.rating || '',
        ...program, // Behalte alle anderen Felder bei
      }));

      this._debug('Verarbeitete EPG-Daten:', {
        anzahlProgramme: processedPrograms.length,
        programme: processedPrograms.map(p => ({
          title: p.title,
          start: p.start,
          end: p.end,
          duration: p.duration,
        })),
      });

      return processedPrograms;
    }

    this._debug('Keine EPG-Daten erhalten oder ungültiges Format:', response);
    return [];
  }

  async fetchEpgData(entity, timeWindow, date, config, onEpgData) {
    this._debug('fetchEpgData gestartet', {
      entity,
      timeWindow,
      date,
      hasCallback: typeof onEpgData === 'function',
    });

    try {
      const channelList = await this.fetchChannelList(entity, config);
      this._debug('Kanalliste empfangen', {
        anzahlKanäle: channelList.length,
        kanäle: channelList.map(c => c.name),
      });

      const epgData = [];
      for (const channel of channelList) {
        try {
          this._debug('Hole EPG-Daten für Kanal', {
            kanal: channel.name,
            id: channel.id,
          });

          const programs = await this.fetchChannelEpg(entity, channel.id, timeWindow, date);
          this._debug('EPG-Daten empfangen', {
            kanal: channel.name,
            anzahlProgramme: programs.length,
            programme: programs.map(p => p.title),
          });

          // Übergebe die EPG-Daten über den Callback
          if (typeof onEpgData === 'function') {
            this._debug('Übergebe EPG-Daten an Callback', {
              kanal: channel.name,
              anzahlProgramme: programs.length,
            });
            onEpgData({
              channel: channel,
              programs: programs,
            });
          }

          // Sammle die Daten auch für die Rückgabe
          epgData.push({
            channel: channel,
            programs: programs,
          });
        } catch (error) {
          this._debug('Fehler beim Abrufen der EPG-Daten für Kanal', {
            kanal: channel.name,
            fehler: error.message,
          });
        }
      }

      this._debug('fetchEpgData abgeschlossen', {
        anzahlKanäle: epgData.length,
        gesamtProgramme: epgData.reduce((sum, c) => sum + c.programs.length, 0),
      });
      return epgData;
    } catch (error) {
      this._debug('Fehler in fetchEpgData', {
        fehler: error.message,
      });
      throw error;
    }
  }
}
