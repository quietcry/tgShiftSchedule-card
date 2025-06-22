export class TgCardHelper {
  constructor(cardName = '', debugMode = false) {
    this.cardName = cardName;
    this.debugMode = debugMode;

    if (this.debugMode) console.debug(`[${this.cardName}] tgCardHelper-Modul wird geladen`);
    this._debug('tgCardHelper initialisiert');
  }
  _debug(className, message, data = null) {
    if (!this.debugMode) return;

    const debugList = this.debugMode.split(',').map(item => item.trim().toLowerCase());
    const shouldDebug =
      debugList[0].toLowerCase() === 'true'
        ? !debugList.slice(1).includes(className.toLowerCase())
        : debugList.includes(className.toLowerCase());

    if (shouldDebug) {
      if (data) {
        console.debug(`[${this.cardName}] [${className}] :: ${message}`, data);
      } else {
        console.debug(`[${this.cardName}] [${className}] :: ${message}`);
      }
    }
  }
}
