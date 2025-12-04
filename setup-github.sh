#!/bin/bash
# Skript zum Hinzufügen des GitHub Remotes und Push

echo "=== GitHub Remote hinzufügen ==="
GITHUB_URL="git@github.com:quietcry/tgShiftSchedule.git"

# Prüfe ob Remote bereits existiert
if git remote get-url github >/dev/null 2>&1; then
    echo "GitHub Remote existiert bereits:"
    git remote get-url github
    read -p "Überschreiben? (j/n): " OVERWRITE
    if [ "$OVERWRITE" != "j" ]; then
        echo "Abgebrochen"
        exit 0
    fi
    git remote remove github
fi

# Prüfe ob Repository existiert
echo "Prüfe ob GitHub Repository existiert..."
if git ls-remote "$GITHUB_URL" >/dev/null 2>&1; then
    echo "✓ Repository gefunden"
    git remote add github "$GITHUB_URL"
    echo ""
    echo "=== Remotes ==="
    git remote -v
    echo ""
    read -p "Zu GitHub pushen? (j/n): " PUSH
    if [ "$PUSH" == "j" ]; then
        git push github master
        echo ""
        echo "✓ Erfolgreich zu GitHub gepusht!"
    fi
else
    echo "✗ Repository nicht gefunden!"
    echo "Bitte erstelle zuerst das Repository auf GitHub:"
    echo "https://github.com/new"
    echo "Name: tgShiftSchedule"
    echo ""
    echo "Dann führe dieses Skript erneut aus."
fi
