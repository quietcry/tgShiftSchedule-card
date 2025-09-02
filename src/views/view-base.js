import { SuperBase } from '../super-base.js';
import { css } from 'lit';

export class ViewBase extends SuperBase {
  static className = 'ViewBase';

  static properties = {
    config: { type: Object },
    epgData: { type: Array },
    _loading: { type: Boolean },
    _error: { type: Object },
  };

  constructor() {
    super();
    this._debug('ViewBase-Konstruktor: Start');
    this.config = {};
    this.epgData = [];
    this._loading = false;
    this._error = null;
    this._debug('ViewBase-Konstruktor: Initialisierung abgeschlossen');
  }
  static styles = [
    super.styles,
    css`
      :host {
        display: block;
      }
    `,
  ];

  async firstUpdated() {
    this._debug('ViewBase firstUpdated: Start');
    await super.firstUpdated();
    this._debug('ViewBase firstUpdated: Ende');
  }

  async _loadData() {
    this._debug('ViewBase _loadData wird aufgerufen');
    if (!this._dataProvider || !this.config.entity) {
      this._debug('ViewBase _loadData: Übersprungen - dataProvider oder entity fehlt', {
        dataProvider: !!this._dataProvider,
        entity: this.config.entity,
        config: this.config,
      });
      return;
    }

    this._loading = true;
    this._error = null;

    try {
      this._debug('Starte _fetchViewData mit Konfiguration:', this.config);
      const data = await this._fetchViewData(this.config);
      this.epgData = data;
      this._debug('_fetchViewData erfolgreich:', data);
    } catch (error) {
      this._error = error;
      this._debug('Fehler in _fetchViewData:', error);
    } finally {
      this._loading = false;
    }
  }

  async _fetchViewData(config) {
    throw new Error('_fetchViewData muss in der abgeleiteten Klasse implementiert werden');
  }

  // Basis-Rendering-Methode, die von den abgeleiteten Klassen überschrieben werden kann
  render() {
    if (this._loading) {
      return this._renderLoading();
    }
    if (this._error) {
      return this._renderError();
    }
    return this._renderContent();
  }

  _renderLoading() {
    return html`<div class="loading">Lade Daten...</div>`;
  }

  _renderError() {
    return html`<div class="error">${this._error}</div>`;
  }

  _renderContent() {
    return html`<div>Keine Daten verfügbar</div>`;
  }
}
