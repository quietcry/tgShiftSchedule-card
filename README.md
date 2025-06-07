# TG EPG Card

Eine Karte für die EPG-Anzeige in Home Assistant.

## Installation

1. Kopiere die Datei `tgepg-card.js` in deinen `www` Ordner
2. Füge die Ressource in deine `configuration.yaml` ein:
   ```yaml
   resources:
     - url: /local/tgepg-card.js
       type: module
   ```

## Verwendung

Füge die Karte zu deinem Dashboard hinzu und konfiguriere sie über den visuellen Editor.

## Entwicklung

Siehe [dev-instructions.md](dev-instructions.md) für Details zur Entwicklung.
