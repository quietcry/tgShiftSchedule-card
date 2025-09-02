import { html, css } from 'lit';
import { EpgElementBase } from './epg-element-base.js';
import { EpgRenderManager } from './epg-render-manager.js';

export class EpgProgramBox extends EpgElementBase {
  static className = 'EpgProgramBox';

  static properties = {
    ...super.properties,
    epgBox: { type: Object },
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
  };

  constructor() {
    super();
    this.dM = `${this.constructor.className || '?'}: `; // debugMsgPrefix - Prefix für Debug-Nachrichten

    // Initialisiere Properties
    this.programs = [];
    this.scale = 1;
    this.scrollLeft = 0;
    this.scrollTop = 0;
    this.containerWidth = 0;
    this.channelWidth = 180;
    this.env = null;
    this.scrollPositionSeconds = 0;
    this.programaticalScroll = false;

    // Scroll-Debouncing
    this.scrollAnimationFrame = null;
    this.lastScrollLeft = 0;
    this.lastScrollTop = 0;

    // RenderManager
    this.renderManager = null;

    this.programBox = null;
  }

  firstUpdated() {
    super.firstUpdated();

    this._debug(`${this.dM}firstUpdated`);

    // Initialisiere RenderManager
    this.renderManager = new EpgRenderManager(this);

    // Registriere mich für Environment-Änderungen
    this.registerMeForChangeNotifys('progScrollX,envChanges,viewChanges');

    this._debug(`${this.dM}Registrierung für Environment-Änderungen abgeschlossen`);
  }

  _handleOnChangeNotify_Envchanges(eventdata) {
    const dM = `${this.dM || '?: '}_handleOnChangeNotify_Envchanges()`;
    const { oldState, newState } = eventdata;
    this._debug(`${dM}Environment-Änderungen empfangen`, {
      oldState,
      newState,
    });
    // Update Environment-Properties
    if (newState) {
      let updated = false;
      if (!this.env) {
        this.env = { ...newState };
        updated = true;
      }

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
        this._debug(`${dM}Environment-Properties aktualisiert`, {
          containerWidth: this.containerWidth,
          env: this.env,
        });
      }
    }
  }

  /**
   * Aktualisiert die CSS-Variable --epg-scale bei Scale-Änderungen
   */
  _updateEpgScaleCSS() {
    if (this.programBox) {
      this.programBox.style.setProperty('--epg-scale', this.scale);
      this._debug('ProgramBox: CSS-Variable --epg-scale aktualisiert', {
        scale: this.scale,
        programBox: !!this.programBox,
      });
    }
  }

  _handleOnChangeNotify_Progscrollx(eventdata) {
    const dM = `${this.dM || '?: '}_handleOnChangeNotify_Progscrollx()`;
    const scrollevent = eventdata;
    this.programaticalScroll = true;
    this.programBox.scrollLeft = scrollevent.scrollLeft;
    this._debug(`${dM}progscrollx event empfangen`, {
      element: this.programBox,
      scrollLeft: scrollevent.scrollLeft,
      scrollLeftReal: this.programBox.scrollLeft,
      scrollevent,
    });
  }
  _handleOnChangeNotify_Viewchanges(eventdata) {
    const dM = `${this.dM || '?: '}_handleOnChangeNotify_Viewchanges()`;
    this._debug(`${dM}viewchanges event empfangen`, {
      element: this,
      eventdata: eventdata,
    });
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
    if (this.programaticalScroll) {
      this._debug('ProgramBox: programaticalScroll ist true, scroll event wird ignoriert');
      this.programaticalScroll = false;
      return;
    }
    this._debug('ProgramBox: scroll event triggered');
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
        timeStamp: event.timeStamp,
        scrollLeftSeconds: programBoxElement.scrollLeft / this.scale,
      };
      this.scrollPositionSeconds = eventData.scrollLeftSeconds;

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
          timeStamp: eventData.timeStamp,
        });

        // Sende Event direkt (ohne Umweg über EpgBox)
        this.dispatchEvent(
          new CustomEvent('progscrollx-event', {
            bubbles: true,
            composed: true,
            detail: {
              scrollLeft: eventData.scrollLeft,
              scrollLeftSeconds: eventData.scrollLeftSeconds,
              component: this,
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
    this.programBox = this.shadowRoot?.querySelector('.programBox');

    // Debug: Zeige alle geänderten Properties
    this._debug('ProgramBox: updated() aufgerufen', {
      isFirstLoad: this.isFirstLoad,
      changedProperties: Array.from(changedProperties.keys()),
    });

    // Aktualisiere CSS-Variable --epg-scale bei Scale-Änderungen
    if (changedProperties.has('scale')) {
      this._updateEpgScaleCSS();
    }

    // ===== SCROLLING NACH PROGRAMM-ÄNDERUNGEN =====
    // Nur beim ersten Laden (isFirstLoad === 0) automatisch scrollen
    const shouldAutoScroll = this.isFirstLoad === 0;

    if (shouldAutoScroll) {
      this.scrollPositionSeconds = this.calculateFirstScrollPositionSeconds();
      this._debug('ProgramBox: Automatisches Scrolling wird ausgeführt', {
        isFirstLoad: this.isFirstLoad,
        scrollPositionSeconds: this.scrollPositionSeconds,
        earliestProgramStart: this.earliestProgramStart,
        now: new Date(Date.now() / 1000).toLocaleString(),
        pastTime: this.epgBox?.epgShowPastTime,
        pastTimeSeconds: (this.epgBox?.epgShowPastTime || 40) * 60,
      });

      // Führe Scrolling nach Programm-Änderungen aus
      if (this.renderManager && typeof this.renderManager.scrollProgramBox === 'function') {
        this.renderManager.scrollProgramBox(this.programBox, this.scrollPositionSeconds);
      } else {
        this._debug('ProgramBox: RenderManager oder scrollProgramBox nicht verfügbar');
      }
    } else {
      this._debug('ProgramBox: Automatisches Scrolling übersprungen', {
        isFirstLoad: this.isFirstLoad,
        reason: 'Nicht erstes Laden',
      });
    }
  }
  /**
   * Berechnet die Scroll-Position für die Programmbox
   * Formel: ((now - epgShowPastTime) - earliestProgramStart) * scale
   */
  calculateFirstScrollPositionSeconds() {
    const now = Math.floor(Date.now() / 1000);

    // Sicherheitsprüfung: epgBox muss verfügbar sein
    // if (!this.epgBox) {
    //   this._debug('ProgramBox: epgBox nicht verfügbar, verwende Standard-Werte');
    //   const pastTime = 30; // Standard: 30 Minuten
    //   const pastTimeSeconds = pastTime * 60;
    //   const scrollPosition = ((now - pastTimeSeconds) - (this.earliestProgramStart || 0));
    //   return Math.max(0, scrollPosition);
    // }

    const pastTime = this.epgBox?.epgShowPastTime || 40; // Minuten in die Vergangenheit
    const pastTimeSeconds = pastTime * 60;

    const scrollPosition = now - pastTimeSeconds - this.earliestProgramStart;
    this._debug('ProgramBox: updated()!: First Calculate Scrolling-Trigger erkannt', {
      now: new Date(now * 1000).toLocaleString(),
      nowSeconds: now,
      box: this.epgBox,
      pastTime: pastTime,
      pastTimeSeconds: pastTimeSeconds,
      earliestProgramStart: this.earliestProgramStart,
      scrollPosition: scrollPosition,
    });

    return Math.max(0, scrollPosition); // Nicht negativ
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

  static styles = [
    super.styles,
    css`
      .programBox {
        overflow: auto;
        position: relative;
        height: 100%;
        width: 100%;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }

      .programBox::-webkit-scrollbar {
        display: none;
      }

      .programContainer {
        position: relative;
        width: fit-content;
        min-width: 100%;
      }

      .programRow {
        display: flex;
        flex-direction: row;
        align-items: stretch;
        justify-content: flex-start;
        border-bottom: none;
        margin: 0;
        padding: 0;
        flex-shrink: 0;
        flex-grow: 0;
        height: calc(
          var(--epg-row-height) + var(--has-time) + var(--has-duration) + var(--has-description) +
            var(--has-shorttext)
        );
        min-width: 100%;
        width: fit-content;
      }

      /* Alternierende Farben für Programm-Items */
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
    `,
  ];

  render() {
    this._debug('ProgramBox: render() aufgerufen');
    return html`
      <div class="programBox" @scroll="${this._onScroll}" style="--epg-scale: ${this.scale}">
        <!-- Time Marker über den Programmen -->
        <epg-time-marker
          .earliestProgramStart=${this.earliestProgramStart}
          .latestProgramStop=${this.latestProgramStop}
        ></epg-time-marker>

        <div class="programContainer">${this._renderPrograms()}</div>
      </div>
    `;
  }
}

customElements.define('epg-program-box', EpgProgramBox);
