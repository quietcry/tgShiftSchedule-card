import { html, css } from 'lit';
import { EpgElementBase } from './epg-element-base.js';
import { EpgRenderManager } from './epg-render-manager.js';

export class EpgProgramBox extends EpgElementBase {
  static className = 'EpgProgramBox';

  static properties = {
    ...super.properties,
    // programs: { type: Array }, // VERWAIST - wird nicht mehr verwendet
    scale: { type: Number, reflect: true },
    scrollLeft: { type: Number },
    scrollTop: { type: Number },
    containerWidth: { type: Number },
    channelWidth: { type: Number },
    env: { type: Object },
    // Programm-Daten Properties
    earliestProgramStart: { type: Number },
    latestProgramStop: { type: Number },
    showChannelGroups: { type: Boolean },
    showShortText: { type: Boolean },
    showTime: { type: Boolean },
    showDuration: { type: Boolean },
    showDescription: { type: Boolean },
    _sortedChannels: { type: Array },
    _flatChannels: { type: Array },
    _channelGroups: { type: Object },
    _channelsParameters: { type: Object },
    _channelOrderInitialized: { type: Boolean },
    isFirstLoad: { type: Boolean },
    isChannelUpdate: { type: Boolean },
    epgFutureTime: { type: Number },
    // Callback-Funktionen - VERWAIST, da RenderManager das übernimmt
    // _onChannelSelected: { type: Function },
    // _onProgramSelected: { type: Function },
    // _updateChannelPrograms: { type: Function },
    // _addProgramsToChannel: { type: Function },
    // _removeProgramsFromChannel: { type: Function },
    // _updateAllCurrentStates: { type: Function },
    // _cleanupOldPrograms: { type: Function },
    // _updateTimeParameters: { type: Function },
    // _optimizeFlatArray: { type: Function },
    // _updateVisiblePrograms: { type: Function },
    // _getRepeatPerformanceStats: { type: Function },
    // _performFullOptimization: { type: Function },
    // _addTeilEpg: { type: Function },
  };

  constructor() {
    super();

    // Initialisiere Properties
    this.programs = [];
    this.scale = 1;
    this.scrollLeft = 0;
    this.scrollTop = 0;
    this.containerWidth = 0;
    this.channelWidth = 180;
    this.env = {};

    // Scroll-Debouncing
    this.scrollAnimationFrame = null;
    this.lastScrollLeft = 0;
    this.lastScrollTop = 0;

    // RenderManager
    this.renderManager = null;
  }

  firstUpdated() {
    super.firstUpdated();

    this._debug('ProgramBox: firstUpdated');

    // Initialisiere RenderManager
    this.renderManager = new EpgRenderManager(this);

    // Registriere mich für Environment-Änderungen
    this.dispatchEvent(
      new CustomEvent('registerMeForChanges', {
        bubbles: true,
        composed: true,
        detail: {
          component: this,
          callback: this._handleChangeNotifys.bind(this),
          eventType: "envChanges",
          immediately: true,
        },
      })
    );

    this._debug('ProgramBox: Registrierung für Environment-Änderungen abgeschlossen');
  }

  /**
   * Behandelt Änderungen von anderen Komponenten
   * @param {Object} eventdata - Event-Daten mit verschiedenen Event-Typen
   */
  _handleChangeNotifys(eventdata) {
    this._debug('ProgramBox: _handleChangeNotifys() aufgerufen', { eventdata });

    for (const eventType of Object.keys(eventdata)) {
      if (eventType === "envchanges") {
        const { oldState, newState } = eventdata[eventType];

        this._debug('ProgramBox: Environment-Änderungen empfangen', {
          oldState,
          newState,
        });

        // Update Environment-Properties
        if (newState) {
          let updated = false;

          if (newState.cardWidth !== undefined && this.containerWidth !== newState.cardWidth) {
            this.containerWidth = newState.cardWidth;
            updated = true;
          }

          if (newState.cardHeight !== undefined && this.env.cardHeight !== newState.cardHeight) {
            this.env.cardHeight = newState.cardHeight;
            updated = true;
          }

          if (newState.deviceType !== undefined && this.env.deviceType !== newState.deviceType) {
            this.env.deviceType = newState.deviceType;
            updated = true;
          }

          if (updated) {
            this._debug('ProgramBox: Environment-Properties aktualisiert', {
              containerWidth: this.containerWidth,
              env: this.env,
            });
          }
        }
      }
    }
  }

  /**
   * Scroll-Event-Handler mit Debouncing
   */
  _onScroll(event) {
    // Hole das programBox Div-Element
    const programBoxElement = this.shadowRoot?.querySelector('.programBox');
    if (!programBoxElement) {
      this._debug('ProgramBox: programBox Element nicht gefunden');
      return;
    }

    // Prüfe ob es sich um horizontales Scrollen handelt
    const isHorizontalScroll = programBoxElement.scrollLeft !== this.lastScrollLeft;
    const isVerticalScroll = programBoxElement.scrollTop !== this.lastScrollTop;

    // Speichere aktuelle Scroll-Position für nächsten Vergleich
    this.lastScrollLeft = programBoxElement.scrollLeft;
    this.lastScrollTop = programBoxElement.scrollTop;

    // Verarbeite nur horizontales Scrollen
    if (isHorizontalScroll) {
      // Speichere Event-Daten für requestAnimationFrame
      const eventData = {
        scrollLeft: programBoxElement.scrollLeft,
        scrollTop: programBoxElement.scrollTop,
        eventTarget: event.currentTarget,
        eventType: event.type,
        timeStamp: event.timeStamp
      };

      // Debouncing: Lösche vorherigen Timer falls vorhanden
      if (this.scrollAnimationFrame) {
        cancelAnimationFrame(this.scrollAnimationFrame);
      }

      // Setze neuen Timer für debounced Event
      this.scrollAnimationFrame = requestAnimationFrame(() => {
        this._debug('ProgramBox: Horizontal scroll event (debounced)', {
          scrollLeft: eventData.scrollLeft,
          scrollTop: eventData.scrollTop,
          eventTarget: eventData.eventTarget,
          eventType: eventData.eventType,
          timeStamp: eventData.timeStamp
        });

        // Sende Event direkt (ohne Umweg über EpgBox)
        this.dispatchEvent(
          new CustomEvent('progscrollx-event', {
            bubbles: true,
            composed: true,
            detail: {
              scrollLeft: eventData.scrollLeft,
              component: this
            },
          })
        );

        // Timer zurücksetzen
        this.scrollAnimationFrame = null;
      });
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    // Debug: Zeige alle geänderten Properties
    this._debug('ProgramBox: updated() aufgerufen', {
      changedProperties: Array.from(changedProperties.keys()),
      scale: this.scale,
      scaleType: typeof this.scale,
      scaleInChangedProperties: changedProperties.has('scale'),
      oldScale: changedProperties.get('scale')
    });

    // Setze CSS-Variable für epg-scale
    // if (changedProperties.has('scale')) {
    //   this.style.setProperty('--epg-scale', this.scale);
    //   this._debug('ProgramBox: CSS-Variable --epg-scale gesetzt', { scale: this.scale });
    // }
  }

  /**
   * Rendert die Programm-Daten über den RenderManager
   */
  _renderPrograms() {
    if (!this._flatChannels || this._flatChannels.length === 0) {
      return html`
        <div class="loading">
          <div>Lade EPG-Daten...</div>
        </div>
      `;
    }

    // Verwende den RenderManager für das Rendering
    if (this.renderManager) {
      return this.renderManager.renderSimplePrograms(this._flatChannels);
    } else {
      // Fallback falls RenderManager nicht verfügbar
      return html`<div class="error">RenderManager nicht verfügbar</div>`;
    }
  }

  static get styles() {
    return [
      super.styles,
      css`
        .programBox {
          overflow: auto;
          position: relative;
          height: 100%;
          width: 100%;
        }

        .programContainer {
          position: relative;
          width: fit-content;
          min-width: 100%;
        }

        .programRow {
          display: flex;
          flex-direction: row; /* Explizit horizontal anordnen */
          align-items: stretch; /* Items nehmen volle Höhe ein */
          justify-content: flex-start; /* Items am Anfang ausrichten */
          border-bottom: none; /* Kein Border */
          margin: 0; /* Keine äußeren Abstände */
          padding: 0; /* Keine inneren Abstände */
          flex-shrink: 0;
          flex-grow: 0; /* Verhindert Wachsen */
          /* Höhenklassen werden über epg-row-height angewendet */
          height: calc(
            var(--epg-row-height) + var(--has-time) + var(--has-duration) + var(--has-description) +
              var(--has-shorttext)
          );
          min-width: 100%; /* Mindestens so breit wie die sichtbare Box */
          width: fit-content; /* Wächst mit dem Inhalt */
        }

        /* Alternierende Farben für Programm-Items in Zeilen */
        .programRow:nth-child(odd) epg-program-item:nth-child(even) {
          background-color: var(--epg-odd-program-even-bg);
          color: var(--epg-odd-program-even-text);
        }

        .programRow:nth-child(odd) epg-program-item:nth-child(odd) {
          background-color: var(--epg-odd-program-odd-bg);
          color: var(--epg-odd-program-odd-text);
        }

        .programRow:nth-child(even) epg-program-item:nth-child(even) {
          background-color: var(--epg-even-program-even-bg);
          color: var(--epg-even-program-even-text);
        }

        .programRow:nth-child(even) epg-program-item:nth-child(odd) {
          background-color: var(--epg-even-program-odd-bg);
          color: var(--epg-even-program-odd-text);
        }

        /* Hover-Zustand */
        epg-program-item:hover {
          background-color: var(--epg-hover-bg) !important;
          color: var(--epg-text-color) !important;
        }

        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--epg-text-color);
        }

        .error {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--epg-error-color, red);
        }
      `
    ];
  }

  render() {
    return html`
      <div
        class="programBox"
        @scroll="${this._onScroll}"
      >
        <!-- Time Marker über den Programmen -->
        <epg-time-marker
          .earliestProgramStart=${this.earliestProgramStart}
          .latestProgramStop=${this.latestProgramStop}
        ></epg-time-marker>

        <div class="programContainer">
          ${this._renderPrograms()}
        </div>
      </div>
    `;
  }

  // /**
  //  * Berechnet die Breite eines Programms basierend auf der Dauer
  //  * VERWAIST - wird vom RenderManager übernommen
  //  */
  // _calculateProgramWidth(program) {
  //   const duration = program.duration || ((program.stop || program.end || 0) - (program.start || 0));
  //   return Math.max(60, duration * this.scale); // Mindestens 60px
  // }

  // /**
  //  * Formatiert einen Unix-Timestamp als Zeit
  //  * VERWAIST - wird vom RenderManager übernommen
  //  */
  // _formatTime(timestamp) {
  //   if (!timestamp) return '--:--';
  //   const date = new Date(timestamp * 1000);
  //   return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  // }

  // /**
  //  * Formatiert eine Dauer in Sekunden als Zeit
  //  * VERWAIST - wird vom RenderManager übernommen
  //  */
  // _formatDuration(seconds) {
  //   if (!seconds) return '';
  //   const hours = Math.floor(seconds / 3600);
  //   const minutes = Math.floor((seconds % 3600) / 60);
  //   return `${hours}:${minutes.toString().padStart(2, '0')}`;
  // }


}

customElements.define('epg-program-box', EpgProgramBox);