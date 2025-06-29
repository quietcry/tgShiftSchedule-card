const Version = '2025.06';
// Test 1: const Version

// Test der neuen EPG-Zeitkonfigurationsvariablen
import {
  DefaultEpgPastTime,
  DefaultEpgFutureTime,
  DefaultEpgShowFutureTime,
  DefaultEpgShowPastTime,
  DefaultEpgShowPastTime,
} from './src/card-config.js';

console.log('=== EPG-KONFIGURATION TEST ===');
console.log('DefaultEpgPastTime:', DefaultEpgPastTime, 'Minuten');
console.log('DefaultEpgFutureTime:', DefaultEpgFutureTime, 'Minuten');
console.log('DefaultEpgShowFutureTime:', DefaultEpgShowFutureTime,
  DefaultEpgShowPastTime, 'Minuten');

// Test der Zeitberechnung
const now = new Date();
const startTime = new Date(now.getTime() - DefaultEpgPastTime * 60 * 1000);
const endTime = new Date(now.getTime() + DefaultEpgFutureTime * 60 * 1000);

console.log('\nZeitberechnung Test:');
console.log('Jetzt:', now.toISOString());
console.log('Startzeit:', startTime.toISOString());
console.log('Endzeit:', endTime.toISOString());
console.log('Zeitspanne:', Math.round((endTime - startTime) / (1000 * 60)), 'Minuten');

// Test der zentralen Scale-Berechnung (wie in epg-box.js)
const testZentraleScaleBerechnung = (containerWidth, epgShowFutureTime = 180) => {
  const scale = containerWidth / epgShowFutureTime;

  console.log(`\nZentrale Scale-Berechnung Test:`);
  console.log('Container-Breite:', containerWidth, 'Pixel');
  console.log('Anzeigebreite:', epgShowFutureTime, 'Minuten');
  console.log('Scale:', scale.toFixed(2), 'px/Minute');

  return scale;
};

// Teste verschiedene Programmdauern mit zentralem Scale
const testProgrammbreiten = (duration, scale) => {
  const width = duration * scale;

  console.log(`\nProgrammbreiten Test (Scale: ${scale.toFixed(2)}):`);
  console.log('Programmdauer:', duration, 'Minuten');
  console.log('Programmbreite:', width.toFixed(2), 'Pixel');

  return width;
};

// Teste verschiedene Container-Breiten (simuliert verschiedene Bildschirmgrößen)
console.log('\n=== DYNAMISCHE CONTAINER-BREITEN ERKENNUNG ===');

// Verschiedene Container-Breiten simulieren
const containerWidths = [800, 1200, 1600, 2000];

containerWidths.forEach(containerWidth => {
  const scale = testZentraleScaleBerechnung(containerWidth, 180);

  // Teste ein 60-Minuten-Programm
  testProgrammbreiten(60, scale);
});

// Teste verschiedene epgShowFutureTime Werte mit fester Container-Breite
console.log('\n=== EPGSHOWWIDTH VERGLEICH MIT DYNAMISCHER CONTAINER-BREITE ===');
const testContainerWidth = 1200;
const epgShowFutureTimes = [90, 180, 360];

epgShowFutureTimes.forEach(epgShowFutureTime => {
  const scale = testZentraleScaleBerechnung(testContainerWidth, epgShowFutureTime);
  testProgrammbreiten(60, scale);
});

console.log('\n=== VORTEILE DER DYNAMISCHEN CONTAINER-BREITEN ERKENNUNG ===');
console.log('1. Präzise Breitenberechnung basierend auf tatsächlicher Container-Größe');
console.log('2. Automatische Anpassung an verschiedene Bildschirmgrößen');
console.log('3. Responsive Design ohne manuelle Konfiguration');
console.log('4. Optimale Nutzung des verfügbaren Platzes');

console.log('\n=== TEST ABGESCHLOSSEN ===');
