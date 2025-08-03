import { css } from 'lit';

/**
 * Zentrale Style-Verwaltung für die EPG-Komponenten
 * Ermöglicht dynamische Style-Zusammensetzung und zentrale Verwaltung
 */
export class EpgStyleManager {
  static className = 'EpgStyleManager';

  /**
   * Basis-Styles für alle EPG-Komponenten
   */
  static getBaseStyles() {
    return css`
      :host {
        display: block;
        font-family: var(--epg-font-family, Arial, sans-serif);
        font-size: var(--epg-font-size, 14px);
        color: var(--epg-text-color, #333);
        background-color: var(--epg-bg-color, #fff);
      }

      /* CSS-Variablen für EPG */
      :host {
        --epg-row-height: 40px;
        --epg-accent: #007bff;
        --epg-hover-bg: #f8f9fa;
        --epg-text-color: #333;
        --epg-bg-color: #fff;
        --epg-error-color: #dc3545;

        /* Programm-Farben */
        --epg-odd-program-odd-bg: #f8f9fa;
        --epg-odd-program-odd-text: #333;
        --epg-odd-program-even-bg: #e9ecef;
        --epg-odd-program-even-text: #333;
        --epg-even-program-odd-bg: #f8f9fa;
        --epg-even-program-odd-text: #333;
        --epg-even-program-even-bg: #e9ecef;
        --epg-even-program-even-text: #333;

        /* Display-Variablen */
        --has-time: 0px;
        --has-duration: 0px;
        --has-description: 0px;
        --has-shorttext: 0px;
      }
    `;
  }

  /**
   * Styles für die Program-Box
   */
  static getProgramBoxStyles(config = {}) {
    const { showTime = true, showDuration = true, showDescription = true, showShortText = false } = config;

    return css`
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
    `;
  }

  /**
   * Styles für Channel-List
   */
  static getChannelListStyles(config = {}) {
    return css`
      .channelList {
        overflow-y: auto;
        overflow-x: hidden;
        height: 100%;
        width: 100%;
      }

      .channelItem {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        border-bottom: 1px solid var(--epg-border-color, #dee2e6);
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .channelItem:hover {
        background-color: var(--epg-hover-bg);
      }

      .channelItem.selected {
        background-color: var(--epg-accent);
        color: white;
      }

      .channelName {
        font-weight: 500;
        flex: 1;
      }

      .channelGroup {
        font-size: 0.9em;
        color: var(--epg-muted-color, #6c757d);
        margin-top: 2px;
      }
    `;
  }

  /**
   * Styles für Time-Marker
   */
  static getTimeMarkerStyles() {
    return css`
      .timeMarker {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 2px;
        background-color: var(--epg-accent);
        z-index: 10;
        pointer-events: none;
      }

      .timeMarker::before {
        content: '';
        position: absolute;
        top: 0;
        left: -4px;
        width: 0;
        height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 5px solid var(--epg-accent);
      }
    `;
  }

  /**
   * Styles für Programm-Items
   */
  static getProgramItemStyles(config = {}) {
    const { showTime = true, showDuration = true, showDescription = true, showShortText = false } = config;

    return css`
      .programSlot {
        display: flex;
        flex-direction: column;
        padding: 4px 8px;
        border-right: 1px solid var(--epg-border-color, #dee2e6);
        cursor: pointer;
        transition: all 0.2s;
        min-width: 60px;
        flex-shrink: 0;
        overflow: hidden;
      }

      .programSlot:hover {
        background-color: var(--epg-hover-bg);
      }

      .programTitle {
        font-weight: 500;
        font-size: 0.9em;
        line-height: 1.2;
        margin-bottom: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .programShortText {
        font-size: 0.8em;
        color: var(--epg-muted-color, #6c757d);
        margin-bottom: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .programTime {
        font-size: 0.75em;
        color: var(--epg-muted-color, #6c757d);
        margin-bottom: 2px;
      }

      .programDuration {
        font-size: 0.75em;
        color: var(--epg-muted-color, #6c757d);
        margin-bottom: 2px;
      }

      .programDescription {
        font-size: 0.8em;
        line-height: 1.3;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      /* Gap-Elemente */
      .gap-slot {
        background-color: var(--epg-gap-bg, #f8f9fa);
        border: 1px dashed var(--epg-gap-border, #dee2e6);
      }

      /* Gruppen-Header */
      .group-slot {
        background-color: var(--epg-group-bg, #e9ecef);
        font-weight: 600;
        text-align: center;
        justify-content: center;
      }

      .groupTitle {
        font-size: 0.9em;
        color: var(--epg-group-text, #495057);
      }
    `;
  }

  /**
   * Dynamische Style-Zusammensetzung für eine Komponente
   */
  static composeStyles(component, config = {}) {
    const baseStyles = this.getBaseStyles();
    let componentStyles = css``;

    switch (component) {
      case 'programBox':
        componentStyles = this.getProgramBoxStyles(config);
        break;
      case 'channelList':
        componentStyles = this.getChannelListStyles(config);
        break;
      case 'timeMarker':
        componentStyles = this.getTimeMarkerStyles();
        break;
      case 'programItem':
        componentStyles = this.getProgramItemStyles(config);
        break;
      default:
        console.warn(`EpgStyleManager: Unbekannte Komponente "${component}"`);
    }

    return [baseStyles, componentStyles];
  }

  /**
   * Erstellt ein CSS-StyleSheet für Laufzeit-Injection
   */
  static createStyleSheet(component, config = {}) {
    const styles = this.composeStyles(component, config);
    const styleSheet = new CSSStyleSheet();

    // Konvertiere Lit CSS zu CSSStyleSheet
    const cssText = styles.map(style => style.cssText).join('\n');
    styleSheet.replaceSync(cssText);

    return styleSheet;
  }
}