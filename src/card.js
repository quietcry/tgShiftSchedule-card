import { TGEditorCardImpl } from './card-impl';
import './tgeditor-card-editor';

// Registriere die Karte
customElements.define('tgeditor-card', TGEditorCardImpl);

// Registriere die Karte in der UI
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'tgeditor-card',
  name: 'TG Editor Card',
  description: 'Eine Karte mit Editor-Funktionalität',
  preview: true
}); 