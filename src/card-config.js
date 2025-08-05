const Version = '2025.08-0008';
const CardRegname = 'tgepg-card';
const CardName = 'TG EPG Card';
const CardDescription = 'Eine Karte für die EPG-Anzeige';
const CardFilename = 'tgepg-card.js';
const DebugMode = 'true,EpgProgramItem,EnvSniffer'; // Aktiviere Debug für alle Komponenten
const UseDummyData = 'false'; // Verwende Dummy-Daten statt echte EPG-Daten (Build-Variable)
// Ändern Sie dies zu 'true' für Debug-Builds mit Dummy-Daten
const showVersion = true;

// EPG-Zeitkonfiguration
const DefaultEpgPastTime = 30; // Minuten in die Vergangenheit
const DefaultEpgFutureTime = 120; // Minuten in die Zukunft
const DefaultEpgShowFutureTime = 180; // Minuten sichtbar in der Ansicht
const DefaultEpgShowPastTime = 60; // Minuten für Rückblick (Backview)

export {
  CardRegname,
  CardName,
  CardDescription,
  CardFilename,
  Version,
  DebugMode,
  UseDummyData,
  showVersion,
  DefaultEpgPastTime,
  DefaultEpgFutureTime,
  DefaultEpgShowFutureTime,
  DefaultEpgShowPastTime,
};
