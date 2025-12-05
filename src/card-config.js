const Version = '2025.12-0021';
const CardRegname = 'tgshiftschedule-card';
const CardName = 'TG Schichtplan Card';
const CardDescription = 'Eine Schichtplan-Karte für Arbeitszeiten';
const CardFilename = 'tgshiftschedule-card.js';
const DebugMode = 'false'; // Aktiviere Debug für alle Komponenten
const UseDummyData = 'false';
const showVersion = false;

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
  DefaultConfig,
};
