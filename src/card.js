import { CardImpl } from './card-impl';
import './editor';

// Registriere die Karte
customElements.define('tgeditor-card', CardImpl);

// Registriere die Karte in der UI
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'tgeditor-card',
  name: 'TG Editor Card',
  description: 'Eine Karte mit Editor-Funktionalität',
  preview: true
}); 