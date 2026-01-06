import { html, css } from 'lit';
import { EditorBase } from './editor-base.js';
import { CardRegname } from '../card-config.js';

export class EditorImpl extends EditorBase {
  static properties = {
    ...super.properties,
  };

  constructor() {
    super({
      numberOfMonths: 14,
      initialDisplayedMonths: 1,
      selectedCalendar: 'a',
      store_mode: 'saver',
      saver_key: 'Schichtplan',
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

    // Stelle sicher, dass store_mode immer 'saver' ist und saver_key gesetzt ist
    this.config.store_mode = 'saver';
    if (!this.config.saver_key) {
      this.config.saver_key = 'Schichtplan';
    }

    return html`
      <div class="card-config">
        <div class="saver-info-message">
          <p>
            <strong>💾 Saver-Integration:</strong> Diese Karte verwendet die 
            <a href="https://github.com/PiotrMachowski/Home-Assistant-custom-components-Saver" target="_blank" rel="noopener noreferrer">Saver-Integration</a> 
            zur Speicherung der Schichtdaten. Die Daten werden in Saver-Variablen gespeichert, ohne Längenbegrenzung.
          </p>
        </div>
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
      case 'numberOfMonths':
        return 'Maximale Anzahl Monate';
      case 'initialDisplayedMonths':
        return 'Standardwert sichtbare Monate';
      case 'saver_key':
        return 'Saver-Variablenname';
      default:
        return schema.name;
    }
  }

  _valueChanged(ev) {
    this._debug('EditorImpl _valueChanged wird aufgerufen mit:', ev.detail);

    const newValue = ev.detail.value;
    const oldStoreMode = this.config.store_mode;

    // Stelle sicher, dass initialDisplayedMonths nicht größer als numberOfMonths ist
    if (newValue.initialDisplayedMonths !== undefined && newValue.numberOfMonths !== undefined) {
      newValue.initialDisplayedMonths = Math.min(
        newValue.initialDisplayedMonths,
        newValue.numberOfMonths
      );
    } else if (newValue.initialDisplayedMonths !== undefined && this.config.numberOfMonths) {
      newValue.initialDisplayedMonths = Math.min(
        newValue.initialDisplayedMonths,
        this.config.numberOfMonths
      );
    } else if (newValue.numberOfMonths !== undefined && this.config.initialDisplayedMonths) {
      // Wenn numberOfMonths geändert wird, passe initialDisplayedMonths an, falls nötig
      if (this.config.initialDisplayedMonths > newValue.numberOfMonths) {
        newValue.initialDisplayedMonths = newValue.numberOfMonths;
      }
    }

    // Stelle sicher, dass store_mode immer 'saver' ist und saver_key gesetzt ist
    newValue.store_mode = 'saver';
    if (newValue.saver_key === undefined) {
      newValue.saver_key = this.config.saver_key || 'Schichtplan';
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

      .elements-section {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid var(--divider-color, #e0e0e0);
      }

      .elements-header {
        margin-bottom: 15px;
      }

      .elements-header ha-combo-box {
        width: 100%;
      }

      .saver-info-message {
        margin-bottom: 20px;
        padding: 12px;
        background-color: var(--info-color, #2196f3);
        color: white;
        border-radius: 4px;
      }

      .saver-info-message p {
        margin: 0;
      }

      .saver-info-message a {
        color: white;
        text-decoration: underline;
        font-weight: 500;
      }

      .saver-info-message a:hover {
        text-decoration: none;
      }

      .info-message {
        margin-top: 15px;
        padding: 12px;
        background-color: var(--info-color, #2196f3);
        color: white;
        border-radius: 4px;
      }

      .info-message p {
        margin: 0;
      }


    `,
  ];

  static getConfigElement() {
    return document.createElement(`${CardRegname}-editor`);
  }

  static getStubConfig() {
    return {
      numberOfMonths: 14,
      initialDisplayedMonths: 2,
      store_mode: 'saver',
      saver_key: 'Schichtplan',
    };
  }

  _getBasicSchema() {
    const schema = [
      {
        name: 'saver_key',
        selector: {
          text: {},
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

    return schema;
  }
}
