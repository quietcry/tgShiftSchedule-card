import { html, css, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { CardBase } from './card-base';
const { DebugMode } = require('./card-config');

if (DebugMode) console.debug(`[${CardBase.cardName}] CardImpl-Modul wird geladen`);

export class CardImpl extends CardBase {
  static styles = [
    CardBase.styles,
    css`
      :host {
        display: block;
      }
      .card-content {
      }
    `
  ];

  constructor() {
    super();
    if (DebugMode) console.debug(`[${this.constructor.cardName}] CardImpl-Konstruktor wird aufgerufen`);
  }

  render() {
    return super.render(html`
      <div>Text: ${this._config.text || ''}</div>
      <div>Auswahl: ${this._config.auswahl || ''}</div>
      <div>Schalter: ${this._config.schalter ? 'An' : 'Aus'}</div>
    `);
  }
} 