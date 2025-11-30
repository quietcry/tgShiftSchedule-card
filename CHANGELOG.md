# Changelog

## [2025.11-0009] - 2025-11-30

### Geändert
- Umbenennung: calendar → shiftschedule
  - Dateien: calendar-view → shiftschedule-view
  - Klasse: CalendarView → ShiftScheduleView
  - Custom Element: calendar-view → shiftschedule-view
  - Konfiguration: tgcalendar-card → tgshiftschedule-card
- Texte angepasst: Kalender → Schicht/Schichtplan
  - Standardkalender → Standardschicht
  - Kalender B/C/D/E → Schicht B/C/D/E
- CSS-Variablen: --tgcalendar → --tgshiftschedule
- README.md vollständig für Schichtplan angepasst

## [2025.11-0007] - 2025-11-30

### Geändert
- Alle console.log Statements entfernt
- Code ist jetzt produktionsreif ohne Debug-Ausgaben

## [2025.11-0006] - 2025-11-30

### Geändert
- Nicht verwendete Dateien vom EPG-Template entfernt
  - epg-view/ Ordner komplett entfernt (17 Dateien)
  - table-view/ Ordner komplett entfernt (1 Datei)
  - env-sniffer.js, extended-config-processor.js, data-provider.js, tooltip-manager.js entfernt

## [2025.11-0005] - 2025-11-30

### Geändert
- Tag-Färbung basiert jetzt auf ausgewähltem Kalender
  - isWorking wird nur true, wenn der ausgewählte Kalender aktiv ist
  - Im single-Modus wird nur orange angezeigt, wenn Kalender 'a' aktiv ist
  - Tage mit anderen Kalendern bleiben grau und zeigen grüne Punkte

## [2025.11-0004] - 2025-11-30

### Geändert
- Trailing whitespaces entfernt

## [2025.11-0003] - 2025-11-30

### Geändert
- Kalender-Auswahl im Menü korrigiert
  - Verwendung von @selected Event statt @value-changed für ha-select
  - Neue Methode _onCalendarSelectedByIndex verwendet Index korrekt auf gefilterte Liste
  - Index bezieht sich auf allCalendars (nur aktivierte Kalender)
