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

4. Karte bauen:
   ```bash
   npm run build
   ```

## Projektstruktur

- `src/`: Quellcode
  - `tgeditor-card.js`: Hauptdatei
  - `tgeditor-card-editor.js`: Editor-Komponente
  - `base-card.js`: Basis-Karte
  - `base-card-editor.js`: Basis-Editor
  - `tgeditor-card-impl.js`: Spezifische Karten-Implementierung
  - `tgeditor-card-editor-impl.js`: Spezifische Editor-Implementierung
- `dist/`: Kompilierte Dateien
- `webpack.config.js`: Webpack-Konfiguration
- `.babelrc`: Babel-Konfiguration 