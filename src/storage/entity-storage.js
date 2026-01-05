/**
 * Entity-Storage-Implementierung
 * 
 * Speichert Daten in input_text Entities (mit Multi-Entity-Support)
 * Kann später leicht entfernt werden, wenn nur Saver-Storage verwendet werden soll.
 */

import { IStorageAdapter } from './storage-interface.js';

export class EntityStorage extends IStorageAdapter {
  static isApplicable(storeMode) {
    return storeMode === 'text_entity' || !storeMode || storeMode === '';
  }

  constructor(hass, config, debug) {
    super(hass, config, debug);
    this._knownEntityIds = null; // Cache für bekannte Entities
  }

  isAvailable() {
    return !!(this._hass && this._config && this._config.entity);
  }

  /**
   * Findet zusätzliche Entities (z.B. input_text.arbeitszeiten_001, _002, etc.)
   * @private
   */
  findAdditionalEntities(baseEntityId) {
    const additionalEntities = [];

    if (!this._hass || !this._hass.states) {
      return additionalEntities;
    }

    const entityParts = baseEntityId.split('.');
    if (entityParts.length !== 2) {
      return additionalEntities;
    }

    const [domain, baseName] = entityParts;

    // Suche nach Entities mit _001, _002, etc. (bis _999)
    for (let i = 1; i <= 999; i++) {
      const suffix = String(i).padStart(3, '0');
      const additionalEntityId = `${domain}.${baseName}_${suffix}`;

      if (this._hass.states[additionalEntityId]) {
        additionalEntities.push(additionalEntityId);
      } else {
        // Wenn eine Entity nicht existiert, breche ab (Entities sind sequenziell)
        break;
      }
    }

    return additionalEntities;
  }

  /**
   * Ermittelt die maximale Länge einer Entity
   * @private
   */
  getEntityMaxLength(entityId) {
    if (!this._hass || !this._hass.states || !entityId) {
      return null;
    }

    const entity = this._hass.states[entityId];
    if (!entity || !entity.attributes) {
      return null;
    }

    const maxLength = entity.attributes.max;
    if (maxLength !== undefined && maxLength !== null) {
      return parseInt(maxLength);
    }

    return null;
  }

  /**
   * Ermittelt die maximale Länge aller Entities
   * @private
   */
  getAllEntityMaxLengths() {
    const maxLengths = {};

    if (!this._hass || !this._config || !this._config.entity) {
      return maxLengths;
    }

    const mainEntityId = this._config.entity;
    const mainMaxLength = this.getEntityMaxLength(mainEntityId);
    if (mainMaxLength !== null) {
      maxLengths[mainEntityId] = mainMaxLength;
    }

    const additionalEntities = this.findAdditionalEntities(mainEntityId);
    for (const additionalEntityId of additionalEntities) {
      const additionalMaxLength = this.getEntityMaxLength(additionalEntityId);
      if (additionalMaxLength !== null) {
        maxLengths[additionalEntityId] = additionalMaxLength;
      }
    }

    return maxLengths;
  }

  /**
   * Sammelt alle Entity-IDs (Haupt-Entity + zusätzliche)
   * @private
   */
  _getAllEntityIds() {
    if (this._knownEntityIds && this._knownEntityIds.length > 0) {
      return [...this._knownEntityIds];
    }

    const allEntityIds = [this._config.entity];
    const additionalEntities = this.findAdditionalEntities(this._config.entity);
    allEntityIds.push(...additionalEntities);
    this._knownEntityIds = [...allEntityIds];
    return allEntityIds;
  }

  async saveData(serializedData) {
    if (!this.isAvailable()) {
      this._debug('[EntityStorage] saveData: Nicht verfügbar');
      return;
    }

    this._debug(
      `[EntityStorage] saveData: Start, Datenlänge: ${serializedData ? serializedData.length : 0} Zeichen`
    );

    try {
      // Verwende die gecachte Liste der Entities, falls verfügbar
      let allEntityIds = this._getAllEntityIds();

      // Prüfe ob neue Entities hinzugekommen sind
      const currentAdditionalEntities = this.findAdditionalEntities(this._config.entity);
      const knownAdditionalCount = this._knownEntityIds ? this._knownEntityIds.length - 1 : 0;

      if (currentAdditionalEntities.length > knownAdditionalCount) {
        const newEntities = currentAdditionalEntities.slice(knownAdditionalCount);
        allEntityIds.push(...newEntities);
        this._knownEntityIds = [...allEntityIds];
      }

      this._debug(
        `[EntityStorage] saveData: Verwende ${allEntityIds.length} Entities: ${allEntityIds.join(', ')}`
      );

      // Ermittle die maximale Länge für jede Entity
      const maxLengths = {};
      let totalMaxLength = 0;
      for (const entityId of allEntityIds) {
        const maxLength = this.getEntityMaxLength(entityId);
        if (maxLength !== null) {
          maxLengths[entityId] = maxLength;
          totalMaxLength += maxLength;
        } else {
          maxLengths[entityId] = 255; // Standard
          totalMaxLength += 255;
        }
      }

      const dataLength = serializedData ? serializedData.length : 0;
      this._debug(
        `[EntityStorage] saveData: Datenlänge: ${dataLength} Zeichen, verfügbarer Speicher: ${totalMaxLength} Zeichen`
      );

      // Wenn keine Daten vorhanden sind, setze alle Entities auf leer
      if (!serializedData || serializedData.trim() === '') {
        this._debug('[EntityStorage] saveData: Keine Daten vorhanden, setze alle Entities auf leer');
        for (const entityId of allEntityIds) {
          try {
            await this._hass.callService('input_text', 'set_value', {
              entity_id: entityId,
              value: '',
            });
          } catch (error) {
            this._debug(
              `[EntityStorage] saveData: Fehler beim Leeren von "${entityId}": ${error.message}`
            );
          }
        }
        return;
      }

      // Verteile die Daten zeichenweise auf die Entities
      const entityValues = {};
      let currentEntityIndex = 0;
      let remainingData = serializedData;

      while (remainingData.length > 0 && currentEntityIndex < allEntityIds.length) {
        const currentEntityId = allEntityIds[currentEntityIndex];
        const maxLength = maxLengths[currentEntityId];

        const charsToTake = Math.min(remainingData.length, maxLength);
        const valueToWrite = remainingData.substring(0, charsToTake);

        entityValues[currentEntityId] = valueToWrite;
        remainingData = remainingData.substring(charsToTake);

        if (remainingData.length > 0) {
          currentEntityIndex++;
        }
      }

      // Wenn am Ende noch Text über ist, prüfe ob neue Entities hinzugekommen sind
      if (remainingData.length > 0) {
        const currentAdditionalEntities = this.findAdditionalEntities(this._config.entity);
        const knownAdditionalCount = this._knownEntityIds ? this._knownEntityIds.length - 1 : 0;

        if (currentAdditionalEntities.length > knownAdditionalCount) {
          const newEntities = currentAdditionalEntities.slice(knownAdditionalCount);
          allEntityIds.push(...newEntities);
          this._knownEntityIds = [...allEntityIds];

          for (const newEntityId of newEntities) {
            const maxLength = this.getEntityMaxLength(newEntityId);
            if (maxLength !== null) {
              maxLengths[newEntityId] = maxLength;
            } else {
              maxLengths[newEntityId] = 255;
            }
          }

          // Versuche erneut zu verteilen
          while (remainingData.length > 0 && currentEntityIndex < allEntityIds.length) {
            const currentEntityId = allEntityIds[currentEntityIndex];
            const maxLength = maxLengths[currentEntityId];

            const charsToTake = Math.min(remainingData.length, maxLength);
            const valueToWrite = remainingData.substring(0, charsToTake);

            entityValues[currentEntityId] = valueToWrite;
            remainingData = remainingData.substring(charsToTake);

            if (remainingData.length > 0) {
              currentEntityIndex++;
            }
          }
        }
      }

      // Schreibe alle Entity-Werte
      for (const [entityId, value] of Object.entries(entityValues)) {
        try {
          await this._hass.callService('input_text', 'set_value', {
            entity_id: entityId,
            value: value,
          });
          this._debug(
            `[EntityStorage] saveData: Entity "${entityId}" geschrieben, Länge: ${value.length} Zeichen`
          );
        } catch (error) {
          this._debug(
            `[EntityStorage] saveData: Fehler beim Schreiben in "${entityId}": ${error.message}`
          );
        }
      }

      this._debug('[EntityStorage] saveData: Erfolgreich abgeschlossen');
    } catch (error) {
      this._debug(`[EntityStorage] saveData: Fehler: ${error.message}`, error);
      throw error;
    }
  }

  async loadData() {
    if (!this.isAvailable()) {
      this._debug('[EntityStorage] loadData: Nicht verfügbar');
      return null;
    }

    this._debug(
      `[EntityStorage] loadData: Start, entity: "${this._config.entity}"`
    );

    // Ermittle die maximale Länge für alle Entities
    const maxLengths = this.getAllEntityMaxLengths();

    // Sammle alle Daten-Strings aus der Haupt-Entity und zusätzlichen Entities
    const dataStrings = [];
    const baseEntityId = this._config.entity;
    const additionalEntities = this.findAdditionalEntities(baseEntityId);

    this._debug(
      `[EntityStorage] loadData: Gefundene Entities: Haupt: "${baseEntityId}", Zusätzliche: ${additionalEntities.length}`
    );

    // Speichere die Liste der bekannten Entities
    this._knownEntityIds = [baseEntityId, ...additionalEntities];

    // Lade Daten aus allen Entities
    for (const entityId of this._knownEntityIds) {
      const entity = this._hass.states[entityId];
      if (entity && entity.state && entity.state.trim() !== '') {
        const entityData = entity.state;
        dataStrings.push(entityData);
        this._debug(
          `[EntityStorage] loadData: Entity "${entityId}" hat Daten, Länge: ${entityData.length} Zeichen`
        );
      } else {
        this._debug(
          `[EntityStorage] loadData: Entity "${entityId}" ist leer oder nicht vorhanden`
        );
      }
    }

    // Füge alle Strings zusammen (mit ";" als Trennzeichen)
    if (dataStrings.length > 0) {
      const dataString = dataStrings.join(';');
      this._debug(
        `[EntityStorage] loadData: Daten kombiniert, Gesamtlänge: ${dataString.length} Zeichen`
      );
      return dataString;
    } else {
      this._debug('[EntityStorage] loadData: Keine Daten in Entities gefunden');
      return null;
    }
  }

  /**
   * Erstellt die Config-Daten im komprimierten Format (für text_input Entities)
   * @private
   */
  _createCompressedConfig(activeShifts) {
    let configJson = JSON.stringify(activeShifts);

    // Entferne die äußere Klammer
    if (configJson.startsWith('[') && configJson.endsWith(']')) {
      configJson = configJson.slice(1, -1);
    }

    // Entferne "null" aus dem String
    let previousLength;
    do {
      previousLength = configJson.length;
      configJson = configJson.replace(/,null,/g, ',,');
      configJson = configJson.replace(/,null\]/g, ',]');
      configJson = configJson.replace(/\[null,/g, '[,');
      configJson = configJson.replace(/,null$/g, ',');
    } while (configJson.length !== previousLength);

    // Entferne Anführungszeichen um Strings
    configJson = configJson.replace(/","/g, ',');
    configJson = configJson.replace(/\["/g, '[');
    configJson = configJson.replace(/"\]/g, ']');
    configJson = configJson.replace(/,"/g, ',');
    configJson = configJson.replace(/",/g, ',');

    return configJson;
  }

  /**
   * Ermittelt die Config-Entity-ID
   * @private
   */
  getConfigEntityId() {
    if (!this._config || !this._config.entity) {
      return null;
    }
    return this._config.entity + '_config';
  }

  /**
   * Ermittelt die Status-Entity-ID
   * @private
   */
  getStatusEntityId() {
    if (!this._config || !this._config.entity) {
      return null;
    }
    return this._config.entity + '_status';
  }

  async saveConfig(activeShifts) {
    if (!this.isAvailable()) {
      this._debug('[EntityStorage] saveConfig: Nicht verfügbar');
      return;
    }

    const configEntityId = this.getConfigEntityId();
    if (!configEntityId) {
      this._debug('[EntityStorage] saveConfig: Keine configEntityId');
      return;
    }

    this._debug(`[EntityStorage] saveConfig: Start, configEntityId: "${configEntityId}"`);

    // Prüfe ob die Entity existiert
    const configEntity = this._hass.states[configEntityId];
    if (!configEntity) {
      this._debug(`[EntityStorage] saveConfig: Entity "${configEntityId}" existiert nicht`);
      return;
    }

    // Komprimiertes Format für text_input Entities
    const configJson = this._createCompressedConfig(activeShifts);
    const configJsonLength = configJson.length;

    this._debug(
      `[EntityStorage] saveConfig: Config erstellt (komprimiert), Länge: ${configJsonLength} Zeichen`
    );

    // Prüfe ob der JSON-Text in das Entity passt
    const maxLength = this.getEntityMaxLength(configEntityId);
    if (maxLength !== null && configJsonLength > maxLength) {
      this._debug(
        `[EntityStorage] saveConfig: Config ist zu lang (${configJsonLength} > ${maxLength} Zeichen)`
      );
      // Warnung wird von getWarnings() zurückgegeben
    }

    try {
      await this._hass.callService('input_text', 'set_value', {
        entity_id: configEntityId,
        value: configJson,
      });
      this._debug(`[EntityStorage] saveConfig: Config erfolgreich gespeichert`);
    } catch (error) {
      this._debug(`[EntityStorage] saveConfig: Fehler beim Speichern: ${error.message}`, error);
      throw error;
    }
  }

  async loadConfig() {
    if (!this.isAvailable()) {
      this._debug('[EntityStorage] loadConfig: Nicht verfügbar');
      return null;
    }

    const configEntityId = this.getConfigEntityId();
    if (!configEntityId) {
      return null;
    }

    const configEntity = this._hass.states[configEntityId];
    if (!configEntity || !configEntity.state || configEntity.state.trim() === '') {
      return null;
    }

    return configEntity.state;
  }

  checkStorageUsage(dataLength = null) {
    if (!this.isAvailable()) {
      return null;
    }

    const allEntityIds = this._getAllEntityIds();
    const maxLengths = this.getAllEntityMaxLengths();

    if (Object.keys(maxLengths).length === 0) {
      return null;
    }

    // Berechne Gesamtlänge und maximale Gesamtlänge
    let totalCurrentLength = 0;
    let totalMaxLength = 0;

    if (dataLength !== null && dataLength !== undefined) {
      totalCurrentLength = dataLength;
    } else {
      // Lese Längen aus den aktuellen States
      for (const entityId of allEntityIds) {
        const entity = this._hass.states[entityId];
        if (entity && entity.state) {
          totalCurrentLength += entity.state.length;
        }
      }
    }

    // Berechne maximale Gesamtlänge
    for (const entityId of allEntityIds) {
      const maxLength = maxLengths[entityId];
      if (maxLength !== undefined && maxLength !== null) {
        totalMaxLength += maxLength;
      }
    }

    if (totalMaxLength === 0) {
      return null;
    }

    const percentage = (totalCurrentLength / totalMaxLength) * 100;

    // Prüfe ob 90% überschritten werden
    if (percentage >= 90) {
      return {
        show: true,
        currentLength: totalCurrentLength,
        maxLength: totalMaxLength,
        percentage: Math.round(percentage * 10) / 10,
      };
    }

    return null;
  }

  getWarnings() {
    if (!this.isAvailable()) {
      return null;
    }

    const warnings = {
      config: null,
      status: null,
    };

    // Prüfe Config-Entity
    const configEntityId = this.getConfigEntityId();
    if (configEntityId) {
      if (!this._hass || !this._hass.states[configEntityId]) {
        warnings.config = {
          show: true,
          type: 'missing',
          configEntityId: configEntityId,
        };
      }
    }

    // Prüfe Status-Entity
    const statusEntityId = this.getStatusEntityId();
    if (statusEntityId) {
      if (!this._hass || !this._hass.states[statusEntityId]) {
        warnings.status = {
          show: true,
          type: 'missing',
          statusEntityId: statusEntityId,
        };
      }
    }

    return warnings.config || warnings.status ? warnings : null;
  }
}

