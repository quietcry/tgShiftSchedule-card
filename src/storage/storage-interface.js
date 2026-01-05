/**
 * Storage-Interface für verschiedene Speicher-Mechanismen
 * 
 * Dieses Interface ermöglicht es, verschiedene Storage-Implementierungen
 * (z.B. Saver, Entity) zu kapseln und später leicht zu entfernen oder zu wechseln.
 */

/**
 * @interface IStorageAdapter
 * 
 * Basis-Interface für alle Storage-Adapter
 */
export class IStorageAdapter {
  /**
   * Prüft, ob dieser Storage-Adapter für den gegebenen store_mode verwendet werden soll
   * @param {string} storeMode - Der store_mode aus der Config ('saver' oder 'text_entity')
   * @returns {boolean} - true wenn dieser Adapter verwendet werden soll
   */
  static isApplicable(storeMode) {
    throw new Error('isApplicable muss in der abgeleiteten Klasse implementiert werden');
  }

  /**
   * Initialisiert den Storage-Adapter
   * @param {Object} hass - Home Assistant Objekt
   * @param {Object} config - Konfiguration
   * @param {Function} debug - Debug-Funktion
   */
  constructor(hass, config, debug) {
    this._hass = hass;
    this._config = config;
    this._debug = debug;
  }

  /**
   * Speichert die serialisierten Daten
   * @param {string} serializedData - Serialisierte Daten als String
   * @returns {Promise<void>}
   */
  async saveData(serializedData) {
    throw new Error('saveData muss in der abgeleiteten Klasse implementiert werden');
  }

  /**
   * Lädt die Daten
   * @returns {Promise<string|null>} - Die geladenen Daten oder null wenn keine vorhanden
   */
  async loadData() {
    throw new Error('loadData muss in der abgeleiteten Klasse implementiert werden');
  }

  /**
   * Speichert die Konfiguration
   * @param {Array} activeShifts - Array der aktiven Schichten
   * @returns {Promise<void>}
   */
  async saveConfig(activeShifts) {
    throw new Error('saveConfig muss in der abgeleiteten Klasse implementiert werden');
  }

  /**
   * Lädt die Konfiguration
   * @returns {Promise<string|null>} - Die geladene Konfiguration oder null wenn keine vorhanden
   */
  async loadConfig() {
    throw new Error('loadConfig muss in der abgeleiteten Klasse implementiert werden');
  }

  /**
   * Prüft, ob die Storage-Komponente verfügbar/konfiguriert ist
   * @returns {boolean}
   */
  isAvailable() {
    throw new Error('isAvailable muss in der abgeleiteten Klasse implementiert werden');
  }

  /**
   * Gibt Warnungen zurück (z.B. bei fehlenden Entities oder Speicherproblemen)
   * @returns {Object|null} - Warnungsobjekt oder null
   */
  getWarnings() {
    throw new Error('getWarnings muss in der abgeleiteten Klasse implementiert werden');
  }

  /**
   * Prüft die Speichernutzung (nur für Entity-Storage relevant)
   * @param {number} dataLength - Länge der zu speichernden Daten
   * @returns {Object|null} - Nutzungsobjekt oder null
   */
  checkStorageUsage(dataLength) {
    // Optional - Standard-Implementierung gibt null zurück
    return null;
  }
}

