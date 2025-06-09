import { DebugMode, CardName } from './card-config';

if (DebugMode) console.debug(`[${CardName}] DataProvider-Modul wird geladen`);

export class DataProvider {
  constructor() {
    this._hass = null;
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
    if (DebugMode) {
      console.debug(`[${CardName}] [DataProvider] ${message}`, ...args);
    }
  }

  async _callService(entity, params = {}) {
    this._debug('_callService wird aufgerufen mit:', { entity, params, hass: this._hass });
    if (!this._hass) {
      this._debug('Fehler - hass ist nicht initialisiert');
      throw new Error('hass ist nicht initialisiert');
    }
    try {
      const response = await this._hass.connection.sendMessagePromise({
        type: 'call_service',
        domain: 'tgvdr',
        service: 'get_epg_data',
        service_data: {
          entity_id: entity,
          ...params,
        },
        return_response: true,
      });
      this._debug('Service-Antwort erhalten:', response);
      return response;
    } catch (error) {
      this._debug('Fehler beim Service-Aufruf:', error);
      throw error;
    }
  }

  async fetchChannelList(entity) {
    this._debug('DataProvider: Hole Kanal-Liste');
    return this._callService(entity, {
      channel_id: '?',
    });
  }

  async fetchChannelEpg(entity, channelId, timeWindow, date) {
    this._debug('DataProvider: Hole EPG-Daten für Kanal', channelId);
    const channelIdStr = String(channelId);
    this._debug('DataProvider: Konvertierte channel_id:', channelIdStr);
    return this._callService(entity, {
      channel_id: channelIdStr,
      time_window: timeWindow,
      date: date,
    });
  }

  async fetchEpgData(entity, timeWindow, date) {
    this._debug('DataProvider: Hole EPG-Daten');
    try {
      const channels = await this.fetchChannelList(entity);
      const epgData = [];

      for (const channel of channels) {
        const channelEpg = await this.fetchChannelEpg(entity, channel.id, timeWindow, date);
        epgData.push({
          channel: channel,
          programs: channelEpg,
        });
      }

      return epgData;
    } catch (error) {
      this._debug('Fehler beim Abrufen der EPG-Daten:', error);
      throw error;
    }
  }
}
