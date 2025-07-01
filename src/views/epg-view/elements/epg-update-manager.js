import { CardName, DebugMode } from '../../../card-config.js';
import { TgCardHelper } from '../../../tools/tg-card-helper.js';

/**
 * EPG Update Manager
 * Zentrale Verwaltung aller Updates und deren Weitergabe an die entsprechenden Manager
 */
export class EpgUpdateManager {
  static className = 'EpgUpdateManager';

  constructor(epgBox) {
    this.epgBox = epgBox;
    this.tgCardHelper = new TgCardHelper(CardName, DebugMode);

    // ===== WERT-TRACKING =====
    // Dynamisches Map für die letzten bekannten Werte
    // Wird nur bei Bedarf mit Properties gefüllt
    this._lastValues = new Map();

    this._debug('EpgUpdateManager initialisiert');
  }

  _debug(message, data = null) {
    this.tgCardHelper._debug(this.constructor.className, message, data);
  }

  /**
   * Filtert nur echte Änderungen heraus und speichert sie in _lastValues
   * @param {Set|Map|Object} changedProperties - Geänderte Properties (Set, Map oder Object)
   * @returns {Set} - Nur Properties mit echten Änderungen
   */
  _filterRealChanges(changedProperties) {
    const realChanges = new Set();

    // Null-Check für undefined oder null
    if (!changedProperties) {
      this._debug('EpgUpdateManager: changedProperties ist undefined/null');
      return realChanges;
    }

    // Prüfe den Typ von changedProperties
    if (changedProperties instanceof Set) {
      // Set: Einfache Property-Namen ohne Werte
      for (const property of changedProperties) {
        // Hole die aktuellen Werte aus der epgBox
        const newValue = this.epgBox[property];
        const oldValue = this._lastValues.get(property);

        if (this._hasValueChanged(property, oldValue, newValue)) {
          this._debug('EpgUpdateManager: Echte Änderung erkannt (Set)', {
            property,
            oldValue,
            newValue,
          });
          this._lastValues.set(property, this._deepClone(newValue));
          realChanges.add(property);
        } else {
          this._debug('EpgUpdateManager: Keine echte Änderung (Set)', {
            property,
            oldValue,
            newValue,
          });
        }
      }
    } else if (changedProperties instanceof Map) {
      // Map: Property-Namen mit zugehörigen Werten
      for (const [property, newValue] of changedProperties) {
        const oldValue = this._lastValues.get(property);

        if (this._hasValueChanged(property, oldValue, newValue)) {
          this._debug('EpgUpdateManager: Echte Änderung erkannt (Map)', {
            property,
            oldValue,
            newValue,
          });
          this._lastValues.set(property, this._deepClone(newValue));
          realChanges.add(property);
        } else {
          this._debug('EpgUpdateManager: Keine echte Änderung (Map)', {
            property,
            oldValue,
            newValue,
          });
        }
      }
    } else {
      // Fallback: Behandle als Object
      for (const [property, newValue] of Object.entries(changedProperties)) {
        const oldValue = this._lastValues.get(property);

        if (this._hasValueChanged(property, oldValue, newValue)) {
          this._debug('EpgUpdateManager: Echte Änderung erkannt (Object)', {
            property,
            oldValue,
            newValue,
          });
          this._lastValues.set(property, this._deepClone(newValue));
          realChanges.add(property);
        } else {
          this._debug('EpgUpdateManager: Keine echte Änderung (Object)', {
            property,
            oldValue,
            newValue,
          });
        }
      }
    }

    return realChanges;
  }

  /**
   * Zentrale Update-Funktion - wird für alle Änderungen aufgerufen
   * @param {string} changeType - Art der Änderung
   * @param {Object} changedProperties - Geänderte Properties
   * @param {any} newValue - Neuer Wert (optional)
   */
  handleUpdate(changeType, changedProperties, newValue = null) {
    // Filtere nur echte Änderungen heraus
    const realChanges = this._filterRealChanges(changedProperties);

    this._debug('EpgUpdateManager: Update empfangen', {
      changeType,
      changedProperties,
      allChangedProperties: Array.from(changedProperties.keys()),
      realChanges: Array.from(realChanges.keys()),
      newValue,
    });

    // Nur weiterverarbeiten, wenn es echte Änderungen gibt
    if (realChanges.size === 0) {
      this._debug('EpgUpdateManager: Keine echten Änderungen, ignoriere Update');
      return;
    }

    let exclusive = false;
    // Verarbeite verschiedene Update-Typen basierend auf den geänderten Properties
    if (!exclusive && this._isUpdateRelevant(realChanges, ['env'])) {
      this._debug('EpgUpdateManager: ENV Update erkannt');
      exclusive = this._handleEnvUpdate(realChanges);
    }

    if (!exclusive && this._isUpdateRelevant(realChanges, ['epgPastTime', 'epgShowFutureTime'])) {
      this._debug('EpgUpdateManager: Zeit-relevante Änderung erkannt');
      exclusive = this._handleTimeUpdate(realChanges);
    }

    if (
      !exclusive &&
      this._isUpdateRelevant(realChanges, ['showChannelGroups', 'showShortText', 'channelWidth'])
    ) {
      this._debug('EpgUpdateManager: Render-relevante Änderung erkannt');
      this._handleRenderUpdate(realChanges);
    }

    // Spezielle Behandlung für env-Änderungen
    if (realChanges.has('env')) {
      this._debug('EpgUpdateManager: ENV-Änderung erkannt');
      this._handleEnvUpdate(realChanges);
    }
  }

  /**
   * Behandelt Property-Änderungen (bereits gefiltert für echte Änderungen)
   */
  _handlePropertyChange(changedProperties) {
    this._debug('EpgUpdateManager: Verarbeite Property-Änderungen', {
      properties: Array.from(changedProperties.keys()),
    });

    // Channel-Order Änderungen
    if (changedProperties.has('channelOrder')) {
      this._debug('EpgUpdateManager: Channel-Order geändert');
      this.epgBox._channelOrderInitialized = false;
      this.epgBox.channelManager.initializeChannelOrder();
      this.epgBox.requestUpdate();
    }

    // Scale-relevante Änderungen
    if (this._isScaleRelevant(changedProperties)) {
      this._debug('EpgUpdateManager: Scale-relevante Änderung erkannt');
      this.handleUpdate('SCALE_UPDATE', changedProperties);
    }

    // Zeit-relevante Änderungen
    if (this._isTimeRelevant(changedProperties)) {
      this._debug('EpgUpdateManager: Zeit-relevante Änderung erkannt');
      this.handleUpdate('TIME_UPDATE', changedProperties);
    }

    // Render-relevante Änderungen
    if (this._isRenderRelevant(changedProperties)) {
      this._debug('EpgUpdateManager: Render-relevante Änderung erkannt');
      this.handleUpdate('RENDER_UPDATE', changedProperties);
    }
  }

  /**
   * Prüft ob sich ein Wert wirklich geändert hat
   */
  _hasValueChanged(property, oldValue, newValue) {
    // Wenn beide undefined sind, keine Änderung
    if (oldValue === undefined && newValue === undefined) {
      return false;
    }

    // Wenn oldValue undefined ist, aber newValue nicht, ist es die erste Initialisierung
    // Das sollte als echte Änderung behandelt werden
    if (oldValue === undefined && newValue !== undefined) {
      return true;
    }

    // Wenn newValue undefined ist, aber oldValue nicht, ist es eine Änderung
    if (newValue === undefined && oldValue !== undefined) {
      return true;
    }

    // Arrays vergleichen
    if (Array.isArray(oldValue) && Array.isArray(newValue)) {
      if (oldValue.length !== newValue.length) return true;
      return !oldValue.every((item, index) => this._deepEqual(item, newValue[index]));
    }

    // Objekte vergleichen
    if (typeof oldValue === 'object' && typeof newValue === 'object') {
      return !this._deepEqual(oldValue, newValue);
    }

    // Primitive Werte vergleichen
    return oldValue !== newValue;
  }

  /**
   * Deep Clone für Objekte und Arrays
   */
  _deepClone(value) {
    if (value === null || typeof value !== 'object') return value;
    if (Array.isArray(value)) return value.map(item => this._deepClone(item));
    return JSON.parse(JSON.stringify(value));
  }

  /**
   * Deep Equal Vergleich für Objekte und Arrays
   */
  _deepEqual(a, b) {
    if (a === b) return true;
    if (a === null || b === null) return false;
    if (typeof a !== typeof b) return false;

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((item, index) => this._deepEqual(item, b[index]));
    }

    if (typeof a === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      return keysA.every(key => this._deepEqual(a[key], b[key]));
    }

    return false;
  }

  /**
   * Behandelt ENV-Updates
   */
  _handleEnvUpdate(changedProperties) {
    this._debug('EpgUpdateManager: Verarbeite ENV-Update');

    // changedProperties ist ein Set, also holen wir die env-Werte aus der epgBox
    const realENVChanges = this._filterRealChanges(new Set(['env']));

    // ENV-Änderungen können Scale-Updates auslösen
    if (this._isUpdateRelevant(realENVChanges, ['env'])) {
      this._debug('EpgUpdateManager: ENV-Änderung löst Scale-Update aus');
      this._handleScaleUpdate(changedProperties);
    }

    this.epgBox.requestUpdate();
    return true;
  }

  /**
   * Behandelt Scale-Updates
   */
  _handleScaleUpdate(changedProperties) {
    this._debug('EpgUpdateManager: Verarbeite Scale-Update');

    // Berechne neuen Scale
    this.epgBox.scale = this.epgBox.scaleManager.calculateScale();

    // Benachrichtige abhängige Manager
    //this.epgBox.renderManager.onScaleChanged(this.epgBox.scale);

    // Time Marker aktualisieren (falls vorhanden)
    const timeMarker = this.epgBox.shadowRoot?.querySelector('epg-time-marker');
    if (timeMarker) {
      timeMarker.scale = this.epgBox.scale;
    }

    this.epgBox.requestUpdate();
    return true;
  }

  /**
   * Behandelt Zeit-Updates
   */
  _handleTimeUpdate(changedProperties) {
    this._debug('EpgUpdateManager: Verarbeite Zeit-Update');

    const now = Math.floor(Date.now() / 1000);
    const pastTime = this.epgBox.epgPastTime || 30;
    const futureTime = this.epgBox.epgShowFutureTime || 180;

    // Aktualisiere Zeit-Parameter
    this.epgBox._channelsParameters.minTime = now - pastTime * 60;
    this.epgBox._channelsParameters.maxTime = now + futureTime * 60;

    this._debug('EpgUpdateManager: Zeit-Parameter aktualisiert', {
      minTime: this.epgBox._channelsParameters.minTime,
      maxTime: this.epgBox._channelsParameters.maxTime,
    });

    // Benachrichtige DataManager
    this.epgBox.dataManager.onTimeParametersChanged();

    // Benachrichtige ScaleManager
    this.epgBox.scaleManager.onTimeParametersChanged();

    this.epgBox.requestUpdate();
  }

  /**
   * Behandelt Daten-Updates
   */
  _handleDataUpdate(changedProperties) {
    this._debug('EpgUpdateManager: Verarbeite Daten-Update');

    // Verringere Update-Counter
    if (this.epgBox.isChannelUpdate > 0) {
      this.epgBox.isChannelUpdate--;

      // Aktualisiere Gap-Elemente
      this.epgBox.renderManager.updateGapItems();

      this._debug('EpgUpdateManager: Channel-Update abgeschlossen', {
        isChannelUpdate: this.epgBox.isChannelUpdate,
        isFirstLoad: this.epgBox.isFirstLoad,
      });

      // Prüfe ob erster Load abgeschlossen
      this.epgBox.testIsFirstLoadCompleteUpdated();
    }
  }

  /**
   * Behandelt Kanal-Updates
   */
  _handleChannelUpdate(changedProperties) {
    this._debug('EpgUpdateManager: Verarbeite Kanal-Update');

    // Benachrichtige ChannelManager
    this.epgBox.channelManager.onChannelDataChanged();

    // Benachrichtige RenderManager
    this.epgBox.renderManager.onChannelDataChanged();

    this.epgBox.requestUpdate();
  }

  /**
   * Behandelt Render-Updates
   */
  _handleRenderUpdate(changedProperties) {
    this._debug('EpgUpdateManager: Verarbeite Render-Update');

    // Benachrichtige RenderManager
    this.epgBox.renderManager.onRenderParametersChanged();

    this.epgBox.requestUpdate();
  }

  /**
   * Prüft ob Änderungen für einen bestimmten Update-Typ relevant sind
   */
  _isUpdateRelevant(changedProperties, relevantProps = []) {
    return relevantProps.some(prop => changedProperties.has(prop));
  }

  /**
   * Benachrichtigt über neue EPG-Daten
   */
  onEpgDataReceived(teilEpg) {
    this._debug('EpgUpdateManager: Neue EPG-Daten empfangen');

    // Erhöhe Update-Counter
    this.epgBox.isChannelUpdate++;

    // Übergebe an DataManager
    this.epgBox.dataManager.addTeilEpg(teilEpg);

    // Benachrichtige über Daten-Update
    this.handleUpdate('DATA_UPDATE', new Set(['epgData']));
  }

  /**
   * Benachrichtigt über Kanal-Auswahl
   */
  onChannelSelected(channel) {
    this._debug('EpgUpdateManager: Kanal ausgewählt');

    // Benachrichtige ChannelManager
    this.epgBox.channelManager.onChannelSelected(channel);

    // Benachrichtige RenderManager
    this.epgBox.renderManager.onChannelSelected(channel);
  }

  /**
   * Benachrichtigt über Programm-Auswahl
   */
  onProgramSelected(program) {
    this._debug('EpgUpdateManager: Programm ausgewählt');

    // Benachrichtige RenderManager
    this.epgBox.renderManager.onProgramSelected(program);
  }
}
