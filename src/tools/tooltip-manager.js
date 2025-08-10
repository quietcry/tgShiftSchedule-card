import { TgCardHelper } from './tg-card-helper.js';
import { CardName, DebugMode } from '../card-config.js';

/**
 * Manager für Tooltip-Funktionalität
 * Übernimmt die komplette Tooltip-Logik inklusive Positionierung
 */
export class TooltipManager {
  static className = 'TooltipManager';

  constructor(hostElement, env, programBoxRef = null) {
    this.hostElement = hostElement;
    this.env = env;
    this.programBoxRef = programBoxRef;
    this.tgCardHelper = new TgCardHelper(CardName, DebugMode);

    // Tooltip-Zustand
    this.isVisible = false;
    this.data = null;
    this.position = 'top';
    this.elementRect = null;

    // Standard-Dimensionen
    this.tooltipWidth = 300;
    this.tooltipHeight = 120;
    this.margin = 8;

    this._debug('TooltipManager initialisiert', {
      hasHostElement: !!this.hostElement,
      hasEnv: !!this.env,
      hasProgramBoxRef: !!this.programBoxRef
    });
  }

  /**
   * Debug-Methode (vereinfacht, da keine SuperBase-Vererbung)
   */
  _debug(message, data = null) {
    // Versuche verschiedene Methoden, um den echten Klassennamen zu bekommen
    let className = 'Unknown';

    // Methode 1: Statischer Klassennamen (falls definiert)
    if (this.constructor.className) {
      className = this.constructor.className;
    }
    // Methode 2: Tag-Name des Custom Elements
    else if (this.tagName) {
      className = this.tagName.toLowerCase().replace(/[^a-z0-9]/g, '');
    }
    // Methode 3: Constructor name (kann minifiziert sein)
    else if (this.constructor.name && this.constructor.name.length > 2) {
      className = this.constructor.name;
    }
    // Methode 4: Fallback auf cardName
    else if (this.cardName) {
      className = this.cardName;
    }

    this.tgCardHelper._debug(className, message, data);
  }

  /**
   * Ermittelt den Namen der aufrufenden Methode
   */
  _getCallerMethodName() {
    try {
      const stack = new Error().stack;
      const lines = stack.split('\n');
      // Suche nach der ersten Zeile, die nicht _debug oder _getCallerMethodName enthält
      for (let i = 3; i < lines.length; i++) {
        const line = lines[i];
        if (line && !line.includes('_debug') && !line.includes('_getCallerMethodName')) {
          const match = line.match(/at\s+(?:.*\.)?(\w+)/);
          return match ? match[1] : 'unknown';
        }
      }
      return 'unknown';
    } catch (e) {
      return 'unknown';
    }
  }

  /**
   * Zeigt den Tooltip an
   */
  show(data, position, elementRect) {
    this._debug('TooltipManager: Tooltip anzeigen', {
      data: data?.title,
      position,
      elementRect: elementRect ? {
        top: elementRect.top,
        left: elementRect.left,
        width: elementRect.width,
        height: elementRect.height
      } : null
    });

    this.isVisible = true;
    this.data = data;
    this.position = position;
    this.elementRect = elementRect;

    // Triggere Update des Host-Elements
    if (this.hostElement && typeof this.hostElement.requestUpdate === 'function') {
      this.hostElement.requestUpdate();
    }
  }

  /**
   * Versteckt den Tooltip
   */
  hide() {
    this._debug('TooltipManager: Tooltip verstecken');

    this.isVisible = false;
    this.data = null;
    this.elementRect = null;

    // Triggere Update des Host-Elements
    if (this.hostElement && typeof this.hostElement.requestUpdate === 'function') {
      this.hostElement.requestUpdate();
    }
  }

  /**
   * Formatiert die Zeit für den Tooltip
   */
  formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Erstellt den Tooltip-Inhalt (HTML-String)
   */
  getContent() {
    if (!this.data) return '';

    const startTime = this.formatTime(this.data.start);
    const endTime = this.formatTime(this.data.stop);
    const duration = this.data.duration ? Math.round(this.data.duration / 60) : 0;

    // Baue HTML-String zusammen
    let content = `<div class="tooltip-content">`;
    content += `<div class="tooltip-title">${this.data.title || 'Unbekanntes Programm'}</div>`;

    if (this.data.shortText) {
      content += `<div class="tooltip-subtitle">${this.data.shortText}</div>`;
    }

    content += `<div class="tooltip-time">`;
    content += `<span class="tooltip-start">${startTime}</span>`;
    content += `<span class="tooltip-separator"> - </span>`;
    content += `<span class="tooltip-end">${endTime}</span>`;
    if (duration > 0) {
      content += `<span class="tooltip-duration"> (${duration} Min)</span>`;
    }
    content += `</div>`;

    if (this.data.description) {
      content += `<div class="tooltip-description">${this.data.description}</div>`;
    }

    content += `</div>`;

    return content;
  }

  /**
   * Berechnet die komplette Tooltip-Position und gibt CSS-Style zurück
   */
  getStyle() {
    this._debug('TooltipManager: Style berechnen', {
      hasElementRect: !!this.elementRect,
      hasEnv: !!this.env,
      isVisible: this.isVisible
    });

    if (!this.elementRect) return '';

    const progItem = this.elementRect;

    // Hui-View-Daten aus dem Sniffer (mit Fallback)
    const huiView = this.env?.huiViewPosition || {
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight
    };
    const cardPos = this.env?.cardPosition || { left: 0, top: 0 };

    // Debug-Info
    this._debug('TooltipManager: Positionierung (Hui-View)', {
      progItem: { top: progItem.top, left: progItem.left, width: progItem.width, height: progItem.height },
      huiView,
      cardPos,
      tooltip: { width: this.tooltipWidth, height: this.tooltipHeight }
    });

    // Berechne Ecken-Abstände für das Programmitem
    const itemCorners = this._calculateItemCornerDistances(progItem, huiView, cardPos);

    // Finde die Ecke mit dem größten Abstand
    const bestCorner = this._findBestCorner(itemCorners);

    // Berechne Tooltip-Position basierend auf der besten Ecke
    const tooltipPosition = this._calculateTooltipPosition(progItem, bestCorner, huiView);

    // Begrenze Tooltip auf Hui-View
    const finalPosition = this._constrainToHuiView(tooltipPosition, huiView);

    // Berechne Pfeil-Position
    const arrowLeft = this._calculateArrowPosition(progItem, finalPosition);

    this._debug('TooltipManager: Style-Berechnung abgeschlossen', {
      bestCorner: bestCorner?.corner,
      tooltipPosition,
      finalPosition,
      arrowLeft
    });

    return `position: fixed; left: ${finalPosition.left}px; top: ${finalPosition.top}px; z-index: 10000; --tooltip-arrow-left: ${arrowLeft}; --tooltip-class: ${finalPosition.tooltipClass};`;
  }

  /**
   * Berechnet die Abstände für alle 4 Ecken des Programmitems
   */
  _calculateItemCornerDistances(progItem, huiView, cardPos) {
    // Verwende direkte DOM-Messung der ProgramBox (falls verfügbar)
    let programBoxRect = null;

    if (this.programBoxRef) {
      programBoxRect = this.programBoxRef.getBoundingClientRect();
      this._debug('TooltipManager: ProgramBox direkt gemessen', {
        programBoxRect: {
          left: programBoxRect.left,
          top: programBoxRect.top,
          width: programBoxRect.width,
          height: programBoxRect.height
        }
      });
    } else {
      // Fallback: Berechnung basierend auf Layout-Werten
      const TIMEBAR_HEIGHT = 60; // Aus EPG-View CSS: .timeBar { height: 60px; }
      const channelWidth = this.hostElement?.config?.channelWidth || 180;

      programBoxRect = {
        left: cardPos.left + channelWidth,
        top: cardPos.top + TIMEBAR_HEIGHT,
        width: huiView.width - cardPos.left - channelWidth,
        height: huiView.height - (cardPos.top + TIMEBAR_HEIGHT)
      };

      this._debug('TooltipManager: ProgramBox berechnet (Fallback)', {
        timebarHeight: TIMEBAR_HEIGHT,
        channelWidth: channelWidth,
        programBoxRect
      });
    }
    // Berechne Abstände für alle 4 Ecken
    const corners = [
      { name: 'topLeft', x: progItem.left, y: progItem.top },
      { name: 'topRight', x: progItem.right, y: progItem.top },
      { name: 'bottomLeft', x: progItem.left, y: progItem.bottom },
      { name: 'bottomRight', x: progItem.right, y: progItem.bottom }
    ];

    const cornerDistances = corners.map(corner => {
      // Abstand zur linken Programmbox-Ecke
      const distanceToProgramBoxLeft = Math.abs(corner.x - programBoxRect.left);
      // Abstand zur linken Hui-View-Ecke
      const distanceToHuiViewLeft = Math.abs(corner.x - huiView.left);
      // Nimm den kleineren Wert
      const leftDistance = Math.min(distanceToProgramBoxLeft, distanceToHuiViewLeft);

      // Abstand zur oberen Programmbox-Ecke
      const distanceToProgramBoxTop = Math.abs(corner.y - programBoxRect.top);
      // Abstand zur oberen Hui-View-Ecke
      const distanceToHuiViewTop = Math.abs(corner.y - huiView.top);
      // Nimm den kleineren Wert
      const topDistance = Math.min(distanceToProgramBoxTop, distanceToHuiViewTop);

      // Gesamtabstand (Pythagoras)
      const totalDistance = Math.sqrt(leftDistance * leftDistance + topDistance * topDistance);

      return {
        corner: corner.name,
        position: { x: corner.x, y: corner.y },
        distances: { left: leftDistance, top: topDistance, total: totalDistance },
        programBox: {
          left: programBoxRect.left,
          top: programBoxRect.top,
          width: programBoxRect.width,
          height: programBoxRect.height
        }
      };
    });

    this._debug('TooltipManager: Ecken-Abstände berechnet', {
      progItem: { left: progItem.left, top: progItem.top, right: progItem.right, bottom: progItem.bottom },
      huiView,
      cardPos,
      programBox: programBoxRect,
      cornerDistances
    });

    return cornerDistances;
  }

  /**
   * Findet die Ecke mit dem größten Abstand
   */
  _findBestCorner(cornerDistances) {
    const bestCorner = cornerDistances.reduce((best, current) => {
      return current.distances.total > best.distances.total ? current : best;
    });

    this._debug('TooltipManager: Beste-Ecke gefunden', {
      bestCorner,
      allCorners: cornerDistances
    });

    return bestCorner;
  }

  /**
   * Berechnet die Tooltip-Position basierend auf der besten Ecke
   */
  _calculateTooltipPosition(progItem, bestCorner, huiView) {
    // Standard: Mittig über/unter dem sichtbaren Item-Teil
    let left = progItem.left + (progItem.width / 2) - (this.tooltipWidth / 2);
    let top = progItem.top - this.tooltipHeight - this.margin; // Über dem Item
    let tooltipClass = 'bottom';

    // Einfache Positionierung: Immer über dem Item versuchen
    top = progItem.top - this.tooltipHeight - this.margin;
    tooltipClass = 'bottom';

    // Nur wenn wirklich kein Platz oben ist, dann unten
    const spaceAbove = progItem.top - huiView.top;
    this._debug('TooltipManager: Position-Berechnung', {
      progItemTop: progItem.top,
      huiViewTop: huiView.top,
      spaceAbove,
      tooltipHeight: this.tooltipHeight,
      margin: this.margin,
      finalTop: top,
      tooltipClass
    });

    if (spaceAbove < this.tooltipHeight + this.margin) {
      top = progItem.bottom + this.margin;
      tooltipClass = 'top';
    }

    this._debug('TooltipManager: Position berechnet', {
      progItem: { left: progItem.left, top: progItem.top, width: progItem.width, height: progItem.height },
      bestCorner,
      spaces: { above: spaceAbove },
      position: { left, top, tooltipClass },
      note: 'Programmbox darf überdeckt werden'
    });

    return { left, top, tooltipClass };
  }

  /**
   * Begrenzt den Tooltip auf den Hui-View (Programmbox darf überdeckt werden)
   */
  _constrainToHuiView(position, huiView) {
    let { left, top, tooltipClass } = position;

    // Begrenze nur auf Hui-View (Programmbox-Grenzen werden ignoriert)
    left = Math.max(huiView.left + 10, Math.min(left, huiView.left + huiView.width - this.tooltipWidth - 10));
    top = Math.max(huiView.top + 10, Math.min(top, huiView.top + huiView.height - this.tooltipHeight - 10));

    // Wenn Tooltip immer noch außerhalb, zentriere ihn im Hui-View
    if (left < huiView.left || top < huiView.top ||
        left + this.tooltipWidth > huiView.left + huiView.width ||
        top + this.tooltipHeight > huiView.top + huiView.height) {
      left = huiView.left + (huiView.width - this.tooltipWidth) / 2;
      top = huiView.top + (huiView.height - this.tooltipHeight) / 2;
      tooltipClass = 'bottom';
    }

    this._debug('TooltipManager: Hui-View-Begrenzung', {
      original: position,
      huiView,
      final: { left, top, tooltipClass },
      note: 'Programmbox darf überdeckt werden'
    });

    return { left, top, tooltipClass };
  }

  /**
   * Berechnet die Pfeil-Position
   */
  _calculateArrowPosition(progItem, tooltipPosition) {
    const { left, top, tooltipClass } = tooltipPosition;

    if (tooltipClass === 'top' || tooltipClass === 'bottom') {
      // Horizontaler Pfeil
      const arrowPosition = progItem.left + (progItem.width / 2) - left;
      return `${Math.max(10, Math.min(arrowPosition, this.tooltipWidth - 10))}px`;
    } else {
      // Vertikaler Pfeil
      const arrowPosition = progItem.top + (progItem.height / 2) - top;
      return `${Math.max(10, Math.min(arrowPosition, this.tooltipHeight - 10))}px`;
    }
  }

  /**
   * Event-Handler für Tooltip-Events
   */
  handleTooltipEvent(event) {
    const { action, position, elementRect, data } = event.detail;

    this._debug('TooltipManager: Event empfangen', {
      action,
      position,
      title: data?.title,
      elementRect: elementRect ? {
        top: elementRect.top,
        left: elementRect.left,
        width: elementRect.width,
        height: elementRect.height
      } : null
    });

    if (action === 'show') {
      this.show(data, position, elementRect);
    } else if (action === 'hide') {
      this.hide();
    }
  }
}
