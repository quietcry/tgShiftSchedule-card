export class DataProvider {
  static cardName = 'TG EPG Card';
  static debugMode = true;

  constructor() {
    this._hass = null;
    if (this.constructor.debugMode)
      console.debug(`[${this.constructor.cardName}] DataProvider-Modul wird geladen`);
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

  _debug(message, ...args) {
    if (this.constructor.debugMode) {
      console.debug(`[${this.constructor.cardName}] [DataProvider] ${message}`, ...args);
    }
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

      // Extrahiere epg_data aus der Antwort
      if (response && response.response && response.response.epg_data) {
        return response.response.epg_data;
      }
      return [];
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
      this._debug('EPG-Daten:', response);
      return response;
    }
    return [];
  }

  async fetchEpgData(entity, timeWindow, date, config, onEpgData) {
    this._debug('DataProvider: fetchEpgData gestartet', {
      entity,
      timeWindow,
      date,
      hasCallback: typeof onEpgData === 'function',
    });

    try {
      const channelList = await this.fetchChannelList(entity, config);
      this._debug('DataProvider: Kanalliste empfangen', {
        anzahlKanäle: channelList.length,
        kanäle: channelList.map(c => c.name),
      });

      const epgData = [];
      for (const channel of channelList) {
        try {
          this._debug('DataProvider: Hole EPG-Daten für Kanal', {
            kanal: channel.name,
            id: channel.id,
          });

          const programs = await this.fetchChannelEpg(entity, channel.id, timeWindow, date);
          this._debug('DataProvider: EPG-Daten empfangen', {
            kanal: channel.name,
            anzahlProgramme: programs.length,
            programme: programs.map(p => p.title),
          });

          // Übergebe die EPG-Daten über den Callback
          if (typeof onEpgData === 'function') {
            this._debug('DataProvider: Übergebe EPG-Daten an Callback', {
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
          this._debug('DataProvider: Fehler beim Abrufen der EPG-Daten für Kanal', {
            kanal: channel.name,
            fehler: error.message,
          });
        }
      }

      this._debug('DataProvider: fetchEpgData abgeschlossen', {
        anzahlKanäle: epgData.length,
        gesamtProgramme: epgData.reduce((sum, c) => sum + c.programs.length, 0),
      });
      return epgData;
    } catch (error) {
      this._debug('DataProvider: Fehler in fetchEpgData', {
        fehler: error.message,
      });
      throw error;
    }
  }
}
