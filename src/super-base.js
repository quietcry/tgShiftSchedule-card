import { LitElement, css } from 'lit';
import { CardName, Version, DebugMode, showVersion, UseDummyData } from './card-config.js';
import { TgCardHelper } from './tools/tg-card-helper.js';

export class SuperBase extends LitElement {
  static cardName = CardName;
  static version = Version;
  static debugMode = DebugMode;
  static useDummyData = UseDummyData;
  static showVersion = showVersion;
  static className = 'SuperBase';

  static properties = {
    hass: { type: Object },
    config: { type: Object },
  };

  static styles = [
    css`
      :host {
        display: block;
      }
    `,
  ];

  constructor() {
    super();
    this.dM = `${this.constructor.className}: `; // debugMsgPrefix - Prefix für Debug-Nachrichten

    this.cardName = this.constructor.cardName;
    this.version = this.constructor.version;
    this.debugMode = this.constructor.debugMode;
    this.useDummyData = this.constructor.useDummyData;
    this.showVersion = this.constructor.showVersion;
    this.tgCardHelper = new TgCardHelper(this.constructor.cardName, this.constructor.debugMode);
    this.getCardInfoString = this.tgCardHelper.getCardInfoString;
    this._debug('SuperBase-Konstruktor wird aufgerufen');
  }

  registerMeForChangeNotifys(eventTypes = '', that = this) {
    const dM = `${this.dM || '?: '}registerMeForChangeNotifys() `;
    this._debug(`${dM} Aufruf`, { eventTypes, that });
    this.dispatchEvent(
      new CustomEvent('registerMeForChanges', {
        bubbles: true,
        composed: true,
        detail: {
          component: that,
          callback: this._handleOnChangeNotifys.bind(this),
          eventType: eventTypes,
          immediately: true,
        },
      })
    );
  }

  _handleOnChangeNotifys(eventdata) {
    const dM = `${this.dM || '?: '}_handleOnChangeNotifys() `;
    this._debug(`${dM}aufgerufen`, { eventdata });
    for (const eventType of Object.keys(eventdata)) {
      const fkt = '_handleOnChangeNotify_' + eventType.charAt(0).toUpperCase() + eventType.slice(1);
      if (typeof this[fkt] === 'function') {
        this._debug(`${dM} ${fkt} aufgerufen`, { eventdata: eventdata[eventType] });
        this[fkt](eventdata[eventType]);
      } else {
        this._debug(`${dM} ${fkt} nicht gefunden`, { eventdata: eventdata[eventType] });
      }
    }
  }

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

    // Ermittle den Methodennamen des Aufrufers
    let methodName = 'unknown';
    try {
      const stack = new Error().stack.split('\n');
      const callerLine = stack[2]; // Index 2 für die aufrufende Methode

      // Verschiedene Regex-Patterns für verschiedene Browser-Formate
      const patterns = [
        /at\s+\w+\.(\w+)/, // Chrome/Node.js: "at ClassName.methodName"
        /(\w+)@/, // Firefox: "methodName@"
        /(\w+)\s+\(/, // Alternative: "methodName("
        /at\s+(\w+)/, // Fallback: "at methodName"
      ];

      for (const pattern of patterns) {
        const methodMatch = callerLine.match(pattern);
        if (methodMatch) {
          methodName = methodMatch[1];
          break;
        }
      }
    } catch (error) {
      // Fallback falls Stack Trace nicht verfügbar
      methodName = 'unknown';
    }
    const path = {
      methodName: methodName,
      className: className,
      cardName: this.cardName,
    };
    // this.tgCardHelper.className = className;
    this.tgCardHelper._debug(path, message, data);
  }
}
