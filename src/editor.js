import { html, css, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { EditorBase } from './editor-base';
import { EditorImpl } from './editor-impl';

export class Editor extends EditorImpl {
  static styles = css`
    :host {
      padding: 16px;
    }
  `;
} 