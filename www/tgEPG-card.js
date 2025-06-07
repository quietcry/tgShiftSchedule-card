const response = await this.hass.callService('tgvdr', 'get_epg_data', {
  entity_id: this.config.entity,
  time_window: timeWindow
}, {
  return_response: true
}); 