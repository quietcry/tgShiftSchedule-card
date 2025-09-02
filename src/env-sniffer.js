import { TgCardHelper } from './tools/tg-card-helper.js';

/**
 * EnvSniffer - Überwacht Umgebungsinformationen und löst Events bei Änderungen aus
 */
export class EnvSniffer extends TgCardHelper {
  static className = 'EnvSniffer';

  constructor(cardElement, eventTarget) {
    super();
    this.dM = `${this.constructor.className}: `; // debugMsgPrefix - Prefix für Debug-Nachrichten
    this._cardElement = cardElement;
    this._eventTarget = eventTarget || cardElement;
    this.envDefault = {
      deviceType: 'unknown',
      orientation: 'unknown',
      isTouchscreen: false,
      typeOfView: 'unknown',
      screenWidth: 0,
      screenHeight: 0,
      cardWidth: 0,
      cardHeight: 0,
      cardPosition: null,
      huiViewPosition: null,
    };
    this.env = { ...this.envDefault };
    this.oldEnv = { ...this.env };

    this._resizeObserver = null;
    this._resizeTimeout = null;
    this._detectionInProgress = false;
    this._maxRetries = 50;

    // Debouncing für Environment-Change-Events
    this._debounceTimer = null;
    this._debounceDelay = 150; // 50ms Verzögerung

    this.init();
  }

  /**
   * Initialisiert die Umgebungsüberwachung
   */
  init(retryCount = 0) {
    if (!this._cardElement || !(this._cardElement instanceof Element)) {
      this._debug(`${this.dM}Initialisierung verzögert, warte...`, { retryCount });
      if (retryCount < this._maxRetries) {
        setTimeout(() => this.init(retryCount + 1), 100);
      }
      return;
    }
    const rect = this._cardElement.getBoundingClientRect();

    // Prüfe ob gültige Dimensionen vorhanden sind
    if (rect.width <= 0 || rect.height <= 0) {
      if (retryCount < this._maxRetries) {
        this._debug(`${this.dM}Initialisierung verzögert, warte...`, {
          retryCount,
        });

        setTimeout(() => this.init(retryCount + 1), 100);
      } else {
        this._debug(`${this.dM}Max-Versuche erreicht, verwende Fallback-Dimensionen`);
      }
      return;
    }
    this.setupWindowEventListeners();
    this.setupCardResizeObserver();

    this.detectEnvironment();
    this._debug(`${this.dM}Initialisiert`, this.env);
  }

  /**
   * Erkennt die aktuelle Umgebung
   */
  detectEnvironment(sendEvent = false) {
    // Verhindere mehrfache Aufrufe während Retry-Schleife
    if (this._detectionInProgress) {
      this._debug(`${this.dM}detectEnvironment bereits in Bearbeitung, überspringe`);
      return;
    }
    this._detectionInProgress = true;
    this.oldEnv = { ...this.env };

    // Touchscreen über CSS Media Queries
    this.env.isTouchscreen = this.detectTouchscreen();

    // Desktop vs Mobile über CSS Media Queries
    this.env.deviceType = this.detectDeviceType();

    // Orientierung über CSS Media Queries
    this.env.orientation = this.detectOrientation();

    // Bildschirm-Größe
    this.env.screenWidth = window.innerWidth;
    this.env.screenHeight = window.innerHeight;

    // Karten-Größe (mit Retry-Mechanismus)
    this.updateCardDimensions();

    // View-Typ wenn Lovelace-Kontext erkannt
    this.env.typeOfView = this.detectLovelaceContext();

    // Hui-View-Position und card position
    this.updateHuiViewPosition();

    if (sendEvent) {
      this._debug(`${this.dM}Umgebung geändert, sofortige Event-Benachrichtigung`, {
        oldEnv: this.oldEnv,
        newEnv: this.env,
      });
      this.dispatchEnvironmentChangeEvent(this.oldEnv, this.env);
      if (this._debounceTimer) {
        clearTimeout(this._debounceTimer);
        this._debounceTimer = null;
      }
    }
    if (!sendEvent && (this._debounceTimer || this.checkEnvironmentChange())) {
      this._debug(`${this.dM}Umgebung geändert, mit Verzögerung`, {
        oldEnv: this.oldEnv,
        newEnv: this.env,
      });
      this._debounceEnvironmentChange();
    }
    this._detectionInProgress = false;
  }

  /**
   * Erkennt Gerätetyp über CSS Media Queries
   */
  detectDeviceType() {
    // Mobile: Kein Hover + grobe Pointer
    return window.matchMedia('(hover: none) and (pointer: coarse)').matches
      ? 'mobile'
      : window.matchMedia('(hover: hover) and (pointer: fine)').matches
        ? 'desktop'
        : this.env.isTouchscreen
          ? 'mobile'
          : 'unknown';
  }

  /**
   * Erkennt Orientierung über CSS Media Queries
   */
  detectOrientation() {
    // Portrait: Höhe größer als Breite
    return window.matchMedia
      ? window.matchMedia('(orientation: portrait)').matches
        ? 'portrait'
        : window.matchMedia('(orientation: landscape)').matches
          ? 'landscape'
          : 'unknown'
      : window.innerWidth > window.innerHeight
        ? 'landscape'
        : 'portrait';
  }

  /**
   * Erkennt Touchscreen
   */
  detectTouchscreen() {
    // Primär über Media Queries (zuverlässiger)
    return window.matchMedia
      ? window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(hover: none)').matches
      : 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
  }

  /**
   * Erkennt den spezifischen Lovelace-Kontext (Panel/Card/Section)
   */
  detectLovelaceContext() {
    // Panel Detection - durchquere Shadow DOMs (Panel hat Priorität)
    const panel = this._findAncestorThroughShadowDOM('ha-panel-lovelace');
    if (panel) {
      // Prüfe ob es sich um ein Panel handelt (hui-panel-view vorhanden)
      const panelView = this._findAncestorThroughShadowDOM('hui-panel-view');
      if (panelView) return 'panel';
    }

    // Card Detection - durchquere Shadow DOMs (spezifischer)
    const card = this._findAncestorThroughShadowDOM('hui-card');
    if (card) return 'tile';

    // Section Detection - durchquere Shadow DOMs (spezifischer)
    const section = this._findAncestorThroughShadowDOM('hui-section');
    if (section) return 'section';

    // Default
    return 'unknown';
  }

  /**
   * Erkennt die Hui-View-Position und Kartenposition
   */
  updateHuiViewPosition() {
    if (!this._cardElement) {
      this._debug(`${this.dM}Kein Card-Element für Hui-View-Erkennung`);
      return;
    }

    // Finde Hui-View Element
    const huiView = this._findAncestorThroughShadowDOM('hui-view');

    if (huiView) {
      // Hui-View Position relativ zum Viewport
      const huiViewRect = huiView.getBoundingClientRect();
      this.env.huiViewPosition = {
        left: huiViewRect.left,
        top: huiViewRect.top,
        width: huiViewRect.width,
        height: huiViewRect.height,
      };

      // Kartenposition relativ zum Hui-View
      const cardRect = this._cardElement.getBoundingClientRect();
      this.env.cardPosition = {
        left: cardRect.left - huiViewRect.left,
        top: cardRect.top - huiViewRect.top,
      };

      this._debug(`${this.dM}Hui-View-Position erkannt`, {
        huiViewPosition: this.env.huiViewPosition,
        cardPosition: this.env.cardPosition,
      });
    } else {
      // Fallback: Verwende Viewport als Hui-View
      this.env.huiViewPosition = {
        left: 0,
        top: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };

      const cardRect = this._cardElement.getBoundingClientRect();
      this.env.cardPosition = {
        left: cardRect.left,
        top: cardRect.top,
      };

      this._debug(`${this.dM}Hui-View nicht gefunden, verwende Viewport`, {
        huiViewPosition: this.env.huiViewPosition,
        cardPosition: this.env.cardPosition,
      });
    }
  }

  /**
   * Findet einen Ancestor-Element durch Shadow DOMs hindurch
   */
  _findAncestorThroughShadowDOM(selector) {
    let element = this._cardElement;

    while (element) {
      // Prüfe ob das aktuelle Element dem Selector entspricht
      if (element.matches && element.matches(selector)) {
        return element;
      }

      // Gehe zum Parent
      let parent = element.parentElement;

      // Wenn kein Parent, versuche Shadow Root
      if (!parent && element.parentNode && element.parentNode.host) {
        parent = element.parentNode.host;
      }

      element = parent;
    }

    return null;
  }

  /**
   * Aktualisiert Karten-Dimensionen
   */
  updateCardDimensions() {
    if (!this._cardElement) {
      this._debug(`${this.dM}Kein Card-Element für Karten-Dimensionen`);
      return;
    }

    const rect = this._cardElement.getBoundingClientRect();

    // Gültige Dimensionen gefunden
    this.env.cardWidth = rect.width || 0;
    this.env.cardHeight = rect.height || 0;
  }

  /**
   * Fügt benutzerdefinierte Umgebungsvariablen hinzu
   */
  addSnifferVariables(envVariables) {
    this.env = { ...this.env, ...envVariables };
    this.detectEnvironment();
  }

  /**
   * Löst manuell eine Umgebungsaktualisierung aus
   */
  triggerSnifferUpdate() {
    this.detectEnvironment(true);
  }

  /**
   * Gibt den aktuellen Umgebungszustand zurück
   */
  getSnifferState() {
    return this.env;
  }

  /**
   * Bereinigt den Sniffer und setzt alle Werte zurück
   */
  cleanSniffer() {
    this.cleanupEventListeners();
    this.cleanupResizeObserver();

    // Debounce-Timer bereinigen
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
      this._debounceTimer = null;
    }

    this.env = { ...this.envDefault };
    this.oldEnv = { ...this.env }; // Kopie des leeren Objekts
    this._cardElement = null;
    this._eventTarget = null;
  }

  checkEnvironmentChange() {
    let changed = false;
    for (const key in this.env) {
      if (!this.oldEnv[key] || this.env[key] !== this.oldEnv[key]) {
        changed = true;
        break;
      }
    }
    return changed;
  }

  /**
   * Debouncing für Environment-Change-Events
   * Verhindert Event-Spam während der Initialisierung
   */
  _debounceEnvironmentChange() {
    // Vorherigen Timer löschen
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
      this._debounceTimer = null;
    }

    // Neuen Timer setzen
    this._debounceTimer = setTimeout(() => {
      this.dispatchEnvironmentChangeEvent(this.oldEnv, this.env);
      this._debounceTimer = null;
    }, this._debounceDelay);
  }

  /**
   * Sendet ein Event bei Umgebungsänderungen
   */
  dispatchEnvironmentChangeEvent(oldState, newState) {
    // Aktualisiere die öffentliche env-Property
    this._debug(`${this.dM}Umgebungsänderung, Event-Benachrichtigung`, {
      oldState: oldState,
      newState: newState,
    });

    const event = new CustomEvent('envchanges-event', {
      detail: {
        oldState,
        newState,
      },
      bubbles: true,
      composed: true,
    });

    this._eventTarget.dispatchEvent(event);
  }

  /**
   * Richtet Event-Listener ein
   */
  setupWindowEventListeners() {
    // Window Resize
    window.addEventListener('resize', this.handleWindowResize.bind(this));

    // Orientation Change
    window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));
  }

  /**
   * Bereinigt Event-Listener
   */
  cleanupEventListeners() {
    window.removeEventListener('resize', this.handleWindowResize.bind(this));
    window.removeEventListener('orientationchange', this.handleOrientationChange.bind(this));
  }

  /**
   * Richtet Resize Observer ein
   */
  setupCardResizeObserver() {
    if (this._cardElement && window.ResizeObserver) {
      this._resizeObserver = new ResizeObserver(this.handleCardResize.bind(this));
      this._resizeObserver.observe(this._cardElement);
    } else {
      this._debug(`${this.dM}ResizeObserver nicht verfügbar`, {
        cardElement: this._cardElement,
        window: window,
        ResizeObserver: window.ResizeObserver,
      });
    }
  }

  /**
   * Bereinigt Resize Observer
   */
  cleanupResizeObserver() {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
  }

  /**
   * Handler für Window Resize
   */
  handleWindowResize() {
    // Debounce Resize-Events
    if (this._resizeTimeout) {
      clearTimeout(this._resizeTimeout);
    }

    this._resizeTimeout = setTimeout(() => {
      this.detectEnvironment();
    }, 100);
  }

  /**
   * Handler für Orientation Change
   */
  handleOrientationChange() {
    // Warte kurz, bis sich die Orientierung geändert hat
    setTimeout(() => {
      this.detectEnvironment();
    }, 200);
  }

  /**
   * Handler für Karten-Resize
   */
  handleCardResize() {
    this.detectEnvironment();
  }
}
