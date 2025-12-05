# TG Schichtplan Card

Eine Schichtplan-Karte für Home Assistant zur Verwaltung von Arbeitszeiten und Schichten.

## Funktionen

- Schichtplanansicht für mehrere Monate (konfigurierbar, max. 14 Monate)
- Toggle-Buttons für jeden Tag zum Ein- und Ausschalten der Arbeitszeiten/Schichten
- Unterstützung für 5 Schichten (a, b, c, d, e) mit individuellen Farben
- Zeiträume pro Schicht (bis zu 2 Zeitfenster pro Tag)
- Feiertags-Erkennung mit konfigurierbaren Feiertagen
- Wochenend-Markierung
- Speicherung der Daten in einem oder mehreren `input_text` Entities
- Konfiguration über Editor-UI
- Status relevante Schichten für Blueprint-Integration
- Format: `<jahr>:<monat>:<tag><schicht>,<tag><schicht>;` (z.B. `25:11:03a,04ab,05a;25:12:01a`)

## Installation

### Über HACS (empfohlen)

1. Öffne HACS in Home Assistant
2. Gehe zu "Dashboard" → "Karten"
3. Klicke auf das Menü (drei Punkte oben rechts) → "Benutzerdefinierte Repositories"
4. Füge folgendes Repository hinzu:
   - Repository: `https://github.com/quietcry/tgShiftSchedule-card`
   - Kategorie: `Dashboard`
5. Suche nach "TG Schichtplan Card" und installiere sie
6. Starte Home Assistant neu

### Manuelle Installation

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
    max: 255  # Optional: Maximale Länge erhöhen für größere Schichtpläne
```

Optional: Erstelle eine Config-Entity für die Schichtkonfiguration:

```yaml
input_text:
  arbeitszeiten_config:
    name: Schichtplan Konfiguration
    max: 500  # Für Schichtkonfigurationen mit Zeiträumen
```

## Verwendung

Füge die Karte zu deinem Dashboard hinzu:

```yaml
type: custom:tgshiftschedule-card
entity: input_text.arbeitszeiten
numberOfMonths: 14
initialDisplayedMonths: 2
selectedCalendar: a
calendars:
  - shortcut: a
    name: Normalschicht
    color: '#ff9800'
    enabled: true
    statusRelevant: true
  - shortcut: b
    name: Schicht B
    color: '#ff0000'
    enabled: false
    statusRelevant: true
```

## Konfiguration

### Editor

Die Karte bietet einen integrierten Editor für die Konfiguration:

- **Entity**: Die `input_text` Entity für die Schichtdaten
- **Anzahl Monate**: Maximale Anzahl der Monate (1-14)
- **Sichtbare Monate**: Standardanzahl der angezeigten Monate
- **Schichten**: Konfiguration für jede Schicht (a-e)
  - Name, Farbe, Aktiviert
  - Status relevant: Ob die Schicht für Blueprint-Statusberechnung verwendet wird
  - Zeiträume: Optional bis zu 2 Zeitfenster pro Tag
- **Feiertage**: Ein-/Ausschalten einzelner Feiertage

### Feiertage

Folgende Feiertage werden unterstützt:
- Feste Feiertage: Neujahr, Heilige Drei Könige, Tag der Arbeit, Friedensfest, Mariä Himmelfahrt, Tag der Deutschen Einheit, Reformationstag, Allerheiligen, Weihnachten
- Bewegliche Feiertage: Karfreitag, Ostermontag, Christi Himmelfahrt, Pfingstmontag, Fronleichnam, Buß- und Bettag

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

## Blueprint-Integration

Die Karte kann mit dem `tgshiftschedule.yaml` Blueprint verwendet werden:

- Der Blueprint prüft, ob heute eine der konfigurierten Schichten aktiv ist
- Nur Schichten mit `statusRelevant: true` werden für die Statusberechnung verwendet
- Der Blueprint unterstützt Zeitfenster pro Schicht

## Entwicklung

```bash
npm install
npm run build
```

Die kompilierte Datei wird in `dist/tgshiftschedule-card.js` erstellt.

## Version

Aktuelle Version: 2025.12-0009

## Changelog

### v2025.12.0009
- Fix: Event-Propagation für ha-select @selected Event
- Verhindert, dass Home Assistant's Card-Picker das Event verarbeitet
- Null-Checks für Event-Handler hinzugefügt

### v2025.12.0008
- HACS-Installation vorbereitet
- Blueprints aus Repository entfernt (separate Installation)

### v2025.12.0007
- Feiertags-Konfiguration im Editor
- Status relevant Schalter für jede Schicht
- Verbessertes Anzeigeverhalten für nicht-ausgewählte Schichten
