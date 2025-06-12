import { html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { EditorImpl } from './editor-impl';
import { CardName, CardRegname } from './card-config.js';

export class Editor extends EditorImpl {
  static styles = css`
    :host {
      display: block;
      padding: 16px;
    }
  `;

  constructor() {
    super();
  }
}

// Registriere die Editor-Komponente mit dem Namen aus card-config
customElements.define(`${CardRegname}-editor`, Editor);
