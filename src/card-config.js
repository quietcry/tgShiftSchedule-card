const Version = '2025.10-0003';
const CardRegname = 'tgepg-card';
const CardName = 'TG EPG Card';
const CardDescription = 'Eine Karte für die EPG-Anzeige';
const CardFilename = 'tgepg-card.js';
const DebugMode = 'true,EpgRenderManager,EnvSniffer'; // Aktiviere Debug für alle Komponenten
const UseDummyData = 'false'; // Verwende Dummy-Daten statt echte EPG-Daten (Build-Variable)
// Ändern Sie dies zu 'true' für Debug-Builds mit Dummy-Daten
const showVersion = true;

// EPG-Zeitkonfiguration
const DefaultConfig = {
  epgShowPastTime: 60, // Minuten für Rückblick (Backview)
  epgShowFutureTime: 180, // Minuten sichtbar in der Ansicht
  epgPastTime: 30, // Minuten in die Vergangenheit
  epgFutureTime: 120, // Minuten in die Zukunft
};

export {
  CardRegname,
  CardName,
  CardDescription,
  CardFilename,
  Version,
  DebugMode,
  UseDummyData,
  showVersion,
  DefaultConfig,
};
