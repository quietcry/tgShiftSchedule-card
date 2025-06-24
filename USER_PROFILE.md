### Benutzerprofil & Arbeitsweise: Zusammenarbeit mit Gemini

Dieses Dokument fasst die bevorzugte Arbeitsweise und wichtige Merkmale des Benutzers zusammen, um die zukünftige Zusammenarbeit zu optimieren.

**1. Sprache:**
*   Die gesamte Kommunikation findet auf **Deutsch** statt.

**2. Technische Expertise:**
*   Der Benutzer ist ein **erfahrener Entwickler** mit tiefem Verständnis für die Codebasis, JavaScript, CSS und Web-Komponenten.
*   Er ist sehr vertraut mit `git` und kann auf spezifische Commits verweisen oder Änderungen selbstständig zurücksetzen.

**3. Arbeitsweise & Präferenzen:**
*   **High-Level-Anweisungen:** Der Benutzer gibt oft übergeordnete Ziele vor (z.B. "Korrigiere die Ansicht", "Optimiere die Performance") und erwartet, dass die KI die technischen Details und den Implementierungsweg selbstständig erarbeitet.
*   **Fokus auf Effizienz:** Der Benutzer legt Wert auf sauberen und effizienten Code. Er erkennt und fordert proaktiv Best Practices ein, wie z.B. das Filtern von Daten an der Quelle (`DataProvider`) anstatt im Frontend.
*   **Debugging & Logging:** Der Benutzer überwacht die Browser-Konsole aktiv. Unnötige oder übermäßige Debug-Meldungen werden schnell als störend empfunden und sollten standardmäßig deaktiviert oder auf ein Minimum reduziert werden.
*   **Proaktive Problemlösung:** Der Benutzer ist sehr aufmerksam und erkennt Inkonsistenzen oder Fehler (z.B. falsche interne Dateiversionen der KI, Layout-Probleme) sehr schnell. Er greift bei Problemen aktiv ein und macht auch selbst Code-Änderungen.

**4. Wichtige Erkenntnisse für die KI:**
*   **Tool-Zuverlässigkeit:** Die automatischen Code-Änderungstools (`edit_file`, `sed`) waren in der Vergangenheit unzuverlässig. Es ist essenziell, nach jeder Änderung eine **Verifizierung** durchzuführen (z.B. durch erneutes Einlesen der Datei), um sicherzustellen, dass die Änderung wie beabsichtigt angewendet wurde.
*   **Kontext-Synchronisation:** Bei Anzeichen von Verwirrung oder wiederholten Fehlern sollte die KI proaktiv anbieten, den Dateikontext neu zu synchronisieren (`kannst du die Datei neu einlesen?`), da der Benutzer möglicherweise manuelle Änderungen vorgenommen hat.
*   **Vertrauen in Benutzereingaben:** Den Hinweisen und Korrekturen des Benutzers (z.B. bezüglich falscher Pfade oder veralteter interner Zustände) sollte hohes Vertrauen geschenkt werden.
*   **Keine langen Monologe:** Präzise, auf den Punkt gebrachte Antworten und Code-Änderungen sind zu bevorzugen.

Zusammenfassend lässt sich sagen, dass die Zusammenarbeit am besten als **Pair-Programming zwischen zwei erfahrenen Entwicklern** funktioniert. Die KI sollte als kompetenter Partner agieren, der selbstständig Lösungen erarbeitet, aber auch flexibel auf das Feedback und die Anweisungen des Benutzers reagiert.