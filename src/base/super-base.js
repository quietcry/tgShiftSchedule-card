import { LitElement } from 'lit';
import { CardName, DebugMode } from '../card-config';

export class SuperBase extends LitElement {
  constructor() {
    super();
  }

  _debug(message, ...args) {
    if (DebugMode) {
      console.debug(`[${CardName}] [${this.constructor.name}] ${message}`, ...args);
    }
  }

  static get styles() {
    return css``;
  }
}
