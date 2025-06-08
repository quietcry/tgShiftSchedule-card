# Entwicklungsanleitung für TG EPG Card

## Voraussetzungen

- Node.js (v14 oder höher)
- npm (v6 oder höher)
- Git
- Home Assistant Installation

## Installation

1. Repository klonen:
   ```bash
   git clone git@192.168.1.160:tommy/tgEPG-card.git
   cd tgEPG-card
   ```

2. Abhängigkeiten installieren:
   ```bash
   npm install
   ```

## Entwicklung

1. Starten Sie den Entwicklungsserver:
   ```bash
   npm run watch
   ```

2. Die Card wird automatisch neu gebaut, wenn Sie Änderungen vornehmen.

## Bauen

Um die Card zu bauen:
```bash
npm run build
```

Die gebaute Card finden Sie in `dist/tgepg-card.js`.

## Integration in Home Assistant

1. Kopieren Sie die gebaute Card (`dist/tgepg-card.js`) in Ihren `www` Ordner in Home Assistant.

2. Fügen Sie die Ressource in Ihrer `configuration.yaml` hinzu:
   ```yaml
   resources:
     - url: /local/tgepg-card.js
       type: module
   ```

3. Fügen Sie die Card zu Ihrem Dashboard hinzu:
   ```yaml
   type: 'custom:tgepg-card'
   ```

## Wichtige Hinweise

- Die Card verwendet die `ha-form` Komponente für den Editor
- Stellen Sie sicher, dass Sie die richtigen Abhängigkeiten in Ihrer `package.json` haben
- Die Card ist als Boilerplate für zukünftige Projekte gedacht

## Projektstruktur

- **Base files** (`card-base.js`, `editor-base.js`): Enthalten allgemeinen, wiederverwendbaren Code
- **Impl files** (`card-impl.js`, `editor-impl.js`): Enthalten spezifische Implementierungen für die Karte
- **Editor.js**: Dient nur als Wrapper für die spezifische Implementierung ohne spezifische Logik

Um eine neue Karte zu erstellen, müssen Sie:
1. `card.js` für die Registrierung anpassen
2. `card-impl.js` für die spezifische Karten-Implementierung anpassen
3. `editor-impl.js` für die spezifische Editor-Logik mit dem Form-Schema anpassen

## Zentrale Konfigurationsdatei: `card-config.js`

Die Datei `src/card-config.js` enthält alle wichtigen Konfigurationsvariablen für die Karte:

```javascript
const CardRegname = 'tgepg-card';  // Name für die Registrierung
const CardName = 'TG EPG Card';    // Anzeigename
const CardDescription = 'Eine Karte für die EPG-Anzeige';  // Beschreibung
const CardFilename = 'tgepg-card.js';  // Dateiname
const Version = '2025.06-0005';  // Version
const IsTemplate = false;  // Template-Status
```

Diese Variablen werden an verschiedenen Stellen verwendet:
- `CardRegname`: Für die Registrierung der Karte
- `CardName`: Als Anzeigename im UI
- `CardDescription`: Als Beschreibung im UI
- `CardFilename`: Für den Build-Prozess
- `Version`: Für die Versionskontrolle
- `IsTemplate`: Um zu kennzeichnen, ob es sich um ein Template handelt

## Versionsverwaltung

Die Card verwendet ein automatisches Versionssystem, das durch einen Git Pre-Commit Hook gesteuert wird. Der Hook befindet sich in `.git/hooks/pre-commit` und wird vor jedem Commit ausgeführt.

### Funktionsweise

1. Der Hook ruft das Script `/tgdata/coding/githook_scripts/update-version.sh` auf
2. Das Script aktualisiert die Version in `src/card-config.js` nach dem Schema `YYYY.MM-XXXX`
   - `YYYY`: Aktuelles Jahr
   - `MM`: Aktueller Monat
   - `XXXX`: Fortlaufende Nummer (wird bei jedem Commit erhöht, am Monatsanfang zurückgesetzt)
3. Die aktualisierte Version wird automatisch zum Commit hinzugefügt

### Beispiel

- Erster Commit im März 2024: `2024.03-0001`
- Zweiter Commit im März 2024: `2024.03-0002`
- Erster Commit im April 2024: `2024.04-0001`

### Hinweise

- Der Hook muss ausführbar sein (`chmod +x .git/hooks/pre-commit`)
- Bei Fehlern im Script wird der Commit abgebrochen
- Die Versionsdatei muss das Format `Version = 'YYYY.MM-XXXX'` enthalten

### Hook-Code

```bash
#!/bin/sh
#
# Pre-Commit Hook für die TG EPG Card
# Führt die Versionsverwaltung durch und prüft auf Whitespace-Fehler
# Wird automatisch vor jedem Commit ausgeführt
#

# Versionsdatei definieren
VERSION_FILE="src/card-config.js"

# Versionsverwaltung durchführen
/tgdata/coding/githook_scripts/update-version.sh "$VERSION_FILE"

# Prüfen ob die Versionsverwaltung erfolgreich war
if [ $? -ne 0 ]; then
    echo "Fehler: Versionsverwaltung fehlgeschlagen"
    exit 1
fi

# Basis für Diff-Checks ermitteln
if git rev-parse --verify HEAD >/dev/null 2>&1; then
    against=HEAD
else
    # Bei erstem Commit: Leeren Tree als Basis verwenden
    against=$(git hash-object -t tree /dev/null)
fi

# Whitespace-Checks durchführen
exec git diff-index --check --cached $against --

exit 0
```