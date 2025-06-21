# Changelog

## [2025.06-0036] - 2025-06-20

### Hinzugefügt
- Neue EPG-Zeitkonfigurationsvariablen:
  - `epgPastTime` (integer): Anzahl der Minuten in die Vergangenheit (Standard: 30)
  - `epgFutureTime` (integer): Anzahl der Minuten in die Zukunft (Standard: 120)
  - `epgShowWidth` (integer): Anzahl der sichtbaren Minuten in der Ansicht (Standard: 180)

### Geändert
- Editor-UI erweitert um neue Konfigurationsfelder im EPG-Bereich
- EpgBox verwendet jetzt die konfigurierten Zeitparameter für die Zeitslot-Generierung
- DataProvider übergibt Zeitparameter an den Service-Aufruf
- EPGView überträgt Konfigurationsparameter an die EpgBox

### Technische Details
- Standardwerte in `card-config.js` definiert
- Editor-Impl erweitert um neue Konfigurationsfelder mit Nummern-Selektoren
- Zeitslot-Generierung basiert jetzt auf konfigurierten Vergangenheits- und Zukunftszeiten
- Programmbreiten-Berechnung berücksichtigt die konfigurierte Anzeigebreite
- Service-Aufrufe verwenden `past_time` und `future_time` Parameter

## [1.0.0] - 2024-12-19

### Added
- Neue EPG-Karte für Home Assistant mit flexibler Zeitkonfiguration
- Konfigurationsparameter: `epgPastTime`, `epgFutureTime`, `epgShowWidth`
- Dynamische Programmbreiten basierend auf Programmdauer
- Separate Custom Elements für EPG-Komponenten
- Editor-Integration für alle Konfigurationsparameter

### Changed
- Alle EPG-Elemente erben jetzt von `EpgElementBase` statt von `LitElement`
- Entfernung doppelter Methoden (`_formatTime`, `_formatDuration`, `_calculateDuration`, `_isCurrentProgram`)
- Vereinheitlichung der Property-Definitionen durch Verwendung von `...super.properties`
- Saubere Trennung zwischen View- und Element-Logik

### Technical
- `epg-program-item.js`: Erbt von `EpgElementBase`, entfernte doppelte Formatierungsmethoden
- `epg-box.js`: Erbt von `EpgElementBase`, entfernte doppelte Properties und Methoden
- `epg-channel-list.js`: Erbt von `EpgElementBase`, vereinheitlichte Properties
- `epg-program-list.js`: Erbt von `EpgElementBase`, vereinheitlichte Properties
- `epg-timebar.js`: Erbt von `EpgElementBase`, vereinheitlichte Properties
- `epg-view-base.js`: Erbt von `ViewBase` (spezialisierte View-Klasse), vereinheitlichte Properties

### Fixed
- Konsistente Höhen für alle EPG-Elemente
- Korrekte Darstellung von Programm-Items mit dynamischen Breiten
- Vermeidung leerer Zeilen in der EPG-Darstellung
- Einheitliche Zeitformatierung und Dauerberechnung