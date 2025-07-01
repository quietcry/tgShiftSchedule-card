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

    const channel = teilEpg.channeldata;
    const programs =
      teilEpg.epg && typeof teilEpg.epg === 'object' ? Object.values(teilEpg.epg) : [];

    this._debug('addTeilEpg()', 'Füge Teil-EPG hinzu', {
      kanal: channel.channeldata?.name || channel.name,
      kanalId: channel.channelid,
      anzahlProgramme: programs.length,
      isFirstLoad: this.epgBox.isFirstLoad,
    });

    // Erhöhe den Update-Counter
    this.epgBox.isChannelUpdate++;

    // Erstelle Kanal-Objekt - behalte die komplette ursprüngliche Struktur
    const channelWithPrograms = {
      ...teilEpg, // Behalte die komplette ursprüngliche Struktur (channeldata + epg)
      id: channel.id || channel.channelid || channel.name, // Stelle sicher, dass eine ID vorhanden ist
      programs: [], // Füge leeres Programm-Array hinzu
    };

    this._debug('addTeilEpg()', 'Kanal-Objekt erstellt', {
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
    if (programs && Array.isArray(programs)) {
      programs.forEach(newProgram => {
        // Suche nach bestehendem Programm mit gleicher Startzeit
        const existingProgramIndex = channelWithPrograms.programs.findIndex(
          p => p.start === newProgram.start
        );

        if (existingProgramIndex >= 0) {
          // Aktualisiere bestehendes Programm
          channelWithPrograms.programs[existingProgramIndex] = {
            ...channelWithPrograms.programs[existingProgramIndex],
            ...newProgram,
          };
        } else {
          // Füge neues Programm hinzu
          channelWithPrograms.programs.push(newProgram);
        }
      });

      // Sortiere Programme nach Startzeit
      channelWithPrograms.programs.sort((a, b) => a.start - b.start);
      if (channelWithPrograms.programs.length > 0) {
        this.updateEarliestProgramStart(channelWithPrograms.programs[0].start);
      }
    }

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

    // Aktualisiere den frühesten Programmstart nach dem Hinzufügen neuer Programme
    if (channelWithPrograms.programs.length > 0) {
      this.updateEarliestProgramStart(channelWithPrograms.programs[0].start);
    }

    // Mit repeat-Direktive ist requestUpdate() nicht mehr nötig - Lit macht es automatisch
    // this.epgBox.requestUpdate();
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
    if (newEarliestStart < this.epgBox._channelsParameters.earliestProgramStart) {
      this.epgBox._channelsParameters.earliestProgramStart = newEarliestStart;
      return this.epgBox._channelsParameters.earliestProgramStart;
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
      // Aktualisiere den frühesten Programmstart
      if (newPrograms.length > 0) {
        this.updateEarliestProgramStart(newPrograms[0].start);
      }

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
}
