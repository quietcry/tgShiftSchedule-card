import { html, css } from 'lit';
import { CardBase } from './card-base.js';
import { TableView } from './views/table-view/table-view.js';
import { EPGView } from './views/epg-view/epg-view.js';
import { EnvSniffer } from './env-sniffer.js';
import { ExtendedConfigProcessor } from './tools/extended-config-processor.js';

export class CardImpl extends CardBase {
  static className = 'CardImpl';
  static get properties() {
    return {
      ...super.properties,
      config: { type: Object },
      hass: { type: Object },
      _view: { type: Object },
      _viewMode: { type: String },
      _viewType: { type: String },
      _envSniffer: { type: Object },
    };
  }

  static getConfigElement() {
    return document.createElement(`${this.cardRegname}-editor`);
  }

  static getStubConfig() {
    return {
      entity: 'sensor.vdr_vdr_epg_info',
      time_window: 'C',
      date: '',
      view_mode: 'epg',
      max_items: 10,
      show_channel: true,
      show_time: true,
      show_duration: true,
      show_title: true,
      show_description: true,
      show_channel_groups: false,
      test_template: '',
      epgShowPastTime: 60,
      epgShowFutureTime: 180,
      useDummyData: this.useDummyData === 'true',
    };
  }

  constructor() {
    super();
    this.debugMarker = 'CardImpl: ';
    this._debug(this.debugMarker + 'Modul wird geladen');
    this.config = this.getDefaultConfig();
    this._originalConfig = null; // Speichert die ursprüngliche ConfigEditor-Konfiguration

    // Extended Config Processor für bedingte Konfigurationen
    this._extendedConfigProcessor = new ExtendedConfigProcessor();
    this._lastProcessedEnv = null; // Für Caching der verarbeiteten Umgebung

    // Environment Observer Registry - Array mit Objekten die über Umgebungsänderungen informiert werden sollen
    this._environmentObserverClients = [];

    // EnvSniffer wird nur bei Bedarf initialisiert
    this._envSniffer = null;
    this.env = null;

    this._debug(this.debugMarker + 'Konstruktor: Initialisierung abgeschlossen');
  }

  /**
   * Initialisiert den EnvSniffer bei Bedarf
   */

  _initEnvSnifferIfNeeded() {
    if (!this._envSniffer) {
      this._debug(this.debugMarker + 'Initialisiere EnvSniffer bei Bedarf');
      this._envSniffer = new EnvSniffer(this);
      // Warte kurz und prüfe dann die Werte
      setTimeout(() => {
        if (this._envSniffer && this._envSniffer.env) {
          this.env = this._envSniffer.env;
          this._debug(this.debugMarker + 'EnvSniffer initialisiert', {
            env: this.env,
            cardWidth: this.env.cardWidth,
            typeOfView: this.env.typeOfView,
          });
        } else {
          this._debug(this.debugMarker + 'EnvSniffer konnte nicht initialisiert werden');
        }
      }, 100);
    }
  }
  _onProgscrollx(me, event) {
    this._debug(this.debugMarker + 'Progscrollx wird aufgerufen', {
      me: me,
      event: event,
    });
    return me !== event.originalTarget ? event.detail : false;
  }

  _onRegisterMeFor_Envchanges(immediately, me) {
    this._initEnvSnifferIfNeeded();
    if (immediately) {
      this._envSniffer.detectEnvironment();
    }
  }

  getDefaultConfig() {
    this._debug(this.debugMarker + 'getDefaultConfig wird aufgerufen');

    return {
      entity: '',
      time_window: 'C',
      date: '',
      max_items: 10,
      show_channel: true,
      show_time: true,
      show_duration: true,
      show_title: true,
      show_description: true,
      show_channel_groups: false,
      view_mode: 'epg',
      test_template: '',
      epgShowPastTime: 60,
      epgShowFutureTime: 180,
      blacklist: '',
      whitelist: '',
      importantlist: '',
      epgShowPastTime: 60, // Minuten für Rückblick
      epgShowFutureTime: 180, // Minuten sichtbar in der Ansicht
      useDummyData: this.useDummyData === 'true', // Verwende Dummy-Daten statt echte EPG-Daten (Build-Variable)
    };
  }

  setConfig(config) {
    this._debug(this.debugMarker + 'setConfig wird aufgerufen mit:', config);
    if (!config) {
      throw new Error('Keine Konfiguration vorhanden');
    }

    this._debug(this.debugMarker + 'Detaillierte Konfigurationsanalyse:', {
      configKeys: Object.keys(config),
      epgExtendConfig: config.epgExtendConfig,
      epgExtendConfigType: typeof config.epgExtendConfig,
      epgExtendConfigLength: config.epgExtendConfig?.length,
      epgExtendConfigContent: config.epgExtendConfig?.substring(0, 100), // Erste 100 Zeichen
    });

    this.config = {
      ...this.getDefaultConfig(),
      ...config,
    };

    // Ursprüngliche Konfiguration für erweiterte Konfiguration speichern
    this._originalConfig = { ...this.config };

    this._debug(this.debugMarker + 'config nach setConfig:', this.config);
    this._debug(this.debugMarker + 'Spezifische EPG-Werte', {
      epgShowPastTime: this.config.epgShowPastTime,
      epgShowFutureTime: this.config.epgShowFutureTime,
      configKeys: Object.keys(this.config),
    });

    // EnvSniffer initialisieren für erweiterte Konfiguration
    this._initEnvSnifferIfNeeded();

    // Erweiterte Konfiguration verarbeiten falls vorhanden
    // Wird nach EnvSniffer-Initialisierung aufgerufen
    setTimeout(() => {
      this._processExtendedConfig();
    }, 100);

    // View initialisieren
    this._debug(this.debugMarker + 'setConfig: Initialisiere EPG-View');
    this._viewMode = this.config.view_mode || 'epg';
    this._viewType = 'EPGView';

    try {
      this._view = new EPGView();
      this._debug(this.debugMarker + 'Übergebe Konfiguration an EPG-View', {
        epgShowPastTime: this.config.epgShowPastTime,
        epgShowFutureTime: this.config.epgShowFutureTime,
      });
      this._view.config = this.config;
      // env wird über Event-System übertragen

      // Übergebe hass an die View, falls es bereits gesetzt wurde
      if (this._hass) {
        this._debug(this.debugMarker + 'setConfig: Übergebe gespeicherten hass an EPG-View');
        this._view.hass = this._hass;
      }

      this._debug(this.debugMarker + 'setConfig: View initialisiert:', {
        viewMode: this._viewMode,
        viewType: this._viewType,
        config: this.config,
        // env: this.env, // Nicht mehr nötig
      });

      // Event-Listener für EnvSniffer-Änderungen hinzufügen
      this._setupEnvChangeListener();
    } catch (error) {
      this._debug(this.debugMarker + 'setConfig: Fehler bei View-Initialisierung:', error);
      throw new Error(`Fehler bei der View-Initialisierung: ${error.message}`);
    }
  }

  /**
   * Verarbeitet die erweiterte Konfiguration mit bedingten Einstellungen
   * Wird aufgerufen bei setConfig und bei Umgebungsänderungen
   */
  _processExtendedConfig() {
    if (!this.config.epgExtendConfig) {
      this._debug(this.debugMarker + 'extendedConfig nicht gesetzt');
      // return;
    }
    const extendedConfig = this.config.epgExtendConfig || '';
    const env = this._getEnvironmentVariables();

    this._debug(this.debugMarker + 'Verarbeite erweiterte Konfiguration', {
      env,
      epgExtendConfig: extendedConfig,
      epgExtendConfigType: typeof extendedConfig,
      epgExtendConfigLength: this.config.epgExtendConfig?.length,
    });

    this.config = this._extendedConfigProcessor.processConfig(
      this._originalConfig || this.config, // Verwende immer die ursprüngliche Konfiguration
      extendedConfig,
      env
    );

    this._lastProcessedEnv = env;
    this._debug(this.debugMarker + 'Erweiterte Konfiguration verarbeitet', { config: this.config });
  }

  /**
   * Sammelt die aktuellen Umgebungsvariablen für die erweiterte Konfiguration
   * @returns {Object} Umgebungsvariablen
   */
  _getEnvironmentVariables() {
    const result = {};

    // Hole immer die aktuellen Werte vom EnvSniffer
    const currentEnv = this._envSniffer?.env || this.env || {};

    // Durchlaufe alle Properties von currentEnv
    for (const [key, value] of Object.entries(currentEnv)) {
      // Entferne 'envSniffer' Präfix falls vorhanden und mache ersten Buchstaben klein
      const cleanKey = key.replace('envSniffer', '');
      const finalKey = cleanKey.charAt(0).toLowerCase() + cleanKey.slice(1);
      result[finalKey] = value;
    }

    return result;
  }

  _handle_envchangesFromEvent(eventdata) {
    this._debug(this.debugMarker + 'Env-Änderungen erkannt, verarbeite erweiterte Konfiguration');
    this._processExtendedConfig();
    if (this._view) {
      this._view.dispatchEvent(
        new CustomEvent('config-changed', {
          detail: { config: this.config },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  /**
   * Richtet den Event-Listener für EnvSniffer-Änderungen ein
   */
  _setupEnvChangeListener() {
    // Event-Listener für EnvSniffer-Änderungen
    this.addEventListener('envchanges-event', event => {
      this._debug(this.debugMarker + 'Env-Änderungen erkannt, synchronisiere Umgebungsvariablen');

      // this.env mit den neuen Werten vom EnvSniffer synchronisieren
      if (this._envSniffer && this._envSniffer.env) {
        this.env = this._envSniffer.env;
        this._debug(this.debugMarker + 'this.env aktualisiert', { env: this.env });
      }

      this._debug(
        this.debugMarker +
          'Verarbeite erweiterte Konfiguration mit aktualisierten Umgebungsvariablen'
      );
      this._processExtendedConfig();

      // View über aktualisierte Konfiguration informieren
      if (this._view) {
        this._view.dispatchEvent(
          new CustomEvent('config-changed', {
            detail: { config: this.config },
            bubbles: true,
            composed: true,
          })
        );
      }
    });
  }

  set hass(hass) {
    this._debug(this.debugMarker + 'set hass wird aufgerufen', { hass: hass });
    this._hass = hass;
    if (this._envSniffer && hass && hass?.user?.name) {
      this._envSniffer.setEnvVariables({ user: hass.user.name });
    }
    if (this._view) {
      this._view.hass = hass;
    } else {
      this._debug(
        this.debugMarker + 'set hass: View noch nicht initialisiert, speichere hass für später'
      );
    }
  }

  get hass() {
    return this._hass;
  }

  firstUpdated() {
    this._debug(this.debugMarker + 'firstUpdated wird aufgerufen');
    if (this._view) {
      this._view.firstUpdated();
    }
    this._subscribeChangeNotifys('envChanges');
    this._debug(this.debugMarker + 'firstUpdated abgeschlossen');
  }

  render() {
    if (!this._view) {
      return html`<div class="error">Keine View verfügbar</div>`;
    }

    try {
      return this._view;
    } catch (error) {
      this._debug(this.debugMarker + 'render: Fehler beim Rendern der View:', error);
      return html`<div class="error">Fehler beim Rendern: ${error.message}</div>`;
    }
  }

  static get styles() {
    return [
      CardBase.styles,
      EPGView.styles,
      css`
        :host {
          display: block;
        }

        ha-card {
          padding: 16px;
        }

        .loading {
          text-align: center;
          padding: 20px;
          color: var(--secondary-text-color);
        }

        .error {
          text-align: center;
          padding: 20px;
          color: var(--error-color);
        }
      `,
    ];
  }
}
