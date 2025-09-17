import { TgCardHelper } from './tg-card-helper.js';

/**
 * Erweiterter Konfigurations-Processor für bedingte Konfigurationen
 * Unterstützt verschachtelte Bedingungen und Variablen-Überschreibungen
 */
export class ExtendedConfigProcessor extends TgCardHelper {
  static className = 'ExtendedConfigProcessor';

  constructor() {
    super();
    this.debugMarker = 'ExtendedConfigProcessor: ';
    this._debug(this.debugMarker + 'initialisiert');
  }

  /**
   * Verarbeitet die erweiterte Konfiguration
   * @param {Object} baseConfig - Basis-Konfiguration
   * @param {string|Object} extendedConfig - Erweiterte Konfiguration
   * @param {Object} env - Umgebungsvariablen
   * @returns {Object} Verarbeitete Konfiguration
   */
  processConfig(baseConfig, extendedConfig, env) {
    this._debug('ExtendedConfigProcessor: Verarbeite erweiterte Konfiguration', {
      baseConfig,
      extendedConfig: typeof extendedConfig === 'string' ? 'string' : 'object',
      extendedConfigContent: extendedConfig,
      extendedConfigLength: typeof extendedConfig === 'string' ? extendedConfig.length : 0,
      env,
    });

    try {
      // Eigener Parser für die erweiterte Konfiguration
      const config = this._parseExtendedConfig(extendedConfig);

      this._debug('ExtendedConfigProcessor: Konfiguration geparst:', config);

      // Schema validieren
      this._validateSchema(config);

      // Konfiguration verarbeiten
      let result = { ...baseConfig };

      // Direkte Liste von Regeln verarbeiten
      result = this._processLevel(result, Array.isArray(config) ? config : [], env);

      // Finale Konfiguration loggen
      this._logConfigComparison(baseConfig, result, env);
      this._debug('ExtendedConfigProcessor: Verarbeitete Konfiguration', { result });
      return result;
    } catch (error) {
      this._debug('ExtendedConfigProcessor: Fehler bei der Verarbeitung', {
        error: error.message,
        stack: error.stack,
        extendedConfig:
          typeof extendedConfig === 'string' ? extendedConfig.substring(0, 200) : 'Nicht-String',
      });
      // Bei Fehlern: Basiskonfiguration zurückgeben
      return baseConfig;
    }
  }

  /**
   * Verarbeitet eine Ebene der Konfiguration rekursiv
   * @param {Object} currentConfig - Aktuelle Konfiguration
   * @param {Array} level - Aktuelle Ebene
   * @param {Object} env - Umgebungsvariablen
   * @returns {Object} Verarbeitete Konfiguration
   */
  _processLevel(currentConfig, level, env) {
    let result = { ...currentConfig };

    for (const item of level) {
      if (item.is) {
        // Bedingung auswerten
        if (this._evaluateCondition(item.is, env)) {
          this._debug('ExtendedConfigProcessor: Bedingung erfüllt', {
            condition: item.is,
            env,
          });

          // Direkte Variablen aus dem Bedingungsitem anwenden
          result = this._applyVariables(result, item);

          // Verschachtelte Bedingungen verarbeiten (direkte Verschachtelung oder item.sub)
          const nestedItems = this._getNestedItems(item);
          if (nestedItems && nestedItems.length > 0) {
            result = this._processLevel(result, nestedItems, env);
          }
        }
      } else {
        // Direkte Variablen-Zuweisung (ohne Bedingung)
        result = this._applyVariables(result, item);
        this._debug('ExtendedConfigProcessor: Variable angewendet', {
          variables: item,
        });
      }
    }

    return result;
  }

  /**
   * Ermittelt verschachtelte Items (direkte Verschachtelung oder item.sub)
   * @param {Object} item - Das aktuelle Item
   * @returns {Array|null} Array der verschachtelten Items oder null
   */
  _getNestedItems(item) {
    // Klassische item.sub Verschachtelung
    if (item.sub && Array.isArray(item.sub)) {
      return item.sub;
    }

    // Direkte Verschachtelung: Alle Properties die Arrays sind (außer 'is')
    const nestedArrays = [];
    for (const [key, value] of Object.entries(item)) {
      if (key !== 'is' && Array.isArray(value)) {
        nestedArrays.push(...value);
      }
    }

    return nestedArrays.length > 0 ? nestedArrays : null;
  }

  /**
   * Wendet Variablen auf die aktuelle Konfiguration an
   * @param {Object} currentConfig - Aktuelle Konfiguration
   * @param {Object} variables - Zu applizierende Variablen
   * @returns {Object} Konfiguration mit angewendeten Variablen
   */
  _applyVariables(currentConfig, variables) {
    const result = { ...currentConfig };

    for (const [key, value] of Object.entries(variables)) {
      // Nur Properties übernehmen, die bereits in der baseConfig existieren
      if (key !== 'is' && key !== 'sub' && key in currentConfig) {
        result[key] = value;
        this._debug('ExtendedConfigProcessor: Variable angewendet', { key, value });
      } else if (key !== 'is' && key !== 'sub' && !(key in currentConfig)) {
        this._debug('ExtendedConfigProcessor: Property ignoriert (existiert nicht in baseConfig)', {
          key,
          value,
        });
      }
    }

    return result;
  }

  /**
   * Wertet eine Bedingung aus
   * @param {string} condition - Bedingung (z.B. "cardWidth > 500")
   * @param {Object} env - Umgebungsvariablen
   * @returns {boolean} true wenn Bedingung erfüllt
   */
  _evaluateCondition(condition, env) {
    try {
      // Spezialfall: "true" ist immer erfüllt
      if (condition.trim() === 'true') {
        return true;
      }

      const [variable, operator, value] = condition.trim().split(' ');

      if (!variable || !operator || value === undefined) {
        this._debug('ExtendedConfigProcessor: Ungültige Bedingungssyntax', { condition });
        return false;
      }

      const envValue = this._getEnvValue(variable, env);
      const compareValue = this._parseValue(value);

      this._debug('ExtendedConfigProcessor: Bedingung auswerten', {
        condition,
        variable,
        operator,
        envValue,
        compareValue,
      });

      switch (operator) {
        case '>':
          return envValue > compareValue;
        case '<':
          return envValue < compareValue;
        case '=':
          return envValue == compareValue;
        case '>=':
          return envValue >= compareValue;
        case '<=':
          return envValue <= compareValue;
        default:
          this._debug('ExtendedConfigProcessor: Unbekannter Operator', { operator });
          return false;
      }
    } catch (error) {
      this._debug('ExtendedConfigProcessor: Fehler bei Bedingungsauswertung', {
        condition,
        error,
      });
      return false;
    }
  }

  /**
   * Holt einen Wert aus der Umgebung
   * @param {string} variable - Variablenname
   * @param {Object} env - Umgebungsvariablen
   * @returns {*} Wert der Variable
   */
  _getEnvValue(variable, env) {
    const value = env[variable];
    if (value === undefined) {
      this._debug('ExtendedConfigProcessor: Variable nicht gefunden', { variable, env });
      return null;
    }
    return value;
  }

  /**
   * Parst einen Wert (Zahl oder String)
   * @param {string} value - Zu parsender Wert
   * @returns {number|string} Geparster Wert
   */
  _parseValue(value) {
    // Versuche als Zahl zu parsen
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      return numValue;
    }

    // Entferne Anführungszeichen falls vorhanden
    return value.replace(/^["']|["']$/g, '');
  }

  /**
   * Validiert das YAML-Schema
   * @param {Object} config - Zu validierende Konfiguration
   * @throws {Error} Bei ungültigem Schema
   */
  _validateSchema(config) {
    if (!config || typeof config !== 'object') {
      throw new Error('Konfiguration muss ein Objekt sein');
    }

    // Konfiguration muss ein Array sein
    if (!Array.isArray(config)) {
      throw new Error('Konfiguration muss ein Array sein');
    }

    // Weitere Schema-Validierung hier...
  }

  /**
   * Eigener Parser für die erweiterte Konfiguration
   * @param {string|Object} extendedConfig - Erweiterte Konfiguration
   * @returns {Array} Geparste Konfiguration
   */
  _parseExtendedConfig(extendedConfig) {
    // Falls es bereits ein Objekt ist, direkt zurückgeben
    if (typeof extendedConfig === 'object' && extendedConfig !== null) {
      return extendedConfig;
    }

    // Falls es ein String ist, parsen
    if (typeof extendedConfig === 'string') {
      return this._parseConfigString(extendedConfig);
    }

    // Fallback: Leeres Array
    return [];
  }

  /**
   * Parst einen Konfigurations-String
   * @param {string} configString - Konfigurations-String
   * @returns {Array} Geparste Konfiguration
   */
  _parseConfigString(configString) {
    const lines = configString.split('\n');
    const result = [];
    const stack = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) continue; // Kommentare und leere Zeilen überspringen

      const indent = this._getIndentLevel(line);
      const isListItem = trimmedLine.startsWith('- ');

      if (isListItem) {
        // Neues List-Item
        const item = this._parseListItem(trimmedLine);

        // Einrückung verarbeiten - alle Items mit gleicher oder größerer Einrückung vom Stack entfernen
        while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
          stack.pop();
        }

        if (stack.length === 0) {
          // Top-Level Item
          result.push(item);
          stack.push({ item, indent });
        } else {
          // Verschachteltes Item - automatisch dem übergeordneten Item hinzufügen
          const parent = stack[stack.length - 1].item;
          if (!parent.sub) parent.sub = [];
          parent.sub.push(item);
          stack.push({ item, indent });
        }
      } else {
        // Property-Zuweisung
        const [key, value] = this._parseProperty(trimmedLine);
        if (key && value !== undefined) {
          if (stack.length === 0) {
            // Top-Level Property - neues Item erstellen
            const newItem = {};
            newItem[key] = value;
            result.push(newItem);
          } else {
            // Verschachtelte Property - dem aktuellen Item hinzufügen
            const current = stack[stack.length - 1].item;
            current[key] = value;
          }
        }
      }
    }

    return result;
  }

  /**
   * Ermittelt die Einrückungsebene einer Zeile
   * @param {string} line - Zeile
   * @returns {number} Einrückungsebene
   */
  _getIndentLevel(line) {
    let indent = 0;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === ' ' || line[i] === '\t') {
        indent++;
      } else {
        break;
      }
    }
    return indent;
  }

  /**
   * Parst ein List-Item
   * @param {string} line - Zeile mit List-Item
   * @returns {Object} Geparstes Item
   */
  _parseListItem(line) {
    const item = {};

    // "- is: "condition"" verarbeiten
    if (line.startsWith('- is:')) {
      const condition = line.substring(5).trim();
      if (condition.startsWith('"') && condition.endsWith('"')) {
        item.is = condition.substring(1, condition.length - 1);
      } else {
        item.is = condition;
      }
    } else {
      // Andere List-Items
      const content = line.substring(2).trim();
      if (content.includes(':')) {
        const [key, value] = this._parseProperty(content);
        if (key) item[key] = value;
      }
    }

    return item;
  }

  /**
   * Parst eine Property-Zuweisung
   * @param {string} line - Zeile mit Property
   * @returns {Array} [key, value]
   */
  _parseProperty(line) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return [null, undefined];

    const key = line.substring(0, colonIndex).trim();
    let value = line.substring(colonIndex + 1).trim();

    // Wert parsen
    if (value === '') {
      value = null;
    } else if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    } else if (!isNaN(value) && value !== '') {
      value = Number(value);
    } else if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }

    return [key, value];
  }

  /**
   * Loggt eine tabellarische Gegenüberstellung der Konfigurationswerte
   * @param {Object} baseConfig - Die ursprüngliche Konfiguration
   * @param {Object} result - Die finale, verarbeitete Konfiguration
   * @param {Object} env - Die verwendeten Umgebungsvariablen
   */
  _logConfigComparison(baseConfig, result, env) {
    this._debug('ExtendedConfigProcessor: Erstelle Konfigurationsvergleich');

    // Alle einzigartigen Keys sammeln
    const allKeys = new Set([...Object.keys(baseConfig), ...Object.keys(result)]);

    // Tabelle für console.table vorbereiten
    const tableData = {};

    for (const key of allKeys) {
      const baseValue = baseConfig[key];
      const resultValue = result[key];
      const hasChanged = baseValue !== resultValue;

      tableData[key] = {
        Ursprünglich: baseValue,
        Final: resultValue,
        Geändert: hasChanged ? '🔄 Ja' : '✅ Nein',
      };
    }

    // Zusammenfassung der Änderungen
    const changedKeys = Array.from(allKeys).filter(key => baseConfig[key] !== result[key]);
    // Umgebungsvariablen als separate Tabelle anzeigen
    const envTableData = {};
    if (Object.keys(env).length > 0) {
      Object.entries(env).forEach(([key, value]) => {
        envTableData[key] = {
          Wert: value,
          Typ: typeof value,
          String: String(value),
        };
      });
    }

    console.groupCollapsed(...this.getCardInfoString, 'Konfigurationsvergleich >>');
    console.log('\n🌍 Umgebungsvariablen für Bedingungsauswertung:');

    if (Object.keys(envTableData).length > 0) {
      console.table(envTableData);
    } else {
      console.log('\n⚠️  Keine Umgebungsvariablen verfügbar');
    }

    // console.group('📊 ExtendedConfigProcessor: Konfigurationsvergleich');
    console.table(tableData);

    if (changedKeys.length > 0) {
      console.log(`\n🔄 ${changedKeys.length} von ${allKeys.size} Werten wurden geändert:`);
      changedKeys.forEach(key => {
        console.log(`   • ${key}: ${baseConfig[key]} → ${result[key]}`);
      });
    } else {
      console.log('\n✅ Keine Änderungen - alle Werte sind identisch');
    }

    console.groupEnd();
  }
}
