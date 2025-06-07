# TG Editor Card

Eine moderne Home Assistant Card mit visuellem Editor, basierend auf dem ha-editor-formbuilder.

## Installation

1. Kopieren Sie die `tgeditor-card.js` Datei in Ihren `config/www` Ordner in Home Assistant.
2. Fügen Sie die folgende Ressource zu Ihrer `configuration.yaml` hinzu:

```yaml
lovelace:
  resources:
    - url: /local/tgeditor-card.js
      type: module
```

## Entwicklung

1. Installieren Sie die Abhängigkeiten:
```bash
npm install
```

2. Starten Sie den Entwicklungsserver:
```bash
npm run watch
```

3. Bauen Sie die Card:
```bash
npm run build
```

## Verwendung

Fügen Sie die Card zu Ihrer Lovelace-Konfiguration hinzu:

```yaml
type: 'custom:tgeditor-card'
```

Die Card enthält drei Beispiel-Controls:
- Text Eingabe
- Auswahlmenü
- Schalter

Alle Änderungen werden automatisch in der Lovelace-Konfiguration gespeichert. # Test
# Test2
# Test3
# Test4
# Test5
