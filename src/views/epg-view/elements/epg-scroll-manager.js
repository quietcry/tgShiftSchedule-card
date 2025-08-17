/**
 * EPG Scroll Manager
 * Verwaltet alle scroll-bezogenen Funktionen für die EPG-Box
 */
export class EpgScrollManager {
  constructor(epgBox) {
    this.epgBox = epgBox;
  }

  /**
   * Richtet die Scroll-Synchronisation zwischen ChannelBox, ProgramBox und TimeBar ein
   */
  setupScrollSync() {
    this.epgBox._debug('EpgScrollManager: setupScrollSync aufgerufen');

    const channelBox = this.epgBox.shadowRoot?.querySelector('.channelBox');
    const programBox = this.epgBox.shadowRoot?.querySelector('.programBox');

    this.epgBox._debug('EpgScrollManager: DOM-Elemente gesucht', {
      shadowRootExists: !!this.epgBox.shadowRoot,
      channelBoxFound: !!channelBox,
      programBoxFound: !!programBox,
      channelBoxElement: channelBox,
      programBoxElement: programBox,
    });

    if (!channelBox || !programBox) {
      this.epgBox._debug(
        'EpgScrollManager: ChannelBox oder ProgramBox nicht gefunden für Scroll-Sync'
      );
      return;
    }

    // Synchronisiere vertikales Scrollen zwischen ChannelBox und ProgramBox
    channelBox.addEventListener('scroll', () => {
      this.epgBox._debug('EpgScrollManager: ChannelBox scroll event', {
        scrollTop: channelBox.scrollTop,
        scrollLeft: channelBox.scrollLeft,
      });
      programBox.scrollTop = channelBox.scrollTop;
    });

    programBox.addEventListener('scroll', () => {
      this.epgBox._debug('EpgScrollManager: ProgramBox scroll event', {
        scrollTop: programBox.scrollTop,
        scrollLeft: programBox.scrollLeft,
      });
      channelBox.scrollTop = programBox.scrollTop;

      // Sende Event an Parent (EPG-View) für TimeBar-Synchronisation
      this.epgBox._debug('EpgScrollManager: Sende scroll-sync Event an Parent', {
        scrollLeft: programBox.scrollLeft,
      });

      this.epgBox.dispatchEvent(
        new CustomEvent('program-box-scroll', {
          bubbles: true,
          composed: true,
          detail: {
            scrollLeft: programBox.scrollLeft,
            scrollTop: programBox.scrollTop,
          },
        })
      );
    });

    // Höre auf TimeBar-Scroll-Events vom Parent
    this.epgBox.addEventListener('time-bar-scroll', event => {
      const { scrollLeft } = event.detail;
      this.epgBox._debug('EpgScrollManager: Empfange time-bar-scroll Event', {
        scrollLeft: scrollLeft,
        programBoxScrollLeft: programBox.scrollLeft,
      });

      if (Math.abs(programBox.scrollLeft - scrollLeft) > 1) {
        this.epgBox._debug('EpgScrollManager: Synchronisiere ProgramBox mit TimeBar', {
          oldScrollLeft: programBox.scrollLeft,
          newScrollLeft: scrollLeft,
        });
        programBox.scrollLeft = scrollLeft;
      }
    });

    this.epgBox._debug('EpgScrollManager: Scroll-Synchronisation eingerichtet', {
      channelBoxExists: !!channelBox,
      programBoxExists: !!programBox,
      channelBoxScrollable: channelBox.scrollHeight > channelBox.clientHeight,
      programBoxScrollable:
        programBox.scrollHeight > programBox.clientHeight ||
        programBox.scrollWidth > programBox.clientWidth,
    });
  }
}
