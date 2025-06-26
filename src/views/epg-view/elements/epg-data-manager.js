/**
 * EPG Data Manager
 * Verwaltet alle daten-bezogenen Funktionen für die EPG-Box
 */
export class EpgDataManager {
  constructor(epgBox) {
    this.epgBox = epgBox;
  }

  /**
   * Fügt Teil-EPG-Daten hinzu
   */
  addTeilEpg(teilEpg) {
    this.epgBox._debug('EpgDataManager: Teil-EPG-Daten erhalten', teilEpg);

    if (!teilEpg || !teilEpg.channeldata) {
      this.epgBox._debug('EpgDataManager: Ungültige Teil-EPG-Daten erhalten', teilEpg);
      return;
    }

    const channel = teilEpg.channeldata;
    const programs =
      teilEpg.epg && typeof teilEpg.epg === 'object' ? Object.values(teilEpg.epg) : [];

    this.epgBox._debug('EpgDataManager: Füge Teil-EPG hinzu', {
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

    this.epgBox._debug('EpgDataManager: Kanal-Objekt erstellt', {
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
    }

    // Aktualisiere die Sortierungsstruktur
    if (!this.epgBox._channelOrderInitialized) {
      this.epgBox.channelManager.initializeChannelOrder();
    }
    this.epgBox.channelManager.sortChannelIntoStructure(channelWithPrograms);

    this.epgBox.requestUpdate();
  }

  /**
   * Generiert Zeit-Slots für die EPG-Anzeige
   */
  generateTimeSlots() {
    const now = new Date();
    const pastTime = this.epgBox.epgPastTime || 30;
    const showWidth = this.epgBox.epgShowWidth || 180;

    // Berechne Start- und Endzeit
    const startTime = new Date(now.getTime() - pastTime * 60 * 1000);
    const endTime = new Date(now.getTime() + showWidth * 60 * 1000);

    // Aktualisiere die Kanal-Parameter
    this.epgBox._channelsParameters = {
      minTime: Math.floor(startTime.getTime() / 1000),
      maxTime: Math.floor(endTime.getTime() / 1000),
    };

    this.epgBox._debug('EpgDataManager: Zeit-Slots generiert', {
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

    this.epgBox._debug('EpgDataManager: Filtere Programme für Kanal', {
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

    this.epgBox._debug('EpgDataManager: Gefilterte Programme', {
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
}
