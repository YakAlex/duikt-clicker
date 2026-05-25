import { get, set, del } from 'idb-keyval';

const SAVE_KEY = 'duikt-clicker-v1';

export const saveGame = async (state) => {
  try {
    // Strip transient fields before saving
    const { notifications, ...toSave } = state;
    await set(SAVE_KEY, { ...toSave, lastOnline: Date.now() });
  } catch (err) {
    console.error('[DB] Save failed:', err);
  }
};

export const loadGame = async () => {
  try {
    const saved = await get(SAVE_KEY);
    return saved ?? null;
  } catch (err) {
    console.error('[DB] Load failed:', err);
    return null;
  }
};

export const clearGame = async () => {
  try {
    await del(SAVE_KEY);
  } catch (err) {
    console.error('[DB] Clear failed:', err);
  }
};
