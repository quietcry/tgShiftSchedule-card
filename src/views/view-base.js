import { SuperBase } from '../super-base.js';
import { css } from 'lit';

export class ViewBase extends SuperBase {
  static properties = {
    config: { type: Object },
    epgData: { type: Array },
    _loading: { type: Boolean },
    _error: { type: Object },
  };

  constructor() {
    super();
    this._debug('filterx: ViewBase-Konstruktor: Start');
    this.config = {};
    this.epgData = [];
    this._loading = false;
    this._error = null;
    this._debug('filterx: ViewBase-Konstruktor: Initialisierung abgeschlossen');
  }

  async firstUpdated() {
    this._debug('filterx: ViewBase firstUpdated: Start');
    await super.firstUpdated();
    this._debug('filterx: ViewBase firstUpdated: Ende');
  }

  async _loadData() {
    this._debug('filterx: ViewBase _loadData wird aufgerufen');
    if (!this._dataProvider || !this.config.entity) {
      this._debug('filterx: ViewBase _loadData: Übersprungen - dataProvider oder entity fehlt', {
        dataProvider: !!this._dataProvider,
        entity: this.config.entity,
        config: this.config,
      });
      return;
    }

    this._loading = true;
    this._error = null;

    try {
      this._debug('filterx: Starte _fetchViewData mit Konfiguration:', this.config);
      const data = await this._fetchViewData(this.config);
      this.epgData = data;
      this._debug('filterx: _fetchViewData erfolgreich:', data);
    } catch (error) {
      this._error = error;
      this._debug('filterx: Fehler in _fetchViewData:', error);
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
