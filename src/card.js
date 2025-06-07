import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { CardImpl } from './card-impl';
import './editor';

const { CardRegname, CardName, CardDescription } = require('./card-config');

export class Card extends CardImpl {
  static styles = [
    CardImpl.styles,
    css`
      :host {
        
      }
    `
  ];
}

// Registriere die Karte
customElements.define(CardRegname, Card);

// Registriere die Karte in der UI
window.customCards = window.customCards || [];
window.customCards.push({
  type: CardRegname,
  name: CardName,
  description: CardDescription,
  preview: true
}); 
