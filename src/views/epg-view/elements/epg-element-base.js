import { SuperBase } from '../../../super-base.js';
import { css } from 'lit';

export class EpgElementBase extends SuperBase {
  static className = 'EpgElementBase';

  static properties = {
    // EPG-spezifische Properties
    currentTime: { type: Number },
    showTime: { type: Boolean },
    showDuration: { type: Boolean },
    showDescription: { type: Boolean },
    showShortText: { type: Boolean },
    epgPastTime: { type: Number },
    epgFutureTime: { type: Number },
    epgShowWidth: { type: Number },
    epgBackview: { type: Number },
    scale: { type: Number },
  };

  static styles = css`
    :host {
      --epg-row-height: 30px;
      --epg-border-color: #ddd;
      --epg-background: #fff;
      --epg-accent: #e8f0fe;
      --epg-text-color: #333;
      --epg-time-color: #666;
      --epg-description-color: #666;
      --epg-padding: 4px;
      --epg-radius: 6px;
      --epg-header-bg: #f5f5f5;
      --epg-hover-bg: #f5f5f5;
      --epg-active-bg: #e0e0e0;
      --epg-current-bg: #e8f0fe;
      --epg-channel-width: 120px;
      --epg-timebar-height: 30px;
      --epg-timebar-bg: #f0f0f0;
      --epg-now-marker-color: red;

      /* Abwechselnde Zeilenfarben */
      /* Ungerade Zeilen (1, 3, 5, ...) */
      --epg-odd-channel-bg: #d0d7de; /* Channel-Zeilen Hintergrund - dunkleres Grau */
      --epg-odd-channel-text: #000000; /* Channel-Zeilen Text - schwarz */
      --epg-odd-program-odd-bg: #e1e4e8; /* Ungerade Programm-Items in ungeraden Zeilen */
      --epg-odd-program-odd-text: #000000; /* Ungerade Programm-Items Text in ungeraden Zeilen */
      --epg-odd-program-even-bg: #ffffff; /* Gerade Programm-Items in ungeraden Zeilen */
      --epg-odd-program-even-text: #000000; /* Gerade Programm-Items Text in ungeraden Zeilen */

      /* Gerade Zeilen (2, 4, 6, ...) */
      --epg-even-channel-bg: #ffffff; /* Channel-Zeilen Hintergrund - weiß */
      --epg-even-channel-text: #000000; /* Channel-Zeilen Text - schwarz */
      --epg-even-program-odd-bg: #d0d7de; /* Ungerade Programm-Items in geraden Zeilen */
      --epg-even-program-odd-text: #000000; /* Ungerade Programm-Items Text in geraden Zeilen */
      --epg-even-program-even-bg: #f6f8fa; /* Gerade Programm-Items in geraden Zeilen */
      --epg-even-program-even-text: #000000; /* Gerade Programm-Items Text in geraden Zeilen */

      box-sizing: border-box;
      font-family: inherit;
    }

    /* Zentrale Höhenklassen für alle EPG-Elemente */
    .has-time {
      --has-time: 15px;
    }

    .has-duration {
      --has-duration: 15px;
    }

    .has-description {
      --has-description: 25px;
    }

    .has-shorttext {
      --has-shorttext: 18px;
    }

    /* Standardwerte für Höhenklassen-Variablen */
    * {
      --has-time: 0px;
      --has-duration: 0px;
      --has-description: 0px;
      --has-shorttext: 0px;
    }

    /* Zentrale Höhenberechnung für alle EPG-Elemente */
    .epg-row-height {
      height: calc(
        var(--epg-row-height) + var(--has-time) + var(--has-duration) + var(--has-description) +
          var(--has-shorttext)
      );
    }

    /* Kombinierte Höhenklassen - nur für interne Anpassungen */
    .has-time.has-duration {
      /* Interne Anpassung für Zeit + Dauer */
    }
  `;

  constructor() {
    super();
    this._debug('EpgElementBase-Konstruktor: Start');

    // EPG-spezifische Initialisierung
    this.currentTime = Date.now() / 1000; // Aktuelle Zeit als Unix-Timestamp
    this.showTime = true;
    this.showDuration = true;
    this.showDescription = true;
    this.showShortText = false;
    this.epgPastTime = 30; // Minuten in die Vergangenheit
    this.epgFutureTime = 120; // Minuten in die Zukunft
    this.epgShowWidth = 180; // Minuten sichtbar
    this.epgBackview = 0; // Default value
    this.scale = 1; // Darstellungsmaßstab

    this._debug('EpgElementBase-Konstruktor: Initialisierung abgeschlossen');
  }

  async firstUpdated() {
    this._debug('EpgElementBase firstUpdated: Start');
    await super.firstUpdated();
    this._debug('EpgElementBase firstUpdated: Ende');
  }

  // EPG-spezifische Hilfsmethoden
  _calculateDuration(start, end) {
    if (!start || !end) return 0;
    const startTime = new Date(start * 1000);
    const endTime = new Date(end * 1000);
    return Math.round((endTime - startTime) / (1000 * 60)); // Dauer in Minuten
  }

  _calculateHeightClasses(
    showTime,
    showDuration,
    showDescription,
    hasTime,
    hasDuration,
    hasDescription,
    hasShortText
  ) {
    // Bestimme welche Informationen angezeigt werden
    const hasTimeContent = showTime && hasTime;
    const hasDurationContent = showDuration && hasDuration;
    const hasDescriptionContent = showDescription && hasDescription;

    // Erstelle CSS-Klassen für Höhenanpassung
    const heightClasses = [
      hasTimeContent ? 'has-time' : '',
      hasDurationContent ? 'has-duration' : '',
      hasDescriptionContent ? 'has-description' : '',
      hasShortText ? 'has-shorttext' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return heightClasses;
  }

  _calculateScale() {
    const containerWidth = 1200; // Geschätzte Container-Breite in Pixeln
    const showWidth = this.epgShowWidth || 180; // Minuten sichtbar
    const scale = containerWidth / showWidth;

    this._debug('_calculateScale', {
      containerWidth,
      showWidth,
      scale,
    });

    return scale;
  }

  _isCurrentProgram(program) {
    if (!program.start || !(program.end || program.stop)) return false;
    const now = new Date();
    const start = new Date(program.start * 1000);
    const end = new Date((program.end || program.stop) * 1000);
    return now >= start && now <= end;
  }

  _formatTime(date) {
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  _formatDuration(minutes) {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  }

  // Basis-Rendering-Methode, die von den abgeleiteten Klassen überschrieben werden kann
  render() {
    return this._renderContent();
  }

  _renderContent() {
    return html`<div>EPG-Element Basis - muss überschrieben werden</div>`;
  }
}
