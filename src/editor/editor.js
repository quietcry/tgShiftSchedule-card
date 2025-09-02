import { css } from 'lit';
import { EditorImpl } from './editor-impl.js';
import { CardRegname } from '../card-config.js';

export class Editor extends EditorImpl {
  static styles = [
    super.styles,
    css`
      :host {
        display: block;
        padding-top: 2px;
        padding-bottom: 2px;
        padding-left: 16px;
        padding-right: 16px;
      }
    `,
  ];

  constructor() {
    super();
  }
}

if (!customElements.get(`${CardRegname}-editor`)) {
  customElements.define(`${CardRegname}-editor`, Editor);
}
