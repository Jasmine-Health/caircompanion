/**
 * On a shared/kiosk device, per-user local state must never survive a login switch:
 * one patient's chat history or organization must not bleed into the next patient's
 * session. `clearStaleSessionData` is the single place AuthContext calls whenever a
 * session ends (explicit logout, silent token-expiry) or a new one begins (OAuth
 * callback), so every session-ending/starting path clears the same data instead of
 * each caller remembering its own list of keys.
 *
 * `chat_history` is removed directly since it's a plain localStorage key read fresh
 * on every ChatPage mount. `selectedOrganization` lives in OrganizationContext state
 * that stays mounted across logins, so a localStorage removal alone wouldn't reset
 * it, instead we broadcast an event and OrganizationContext resets its own state.
 */

export const CHAT_HISTORY_KEY = 'chat_history';
export const SESSION_DATA_CLEARED_EVENT = 'cc:session-data-cleared';

export function clearStaleSessionData(): void {
  localStorage.removeItem(CHAT_HISTORY_KEY);
  window.dispatchEvent(new Event(SESSION_DATA_CLEARED_EVENT));
}
