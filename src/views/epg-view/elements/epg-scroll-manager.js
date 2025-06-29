/**
 * EPG Scroll Manager
 * Verwaltet alle scroll-bezogenen Funktionen für die EPG-Box
 */
export class EpgScrollManager {
  constructor(epgBox) {
    this.epgBox = epgBox;
  }

  /**
   * Richtet die Scroll-Synchronisation zwischen ChannelBox und ProgramBox ein
   */
  setupScrollSync() {
    const channelBox = this.epgBox.shadowRoot?.querySelector('.channelBox');
    const programBox = this.epgBox.shadowRoot?.querySelector('.programBox');

    if (!channelBox || !programBox) {
      this.epgBox._debug(
        'EpgScrollManager: ChannelBox oder ProgramBox nicht gefunden für Scroll-Sync'
      );
      return;
    }

    // Synchronisiere vertikales Scrollen zwischen ChannelBox und ProgramBox
    channelBox.addEventListener('scroll', () => {
      programBox.scrollTop = channelBox.scrollTop;
    });

    programBox.addEventListener('scroll', () => {
      channelBox.scrollTop = programBox.scrollTop;
    });

    this.epgBox._debug('EpgScrollManager: Scroll-Synchronisation eingerichtet');
  }
}
