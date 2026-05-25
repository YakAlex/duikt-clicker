const SAVE_KEY = 'duikt-clicker-v1';

const STRIP = [
  'notifications',
  '_lastClickPos', '_lastClickValue', '_lastClickCrit',
];

export const saveGame = (state) => {
  try {
    const clean = { ...state };
    STRIP.forEach((k) => delete clean[k]);
    clean.lastOnline = Date.now();
    localStorage.setItem(SAVE_KEY, JSON.stringify(clean));
  } catch (err) {
    console.error('[Save] failed:', err);
  }
};

export const loadGame = () => {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('[Load] failed:', err);
    return null;
  }
};

export const clearGame = () => {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (err) {
    console.error('[Clear] failed:', err);
  }
};