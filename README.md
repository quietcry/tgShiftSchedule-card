# TG Kalender Card

Eine Kalender-Karte für Home Assistant zur Verwaltung von Arbeitszeiten.

## Funktionen

- Kalenderansicht für den laufenden und den Folgemonat
- Toggle-Buttons für jeden Tag zum Ein- und Ausschalten der Arbeitszeiten
- Speicherung der Daten in einem `input_text` Entity
- Format: `<monatsnummer>:<tag>,<tag>;` (z.B. `12:1,2,3,4,5;1:1,2,3`)

## Installation

1. Kopiere die Datei `tgcalendar-card.js` aus dem `dist` Ordner in deinen `www` Ordner (z.B. `config/www/tgCalendar/`)
2. Füge die Ressource in Home Assistant ein:
   - Einstellungen → Dashboards → Ressourcen
   - URL: `/local/tgCalendar/tgcalendar-card.js`
   - Typ: JavaScript-Modul

## Voraussetzungen

Erstelle ein `input_text` Entity in deiner `configuration.yaml`:

```yaml
input_text:
  arbeitszeiten:
    name: Arbeitszeiten
    initial: ""
```

## Verwendung

Füge die Karte zu deinem Dashboard hinzu:

```yaml
type: custom:tgcalendar-card
entity: input_text.arbeitszeiten
```

## Datenformat

Die Arbeitszeiten werden im folgenden Format gespeichert:

```
<monatsnummer>:<tag>,<tag>,<tag>;<monatsnummer>:<tag>,<tag>
```

Beispiel:
- `12:1,2,3,4,5;1:1,2,3` bedeutet:
  - Dezember (Monat 12): Tage 1, 2, 3, 4, 5 sind Arbeitszeiten
  - Januar (Monat 1): Tage 1, 2, 3 sind Arbeitszeiten

**Wichtig**: Es werden nur die Tage gespeichert, an denen Sie arbeiten müssen.

## Entwicklung

```bash
npm install
npm run build
```

Die kompilierte Datei wird in `dist/tgcalendar-card.js` erstellt.
