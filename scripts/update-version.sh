#!/bin/bash

# Lese die aktuelle Version aus card-config.js
CURRENT_VERSION=$(grep -o "CardVersion: '[0-9]\{4\}\.[0-9]\{2\}-[0-9]\{4\}'" src/card-config.js | cut -d"'" -f2)

# Extrahiere die Komponenten
YEAR=$(echo $CURRENT_VERSION | cut -d'.' -f1)
MONTH=$(echo $CURRENT_VERSION | cut -d'.' -f2 | cut -d'-' -f1)
NUMBER=$(echo $CURRENT_VERSION | cut -d'-' -f2)

# Erhöhe die Nummer um 1
NEW_NUMBER=$(printf "%04d" $((10#$NUMBER + 1)))

# Erstelle die neue Version
NEW_VERSION="${YEAR}.${MONTH}-${NEW_NUMBER}"

# Aktualisiere die Version in card-config.js
sed -i "s/CardVersion: '[0-9]\{4\}\.[0-9]\{2\}-[0-9]\{4\}'/CardVersion: '${NEW_VERSION}'/" src/card-config.js

echo "Version aktualisiert von ${CURRENT_VERSION} auf ${NEW_VERSION}" 