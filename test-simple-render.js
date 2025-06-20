// Einfacher Test für EPG-Darstellung
console.log('=== EPG Darstellung Test ===');

// Simuliere EPG-Daten wie sie vom Service kommen
const mockEpgData = [
  {
    channel: {
      id: 'C-61441-10009-11130',
      name: 'zdfneo HD'
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
  }
];

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

// Teste Programmfilterung für jeden Kanal
mockEpgData.forEach(channelData => {
  console.log(`\nKanal: ${channelData.channel.name}`);
  console.log('Anzahl Programme vor Filterung:', channelData.programs.length);

  const filteredPrograms = channelData.programs.filter(program => {
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

  console.log('Anzahl Programme nach Filterung:', filteredPrograms.length);
  console.log('Gefilterte Programme:', filteredPrograms.map(p => p.title));
});

console.log('=== Test abgeschlossen ===');