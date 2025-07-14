// Test für Dummy-Daten Generator
console.log('=== Dummy-Daten Test ===');

// Simuliere die TgCardHelper Klasse
class MockTgCardHelper {
  constructor(className, debugMode = false) {
    this.className = className;
    this.debugMode = debugMode;
  }

  _debug(method, message, data = null) {
    if (this.debugMode) {
      console.log(`[${this.className}] [${method}] :: ${message}`, data || '');
    }
  }
}

// Simuliere den EPG Box Context
class MockEpgBox {
  constructor() {
    this.debugMode = true;
    this.epgPastTime = 30;
    this.epgFutureTime = 120;
    this.earliestProgramStart = Number.MAX_SAFE_INTEGER;
    this.latestProgramStop = 0;
    this._channelsParameters = {
      minTime: 0,
      maxTime: 0
    };
    this._flatChannels = [];
    this.isChannelUpdate = 0;
    this._channelOrderInitialized = false;
    
    // Mock Channel Manager
    this.channelManager = {
      initializeChannelOrder() {
        console.log('Channel Order initialisiert');
      },
      sortChannelIntoStructure(channel) {
        console.log('Kanal zur Struktur hinzugefügt:', channel.channeldata.name);
        this._flatChannels.push(channel);
      },
      updateChannelInStructure(channel) {
        console.log('Kanal in Struktur aktualisiert:', channel.channeldata.name);
        return true;
      }
    };
  }
}

// Simuliere den Data Manager
class MockEpgDataManager extends MockTgCardHelper {
  constructor(epgBox) {
    super('EpgDataManager', epgBox.debugMode);
    this.epgBox = epgBox;
  }

  generateDummyData() {
    this._debug('generateDummyData()', 'Generiere Dummy-Daten für Debugging');

    const now = Math.floor(Date.now() / 1000);
    const baseTime = Math.floor(now / 1800) * 1800; // Runde auf nächste halbe Stunde
    
    const channelNames = [
      'ARD HD',
      'ZDF HD', 
      'RTL HD',
      'ProSieben HD'
    ];

    const programTitles = [
      'Tagesschau',
      'Heute Journal',
      'RTL Aktuell',
      'ProSieben News',
      'Sportschau',
      'ZDF Sport',
      'RTL Sport',
      'ProSieben Sport',
      'Tatort',
      'Polizeiruf 110',
      'RTL Crime',
      'ProSieben Crime'
    ];

    const dummyData = [];

    channelNames.forEach((channelName, channelIndex) => {
      const channelId = `DUMMY-CHANNEL-${channelIndex + 1}`;
      
      // Erstelle 3 Programme pro Kanal mit unterschiedlichen Startzeiten
      const programs = [];
      
      for (let i = 0; i < 3; i++) {
        // Dynamische Startzeit: Basis + Offset (Vielfache von 30 Minuten)
        const startOffset = (channelIndex * 2 + i * 3) * 1800; // 30 Minuten = 1800 Sekunden
        const duration = (2 + i) * 1800; // 1-3 Stunden
        
        const startTime = baseTime + startOffset;
        const endTime = startTime + duration;
        
        const programIndex = (channelIndex * 3 + i) % programTitles.length;
        
        programs.push({
          id: `${channelId}-PROG-${i + 1}`,
          title: `${programTitles[programIndex]} ${i + 1}`,
          start: startTime,
          stop: endTime,
          end: endTime, // Beide Varianten für Kompatibilität
          description: `Dummy-Programm ${i + 1} für ${channelName}`,
          category: ['News', 'Sport', 'Krimi'][i % 3]
        });
      }

      // Erstelle Kanal-Objekt im erwarteten Format
      const channelData = {
        channeldata: {
          id: channelId,
          channelid: channelId,
          name: channelName,
          logo: null
        },
        epg: programs.reduce((acc, program) => {
          acc[program.id] = program;
          return acc;
        }, {}),
        id: channelId,
        programs: programs
      };

      dummyData.push(channelData);
    });

    this._debug('generateDummyData()', 'Dummy-Daten generiert', {
      anzahlKanäle: dummyData.length,
      kanäle: dummyData.map(c => c.channeldata.name),
      programmeProKanal: dummyData.map(c => c.programs.length),
      zeitBereich: {
        start: new Date(baseTime * 1000).toISOString(),
        ende: new Date((baseTime + 24 * 3600) * 1000).toISOString()
      }
    });

    return dummyData;
  }
}

// Teste die Dummy-Daten Generierung
const mockEpgBox = new MockEpgBox();
const mockDataManager = new MockEpgDataManager(mockEpgBox);

console.log('Generiere Dummy-Daten...');
const dummyData = mockDataManager.generateDummyData();

console.log('\n=== Generierte Dummy-Daten ===');
dummyData.forEach((channel, index) => {
  console.log(`\nKanal ${index + 1}: ${channel.channeldata.name} (${channel.id})`);
  console.log('Programme:');
  
  channel.programs.forEach((program, progIndex) => {
    const startTime = new Date(program.start * 1000);
    const endTime = new Date(program.stop * 1000);
    const duration = (program.stop - program.start) / 3600; // Stunden
    
    console.log(`  ${progIndex + 1}. ${program.title}`);
    console.log(`     Start: ${startTime.toISOString()}`);
    console.log(`     Ende:  ${endTime.toISOString()}`);
    console.log(`     Dauer: ${duration.toFixed(1)} Stunden`);
    console.log(`     Kategorie: ${program.category}`);
  });
});

console.log('\n=== Test abgeschlossen ==='); 