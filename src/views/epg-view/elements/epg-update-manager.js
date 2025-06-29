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
    this._debug('EpgUpdateManager initialisiert');
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
   * Behandelt Property-Änderungen
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