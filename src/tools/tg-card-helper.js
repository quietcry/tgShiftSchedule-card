import { CardName, DebugMode, Version } from '../card-config.js';

export class TgCardHelper {
  constructor(cardName, debugMode, className, version) {
    this.cardName = cardName || this.constructor.cardName || CardName || null;
    this.debugMode = debugMode || this.constructor.debugMode || DebugMode || 'true';
    this.className = className || this.constructor.className || null;
    this.version = version || this.constructor.version || Version || null;

    // if (this.debugMode) console.debug(`[${this.cardName}] tgCardHelper-Modul wird geladen`);
    // this._debug('tgCardHelper initialisiert');
  }
  _debug(...args) {
    if (!this.debugMode) return;

    // Versuche verschiedene Methoden, um den echten Klassennamen zu bekommen
    let classNameDefault = 'unknownClass';
    let methodNameDefault = 'unknownMethod';
    let cardNameDefault = 'unknownCard';
    let className = null;
    let methodName = null;
    let cardName = null;

    if (args[0] && args[0] instanceof Object && args[0].className) {
      className = args[0].className || className;
      methodName = args[0].methodName || methodName;
      cardName = args[0].cardName || cardName;
      args = args.slice(1);
    }
    // Versuche verschiedene Methoden, um den echten Klassennamen zu bekommen
    className =
      className ||
      this.className ||
      this.constructor.className ||
      this.tagName?.toLowerCase().replace(/[^a-z0-9]/g, '') ||
      this.constructor.name ||
      this.cardName ||
      classNameDefault;
    cardName = cardName || this.cardName || cardNameDefault;
    if (!methodName) {
      try {
        const stack = new Error().stack.split('\n');
        const callerLine = stack[2]; // Index 2 für die aufrufende Methode

        // Verschiedene Regex-Patterns für verschiedene Browser-Formate
        const patterns = [
          /at\s+\w+\.(\w+)/, // Chrome/Node.js: "at ClassName.methodName"
          /(\w+)@/, // Firefox: "methodName@"
          /(\w+)\s+\(/, // Alternative: "methodName("
          /at\s+(\w+)/, // Fallback: "at methodName"
        ];

        for (const pattern of patterns) {
          const methodMatch = callerLine.match(pattern);
          if (methodMatch) {
            methodName = methodMatch[1];
            break;
          }
        }
      } catch (error) {
        // Fallback falls Stack Trace nicht verfügbar
        methodName = null;
      }
    }
    methodName = methodName || methodNameDefault;

    const debugList = this.debugMode.split(',').map(item => item.trim().toLowerCase());
    const shouldDebug =
      debugList[0].toLowerCase() === 'true'
        ? !debugList.slice(1).includes(className.toLowerCase())
        : debugList.includes(className.toLowerCase());

    if (shouldDebug) {
      let path = `[${cardName}]:[${className}]:[${methodName}]`;
      while (path.length < 50) {
        path = path + ' ';
      }
      console.debug(path, ...args);
    }
  }
}
