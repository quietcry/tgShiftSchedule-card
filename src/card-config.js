const Version = '2025.06-0040';
const CardRegname = 'tgepg-card';
const CardName = 'TG EPG Card';
const CardDescription = 'Eine Karte für die EPG-Anzeige';
const CardFilename = 'tgepg-card.js';
const DebugMode = 'true,EpgBox'; // Aktiviere Debug für alle Komponenten
const showVersion = true;

// EPG-Zeitkonfiguration
const DefaultEpgPastTime = 30; // Minuten in die Vergangenheit
const DefaultEpgFutureTime = 120; // Minuten in die Zukunft
const DefaultEpgShowWidth = 180; // Minuten sichtbar in der Ansicht

export {
  CardRegname,
  CardName,
  CardDescription,
  CardFilename,
  Version,
  DebugMode,
  showVersion,
  DefaultEpgPastTime,
  DefaultEpgFutureTime,
  DefaultEpgShowWidth,
};
