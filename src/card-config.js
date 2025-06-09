const Version = '2025.06-0006';
const CardRegname = 'tgepg-card';
const CardName = 'TG EPG Card';
const CardDescription = 'Eine Karte für die EPG-Anzeige';
const CardFilename = 'tgepg-card.js';
const DebugMode = 'true,CardImpl'; // Leer = kein Debug, 'true' = alles debuggen, 'true,Class1,Class2' = alles außer Class1,Class2 debuggen, 'Class1,Class2' = nur Class1,Class2 debuggen
const showVersion = true;

module.exports = {
  CardRegname,
  CardName,
  CardDescription,
  CardFilename,
  Version,
  DebugMode,
  showVersion,
};
