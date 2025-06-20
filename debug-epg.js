// Debug-Skript für EPG-Darstellungsproblem
console.log('=== EPG Debug-Informationen ===');

// Simuliere EPG-Daten
const mockEpgData = {
  channel: {
    id: 'test-channel-1',
    name: 'Test Kanal 1'
  },
  programs: [
    {
      title: 'Test Programm 1',
      start: Math.floor(Date.now() / 1000) - 1800, // 30 Minuten in der Vergangenheit
      end: Math.floor(Date.now() / 1000) + 1800,   // 30 Minuten in der Zukunft
      description: 'Ein Testprogramm'
    },
    {
      title: 'Test Programm 2',
      start: Math.floor(Date.now() / 1000) + 3600, // 1 Stunde in der Zukunft
      end: Math.floor(Date.now() / 1000) + 7200,   // 2 Stunden in der Zukunft
      description: 'Ein weiteres Testprogramm'
    }
  ]
};

console.log('Mock EPG-Daten:', mockEpgData);

// Teste Zeitfilterung
const now = new Date();
const pastTime = 30; // Minuten
const futureTime = 120; // Minuten

const startTime = new Date(now.getTime() - (pastTime * 60 * 1000));
const endTime = new Date(now.getTime() + (futureTime * 60 * 1000));

console.log('Zeitfilterung:');
console.log('Aktuelle Zeit:', now.toISOString());
console.log('Startzeit (Vergangenheit):', startTime.toISOString());
console.log('Endzeit (Zukunft):', endTime.toISOString());

// Teste Programmfilterung
const filteredPrograms = mockEpgData.programs.filter(program => {
  const programStart = new Date(program.start * 1000);
  const programEnd = new Date(program.end * 1000);
  const overlaps = programStart < endTime && programEnd > startTime;

  console.log('Programm-Prüfung:', {
    title: program.title,
    start: programStart.toISOString(),
    end: programEnd.toISOString(),
    overlaps
  });

  return overlaps;
});

console.log('Gefilterte Programme:', filteredPrograms.length);
console.log('=== Debug abgeschlossen ===');