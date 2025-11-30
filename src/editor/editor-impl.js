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
      mode: 'single',
      selectedCalendar: 'a',
      calendars: [
        { shortcut: 'a', name: 'Standardkalender', color: '#ff9800', enabled: true },
        { shortcut: 'b', name: 'Kalender B', color: '#ff0000', enabled: false },
        { shortcut: 'c', name: 'Kalender C', color: '#00ff00', enabled: false },
        { shortcut: 'd', name: 'Kalender D', color: '#0000ff', enabled: false },
        { shortcut: 'e', name: 'Kalender E', color: '#ffff00', enabled: false },
      ],
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
    
    // Stelle sicher, dass calendars Array vorhanden ist und alle 5 Kalender enthält
    if (!this.config.calendars || !Array.isArray(this.config.calendars)) {
      this.config.calendars = [
        { shortcut: 'a', name: 'Standardkalender', color: '#ff9800', enabled: true },
        { shortcut: 'b', name: 'Kalender B', color: '#ff0000', enabled: false },
        { shortcut: 'c', name: 'Kalender C', color: '#00ff00', enabled: false },
        { shortcut: 'd', name: 'Kalender D', color: '#0000ff', enabled: false },
        { shortcut: 'e', name: 'Kalender E', color: '#ffff00', enabled: false },
      ];
    }
    
    // Stelle sicher, dass genau 5 Kalender vorhanden sind (a, b, c, d, e)
    const defaultCalendars = [
      { shortcut: 'a', name: 'Standardkalender', color: '#ff9800', enabled: true }, // Fix: Standardkalender
      { shortcut: 'b', name: 'Kalender B', color: '#ff0000', enabled: false },
      { shortcut: 'c', name: 'Kalender C', color: '#00ff00', enabled: false },
      { shortcut: 'd', name: 'Kalender D', color: '#0000ff', enabled: false },
      { shortcut: 'e', name: 'Kalender E', color: '#ffff00', enabled: false },
    ];
    
    // Initialisiere oder aktualisiere Kalender-Array
    const calendarsMap = new Map();
    this.config.calendars.forEach(cal => calendarsMap.set(cal.shortcut, cal));
    
    // Füge fehlende Kalender hinzu oder aktualisiere vorhandene
    this.config.calendars = defaultCalendars.map(defaultCal => {
      const existing = calendarsMap.get(defaultCal.shortcut);
      if (existing) {
        // Für Standardkalender (a): Immer fixe Werte verwenden
        if (defaultCal.shortcut === 'a') {
          return { shortcut: 'a', name: 'Standardkalender', color: '#ff9800', enabled: true };
        }
        // Für andere Kalender: Behalte konfigurierte Werte, aber stelle sicher, dass shortcut fix bleibt
        return { ...existing, shortcut: defaultCal.shortcut };
      }
      return defaultCal;
    });
    
    return html`
      <div class="card-config">
        <ha-form
          .hass=${this.hass}
          .data=${this.config}
          .schema=${this._getBasicSchema()}
          .computeLabel=${this._computeLabel}
          @value-changed=${this._valueChanged}
        ></ha-form>
        <div class="elements-section">
          <div class="elements-header">
            <ha-combo-box
              label="Modus"
              .value=${this.config.mode || 'single'}
              .items=${[
                { value: 'single', label: 'Single (Standard)' },
                { value: 'advanced-additive', label: 'Advanced (Additiv)' },
                { value: 'advanced-competitive', label: 'Advanced (Competitive)' }
              ]}
              @value-changed=${(e) => {
                const value = e.detail?.value;
                if (value) {
                  this.config = {
                    ...this.config,
                    mode: value,
                  };
                  this.dispatchEvent(
                    new CustomEvent('config-changed', {
                      detail: { config: this.config },
                      bubbles: true,
                      composed: true,
                    })
                  );
                  this.requestUpdate();
                }
              }}
            ></ha-combo-box>
          </div>
          ${this.config.mode !== 'single'
            ? html`
                <div class="calendars-list">
                  ${this.config.calendars
                    .filter(calendar => calendar.shortcut !== 'a') // Standardkalender (a) ist fix und wird nicht angezeigt
                    .map((calendar, index) => this._renderCalendar(index, calendar))}
                </div>
              `
            : ''}
        </div>
      </div>
    `;
  }
  
  _updateUseElements(value) {
    this.config = {
      ...this.config,
      useElements: value,
    };
    
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config: this.config },
        bubbles: true,
        composed: true,
      })
    );
    this.requestUpdate();
  }
  
  _getColorOptions() {
    // Liste von vordefinierten Farben
    return [
      { value: '#ff0000', name: 'Rot' },
      { value: '#00ff00', name: 'Grün' },
      { value: '#0000ff', name: 'Blau' },
      { value: '#ffff00', name: 'Gelb' },
      { value: '#ff00ff', name: 'Magenta' },
      { value: '#00ffff', name: 'Cyan' },
      { value: '#ff8800', name: 'Orange' },
      { value: '#8800ff', name: 'Violett' },
      { value: '#0088ff', name: 'Hellblau' },
      { value: '#ff0088', name: 'Pink' },
      { value: '#88ff00', name: 'Lime' },
      { value: '#008888', name: 'Türkis' },
      { value: '#888888', name: 'Grau' },
      { value: '#000000', name: 'Schwarz' },
      { value: '#ffffff', name: 'Weiß' },
    ];
  }

  _renderCalendar(index, calendar) {
    const colorOptions = this._getColorOptions();
    const currentColor = calendar.color || '#ff0000';
    
    return html`
      <div class="calendar-item">
        <h4>Kalender ${calendar.shortcut.toUpperCase()}</h4>
        <div class="calendar-fields">
          <ha-textfield
            label="Name"
            .value=${calendar.name || ''}
            maxlength="30"
            @input=${(e) => this._updateCalendar(calendar.shortcut, 'name', e.target.value)}
          ></ha-textfield>
          <ha-switch
            label="Aktiviert"
            .checked=${calendar.enabled || false}
            @change=${(e) => this._updateCalendar(calendar.shortcut, 'enabled', e.target.checked)}
          ></ha-switch>
          <div class="color-selector">
            <div class="color-selector-label">Farbe</div>
            <ha-combo-box
              label="Farbe"
              .value=${currentColor}
              .items=${colorOptions.map(color => ({
                value: color.value,
                label: `${color.name} (${color.value})`
              }))}
              @value-changed=${(e) => {
                const value = e.detail?.value;
                if (value) {
                  this._updateCalendar(calendar.shortcut, 'color', value);
                }
              }}
            ></ha-combo-box>
            <div class="color-selected-preview">
              <span class="color-preview-large" style="background-color: ${currentColor};"></span>
              <span class="color-selected-value">${currentColor}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  _updateCalendar(shortcut, property, value) {
    // Standardkalender (a) ist fix und kann nicht geändert werden
    if (shortcut === 'a') {
      return;
    }
    
    if (!this.config.calendars) {
      this.config.calendars = [
        { shortcut: 'a', name: 'Standardkalender', color: '#ff9800', enabled: true },
        { shortcut: 'b', name: 'Kalender B', color: '#ff0000', enabled: false },
        { shortcut: 'c', name: 'Kalender C', color: '#00ff00', enabled: false },
        { shortcut: 'd', name: 'Kalender D', color: '#0000ff', enabled: false },
        { shortcut: 'e', name: 'Kalender E', color: '#ffff00', enabled: false },
      ];
    }
    
    // Erstelle eine neue Kopie des Arrays und aktualisiere den betroffenen Kalender
    const newCalendars = this.config.calendars.map(cal => {
      if (cal.shortcut === shortcut) {
        return {
          ...cal,
          [property]: value,
        };
      }
      // Stelle sicher, dass Standardkalender (a) immer fixe Werte hat
      if (cal.shortcut === 'a') {
        return { shortcut: 'a', name: 'Standardkalender', color: '#ff9800', enabled: true };
      }
      return cal;
    });
    
    // Aktualisiere die Config direkt (immutable update)
    const newConfig = {
      ...this.config,
      calendars: newCalendars,
    };
    
    // Aktualisiere die Config direkt
    this.config = newConfig;
    
    // Aktualisiere die Ansicht sofort
    this.requestUpdate();
    
    // Dispatch config-changed Event - Home Assistant speichert die Config automatisch
    // Verwende setTimeout, um sicherzustellen, dass das Event nicht den Editor schließt
    setTimeout(() => {
      this.dispatchEvent(
        new CustomEvent('config-changed', {
          detail: { config: newConfig },
          bubbles: true,
          composed: true,
        })
      );
    }, 0);
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
      
      .calendars-list {
        margin-top: 15px;
      }
      
      .calendar-item {
        margin-bottom: 20px;
        padding: 15px;
        background-color: var(--card-background-color, #ffffff);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 4px;
      }
      
      .calendar-item h4 {
        margin: 0 0 15px 0;
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color, #000000);
      }
      
      .calendar-fields {
        display: grid;
        grid-template-columns: 1fr;
        gap: 15px;
      }
      
      .calendar-fields ha-textfield,
      .calendar-fields ha-switch,
      .calendar-fields .color-selector {
        width: 100%;
      }
      
      ha-switch {
        display: flex;
        align-items: center;
      }

      .color-selector {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .color-selector-label {
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color, #000000);
      }

      .color-selector ha-combo-box {
        width: 100%;
      }

      .color-option {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 4px 0;
      }

      .color-preview {
        display: inline-block;
        width: 24px;
        height: 24px;
        border-radius: 4px;
        border: 1px solid var(--divider-color, #e0e0e0);
        flex-shrink: 0;
      }

      .color-preview-large {
        display: inline-block;
        width: 32px;
        height: 32px;
        border-radius: 4px;
        border: 2px solid var(--divider-color, #e0e0e0);
        flex-shrink: 0;
      }

      .color-name {
        flex: 1;
        font-weight: 500;
      }

      .color-value {
        font-size: 12px;
        color: var(--secondary-text-color, #888888);
        font-family: monospace;
      }

      .color-selected-preview {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px;
        background-color: var(--card-background-color, #f5f5f5);
        border-radius: 4px;
        border: 1px solid var(--divider-color, #e0e0e0);
      }

      .color-selected-value {
        font-size: 14px;
        font-family: monospace;
        color: var(--primary-text-color, #000000);
        font-weight: 500;
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
      useElements: false,
      mode: 'single',
      selectedElement: null,
      elements: [
        { benennung: 'Element 1', aktiv: true, color: '#ff0000', shortcut: '1' },
        { benennung: 'Element 2', aktiv: true, color: '#00ff00', shortcut: '2' },
        { benennung: 'Element 3', aktiv: true, color: '#0000ff', shortcut: '3' },
        { benennung: 'Element 4', aktiv: true, color: '#ffff00', shortcut: '4' },
      ],
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
