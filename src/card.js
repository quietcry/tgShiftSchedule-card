import { CardImpl } from './card-impl.js';
import './editor/editor.js';

export class Card extends CardImpl {
  // className wird von CardImpl geerbt (ist 'CardImpl')
  static get styles() {
    return [
      super.styles,
      // css wird über super.styles geerbt
    ];
  }

  constructor() {
    super();
    // console.info(`%c[${Card.cardName}]%c Card wird initialisiert`,
    //   'background: #2196f3; color: white; padding: 2px 6px; border-radius: 12px; font-weight: bold;',
    //   'color: #333;');
  }

  connectedCallback() {
    super.connectedCallback();
    console.info(
      `%c${Card.cardName}%c${Card.version}`,
      'background: #9c27b0; color: white; padding: 2px 6px; border-top-left-radius: 12px; border-bottom-left-radius: 12px; font-weight: bold;',
      'background: #00bcd4; color: white; padding: 2px 6px; border-top-right-radius: 12px; border-bottom-right-radius: 12px; font-weight: bold;'
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // console.info(`%c[${Card.cardName}]%c Card ist getrennt`,
    //   'background: #ff9800; color: white; padding: 2px 6px; border-radius: 12px; font-weight: bold;',
    //   'color: #333;');
  }
}

// Registriere die Karte in der UI
if (window.customCards) {
  window.customCards.push({
    type: Card.cardRegname,
    name: Card.cardName,
    description: Card.cardDescription,
    preview: true,
  });
  // console.info(`%c[${Card.cardName}]%c Karte in customCards registriert`,
  //   'background: #9c27b0; color: white; padding: 2px 6px; border-radius: 12px; font-weight: bold;',
  //   'color: #333;');
}

// Registriere die Karte als Custom Element
if (!customElements.get(Card.cardRegname)) {
  try {
    customElements.define(Card.cardRegname, Card);
    // console.info(`%c[${Card.cardName}]%c Custom Element erfolgreich registriert`,
    //   'background: #00bcd4; color: white; padding: 2px 6px; border-radius: 12px; font-weight: bold;',
    //   'color: #333;');
  } catch (error) {
    console.error(
      `%c[${Card.cardName}]%c Fehler bei der Custom Element-Registrierung:`,
      'background: #f44336; color: white; padding: 2px 6px; border-radius: 12px; font-weight: bold;',
      'color: #333;',
      error
    );
  }
}
