/**
 * HolidayMixin - Feiertags-Berechnung für deutsche Feiertage
 * 
 * Wiederverwendbar in anderen Projekten!
 * 
 * **Abhängigkeiten (müssen in der Hauptklasse initialisiert werden):**
 * - `this._holidayCache` - Cache-Objekt: `{}`
 * - `this._cachedHolidayEntities` - Array oder null
 * - `this._hass` - Home Assistant Objekt (optional, für Holiday-Entities)
 * - `this.config` - Konfigurationsobjekt mit `holidays` Property (optional)
 * 
 * @example
 * import { HolidayMixin } from './mixins/holiday-mixin';
 * class MyView extends LitElement {
 *   constructor() {
 *     super();
 *     this._holidayCache = {};
 *     this._cachedHolidayEntities = null;
 *     Object.assign(this, HolidayMixin);
 *   }
 * }
 */
export const HolidayMixin = {
  /**
   * Berechnet das Osterdatum für ein gegebenes Jahr (nach Gauß-Algorithmus)
   * @param {number} year - Jahr (z.B. 2025)
   * @returns {Date} Osterdatum
   */
  _getEasterDate(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
  },

  /**
   * Prüft ob ein Datum ein Feiertag ist (mit Cache)
   * Versucht zuerst Home Assistant Holiday-Sensoren zu verwenden, falls vorhanden
   * @param {number} year - Jahr (z.B. 2025)
   * @param {number} month - Monat (0-11, 0 = Januar)
   * @param {number} day - Tag (1-31)
   * @returns {boolean} true wenn Feiertag
   */
  _isHoliday(year, month, day) {
    // Cache-Key: "2025-12" für Monat/Jahr
    const cacheKey = `${year}-${String(month + 1).padStart(2, '0')}`;

    // Prüfe Cache
    if (this._holidayCache && this._holidayCache[cacheKey] && this._holidayCache[cacheKey][day] !== undefined) {
      return this._holidayCache[cacheKey][day];
    }

    // Initialisiere Cache für diesen Monat
    if (!this._holidayCache) {
      this._holidayCache = {};
    }
    if (!this._holidayCache[cacheKey]) {
      this._holidayCache[cacheKey] = {};
    }

    let result = false;

    // Prüfe ob Home Assistant Holiday-Sensoren verfügbar sind
    if (this._hass && this._hass.states) {
      // Suche nach Holiday-Sensoren (z.B. sensor.germany_holidays, sensor.holidays, etc.)
      // OPTIMIERUNG: Cache Holiday-Entities, nicht bei jedem Aufruf suchen
      if (!this._cachedHolidayEntities) {
        this._cachedHolidayEntities = Object.keys(this._hass.states).filter(entityId => {
          return (
            entityId.startsWith('sensor.') &&
            (entityId.includes('holiday') || entityId.includes('feiertag')) &&
            this._hass.states[entityId].state === 'on'
          );
        });
      }

      const holidayEntities = this._cachedHolidayEntities;

      if (holidayEntities.length > 0) {
        // Prüfe ob das Datum in den Holiday-Attributen enthalten ist
        for (const entityId of holidayEntities) {
          const entity = this._hass.states[entityId];
          if (entity && entity.attributes) {
            // Prüfe verschiedene mögliche Attribute-Formate
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dateStrShort = `${String(day).padStart(2, '0')}.${String(month + 1).padStart(2, '0')}.${year}`;

            // Prüfe verschiedene Attribute-Namen
            const possibleAttrs = [
              'dates',
              'holidays',
              'feiertage',
              'date',
              'next_date',
              'upcoming',
            ];
            for (const attr of possibleAttrs) {
              if (entity.attributes[attr]) {
                const attrValue = entity.attributes[attr];
                if (Array.isArray(attrValue)) {
                  if (
                    attrValue.some(
                      d =>
                        d === dateStr ||
                        d === dateStrShort ||
                        d.includes(dateStr) ||
                        d.includes(dateStrShort)
                    )
                  ) {
                    result = true;
                    break;
                  }
                } else if (typeof attrValue === 'string') {
                  if (attrValue.includes(dateStr) || attrValue.includes(dateStrShort)) {
                    result = true;
                    break;
                  }
                }
              }
            }
          }
        }
      }
    }

    // Hole Feiertags-Konfiguration aus der Config (Standard: alle aktiviert)
    const holidaysConfig = this.config?.holidays || {};
    const isHolidayEnabled = key => holidaysConfig[key] !== false; // Default: true wenn nicht gesetzt

    // Fallback: Berechne deutsche Feiertage selbst
    const easter = this._getEasterDate(year);

    // Feste Feiertage mit Konfigurationsprüfung
    const fixedHolidays = [
      { month: 0, day: 1, key: 'neujahr' }, // Neujahr
      { month: 0, day: 6, key: 'heilige_drei_koenige' }, // Heilige Drei Könige
      { month: 4, day: 1, key: 'tag_der_arbeit' }, // Tag der Arbeit
      { month: 7, day: 8, key: 'friedensfest' }, // Friedensfest (nur in Augsburg)
      { month: 7, day: 15, key: 'mariae_himmelfahrt' }, // Mariä Himmelfahrt
      { month: 9, day: 3, key: 'tag_der_deutschen_einheit' }, // Tag der Deutschen Einheit
      { month: 9, day: 31, key: 'reformationstag' }, // Reformationstag
      { month: 10, day: 1, key: 'allerheiligen' }, // Allerheiligen
      { month: 11, day: 25, key: 'weihnachten_1' }, // 1. Weihnachtsfeiertag
      { month: 11, day: 26, key: 'weihnachten_2' }, // 2. Weihnachtsfeiertag
    ];

    if (!result) {
      // Prüfe feste Feiertage
      for (const holiday of fixedHolidays) {
        if (month === holiday.month && day === holiday.day && isHolidayEnabled(holiday.key)) {
          result = true;
          break;
        }
      }
    }

    if (!result) {
      // Bewegliche Feiertage (abhängig von Ostern)
      const easterTime = easter.getTime();
      const oneDay = 24 * 60 * 60 * 1000;

      // Buß- und Bettag: Mittwoch vor dem 23. November (oder am 23. November, falls es ein Mittwoch ist)
      const nov23 = new Date(year, 10, 23); // 23. November (month ist 0-basiert)
      const dayOfWeekNov23 = nov23.getDay(); // 0 = Sonntag, 1 = Montag, ..., 3 = Mittwoch, ..., 6 = Samstag
      // Berechne wie viele Tage zurück zum Mittwoch
      const daysToSubtract = dayOfWeekNov23 <= 3 ? 3 - dayOfWeekNov23 : dayOfWeekNov23 + 7 - 3;
      const busstag = new Date(year, 10, 23 - daysToSubtract);

      const movableHolidays = [
        { date: new Date(easterTime - 2 * oneDay), key: 'karfreitag' }, // Karfreitag
        { date: new Date(easterTime + 1 * oneDay), key: 'ostermontag' }, // Ostermontag
        { date: new Date(easterTime + 39 * oneDay), key: 'christi_himmelfahrt' }, // Christi Himmelfahrt
        { date: new Date(easterTime + 50 * oneDay), key: 'pfingstmontag' }, // Pfingstmontag
        { date: new Date(easterTime + 60 * oneDay), key: 'fronleichnam' }, // Fronleichnam (nur in bestimmten Bundesländern)
        { date: busstag, key: 'busstag' }, // Buß- und Bettag (nur in Sachsen)
      ];

      // Prüfe bewegliche Feiertage
      for (const holiday of movableHolidays) {
        if (
          holiday.date.getFullYear() === year &&
          holiday.date.getMonth() === month &&
          holiday.date.getDate() === day &&
          isHolidayEnabled(holiday.key)
        ) {
          result = true;
          break;
        }
      }
    }

    // Cache speichern
    this._holidayCache[cacheKey][day] = result;

    return result;
  },

  /**
   * Prüft ob ein Datum ein Wochenende ist
   * @param {number} year - Jahr (z.B. 2025)
   * @param {number} month - Monat (0-11, 0 = Januar)
   * @param {number} day - Tag (1-31)
   * @returns {boolean} true wenn Wochenende (Samstag oder Sonntag)
   */
  _isWeekend(year, month, day) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sonntag = 0, Samstag = 6
  },
};

