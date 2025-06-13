import { SuperBase } from '../base/super-base.js';
import { DataProvider } from '../data-provider';
import { css } from 'lit';

export class ViewBase extends SuperBase {
  static properties = {
    config: { type: Object },
    epgData: { type: Array },
    _loading: { type: Boolean },
    _error: { type: String },
    _dataProvider: { type: Object },
  };

  constructor() {
    super();
    this.config = {};
    this.epgData = [];
    this._loading = false;
    this._error = null;
    this._dataProvider = null;
  }

  set hass(value) {
    this._debug(
      'ViewBase set hass wird aufgerufen:',
      value ? 'hass vorhanden' : 'hass ist null',
      value
    );
    if (this._hass !== value) {
      this._hass = value;
      if (this._dataProvider) {
        this._debug('ViewBase: Aktualisiere hass im DataProvider:', this._hass);
        this._dataProvider.hass = value;
      } else {
        this._debug('ViewBase: Initialisiere neuen DataProvider mit hass:', this._hass);
        this._dataProvider = new DataProvider();
        this._dataProvider.hass = value;
      }
      if (this._hass && this.config.entity) {
        this._debug('ViewBase: Starte _loadData mit hass:', this._hass);
        this._loadData();
      } else {
        this._debug('ViewBase: Kein hass oder entity vorhanden, überspringe _loadData');
      }
    }
  }

  get hass() {
    return this._hass;
  }

  async firstUpdated() {
    this._debug('ViewBase firstUpdated wird aufgerufen');
    // Sofort rendern mit Lade-Template
    this.requestUpdate();

    if (this.config.entity && this._hass) {
      // Nur laden wenn noch nicht geladen wurde
      if (!this._dataProvider) {
        this._debug('ViewBase firstUpdated: Starte _loadData');
        this._loadData();
      } else {
        this._debug('ViewBase firstUpdated: DataProvider bereits initialisiert');
      }
    } else {
      this._debug('ViewBase firstUpdated: Keine Entity oder hass in Config');
    }
  }

  async _loadData() {
    this._debug('ViewBase _loadData wird aufgerufen');
    if (!this._dataProvider || !this.config.entity) {
      this._debug('ViewBase _loadData: Übersprungen - dataProvider oder entity fehlt', {
        dataProvider: !!this._dataProvider,
        entity: this.config.entity,
      });
      return;
    }

    this._loading = true;
    this._error = null;
    // Sofort Lade-Status rendern
    this.requestUpdate();

    try {
      const newData = await this._fetchViewData();
      this.epgData = newData;
      this.requestUpdate('epgData');
    } catch (error) {
      this._error = `Fehler beim Laden der Daten: ${error.message}`;
      this._debug('ViewBase _loadData: Fehler:', error);
      this.requestUpdate();
    } finally {
      this._loading = false;
      this.requestUpdate();
    }
  }

  // Diese Methode muss von den abgeleiteten Klassen implementiert werden
  async _fetchViewData() {
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
