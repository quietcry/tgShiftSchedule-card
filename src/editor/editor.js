import { css } from 'lit';
import { EditorImpl } from './editor-impl.js';
import { CardRegname } from '../card-config.js';

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

if (!customElements.get(`${CardRegname}-editor`)) {
  customElements.define(`${CardRegname}-editor`, Editor);
}
