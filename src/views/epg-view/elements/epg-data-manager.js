import { TgCardHelper } from '../../../tools/tg-card-helper.js';

/**
 * EPG Data Manager
 * Verwaltet alle daten-bezogenen Funktionen für die EPG-Box
 */
export class EpgDataManager extends TgCardHelper {
  static className = 'EpgDataManager';

  constructor(epgBox) {
    super('EpgDataManager', epgBox.debugMode);
    this.epgBox = epgBox;
  }

  /**
   * Getter für minTime aus den Kanal-Parametern
   */
  get minTime() {
    return this.epgBox._channelsParameters?.minTime || 0;
  }

  /**
   * Getter für maxTime aus den Kanal-Parametern
   */
  get maxTime() {
    return this.epgBox._channelsParameters?.maxTime || 0;
  }

  /**
   * Fügt Teil-EPG-Daten hinzu
   */
  addTeilEpg(teilEpg) {
    this._debug('addTeilEpg()', 'Teil-EPG-Daten erhalten', teilEpg);

    if (!teilEpg || !teilEpg.channeldata) {
      this._debug('addTeilEpg()', 'Ungültige Teil-EPG-Daten erhalten', teilEpg);
      return;
    }
    if (!teilEpg.epg || typeof teilEpg.epg !== 'object') {
      this._debug('addTeilEpg()', 'Teil-EPG-Daten enthalten keine EPG-Daten', teilEpg);
      return;
    }

    const channel = teilEpg.channeldata;
    const now = new Date();
    const seconds = Math.floor(now.getTime() / 1000);
    const epgPastTime = seconds - (this.epgBox.epgPastTime || 30) * 60; // Sekunden in die Vergangenheit
    const epgFutureTime = seconds + (this.epgBox.epgFutureTime || 120) * 60; // Sekunden in die Zukunft

    // this._debug('addTeilEpg() - Zeitfenster berechnet', {
    //   jetzt: seconds,
    //   epgPastTime,
    //   epgFutureTime,
    //   epgPastTimeMinutes: this.epgBox.epgPastTime || 30,
    //   epgFutureTimeMinutes: this.epgBox.epgFutureTime || 120,
    // });

    let programs = Object.values(teilEpg.epg);
    // Sortiere Programme nach Startzeit
    programs.sort((a, b) => a.start - b.start);

    // this._debug('addTeilEpg() - Programme vor Filterung', {
    //   anzahlProgramme: programs.length,
    //   programme: programs.map(p => ({ title: p.title, start: p.start, stop: p.stop })),
    // });

    let bis = 0;
    let von = 0;
    programs.forEach((program, index) => {
      if (program.stop < epgPastTime) {
        bis++;
        // this._debug('addTeilEpg() - Programm entfernt (zu früh)', {
        //   title: program.title,
        //   start: program.start,
        //   stop: program.stop,
        //   epgPastTime,
        // });
      } else {
        return; // Beende Schleife, da Array sortiert ist
      }
    });

    programs.splice(von, bis);

    // Entferne Programme, die komplett außerhalb des sichtbaren Zeitfensters liegen
    bis = 0;
    von = programs.length;
    [...programs].reverse().forEach((program, index) => {
      if (program.start > epgFutureTime) {
        bis++;
        // this._debug('addTeilEpg() - Programm entfernt (zu spät)', {
        //   title: program.title,
        //   start: program.start,
        //   stop: program.stop,
        //   epgFutureTime,
        // });
      } else {
        return; // Beende Schleife, da Array sortiert ist
      }
    });

    programs.splice(von - bis, bis);

    this._debug('addTeilEpg() - Programme nach Filterung', {
      anzahlProgramme: programs.length,
      programme: programs.map(p => ({ title: p.title, start: p.start, stop: p.stop })),
    });

    // Füge Gap-Elemente zwischen Programmen ein (für Lücken und Überschneidungen)
    programs = this.insertGapsBetweenPrograms(programs);

    this._debug('addTeilEpg() - Programme nach Gap-Einfügung', {
      anzahlProgramme: programs.length,
      programme: programs.map(p => ({
        title: p.title || p.type,
        start: p.start,
        stop: p.stop,
        type: p.type,
      })),
    });

    // Prüfe, ob der Kanal gültige Programmdaten hat
    if (!programs || programs.length === 0) {
      this._debug('addTeilEpg()', 'Kanal hat keine gültigen Programmdaten, überspringe', {
        kanal: channel.name || channel.channeldata?.name,
        kanalId: channel.id || channel.channelid,
      });
      return;
    }

    // Entfernt: updateEarliestProgramStart und updateLatestProgramStop werden jetzt vom RenderManager verwaltet
    // if (programs.length > 0) {
    //     this.updateEarliestProgramStart(programs[0].start);
    //
    //     // Aktualisiere auch latestProgramStop
    //     const lastProgram = programs[programs.length - 1];
    //     const lastProgramStop = lastProgram.stop || lastProgram.end;
    //     this.updateLatestProgramStop(lastProgramStop);
    // }

    this._debug('addTeilEpg()', 'Earliest Start und Latest Stop', {
      earliest: this.epgBox.earliestProgramStart,
      latest: this.epgBox.latestProgramStop,
    });

    const channelWithPrograms = {
      ...teilEpg, // Behalte die komplette ursprüngliche Struktur (channeldata + epg)
      id: channel.id || channel.channelid || channel.name, // Stelle sicher, dass eine ID vorhanden ist
      programs: programs, // Füge Programm-Array hinzu
    };

    // Erstelle Kanal-Objekt - behalte die komplette ursprüngliche Struktur
    // const channelWithPrograms = {
    //   ...teilEpg, // Behalte die komplette ursprüngliche Struktur (channeldata + epg)
    //   id: channel.id || channel.channelid || channel.name, // Stelle sicher, dass eine ID vorhanden ist
    //   programs: [], // Füge leeres Programm-Array hinzu
    // };

    this._debug('addTeilEpg() - Kanal-Objekt erstellt', {
      original: channelWithPrograms,
      originalId: channel.id,
      originalChannelId: channel.channelid,
      finalId: channelWithPrograms.id,
      name: channelWithPrograms.name,
      alleEigenschaften: Object.keys(channelWithPrograms),
      hatChanneldata: 'channeldata' in channelWithPrograms,
      hatEpg: 'epg' in channelWithPrograms,
      channeldataInhalt: channelWithPrograms.channeldata
        ? Object.keys(channelWithPrograms.channeldata)
        : 'nicht vorhanden',
      epgInhalt: channelWithPrograms.epg ? Object.keys(channelWithPrograms.epg) : 'nicht vorhanden',
    });

    // Füge die Programme hinzu oder aktualisiere sie
    // if (programs && Array.isArray(programs)) {
    //   programs.forEach(newProgram => {
    //     // Suche nach bestehendem Programm mit gleicher Startzeit
    //     const existingProgramIndex = channelWithPrograms.programs.findIndex(
    //       p => p.start === newProgram.start
    //     );

    //     if (existingProgramIndex >= 0) {
    //       // Aktualisiere bestehendes Programm
    //       channelWithPrograms.programs[existingProgramIndex] = {
    //         ...channelWithPrograms.programs[existingProgramIndex],
    //         ...newProgram,
    //       };
    //     } else {
    //       // Füge neues Programm hinzu
    //       channelWithPrograms.programs.push(newProgram);
    //     }
    //   });

    //   // Sortiere Programme nach Startzeit
    //   channelWithPrograms.programs.sort((a, b) => a.start - b.start);
    //   if (channelWithPrograms.programs.length > 0) {
    //     this.updateEarliestProgramStart(channelWithPrograms.programs[0].start);
    //   }
    // }
    // Erhöhe den Update-Counter
    this.epgBox.isChannelUpdate++;

    // Aktualisiere die Sortierungsstruktur
    if (!this.epgBox._channelOrderInitialized) {
      this.epgBox.channelManager.initializeChannelOrder();
    }

    // Prüfe, ob der Kanal bereits existiert
    const existingChannelIndex = this.epgBox._flatChannels.findIndex(
      c => c.id === channelWithPrograms.id
    );

    if (existingChannelIndex !== -1) {
      // Kanal existiert bereits - aktualisiere nur die Programme
      this._debug('addTeilEpg()', 'Kanal existiert bereits - aktualisiere Programme', {
        channelId: channelWithPrograms.id,
      });

      const success = this.updateChannelPrograms(
        channelWithPrograms.id,
        channelWithPrograms.programs
      );
      if (!success) {
        // Fallback: Verwende die ursprüngliche Methode
        this.epgBox.channelManager.sortChannelIntoStructure(channelWithPrograms);
      }
    } else {
      // Neuer Kanal - füge ihn zur Struktur hinzu
      this._debug('addTeilEpg()', 'Neuer Kanal - füge zur Struktur hinzu', {
        channelId: channelWithPrograms.id,
      });
    this.epgBox.channelManager.sortChannelIntoStructure(channelWithPrograms);
    }

    // Mit repeat-Direktive ist requestUpdate() nicht mehr nötig - Lit macht es automatisch
  }

  /**
   * Generiert Zeit-Slots für die EPG-Anzeige
   */
  generateTimeSlots() {
    const now = new Date();
    const pastTime = this.epgBox.epgPastTime || 30;
    const showWidth = this.epgBox.epgShowFutureTime || 180;

    // Berechne Start- und Endzeit
    const startTime = new Date(now.getTime() - pastTime * 60 * 1000);
    const endTime = new Date(now.getTime() + showWidth * 60 * 1000);

    // Aktualisiere die Kanal-Parameter
    this.epgBox._channelsParameters = {
      minTime: Math.floor(startTime.getTime() / 1000),
      maxTime: Math.floor(endTime.getTime() / 1000),
    };

    // Behalte earliestProgramStart und latestProgramStop als eigenständige Variablen
    if (!this.epgBox.earliestProgramStart) {
      this.epgBox.earliestProgramStart = Math.floor(Date.now() / 1000);
    }
    if (!this.epgBox.latestProgramStop) {
      this.epgBox.latestProgramStop = Math.floor(Date.now() / 1000);
    }

    this._debug('generateTimeSlots()', 'Zeit-Slots generiert', {
      jetzt: now.toISOString(),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      minTime: this.epgBox._channelsParameters.minTime,
      maxTime: this.epgBox._channelsParameters.maxTime,
    });

    return {
      startTime,
      endTime,
      currentTime: now,
    };
  }

  /**
   * Prüft, ob ein Zeit-Slot die aktuelle Zeit enthält
   */
  isCurrentTimeSlot(slot, currentTime) {
    return slot.start <= currentTime && slot.end > currentTime;
  }

  /**
   * Holt die Programme für einen Kanal basierend auf den Zeit-Slots
   */
  getProgramsForChannel(channel, timeSlots) {
    if (!channel || !channel.programs || !Array.isArray(channel.programs)) {
      return [];
    }

    const { minTime, maxTime } = this.epgBox._channelsParameters;
    const currentTime = Math.floor(Date.now() / 1000);

    this._debug('getProgramsForChannel()', 'Filtere Programme für Kanal', {
      kanal: channel.channeldata?.name || channel.name,
      anzahlProgramme: channel.programs.length,
      minTime,
      maxTime,
      currentTime,
    });

    // Filtere Programme, die im sichtbaren Zeitfenster liegen
    const filteredPrograms = channel.programs.filter(program => {
      const programStart = program.start;
      const programEnd = program.end || program.stop || programStart + 3600; // Fallback: 1 Stunde

      // Prüfe Überlappung mit dem sichtbaren Zeitfenster
      const overlaps = programStart < maxTime && programEnd > minTime;

      // this.epgBox._debug('EpgDataManager: Programm-Prüfung', {
      //   title: program.title,
      //   start: new Date(programStart * 1000).toISOString(),
      //   end: new Date(programEnd * 1000).toISOString(),
      //   overlaps,
      // });

      return overlaps;
    });

    this._debug('getProgramsForChannel()', 'Gefilterte Programme', {
      kanal: channel.name,
      gefiltert: filteredPrograms.length,
      programme: filteredPrograms.map(p => ({
        title: p.title,
        start: new Date(p.start * 1000).toISOString(),
        end: new Date((p.end || p.stop || p.start + 3600) * 1000).toISOString(),
      })),
    });

    return filteredPrograms;
  }

  /**
   * Berechnet den frühesten Programmstart aller Kanäle und aktualisiert earliestProgramStart
   */
  updateEarliestProgramStart(newEarliestStart) {
    this._debug('updateEarliestProgramStart()', 'Aktualisiere frühesten Programmstart', {
      newEarliestStart,
      currentEarliest: this.epgBox.earliestProgramStart,
    });

    if (newEarliestStart < this.epgBox.earliestProgramStart) {
      this.epgBox.earliestProgramStart = newEarliestStart;
      return this.epgBox.earliestProgramStart;
    }
  }

  /**
   * Berechnet den spätesten Programmstop aller Kanäle und aktualisiert latestProgramStop
   */
  updateLatestProgramStop(newLatestStop) {
    this._debug('updateLatestProgramStop()', 'Aktualisiere spätesten Programmstop', {
      newLatestStop,
      currentLatest: this.epgBox.latestProgramStop,
    });

    if (newLatestStop > this.epgBox.latestProgramStop) {
      this.epgBox.latestProgramStop = newLatestStop;
      return this.epgBox.latestProgramStop;
    }
  }

  /**
   * Optimierte Methode: Aktualisiert nur die Programme eines bestehenden Kanals
   * Für effiziente Updates mit der repeat-Direktive
   * @param {string} channelId - ID des Kanals
   * @param {Array} newPrograms - Neue Programme
   */
  updateChannelPrograms(channelId, newPrograms) {
    this._debug('updateChannelPrograms()', 'Update Programme für Kanal', {
      channelId,
      anzahlProgramme: newPrograms.length,
    });

    // Finde den Kanal im flachen Array
    const channelIndex = this.epgBox._flatChannels.findIndex(c => c.id === channelId);
    if (channelIndex === -1) {
      this._debug('updateChannelPrograms()', 'Kanal nicht gefunden', { channelId });
      return false;
    }

    // Aktualisiere die Programme
    const updatedChannel = {
      ...this.epgBox._flatChannels[channelIndex],
      programs: newPrograms,
    };

    // Sortiere Programme nach Startzeit
    updatedChannel.programs.sort((a, b) => a.start - b.start);

    // Aktualisiere den Kanal in der Struktur
    const success = this.epgBox.channelManager.updateChannelInStructure(updatedChannel);

    if (success) {
      // Entfernt: updateEarliestProgramStart und updateLatestProgramStop werden jetzt vom RenderManager verwaltet
      // // Aktualisiere den frühesten Programmstart und spätesten Programmstop
      // if (newPrograms.length > 0) {
      //   this.updateEarliestProgramStart(newPrograms[0].start);
      //
      //   // Aktualisiere auch latestProgramStop
      //   const lastProgram = newPrograms[newPrograms.length - 1];
      //   const lastProgramStop = lastProgram.stop || lastProgram.end;
      //   this.updateLatestProgramStop(lastProgramStop);
      // }

      this._debug('updateChannelPrograms', 'Programme erfolgreich aktualisiert', {
        channelId,
        anzahlProgramme: newPrograms.length,
      });
    }

    return success;
  }

  /**
   * Optimierte Methode: Fügt Programme zu einem bestehenden Kanal hinzu
   * Für effiziente Updates mit der repeat-Direktive
   * @param {string} channelId - ID des Kanals
   * @param {Array} additionalPrograms - Zusätzliche Programme
   */
  addProgramsToChannel(channelId, additionalPrograms) {
    this._debug('addProgramsToChannel()', 'Füge Programme zu Kanal hinzu', {
      channelId,
      anzahlProgramme: additionalPrograms.length,
    });

    // Finde den Kanal im flachen Array
    const channelIndex = this.epgBox._flatChannels.findIndex(c => c.id === channelId);
    if (channelIndex === -1) {
      this._debug('addProgramsToChannel()', 'Kanal nicht gefunden', { channelId });
      return false;
    }

    const currentChannel = this.epgBox._flatChannels[channelIndex];
    const currentPrograms = currentChannel.programs || [];

    // Füge neue Programme hinzu oder aktualisiere bestehende
    const updatedPrograms = [...currentPrograms];
    additionalPrograms.forEach(newProgram => {
      const existingIndex = updatedPrograms.findIndex(p => p.start === newProgram.start);
      if (existingIndex >= 0) {
        // Aktualisiere bestehendes Programm
        updatedPrograms[existingIndex] = {
          ...updatedPrograms[existingIndex],
          ...newProgram,
        };
      } else {
        // Füge neues Programm hinzu
        updatedPrograms.push(newProgram);
      }
    });

    // Sortiere Programme nach Startzeit
    updatedPrograms.sort((a, b) => a.start - b.start);

    // Aktualisiere den Kanal
    return this.updateChannelPrograms(channelId, updatedPrograms);
  }

  /**
   * Optimierte Methode: Entfernt Programme aus einem Kanal
   * Für effiziente Updates mit der repeat-Direktive
   * @param {string} channelId - ID des Kanals
   * @param {Array} programStartTimes - Startzeiten der zu entfernenden Programme
   */
  removeProgramsFromChannel(channelId, programStartTimes) {
    this._debug('removeProgramsFromChannel()', 'Entferne Programme von Kanal', {
      channelId,
      anzahlProgramme: programStartTimes.length,
    });

    // Finde den Kanal im flachen Array
    const channelIndex = this.epgBox._flatChannels.findIndex(c => c.id === channelId);
    if (channelIndex === -1) {
      this._debug('removeProgramsFromChannel()', 'Kanal nicht gefunden', { channelId });
      return false;
    }

    const currentChannel = this.epgBox._flatChannels[channelIndex];
    const currentPrograms = currentChannel.programs || [];

    // Entferne Programme mit den angegebenen Startzeiten
    const updatedPrograms = currentPrograms.filter(
      program => !programStartTimes.includes(program.start)
    );

    // Aktualisiere den Kanal
    return this.updateChannelPrograms(channelId, updatedPrograms);
  }

  /**
   * Optimierte Methode: Aktualisiert die Current-Zustände aller Programme
   * Für effiziente Updates mit der repeat-Direktive
   * @param {number} currentTime - Aktuelle Zeit für Current-Berechnung
   */
  updateAllCurrentStates(currentTime) {
    this._debug('updateAllCurrentStates()', 'Update Current-Zustände für alle Programme', {
      currentTime: new Date(currentTime * 1000).toISOString(),
    });

    let updated = false;

    // Gehe durch alle Kanäle im flachen Array
    this.epgBox._flatChannels.forEach(channel => {
      if (channel.programs && Array.isArray(channel.programs)) {
        channel.programs.forEach(program => {
          const isCurrent = this.isCurrentTimeSlot(program, currentTime);
          if (program.isCurrent !== isCurrent) {
            program.isCurrent = isCurrent;
            updated = true;
          }
        });
      }
    });

    if (updated) {
      this._debug('EpgDataManager', 'Current-Zustände aktualisiert');
      // Trigger ein Update, damit Lit die Änderungen rendert
      this.epgBox.requestUpdate();
    }

    return updated;
  }

  /**
   * Optimierte Methode: Aktualisiert die Zeit-Parameter und triggert ein Update
   * Für effiziente Updates mit der repeat-Direktive
   */
  updateTimeParameters() {
    const timeSlots = this.generateTimeSlots();

    this._debug('EpgDataManager', 'Zeit-Parameter aktualisiert', {
      minTime: this.epgBox._channelsParameters.minTime,
      maxTime: this.epgBox._channelsParameters.maxTime,
    });

    // Trigger ein Update, damit Lit die Änderungen rendert
    this.epgBox.requestUpdate();

    return timeSlots;
  }

  /**
   * Optimierte Methode: Bereinigt alte Programme außerhalb des sichtbaren Zeitfensters
   * Für bessere Performance mit der repeat-Direktive
   */
  cleanupOldPrograms() {
    const { minTime, maxTime } = this.epgBox._channelsParameters;
    let cleanedChannels = 0;

    this.epgBox._flatChannels.forEach(channel => {
      if (channel.programs && Array.isArray(channel.programs)) {
        const originalLength = channel.programs.length;

        // Entferne Programme, die komplett außerhalb des sichtbaren Zeitfensters liegen
        channel.programs = channel.programs.filter(program => {
          const programStart = program.start;
          const programEnd = program.end || program.stop || programStart + 3600;

          // Behalte Programme, die mit dem sichtbaren Zeitfenster überlappen
          return programStart < maxTime && programEnd > minTime;
        });

        if (channel.programs.length !== originalLength) {
          cleanedChannels++;
          this._debug('EpgDataManager', 'Programme bereinigt', {
            channelId: channel.id,
            vorher: originalLength,
            nachher: channel.programs.length,
          });
        }
      }
    });

    if (cleanedChannels > 0) {
      this._debug('EpgDataManager', 'Bereinigung abgeschlossen', {
        bereinigteKanäle: cleanedChannels,
      });
      // Trigger ein Update, damit Lit die Änderungen rendert
      this.epgBox.requestUpdate();
    }

    return cleanedChannels;
  }

  /**
   * Generiert Dummy-Daten für Debugging-Zwecke
   * 4 Kanäle mit je 3 Programmen, Start/Stop-Werte als Vielfache von 30 Minuten
   */
  generateDummyData() {
    this._debug('generateDummyData()', 'Generiere Dummy-Daten für Debugging');

    const now = Math.floor(Date.now() / 1000);
    const baseTime = Math.floor(now / 1800) * 1800; // Runde auf nächste halbe Stunde

    const channelNames = ['ARD HD', 'ZDF HD', 'RTL HD', 'ProSieben HD'];

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
      'ProSieben Crime',
    ];

    const dummyData = [];

    channelNames.forEach((channelName, channelIndex) => {
      const channelId = `DUMMY-CHANNEL-${channelIndex + 1}`;
      // Erstelle 3 Programme pro Kanal mit unterschiedlichen Startzeiten
      const programs = [];
      for (let i = 0; i < 3; i++) {
        // Dynamische Startzeit: Basis + Offset (Vielfache von 30 Minuten)
        let startOffset = (channelIndex * 2 + i * 3) * 1800; // 30 Minuten = 1800 Sekunden
        const duration = (2 + i) * 1800; // 1-3 Stunden
        let startTime = baseTime + startOffset;
        let endTime = startTime + duration;
        const programIndex = (channelIndex * 3 + i) % programTitles.length;
        // Spezialfall: ARD HD, 2. Programm (Heute Journal 2) soll direkt nach Tagesschau 1 beginnen
        if (channelName === 'ARD HD' && i === 1 && programs.length > 0) {
          startTime = programs[0].stop; // direkt nach erstem Programm
          endTime = startTime + duration;
        }
        // Spezialfall: ARD HD, 3. Programm (RTL Aktuell 3) soll direkt nach Heute Journal 2 beginnen
        if (channelName === 'ARD HD' && i === 2 && programs.length > 0) {
          startTime = programs[1].stop; // direkt nach zweitem Programm
          endTime = startTime + duration;
        }
        programs.push({
          id: `${channelId}-PROG-${i + 1}`,
          title: `${programTitles[programIndex]} ${i + 1}`,
          start: startTime,
          stop: endTime,
          end: endTime, // Beide Varianten für Kompatibilität
          description: `Dummy-Programm ${i + 1} für ${channelName}`,
          category: ['News', 'Sport', 'Krimi'][i % 3],
        });
      }

      // Erstelle Kanal-Objekt im erwarteten Format
      const channelData = {
        channeldata: {
          id: channelId,
          channelid: channelId,
          name: channelName,
          logo: null,
        },
        epg: programs.reduce((acc, program) => {
          acc[program.id] = program;
          return acc;
        }, {}),
        id: channelId,
        programs: programs,
      };

      dummyData.push(channelData);
    });

    this._debug('generateDummyData()', 'Dummy-Daten generiert', {
      anzahlKanäle: dummyData.length,
      kanäle: dummyData.map(c => c.channeldata.name),
      programmeProKanal: dummyData.map(c => c.programs.length),
      zeitBereich: {
        start: new Date(baseTime * 1000).toISOString(),
        ende: new Date((baseTime + 24 * 3600) * 1000).toISOString(),
      },
    });

    // Programme für console.table aufbereiten
    const tableData = dummyData.flatMap(channel =>
      channel.programs.map(program => ({
        Kanal: channel.channeldata.name,
        Titel: program.title,
        Start: new Date(program.start * 1000).toLocaleString(),
        Stop: new Date(program.stop * 1000).toLocaleString(),
        Kategorie: program.category,
      }))
    );
    console.debug('progdebug', 'Dummy-Programme:');
    console.table(tableData);

    return dummyData;
  }

  /**
   * Lädt Dummy-Daten in das EPG-System
   */
  loadDummyData() {
    this._debug('loadDummyData()', 'Lade Dummy-Daten ins EPG-System');

    const dummyData = this.generateDummyData();

    // Füge jeden Kanal hinzu
    dummyData.forEach(channelData => {
      this.addTeilEpg(channelData);
    });

    this._debug('loadDummyData()', 'Dummy-Daten erfolgreich geladen', {
      anzahlKanäle: dummyData.length,
    });
  }

  /**
   * Fügt Gap-Elemente zwischen Programmen ein, um Lücken und Überschneidungen zu behandeln
   * @param {Array} programs - Array der Programme
   * @returns {Array} - Array mit Programmen und Gap-Elementen
   */
  insertGapsBetweenPrograms(programs) {
    if (programs.length <= 1) {
      return programs; // Keine Lücken möglich
    }

    const result = [];
    const minGapSize = 60; // Minimale Gap-Größe in Sekunden (1 Minute)

    for (let i = 0; i < programs.length; i++) {
      const currentProgram = programs[i];

      // Füge das aktuelle Programm hinzu
      result.push(currentProgram);

      // Prüfe, ob es ein nächstes Programm gibt
      if (i < programs.length - 1) {
        const nextProgram = programs[i + 1];

        // Berechne die Lücke zwischen den Programmen
        const gapStart = currentProgram.stop;
        const gapEnd = nextProgram.start;
        const gapSize = gapEnd - gapStart;

        // this._debug('insertGapsBetweenPrograms() - Prüfe Lücke', {
        //   currentProgram: currentProgram.title,
        //   nextProgram: nextProgram.title,
        //   gapStart: new Date(gapStart * 1000).toISOString(),
        //   gapEnd: new Date(gapEnd * 1000).toISOString(),
        //   gapSize: gapSize,
        //   gapSizeMinutes: Math.round(gapSize / 60),
        // });

        // Füge Gap ein, wenn Lücke groß genug ist
        if (gapSize > minGapSize) {
          const gapItem = {
            id: `gap-${currentProgram.id}-${nextProgram.id}`,
            type: 'fillergap',
            start: gapStart,
            stop: gapEnd,
            isGap: true,
          };

          result.push(gapItem);

          // this._debug('insertGapsBetweenPrograms() - Gap eingefügt', {
          //   gapId: gapItem.id,
          //   gapSize: gapSize,
          //   gapSizeMinutes: Math.round(gapSize / 60),
          // });
        }
        // Prüfe auf Überschneidungen
        else if (gapSize < 0) {
          const overlapSize = Math.abs(gapSize);

          this._debug('insertGapsBetweenPrograms() - Überschneidung erkannt', {
            currentProgram: currentProgram.title,
            nextProgram: nextProgram.title,
            overlapSize: overlapSize,
            overlapSizeMinutes: Math.round(overlapSize / 60),
          });

          // Strategie: Längere Sendung behalten, kürzere kürzen
          const currentDuration = currentProgram.stop - currentProgram.start;
          const nextDuration = nextProgram.stop - nextProgram.start;

          if (currentDuration >= nextDuration) {
            // Aktuelle Sendung ist länger - kürze nächste
            nextProgram.start = currentProgram.stop;
            this._debug('insertGapsBetweenPrograms() - Nächste Sendung gekürzt', {
              newStart: new Date(nextProgram.start * 1000).toISOString(),
            });
          } else {
            // Nächste Sendung ist länger - kürze aktuelle
            currentProgram.stop = nextProgram.start;
            this._debug('insertGapsBetweenPrograms() - Aktuelle Sendung gekürzt', {
              newStop: new Date(currentProgram.stop * 1000).toISOString(),
            });
          }
        }
      }
    }

    return result;
  }
}
