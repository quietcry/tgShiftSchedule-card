import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { CardImpl } from './card-impl.js';
import './editor/editor.js';
import { CardRegname, CardName, CardDescription } from './card-config.js';

export class Card extends CardImpl {
  // className wird von CardImpl geerbt (ist 'CardImpl')
  static styles = [
    super.styles,
    css`
      :host {
      }
    `,
  ];

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }
}

// Registriere die Karte in der UI
if (window.customCards) {
  window.customCards.push({
    type: CardRegname,
    name: CardName,
    description: CardDescription,
    preview: true,
  });
}

// Registriere die Karte als Custom Element
if (!customElements.get(CardRegname)) {
  try {
    customElements.define(CardRegname, Card);
  } catch (error) {}
}
