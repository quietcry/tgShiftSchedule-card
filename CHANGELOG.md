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