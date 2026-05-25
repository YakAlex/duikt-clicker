import { useCallback } from 'react';
import { saveGame, loadGame, clearGame } from '../db/gameDB';

export const useIndexedDB = () => {
  const save  = useCallback(saveGame,  []);
  const load  = useCallback(loadGame,  []);
  const clear = useCallback(clearGame, []);

  return { save, load, clear };
};
