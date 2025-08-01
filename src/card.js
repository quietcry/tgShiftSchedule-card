import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { CardImpl } from './card-impl.js';
import './editor/editor.js';
import { CardRegname, CardName, CardDescription } from './card-config.js';

export class Card extends CardImpl {
  static className = 'Card';
  static get styles() {
    return [
      super.styles,
      css`
        :host {
        }
      `,
    ];
  }

  constructor() {
    super();
    console.log(`[${CardName}] Card wird initialisiert`);
  }

  connectedCallback() {
    super.connectedCallback();
    console.log(`[${CardName}] Card ist verbunden`);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    console.log(`[${CardName}] Card ist getrennt`);
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
  console.log(`[${CardName}] Karte in customCards registriert`);
}

// Registriere die Karte als Custom Element
if (!customElements.get(CardRegname)) {
  try {
customElements.define(CardRegname, Card);
    console.log(`[${CardName}] Custom Element erfolgreich registriert`);
  } catch (error) {
    console.error(`[${CardName}] Fehler bei der Custom Element-Registrierung:`, error);
  }
}
