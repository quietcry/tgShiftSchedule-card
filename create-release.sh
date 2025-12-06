#!/bin/bash

# Script zum Erstellen eines HACS-Releases
# Verwendung: ./create-release.sh "Beschreibung der Änderungen"

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

# Lese Version aus card-config.js
VERSION=$(grep -oP "const Version = '\K[^']+" src/card-config.js)
if [ -z "$VERSION" ]; then
    echo -e "${RED}Fehler: Version nicht in card-config.js gefunden${NC}"
    exit 1
fi

# Konvertiere Version zu Tag-Format (2025.12-0009 -> v2025.12.0009)
TAG_VERSION="v$(echo $VERSION | tr '-' '.')"

echo -e "${YELLOW}Erstelle Release für Version: ${VERSION} (Tag: ${TAG_VERSION})${NC}"

# Prüfe ob Tag bereits existiert
if git rev-parse "$TAG_VERSION" >/dev/null 2>&1; then
    echo -e "${RED}Fehler: Tag ${TAG_VERSION} existiert bereits${NC}"
    exit 1
fi

# Prüfe ob es uncommitted Änderungen gibt
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}Warnung: Es gibt uncommitted Änderungen. Soll ich fortfahren? (j/n)${NC}"
    read -r response
    if [[ ! "$response" =~ ^[Jj]$ ]]; then
        exit 1
    fi
fi

# Aktualisiere README-Version
echo -e "${GREEN}Aktualisiere README-Version...${NC}"
./update-readme-version.sh

# Build durchführen
echo -e "${GREEN}Führe Build durch...${NC}"
npm run build

# Prüfe ob dist-Datei existiert
if [ ! -f "dist/tgshiftschedule-card.js" ]; then
    echo -e "${RED}Fehler: dist/tgshiftschedule-card.js nicht gefunden nach Build${NC}"
    exit 1
fi

# Stage alle Änderungen
echo -e "${GREEN}Stage Änderungen...${NC}"
git add -A

# Prüfe ob es etwas zu committen gibt
if git diff --staged --quiet; then
    echo -e "${YELLOW}Keine Änderungen zum Committen${NC}"
else
    # Commit mit Beschreibung
    RELEASE_NOTES="$1"
    if [ -z "$RELEASE_NOTES" ]; then
        RELEASE_NOTES="Version ${VERSION}"
    fi

    echo -e "${GREEN}Erstelle Commit...${NC}"
    git commit -m "Version ${VERSION}: ${RELEASE_NOTES}" || true
fi

# Push zu beiden Remotes
echo -e "${GREEN}Pushe zu Forgejo...${NC}"
git push origin master

echo -e "${GREEN}Pushe zu GitHub...${NC}"
git push github master:main

# Erstelle Tag
echo -e "${GREEN}Erstelle Git-Tag...${NC}"
git tag -a "$TAG_VERSION" -m "Version ${VERSION}: ${RELEASE_NOTES}"

# Push Tags
echo -e "${GREEN}Pushe Tags...${NC}"
git push origin "$TAG_VERSION"
git push github "$TAG_VERSION"

# Erstelle GitHub Release
echo -e "${GREEN}Erstelle GitHub Release...${NC}"
gh release create "$TAG_VERSION" \
    --title "$TAG_VERSION" \
    --notes "Version ${VERSION}

## Änderungen
${RELEASE_NOTES}

## Installation
Diese Version kann über HACS installiert werden:
1. HACS → Dashboard → Karten
2. Benutzerdefinierte Repositories hinzufügen
3. Repository: \`https://github.com/quietcry/tgShiftSchedule-card\`
4. Installieren" \
    --repo quietcry/tgShiftSchedule-card

echo -e "${GREEN}✓ Release ${TAG_VERSION} erfolgreich erstellt!${NC}"
echo -e "${GREEN}Release-URL: https://github.com/quietcry/tgShiftSchedule-card/releases/tag/${TAG_VERSION}${NC}"
