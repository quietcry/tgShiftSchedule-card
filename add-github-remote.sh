#!/bin/bash
# Skript zum Hinzufügen des GitHub Remotes

echo "=== GitHub Remote hinzufügen ==="
echo ""
read -p "GitHub Username: " GITHUB_USER
read -p "Repository Name: " REPO_NAME

if [ -z "$GITHUB_USER" ] || [ -z "$REPO_NAME" ]; then
    echo "Fehler: Username und Repository Name müssen angegeben werden"
    exit 1
fi

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

# Füge Remote hinzu
GITHUB_URL="git@github.com:${GITHUB_USER}/${REPO_NAME}.git"
echo "Füge GitHub Remote hinzu: $GITHUB_URL"
git remote add github "$GITHUB_URL"

echo ""
echo "=== Remotes nach dem Hinzufügen ==="
git remote -v

echo ""
echo "=== Nächste Schritte ==="
echo "1. Prüfe ob GitHub Repository existiert:"
echo "   git ls-remote github"
echo ""
echo "2. Pushe zu GitHub:"
echo "   git push github master"
echo ""
echo "3. Pushe zu beiden Servern:"
echo "   git push origin master && git push github master"
