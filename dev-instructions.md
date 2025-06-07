# Entwicklungsanleitung für TGEditor Card

## Voraussetzungen

- Node.js (Version 14 oder höher)
- npm (Version 6 oder höher)

## Installation

1. Repository klonen
2. Abhängigkeiten installieren:
   ```bash
   npm install
   ```

## Entwicklung

1. Starten Sie den Entwicklungsserver:
   ```bash
   npm run dev
   ```

2. Die Karte wird automatisch neu gebaut, wenn Sie Änderungen vornehmen.

## Build

Um die Karte zu bauen:
```bash
npm run build
```

Die kompilierte Datei wird im `dist`-Ordner erstellt.

## In Home Assistant einbinden

1. Kopieren Sie die Datei `dist/tg-editor-card.js` in den `www`-Ordner Ihrer Home Assistant Installation
2. Fügen Sie die Ressource in Ihrer `configuration.yaml` hinzu:
   ```yaml
   resources:
     - url: /local/tg-editor-card.js
       type: module
   ```

## In ein neues Projekt klonen

1. Repository klonen
2. Abhängigkeiten installieren:
   ```bash
   npm install
   ```

3. Anpassungen vornehmen:
   - Passen Sie den Namen der Ausgabedatei in `webpack.config.js` an:
     ```javascript
     output: {
       filename: 'tg-editor-card.js', // Hier den gewünschten Namen eintragen
       path: path.resolve(__dirname, 'dist'),
     }
     ```
   - Aktualisieren Sie die Ressourcen-URL in Ihrer Home Assistant Konfiguration entsprechend
   - **Wichtig**: Ändern Sie den Klassennamen der Karte, wenn Sie mehrere Karten verwenden:
     ```javascript
     // In tgeditor-card.js
     customElements.define('meine-eigene-karte', TGEditorCardImpl);
     
     // In tgeditor-card-editor.js
     customElements.define('meine-eigene-karte-editor', TGEditorCardEditorImpl);
     ```

4. Karte bauen:
   ```bash
   npm run build
   ```

## Wichtige Hinweise

### Klassennamen-Konflikte

Wenn Sie mehrere Karten in Home Assistant verwenden, müssen Sie sicherstellen, dass jede Karte einen eindeutigen Klassennamen hat. Andernfalls kann es zu Konflikten kommen, da:

- Jeder Element-Name nur einmal registriert werden kann
- Die zweite Registrierung würde die erste überschreiben
- Unterschiedliche Methoden könnten sich gegenseitig beeinflussen

Empfehlungen:
1. Verwenden Sie eindeutige Klassennamen für jede Karte
2. Nutzen Sie einen Namespace-Prefix (z.B. `myapp-first-card`, `myapp-second-card`)
3. Dokumentieren Sie die verwendeten Klassennamen

### Vererbung und Unterklassen

Die Basis-Klassen (`BaseCard` und `BaseCardEditor`) sind so konzipiert, dass sie als Grundlage für verschiedene Karten dienen können. Sie können mehrere Karten erstellen, die von diesen Basis-Klassen erben, ohne dass es zu Konflikten kommt:

```javascript
// Erste Karte
class FirstCardImpl extends BaseCard {
  // Spezifische Implementierung
}
customElements.define('first-card', FirstCardImpl);

// Zweite Karte
class SecondCardImpl extends BaseCard {
  // Andere spezifische Implementierung
}
customElements.define('second-card', SecondCardImpl);
```

Vorteile der Vererbung:
- Wiederverwendung von gemeinsamem Code
- Konsistentes Verhalten durch die Basis-Klasse
- Einfache Erweiterung durch Überschreiben von Methoden
- Keine Konflikte zwischen verschiedenen Implementierungen

### Klassen mit gleichem Namen

Sie können in verschiedenen Karten Klassen mit dem gleichen Namen verwenden, solange die registrierten Element-Namen unterschiedlich sind. Beispiel:

```javascript
// Karte 1
class Editor {
  // Spezifische Implementierung für Karte 1
  render() {
    return html`<div>Editor für Karte 1</div>`;
  }
}
customElements.define('karte1-editor', Editor);

// Karte 2
class Editor {
  // Völlig andere Implementierung für Karte 2
  render() {
    return html`<div>Editor für Karte 2</div>`;
  }
}
customElements.define('karte2-editor', Editor);
```

In diesem Beispiel:
- Beide Klassen heißen `Editor`
- Sie haben unterschiedliche Implementierungen
- Sie werden unter verschiedenen Element-Namen registriert
- Es gibt keine Konflikte, da die Element-Namen eindeutig sind

### Komponenten-Abhängigkeiten

Jede Komponente ist für ihre eigenen Abhängigkeiten verantwortlich. Beispiel:

```javascript
// Editor-Komponente
import { loadHaForm } from './load-ha-form';

class Editor {
  async firstUpdated() {
    await loadHaForm(); // Editor lädt ha-form
  }
}

// Karten-Komponente
class Card {
  // Karte muss ha-form nicht importieren,
  // da sie es nicht direkt verwendet
}
```

Wichtige Punkte:
- Jede Komponente importiert nur die Abhängigkeiten, die sie selbst benötigt
- Abhängigkeiten werden nicht automatisch an Kind-Komponenten weitergegeben
- Die Karte muss nicht wissen, welche Abhängigkeiten der Editor hat
- Dies fördert lose Kopplung und bessere Wartbarkeit

## Projektstruktur

Das Projekt ist in verschiedene Komponenten aufgeteilt, die unterschiedliche Verantwortlichkeiten haben:

### Base-Dateien
- `card-base.js`, `editor-base.js`
- Enthalten den allgemeinen, wiederverwendbaren Code
- Beispiel: `loadHaForm` in `editor-base.js`
- Beispiel: Grundlegende Card-Funktionalität in `card-base.js`

### Impl-Dateien
- `card-impl.js`, `editor-impl.js`
- Enthalten die spezifische Implementierung für diese Karte
- Beispiel: Formular-Schema und spezifische Logik in `editor-impl.js`
- Beispiel: Card-Darstellung in `card-impl.js`

### Editor.js
- Nur ein Wrapper für die spezifische Implementierung
- Keine spezifische Logik
- Nur Styling-Anpassungen

### Neue Karte erstellen
Um eine neue Karte zu erstellen, müssen nur folgende Dateien angepasst werden:
1. `card.js` - Hauptdatei mit Registrierung
2. `card-impl.js` - Spezifische Card-Implementierung
3. `editor-impl.js` - Spezifischer Editor mit Formular-Schema

Die `editor.js` ist ein allgemeiner Wrapper, der für alle Karten gleich bleibt.

## Zentrale Konfigurationsdatei: `card-config.js`

Die Datei `src/card-config.js` enthält zentrale Konstanten, die für die gesamte Card-Implementierung verwendet werden. Sie dient dazu, wichtige Werte wie den Registrierungsnamen, den Anzeigenamen, die Beschreibung und den Dateinamen der Card an einer Stelle zu definieren und konsistent im Projekt zu verwenden.

**Beispielinhalt:**
```js
const CardRegname = 'tgeditor-card';
const CardName = 'TG Editor Card';
const CardDescription = 'Eine Karte mit Editor-Funktionalität';
const CardFilename = 'tgeditor-card.js';

module.exports = {
  CardRegname,
  CardName,
  CardDescription,
  CardFilename
};
```

**Verwendung:**
- In der Webpack-Konfiguration (`webpack.config.js`) wird `CardFilename` für den Ausgabedateinamen verwendet.
- In `card.js` und `editor.js` werden die Werte für die Registrierung und Beschreibung der Card genutzt.

**Vorteile:**
- Änderungen an Namen oder Dateinamen müssen nur an einer Stelle erfolgen.
- Konsistenz und Wartbarkeit im gesamten Projekt.

**Hinweis:**
Da Node.js (Webpack) keine ES6-Module direkt unterstützt, wird hier das CommonJS-Format (`module.exports`) verwendet. In den Quellcode-Dateien wird daher `require()` zum Import genutzt.

### Versionsverwaltung

Die Version der Card wird in `src/card-config.js` verwaltet und folgt dem Format `YYYY.MM-XXXX`:
- `YYYY`: Jahr
- `MM`: Monat
- `XXXX`: Fortlaufende Nummer (4-stellig)

Beispiel: `2025.06-0001`

Die Version wird automatisch in der Card angezeigt (unten rechts) und sollte bei jeder Änderung aktualisiert werden. 