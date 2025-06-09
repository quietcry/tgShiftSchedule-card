# TG EPG Card Projekt

## Projektübersicht
Dieses Projekt entwickelt eine EPG (Electronic Program Guide) Card für Home Assistant, die speziell für die Anzeige von TV-Programminformationen optimiert ist.

## Hauptfunktionen
- Anzeige von TV-Programminformationen
- Versionsverwaltung mit automatischem Update
- Unterstützung verschiedener Deklarationsarten (const, let, var)
- Automatische Versionsnummerierung im Format YYYY.MM-XXXX

## Technische Details

### Versionsverwaltung
- Format: YYYY.MM-XXXX
  - YYYY: Jahr (4-stellig)
  - MM: Monat (2-stellig)
  - XXXX: Fortlaufende Nummer (4-stellig)
- Automatische Aktualisierung bei Commits
- Unterstützung verschiedener Deklarationsarten:
  ```javascript
  const Version = '2025.06-0001';
  let Version = '2025.06-0001';
  var Version = '2025.06-0001';
  ```

### Git Hooks
- Pre-commit Hook für automatische Versionsaktualisierung
- Warnung bei ungültigem Versionsformat
- Keine Änderung bei ungültigem Format

## Aktuelle Implementierung
- Versionsupdate-Skript in `/tgdata/coding/githook_scripts/update-version.sh`
- Unterstützt verschiedene Whitespace-Varianten
- Farbige Warnungen für ungültige Formate
- Automatische Git-Staging der Änderungen

## Nächste Schritte
- Weitere Optimierung der Versionsverwaltung
- Integration in den Build-Prozess
- Erweiterung der Fehlerbehandlung

## Wichtige Anmerkungen
- Das Skript sollte nur die erste gefundene Versionszeile aktualisieren
- Ungültige Formate werden in Rot angezeigt, aber nicht geändert
- Das Skript erstellt automatisch Backups vor Änderungen

## Verwendung
```bash
# Als Git Hook
bash /tgdata/coding/githook_scripts/update-version.sh <dateipfad>

# Beispiel
bash /tgdata/coding/githook_scripts/update-version.sh src/card-config.js
``` 