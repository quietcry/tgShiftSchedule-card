/**
 * EnvSniffer - Überwacht Umgebungsinformationen und löst Events bei Änderungen aus
 */
export class EnvSniffer {
  constructor() {
    // Umgebungsinformationen
    this.isDesktop = false;
    this.isMobile = false;
    this.isHorizontal = false;
    this.isVertical = false;
    this.cardWidth = 0;
    this.cardHeight = 0;
    this.isTouchscreen = false;
    this.typeOfView = 'unknown';
    this.screenWidth = 0;
    this.screenHeight = 0;

    // Interne Variablen
    this.cardElement = null;
    this.resizeObserver = null;
    this.resizeTimeout = null;
    this.eventTarget = new EventTarget();

    // Öffentliche env-Property
    this.env = this.getEnvironmentState();
  }

  /**
   * Initialisiert die Umgebungsüberwachung
   */
  init(cardElement) {
    this.cardElement = cardElement;
    this.detectEnvironment();
    this.setupEventListeners();
    this.setupResizeObserver();

    // Löse initiales Event aus, damit die Karte die Umgebung erkennt
    const initialState = this.getEnvironmentState();
    this.dispatchEnvironmentChangeEvent(null, initialState);

    console.log('EnvSniffer: Initialisiert', this.getEnvironmentState());
  }

  /**
   * Event-Listener hinzufügen
   */
  addEventListener(type, listener) {
    this.eventTarget.addEventListener(type, listener);
  }

  /**
   * Event-Listener entfernen
   */
  removeEventListener(type, listener) {
    this.eventTarget.removeEventListener(type, listener);
  }

  /**
   * Erkennt die aktuelle Umgebung
   */
  detectEnvironment() {
    const oldState = this.getEnvironmentState();

    // Bildschirm-Größe
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;

    // Desktop vs Mobile über CSS Media Queries
    this.detectDeviceType();

    // Orientierung über CSS Media Queries
    this.detectOrientation();

    // Touchscreen
    this.isTouchscreen = this.detectTouchscreen();

    // Karten-Größe
    this.updateCardDimensions();

    // View-Typ
    this.typeOfView = this.detectViewType();

    // Prüfe auf Änderungen und sende Event
    const newState = this.getEnvironmentState();
    if (this.hasEnvironmentChanged(oldState, newState)) {
      this.dispatchEnvironmentChangeEvent(oldState, newState);
    }
  }

  /**
   * Erkennt Gerätetyp über CSS Media Queries
   */
  detectDeviceType() {
    // Mobile: Kein Hover + grobe Pointer
    this.isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    // Desktop: Hover + feine Pointer
    this.isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    // Fallback: Wenn Media Queries nicht funktionieren
    if (!this.isMobile && !this.isDesktop) {
      // Verwende Touchscreen als Indikator
      this.isMobile = this.isTouchscreen;
      this.isDesktop = !this.isMobile;
    }
  }

  /**
   * Erkennt Orientierung über CSS Media Queries
   */
  detectOrientation() {
    // Portrait: Höhe größer als Breite
    this.isVertical = window.matchMedia('(orientation: portrait)').matches;

    // Landscape: Breite größer als Höhe
    this.isHorizontal = window.matchMedia('(orientation: landscape)').matches;

    // Fallback: Wenn Media Queries nicht funktionieren
    if (!this.isVertical && !this.isHorizontal) {
      // Verwende manuelle Berechnung als Fallback
      this.isHorizontal = this.screenWidth > this.screenHeight;
      this.isVertical = this.screenWidth <= this.screenHeight;
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
    const haCard = this.cardElement?.closest('ha-card');
    const grid = this.cardElement?.closest('.grid');
    const panel = this.cardElement?.closest('hui-panel-view');
    const sidebar = this.cardElement?.closest('.sidebar');

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
   * Aktualisiert Karten-Dimensionen
   */
  updateCardDimensions() {
    if (this.cardElement) {
      const rect = this.cardElement.getBoundingClientRect();
      this.cardWidth = rect.width;
      this.cardHeight = rect.height;
    }
  }

  /**
   * Gibt den aktuellen Umgebungszustand zurück
   */
  getEnvironmentState() {
    return {
      isDesktop: this.isDesktop,
      isMobile: this.isMobile,
      isHorizontal: this.isHorizontal,
      isVertical: this.isVertical,
      cardWidth: this.cardWidth,
      cardHeight: this.cardHeight,
      isTouchscreen: this.isTouchscreen,
      typeOfView: this.typeOfView,
      screenWidth: this.screenWidth,
      screenHeight: this.screenHeight,
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

    const event = new CustomEvent('environment-changed', {
      detail: {
        oldState,
        newState,
        currentState: newState,
      },
      bubbles: true,
      composed: true,
    });

    this.eventTarget.dispatchEvent(event);

    // Optional: Event auch auf dem Karten-Element auslösen
    if (this.cardElement) {
      this.cardElement.dispatchEvent(event);
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
    if (this.cardElement && window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(this.handleCardResize.bind(this));
      this.resizeObserver.observe(this.cardElement);
    }
  }

  /**
   * Bereinigt Resize Observer
   */
  cleanupResizeObserver() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  /**
   * Handler für Window Resize
   */
  handleResize() {
    // Debounce Resize-Events
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    this.resizeTimeout = setTimeout(() => {
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
    this.isTouchscreen = true;
    this.detectEnvironment();
  }

  /**
   * Handler für Karten-Resize
   */
  handleCardResize() {
    this.updateCardDimensions();
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
        return this.isDesktop;
      case 'mobile':
        return this.isMobile;
      case 'horizontal':
        return this.isHorizontal;
      case 'vertical':
        return this.isVertical;
      case 'touchscreen':
        return this.isTouchscreen;
      case 'sidebar':
        return this.typeOfView === 'sidebar';
      case 'panel':
        return this.typeOfView === 'panel';
      case 'tile':
        return this.typeOfView === 'tile';
      case 'abschnitt':
        return this.typeOfView === 'abschnitt';
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
    this.cardElement = null;
  }
}
