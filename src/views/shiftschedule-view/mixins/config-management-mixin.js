/**
 * ConfigManagementMixin - Config-Format-Konvertierung
 * 
 * Wiederverwendbar in anderen Projekten!
 * 
 * **Abhängigkeiten (müssen in der Hauptklasse initialisiert werden):**
 * - `this._config` - Konfigurationsobjekt
 * 
 * @example
 * import { ConfigManagementMixin } from './mixins/config-management-mixin';
 * class MyView extends LitElement {
 *   constructor() {
 *     super();
 *     Object.assign(this, ConfigManagementMixin);
 *   }
 * }
 */
export const ConfigManagementMixin = {
  /**
   * Erstellt die Config-Daten im komprimierten Format (für text_input Entities)
   * Entfernt Anführungszeichen und null-Werte für kompakte Speicherung
   * @param {Array} activeShifts - Array der aktiven Schichten
   * @returns {string} Komprimierte Config als String
   */
  _createCompressedConfig(activeShifts) {
    // Speichere als JSON (direktes Array, kein Objekt-Wrapper)
    let configJson = JSON.stringify(activeShifts);

    // Entferne die äußere Klammer (erstes [ und letztes ])
    if (configJson.startsWith('[') && configJson.endsWith(']')) {
      configJson = configJson.slice(1, -1);
    }

    // Entferne "null" aus dem String (behalte Kommas)
    // Wiederhole die Ersetzung, bis keine null mehr vorhanden sind (für mehrere null hintereinander)
    let previousLength;
    do {
      previousLength = configJson.length;
      // Ersetze ,null, durch ,, (mehrfach, bis keine null mehr vorhanden sind)
      configJson = configJson.replace(/,null,/g, ',,');
      // Ersetze ,null] durch ,] (falls am Ende eines Arrays)
      configJson = configJson.replace(/,null\]/g, ',]');
      // Ersetze [null, durch [, (falls am Anfang eines Arrays)
      configJson = configJson.replace(/\[null,/g, '[,');
      // Ersetze ,null, am Ende des Strings (falls letztes Element null ist)
      configJson = configJson.replace(/,null$/g, ',');
    } while (configJson.length !== previousLength);

    // Entferne Anführungszeichen um Strings
    // Ersetze "," durch , (Anführungszeichen um Kommas)
    configJson = configJson.replace(/","/g, ',');
    // Ersetze [" durch [ (Anführungszeichen am Anfang eines Arrays)
    configJson = configJson.replace(/\["/g, '[');
    // Ersetze "] durch ] (Anführungszeichen am Ende eines Arrays)
    configJson = configJson.replace(/"\]/g, ']');
    // Ersetze ," durch , (Anführungszeichen nach Komma)
    configJson = configJson.replace(/,"/g, ',');
    // Ersetze ", durch , (Anführungszeichen vor Komma)
    configJson = configJson.replace(/",/g, ',');

    return configJson;
  },

  /**
   * Erstellt die Config-Daten im vollständigen JSON-Format (für Saver)
   * @param {Array} activeShifts - Array der aktiven Schichten
   * @returns {string} Vollständiges JSON als String
   */
  _createFullJsonConfig(activeShifts) {
    // Vollständiges JSON-Format: Objekt mit shifts, setup und lastchange
    // Format: {shifts:[], setup:{}, lastchange:123456789}
    const configObject = {
      shifts: activeShifts,
      setup: {
        timer_entity: this._config?.entity || '',
        store_mode: this._config?.store_mode || 'saver',
      },
      lastchange: Math.floor(Date.now() / 1000), // Unix-Timestamp (Sekunden seit 1970-01-01)
    };
    return JSON.stringify(configObject);
  },
};

