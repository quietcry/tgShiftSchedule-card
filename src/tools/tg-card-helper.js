import { CardName, DebugMode, Version } from '../card-config.js';

export class TgCardHelper {
  static cardName = CardName;
  static debugMode = DebugMode;
  static className = 'TgCardHelper';
  static version = Version;

  constructor(cardName, debugMode, className, version) {
    this.cardName = cardName || this.constructor.cardName || null;
    this.debugMode = debugMode || this.constructor.debugMode || 'true';
    this.className = className || this.constructor.className || null;
    this.version = version || this.constructor.version || null;
    this.getCardInfoString = [
      `%c${this.cardName}%c${this.version}%c`,
      'background: #9c27b0; color: white; padding: 2px 6px; border-top-left-radius: 12px; border-bottom-left-radius: 12px; font-weight: bold;',
      'background: #00bcd4; color: white; padding: 2px 6px; border-top-right-radius: 12px; border-bottom-right-radius: 12px; font-weight: bold;',
      '',
    ];

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
    let contextObject = null;

    // Prüfe ob das erste Argument ein Kontext-Objekt ist (this aus SuperBase)
    // Kontext-Objekt erkennt man daran, dass es eine constructor-Eigenschaft hat UND
    // spezifische Eigenschaften unserer Klassen hat (cardName ist einzigartig für unsere Klassen)
    if (Array.isArray(args[0]) && args[0].length === 1 && args[0][0] && typeof args[0][0] === 'object' && args[0][0].constructor && (args[0][0].cardName || args[0][0].constructor.className)) {
      contextObject = args[0][0];
      args = args.slice(1);
    }
    else {
      contextObject = this;
    }

    // Extrahiere Informationen aus dem Kontext-Objekt (immer vorhanden)
    // Methode 1: Statischer Klassennamen (falls definiert)
    if (contextObject.constructor.className) {
      className = contextObject.constructor.className;
    }
    // Methode 2: Tag-Name des Custom Elements
    else if (contextObject.tagName) {
      className = contextObject.tagName.toLowerCase().replace(/[^a-z0-9]/g, '');
    }
    // Methode 3: Constructor name (kann minifiziert sein)
    else if (contextObject.constructor.name && contextObject.constructor.name.length > 2) {
      className = contextObject.constructor.name;
    }
    // Methode 4: Fallback auf cardName
    else if (contextObject.cardName) {
      className = contextObject.cardName;
    }
    // Methode 5: Fallback auf Default
    else {
      className = classNameDefault;
    }

    cardName = contextObject.cardName || this.cardName || cardNameDefault;

    // Prüfe sofort, ob wir Debug-Meldungen für diese Klasse ausgeben sollen
    const debugList = this.debugMode.split(',').map(item => item.trim().toLowerCase());
    const shouldDebug =
      debugList[0].toLowerCase() === 'true'
        ? !debugList.slice(1).includes(className.toLowerCase())
        : debugList.includes(className.toLowerCase());

    // Wenn wir keine Debug-Meldungen ausgeben sollen, beende hier
    if (!shouldDebug) return;

    // Ermittle den Methodennamen nur wenn wir Debug-Meldungen ausgeben
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

    // Erstelle Debug-Ausgabe
    let path = `[${cardName}]:[${className}]:[${methodName}]`;
    while (path.length < 50) {
      path = path + ' ';
    }
  }
}
