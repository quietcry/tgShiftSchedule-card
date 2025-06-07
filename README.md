# TG Editor Card

Eine moderne Home Assistant Card mit visuellem Editor, basierend auf dem ha-form als Boilerplate für zukünftige Projekte.

## Installation

1. Kopieren Sie die .js Datei im dist-Ordner  in Ihren `config/www` Ordner in Home Assistant.
2. Fügen Sie die folgende Ressource `/local/????.js` im Dashbord hinzu:


## Entwicklung
0. lesen sie die dev-instructions

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

Alle Änderungen werden automatisch in der Lovelace-Konfiguration gespeichert. 
# Test
