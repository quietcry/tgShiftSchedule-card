import { html } from 'lit';

/**
 * Template-Funktion für die gemeinsame Menu-Bar-Struktur
 * 
 * @param {Object} options - Konfigurationsobjekt
 * @param {import('lit').TemplateResult|string} options.left - Inhalt für menu-bar-left
 * @param {import('lit').TemplateResult|string} options.center - Inhalt für menu-bar-center
 * @param {import('lit').TemplateResult|string} options.right - Inhalt für menu-bar-right
 * @param {import('lit').TemplateResult|string} options.fullWidth - Inhalt für menu-bar-full-width
 * @returns {import('lit').TemplateResult}
 */
export function renderMenuBar({ left = '', center = '', right = '', fullWidth = '' }) {
  return html`
    <div class="menu-bar-row">
      <div class="menu-bar-left">${left}</div>
      <div class="menu-bar-center">${center}</div>
      <div class="menu-bar-right">${right}</div>
    </div>
    ${fullWidth ? html`<div class="menu-bar-full-width">${fullWidth}</div>` : ''}
  `;
}

