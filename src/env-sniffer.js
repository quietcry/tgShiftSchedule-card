import { TgCardHelper } from './tools/tg-card-helper.js';

/**
 * EnvSniffer - Überwacht Umgebungsinformationen und löst Events bei Änderungen aus
 */
export class EnvSniffer extends TgCardHelper {
  static className = 'EnvSniffer';

  constructor(cardElement = null) {
    super('EnvSniffer', false);
    this.debugMarker = 'EnvSniffer: ';
    this.cardElement = cardElement;
    this.env = {
      cardWidth: 0,
      cardHeight: 0,
      orientation: 'horizontal',
      deviceType: 'desktop',
      theme: 'light',
      viewport: 'desktop',
      user: null,
    };
    this._debug(this.debugMarker + 'Initialisiert', this.getEnvironmentState());
    this._lastState = null;
    this._resizeObserver = null;
    this._detectionInProgress = false;
    this._retryCount = 0;
    this._maxRetries = 10;
    this._retryDelay = 100;
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
    this._debug(this.debugMarker + 'Initialisiert', this.getEnvironmentState());
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
    if (this._detectionInProgress) {
      this._debug(this.debugMarker + 'detectEnvironment bereits in Bearbeitung, überspringe');
      return;
    }

    this._detectionInProgress = true;

    const oldState = this.getEnvironmentState();

    // Bildschirm-Größe
    this.env.screenWidth = window.innerWidth;
    this.env.screenHeight = window.innerHeight;

    // Desktop vs Mobile über CSS Media Queries
    this.detectDeviceType();

    // Orientierung über CSS Media Queries
    this.detectOrientation();

    // Touchscreen
    this.env.isTouchscreen = this.detectTouchscreen();

    // Karten-Größe (mit Retry-Mechanismus)
    this.updateCardDimensions();

    // View-Typ
    this.env.typeOfView = this.detectLovelaceContext();

    // Hui-View-Position
    this.detectHuiViewPosition();
    this._debug(this.debugMarker + 'View-Typ erkannt', {
      envSnifferTypeOfView: this.env.typeOfView,
      cardElement: this.cardElement?.tagName,
      parentElement: this.cardElement?.parentElement?.tagName,
      grandParent: this.cardElement?.parentElement?.parentElement?.tagName,
    });

    // Prüfe auf Änderungen und sende Event
    const newState = this.getEnvironmentState();
    if (this.hasEnvironmentChanged(oldState, newState)) {
      this.dispatchEnvironmentChangeEvent(oldState, newState);
    }

    this._detectionInProgress = false;
  }

  /**
   * Erkennt Gerätetyp über CSS Media Queries
   */
  detectDeviceType() {
    // Mobile: Kein Hover + grobe Pointer
    const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    // Desktop: Hover + feine Pointer
    const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    // Setze Gerätetyp basierend auf Media Queries
    if (isMobile) {
      this.env.deviceType = 'mobile';
    } else if (isDesktop) {
      this.env.deviceType = 'desktop';
    } else {
      // Fallback: Verwende Touchscreen als Indikator
      this.env.deviceType = this.env.isTouchscreen ? 'mobile' : 'desktop';
    }
  }

  /**
   * Erkennt Orientierung über CSS Media Queries
   */
  detectOrientation() {
    // Portrait: Höhe größer als Breite
    const isVertical = window.matchMedia('(orientation: portrait)').matches;
    // Landscape: Breite größer als Höhe
    const isHorizontal = window.matchMedia('(orientation: landscape)').matches;

    // Setze Orientierung basierend auf Media Queries
    if (isVertical) {
      this.env.orientation = 'vertical';
    } else if (isHorizontal) {
      this.env.orientation = 'horizontal';
    } else {
      // Fallback: Verwende manuelle Berechnung
      this.env.orientation =
        this.env.screenWidth > this.env.screenHeight ? 'horizontal' : 'vertical';
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
  detectHuiViewPosition() {
    if (!this.envSnifferCardElement) {
      this._debug(this.debugMarker + 'Kein Card-Element für Hui-View-Erkennung');
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
        height: huiViewRect.height,
      };

      // Kartenposition relativ zum Hui-View
      const cardRect = this.envSnifferCardElement.getBoundingClientRect();
      this.cardPosition = {
        left: cardRect.left - huiViewRect.left,
        top: cardRect.top - huiViewRect.top,
      };

      this._debug(this.debugMarker + 'Hui-View-Position erkannt', {
        huiViewPosition: this.huiViewPosition,
        cardPosition: this.cardPosition,
      });
    } else {
      // Fallback: Verwende Viewport als Hui-View
      this.huiViewPosition = {
        left: 0,
        top: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };

      const cardRect = this.envSnifferCardElement.getBoundingClientRect();
      this.cardPosition = {
        left: cardRect.left,
        top: cardRect.top,
      };

      this._debug(this.debugMarker + 'Hui-View nicht gefunden, verwende Viewport', {
        huiViewPosition: this.huiViewPosition,
        cardPosition: this.cardPosition,
      });
    }
  }

  /**
   * Ermittelt das aktuelle Theme
   * @returns {string} Theme (light/dark)
   */
  _getCurrentTheme() {
    try {
      // Prüfe ob wir in einer Browser-Umgebung sind
      if (typeof document === 'undefined' || typeof getComputedStyle === 'undefined') {
        this._debug(this.debugMarker + 'Nicht in Browser-Umgebung, verwende Standard-Theme');
        return 'light';
      }

      // Einfache Theme-Erkennung über CSS-Variablen
      const computedStyle = getComputedStyle(document.documentElement);
      const backgroundColor = computedStyle.getPropertyValue('--primary-background-color');

      // Dunkle Hintergrundfarbe deutet auf dunkles Theme hin
      if (backgroundColor && backgroundColor.includes('rgb(0, 0, 0)')) {
        return 'dark';
      }
      return 'light';
    } catch (error) {
      this._debug(this.debugMarker + 'Fehler bei Theme-Erkennung, verwende Standard-Theme', {
        error,
      });
      return 'light';
    }
  }

  /**
   * Ermittelt den aktuellen Viewport-Typ
   * @returns {string} Viewport-Typ (mobile/desktop)
   */
  _getViewportType() {
    try {
      // Prüfe ob wir in einer Browser-Umgebung sind
      if (typeof window === 'undefined') {
        this._debug(this.debugMarker + 'Nicht in Browser-Umgebung, verwende Standard-Viewport');
        return 'desktop';
      }

      return window.innerWidth < 768 ? 'mobile' : 'desktop';
    } catch (error) {
      this._debug(this.debugMarker + 'Fehler bei Viewport-Erkennung, verwende Standard-Viewport', {
        error,
      });
      return 'desktop';
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
      this._debug(this.debugMarker + 'cardElement nicht verfügbar, warte...', { retryCount });
      if (retryCount < maxRetries) {
        setTimeout(() => this._updateCardDimensionsWithRetry(retryCount + 1), 100);
      }
      return;
    }

    const rect = this.envSnifferCardElement.getBoundingClientRect();

    // Prüfe ob gültige Dimensionen vorhanden sind
    if (rect.width <= 0 || rect.height <= 0) {
      this._debug(this.debugMarker + 'Karten-Dimensionen noch 0, warte...', {
        width: rect.width,
        height: rect.height,
        retryCount,
      });

      if (retryCount < maxRetries) {
        setTimeout(() => this._updateCardDimensionsWithRetry(retryCount + 1), 100);
      } else {
        this._debug(this.debugMarker + 'Max-Versuche erreicht, verwende Fallback-Dimensionen');
        // Verwende Fallback-Dimensionen
        this.env.cardWidth = 0;
        this.env.cardHeight = 0;
        // Löse Event aus mit Fallback-Werten
        this._triggerEnvironmentUpdate();
      }
      return;
    }

    // Gültige Dimensionen gefunden
    this.env.cardWidth = rect.width;
    this.env.cardHeight = rect.height;

    if (retryCount > 0) {
      this._debug(this.debugMarker + 'Karten-Dimensionen erfolgreich aktualisiert', {
        width: this.env.cardWidth,
        height: this.env.cardHeight,
        retryCount,
      });
      // Löse Event aus mit neuen Werten
      this._triggerEnvironmentUpdate();
    }
  }

  /**
   * Löst ein Environment-Update-Event aus
   */
  _triggerEnvironmentUpdate() {
    // oldState vor der Änderung speichern
    this.oldState = { ...this.env };

    // Neuen Zustand ermitteln (kann sich von this.env unterscheiden)
    this.newState = this.getEnvironmentState();

    // Prüfe ob sich tatsächlich etwas geändert hat
    if (this.hasEnvironmentChanged(this.oldState, this.newState)) {
      // Aktualisiere this.env mit den neuen Werten
      this.env = { ...this.newState };

      this._debug(this.debugMarker + 'Environment-Update ausgelöst', {
        oldState: this.oldState,
        newState: this.newState,
        changed: true,
      });

      this.dispatchEnvironmentChangeEvent(this.oldState, this.newState);
    } else {
      this._debug(this.debugMarker + 'Keine Änderungen erkannt, kein Event gesendet', {
        oldState: this.oldState,
        newState: this.newState,
        changed: false,
      });
    }
  }

  /**
   * Gibt den aktuellen Umgebungszustand zurück
   */
  getEnvironmentState() {
    // Hole den aktuellen Zustand der Umgebung (nicht nur this.env kopieren)
    return {
      deviceType: this.env.deviceType,
      orientation: this.env.orientation,
      cardWidth: this.env.cardWidth,
      cardHeight: this.env.cardHeight,
      isTouchscreen: this.env.isTouchscreen,
      typeOfView: this.env.typeOfView,
      screenWidth: this.env.screenWidth,
      screenHeight: this.env.screenHeight,
      huiViewPosition: this.huiViewPosition,
      cardPosition: this.cardPosition,
      // Benutzerdefinierte Variablen beibehalten
      ...Object.fromEntries(
        Object.entries(this.env).filter(
          ([key]) =>
            ![
              'deviceType',
              'orientation',
              'cardWidth',
              'cardHeight',
              'isTouchscreen',
              'typeOfView',
              'screenWidth',
              'screenHeight',
            ].includes(key)
        )
      ),
    };
  }

  /**
   * Prüft, ob sich die Umgebung geändert hat
   */
  hasEnvironmentChanged(oldState, newState) {
    // Fallback für null/undefined
    if (!oldState || !newState) {
      return true;
    }

    // Vergleiche alle Properties einzeln
    const keys = new Set([...Object.keys(oldState), ...Object.keys(newState)]);

    for (const key of keys) {
      const oldValue = oldState[key];
      const newValue = newState[key];

      // Primitive Werte direkt vergleichen
      if (typeof oldValue !== 'object' || typeof newValue !== 'object') {
        if (oldValue !== newValue) {
          return true;
        }
      } else {
        // Objekte (huiViewPosition, cardPosition) deep vergleichen
        if (!this._deepEqual(oldValue, newValue)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Deep Equality Check für Objekte
   */
  _deepEqual(obj1, obj2) {
    if (obj1 === obj2) return true;
    if (!obj1 || !obj2) return false;
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
      if (!keys2.includes(key)) return false;
      if (!this._deepEqual(obj1[key], obj2[key])) return false;
    }

    return true;
  }

  /**
   * Sendet ein Event bei Umgebungsänderungen
   */
  dispatchEnvironmentChangeEvent(oldState, newState) {
    // Prüfe ob der EnvSniffer vollständig initialisiert ist
    if (!this.envSnifferCardElement || !this.env) {
      this._debug(
        this.debugMarker +
          'dispatchEnvironmentChangeEvent: EnvSniffer noch nicht vollständig initialisiert, überspringe Event'
      );
      return;
    }

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
   * Setter für Umgebungsvariablen
   * @param {Object} newEnvVars - Neue Umgebungsvariablen (z.B. {user: 'fritz'})
   */
  setEnvVariables(newEnvVars) {
    if (!newEnvVars || typeof newEnvVars !== 'object') {
      this._debug(this.debugMarker + 'setEnvVariables: Ungültige Parameter', { newEnvVars });
      return;
    }

    this.oldState = { ...this.env };
    let hasChanges = false;

    // Neue Variablen setzen oder bestehende ändern
    for (const [key, value] of Object.entries(newEnvVars)) {
      if (this.env[key] !== value) {
        this.env[key] = value;
        hasChanges = true;
        this._debug(this.debugMarker + 'setEnvVariables: Variable gesetzt/geändert', {
          key,
          value,
        });
      }
    }

    // Event auslösen falls sich etwas geändert hat
    if (hasChanges) {
      this.newState = { ...this.env };
      this._debug(
        this.debugMarker + 'setEnvVariables: Änderungen erkannt, löse envchanges-event aus',
        {
          oldState: this.oldState,
          newState: this.newState,
        }
      );
      this.dispatchEnvironmentChangeEvent(this.oldState, this.newState);
    } else {
      this._debug(this.debugMarker + 'setEnvVariables: Keine Änderungen, kein Event ausgelöst');
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
      this._debug(this.debugMarker + 'ResizeObserver nicht verfügbar', {
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
    this.env.isTouchscreen = true;
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
        return this.env.deviceType === 'desktop';
      case 'mobile':
        return this.env.deviceType === 'mobile';
      case 'horizontal':
        return this.env.orientation === 'horizontal';
      case 'vertical':
        return this.env.orientation === 'vertical';
      case 'touchscreen':
        return this.env.isTouchscreen;
      case 'sidebar':
        return this.env.typeOfView === 'sidebar';
      case 'panel':
        return this.env.typeOfView === 'panel';
      case 'tile':
        return this.env.typeOfView === 'tile';
      case 'abschnitt':
        return this.env.typeOfView === 'abschnitt';
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
