import { html, css } from 'lit';
import { ViewBase } from '../view-base.js';

export class CalendarView extends ViewBase {
  static className = 'CalendarView';

  static get properties() {
    return {
      ...super.properties,
      hass: { type: Object },
      config: { type: Object },
      _workingDays: { type: Object },
      _storageWarning: { type: Object },
      _displayedMonths: { type: Number },
      _startMonthOffset: { type: Number },
    };
  }

  constructor() {
    super();
    this._workingDays = {}; // {"year:month": [days]}
    this._storageWarning = null; // { show: boolean, currentLength: number, maxLength: number, percentage: number }
    this._knownEntityIds = null; // Cache für bekannte Entities [mainEntity, ...additionalEntities]
    this._cleanupDone = false; // Flag, ob die Bereinigung bereits beim initialen Laden ausgeführt wurde
    this._displayedMonths = 2; // Anzahl der angezeigten Monate (wird aus config.numberOfMonths initialisiert)
    this._startMonthOffset = 0; // Offset für den Startmonat (0 = aktueller Monat, -1 = Vormonat, +1 = nächster Monat)
  }

  // Formatiert eine Zahl auf zwei Ziffern (z.B. 1 -> "01", 25 -> "25")
  formatTwoDigits(num) {
    return String(num).padStart(2, '0');
  }

  set hass(hass) {
    const previousEntityState = this._hass?.states[this._config?.entity]?.state;
    const newEntityState = hass?.states[this._config?.entity]?.state;
    
    this._hass = hass;
    if (this._config) {
      // Nur laden, wenn sich der State tatsächlich geändert hat (nicht bei jedem Update)
      if (previousEntityState !== newEntityState) {
        this.loadWorkingDays();
      }
    }
    this.requestUpdate();
  }

  set config(config) {
    this._config = config;
    // Initialisiere _displayedMonths aus der Config
    if (config && config.initialDisplayedMonths) {
      // Verwende initialDisplayedMonths als Standardwert
      const maxMonths = config.numberOfMonths || 14;
      this._displayedMonths = Math.min(config.initialDisplayedMonths, maxMonths);
    } else if (config && config.numberOfMonths && !this._displayedMonths) {
      // Fallback: Verwende numberOfMonths, falls initialDisplayedMonths nicht gesetzt ist
      this._displayedMonths = config.numberOfMonths;
    } else if (config && config.numberOfMonths) {
      // Stelle sicher, dass _displayedMonths nicht größer als numberOfMonths ist
      this._displayedMonths = Math.min(this._displayedMonths || 2, config.numberOfMonths);
    }
    if (this._hass) {
      this.loadWorkingDays();
    }
    this.requestUpdate();
  }

  async loadWorkingDays() {
    if (!this._hass || !this._config || !this._config.entity) return;

    // Ermittle die maximale Länge für alle Entities
    const maxLengths = this.getAllEntityMaxLengths();

    // Sammle alle Daten-Strings aus der Haupt-Entity und zusätzlichen Entities
    const dataStrings = [];

    // Prüfe auf zusätzliche Entities (z.B. input_text.arbeitszeiten_001, _002, etc.)
    const baseEntityId = this._config.entity;
    const additionalEntities = this.findAdditionalEntities(baseEntityId);
    
    // Speichere die Liste der bekannten Entities für späteres Schreiben
    // Diese Liste enthält: Haupt-Entity + alle zusätzlichen Entities
    this._knownEntityIds = [baseEntityId, ...additionalEntities];
    console.log('loadWorkingDays: Alle bekannten Entities (Haupt + zusätzliche):', this._knownEntityIds);
    
    // Lade Daten aus allen Entities (Haupt-Entity + zusätzliche)
    for (const entityId of this._knownEntityIds) {
      const entity = this._hass.states[entityId];
      if (entity && entity.state && entity.state.trim() !== '') {
        dataStrings.push(entity.state);
        const currentLength = entity.state.length;
        const maxLength = maxLengths[entityId];
        if (maxLength !== undefined) {
          console.log(`loadWorkingDays: ${entityId} - Länge: ${currentLength}/${maxLength}`);
        }
      }
    }

    // Füge alle Strings zusammen (mit ";" als Trennzeichen) und parse dann einmal
    console.log('loadWorkingDays: Anzahl dataStrings:', dataStrings.length);
    const additionalEntityIds = this._knownEntityIds ? this._knownEntityIds.slice(1) : [];
    console.log('loadWorkingDays: dataStrings Details:', {
      allEntities: this._knownEntityIds,
      dataLengths: dataStrings.map(s => s?.length || 0),
      mainEntity: this._config.entity,
      additionalEntities: additionalEntityIds
    });
    if (dataStrings.length > 0) {
      const combinedString = dataStrings.join(';');
      console.log('loadWorkingDays: Kombinierter String Länge:', combinedString.length);
      this.parseWorkingDays(combinedString);
    } else {
      this._workingDays = {};
    }

    // Prüfe Speicherverbrauch und zeige Warnung bei 90%+
    this.checkStorageUsage();

    // Bereinige alte Monate: entferne alle Monate, die nicht angezeigt werden
    // Die Karte zeigt numberOfMonths Monate an (ab aktueller Monat)
    // Behalten wir: Vormonat (aktuell - 1) und alle angezeigten Monate (aktuell bis aktuell + numberOfMonths - 1)
    // Führe die Bereinigung nur beim initialen Laden aus, nicht bei jedem State-Update
    // (um zu verhindern, dass gerade geschriebene Daten sofort wieder gelöscht werden)
    if (Object.keys(this._workingDays).length > 0 && !this._cleanupDone) {
      this._cleanupDone = true;
      const numberOfMonths = this._config.numberOfMonths || 2;
      const now = new Date();
      const currentMonth = now.getMonth() + 1; // 1-12
      const currentYearFull = now.getFullYear();
      const currentYear = currentYearFull % 100; // Kurzform, z.B. 25
      
      // Berechne Vormonat und sein Jahr
      let previousMonth, previousYear;
      if (currentMonth === 1) {
        previousMonth = 12;
        previousYear = (currentYearFull - 1) % 100; // Jahr des Vormonats (Dezember des Vorjahres)
      } else {
        previousMonth = currentMonth - 1;
        previousYear = currentYear;
      }
      
      // Erstelle Liste aller Monate, die behalten werden sollen
      const monthsToKeep = [];
      
      // Füge Vormonat hinzu
      monthsToKeep.push({ year: previousYear, month: previousMonth });
      
      // Füge alle angezeigten Monate hinzu
      for (let i = 0; i < numberOfMonths; i++) {
        const date = new Date(currentYearFull, currentMonth - 1 + i, 1);
        const year = date.getFullYear() % 100;
        const month = date.getMonth() + 1;
        monthsToKeep.push({ year, month });
      }
      
      console.log('loadWorkingDays: Bereinigung', {
        numberOfMonths,
        currentYear,
        currentMonth,
        monthsToKeep,
        keys: Object.keys(this._workingDays)
      });
      
      let hasChanges = false;
      
      for (const key of Object.keys(this._workingDays)) {
        // Parse den Key um zu prüfen, ob er behalten werden soll
        const keyParts = key.split(':');
        if (keyParts.length === 2) {
          const keyYear = parseInt(keyParts[0]);
          const keyMonth = parseInt(keyParts[1]);
          
          // Prüfe ob dieser Key in der Liste der zu behaltenden Monate ist
          const shouldKeep = monthsToKeep.some(
            m => m.year === keyYear && m.month === keyMonth
          );
          
          console.log('loadWorkingDays: Prüfe Key', {
            key,
            keyYear,
            keyMonth,
            shouldKeep,
            monthsToKeep: monthsToKeep.map(m => `${m.year}:${m.month}`)
          });
          
          if (!shouldKeep) {
            console.log('loadWorkingDays: Entferne Key', key);
            delete this._workingDays[key];
            hasChanges = true;
          }
        } else {
          // Ungültiges Format, entfernen
          console.log('loadWorkingDays: Ungültiges Format, entferne Key', key);
          delete this._workingDays[key];
          hasChanges = true;
        }
      }
      
      // Wenn Änderungen vorgenommen wurden, speichere die bereinigten Daten
      if (hasChanges) {
        const cleanedValue = this.serializeWorkingDays();
        console.log('loadWorkingDays: Alte Monate entfernt, neue Werte:', cleanedValue);
        try {
          await this._hass.callService('input_text', 'set_value', {
            entity_id: this._config.entity,
            value: cleanedValue,
          });
        } catch (error) {
          console.error('loadWorkingDays: Fehler beim Speichern der bereinigten Daten', error);
        }
      }
    }
    
    this.requestUpdate();
  }

  _parseWorkingDaysIntoObject(dataString, targetObject) {
    if (!dataString || dataString.trim() === '') return;

    const parts = dataString.split(';').filter(p => p.trim() !== '');
    for (const part of parts) {
      const trimmedPart = part.trim();
      if (!trimmedPart) continue;

      // Format: <jahr>:<monat>:<tag>,<tag> oder altes Format: <monat>:<tag>,<tag> oder <monat>:<jahr>:<tag>,<tag>
      const colons = trimmedPart.split(':');
      
      if (colons.length === 2) {
        // Altes Format ohne Jahr (Kompatibilität): <monat>:<tag>,<tag>
        const month = colons[0].trim();
        const daysStr = colons[1].trim();
        if (month && daysStr) {
          const monthNum = parseInt(month);
          const days = daysStr.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
          if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12 && days.length > 0) {
            // Verwende aktuelles Jahr
            const now = new Date();
            const year = now.getFullYear() % 100;
            const key = `${this.formatTwoDigits(year)}:${this.formatTwoDigits(monthNum)}`;
            targetObject[key] = days;
          }
        }
      } else if (colons.length >= 3) {
        // Prüfe ob erstes Element ein Jahr ist (kleiner als 13) oder ein Monat
        const first = parseInt(colons[0].trim());
        const second = parseInt(colons[1].trim());
        
        if (first <= 12 && second > 12) {
          // Altes Format: <monat>:<jahr>:<tag>,<tag> - konvertiere zu neuem Format
          const monthNum = first;
          const yearNum = second;
          const daysStr = colons.slice(2).join(':');
          if (daysStr) {
            const days = daysStr.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
            if (monthNum >= 1 && monthNum <= 12 && !isNaN(yearNum) && days.length > 0) {
              const key = `${this.formatTwoDigits(yearNum)}:${this.formatTwoDigits(monthNum)}`;
              targetObject[key] = days;
            }
          }
        } else if (first > 12 && second <= 12) {
          // Neues Format: <jahr>:<monat>:<tag>,<tag>
          const yearNum = first;
          const monthNum = second;
          const daysStr = colons.slice(2).join(':');
          if (daysStr) {
            const days = daysStr.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
            if (monthNum >= 1 && monthNum <= 12 && !isNaN(yearNum) && days.length > 0) {
              const key = `${this.formatTwoDigits(yearNum)}:${this.formatTwoDigits(monthNum)}`;
              targetObject[key] = days;
            }
          }
        }
      }
    }
  }

  parseWorkingDays(dataString) {
    this._workingDays = {};
    this._parseWorkingDaysIntoObject(dataString, this._workingDays);
  }

  findAdditionalEntities(baseEntityId) {
    const additionalEntities = [];
    
    if (!this._hass || !this._hass.states) {
      return additionalEntities;
    }

    // Extrahiere den Domain-Teil (z.B. "input_text.arbeitszeiten")
    const entityParts = baseEntityId.split('.');
    if (entityParts.length !== 2) {
      return additionalEntities;
    }

    const [domain, baseName] = entityParts;
    
    // Suche nach Entities mit _001, _002, etc. (bis _999)
    for (let i = 1; i <= 999; i++) {
      const suffix = String(i).padStart(3, '0'); // _001, _002, ..., _999
      const additionalEntityId = `${domain}.${baseName}_${suffix}`;
      
      if (this._hass.states[additionalEntityId]) {
        additionalEntities.push(additionalEntityId);
      } else {
        // Wenn eine Entity nicht existiert, breche ab (Entities sind sequenziell)
        // Es macht keinen Sinn weiterzusuchen, wenn _001 fehlt
        break;
      }
    }
    
    return additionalEntities;
  }

  getEntityMaxLength(entityId) {
    if (!this._hass || !this._hass.states || !entityId) {
      return null;
    }

    const entity = this._hass.states[entityId];
    if (!entity || !entity.attributes) {
      return null;
    }

    // input_text Entities haben ein 'max' Attribut, das die maximale Länge definiert
    const maxLength = entity.attributes.max;
    
    if (maxLength !== undefined && maxLength !== null) {
      return parseInt(maxLength);
    }

    return null;
  }

  getAllEntityMaxLengths() {
    const maxLengths = {};
    
    if (!this._hass || !this._config || !this._config.entity) {
      return maxLengths;
    }

    // Prüfe Haupt-Entity
    const mainEntityId = this._config.entity;
    const mainMaxLength = this.getEntityMaxLength(mainEntityId);
    if (mainMaxLength !== null) {
      maxLengths[mainEntityId] = mainMaxLength;
      console.log(`getAllEntityMaxLengths: ${mainEntityId} max length: ${mainMaxLength}`);
    }

    // Prüfe zusätzliche Entities
    const additionalEntities = this.findAdditionalEntities(mainEntityId);
    for (const additionalEntityId of additionalEntities) {
      const additionalMaxLength = this.getEntityMaxLength(additionalEntityId);
      if (additionalMaxLength !== null) {
        maxLengths[additionalEntityId] = additionalMaxLength;
        console.log(`getAllEntityMaxLengths: ${additionalEntityId} max length: ${additionalMaxLength}`);
      }
    }

    return maxLengths;
  }

  checkStorageUsage(serializedDataLength = null) {
    if (!this._hass || !this._config || !this._config.entity) {
      this._storageWarning = null;
      this.requestUpdate();
      return;
    }

    // Verwende _knownEntityIds falls verfügbar, sonst suche neu
    let allEntityIds;
    if (this._knownEntityIds && this._knownEntityIds.length > 0) {
      allEntityIds = [...this._knownEntityIds];
      console.log('checkStorageUsage: Verwende gecachte Entity-Liste:', allEntityIds);
    } else {
      // Fallback: Suche Entities neu
      allEntityIds = [this._config.entity, ...this.findAdditionalEntities(this._config.entity)];
      console.log('checkStorageUsage: Entity-Liste neu gesucht:', allEntityIds);
    }

    const maxLengths = this.getAllEntityMaxLengths();
    if (Object.keys(maxLengths).length === 0) {
      this._storageWarning = null;
      this.requestUpdate();
      return;
    }

    // Berechne Gesamtlänge und maximale Gesamtlänge
    let totalCurrentLength = 0;
    let totalMaxLength = 0;

    // Wenn eine serializedDataLength übergeben wurde, verwende diese (z.B. nach toggleDay)
    // Ansonsten lese die Längen aus den aktuellen States
    if (serializedDataLength !== null && serializedDataLength !== undefined) {
      totalCurrentLength = serializedDataLength;
      console.log('checkStorageUsage: Verwende übergebene Datenlänge:', serializedDataLength);
    } else {
      // Lese Längen aus den aktuellen States
      for (const entityId of allEntityIds) {
        const entity = this._hass.states[entityId];
        if (entity && entity.state) {
          totalCurrentLength += entity.state.length;
        }
      }
      console.log('checkStorageUsage: Lese Längen aus aktuellen States');
    }

    // Berechne maximale Gesamtlänge
    for (const entityId of allEntityIds) {
      const maxLength = maxLengths[entityId];
      if (maxLength !== undefined && maxLength !== null) {
        totalMaxLength += maxLength;
      }
    }

    if (totalMaxLength === 0) {
      this._storageWarning = null;
      this.requestUpdate();
      return;
    }

    const percentage = (totalCurrentLength / totalMaxLength) * 100;
    console.log('checkStorageUsage: Speicherverbrauch:', {
      totalCurrentLength,
      totalMaxLength,
      percentage: Math.round(percentage * 10) / 10
    });

    // Prüfe ob 90% überschritten werden
    if (percentage >= 90) {
      this._storageWarning = {
        show: true,
        currentLength: totalCurrentLength,
        maxLength: totalMaxLength,
        percentage: Math.round(percentage * 10) / 10,
      };
      console.warn('checkStorageUsage: 90% der Gesamtlänge überschritten!', this._storageWarning);
    } else {
      this._storageWarning = null;
    }
    
    // Wichtig: requestUpdate() aufrufen, damit die Warnung angezeigt wird
    this.requestUpdate();
  }

  serializeWorkingDays() {
    const parts = [];
    // Sortiere nach Jahr:Monat
    const keys = Object.keys(this._workingDays).sort((a, b) => {
      const [yearA, monthA] = a.split(':').map(x => parseInt(x));
      const [yearB, monthB] = b.split(':').map(x => parseInt(x));
      if (yearA !== yearB) return yearA - yearB;
      return monthA - monthB;
    });
    
    for (const key of keys) {
      const days = this._workingDays[key];
      if (days && days.length > 0) {
        // Stelle sicher, dass alle Tage Zahlen sind und sortiert werden
        const sortedDays = days.map(d => parseInt(d)).filter(d => !isNaN(d)).sort((a, b) => a - b);
        if (sortedDays.length > 0) {
          // Format: <jahr>:<monat>:<tag>,<tag> (alle mit zwei Ziffern)
          const formattedDays = sortedDays.map(d => this.formatTwoDigits(d)).join(',');
          parts.push(`${key}:${formattedDays}`);
        }
      }
    }
    return parts.join(';');
  }

  async distributeDataToEntities(serializedData) {
    if (!this._hass || !this._config || !this._config.entity) {
      console.error('distributeDataToEntities: hass oder config fehlt');
      return;
    }

    // Verwende die gecachte Liste der Entities, falls verfügbar
    // Prüfe aber auch, ob neue Entities hinzugekommen sind
    let allEntityIds;
    if (this._knownEntityIds && this._knownEntityIds.length > 0) {
      // Verwende gecachte Liste
      allEntityIds = [...this._knownEntityIds];
      console.log('distributeDataToEntities: Verwende gecachte Entity-Liste:', allEntityIds);
      
      // Prüfe ob neue Entities hinzugekommen sind
      const currentAdditionalEntities = this.findAdditionalEntities(this._config.entity);
      const knownAdditionalCount = this._knownEntityIds.length - 1; // -1 für Haupt-Entity
      if (currentAdditionalEntities.length > knownAdditionalCount) {
        // Neue Entities gefunden, aktualisiere die Liste
        const newEntities = currentAdditionalEntities.slice(knownAdditionalCount);
        allEntityIds.push(...newEntities);
        this._knownEntityIds = [...allEntityIds];
        console.log('distributeDataToEntities: Neue Entities gefunden und hinzugefügt:', newEntities);
      }
    } else {
      // Keine gecachte Liste vorhanden, sammle Entities neu
      allEntityIds = [this._config.entity];
      const additionalEntities = this.findAdditionalEntities(this._config.entity);
      allEntityIds.push(...additionalEntities);
      this._knownEntityIds = [...allEntityIds];
      console.log('distributeDataToEntities: Entity-Liste neu gesammelt:', allEntityIds);
    }

    // Ermittle die maximale Länge für jede Entity
    const maxLengths = {};
    let totalMaxLength = 0;
    for (const entityId of allEntityIds) {
      const maxLength = this.getEntityMaxLength(entityId);
      if (maxLength !== null) {
        maxLengths[entityId] = maxLength;
        totalMaxLength += maxLength;
      } else {
        // Wenn keine max-Länge bekannt ist, verwende einen Standardwert (z.B. 255)
        maxLengths[entityId] = 255;
        totalMaxLength += 255;
        console.warn(`distributeDataToEntities: Keine max-Länge für ${entityId}, verwende Standardwert 255`);
      }
    }

    // Debug: Zeige wie viele Zeichen wir schreiben wollen vs. können
    const dataLength = serializedData ? serializedData.length : 0;
    console.log('distributeDataToEntities: Zeichen-Statistik:', {
      wollenSchreiben: dataLength,
      koennenSchreiben: totalMaxLength,
      verfuegbar: totalMaxLength - dataLength,
      prozent: totalMaxLength > 0 ? Math.round((dataLength / totalMaxLength) * 100 * 10) / 10 : 0,
      entities: allEntityIds.length,
      maxLengthsPerEntity: maxLengths
    });

    // Wenn keine Daten vorhanden sind, setze alle Entities auf leer
    if (!serializedData || serializedData.trim() === '') {
      console.log('distributeDataToEntities: Keine Daten, setze alle Entities auf leer');
      for (const entityId of allEntityIds) {
        try {
          await this._hass.callService('input_text', 'set_value', {
            entity_id: entityId,
            value: '',
          });
        } catch (error) {
          console.error(`distributeDataToEntities: Fehler beim Leeren von ${entityId}`, error);
        }
      }
      return;
    }

    // Verteile die Daten zeichenweise auf die Entities (umgekehrt zum Einlesen)
    // Wir haben einen Datenstring über alles und schreiben nur so viele Zeichen wie aufgenommen werden können
    const entityValues = {};
    let currentEntityIndex = 0;
    let remainingData = serializedData;
    
    // Verteile die Daten auf die verfügbaren Entities
    while (remainingData.length > 0 && currentEntityIndex < allEntityIds.length) {
      const currentEntityId = allEntityIds[currentEntityIndex];
      const maxLength = maxLengths[currentEntityId];
      
      // Nimm so viele Zeichen wie möglich aus remainingData
      const charsToTake = Math.min(remainingData.length, maxLength);
      const valueToWrite = remainingData.substring(0, charsToTake);
      
      entityValues[currentEntityId] = valueToWrite;
      remainingData = remainingData.substring(charsToTake);
      
      console.log(`distributeDataToEntities: ${currentEntityId} - Schreibe ${charsToTake} Zeichen, verbleibend: ${remainingData.length}`);
      
      // Wenn noch Daten übrig sind, wechsle zur nächsten Entity
      if (remainingData.length > 0) {
        currentEntityIndex++;
      }
    }
    
    // Wenn am Ende noch Text über ist, prüfe ob zwischenzeitlich eine zusätzliche Entität angelegt wurde
    if (remainingData.length > 0) {
      console.log(`distributeDataToEntities: Noch ${remainingData.length} Zeichen übrig, prüfe auf neue Entities...`);
      
      // Prüfe ob neue Entities hinzugekommen sind
      const currentAdditionalEntities = this.findAdditionalEntities(this._config.entity);
      const knownAdditionalCount = this._knownEntityIds ? this._knownEntityIds.length - 1 : 0; // -1 für Haupt-Entity
      
      if (currentAdditionalEntities.length > knownAdditionalCount) {
        // Neue Entities gefunden
        const newEntities = currentAdditionalEntities.slice(knownAdditionalCount);
        console.log(`distributeDataToEntities: ${newEntities.length} neue Entities gefunden:`, newEntities);
        
        // Aktualisiere die Liste
        allEntityIds.push(...newEntities);
        this._knownEntityIds = [...allEntityIds];
        
        // Ermittle max-Längen für neue Entities
        for (const newEntityId of newEntities) {
          const maxLength = this.getEntityMaxLength(newEntityId);
          if (maxLength !== null) {
            maxLengths[newEntityId] = maxLength;
          } else {
            maxLengths[newEntityId] = 255;
            console.warn(`distributeDataToEntities: Keine max-Länge für ${newEntityId}, verwende Standardwert 255`);
          }
        }
        
        // Verteile die verbleibenden Daten auf die neuen Entities
        currentEntityIndex = allEntityIds.length - newEntities.length;
        while (remainingData.length > 0 && currentEntityIndex < allEntityIds.length) {
          const currentEntityId = allEntityIds[currentEntityIndex];
          const maxLength = maxLengths[currentEntityId];
          
          const charsToTake = Math.min(remainingData.length, maxLength);
          const valueToWrite = remainingData.substring(0, charsToTake);
          
          entityValues[currentEntityId] = valueToWrite;
          remainingData = remainingData.substring(charsToTake);
          
          console.log(`distributeDataToEntities: ${currentEntityId} (neu) - Schreibe ${charsToTake} Zeichen, verbleibend: ${remainingData.length}`);
          
          if (remainingData.length > 0) {
            currentEntityIndex++;
          }
        }
      } else {
        console.error(`distributeDataToEntities: Keine neuen Entities gefunden, aber noch ${remainingData.length} Zeichen übrig!`);
      }
    }

    // Schreibe die Werte in die Entities
    for (const entityId of allEntityIds) {
      const value = entityValues[entityId] || '';
      const maxLength = maxLengths[entityId];
      
      // Der Wert sollte nie die maximale Länge überschreiten, da wir zeichenweise verteilen
      if (value.length > maxLength) {
        console.error(`distributeDataToEntities: FEHLER - Wert überschreitet max-Länge für ${entityId}! Länge: ${value.length}, Max: ${maxLength}`);
        // Kürze den Wert auf die maximale Länge (als Notfall-Lösung)
        const truncatedValue = value.substring(0, maxLength);
        console.warn(`distributeDataToEntities: Wert wird auf ${maxLength} Zeichen gekürzt`);
        try {
          await this._hass.callService('input_text', 'set_value', {
            entity_id: entityId,
            value: truncatedValue,
          });
          console.log(`distributeDataToEntities: ${entityId} - Länge: ${truncatedValue.length}/${maxLength} (GEKÜRZT!)`);
        } catch (error) {
          console.error(`distributeDataToEntities: Fehler beim Speichern in ${entityId}`, error);
        }
      } else {
        try {
          await this._hass.callService('input_text', 'set_value', {
            entity_id: entityId,
            value: value,
          });
          console.log(`distributeDataToEntities: ${entityId} - Länge: ${value.length}/${maxLength}`);
        } catch (error) {
          console.error(`distributeDataToEntities: Fehler beim Speichern in ${entityId}`, error);
        }
      }
    }
    
    // Wenn noch Daten übrig sind, die nicht gespeichert werden konnten
    if (remainingData.length > 0) {
      console.error(`distributeDataToEntities: WARNUNG - ${remainingData.length} Zeichen konnten nicht gespeichert werden!`, remainingData);
    }
  }

  async toggleDay(month, day, year = null) {
    console.log('toggleDay aufgerufen', { month, day, year, hass: !!this._hass, config: !!this._config });
    
    // Stelle sicher, dass month und day Zahlen sind
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);

    if (isNaN(monthNum) || isNaN(dayNum)) {
      console.error('toggleDay: Ungültige Werte', { month, day, monthNum, dayNum });
      return;
    }
    
    // Prüfe ob dieser Monat der Vormonat ist (schreibgeschützt)
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYearFull = now.getFullYear();
    const currentYear = currentYearFull % 100;
    
    // Bestimme das Jahr (Kurzform, z.B. 25 für 2025)
    if (!year) {
      year = currentYear;
    }
    const yearNum = parseInt(year);
    
    let isPreviousMonth = false;
    if (currentMonth === 1) {
      // Aktuell ist Januar, Vormonat ist Dezember des Vorjahres
      isPreviousMonth = (monthNum === 12 && yearNum === (currentYearFull - 1) % 100);
    } else {
      // Vormonat ist aktueller Monat - 1 im gleichen Jahr
      isPreviousMonth = (monthNum === currentMonth - 1 && yearNum === currentYear);
    }
    
    if (isPreviousMonth) {
      console.log('toggleDay: Vormonat ist schreibgeschützt, Aktion abgebrochen');
      return;
    }

    if (!this._hass || !this._config || !this._config.entity) {
      console.error('toggleDay: hass oder config fehlt', { hass: !!this._hass, config: !!this._config, entity: this._config?.entity });
      return;
    }
    
    // yearNum wurde bereits oben deklariert
    const key = `${this.formatTwoDigits(yearNum)}:${this.formatTwoDigits(monthNum)}`;

    if (!this._workingDays[key]) {
      this._workingDays[key] = [];
    }

    // Konvertiere alle Tage zu Zahlen für den Vergleich
    const workingDays = this._workingDays[key].map(d => parseInt(d));
    const index = workingDays.indexOf(dayNum);

    if (index > -1) {
      // Tag entfernen
      this._workingDays[key].splice(index, 1);
      if (this._workingDays[key].length === 0) {
        delete this._workingDays[key];
      }
    } else {
      // Tag hinzufügen
      this._workingDays[key].push(dayNum);
    }

    const serializedData = this.serializeWorkingDays();
    console.log('toggleDay: Neue Werte', { monthNum, yearNum, dayNum, workingDays: this._workingDays[key], serializedData, entity: this._config.entity });
    
    // Verteile die Daten auf mehrere Entities, falls nötig
    await this.distributeDataToEntities(serializedData);

    // Prüfe Speicherverbrauch nach dem Toggle
    // Verwende die Länge der serialisierten Daten, da die States noch nicht aktualisiert sind
    this.checkStorageUsage(serializedData.length);
    this.requestUpdate();
  }

  getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
  }

  getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  getMonthName(month) {
    const months = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];
    return months[month];
  }

  renderMonth(year, month) {
    const daysInMonth = this.getDaysInMonth(year, month);
    const firstDay = this.getFirstDayOfMonth(year, month);
    const firstDayMonday = (firstDay + 6) % 7;

    const monthKey = month + 1;
    const yearKey = year % 100; // Kurzform, z.B. 25 für 2025
    const key = `${this.formatTwoDigits(yearKey)}:${this.formatTwoDigits(monthKey)}`;
    const workingDays = (this._workingDays[key] || []).map(d => parseInt(d));

    const now = new Date();
    const today = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Prüfe ob dieser Monat der Vormonat ist (schreibgeschützt)
    let isPreviousMonth = false;
    if (currentMonth === 0) {
      // Aktuell ist Januar, Vormonat ist Dezember des Vorjahres
      isPreviousMonth = (month === 11 && year === currentYear - 1);
    } else {
      // Vormonat ist aktueller Monat - 1 im gleichen Jahr
      isPreviousMonth = (month === currentMonth - 1 && year === currentYear);
    }

    const rows = [];
    let day = 1;

    // Erste Woche
    const firstDate = new Date(year, month, 1);
    const weekNumber = this.getWeekNumber(firstDate);
    const firstRowCells = [html`<td class="week-label">${weekNumber}</td>`];

    for (let i = 0; i < firstDayMonday; i++) {
      firstRowCells.push(html`<td></td>`);
    }

      for (let i = firstDayMonday; i < 7 && day <= daysInMonth; i++) {
        const currentDay = day; // Speichere den aktuellen Tag in einer lokalen Variable
        const isWorking = workingDays.includes(parseInt(currentDay));
        const isToday = (year === currentYear && month === currentMonth && currentDay === today);
        firstRowCells.push(html`
          <td>
            <button 
              class="day-button ${isWorking ? 'working' : ''} ${isToday ? 'today' : ''} ${isPreviousMonth ? 'readonly' : ''}"
              @click=${() => !isPreviousMonth && this.toggleDay(monthKey, currentDay, yearKey)}
              ?disabled=${isPreviousMonth}
              data-month="${monthKey}" 
              data-day="${currentDay}"
              data-year="${yearKey}">
              ${currentDay}
            </button>
          </td>
        `);
        day++;
      }
    rows.push(html`<tr>${firstRowCells}</tr>`);

    // Weitere Wochen
    while (day <= daysInMonth) {
      const date = new Date(year, month, day);
      const weekNum = this.getWeekNumber(date);
      const rowCells = [html`<td class="week-label">${weekNum}</td>`];

      for (let i = 0; i < 7 && day <= daysInMonth; i++) {
        const currentDay = day; // Speichere den aktuellen Tag in einer lokalen Variable
        const isWorking = workingDays.includes(parseInt(currentDay));
        const isToday = (year === currentYear && month === currentMonth && currentDay === today);
        rowCells.push(html`
          <td>
            <button 
              class="day-button ${isWorking ? 'working' : ''} ${isToday ? 'today' : ''} ${isPreviousMonth ? 'readonly' : ''}"
              @click=${() => !isPreviousMonth && this.toggleDay(monthKey, currentDay, yearKey)}
              ?disabled=${isPreviousMonth}
              data-month="${monthKey}" 
              data-day="${currentDay}"
              data-year="${yearKey}">
              ${currentDay}
            </button>
          </td>
        `);
        day++;
      }
      rows.push(html`<tr>${rowCells}</tr>`);
    }

    return html`
      <div class="month-container">
        <div class="month-header">${this.getMonthName(month)} ${year}</div>
        <table class="calendar-table">
          <thead>
            <tr>
              <th class="week-label">KW</th>
              <th>Mo</th>
              <th>Di</th>
              <th>Mi</th>
              <th>Do</th>
              <th>Fr</th>
              <th>Sa</th>
              <th>So</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  }

  changeDisplayedMonths(delta) {
    const maxMonths = this._config?.numberOfMonths || 14;
    const newValue = Math.max(1, Math.min(maxMonths, (this._displayedMonths || 2) + delta));
    if (newValue !== this._displayedMonths) {
      this._displayedMonths = newValue;
      this.requestUpdate();
    }
  }

  changeStartMonth(delta) {
    const maxMonths = this._config?.numberOfMonths || 14;
    const displayedMonths = this._displayedMonths || 2;
    const currentOffset = this._startMonthOffset || 0;
    
    // Berechne die Grenzen für die Navigation
    // Minimum: -1 (Vormonat)
    // Maximum: maxMonths - displayedMonths (damit der letzte angezeigte Monat nicht über maxMonths hinausgeht)
    const minOffset = -1;
    const maxOffset = maxMonths - displayedMonths;
    
    const newOffset = Math.max(minOffset, Math.min(maxOffset, currentOffset + delta));
    
    if (newOffset !== currentOffset) {
      this._startMonthOffset = newOffset;
      this.requestUpdate();
    }
  }

  getNavigationBounds() {
    const maxMonths = this._config?.numberOfMonths || 14;
    const displayedMonths = this._displayedMonths || 2;
    const currentOffset = this._startMonthOffset || 0;
    
    const minOffset = -1;
    const maxOffset = maxMonths - displayedMonths;
    
    return {
      canGoBack: currentOffset > minOffset,
      canGoForward: currentOffset < maxOffset
    };
  }

  render() {
    if (!this._config || !this._config.entity) {
      return html`<div class="error">Keine Entity konfiguriert</div>`;
    }

    const maxMonths = this._config.numberOfMonths || 14;
    const displayedMonths = this._displayedMonths || 2;
    const startMonthOffset = this._startMonthOffset || 0;
    const now = new Date();
    const months = [];

    for (let i = 0; i < displayedMonths; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + startMonthOffset + i, 1);
      const year = date.getFullYear();
      const month = date.getMonth();
      months.push({ year, month });
    }

    const hasWarning = this._storageWarning && this._storageWarning.show;
    const navBounds = this.getNavigationBounds();
    
    return html`
      <div class="calendar-wrapper ${hasWarning ? 'storage-warning-active' : ''}">
        ${hasWarning
          ? html`
              <div class="storage-warning">
                <div class="warning-icon">⚠️</div>
                <div class="warning-content">
                  <div class="warning-title">Speicherplatz fast voll!</div>
                  <div class="warning-message">
                    ${this._storageWarning.percentage}% der verfügbaren Speicherkapazität verwendet
                    (${this._storageWarning.currentLength} / ${this._storageWarning.maxLength} Zeichen).
                  </div>
                  <div class="warning-action">
                    Bitte legen Sie ein zusätzliches Input-Text-Feld an (z.B. ${this._config.entity}_${String(this.findAdditionalEntities(this._config.entity).length + 1).padStart(3, '0')}).
                  </div>
                </div>
              </div>
            `
          : ''}
        <div class="menu-bar">
          <button 
            class="menu-button navigation-button"
            @click=${() => this.changeStartMonth(-1)}
            ?disabled=${!navBounds.canGoBack}
            title="Vorheriger Monat">
            ←
          </button>
          <button 
            class="menu-button decrease-button"
            @click=${() => this.changeDisplayedMonths(-1)}
            ?disabled=${displayedMonths <= 1}
            title="Weniger Monate anzeigen">
            −
          </button>
          <div class="menu-number">${displayedMonths}</div>
          <button 
            class="menu-button increase-button"
            @click=${() => this.changeDisplayedMonths(1)}
            ?disabled=${displayedMonths >= maxMonths}
            title="Mehr Monate anzeigen">
            +
          </button>
          <button 
            class="menu-button navigation-button"
            @click=${() => this.changeStartMonth(1)}
            ?disabled=${!navBounds.canGoForward}
            title="Nächster Monat">
            →
          </button>
        </div>
        <div class="calendar-container">
          ${months.map(({ year, month }) => this.renderMonth(year, month))}
        </div>
      </div>
    `;
  }

  static styles = [
    super.styles || [],
    css`
      :host {
        display: block;
      }

      .calendar-wrapper {
        display: block;
        transition: border-color 0.3s ease;
      }

      .calendar-wrapper.storage-warning-active {
        border: 3px solid var(--error-color, #f44336);
        border-radius: 4px;
        padding: 8px;
        box-shadow: 0 0 10px rgba(244, 67, 54, 0.3);
      }

      .menu-bar {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 12px;
        margin-bottom: 16px;
        background-color: var(--card-background-color, #ffffff);
        border-radius: 4px;
        border: 1px solid var(--divider-color, #e0e0e0);
      }

      .menu-button {
        width: 32px;
        height: 32px;
        border-radius: 4px;
        border: 1px solid var(--divider-color, #e0e0e0);
        background-color: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #ffffff);
        font-size: 20px;
        font-weight: bold;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s ease, opacity 0.2s ease;
      }

      .menu-button.navigation-button {
        background-color: var(--secondary-color, #757575);
      }

      .menu-button.navigation-button:hover:not(:disabled) {
        background-color: var(--secondary-color-dark, #616161);
      }

      .menu-button:hover:not(:disabled) {
        background-color: var(--primary-color-dark, #0288d1);
      }

      .menu-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .menu-number {
        font-size: 18px;
        font-weight: bold;
        min-width: 40px;
        text-align: center;
        color: var(--primary-text-color, #212121);
      }

      .calendar-container {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .month-container {
        display: flex;
        flex-direction: column;
      }

      .month-header {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 12px;
        text-align: center;
      }

      .calendar-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
      }

      .calendar-table th {
        padding: 8px 4px;
        text-align: center;
        font-weight: bold;
        font-size: 12px;
        border-bottom: 2px solid var(--divider-color, #e0e0e0);
      }

      .calendar-table td {
        padding: 4px;
        text-align: center;
        vertical-align: middle;
      }

      .day-button {
        width: 100%;
        min-width: 32px;
        height: 32px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 4px;
        background-color: var(--card-background-color, #ffffff);
        color: var(--primary-text-color, #000000);
        cursor: pointer;
        transition: all 0.2s;
        font-size: 12px;
      }

      .day-button:hover {
        background-color: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #ffffff);
      }

      .day-button.working {
        background-color: var(--accent-color, #ff9800);
        color: var(--text-primary-color, #ffffff);
        font-weight: bold;
      }

      .day-button.today {
        border: 2px solid var(--primary-color, #03a9f4);
      }

      .day-button.readonly,
      .day-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background-color: var(--disabled-color, #f5f5f5);
        color: var(--secondary-text-color, #888888);
      }

      .day-button.readonly:hover,
      .day-button:disabled:hover {
        background-color: var(--disabled-color, #f5f5f5);
        color: var(--secondary-text-color, #888888);
      }

      .week-label {
        font-size: 11px;
        color: var(--secondary-text-color, #888888);
        padding-right: 8px;
        text-align: right;
        width: 40px;
      }

      .error {
        text-align: center;
        padding: 20px;
        color: var(--error-color);
      }

      .storage-warning {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 16px;
        margin-bottom: 16px;
        background-color: var(--warning-color, #ff9800);
        color: var(--text-primary-color, #ffffff);
        border-radius: 4px;
        border-left: 4px solid var(--error-color, #f44336);
      }

      .warning-icon {
        font-size: 24px;
        flex-shrink: 0;
      }

      .warning-content {
        flex: 1;
      }

      .warning-title {
        font-weight: bold;
        font-size: 16px;
        margin-bottom: 8px;
      }

      .warning-message {
        font-size: 14px;
        margin-bottom: 8px;
        line-height: 1.5;
      }

      .warning-action {
        font-size: 14px;
        font-weight: 500;
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.3);
      }
    `,
  ];
}

// Registriere CalendarView als Custom Element
if (!customElements.get('calendar-view')) {
  customElements.define('calendar-view', CalendarView);
}

