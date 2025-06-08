import { DebugMode, CardName } from './card-config';

export class DataProvider {
  constructor(hass) {
    this.hass = hass;
    this._debug('initialisiert');
  }

  _debug(message, data = null) {
    if (DebugMode) {
      if (data) {
        console.debug(`[${CardName}] DataProvider ${message}`, data);
      } else {
        console.debug(`[${CardName}] DataProvider ${message}`);
      }
    }
  }

  async fetchEpgData(entity, timeWindow, date) {
    this._debug('Starte EPG-Datenabfrage', { entity, timeWindow, date });
    
    try {
      const response = await this.hass.connection.sendMessagePromise({
        type: "call_service",
        domain: "tgvdr",
        service: "get_epg_data",
        service_data: {
          entity_id: entity,
          time_window: timeWindow,
          date: date
        },
        return_response: true
      });

      this._debug('EPG-Daten empfangen', response);
      this._debug('Response Struktur:', {
        hasResponse: !!response,
        hasResponseResponse: !!response?.response,
        hasEpgData: !!response?.response?.epg_data,
        responseKeys: response ? Object.keys(response) : [],
        responseResponseKeys: response?.response ? Object.keys(response.response) : []
      });

      if (!response || !response.response?.epg_data) {
        this._debug('Keine EPG-Daten in der Antwort');
        return [];
      }

      const epgData = response.response.epg_data;
      this._debug('Verarbeitete EPG-Daten', {
        anzahlKanäle: epgData.length,
        beispielKanal: epgData[0],
        beispielSendungen: epgData[0]?.epg
      });

      return epgData;
    } catch (error) {
      this._debug('Fehler beim Abrufen der EPG-Daten', error);
      throw error;
    }
  }
} 