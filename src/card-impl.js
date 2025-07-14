import { html, css } from 'lit';
import { CardBase } from './card-base.js';
import { TableView } from './views/table-view/table-view.js';
import { EPGView } from './views/epg-view/epg-view.js';
import { EnvSniffer } from './env-sniffer.js';
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

    // Event-Listener für Environment-Requests von der epg-box
    this.addEventListener('request-environment', this._handleEnvironmentRequest.bind(this));
    
    // Event-Listener für Environment Observer Registrierungen
    this.addEventListener('register-observer-client', this._handleObserverClientRegistration.bind(this));

    this._debug('CardImpl-Konstruktor: Initialisierung abgeschlossen');
  }

  /**
   * Initialisiert den EnvSniffer bei Bedarf
   */
  _initEnvSnifferIfNeeded() {
    if (!this._envSniffer) {
      this._debug('CardImpl: Initialisiere EnvSniffer bei Bedarf');
    this._envSniffer = new EnvSniffer();
    this._envSniffer.init(this);
      
      // Warte kurz und prüfe dann die Werte
      setTimeout(() => {
        if (this._envSniffer && this._envSniffer.env) {
    this.env = this._envSniffer.env;
          this._debug('CardImpl: EnvSniffer initialisiert', {
            env: this.env,
            cardWidth: this.env.cardWidth,
            typeOfView: this.env.typeOfView,
          });
        } else {
          this._debug('CardImpl: EnvSniffer initialisiert, aber env noch nicht verfügbar');
        }
      }, 50);
      
    this._envSniffer.addEventListener(
      'environment-changed',
      this._handleEnvironmentChange.bind(this)
    );
    }
  }

  /**
   * Behandelt Environment-Requests 
   */
  _handleEnvironmentRequest(event) {
    this._debug('[_handleEnvironmentRequest()]: Environment-Request erhalten', event);

    // Initialisiere EnvSniffer bei Bedarf
    this._initEnvSnifferIfNeeded();

    // Stößt den EnvSniffer nochmal an
    this._envSniffer.detectEnvironment();

  }

  /**
   * Behandelt Environment Observer Registrierungen via Events
   */
  _handleObserverClientRegistration(event) {
    const client = event.detail;
    this._debug('CardImpl: Environment Observer Registrierung erhalten', {
      client: client.client.constructor.name
    });

    // Registriere den Observer
    this.registerEnvironmentObserverClient(client) 
    
    // Initialisiere EnvSniffer bei Bedarf
    this._initEnvSnifferIfNeeded();

    // Sende aktuelle Environment-Werte direkt an den neuen Client
    // Warte bis cardWidth > 0 ist, bevor das Event gesendet wird
    this._sendEnvironmentToClientWhenReady(client);
  }

  /**
   * Sendet Environment-Werte an Client, sobald cardWidth > 0 ist
   */
  _sendEnvironmentToClientWhenReady(client) {
    // Initialisiere Retry-Counter falls nicht vorhanden
    if (!client._envRetryCount) {
      client._envRetryCount = 0;
      client._envRetryStartTime = Date.now();
    }

    // Prüfe Max-Versuche (50 Versuche = 5 Sekunden)
    if (client._envRetryCount >= 50) {
      this._debug('CardImpl: Max-Versuche erreicht, verwende Fallback-Werte', {
        client: client.client.constructor.name,
        retryCount: client._envRetryCount,
        elapsedTime: Date.now() - client._envRetryStartTime
      });
      
      // Sende Fallback-Werte
      const fallbackEnv = {
        cardWidth: 1200,
        cardHeight: 600,
        isDesktop: true,
        isMobile: false,
        isHorizontal: true,
        isVertical: false,
        isTouchscreen: false,
        screenWidth: 1920,
        screenHeight: 1080,
        typeOfView: 'tile'
      };
      
      client.client.dispatchEvent(
        new CustomEvent('environment-changed', {
          detail: {
            oldState: null,
            newState: fallbackEnv
          },
          bubbles: false,
          composed: false
        })
      );
      return;
    }

    if (!this._envSniffer || !this._envSniffer.env) {
      this._debug('CardImpl: EnvSniffer noch nicht verfügbar, warte...', {
        retryCount: client._envRetryCount
      });
      client._envRetryCount++;
      // Warte kurz und versuche es erneut
      setTimeout(() => this._sendEnvironmentToClientWhenReady(client), 100);
      return;
    }

    const currentEnv = this._envSniffer.env;
    
    // Debug: Zeige alle verfügbaren Informationen
    this._debug('CardImpl: EnvSniffer Status', {
      hasEnvSniffer: !!this._envSniffer,
      hasEnv: !!currentEnv,
      envKeys: currentEnv ? Object.keys(currentEnv) : [],
      cardWidth: currentEnv?.envSnifferCardWidth,
      fullEnv: currentEnv
    });
    
    // Prüfe ob cardWidth > 0 ist
    if (!currentEnv.envSnifferCardWidth || currentEnv.envSnifferCardWidth <= 0) {
      this._debug('CardImpl: cardWidth noch 0, warte auf gültige Werte...', {
        cardWidth: currentEnv.cardWidth,
        env: currentEnv,
        retryCount: client._envRetryCount
      });
      client._envRetryCount++;
      // Warte kurz und versuche es erneut
      setTimeout(() => this._sendEnvironmentToClientWhenReady(client), 100);
      return;
    }

    // Jetzt haben wir gültige Environment-Werte
    this._debug('CardImpl: Sende aktuelle Environment-Werte an neuen Client', {
      client: client.client.constructor.name,
      env: currentEnv,
      retryCount: client._envRetryCount,
      elapsedTime: Date.now() - client._envRetryStartTime
    });
    
    client.client.dispatchEvent(
      new CustomEvent('environment-changed', {
        detail: {
          oldState: null,
          newState: currentEnv
        },
        bubbles: false,
        composed: false
      })
    );
  }

  /**
   * Behandelt Umgebungsänderungen
   */
  _handleEnvironmentChange(event) {
    const { oldState, newState } = event.detail;
    this._debug('CardImpl: ENV Umgebungsänderung erkannt', { oldState, newState });
    // Benachrichtige alle registrierten Environment Observer
    this._notifyEnvironmentObservers(oldState, newState);

  }
  /**
   * Registriert einen Observer für Umgebungsänderungen
   */
  registerEnvironmentObserverClient(client) {
    if (!this._environmentObserverClients.includes(client)) {
      this._environmentObserverClients.push(client);
      this._debug('CardImpl: Environment Observer registriert', {
        observer: client.constructor.name,
        totalObservers: this._environmentObserverClients.length
      });
    }
  }

  /**
   * Entfernt einen Observer aus der Registrierung
   */
  unregisterEnvironmentObserver(observer) {
    const index = this._environmentObserverClients.indexOf(observer);
    if (index > -1) {
      this._environmentObserverClients.splice(index, 1);
      this._debug('CardImpl: Environment Observer entfernt', {
        observer: observer.constructor.name,
        totalObservers: this._environmentObserverClients.length
      });
    }
  }

  /**
   * Benachrichtigt alle registrierten Observer über Umgebungsänderungen
   */
  _notifyEnvironmentObservers(oldState, newState) {
    this._debug('CardImpl: Benachrichtige Environment Observer', {
      observerCount: this._environmentObserverClients.length,
      oldState,
      newState
    });

    for (const observer of this._environmentObserverClients) {
      try {
        if (observer) {
          // Dispatch Event an den Observer
          observer.dispatchEvent(
            new CustomEvent('environment-changed', {
              detail: {
                oldState,
                newState
              },
              bubbles: false,
              composed: false
            })
          );
        }
      } catch (error) {
        this._debug('CardImpl: Fehler beim Benachrichtigen eines Observers', {
          observer: observer.constructor.name,
          error: error.message
        });
      }
    }
  }

  /**
   * Passt die View an die neue Umgebung an
   */
  _adaptViewToEnvironment(envState) {
    if (this._view && typeof this._view.adaptToEnvironment === 'function') {
      this._view.adaptToEnvironment(envState);
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
      useDummyData: UseDummyData === 'true', // Verwende Dummy-Daten statt echte EPG-Daten (Build-Variable)
    };
  }

  setConfig(config) {
    this._debug('CardImpl setConfig wird aufgerufen mit:', config);
    if (!config) {
      throw new Error('Keine Konfiguration vorhanden');
    }

    this.config = {
      ...this.getDefaultConfig(),
      ...config,
    };
    this._debug('CardImpl config nach setConfig:', this.config);
    this._debug('CardImpl: Spezifische EPG-Werte', {
      epgShowPastTime: this.config.epgShowPastTime,
      epgShowFutureTime: this.config.epgShowFutureTime,
      configKeys: Object.keys(this.config),
    });

    // View initialisieren
    this._debug('CardImpl setConfig: Initialisiere EPG-View');
    this._viewMode = this.config.view_mode || 'epg';
    this._viewType = 'EPGView';

    try {
    this._view = new EPGView();
      this._debug('CardImpl: Übergebe Konfiguration an EPG-View', {
      epgShowPastTime: this.config.epgShowPastTime,
      epgShowFutureTime: this.config.epgShowFutureTime,
    });
    this._view.config = this.config;
      // this._view.env = this.env; // Nicht mehr nötig - Observer-Pattern übernimmt das
    this._debug('CardImpl setConfig: View initialisiert:', {
      viewMode: this._viewMode,
      viewType: this._viewType,
      config: this.config,
        // env: this.env, // Nicht mehr nötig
    });
    } catch (error) {
      this._debug('CardImpl setConfig: Fehler bei View-Initialisierung:', error);
      throw new Error(`Fehler bei der View-Initialisierung: ${error.message}`);
    }
  }

  set hass(hass) {
    this._debug('CardImpl set hass wird aufgerufen');
    if (this._view) {
      this._view.hass = hass;
    }
  }

  get hass() {
    return this._hass;
  }

  firstUpdated() {
    this._debug('CardImpl firstUpdated wird aufgerufen');
    if (this._view) {
      this._view.firstUpdated();
    }
    this._debug('CardImpl firstUpdated abgeschlossen');
  }

  render() {
    if (!this._view) {
      return html`<div class="error">Keine View verfügbar</div>`;
    }

    try {
    return this._view;
    } catch (error) {
      this._debug('CardImpl render: Fehler beim Rendern der View:', error);
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
