import { html, css } from 'lit';
import { EditorBase } from './editor-base.js';
import { CardRegname } from '../card-config.js';

export class EditorImpl extends EditorBase {
  static properties = {
    ...super.properties,
  };

  constructor() {
    super({
      entity: 'input_text.arbeitszeiten',
      numberOfMonths: 14,
      initialDisplayedMonths: 2,
    });

    this._debug(`EditorImpl-Modul wird geladen`);
  }

  async firstUpdated() {
    this._debug(`EditorImpl firstUpdated wird aufgerufen`);
    await super.firstUpdated();
    this._debug(`EditorImpl firstUpdated abgeschlossen`);
  }

  render() {
    this._debug('EditorImpl render wird aufgerufen');
    if (!this.hass) {
      this._debug(`EditorImpl render: Kein hass`);
      return html`<div>Loading...</div>`;
    }

    this._debug(`EditorImpl render mit config:`, this.config);
    return html`
      <div class="card-config">
        <ha-form
          .hass=${this.hass}
          .data=${this.config}
          .schema=${this._getBasicSchema()}
          .computeLabel=${this._computeLabel}
          @value-changed=${this._valueChanged}
        ></ha-form>
      </div>
    `;
  }



  _computeLabel(schema) {
    switch (schema.name) {
      case 'entity':
        return 'Entity (input_text)';
      case 'numberOfMonths':
        return 'Maximale Anzahl Monate';
      case 'initialDisplayedMonths':
        return 'Standardwert sichtbare Monate';
      default:
        return schema.name;
    }
  }

  _valueChanged(ev) {
    this._debug('EditorImpl _valueChanged wird aufgerufen mit:', ev.detail);

    const newValue = ev.detail.value;

    // Stelle sicher, dass initialDisplayedMonths nicht größer als numberOfMonths ist
    if (newValue.initialDisplayedMonths !== undefined && newValue.numberOfMonths !== undefined) {
      newValue.initialDisplayedMonths = Math.min(newValue.initialDisplayedMonths, newValue.numberOfMonths);
    } else if (newValue.initialDisplayedMonths !== undefined && this.config.numberOfMonths) {
      newValue.initialDisplayedMonths = Math.min(newValue.initialDisplayedMonths, this.config.numberOfMonths);
    } else if (newValue.numberOfMonths !== undefined && this.config.initialDisplayedMonths) {
      // Wenn numberOfMonths geändert wird, passe initialDisplayedMonths an, falls nötig
      if (this.config.initialDisplayedMonths > newValue.numberOfMonths) {
        newValue.initialDisplayedMonths = newValue.numberOfMonths;
      }
    }

    this.config = {
      ...this.config,
      ...newValue,
    };
    this._debug('EditorImpl config nach _valueChanged:', this.config);
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config: this.config },
        bubbles: true,
        composed: true,
      })
    );
  }


  static styles = [
    super.styles,
    css`
      :host {
        display: block;
      }

      .card-config {
        padding: 10px;
      }
    `,
  ];

  static getConfigElement() {
    return document.createElement(`${CardRegname}-editor`);
  }

  static getStubConfig() {
    return {
      entity: 'input_text.arbeitszeiten',
      numberOfMonths: 14,
      initialDisplayedMonths: 2,
    };
  }

  _getBasicSchema() {
    return [
      {
        name: 'entity',
        selector: {
          entity: {
            domain: 'input_text',
          },
        },
      },
      {
        name: 'numberOfMonths',
        selector: {
          number: {
            min: 1,
            max: 14,
            step: 1,
            mode: 'box',
          },
        },
      },
      {
        name: 'initialDisplayedMonths',
        selector: {
          number: {
            min: 1,
            max: 14,
            step: 1,
            mode: 'box',
          },
        },
      },
    ];
  }
}
