import { CardName, DebugMode } from '../../card-config.js';
import { TgCardHelper } from '../../tools/tg-card-helper.js';

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
    // Speichert die letzten bekannten Werte für Änderungsprüfung
    this._lastValues = {
      // Scale-relevante Werte
      env: null,
      epgShowFutureTime: null,
      epgShowPastTime: null,
      epgShowWidth: null,

      // Zeit-relevante Werte
      epgPastTime: null,
      epgShowFutureTime: null, // Doppelt, da sowohl Scale als auch Zeit relevant

      // Render-relevante Werte
      showChannelGroups: null,
      showShortText: null,
      channelWidth: null,

      // Channel-relevante Werte
      channelOrder: null,

      // Container-Werte
      containerWidth: null,
    };

    this._debug('EpgUpdateManager initialisiert');
  }

  /**
   * Initialisiert die gespeicherten Werte mit den aktuellen Werten der epgBox
   * Sollte beim ersten Aufruf von handleUpdate aufgerufen werden
   */
  _initializeValues() {
    if (this._lastValues.env === null) {
      this._debug('EpgUpdateManager: Initialisiere gespeicherte Werte');

      // Lade alle aktuellen Werte
      Object.keys(this._lastValues).forEach(property => {
        if (this.epgBox.hasOwnProperty(property)) {
          this._lastValues[property] = this._deepClone(this.epgBox[property]);
        }
      });

      this._debug('EpgUpdateManager: Werte initialisiert', this._lastValues);
    }
  }

  _debug(message, data = null) {
    this.tgCardHelper._debug(this.constructor.className, message, data);
  }

  /**
   * Zentrale Update-Funktion - wird für alle Änderungen aufgerufen
   * @param {string} changeType - Art der Änderung
   * @param {Object} changedProperties - Geänderte Properties
   * @param {any} newValue - Neuer Wert (optional)
   */
  handleUpdate(changeType, changedProperties, newValue = null) {
    // Initialisiere Werte beim ersten Aufruf
    this._initializeValues();

    this._debug('EpgUpdateManager: Update empfangen', {
      changeType,
      changedProperties: Array.from(changedProperties.keys()),
      newValue,
    });

    switch (changeType) {
      case 'PROPERTY_CHANGE':
        this._handlePropertyChange(changedProperties);
        break;
      case 'DATA_UPDATE':
        this._handleDataUpdate(changedProperties);
        break;
      case 'SCALE_UPDATE':
        this._handleScaleUpdate(changedProperties);
        break;
      case 'TIME_UPDATE':
        this._handleTimeUpdate(changedProperties);
        break;
      case 'CHANNEL_UPDATE':
        this._handleChannelUpdate(changedProperties);
        break;
      case 'RENDER_UPDATE':
        this._handleRenderUpdate(changedProperties);
        break;
      default:
        this._debug('EpgUpdateManager: Unbekannter Update-Typ', changeType);
    }
  }

  /**
   * Behandelt Property-Änderungen mit Änderungsprüfung
   */
  _handlePropertyChange(changedProperties) {
    this._debug('EpgUpdateManager: Verarbeite Property-Änderungen', {
      properties: Array.from(changedProperties.keys()),
    });

    // Sammle alle echten Änderungen
    const realChanges = new Set();

    // Prüfe jede geänderte Property auf echte Änderung
    for (const property of changedProperties) {
      const newValue = this.epgBox[property];
      const oldValue = this._lastValues[property];

      if (this._hasValueChanged(property, oldValue, newValue)) {
        this._debug('EpgUpdateManager: Echte Änderung erkannt', {
          property,
          oldValue,
          newValue,
        });

        // Aktualisiere den gespeicherten Wert
        this._lastValues[property] = this._deepClone(newValue);
        realChanges.add(property);
      } else {
        this._debug('EpgUpdateManager: Keine echte Änderung', {
          property,
          oldValue,
          newValue,
        });
      }
    }

    // Nur bei echten Änderungen weiterverarbeiten
    if (realChanges.size > 0) {
      this._debug('EpgUpdateManager: Verarbeite echte Änderungen', {
        realChanges: Array.from(realChanges),
      });

      // Channel-Order Änderungen
      if (realChanges.has('channelOrder')) {
        this._debug('EpgUpdateManager: Channel-Order geändert');
        this.epgBox._channelOrderInitialized = false;
        this.epgBox.channelManager.initializeChannelOrder();
        this.epgBox.requestUpdate();
      }

      // Scale-relevante Änderungen
      if (this._isScaleRelevant(realChanges)) {
        this._debug('EpgUpdateManager: Scale-relevante Änderung erkannt');
        this.handleUpdate('SCALE_UPDATE', realChanges);
      }

      // Zeit-relevante Änderungen
      if (this._isTimeRelevant(realChanges)) {
        this._debug('EpgUpdateManager: Zeit-relevante Änderung erkannt');
        this.handleUpdate('TIME_UPDATE', realChanges);
      }

      // Render-relevante Änderungen
      if (this._isRenderRelevant(realChanges)) {
        this._debug('EpgUpdateManager: Render-relevante Änderung erkannt');
        this.handleUpdate('RENDER_UPDATE', realChanges);
      }
    } else {
      this._debug('EpgUpdateManager: Keine echten Änderungen, überspringe Verarbeitung');
    }
  }

  /**
   * Prüft ob sich ein Wert wirklich geändert hat
   */
  _hasValueChanged(property, oldValue, newValue) {
    // Spezielle Behandlung für verschiedene Datentypen
    if (oldValue === null && newValue === null) return false;
    if (oldValue === null || newValue === null) return true;

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
   * Behandelt Scale-Updates
   */
  _handleScaleUpdate(changedProperties) {
    this._debug('EpgUpdateManager: Verarbeite Scale-Update');

    // Berechne neuen Scale
    this.epgBox.scale = this.epgBox.scaleManager.calculateScale();

    // Benachrichtige abhängige Manager
    this.epgBox.renderManager.onScaleChanged(this.epgBox.scale);

    // Time Marker aktualisieren (falls vorhanden)
    const timeMarker = this.epgBox.shadowRoot?.querySelector('epg-time-marker');
    if (timeMarker) {
      timeMarker.scale = this.epgBox.scale;
    }

    this.epgBox.requestUpdate();
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
    this.epgBox._channelsParameters.minTime = now - (pastTime * 60);
    this.epgBox._channelsParameters.maxTime = now + (futureTime * 60);

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
   * Prüft ob Änderungen Scale-relevant sind
   */
  _isScaleRelevant(changedProperties) {
    const scaleRelevantProps = ['env', 'epgShowFutureTime', 'epgShowPastTime', 'epgShowWidth'];
    return scaleRelevantProps.some(prop => changedProperties.has(prop));
  }

  /**
   * Prüft ob Änderungen Zeit-relevant sind
   */
  _isTimeRelevant(changedProperties) {
    const timeRelevantProps = ['epgPastTime', 'epgShowFutureTime'];
    return timeRelevantProps.some(prop => changedProperties.has(prop));
  }

  /**
   * Prüft ob Änderungen Render-relevant sind
   */
  _isRenderRelevant(changedProperties) {
    const renderRelevantProps = ['showChannelGroups', 'showShortText', 'channelWidth'];
    return renderRelevantProps.some(prop => changedProperties.has(prop));
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