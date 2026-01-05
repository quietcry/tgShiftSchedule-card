const Version = '2026.01-0014';
const CardRegname = 'tgshiftschedule-card';
const CardName = 'TG Schichtplan Card';
const CardDescription = 'Eine Schichtplan-Karte für Arbeitszeiten';
const CardFilename = 'tgshiftschedule-card.js';
const DebugMode = 'true'; // Aktiviere Debug für alle Komponenten
const UseDummyData = 'false';
const showVersion = false;
const SaveDebounceTime = 300; // Debounce-Zeit in Millisekunden für das Speichern von Änderungen (0 = sofort, ohne Debouncing)

// Schichtplan-Konfiguration
const DefaultConfig = {
  entity: '', // input_text Entity für Speicherung (muss konfiguriert werden)
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
  SaveDebounceTime,
  DefaultConfig,
};
