#!/usr/bin/env node

/**
 * Test für das erweiterte Konfigurationssystem
 * Zeigt, wie Bedingungen und verschachtelte Konfigurationen funktionieren
 */

import { ExtendedConfigProcessor } from './src/tools/extended-config-processor.js';
import fs from 'fs';

// Basiskonfiguration
const baseConfig = {
  backgroundcolor: "#ffffff",
  textcolor: "#000000",
  border: "1px solid #ccc",
  padding: "16px",
  fontsize: "16px"
};

// Erweiterte Konfiguration (YAML-String)
const extendedConfigYaml = `
extensions:
  # Ebene 1: Variablen (immer angewendet)
  - backgroundcolor: "#f5f5f5"
  - textcolor: "#333333"
  
  # Ebene 1: Bedingung für breite Karten
  - is: "cardwidth > 500"
    backgroundcolor: "#e8f4fd"
    border: "2px solid #2196f3"
    nested:
      - is: "typeOfView = panel"
        backgroundcolor: "#e3f2fd"
        border: "3px solid #1976d2"
        shadow: "0 4px 8px rgba(0,0,0,0.1)"
  
  # Ebene 1: Bedingung für dunkles Theme
  - is: "theme = dark"
    backgroundcolor: "#2d2d2d"
    textcolor: "#ffffff"
    nested:
      - is: "cardwidth > 600"
        backgroundcolor: "#1a1a1a"
        border: "2px solid #777"
`;

// Umgebungsvariablen für verschiedene Szenarien
const testScenarios = [
  {
    name: "Standard (schmale Karte)",
    env: { cardwidth: 400, typeOfView: "card", theme: "light" }
  },
  {
    name: "Breite Karte",
    env: { cardwidth: 600, typeOfView: "card", theme: "light" }
  },
  {
    name: "Breite Karte + Panel",
    env: { cardwidth: 600, typeOfView: "panel", theme: "light" }
  },
  {
    name: "Dunkles Theme + breite Karte",
    env: { cardwidth: 700, typeOfView: "card", theme: "dark" }
  },
  {
    name: "Sehr breite Karte + Panel",
    env: { cardwidth: 800, typeOfView: "panel", theme: "light" }
  }
];

// Test ausführen
async function runTest() {
  console.log("🧪 Test des erweiterten Konfigurationssystems\n");
  
  const processor = new ExtendedConfigProcessor();
  
  for (const scenario of testScenarios) {
    console.log(`📋 Szenario: ${scenario.name}`);
    console.log(`   Umgebung: ${JSON.stringify(scenario.env)}`);
    
    try {
      const result = processor.processConfig(baseConfig, extendedConfigYaml, scenario.env);
      
      console.log(`   Ergebnis:`);
      console.log(`     backgroundcolor: ${result.backgroundcolor}`);
      console.log(`     textcolor: ${result.textcolor}`);
      console.log(`     border: ${result.border}`);
      if (result.shadow) console.log(`     shadow: ${result.shadow}`);
      console.log("");
      
    } catch (error) {
      console.error(`   ❌ Fehler: ${error.message}`);
      console.log("");
    }
  }
  
  console.log("✅ Test abgeschlossen!");
}

// Test starten
runTest().catch(console.error);
