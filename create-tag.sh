#!/bin/bash

# Script zum Erstellen eines Git-Tags im HACS-Format
# Verwendung: ./create-tag.sh [Version]
# Wenn keine Version angegeben wird, wird die Version aus card-config.js gelesen

set -e

# Farben für Output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Prüfe ob wir im richtigen Verzeichnis sind
if [ ! -f "src/card-config.js" ]; then
    echo -e "${RED}Fehler: card-config.js nicht gefunden. Bist du im Projektverzeichnis?${NC}"
    exit 1
fi

# Lese Version aus card-config.js oder verwende übergebene Version
if [ -z "$1" ]; then
    VERSION=$(grep -oP "const Version = '\K[^']+" src/card-config.js)
    if [ -z "$VERSION" ]; then
        echo -e "${RED}Fehler: Version nicht in card-config.js gefunden${NC}"
        exit 1
    fi
else
    VERSION="$1"
fi

# Konvertiere Version zu Tag-Format (2025.12-0021 -> v2025.12.0021)
TAG_VERSION="v$(echo $VERSION | tr '-' '.')"

echo -e "${YELLOW}Erstelle Tag für Version: ${VERSION} (Tag: ${TAG_VERSION})${NC}"

# Prüfe ob Tag bereits existiert
if git rev-parse "$TAG_VERSION" >/dev/null 2>&1; then
    echo -e "${RED}Fehler: Tag ${TAG_VERSION} existiert bereits${NC}"
    exit 1
fi

# Frage nach Release-Notizen
echo -e "${YELLOW}Release-Notizen (optional, Enter für Standard):${NC}"
read -r RELEASE_NOTES
if [ -z "$RELEASE_NOTES" ]; then
    RELEASE_NOTES="Version ${VERSION}"
fi

# Erstelle Tag
echo -e "${GREEN}Erstelle Git-Tag...${NC}"
git tag -a "$TAG_VERSION" -m "Version ${VERSION}: ${RELEASE_NOTES}"

# Push Tags zu beiden Remotes
echo -e "${GREEN}Pushe Tags zu Forgejo...${NC}"
git push origin "$TAG_VERSION"

echo -e "${GREEN}Pushe Tags zu GitHub...${NC}"
git push github "$TAG_VERSION"

echo -e "${GREEN}✓ Tag ${TAG_VERSION} erfolgreich erstellt und gepusht!${NC}"
echo -e "${GREEN}Tag-URL: https://github.com/quietcry/tgShiftSchedule-card/releases/tag/${TAG_VERSION}${NC}"
