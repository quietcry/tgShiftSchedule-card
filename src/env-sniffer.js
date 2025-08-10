import { TgCardHelper } from './tools/tg-card-helper.js';

/**
 * EnvSniffer - Überwacht Umgebungsinformationen und löst Events bei Änderungen aus
 */
export class EnvSniffer extends TgCardHelper {
  static className = 'EnvSniffer';

  constructor() {
    super();

    // Umgebungsinformationen
    this.envSnifferIsDesktop = false;
    this.envSnifferIsMobile = false;
    this.envSnifferIsHorizontal = false;
    this.envSnifferIsVertical = false;
    this.envSnifferCardWidth = 0;
    this.envSnifferCardHeight = 0;
    this.envSnifferIsTouchscreen = false;
    this.envSnifferTypeOfView = 'unknown';
    this.envSnifferScreenWidth = 0;
    this.envSnifferScreenHeight = 0;
    this.lovelaceContext = 'unknown';

    // Hui-View Informationen
    this.huiViewPosition = { left: 0, top: 0, width: 0, height: 0 };
    this.cardPosition = { left: 0, top: 0 };

    // Interne Variablen
    this.envSnifferCardElement = null;
    this.envSnifferResizeObserver = null;
    this.envSnifferResizeTimeout = null;
    this.envSnifferEventTarget = new EventTarget();
    this._envSnifferDetectionInProgress = false;

    // Öffentliche env-Property
    this.env = this.getEnvironmentState();
  }

  /**
   * Initialisiert die Umgebungsüberwachung
   */
  init(cardElement) {
    this.envSnifferCardElement = cardElement;
    this.detectEnvironment();
    this.setupEventListeners();
    this.setupResizeObserver();
    this.detectEnvironment();

    // Löse initiales Event aus, damit die Karte die Umgebung erkennt
    const initialState = this.getEnvironmentState();
    this._debug('EnvSniffer: Initialisiert', this.getEnvironmentState());
    this.dispatchEnvironmentChangeEvent(null, initialState);
  }

  /**
   * Event-Listener hinzufügen
   */
  addEventListener(type, listener) {
    this.envSnifferEventTarget.addEventListener(type, listener);
  }

  /**
   * Event-Listener entfernen
   */
  removeEventListener(type, listener) {
    this.envSnifferEventTarget.removeEventListener(type, listener);
  }

  /**
   * Erkennt die aktuelle Umgebung
   */
  detectEnvironment() {
    // Verhindere mehrfache Aufrufe während Retry-Schleife
    if (this._envSnifferDetectionInProgress) {
      this._debug('EnvSniffer: detectEnvironment bereits in Bearbeitung, überspringe');
      return;
    }

    this._envSnifferDetectionInProgress = true;

    const oldState = this.getEnvironmentState();

    // Bildschirm-Größe
    this.envSnifferScreenWidth = window.innerWidth;
    this.envSnifferScreenHeight = window.innerHeight;

    // Desktop vs Mobile über CSS Media Queries
    this.detectDeviceType();

    // Orientierung über CSS Media Queries
    this.detectOrientation();

    // Touchscreen
    this.envSnifferIsTouchscreen = this.detectTouchscreen();

    // Karten-Größe (mit Retry-Mechanismus)
    this.updateCardDimensions();

    // View-Typ
    this.envSnifferTypeOfView = this.detectViewType();

    // Lovelace-Kontext
    this.lovelaceContext = this.detectLovelaceContext();

    // Hui-View-Position
    this.detectHuiViewPosition();
    this._debug('EnvSniffer: Lovelace-Kontext erkannt', {
      lovelaceContext: this.lovelaceContext,
      cardElement: this.envSnifferCardElement?.tagName,
      parentElement: this.envSnifferCardElement?.parentElement?.tagName,
      grandParent: this.envSnifferCardElement?.parentElement?.parentElement?.tagName
    });

    // Prüfe auf Änderungen und sende Event
    const newState = this.getEnvironmentState();
    if (this.hasEnvironmentChanged(oldState, newState)) {
      this.dispatchEnvironmentChangeEvent(oldState, newState);
    }

    this._envSnifferDetectionInProgress = false;
  }

  /**
   * Erkennt Gerätetyp über CSS Media Queries
   */
  detectDeviceType() {
    // Mobile: Kein Hover + grobe Pointer
    this.envSnifferIsMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    // Desktop: Hover + feine Pointer
    this.envSnifferIsDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    // Fallback: Wenn Media Queries nicht funktionieren
    if (!this.envSnifferIsMobile && !this.envSnifferIsDesktop) {
      // Verwende Touchscreen als Indikator
      this.envSnifferIsMobile = this.envSnifferIsTouchscreen;
      this.envSnifferIsDesktop = !this.envSnifferIsMobile;
    }
  }

  /**
   * Erkennt Orientierung über CSS Media Queries
   */
  detectOrientation() {
    // Portrait: Höhe größer als Breite
    this.envSnifferIsVertical = window.matchMedia('(orientation: portrait)').matches;

    // Landscape: Breite größer als Höhe
    this.envSnifferIsHorizontal = window.matchMedia('(orientation: landscape)').matches;

    // Fallback: Wenn Media Queries nicht funktionieren
    if (!this.envSnifferIsVertical && !this.envSnifferIsHorizontal) {
      // Verwende manuelle Berechnung als Fallback
      this.envSnifferIsHorizontal = this.envSnifferScreenWidth > this.envSnifferScreenHeight;
      this.envSnifferIsVertical = this.envSnifferScreenWidth <= this.envSnifferScreenHeight;
    }
  }

  /**
   * Erkennt Touchscreen
   */
  detectTouchscreen() {
    return (
      'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0
    );
  }

  /**
   * Erkennt den View-Typ basierend auf DOM-Struktur
   */
  detectViewType() {
    // Prüfe DOM-Hierarchie für Lovelace-Einbindung
    const haCard = this.envSnifferCardElement?.closest('ha-card');
    const grid = this.envSnifferCardElement?.closest('.grid');
    const panel = this.envSnifferCardElement?.closest('hui-panel-view');
    const sidebar = this.envSnifferCardElement?.closest('.sidebar');

    // Panel-View: Ganze Seite
    if (panel) return 'panel';

    // Sidebar: In der Seitenleiste
    if (sidebar) return 'sidebar';

    // Grid-basierte Erkennung
    if (grid) {
      // Abschnitt: Einzige Karte im Grid
      if (grid.children.length === 1) return 'abschnitt';

      // Tile: Mehrere Karten im Grid
      if (grid.children.length > 1) return 'tile';
    }

    // Fallback: Standardmäßig als Tile behandeln
    return 'tile';
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
    if (card) return 'card';

    // Section Detection - durchquere Shadow DOMs (spezifischer)
    const section = this._findAncestorThroughShadowDOM('hui-section');
    if (section) return 'section';

    // Default
    return 'unknown';
  }

  /**
   * Erkennt die Hui-View-Position und Kartenposition
   */
  detectHuiViewPosition() {
    if (!this.envSnifferCardElement) {
      this._debug('EnvSniffer: Kein Card-Element für Hui-View-Erkennung');
      return;
    }

    // Finde Hui-View Element
    const huiView = this._findAncestorThroughShadowDOM('hui-view');

    if (huiView) {
      // Hui-View Position relativ zum Viewport
      const huiViewRect = huiView.getBoundingClientRect();
      this.huiViewPosition = {
        left: huiViewRect.left,
        top: huiViewRect.top,
        width: huiViewRect.width,
        height: huiViewRect.height
      };

      // Kartenposition relativ zum Hui-View
      const cardRect = this.envSnifferCardElement.getBoundingClientRect();
      this.cardPosition = {
        left: cardRect.left - huiViewRect.left,
        top: cardRect.top - huiViewRect.top
      };

      this._debug('EnvSniffer: Hui-View-Position erkannt', {
        huiViewPosition: this.huiViewPosition,
        cardPosition: this.cardPosition
      });
    } else {
      // Fallback: Verwende Viewport als Hui-View
      this.huiViewPosition = {
        left: 0,
        top: 0,
        width: window.innerWidth,
        height: window.innerHeight
      };

      const cardRect = this.envSnifferCardElement.getBoundingClientRect();
      this.cardPosition = {
        left: cardRect.left,
        top: cardRect.top
      };

      this._debug('EnvSniffer: Hui-View nicht gefunden, verwende Viewport', {
        huiViewPosition: this.huiViewPosition,
        cardPosition: this.cardPosition
      });
    }
  }

  /**
   * Findet einen Ancestor-Element durch Shadow DOMs hindurch
   */
  _findAncestorThroughShadowDOM(selector) {
    let element = this.envSnifferCardElement;

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
    this._updateCardDimensionsWithRetry();
  }

  /**
   * Aktualisiert Karten-Dimensionen mit Retry-Mechanismus
   */
  _updateCardDimensionsWithRetry(retryCount = 0) {
    const maxRetries = 50; // 5 Sekunden (50 * 100ms)

    if (!this.envSnifferCardElement) {
      this._debug('EnvSniffer: cardElement nicht verfügbar, warte...', { retryCount });
      if (retryCount < maxRetries) {
        setTimeout(() => this._updateCardDimensionsWithRetry(retryCount + 1), 100);
      }
      return;
    }

    const rect = this.envSnifferCardElement.getBoundingClientRect();

    // Prüfe ob gültige Dimensionen vorhanden sind
    if (rect.width <= 0 || rect.height <= 0) {
      this._debug('EnvSniffer: Karten-Dimensionen noch 0, warte...', {
        width: rect.width,
        height: rect.height,
        retryCount,
      });

      if (retryCount < maxRetries) {
        setTimeout(() => this._updateCardDimensionsWithRetry(retryCount + 1), 100);
      } else {
        this._debug('EnvSniffer: Max-Versuche erreicht, verwende Fallback-Dimensionen');
        // Verwende Fallback-Dimensionen
        this.envSnifferCardWidth = 0;
        this.envSnifferCardHeight = 0;
        // Löse Event aus mit Fallback-Werten
        this._triggerEnvironmentUpdate();
      }
      return;
    }

    // Gültige Dimensionen gefunden
    this.envSnifferCardWidth = rect.width;
    this.envSnifferCardHeight = rect.height;

    if (retryCount > 0) {
      this._debug('EnvSniffer: Karten-Dimensionen erfolgreich aktualisiert', {
        width: this.envSnifferCardWidth,
        height: this.envSnifferCardHeight,
        retryCount,
      });
      // Löse Event aus mit neuen Werten
      this._triggerEnvironmentUpdate();
    }
  }

  /**
   * Löst ein Environment-Update aus
   */
  _triggerEnvironmentUpdate() {
    const oldState = this.env;
    const newState = this.getEnvironmentState();

    if (this.hasEnvironmentChanged(oldState, newState)) {
      this.dispatchEnvironmentChangeEvent(oldState, newState);
    }
  }

  /**
   * Gibt den aktuellen Umgebungszustand zurück
   */
  getEnvironmentState() {
    return {
      envSnifferIsDesktop: this.envSnifferIsDesktop,
      envSnifferIsMobile: this.envSnifferIsMobile,
      envSnifferIsHorizontal: this.envSnifferIsHorizontal,
      envSnifferIsVertical: this.envSnifferIsVertical,
      envSnifferCardWidth: this.envSnifferCardWidth,
      envSnifferCardHeight: this.envSnifferCardHeight,
      envSnifferIsTouchscreen: this.envSnifferIsTouchscreen,
      envSnifferTypeOfView: this.envSnifferTypeOfView,
      envSnifferScreenWidth: this.envSnifferScreenWidth,
      envSnifferScreenHeight: this.envSnifferScreenHeight,
      lovelaceContext: this.lovelaceContext,
      huiViewPosition: this.huiViewPosition,
      cardPosition: this.cardPosition,
    };
  }

  /**
   * Prüft, ob sich die Umgebung geändert hat
   */
  hasEnvironmentChanged(oldState, newState) {
    return JSON.stringify(oldState) !== JSON.stringify(newState);
  }

  /**
   * Sendet ein Event bei Umgebungsänderungen
   */
  dispatchEnvironmentChangeEvent(oldState, newState) {
    // Aktualisiere die öffentliche env-Property
    this.env = newState;

    const event = new CustomEvent('envchanges-event', {
      detail: {
        oldState,
        newState,
        currentState: newState,
      },
      bubbles: true,
      composed: true,
    });

    this.envSnifferEventTarget.dispatchEvent(event);

    // Optional: Event auch auf dem Karten-Element auslösen
    if (this.envSnifferCardElement) {
      this.envSnifferCardElement.dispatchEvent(event);
    }
  }

  /**
   * Richtet Event-Listener ein
   */
  setupEventListeners() {
    // Window Resize
    window.addEventListener('resize', this.handleResize.bind(this));

    // Orientation Change
    window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));

    // Touch Events für Touchscreen-Erkennung
    if ('ontouchstart' in window) {
      document.addEventListener('touchstart', this.handleTouchStart.bind(this), { once: true });
    }
  }

  /**
   * Bereinigt Event-Listener
   */
  cleanupEventListeners() {
    window.removeEventListener('resize', this.handleResize.bind(this));
    window.removeEventListener('orientationchange', this.handleOrientationChange.bind(this));
    document.removeEventListener('touchstart', this.handleTouchStart.bind(this));
  }

  /**
   * Richtet Resize Observer ein
   */
  setupResizeObserver() {
    if (this.envSnifferCardElement && window.ResizeObserver) {
      this.envSnifferResizeObserver = new ResizeObserver(this.handleCardResize.bind(this));
      this.envSnifferResizeObserver.observe(this.envSnifferCardElement);
    } else {
      this._debug('env sniffer ResizeObserver nicht verfügbar', {
        cardElement: this.envSnifferCardElement,
        window: window,
        ResizeObserver: window.ResizeObserver,
      });
    }
  }

  /**
   * Bereinigt Resize Observer
   */
  cleanupResizeObserver() {
    if (this.envSnifferResizeObserver) {
      this.envSnifferResizeObserver.disconnect();
      this.envSnifferResizeObserver = null;
    }
  }

  /**
   * Handler für Window Resize
   */
  handleResize() {
    // Debounce Resize-Events
    if (this.envSnifferResizeTimeout) {
      clearTimeout(this.envSnifferResizeTimeout);
    }

    this.envSnifferResizeTimeout = setTimeout(() => {
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
   * Handler für Touch Start
   */
  handleTouchStart() {
    this.envSnifferIsTouchscreen = true;
    this.detectEnvironment();
  }

  /**
   * Handler für Karten-Resize
   */
  handleCardResize() {
    this.updateCardDimensions();
    this.detectHuiViewPosition(); // Aktualisiere Hui-View-Position bei Kartenänderungen
    this.detectEnvironment();
  }

  /**
   * Gibt Umgebungsinformationen als Objekt zurück
   */
  getEnvironmentInfo() {
    return this.getEnvironmentState();
  }

  /**
   * Prüft, ob eine bestimmte Umgebungsbedingung erfüllt ist
   */
  matchesCondition(condition) {
    switch (condition) {
      case 'desktop':
        return this.envSnifferIsDesktop;
      case 'mobile':
        return this.envSnifferIsMobile;
      case 'horizontal':
        return this.envSnifferIsHorizontal;
      case 'vertical':
        return this.envSnifferIsVertical;
      case 'touchscreen':
        return this.envSnifferIsTouchscreen;
      case 'sidebar':
        return this.envSnifferTypeOfView === 'sidebar';
      case 'panel':
        return this.envSnifferTypeOfView === 'panel';
      case 'tile':
        return this.envSnifferTypeOfView === 'tile';
      case 'abschnitt':
        return this.envSnifferTypeOfView === 'abschnitt';
      default:
        return false;
    }
  }

  /**
   * Bereinigt alle Ressourcen
   */
  destroy() {
    this.cleanupEventListeners();
    this.cleanupResizeObserver();
    this.envSnifferCardElement = null;
  }
}
