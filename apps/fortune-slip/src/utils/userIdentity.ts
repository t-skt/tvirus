const STORAGE_KEY = "fortune_slip_user_id";

/**
 * Get or create a persistent UUID for this browser/device.
 * Stored in localStorage — survives sessions, unique per device.
 */
export function getUserId(): string {
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

/**
 * Reset user identity (re-roll a new fortune permanently).
 */
export function resetUserId(): string {
  const id = crypto.randomUUID();
  localStorage.setItem(STORAGE_KEY, id);
  return id;
}
