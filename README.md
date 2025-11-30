# TG Schichtplan Card

Eine Schichtplan-Karte für Home Assistant zur Verwaltung von Arbeitszeiten und Schichten.

## Funktionen

- Schichtplanansicht für mehrere Monate (konfigurierbar, max. 14 Monate)
- Toggle-Buttons für jeden Tag zum Ein- und Ausschalten der Arbeitszeiten/Schichten
- Unterstützung für mehrere Schichten pro Tag (Standard + bis zu 4 weitere Schichten)
- Speicherung der Daten in einem oder mehreren `input_text` Entities
- Format: `<jahr>:<monat>:<tag><schicht>,<tag><schicht>;` (z.B. `25:11:03a,04ab,05a;25:12:01a`)

## Installation

1. Kopiere die Datei `tgshiftschedule-card.js` aus dem `dist` Ordner in deinen `www` Ordner (z.B. `config/www/tgShiftSchedule/`)
2. Füge die Ressource in Home Assistant ein:
   - Einstellungen → Dashboards → Ressourcen
   - URL: `/local/tgShiftSchedule/tgshiftschedule-card.js`
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
type: custom:tgshiftschedule-card
entity: input_text.arbeitszeiten
```

## Datenformat

Die Arbeitszeiten/Schichten werden im folgenden Format gespeichert:

```
<jahr>:<monat>:<tag><schicht>,<tag><schicht>;<jahr>:<monat>:<tag><schicht>
```

Beispiel:
- `25:11:03a,04ab,05a;25:12:01a,09a` bedeutet:
  - November 2025: Tag 3 hat Schicht 'a', Tag 4 hat Schichten 'a' und 'b', Tag 5 hat Schicht 'a'
  - Dezember 2025: Tag 1 und 9 haben Schicht 'a'

**Schicht-Shortcuts:**
- `a`: Standardschicht (immer aktiv)
- `b`, `c`, `d`, `e`: Zusätzliche Schichten (konfigurierbar im Editor)

**Wichtig**: Es werden nur die Tage gespeichert, an denen Sie arbeiten müssen.

## Entwicklung

```bash
npm install
npm run build
```

Die kompilierte Datei wird in `dist/tgshiftschedule-card.js` erstellt.
