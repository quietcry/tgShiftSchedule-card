import { CardName, DebugMode } from '../../../card-config.js';
import { TgCardHelper } from '../../../tools/tg-card-helper.js';

/**
 * EPG Update Manager
 * Zentrale Verwaltung aller Updates und deren Weitergabe an die entsprechenden Manager
 */
export class EpgUpdateManager extends TgCardHelper {
  static className = 'EpgUpdateManager';
  static cardName = CardName;
  static debugMode = DebugMode;

  constructor(epgBox) {
    super();
    this.epgBox = epgBox;

    // ===== WERT-TRACKING =====
    // Dynamisches Map für die letzten bekannten Werte
    // Wird nur bei Bedarf mit Properties gefüllt
    this._lastValues = new Map();

    this._debug('EpgUpdateManager initialisiert');
  }

  /**
   * Zentrale Update-Funktion - wird für alle Änderungen aufgerufen
   * @param {string} changeType - Art der Änderung
   * @param {Object} changedProperties - Geänderte Properties
   * @param {any} newValue - Neuer Wert (optional)
   */
  handleUpdate(changedProperties) {
    this._debug('handleUpdate!> changedProperties', changedProperties);

    const realChanges = this._filterRealChanges(changedProperties);
    if (realChanges.size === 0) {
      this._debug('handleUpdate!< Keine echten Änderungen, ignoriere Update');
      return;
    }

    let exclusive = false;
    let updateNeccessary = false;
    // Verarbeite verschiedene Update-Typen basierend auf den geänderten Properties
    this._debug('handleUpdate!< realChanges', realChanges);

    // relevant für scale-Berechnung
    updateNeccessary = this._isUpdateRelevant(realChanges, ['envSnifferCardWidth']);
    if (!exclusive && updateNeccessary) {
      this._debug('handleUpdate: ENV Update erkannt');
      exclusive = this._triggerScaleCalculation(realChanges);
    }

    // scale-NeuBerechnung erkannt
    updateNeccessary = this._isUpdateRelevant(realChanges, ['scale']);
    if (!exclusive && updateNeccessary) {
      this._debug('handleUpdate: Scale! Update erkannt', {
        scale: this.epgBox.scale,
        width: this.epgBox.containerWidth,
        realChanges: realChanges,
      });
      exclusive = this._handleScaleCalculation(realChanges);
    }

    // informMeAtViewChanges relevante Änderungen
    updateNeccessary = this._isUpdateRelevant(realChanges, [
      'scale',
      'earliestProgramStart',
      'latestProgramStop',
    ]);
    if (!exclusive && updateNeccessary) {
      this._debug('handleUpdate!< timebar wird updated', realChanges);
      exclusive = this._informMeAtViewChanges(realChanges);
    }

    // // Filtere nur echte Änderungen heraus

    // this._debug('EpgUpdateManager', 'Update empfangen', {
    //   changedProperties,
    //   allChangedProperties: Array.from(changedProperties.keys()),
    //   realChanges: Array.from(realChanges.keys()),
    // });

    // // Nur weiterverarbeiten, wenn es echte Änderungen gibt
    // if (realChanges.size === 0) {
    //   this._debug('EpgUpdateManager: Keine echten Änderungen, ignoriere Update');
    //   return;
    // }

    // // Verarbeite verschiedene Update-Typen basierend auf den geänderten Properties
    // if (!exclusive && this._isUpdateRelevant(realChanges, ['env'])) {
    //   this._debug('EpgUpdateManager: ENV Update erkannt');
    //   exclusive = this._handleEnvUpdate(realChanges);
    // }

    // if (!exclusive && this._isUpdateRelevant(realChanges, ['epgPastTime', 'epgShowFutureTime'])) {
    //   this._debug('EpgUpdateManager: Zeit-relevante Änderung erkannt');
    //   exclusive = this._handleTimeUpdate(realChanges);
    // }

    // if (
    //   !exclusive &&
    //   this._isUpdateRelevant(realChanges, ['showChannelGroups', 'showShortText', 'channelWidth'])
    // ) {
    //   this._debug('EpgUpdateManager: Render-relevante Änderung erkannt');
    //   this._handleRenderUpdate(realChanges);
    // }

    // // Spezielle Behandlung für env-Änderungen
    // if (realChanges.has('env')) {
    //   this._debug('EpgUpdateManager: ENV-Änderung erkannt');
    //   this._handleEnvUpdate(realChanges);
    // }
  }

  _filterRealChangesIsSingleValue(value) {
    return (
      value !== undefined && value !== null && !Array.isArray(value) && typeof value !== 'object'
    );
  }

  _filterRealChangesIsChanged(property, newValue) {
    if (newValue === undefined || newValue === null) {
      return false;
    }
    if (this._lastValues.has(property) && this._lastValues.get(property) === newValue) {
      return false;
    }
    this._lastValues.set(property, newValue);
    return true;
  }
  /**
   * Prüft ob Änderungen für einen bestimmten Update-Typ relevant sind
   */
  _isUpdateRelevant(changedProperties, relevantProps = []) {
    return relevantProps.some(prop => changedProperties.has(prop));
  }

  /**
   * Filtert nur echte Änderungen heraus und speichert sie in _lastValues
   * @param {Set|Map|Object} changedProperties - Geänderte Properties (Set, Map oder Object)
   * @returns {Set} - Nur Properties mit echten Änderungen
   */
  _filterRealChanges(changedProperties) {
    const realChanges = new Map();

    // Null-Check für undefined oder null
    if (!changedProperties || !(changedProperties instanceof Map)) {
      this._debug('EpgUpdateManager: changedProperties ist undefined/null oder keine Map');
      return realChanges;
    }
    for (const [property, newValue] of changedProperties) {
      if (this._filterRealChangesIsSingleValue(newValue)) {
        if (this._filterRealChangesIsChanged(property, newValue)) {
          realChanges.set(property, newValue);
        }
      } else if (newValue instanceof Map) {
        for (const [subProperty, subValue] of newValue) {
          if (this._filterRealChangesIsSingleValue(subValue)) {
            if (this._filterRealChangesIsChanged(subProperty, subValue)) {
              realChanges.set(subProperty, subValue);
            }
          }
        }
      } else if (typeof newValue === 'object' && !Array.isArray(newValue)) {
        // Behandle Objekte analog zu Maps
        for (const [subProperty, subValue] of Object.entries(newValue)) {
          if (this._filterRealChangesIsSingleValue(subValue)) {
            if (this._filterRealChangesIsChanged(subProperty, subValue)) {
              realChanges.set(subProperty, subValue);
            }
          }
        }
      }
    }
    return realChanges;
  }

  // /**
  //  * Behandelt Property-Änderungen (bereits gefiltert für echte Änderungen)
  //  */
  // _handlePropertyChange(changedProperties) {
  //   this._debug('EpgUpdateManager: Verarbeite Property-Änderungen', {
  //     properties: Array.from(changedProperties.keys()),
  //   });

  //   // Channel-Order Änderungen
  //   if (changedProperties.has('channelOrder')) {
  //     this._debug('EpgUpdateManager: Channel-Order geändert');
  //     this.epgBox._channelOrderInitialized = false;
  //     this.epgBox.channelManager.initializeChannelOrder();
  //     this.epgBox.requestUpdate();
  //   }

  //   // Scale-relevante Änderungen
  //   if (this._isScaleRelevant(changedProperties)) {
  //     this._debug('EpgUpdateManager: Scale-relevante Änderung erkannt');
  //     this.handleUpdate('SCALE_UPDATE', changedProperties);
  //   }

  //   // Zeit-relevante Änderungen
  //   if (this._isTimeRelevant(changedProperties)) {
  //     this._debug('EpgUpdateManager: Zeit-relevante Änderung erkannt');
  //     this.handleUpdate('TIME_UPDATE', changedProperties);
  //   }

  //   // Render-relevante Änderungen
  //   if (this._isRenderRelevant(changedProperties)) {
  //     this._debug('EpgUpdateManager: Render-relevante Änderung erkannt');
  //     this.handleUpdate('RENDER_UPDATE', changedProperties);
  //   }
  // }

  // /**
  //  * Prüft ob sich ein Wert wirklich geändert hat
  //  */
  // _hasValueChanged(property, oldValue, newValue) {
  //   // Wenn beide undefined sind, keine Änderung
  //   if (oldValue === undefined && newValue === undefined) {
  //     return false;
  //   }

  //   // Wenn oldValue undefined ist, aber newValue nicht, ist es die erste Initialisierung
  //   // Das sollte als echte Änderung behandelt werden
  //   if (oldValue === undefined && newValue !== undefined) {
  //     return true;
  //   }

  //   // Wenn newValue undefined ist, aber oldValue nicht, ist es eine Änderung
  //   if (newValue === undefined && oldValue !== undefined) {
  //     return true;
  //   }

  //   // Arrays vergleichen
  //   if (Array.isArray(oldValue) && Array.isArray(newValue)) {
  //     if (oldValue.length !== newValue.length) return true;
  //     return !oldValue.every((item, index) => this._deepEqual(item, newValue[index]));
  //   }

  //   // Objekte vergleichen
  //   if (typeof oldValue === 'object' && typeof newValue === 'object') {
  //     return !this._deepEqual(oldValue, newValue);
  //   }

  //   // Primitive Werte vergleichen
  //   return oldValue !== newValue;
  // }

  // /**
  //  * Deep Clone für Objekte und Arrays
  //  */
  // _deepClone(value) {
  //   if (value === null || typeof value !== 'object') return value;
  //   if (Array.isArray(value)) return value.map(item => this._deepClone(item));
  //   return JSON.parse(JSON.stringify(value));
  // }

  // /**
  //  * Deep Equal Vergleich für Objekte und Arrays
  //  */
  // _deepEqual(a, b) {
  //   if (a === b) return true;
  //   if (a === null || b === null) return false;
  //   if (typeof a !== typeof b) return false;

  //   if (Array.isArray(a) && Array.isArray(b)) {
  //     if (a.length !== b.length) return false;
  //     return a.every((item, index) => this._deepEqual(item, b[index]));
  //   }

  //   if (typeof a === 'object') {
  //     const keysA = Object.keys(a);
  //     const keysB = Object.keys(b);
  //     if (keysA.length !== keysB.length) return false;
  //     return keysA.every(key => this._deepEqual(a[key], b[key]));
  //   }

  //   return false;
  // }

  // /**
  //  * Behandelt ENV-Updates
  //  */
  // _handleEnvUpdate(changedProperties) {
  //   this._debug('EpgUpdateManager: Verarbeite ENV-Update');

  //   // changedProperties ist ein Set, also holen wir die env-Werte aus der epgBox
  //   const realENVChanges = this._filterRealChanges(new Set(['env']));

  //   // ENV-Änderungen können Scale-Updates auslösen
  //   if (this._isUpdateRelevant(realENVChanges, ['env'])) {
  //     this._debug('EpgUpdateManager: ENV-Änderung löst Scale-Update aus');
  //     this._handleScaleUpdate(changedProperties);
  //   }

  //   this.epgBox.requestUpdate();
  //   return true;
  // }

  /**
   * Behandelt Scale-Updates
   */

  _triggerScaleCalculation(changedProperties) {
    this._debug('EpgUpdateManager: Scale! wird berechnet');
    const oldscale = this.epgBox.scale;
    // Berechne neuen Scale
    this.epgBox.scale = this.epgBox.scaleManager.calculateScale();

    this._debug('EpgUpdateManager: CSS-Variable --epg-scale gesetzt', {
      scale: this.epgBox.scale,
      oldscale: oldscale,
    });
    return false;
    // Entferne das Setzen auf programRow, damit die Vererbung funktioniert
  }
  /**
   * Behandelt Scale-Updates
   */

  _handleScaleCalculation(changedProperties) {
    this._debug('EpgUpdateManager: Verarbeite Scale!-Update', { scale: this.epgBox.scale });

    // Setze CSS-Variable für Scale (vermeidet Re-Rendering)
    const programBox = this.epgBox.shadowRoot?.querySelector('.programBox');
    if (programBox) {
      programBox.style.setProperty('--epg-scale', this.epgBox.scale);
    }
    // Entferne das Setzen auf programRow, damit die Vererbung funktioniert

    this._debug('EpgUpdateManager: scale! CSS-Variable --epg-scale gesetzt', {
      scale: this.epgBox.scale,
      programBoxCount: programBox ? 1 : 0,
    });
  }

  // /**
  //  * Behandelt Zeit-Updates
  //  */
  // _handleTimeUpdate(changedProperties) {
  //   this._debug('EpgUpdateManager: Verarbeite Zeit-Update');

  //   const now = Math.floor(Date.now() / 1000);
  //   const pastTime = this.epgBox.epgPastTime || 30;
  //   const futureTime = this.epgBox.epgShowFutureTime || 180;

  //   // Aktualisiere Zeit-Parameter
  //   this.epgBox._channelsParameters.minTime = now - pastTime * 60;
  //   this.epgBox._channelsParameters.maxTime = now + futureTime * 60;

  //   this._debug('EpgUpdateManager: Zeit-Parameter aktualisiert', {
  //     minTime: this.epgBox._channelsParameters.minTime,
  //     maxTime: this.epgBox._channelsParameters.maxTime,
  //   });

  //   // Benachrichtige DataManager
  //   this.epgBox.dataManager.onTimeParametersChanged();

  //   // Benachrichtige ScaleManager
  //   this.epgBox.scaleManager.onTimeParametersChanged();

  //   this.epgBox.requestUpdate();
  // }

  // /**
  //  * Behandelt Daten-Updates
  //  */
  // _handleDataUpdate(changedProperties) {
  //   this._debug('EpgUpdateManager: Verarbeite Daten-Update');

  //   // Verringere Update-Counter
  //   if (this.epgBox.isChannelUpdate > 0) {
  //     this.epgBox.isChannelUpdate--;

  //     // Aktualisiere Gap-Elemente
  //     this.epgBox.renderManager.updateGapItems();

  //     this._debug('EpgUpdateManager: Channel-Update abgeschlossen', {
  //       isChannelUpdate: this.epgBox.isChannelUpdate,
  //       isFirstLoad: this.epgBox.isFirstLoad,
  //     });

  //     // Prüfe ob erster Load abgeschlossen
  //     this.epgBox.testIsFirstLoadCompleteUpdated();
  //   }
  // }

  // /**
  //  * Behandelt Kanal-Updates
  //  */
  // _handleChannelUpdate(changedProperties) {
  //   this._debug('EpgUpdateManager: Verarbeite Kanal-Update');

  //   // Benachrichtige ChannelManager
  //   this.epgBox.channelManager.onChannelDataChanged();

  //   // Benachrichtige RenderManager
  //   this.epgBox.renderManager.onChannelDataChanged();

  //   this.epgBox.requestUpdate();
  // }

  // /**
  //  * Behandelt Render-Updates
  //  */
  // _handleRenderUpdate(changedProperties) {
  //   this._debug('EpgUpdateManager: Verarbeite Render-Update');

  //   // Benachrichtige RenderManager
  //   this.epgBox.renderManager.onRenderParametersChanged();

  //   this.epgBox.requestUpdate();
  // }

  // /**
  //  * Benachrichtigt über neue EPG-Daten
  //  */
  // onEpgDataReceived(teilEpg) {
  //   this._debug('EpgUpdateManager: Neue EPG-Daten empfangen');

  //   // Erhöhe Update-Counter
  //   this.epgBox.isChannelUpdate++;

  //   // Übergebe an DataManager
  //   this.epgBox.dataManager.addTeilEpg(teilEpg);

  //   // Benachrichtige über Daten-Update
  //   this.handleUpdate('DATA_UPDATE', new Set(['epgData']));
  // }

  // /**
  //  * Benachrichtigt über Kanal-Auswahl
  //  */
  // onChannelSelected(channel) {
  //   this._debug('EpgUpdateManager: Kanal ausgewählt');

  //   // Benachrichtige ChannelManager
  //   this.epgBox.channelManager.onChannelSelected(channel);

  //   // Benachrichtige RenderManager
  //   this.epgBox.renderManager.onChannelSelected(channel);
  // }

  // /**
  //  * Benachrichtigt über Programm-Auswahl
  //  */
  // onProgramSelected(program) {
  //   this._debug('EpgUpdateManager: Programm ausgewählt');

  //   // Benachrichtige RenderManager
  //   this.epgBox.renderManager.onProgramSelected(program);
  // }

  /**
   * Behandelt Timebar-Updates
   */
  _informMeAtViewChanges(changedProperties) {
    this._debug('EpgUpdateManager: Verarbeite View-Update', {
      properties: Array.from(changedProperties.keys()),
    });

    // Benachrichtige alle registrierten Observer
    if (this.epgBox.informMeAtViewChanges && this.epgBox.informMeAtViewChanges.length > 0) {
      this._debug('EpgUpdateManager: Benachrichtige registrierte Observer', {
        observerCount: this.epgBox.informMeAtViewChanges.length,
      });

      this.epgBox.informMeAtViewChanges.forEach(observer => {
        if (observer.callback && typeof observer.callback === 'function') {
          try {
            observer.callback(changedProperties);
            this._debug('EpgUpdateManager: Observer benachrichtigt', {
              observer: observer.me,
            });
          } catch (error) {
            this._debug('EpgUpdateManager: Fehler beim Benachrichtigen des Observers', {
              observer: observer.me,
              error: error.message,
            });
          }
        }
      });
    } else {
      this._debug('EpgUpdateManager: Keine registrierten Observer vorhanden');
    }
  }
}
