#!/usr/bin/env node

/**
 * Test für die Integration des erweiterten Konfigurationssystems in die Karte
 * Simuliert die Karteninitialisierung mit erweiterter Konfiguration
 */

import { CardImpl } from './src/card-impl.js';

// Test-Konfiguration mit erweiterter Konfiguration (Variante 2 - ohne extensions)
const testConfig = {
  entity: 'sensor.test_epg',
  view_mode: 'epg',
  epgExtendConfig: `
  # Direkte Liste ohne extensions Key
  - backgroundcolor: "#f5f5f5"
  - textcolor: "#333333"
  
  # Bedingung für breite Karten
  - is: "cardwidth > 500"
    backgroundcolor: "#e8f4fd"
    border: "2px solid #2196f3"
    sub:
      - is: "typeOfView = panel"
        backgroundcolor: "#e3f2fd"
        border: "3px solid #1976d2"
        shadow: "0 4px 8px rgba(0,0,0,0.1)"
  
  # Bedingung für dunkles Theme
  - is: "theme = dark"
    backgroundcolor: "#2d2d2d"
    textcolor: "#ffffff"
    sub:
      - is: "cardwidth > 600"
        backgroundcolor: "#1a1a1a"
        border: "2px solid #777"
`
};

// Test der Karteninitialisierung
async function testCardIntegration() {
  console.log("🧪 Test der Kartenintegration mit erweiterter Konfiguration\n");
  
  try {
    // Karte erstellen
    const card = new CardImpl();
    console.log("✅ Karte erfolgreich erstellt");
    
    // Konfiguration setzen
    card.setConfig(testConfig);
    console.log("✅ Konfiguration erfolgreich gesetzt");
    
    // Umgebungsvariablen simulieren
    const env = card._getEnvironmentVariables();
    console.log("📋 Aktuelle Umgebungsvariablen:", env);
    
    // Erweiterte Konfiguration verarbeiten
    card._processExtendedConfig();
    console.log("✅ Erweiterte Konfiguration verarbeitet");
    
    // Finale Konfiguration anzeigen
    console.log("📋 Finale Konfiguration:");
    console.log("   backgroundcolor:", card.config.backgroundcolor);
    console.log("   textcolor:", card.config.textcolor);
    console.log("   border:", card.config.border);
    if (card.config.shadow) console.log("   shadow:", card.config.shadow);
    
    console.log("\n✅ Integration erfolgreich getestet!");
    
  } catch (error) {
    console.error("❌ Fehler beim Testen der Integration:", error);
  }
}

// Test starten
testCardIntegration().catch(console.error);