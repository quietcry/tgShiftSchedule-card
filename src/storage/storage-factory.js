/**
 * Storage-Factory
 * 
 * Erstellt den passenden Storage-Adapter basierend auf dem store_mode
 */

import { SaverStorage } from './saver-storage.js';
import { EntityStorage } from './entity-storage.js';

export class StorageFactory {
  /**
   * Erstellt den passenden Storage-Adapter
   * @param {Object} hass - Home Assistant Objekt
   * @param {Object} config - Konfiguration
   * @param {Function} debug - Debug-Funktion
   * @returns {IStorageAdapter} - Der passende Storage-Adapter
   */
  static createStorage(hass, config, debug) {
    const storeMode = config?.store_mode || 'text_entity';

    // Prüfe welche Storage-Implementierung verwendet werden soll
    if (SaverStorage.isApplicable(storeMode)) {
      debug('[StorageFactory] Erstelle SaverStorage');
      return new SaverStorage(hass, config, debug);
    } else if (EntityStorage.isApplicable(storeMode)) {
      debug('[StorageFactory] Erstelle EntityStorage');
      return new EntityStorage(hass, config, debug);
    } else {
      // Fallback zu EntityStorage
      debug('[StorageFactory] Unbekannter store_mode, verwende EntityStorage als Fallback');
      return new EntityStorage(hass, config, debug);
    }
  }

  /**
   * Prüft, ob ein bestimmter Storage-Typ verfügbar ist
   * @param {string} storeMode - Der store_mode
   * @param {Object} hass - Home Assistant Objekt
   * @param {Object} config - Konfiguration
   * @returns {boolean}
   */
  static isStorageAvailable(storeMode, hass, config) {
    const storage = this.createStorage(hass, config, () => {});
    return storage.isAvailable();
  }
}

