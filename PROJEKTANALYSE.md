# Projektanalyse: TG Schichtplan Card

## Übersicht

Das **TG Schichtplan Card** Projekt ist eine Home Assistant Custom Card zur Verwaltung von Arbeitszeiten und Schichtplänen. Es besteht aus zwei Hauptkomponenten:

1. **Frontend (Card)**: JavaScript-basierte Custom Card für die visuelle Darstellung und Bearbeitung von Schichtplänen
2. **Backend (Blueprint)**: Home Assistant Automation Blueprint für die Schichtprüfung mit Timer-Integration

---

## Projektstruktur

```
tgcalendar/
├── src/                          # Quellcode
│   ├── card.js                   # Hauptkomponente (Lit-Element)
│   ├── card-base.js              # Basis-Klasse mit Event-System
│   ├── card-impl.js              # Implementierung der Card-Logik
│   ├── card-config.js            # Konfiguration (Version, Debug, etc.)
│   ├── editor/                   # Editor-Komponenten
│   │   ├── editor.js
│   │   ├── editor-base.js
│   │   └── editor-impl.js
│   └── views/
│       └── shiftschedule-view/   # Hauptansicht für Schichtplan
│           └── shiftschedule-view.js
├── dist/                         # Kompilierte Dateien
├── package.json                  # NPM-Dependencies
├── webpack.config.js             # Build-Konfiguration
└── README.md                     # Dokumentation
```

---

## Architektur

### Technologie-Stack

- **Frontend Framework**: Lit-Element (Web Components)
- **Build Tool**: Webpack mit Babel
- **Sprache**: JavaScript (ES6+)
- **Styling**: CSS-in-JS (Lit CSS)
- **Datenformat**: Komprimiertes String-Format für Schichtdaten

### Komponenten-Hierarchie

```
Card (card.js)
  └── CardImpl (card-impl.js)
      └── CardBase (card-base.js)
          └── SuperBase (super-base.js)
              └── LitElement
```

**View-Komponente:**
```
ShiftScheduleView (shiftschedule-view.js)
  └── ViewBase (view-base.js)
      └── LitElement
```

---

## Hauptfunktionalitäten

### 1. Schichtplan-Verwaltung

- **Mehrere Monate**: Unterstützung für bis zu 14 Monate
- **5 Schichten**: Feste Schichten (a, b, c, d, e) mit individuellen Farben
- **Toggle-Funktion**: Ein-/Ausschalten von Schichten per Klick auf Tag-Buttons
- **Kalender-Auswahl**: Wechsel zwischen verschiedenen Schichten im Single-Mode

### 2. Datenformat

**Speicherformat:**
```
<jahr>:<monat>:<tag><schichten>,<tag><schichten>;<jahr>:<monat>:<tag><schichten>
```

**Beispiel:**
```
25:11:03a,04ab,05a;25:12:01a,09a
```
- November 2025: Tag 3 = Schicht 'a', Tag 4 = Schichten 'a' und 'b', Tag 5 = Schicht 'a'
- Dezember 2025: Tag 1 und 9 = Schicht 'a'

### 3. Multi-Entity-Speicherung

**Problem**: `input_text` Entities haben eine maximale Länge (Standard: 255 Zeichen)

**Lösung**:Automatische Verteilung auf mehrere Entities:
- Haupt-Entity: `input_text.arbeitszeiten`
- Zusätzliche Entities: `input_text.arbeitszeiten_001`, `input_text.arbeitszeiten_002`, etc.
- Automatische Erkennung und Verwendung zusätzlicher Entities
- Warnung bei 90% Speicherverbrauch

### 4. Feiertags-Erkennung

**Unterstützte Feiertage:**
- **Feste Feiertage**: Neujahr, Heilige Drei Könige, Tag der Arbeit, Friedensfest, Mariä Himmelfahrt, Tag der Deutschen Einheit, Reformationstag, Allerheiligen, Weihnachten
- **Bewegliche Feiertage**: Karfreitag, Ostermontag, Christi Himmelfahrt, Pfingstmontag, Fronleichnam, Buß- und Bettag

**Erkennung:**
- Primär: Home Assistant Holiday-Sensoren (falls vorhanden)
- Fallback: Eigene Berechnung (Gauß-Algorithmus für Ostern)

### 5. Konfiguration

**Config-Entity**: `input_text.arbeitszeiten_config`
- Speichert Schichtkonfigurationen (Namen, Farben, Zeiträume, statusRelevant)
- Format: Komprimiertes JSON-Array ohne Anführungszeichen

**Status-Entity**: `input_text.arbeitszeiten_status`
- Speichert aktuellen Status-Text (z.B. "normalschicht_1")

---

## Datenfluss

### Schreiben (Card → Home Assistant)

1. **Benutzer klickt auf Tag-Button**
   - `toggleDay()` wird aufgerufen
   - `_workingDays` wird aktualisiert
   - Direkte DOM-Manipulation für sofortiges visuelles Feedback
   - Debounced Save (Standard: 300ms)

2. **Serialisierung**
   - `serializeWorkingDays()` konvertiert `_workingDays` zu String-Format
   - Sortierung nach Jahr:Monat

3. **Speicherung basierend auf `store_mode`**
   - **`store_mode: 'saver'`**:
     - `_saveDataToSaver()` schreibt in Saver-Variable
     - Prüft auf Wertänderungen vor dem Schreiben
     - Fallback zu Entities bei Fehlern
   - **`store_mode: 'text_entity'`**:
     - `distributeDataToEntities()` verteilt Daten zeichenweise
     - Berücksichtigt maximale Länge jeder Entity
     - Erkennt automatisch neue zusätzliche Entities

4. **Schreib-Lock**
   - 5 Sekunden nach Schreiben: Ignoriere State-Updates
   - Verhindert Race Conditions

### Lesen (Home Assistant → Card)

1. **State-Update**
   - `hass` Setter wird aufgerufen
   - Prüft ob sich Entity-State geändert hat

2. **Laden basierend auf `store_mode`**
   - **`store_mode: 'saver'`**:
     - `_loadDataFromSaver()` liest von Saver-Variable (`saver.saver.attributes.variables[saver_key]`)
     - Fallback zu Entities, wenn Saver-Daten fehlen
   - **`store_mode: 'text_entity'`**:
     - `loadWorkingDays()` sammelt Daten aus allen Entities
     - Kombiniert Strings mit ";" als Trennzeichen
   - `parseWorkingDays()` parst String zu `_workingDays` Objekt

3. **Bereinigung**
   - Beim initialen Laden: Entfernt alte Monate
   - Behält: Vormonat + alle angezeigten Monate

---

## Integration mit Blueprint

### Blueprint-Funktionalität

Der Blueprint (`tgShiftSchedule.yaml`) prüft:
- Ob heute eine Schicht aktiv ist
- Welche Zeitfenster aktiv sind (bis zu 2 pro Schicht)
- Setzt Timer für nächste Schicht-Änderung
- Aktualisiert Status-Entity

### Datenquellen

**✅ GELÖST**: Saver-Integration in Card implementiert
- **Card**: Unterstützt jetzt beide Modi:
  - `store_mode: 'text_entity'` → Liest/schreibt von/zu `input_text` Entities (Standard)
  - `store_mode: 'saver'` → Liest/schreibt von/zu Saver-Variablen (HACS Integration)
- **Blueprint**: Kann ebenfalls beide Modi verwenden (`store_mode == 'saver'` oder `'text_entity'`)
- **Synchronisation**: Card und Blueprint verwenden jetzt die gleiche Datenquelle basierend auf `store_mode`

**Implementierung:**
- Config-Parameter `store_mode` und `saver_key` im Editor
- Priorisierte Datenladung: Zuerst Saver, dann Fallback zu Entities
- Unterschiedliche Datenformate: Komprimiertes Format für Entities, vollständiges JSON für Saver
- Automatische Fallback-Mechanismen bei Fehlern

---

## Performance-Optimierungen

### 1. Debouncing
- Speicher-Operationen werden debounced (Standard: 300ms)
- Verhindert zu viele Schreibvorgänge bei schnellen Klicks

### 2. Direkte DOM-Manipulation
- `_updateDayButtonDirectly()` aktualisiert einzelne Buttons ohne komplettes Re-Rendering
- Wird verwendet bei:
  - Tag-Toggle
  - Kalender-Auswahl
- **Verhindert Verdopplungen**: `_directDOMUpdateInProgress` Set verhindert Lit-Updates während direkter DOM-Manipulation
- **Template-Integration**: Template prüft auf manuell erstellte Container und rendert keine Indikatoren, wenn bereits vorhanden

### 3. Caching
- **Feiertage**: Cache pro Monat (`_holidayCache`)
- **Holiday-Entities**: Cache für gefundene Entities
- **Editor-Mode**: Cache für 5 Sekunden

### 4. Selektive Updates
- `shouldUpdate()` prüft nur relevante Properties
- Verhindert unnötige Re-Renderings
- **Konfliktvermeidung**: Überspringt Updates für `_workingDays`, wenn direkte DOM-Manipulation im Gange ist
- **Konfliktvermeidung**: Überspringt Updates für `_workingDays`, wenn direkte DOM-Manipulation im Gange ist

---

## Bekannte Probleme & Verbesserungen

### 1. ✅ Saver-Support in Card implementiert

**Status**: ✅ Abgeschlossen

**Implementierung**:
- Config-Parameter `store_mode` ('saver' oder 'text_entity') und `saver_key` im Editor
- Priorisierte Datenladung: Zuerst Saver, dann Fallback zu Entities
- Unterschiedliche Datenformate je nach Modus
- Automatische Fallback-Mechanismen

### 2. ✅ Synchronisation Card ↔ Blueprint

**Status**: ✅ Gelöst

**Lösung**:
- Card unterstützt jetzt beide Modi (`store_mode`)
- Card und Blueprint verwenden die gleiche Datenquelle basierend auf `store_mode`
- Konsistente Datenformate zwischen Card und Blueprint

### 3. Schreib-Lock könnte optimiert werden

**Aktuell**: 5 Sekunden fester Lock nach Schreiben

**Verbesserung**:
- Dynamischer Lock basierend auf tatsächlicher Schreibdauer
- Oder: Prüfe ob alle Schreibvorgänge abgeschlossen sind

### 4. ✅ Fehlerbehebungen (2025.12)

**Behobene Probleme:**
- **Verdoppelte Indikatoren**: Verhindert durch `_directDOMUpdateInProgress` Set und Template-Integration
- **Farbaktualisierung beim Kalenderwechsel**: `_updateAllDayButtonsForCalendarChange()` aktualisiert alle Buttons korrekt
- **Löschen des letzten Tages**: `finalElements` werden vor dem Löschen des Monats gespeichert
- **Initiales Laden**: `_updateAllDayButtonsForCalendarChange()` wird nur nach initialem Laden aufgerufen
- **Saver-Variable-Prüfung**: Korrekte Prüfung auf Wertänderungen vor dem Schreiben

### 5. Feiertags-Erkennung

**Aktuell**: Fallback-Berechnung für deutsche Feiertage

**Verbesserung**:
- Unterstützung für andere Länder
- Konfigurierbare Feiertags-Regionen

---

## Technische Details

### Editor-Mode-Erkennung

Die Card erkennt den Editor-Modus über mehrere Methoden:
1. URL-Parameter `?edit=1`
2. `lovelace.editMode`
3. DOM-Prüfung auf `hui-dialog-edit-card`
4. Parent-Baum-Durchsuchung
5. Shadow DOM-Prüfung
6. URL-Pfad-Prüfung

**Caching**: 5 Sekunden Cache für Editor-Mode-Erkennung

### Schicht-Färbung

**Logik:**
1. Wenn ausgewählter Kalender aktiv → verwende dessen Farbe
2. Sonst: Verwende Farbe der ersten aktivierten Schicht
3. Zusätzliche Schichten werden als kleine Indikatoren angezeigt

### Zeitfenster-Support

**Konfiguration:**
- Pro Schicht: Bis zu 2 Zeitfenster (start1/end1, start2/end2)
- Format: "HH:MM" (z.B. "07:15", "17:00")

**Blueprint-Integration:**
- Blueprint prüft, ob aktueller Zeitpunkt in einem Zeitfenster liegt
- Setzt `zeitfenster: 1` oder `zeitfenster: 2` in `aktive_schichten_heute`

---

## Build-Prozess

### Webpack-Konfiguration

- **Entry**: `src/card.js`
- **Output**: `dist/tgshiftschedule-card.js`
- **Babel**: ES6+ → ES5 (mit Decorators, Class Properties)
- **Dev Server**: Port 9000 mit Hot Reload

### Scripts

```bash
npm run build      # Production Build
npm run dev        # Development Server
npm run watch      # Watch Mode
npm run format     # Code Formatting
```

---

## Versionierung

**Aktuelle Version**: 2025.12-0038 (aus `card-config.js`)

**HACS Tag**: v2025.12.0037 (aus README)

**Changelog**: Siehe `CHANGELOG.md`

---

## Zusammenfassung

Das TG Schichtplan Card Projekt ist eine gut strukturierte Home Assistant Custom Card mit:

✅ **Starken Seiten:**
- Modulare Architektur
- Performance-Optimierungen (Debouncing, Caching, direkte DOM-Manipulation)
- Robuste Fehlerbehandlung
- Multi-Entity-Support für große Datenmengen
- Umfangreiche Feiertags-Erkennung

⚠️ **Verbesserungspotenzial:**
- Saver-Support in Card hinzufügen
- Synchronisation Card ↔ Blueprint verbessern
- Internationalisierung für Feiertage
- Dynamischer Schreib-Lock

**Nächste Schritte:**
1. ✅ ~~Implementierung von Saver-Support in der Card~~ (Abgeschlossen)
2. ✅ ~~Synchronisation zwischen Card und Blueprint sicherstellen~~ (Abgeschlossen)
3. Dokumentation für Entwickler erweitern
4. Weitere Performance-Optimierungen
5. Internationalisierung für Feiertage
