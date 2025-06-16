import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { CardImpl } from './card-impl.js';
import './editor.js';
import { CardRegname, CardName, CardDescription } from './card-config.js';

export class Card extends CardImpl {
  static get styles() {
    return [
      super.styles,
      css`
        :host {
        }
      `,
    ];
  }
}

// Registriere die Karte in der UI
window.customCards = window.customCards || [];
window.customCards.push({
  type: CardRegname,
  name: CardName,
  description: CardDescription,
  preview: true,
});

// Registriere die Karte als Custom Element
customElements.define(CardRegname, Card);
