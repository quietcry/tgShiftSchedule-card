import { LitElement, css } from 'lit';
import { CardName, Version, DebugMode, showVersion, UseDummyData } from './card-config.js';
import { TgCardHelper } from './tools/tg-card-helper.js';

export class SuperBase extends LitElement {
  static cardName = CardName;
  static version = Version;
  static debugMode = DebugMode;
  static useDummyData = UseDummyData;
  static showVersion = showVersion;
  static className = 'SuperBase';

  static properties = {
    hass: { type: Object },
    config: { type: Object },
  };

  static styles = [
    css`
      :host {
        display: block;
      }
    `,
  ];

  constructor() {
    super();
    this.dM = `${this.constructor.className}: `; // debugMsgPrefix - Prefix für Debug-Nachrichten

    this.cardName = this.constructor.cardName;
    this.version = this.constructor.version;
    this.debugMode = this.constructor.debugMode;
    this.useDummyData = this.constructor.useDummyData;
    this.showVersion = this.constructor.showVersion;
    this.tgCardHelper = new TgCardHelper(this.constructor.cardName, this.constructor.debugMode);
    this.getCardInfoString = this.tgCardHelper.getCardInfoString;
    this._debug('SuperBase-Konstruktor wird aufgerufen');
  }

  registerMeForChangeNotifys(eventTypes = '', that = this) {
    const dM = `${this.dM || '?: '}registerMeForChangeNotifys() `;
    this._debug(`${dM} Aufruf`, { eventTypes, that });
    this.dispatchEvent(
      new CustomEvent('registerMeForChanges', {
        bubbles: true,
        composed: true,
        detail: {
          component: that,
          callback: this._handleOnChangeNotifys.bind(this),
          eventType: eventTypes,
          immediately: true,
        },
      })
    );
  }

  _handleOnChangeNotifys(eventdata) {
    const dM = `${this.dM || '?: '}_handleOnChangeNotifys() `;
    this._debug(`${dM}aufgerufen`, { eventdata });
    for (const eventType of Object.keys(eventdata)) {
      const fkt = '_handleOnChangeNotify_' + eventType.charAt(0).toUpperCase() + eventType.slice(1);
      if (typeof this[fkt] === 'function') {
        this._debug(`${dM} ${fkt} aufgerufen`, { eventdata: eventdata[eventType] });
        this[fkt](eventdata[eventType]);
      } else {
        this._debug(`${dM} ${fkt} nicht gefunden`, { eventdata: eventdata[eventType] });
      }
    }
  }

  _debug(...args) {
    // Delegiere komplett an den TgCardHelper mit Kontext-Informationen
    this.tgCardHelper._debug([this], ...args);
  }
}
