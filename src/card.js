import { CardImpl } from './card-impl';
import './editor';
const { CardRegname, CardName, CardDescription } = require('./card-config');

// Registriere die Karte
customElements.define(CardRegname, CardImpl);

// Registriere die Karte in der UI
window.customCards = window.customCards || [];
window.customCards.push({
  type: CardRegname,
  name: CardName,
  description: CardDescription,
  preview: true
}); 