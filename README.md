# TG Schichtplan Card

**Version:** 2026.01-0030 (HACS Tag: v2026.01.0030)

Eine Schichtplan-Karte für Home Assistant zur Verwaltung von Arbeitszeiten und Schichten.

## Funktionen

- Schichtplanansicht für mehrere Monate (konfigurierbar, max. 14 Monate)
- Toggle-Buttons für jeden Tag zum Ein- und Ausschalten der Arbeitszeiten/Schichten
- Unterstützung für 5 Schichten (a, b, c, d, e) mit individuellen Farben
- **Zeiträume pro Schicht**: Bis zu 9 Zeitfenster pro Schicht mit individuellen IDs (1-9)
- **Validierung**: Automatische Validierung von Schicht-IDs (a-z) und Zeitraum-IDs (1-9)
- Feiertags-Erkennung mit konfigurierbaren Feiertagen
- Wochenend-Markierung
- **Saver-Integration (empfohlen)**: Speicherung in Saver-Variablen (HACS) ohne Längenbegrenzung
- **Fallback**: Speicherung in einem oder mehreren `input_text` Entities (bei Bedarf)
- Konfiguration über Editor-UI mit visueller Fehleranzeige
- Status relevante Schichten für Blueprint-Integration
- **Robuste Fehlerbehandlung**: Verbesserte Stabilität beim Neustart von Home Assistant
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

### Option 1: Saver-Integration (empfohlen) ⭐

**Vorteile:**
- Keine Längenbegrenzung für Schichtdaten
- Keine Notwendigkeit für mehrere Entities
- Bessere Performance bei großen Datenmengen
- Synchronisation mit Blueprint möglich

**Installation:**
1. Installiere die [Saver-Integration](https://github.com/saver-integration/saver) über HACS
2. Die Karte verwendet automatisch Saver, wenn `store_mode: 'saver'` in der Konfiguration gesetzt ist

**Keine zusätzliche Konfiguration nötig** - die Karte erstellt die Saver-Variablen automatisch.

### Option 2: input_text Entities (Fallback)

Falls du keine Saver-Integration verwenden möchtest, erstelle `input_text` Entities:

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

**Hinweis**: Bei großen Schichtplänen werden die Daten automatisch auf mehrere Entities verteilt (`arbeitszeiten_001`, `arbeitszeiten_002`, etc.).

## Verwendung

Füge die Karte zu deinem Dashboard hinzu:

### Mit Saver (empfohlen)

```yaml
type: custom:tgshiftschedule-card
entity: input_text.arbeitszeiten  # Wird als Fallback verwendet
store_mode: saver                 # Saver-Modus aktivieren
saver_key: Schichtplan            # Name der Saver-Variable
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

### Mit input_text Entities (Fallback)

```yaml
type: custom:tgshiftschedule-card
entity: input_text.arbeitszeiten
store_mode: text_entity           # Standard-Modus
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

- **Entity**: Die `input_text` Entity für die Schichtdaten (wird als Fallback verwendet)
- **Speichermodus**:
  - `saver` (empfohlen): Verwendet Saver-Variablen ohne Längenbegrenzung
  - `text_entity`: Verwendet `input_text` Entities (Standard)
- **Saver-Variablenname**: Name der Saver-Variable (nur bei `store_mode: saver`)
- **Anzahl Monate**: Maximale Anzahl der Monate (1-14)
- **Sichtbare Monate**: Standardanzahl der angezeigten Monate
- **Schichten**: Konfiguration für jede Schicht (a-e)
  - Name, Farbe, ID (einzelner Kleinbuchstabe a-z), Aktiviert
  - Status relevant: Ob die Schicht für Blueprint-Statusberechnung verwendet wird
  - Zeiträume: Optional bis zu 9 Zeitfenster pro Schicht
    - Jeder Zeitraum hat eine eindeutige ID (1-9)
    - Start- und Endzeit im Format HH:MM
    - Automatische Zuweisung der ersten freien ID bei neuen Zeiträumen
- **Feiertage**: Ein-/Ausschalten einzelner Feiertage

### Feiertage

Folgende Feiertage werden unterstützt:
- Feste Feiertage: Neujahr, Heilige Drei Könige, Tag der Arbeit, Friedensfest, Mariä Himmelfahrt, Tag der Deutschen Einheit, Reformationstag, Allerheiligen, Weihnachten
- Bewegliche Feiertage: Karfreitag, Ostermontag, Christi Himmelfahrt, Pfingstmontag, Fronleichnam, Buß- und Bettag

## Datenformat

### Schichtdaten

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

### Konfigurationsdaten (Saver)

Die Schichtkonfiguration wird im neuen Format gespeichert:

```json
{
  "calendars": [
    {
      "shortcut": "a",
      "name": "Normalschicht",
      "color": "#ff9800",
      "enabled": true,
      "statusRelevant": true,
      "timeRanges": [
        {
          "id": "1",
          "times": ["08:00", "16:00"]
        },
        {
          "id": "2",
          "times": ["18:00", "22:00"]
        }
      ]
    }
  ],
  "setup": {
    "timer_entity": "timer.schichtplan",
    "store_mode": "saver"
  },
  "lastchange": 1767601660
}
```

**Hinweise:**
- Alle Schichten werden gespeichert (auch deaktivierte)
- Zeiträume können IDs von 1-9 haben
- Jeder Zeitraum hat ein `times`-Array mit Start- und Endzeit

## Blueprint-Integration

Die Karte kann mit dem `tgshiftschedule.yaml` Blueprint verwendet werden:

- Der Blueprint prüft, ob heute eine der konfigurierten Schichten aktiv ist
- Nur Schichten mit `statusRelevant: true` werden für die Statusberechnung verwendet
- Der Blueprint unterstützt Zeitfenster pro Schicht
- **Synchronisation**: Card und Blueprint verwenden die gleiche Datenquelle basierend auf `store_mode`
  - Bei `store_mode: saver`: Beide verwenden die gleiche Saver-Variable
  - Bei `store_mode: text_entity`: Beide verwenden die gleichen `input_text` Entities

## Validierung

Die Karte validiert automatisch alle Eingaben:

- **Schicht-IDs**: Nur einzelne Kleinbuchstaben (a-z) sind erlaubt
- **Zeitraum-IDs**: Nur einzelne Ziffern (1-9) sind erlaubt
- **Zeitformate**: Start- und Endzeiten müssen im Format HH:MM sein
- **Eindeutigkeit**: Zeitraum-IDs müssen innerhalb einer Schicht eindeutig sein

Bei Validierungsfehlern:
- Fehlerhafte Felder werden mit rotem Rahmen markiert
- Bestätigungs- und "Neue Schicht"-Buttons werden deaktiviert
- Wechsel zu anderen Schichten über die Farbleiste wird verhindert

## Entwicklung

```bash
npm install
npm run build
```

Die kompilierte Datei wird in `dist/tgshiftschedule-card.js` erstellt.

### Entwicklungsserver

```bash
npm run dev
```

Startet einen Entwicklungsserver mit Hot Module Replacement (HMR).

### Code-Formatierung

```bash
npm run format        # Code formatieren
npm run format:check  # Formatierung prüfen
```
