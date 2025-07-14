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

  static get styles() {
    return css`
      :host {
        display: block;
      }
    `;
  }

  constructor() {
    super();
    this.cardName = this.constructor.cardName;
    this.version = this.constructor.version;
    this.debugMode = this.constructor.debugMode;
    this.useDummyData = this.constructor.useDummyData;
    this.showVersion = this.constructor.showVersion;
    this.tgCardHelper = new TgCardHelper(this.constructor.cardName, this.constructor.debugMode);
    this._debug('SuperBase-Konstruktor wird aufgerufen');
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
    this.tgCardHelper.className = className
    this.tgCardHelper._debug(message, data);
  }
}
