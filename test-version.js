const Version = '2025.06';
// Test 1: const Version

// Test der neuen EPG-Zeitkonfigurationsvariablen
import { DefaultEpgPastTime, DefaultEpgFutureTime, DefaultEpgShowWidth } from './src/card-config.js';

console.log('EPG-Zeitkonfiguration Test:');
console.log('DefaultEpgPastTime:', DefaultEpgPastTime, 'Minuten');
console.log('DefaultEpgFutureTime:', DefaultEpgFutureTime, 'Minuten');
console.log('DefaultEpgShowWidth:', DefaultEpgShowWidth, 'Minuten');

// Test der Zeitberechnung
const now = new Date();
const pastTime = DefaultEpgPastTime;
const futureTime = DefaultEpgFutureTime;

const startTime = new Date(now.getTime() - (pastTime * 60 * 1000));
const endTime = new Date(now.getTime() + (futureTime * 60 * 1000));

console.log('\nZeitberechnung:');
console.log('Aktuelle Zeit:', now.toISOString());
console.log('Startzeit (Vergangenheit):', startTime.toISOString());
console.log('Endzeit (Zukunft):', endTime.toISOString());
console.log('Zeitspanne:', Math.round((endTime - startTime) / (1000 * 60)), 'Minuten');

// Test der Anzeigebreite
const showWidth = DefaultEpgShowWidth;
const containerWidth = 1200; // Geschätzte Container-Breite
const programDuration = 60; // 60 Minuten Programm
const widthRatio = programDuration / showWidth;
const programWidth = Math.max(100, widthRatio * containerWidth);

console.log('\nAnzeigebreite Test:');
console.log('Programmdauer:', programDuration, 'Minuten');
console.log('Anzeigebreite:', showWidth, 'Minuten');
console.log('Breitenverhältnis:', widthRatio);
console.log('Programmbreite:', programWidth, 'Pixel');


