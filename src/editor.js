import { html, css, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { EditorImpl } from './editor-impl';
const { CardRegname } = require('./card-config');

export class Editor extends EditorImpl {
  static styles = css`
    :host {
      padding: 16px;
    }
  `;
}

customElements.define(CardRegname+'-editor', Editor);
