import { TGEditorCardImpl } from './tgeditor-card-impl';
import './tgeditor-card-editor';

// Registriere die Karte
customElements.define('tgeditor-card', TGEditorCardImpl);

// Registriere die Karte in der UI
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'tgeditor-card',
  name: 'TGEditor Card',
  description: 'Eine Karte mit Editor-Funktionalität',
  preview: true
}); 