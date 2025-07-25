export class TgCardHelper {
  constructor(cardName, debugMode, className) {
    this.cardName = cardName || this.constructor.cardName || 'unknownCard';
    this.debugMode = debugMode || this.constructor.debugMode || 'true';
    this.className = className || this.constructor.className || null;

    // if (this.debugMode) console.debug(`[${this.cardName}] tgCardHelper-Modul wird geladen`);
    // this._debug('tgCardHelper initialisiert');
  }
  _debug(...args) {
    if (!this.debugMode) return;

    // Versuche verschiedene Methoden, um den echten Klassennamen zu bekommen
    let className = 'UnknownClass';

    // Methode 1: Statischer Klassennamen (falls definiert)
    if (this.constructor.className) {
      className = this.constructor.className;
    }
    if (this.className) {
      className = this.className;
    }
    // Methode 2: Tag-Name des Custom Elements
    else if (this.tagName) {
      className = this.tagName.toLowerCase().replace(/[^a-z0-9]/g, '');
    }
    // Methode 3: Constructor name (kann minifiziert sein)
    else if (this.constructor.name && this.constructor.name.length > 2) {
      className = this.constructor.name;
    }
    // Methode 4: Fallback auf cardName
    else if (this.cardName) {
      className = this.cardName;
    }

    const debugList = this.debugMode.split(',').map(item => item.trim().toLowerCase());
    const shouldDebug =
      debugList[0].toLowerCase() === 'true'
        ? !debugList.slice(1).includes(className.toLowerCase())
        : debugList.includes(className.toLowerCase());

    if (shouldDebug) {
      console.debug(`[${this.cardName}] [${className}] ::`, ...args);
    }
  }
}
