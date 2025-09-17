import { html, css } from 'lit';
import { CardBase } from './card-base.js';
import { TableView } from './views/table-view/table-view.js';
import { EPGView } from './views/epg-view/epg-view.js';
import { EnvSniffer } from './env-sniffer.js';
import { ExtendedConfigProcessor } from './tools/extended-config-processor.js';
import { CardName, CardRegname, DebugMode, UseDummyData } from './card-config.js';

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
    return document.createElement(`${CardRegname}-editor`);
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
      useDummyData: UseDummyData === 'true',
    };
  }

  constructor() {
    super();
    this._debug(`CardImpl-Modul wird geladen`);
    this.config = this.getDefaultConfig();

    // Environment Observer Registry - Array mit Objekten die über Umgebungsänderungen informiert werden sollen
    this._environmentObserverClients = [];

    // EnvSniffer wird nur bei Bedarf initialisiert
    this._envSniffer = null;
    this.env = null;

    this._debug('CardImpl-Konstruktor: Initialisierung abgeschlossen');
  }

  /**
   * Initialisiert den EnvSniffer bei Bedarf
   */

  _initEnvSnifferIfNeeded() {
    if (!this._envSniffer) {
      this._debug('Initialisiere EnvSniffer bei Bedarf');
      this._envSniffer = new EnvSniffer(this);
      this._setupEnvChangeListener();

      // Warte kurz und prüfe dann die Werte
      setTimeout(() => {
        if (this._envSniffer && this._envSniffer.env) {
          this.env = this._envSniffer.env;
          this._debug('EnvSniffer initialisiert', {
            env: this.env,
            cardWidth: this.env.cardWidth,
            typeOfView: this.env.typeOfView,
          });
        } else {
          this._debug('EnvSniffer initialisiert, aber env noch nicht verfügbar');
        }
      }, 50);
    }
  }

  _setupEnvChangeListener() {
    this.addEventListener('envchanges-event', event => {
      this._debug('CardImpl: Environment-Änderung empfangen', event.detail);
      this.env = this._envSniffer.env;

      // Erweiterte Konfiguration neu verarbeiten bei Environment-Änderungen
      if (this.config && this.config.epgExtendConfig) {
        this._processExtendedConfig();
      }
    });
  }
  _onProgscrollx(me, event) {
    this._debug('Progscrollx wird aufgerufen', {
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

  _processExtendedConfig() {
    if (!this.config.epgExtendConfig || this.config.epgExtendConfig.trim() === '') {
      this._debug('CardImpl: Keine erweiterte Konfiguration vorhanden');
      return;
    }

    // Stelle sicher, dass this.env verfügbar ist
    if (!this.env) {
      this._debug('CardImpl: this.env nicht verfügbar, initialisiere EnvSniffer');
      this._initEnvSnifferIfNeeded();
      // Kurz warten, damit env verfügbar wird
      setTimeout(() => {
        this._processExtendedConfig();
      }, 100);
      return;
    }

    this._debug('CardImpl: Verarbeite erweiterte Konfiguration', {
      epgExtendConfig: this.config.epgExtendConfig,
      env: this.env,
    });

    try {
      const processor = new ExtendedConfigProcessor();
      const originalConfig = { ...this.config };

      this.config = processor.processConfig(originalConfig, this.config.epgExtendConfig, this.env);

      this._debug('CardImpl: Erweiterte Konfiguration verarbeitet', {
        originalKeys: Object.keys(originalConfig),
        newKeys: Object.keys(this.config),
      });
    } catch (error) {
      this._debug('CardImpl: Fehler bei erweiterter Konfiguration', { error: error.message });
    }
  }

  getDefaultConfig() {
    this._debug(`CardImpl getDefaultConfig wird aufgerufen`);

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
      epgExtendConfig: '', // Erweiterte Konfiguration
      useDummyData: UseDummyData === 'true', // Verwende Dummy-Daten statt echte EPG-Daten (Build-Variable)
    };
  }

  setConfig(config) {
    this._debug('setConfig wird aufgerufen mit:', config);
    if (!config) {
      throw new Error('Keine Konfiguration vorhanden');
    }

    this.config = {
      ...this.getDefaultConfig(),
      ...config,
    };

    // Erweiterte Konfiguration verarbeiten
    this._processExtendedConfig();

    this._debug('config nach setConfig:', this.config);
    this._debug('Spezifische EPG-Werte', {
      epgShowPastTime: this.config.epgShowPastTime,
      epgShowFutureTime: this.config.epgShowFutureTime,
      configKeys: Object.keys(this.config),
    });

    // View initialisieren
    this._debug('setConfig: Initialisiere EPG-View');
    this._viewMode = this.config.view_mode || 'epg';
    this._viewType = 'EPGView';

    try {
      this._view = new EPGView();
      this._debug('Übergebe Konfiguration an EPG-View', {
        epgShowPastTime: this.config.epgShowPastTime,
        epgShowFutureTime: this.config.epgShowFutureTime,
      });
      this._view.config = this.config;
      // env wird über Event-System übertragen

      // Übergebe hass an die View, falls es bereits gesetzt wurde
      if (this._hass) {
        this._debug('setConfig: Übergebe gespeicherten hass an EPG-View');
        this._view.hass = this._hass;
      }

      this._debug('setConfig: View initialisiert:', {
        viewMode: this._viewMode,
        viewType: this._viewType,
        config: this.config,
        // env: this.env, // Nicht mehr nötig
      });
    } catch (error) {
      this._debug('setConfig: Fehler bei View-Initialisierung:', error);
      throw new Error(`Fehler bei der View-Initialisierung: ${error.message}`);
    }
  }

  set hass(hass) {
    // this._debug('set hass wird aufgerufen');
    this._hass = hass;
    if (this._view) {
      this._view.hass = hass;
    } else {
      this._debug('set hass: View noch nicht initialisiert, speichere hass für später');
    }
  }

  get hass() {
    return this._hass;
  }

  firstUpdated() {
    this._debug('firstUpdated wird aufgerufen');
    if (this._view) {
      this._view.firstUpdated();
    }
    this._debug('firstUpdated abgeschlossen');
  }

  render() {
    if (!this._view) {
      return html`<div class="error">Keine View verfügbar</div>`;
    }

    try {
      return this._view;
    } catch (error) {
      this._debug('render: Fehler beim Rendern der View:', error);
      return html`<div class="error">Fehler beim Rendern: ${error.message}</div>`;
    }
  }

  static styles = [
    super.styles,
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
