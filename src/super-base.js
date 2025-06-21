import { LitElement } from 'lit';
import { CardName, Version, DebugMode, showVersion } from './card-config.js';
import { css } from 'lit';

export class SuperBase extends LitElement {
  static cardName = CardName;
  static version = Version;
  static debugMode = DebugMode;
  static showVersion = showVersion;

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
    this.showVersion = this.constructor.showVersion;
    this._debug('SuperBase-Konstruktor wird aufgerufen');
  }

  _debug(message, data = null) {
    if (!DebugMode) return;

    const className = this.constructor.name;
    const debugList = DebugMode.split(',').map(item => item.trim().toLowerCase());
    const shouldDebug =
      debugList[0] === 'true'
        ? !debugList.slice(1).includes(className.toLowerCase())
        : debugList.includes(className.toLowerCase());

    if (shouldDebug) {
      if (data) {
        console.debug(`[${this.cardName}] [${className}] ${message}`, data);
      } else {
        console.debug(`[${this.cardName}] [${className}] ${message}`);
      }
    }
  }
}
