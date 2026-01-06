/**
 * Saver-Storage-Implementierung
 * 
 * Speichert Daten in Saver-Variablen (HACS Integration)
 * Kann später leicht entfernt werden, wenn nur Entity-Storage verwendet werden soll.
 */

import { IStorageAdapter } from './storage-interface.js';

export class SaverStorage extends IStorageAdapter {
  static isApplicable(storeMode) {
    return storeMode === 'saver';
  }

  constructor(hass, config, debug) {
    super(hass, config, debug);
    this._saverKey = config?.saver_key || 'Schichtplan';
  }

  isAvailable() {
    if (!this._hass || !this._config || !this._config.saver_key) {
      return false;
    }
    // Prüfe ob Saver-Entity existiert
    const saverEntity = this._hass.states?.['saver.saver'];
    return !!saverEntity;
  }

  /**
   * Liest eine Saver-Variable
   * @private
   */
  _readSaverVariable(key) {
    if (!this._hass || !this._hass.states) {
      return null;
    }

    const saverEntity = this._hass.states['saver.saver'];
    if (!saverEntity || !saverEntity.attributes || !saverEntity.attributes.variables) {
      return null;
    }

    const value = saverEntity.attributes.variables[key];
    if (value === undefined || value === null) {
      return null;
    }

    return String(value).trim();
  }

  async saveData(serializedData) {
    if (!this.isAvailable()) {
      this._debug('[SaverStorage] saveData: Nicht verfügbar');
      return;
    }

    this._debug(
      `[SaverStorage] saveData: Start, saver_key: "${this._saverKey}", Datenlänge: ${serializedData.length} Zeichen`
    );

    try {
      // Prüfe ob sich der Wert geändert hat
      const oldValue = this._readSaverVariable(this._saverKey);
      
      this._debug(
        `[SaverStorage] saveData: Saver-Variable "${this._saverKey}" existiert: ${oldValue !== null}, alte Länge: ${oldValue?.length || 0} Zeichen`
      );

      // Nur schreiben wenn Variable nicht existiert oder Wert sich geändert hat
      if (oldValue === null || oldValue !== serializedData) {
        this._debug(
          `[SaverStorage] saveData: Schreibe in Saver (Variable existiert nicht oder Wert hat sich geändert)`
        );
        await this._hass.callService('saver', 'set_variable', {
          name: this._saverKey,
          value: serializedData || '',
        });
        this._debug(`[Sync] [SaverStorage] saveData: Erfolgreich in Saver geschrieben - andere Karten sollten Änderung erkennen`);
      } else {
        this._debug(
          `[SaverStorage] saveData: Kein Schreiben nötig, Wert hat sich nicht geändert`
        );
      }
    } catch (error) {
      this._debug(
        `[SaverStorage] saveData: Fehler beim Schreiben in Saver: ${error.message}`,
        error
      );
      console.warn('[TG Schichtplan] Fehler beim Schreiben in Saver:', error);
      throw error; // Wirf Fehler weiter, damit Fallback-Mechanismus greifen kann
    }
  }

  async loadData() {
    if (!this.isAvailable()) {
      this._debug('[SaverStorage] loadData: Nicht verfügbar');
      return null;
    }

    this._debug(
      `[SaverStorage] loadData: Versuche Daten von Saver-Variable "${this._saverKey}" zu laden`
    );
    
    const data = this._readSaverVariable(this._saverKey);

    if (data && data.trim() !== '') {
      this._debug(
        `[SaverStorage] loadData: Daten erfolgreich geladen, Länge: ${data.length} Zeichen`
      );
      return data;
    }

    this._debug('[SaverStorage] loadData: Keine Daten gefunden');
    return null;
  }

  /**
   * Erstellt die Config-Daten im vollständigen JSON-Format (für Saver)
   * Verwendet direkt das Format vom Config-Panel (calendars-Array)
   * @private
   */
  _createFullJsonConfig(calendars, holidays, statusOnlyInTimeRange) {
    const configObject = {
      calendars: calendars,
      holidays: holidays || {},
      statusOnlyInTimeRange: statusOnlyInTimeRange !== undefined ? statusOnlyInTimeRange : false,
      setup: {
        timer_entity: this._config?.entity || '',
        store_mode: this._config?.store_mode || 'saver',
      },
      lastchange: Math.floor(Date.now() / 1000), // Unix-Timestamp - wird bei jedem Speichern aktualisiert
    };
    this._debug(`[SaverStorage] _createFullJsonConfig: lastchange auf ${configObject.lastchange} gesetzt (aktueller Unix-Timestamp)`);
    return JSON.stringify(configObject);
  }

  async saveConfig(calendars, holidays, statusOnlyInTimeRange) {
    if (!this.isAvailable()) {
      this._debug('[SaverStorage] saveConfig: Nicht verfügbar');
      return;
    }

    const configKey = `${this._saverKey}_config`;
    this._debug(`[SaverStorage] saveConfig: Saver-Key: "${this._saverKey}", Config-Key: "${configKey}"`);
    
    const configJson = this._createFullJsonConfig(calendars, holidays, statusOnlyInTimeRange);
    this._debug(
      `[SaverStorage] saveConfig: JSON-Config erstellt, Länge: ${configJson.length} Zeichen, Kalender: ${calendars?.length || 0}`
    );

    try {
      await this._hass.callService('saver', 'set_variable', {
        name: configKey,
        value: String(configJson),
      });
      
      this._debug(`[SaverStorage] saveConfig: Variable "${configKey}" wurde im Saver gespeichert`);
    } catch (error) {
      this._debug(
        `[SaverStorage] saveConfig: Fehler beim Schreiben: ${error.message}`,
        error
      );
      throw error;
    }
  }

  async loadConfig() {
    if (!this.isAvailable()) {
      this._debug('[SaverStorage] loadConfig: Nicht verfügbar');
      return null;
    }

    const configKey = `${this._saverKey}_config`;
    this._debug(
      `[SaverStorage] loadConfig: Versuche Config von Saver-Variable "${configKey}" zu laden`
    );
    
    const config = this._readSaverVariable(configKey);

    if (config && config.trim() !== '') {
      this._debug(
        `[SaverStorage] loadConfig: Config erfolgreich geladen, Länge: ${config.length} Zeichen`
      );
      return config;
    }

    this._debug('[SaverStorage] loadConfig: Keine Config gefunden');
    return null;
  }

  getWarnings() {
    // Saver hat keine Warnungen (keine Entity-Prüfung nötig)
    return null;
  }
}

