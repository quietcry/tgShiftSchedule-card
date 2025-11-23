import { CardName, DebugMode } from '../card-config.js';
import { TgCardHelper } from './tg-card-helper.js';

export class DataProvider {
  static className = 'DataProvider';
  constructor() {
    this._hass = null;
    this.tgCardHelper = new TgCardHelper(CardName, DebugMode);

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
    this._debug('_callService(): _callService wird aufgerufen mit:', {
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
      this._debug('_callService(): Service-Daten:', serviceData);

      const message = {
        type: 'call_service',
        domain: 'tgvdr',
        service: 'get_epg_data',
        service_data: serviceData,
        return_response: true,
      };
      this._debug('_callService(): Service-Nachricht:', message);

      const response = await this._hass.connection.sendMessagePromise(message);
      this._debug('_callService(): Service-Antwort erhalten:', response);

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
      const blacklist = config.blacklist
        ? config.blacklist
            .split(/,|\n/)
            .map(s => s.trim())
            .filter(Boolean)
        : [];
      const whitelist = config.whitelist
        ? config.whitelist
            .split(/,|\n/)
            .map(s => s.trim())
            .filter(Boolean)
        : [];

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
    this._debug('fetchChannelEpg(): Hole EPG-Daten für Kanal', channelId);
    const channelIdStr = String(channelId);
    this._debug('fetchChannelEpg(): Konvertierte channel_id:', channelIdStr);

    // Erstelle Service-Parameter ohne time_window und date
    const serviceParams = {
      channel_id: channelIdStr,
    };

    const response = await this._callService(entity, serviceParams);
    this._debug('fetchChannelEpg(): response erhalten', {
      response: response,
      isArray: Array.isArray(response),
    });

    // Verarbeite die EPG-Daten
    if (response && typeof response === 'object' && response.epg) {
      this._debug('EPG-Daten gefunden:', response);
      return response;
    }

    this._debug('Keine EPG-Daten gefunden oder ungültiges Format');
    return null;
  }

  async fetchEpgData(entity, timeWindow, date, config, onEpgData) {
    this._debug('fetchEpgData(): fetchEpgData gestartet', {
      entity,
      timeWindow,
      date,
      hasCallback: typeof onEpgData === 'function',
    });

    try {
      const channelList = await this.fetchChannelList(entity, config);
      this._debug('fetchEpgData(): Kanalliste empfangen', {
        anzahlKanäle: channelList.length,
        kanäle: channelList.map(c => c.name),
      });

      const epgData = [];
      for (const channel of channelList) {
        try {
          this._debug('fetchEpgData(): Hole EPG-Daten für Kanal', {
            kanal: channel.channeldata?.name || channel.name,
            id: channel.id,
          });

          const response = await this.fetchChannelEpg(entity, channel.id, timeWindow, date);
          if (!response) {
            this._debug(
              'fetchEpgData(): für Kanal',
              channel.channeldata?.name || channel.name,
              'Keine EPG-Daten gefunden'
            );
            continue;
          }

          this._debug('fetchEpgData(): EPG-Daten empfangen', {
            kanal: response.channeldata.name,
            anzahlProgramme:
              response.epg && typeof response.epg === 'object'
                ? Object.keys(response.epg).length
                : 0,
            programme:
              response.epg && typeof response.epg === 'object'
                ? Object.values(response.epg).map(p => p.title || 'Unbekannt')
                : [],
          });

          // Übergebe die EPG-Daten über den Callback
          if (typeof onEpgData === 'function') {
            this._debug('fetchEpgData(): Übergebe EPG-Daten an Callback', {
              kanal: response.channeldata.name,
              anzahlProgramme:
                response.epg && typeof response.epg === 'object'
                  ? Object.keys(response.epg).length
                  : 0,
            });
            onEpgData(response);
          }

          // Sammle die Daten auch für die Rückgabe
          epgData.push({
            response,
          });
        } catch (error) {
          this._debug('fetchEpgData(): Fehler beim Abrufen der EPG-Daten für Kanal', {
            kanal: channel.channeldata?.name || channel.name,
            fehler: error.message,
          });
        }
      }

      this._debug('fetchEpgData(): fetchEpgData abgeschlossen', {
        anzahlKanäle: epgData.length,
        gesamtProgramme: epgData.reduce(
          (sum, c) =>
            sum +
            (c.response.epg && typeof c.response.epg === 'object'
              ? Object.keys(c.response.epg).length
              : 0),
          0
        ),
      });
      return epgData;
    } catch (error) {
      this._debug('fetchEpgData(): Fehler in fetchEpgData', {
        fehler: error.message,
      });
      throw error;
    }
  }

  /**
   * Holt Meta-Daten für Record-Synchronisation von der Integration
   * @param {string} entity - Entity-Name der Integration
   * @returns {Promise<Object>} Meta-Daten mit Record-Informationen
   */
  async fetchMetaData(entity) {
    this._debug('fetchMetaData(): Starte Meta-Datenabruf', {
      entity: entity,
      hasHass: !!this.hass,
    });

    if (!this.hass || !entity) {
      throw new Error('HASS oder Entity nicht verfügbar für Meta-Datenabruf');
    }

    try {
      // Rufe Meta-Daten von der Integration ab
      const response = await this.hass.callService('tg_epg', 'get_meta_data', {
        entity_id: entity,
      });

      this._debug('fetchMetaData(): Meta-Daten erfolgreich abgerufen', {
        entity: entity,
        responseKeys: response ? Object.keys(response) : [],
        hasRecords: !!response?.records,
        recordCount: response?.records ? Object.keys(response.records).length : 0,
      });

      return response || {};
    } catch (error) {
      this._debug('fetchMetaData(): Fehler beim Meta-Datenabruf', {
        entity: entity,
        fehler: error.message,
      });
      throw error;
    }
  }
}
