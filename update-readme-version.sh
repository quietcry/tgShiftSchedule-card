#!/bin/bash

# Script zum Aktualisieren der Version in der README
# Verwendung: ./update-readme-version.sh

set -e

# Prüfe ob wir im richtigen Verzeichnis sind
if [ ! -f "src/card-config.js" ]; then
    echo "Fehler: card-config.js nicht gefunden. Bist du im Projektverzeichnis?"
    exit 1
fi

if [ ! -f "README.md" ]; then
    echo "Fehler: README.md nicht gefunden."
    exit 1
fi

# Lese Version aus card-config.js
VERSION=$(grep -oP "const Version = '\K[^']+" src/card-config.js)
if [ -z "$VERSION" ]; then
    echo "Fehler: Version nicht in card-config.js gefunden"
    exit 1
fi

# Konvertiere Version zu Tag-Format für HACS (2025.12-0021 -> v2025.12.0021)
TAG_VERSION="v$(echo $VERSION | tr '-' '.')"

echo "Aktualisiere README mit Version: ${VERSION} (Tag: ${TAG_VERSION})"

# Erstelle temporäre README mit aktualisierter Version
TEMP_README=$(mktemp)

# Erstelle neue README
{
    # Erste Zeile (Titel)
    echo "# TG Schichtplan Card"
    echo ""

    # Versionsangabe
    echo "**Version:** ${VERSION} (HACS Tag: ${TAG_VERSION})"
    echo ""

    # Rest der README, aber:
    # - Überspringe bereits vorhandene Versionsangaben am Anfang
    # - Entferne den gesamten "## Version" Abschnitt
    awk '
        BEGIN {
            skip_version_section=0
            skip_header=0
            found_first_content=0
        }
        /^# TG Schichtplan Card$/ { skip_header=1; next }
        /^\*\*Version:\*\*/ && !found_first_content { next }  # Überspringe Versionsangaben am Anfang
        /^## Version$/ { skip_version_section=1; next }
        /^## Changelog$/ { skip_version_section=0; print; next }
        skip_version_section==1 { next }
        /^$/ && !found_first_content { next }  # Überspringe Leerzeilen am Anfang
        {
            found_first_content=1
            print
        }
    ' README.md
} > "$TEMP_README"

# Ersetze README
mv "$TEMP_README" README.md

echo "✓ README erfolgreich aktualisiert"
