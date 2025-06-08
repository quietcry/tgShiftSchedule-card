import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { CardName, Version, DebugMode, showVersion } from './card-config';

export class SuperBase extends LitElement {
  static cardName = CardName;
  static version = Version;
  static debugMode = DebugMode;
  static showVersion = showVersion;

  static properties = {
    hass: { type: Object },
    config: { type: Object },
  };

  constructor() {
    super();
    this.cardName = this.constructor.cardName;
    this.version = this.constructor.version;
    this.debugMode = this.constructor.debugMode;
    this.showVersion = this.constructor.showVersion;
    this._debug('SuperBase-Konstruktor wird aufgerufen');
  }

  _debug(message, data = null) {
    if (this.debugMode) {
      const className = this.constructor.name;
      if (data) {
        console.debug(`[${this.cardName}] [${className}] ${message}`, data);
      } else {
        console.debug(`[${this.cardName}] [${className}] ${message}`);
      }
    }
  }
}
