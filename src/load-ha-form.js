export const loadHaForm = async () => {
  if (customElements.get('ha-form')) return;

  await customElements.whenDefined('ha-card');
  const card = document.createElement('ha-card');
  await card.constructor.loadResources();
}; 