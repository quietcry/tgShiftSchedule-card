// Debug-Skript für EPG-Darstellungsproblem
console.log('=== EPG Darstellung Debug ===');

// Simuliere die Datenstruktur wie sie vom Service kommt
const mockServiceResponse = {
  context: {},
  response: {
    epg_data: {
      "C-61441-10009-11130": {
        title: "Test Programm 1",
        start: Math.floor(Date.now() / 1000) - 1800,
        stop: Math.floor(Date.now() / 1000) + 1800,
        description: "Ein Testprogramm"
      },
      "C-61441-10009-11131": {
        title: "Test Programm 2",
        start: Math.floor(Date.now() / 1000) + 3600,
        stop: Math.floor(Date.now() / 1000) + 7200,
        description: "Ein weiteres Testprogramm"
      }
    }
  }
};

console.log('Mock Service Response:', mockServiceResponse);

// Simuliere die DataProvider-Verarbeitung
function processServiceResponse(response) {
  let epgData = [];

  if (response && response.response) {
    if (response.response.epg_data && typeof response.response.epg_data === 'object') {
      // Konvertiere das epg-Objekt in ein Array
      const epgObject = response.response.epg_data;
      epgData = Object.values(epgObject).map(program => ({
        ...program,
        start: typeof program.start === 'string' ? parseInt(program.start) : program.start,
        stop: typeof program.stop === 'string' ? parseInt(program.stop) : program.stop,
        end: program.end || program.stop,
      }));

      console.log('Verarbeitete EPG-Daten:', {
        anzahlZeitstempel: Object.keys(epgObject).length,
        zeitstempel: Object.keys(epgObject),
        anzahlProgramme: epgData.length,
        programme: epgData
      });
    }
  }

  return epgData;
}

// Teste die Verarbeitung
const processedData = processServiceResponse(mockServiceResponse);

// Teste Zeitfilterung
const now = new Date();
const pastTime = 30; // Minuten
const futureTime = 120; // Minuten

const startTime = new Date(now.getTime() - (pastTime * 60 * 1000));
const endTime = new Date(now.getTime() + (futureTime * 60 * 1000));

console.log('\nZeitfilterung:');
console.log('Aktuelle Zeit:', now.toISOString());
console.log('Startzeit (Vergangenheit):', startTime.toISOString());
console.log('Endzeit (Zukunft):', endTime.toISOString());

const filteredPrograms = processedData.filter(program => {
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

console.log('\nGefilterte Programme:', filteredPrograms.length);
console.log('Programme:', filteredPrograms.map(p => p.title));

console.log('=== Debug abgeschlossen ===');