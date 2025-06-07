import { html, css, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { EditorBase } from './editor-base';
const { CardRegname } = require('./card-config');

export class Editor extends EditorBase {
  static styles = css`
    :host {
      padding: 16px;
    }
  `;
}

customElements.define(CardRegname+'-editor', Editor);
