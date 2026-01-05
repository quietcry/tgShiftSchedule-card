import { css } from 'lit';

/**
 * Gemeinsame CSS-Styles für Menu-Bars
 * Diese Styles werden von shiftschedule-view.js und shift-config-panel.js verwendet
 */
export const sharedMenuStyles = css`
  /* Gemeinsame Vorlage für Menu-Bar: a (links), b (zentriert), c (rechts), d (zentriert) */
  .menu-bar-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .menu-bar-left {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-shrink: 0;
  }

  .menu-bar-center {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    min-width: 0;
  }

  .menu-bar-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-shrink: 0;
  }

  .menu-bar-full-width {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  .menu-button {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    border: 1px solid var(--divider-color, #e0e0e0);
    background-color: var(--primary-color, #03a9f4);
    color: var(--text-primary-color, #ffffff);
    font-size: 20px;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      background-color 0.2s ease,
      opacity 0.2s ease;
  }

  .menu-button:hover:not(:disabled) {
    background-color: var(--primary-color-dark, #0288d1);
  }

  .menu-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .cancel-button {
    background: none;
    border: none;
    color: var(--secondary-text-color, #757575);
  }

  .cancel-button:hover {
    color: var(--error-color, #f44336);
  }

  .confirm-button {
    background: none;
    border: none;
    color: var(--success-color, #4caf50);
  }

  .confirm-button:hover:not(:disabled) {
    color: var(--success-color-dark, #45a049);
    transform: scale(1.1);
  }

  .confirm-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .menu-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .menu-button.navigation-button {
    background-color: var(--secondary-color, #757575);
  }

  .menu-button.navigation-button:hover:not(:disabled) {
    background-color: var(--secondary-color-dark, #616161);
  }

  /* Gemeinsame Styles für Farbleisten */
  .shifts-color-bar,
  .color-bar {
    display: flex;
    gap: 4px;
    align-items: stretch;
    width: 100%;
  }

  .shift-color-button,
  .color-button {
    flex: 1;
    min-width: 0;
    height: 30px;
    border-radius: 4px;
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 12px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0 4px;
  }

  .shift-color-button:hover,
  .color-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .shift-color-button.selected,
  .color-button.selected {
    border: 3px solid var(--primary-color, #03a9f4);
    box-shadow: 
      0 0 0 2px var(--card-background-color, #ffffff),
      0 0 0 4px var(--primary-color, #03a9f4),
      0 2px 8px rgba(0, 0, 0, 0.3);
    transform: translateY(-1px);
  }

  .shift-color-button.disabled,
  .color-button.disabled {
    opacity: 0.3;
  }

  .shift-color-button.disabled::after,
  .color-button.disabled::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(0, 0, 0, 0.1) 10px,
      rgba(0, 0, 0, 0.1) 20px
    );
    pointer-events: none;
  }
`;

