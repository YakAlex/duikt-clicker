import { useState, useEffect, useCallback, useRef } from 'react';
import { saveGame, loadGame } from '../db/gameDB';
import {
  getClickValue, getCPS, getCritChance, getUpgradeCost,
  getPrestigeRequirement, getDuiktcoinsEarned, getPrestigeMultiplier,
  checkSkinUnlocks, formatNumber,
} from '../utils/formulas';
import {
  UPGRADES_CONFIG, ACHIEVEMENTS_CONFIG, ANTI_BONUS_CONFIG,
  CASE_COST, FIX_ANTIBONU_COST, OFFLINE_EFFICIENCY,
} from '../utils/constants';

// ── Initial state factory ─────────────────────────────────────────────────────
const buildInitialUpgrades = () =>
    Object.fromEntries(Object.keys(UPGRADES_CONFIG).map((k) => [k, { level: 0 }]));

const createInitialState = () => ({
  credits: 0,
  totalCreditsEarned: 0,
  duiktcoins: 0,
  prestigeCount: 0,
  upgrades: buildInitialUpgrades(),
  activeSkin: 'default',
  unlockedSkins: ['default'],
  achievements: [],
  lastOnline: Date.now(),
  activeBonus: null,
  activeAntiBonus: null,
  totalClicks: 0,
  casesOpened: 0,
  wheelSpins: 0,
  lastWheelSpin: 0,
  antiBonusesSurvived: 0,
  notifications: [],
});

// ── Achievement checker (pure) ────────────────────────────────────────────────
const findNewAchievements = (state, existing) =>
    ACHIEVEMENTS_CONFIG.filter(
        (a) => !existing.includes(a.id) && a.condition(state)
    ).map((a) => a.id);

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useClicker = () => {
  // Завантажуємо збереження синхронно ПРИ ІНІЦІАЛІЗАЦІЇ
  const [state, setState] = useState(() => {
    const saved = loadGame();
    if (saved) {
      const now   = Date.now();
      const away  = Math.max(0, (now - (saved.lastOnline ?? now)) / 1000);
      const pm    = getPrestigeMultiplier(saved.duiktcoins ?? 0);
      const cps   = getCPS(saved.upgrades ?? buildInitialUpgrades(), pm, null);
      const offline = Math.floor(away * cps * OFFLINE_EFFICIENCY);

      return {
        ...createInitialState(),
        ...saved,
        credits: (saved.credits ?? 0) + offline,
        totalCreditsEarned: (saved.totalCreditsEarned ?? 0) + offline,
        lastOnline: now,
        activeBonus: null,
        activeAntiBonus: null,
        notifications: offline > 0
            ? [{ id: now, message: `⏰ Offline income: +${formatNumber(offline)} credits`, type: 'bonus' }]
            : [],
      };
    }
    return createInitialState();
  });

  // Гра тепер завжди "loaded", залишаємо для сумісності з App.jsx
  const loaded = true;

  const stateRef = useRef(state);
  stateRef.current = state;

  // ── Auto-save ──────────────────────────────────────────────────────────────
  // Зберігаємо миттєво при кожній зміні, debounce більше не потрібен
  useEffect(() => {
    saveGame(state);
  }, [state]);

  // ── Game tick (50ms = 20 fps) ─────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setState((prev) => {
        const pm  = getPrestigeMultiplier(prev.duiktcoins);
        const cps = getCPS(prev.upgrades, pm, prev.activeAntiBonus);
        if (cps === 0) return prev;

        const earned = cps / 20;
        const newTotal = prev.totalCreditsEarned + earned;
        const newState = {
          ...prev,
          credits: prev.credits + earned,
          totalCreditsEarned: newTotal,
        };

        // Passive skin unlock check
        const skins = checkSkinUnlocks(newState);
        if (skins.length !== prev.unlockedSkins.length) newState.unlockedSkins = skins;
        return newState;
      });
    }, 50);
    return () => clearInterval(id);
  }, []);

  // ── Timer-based: expire bonuses / anti-bonuses ────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setState((prev) => {
        const now = Date.now();
        let changed = false;
        let patch = {};

        if (prev.activeBonus && prev.activeBonus.endTime < now) {
          patch.activeBonus = null;
          changed = true;
        }

        if (prev.activeAntiBonus && prev.activeAntiBonus.endTime < now) {
          patch.activeAntiBonus = null;
          patch.antiBonusesSurvived = (prev.antiBonusesSurvived ?? 0) + 1;
          patch.notifications = [
            ...prev.notifications,
            { id: now, message: `✅ ${ANTI_BONUS_CONFIG[prev.activeAntiBonus.type].name} cleared!`, type: 'success' },
          ];
          changed = true;
        }

        return changed ? { ...prev, ...patch } : prev;
      });
    }, 500);
    return () => clearInterval(id);
  }, []);

  // ── Random anti-bonus every 30s (15% chance) ──────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setState((prev) => {
        if (prev.activeAntiBonus) return prev;
        if (Math.random() > 0.15) return prev;
        const types = Object.keys(ANTI_BONUS_CONFIG);
        const type  = types[Math.floor(Math.random() * types.length)];
        const cfg   = ANTI_BONUS_CONFIG[type];
        const now   = Date.now();
        return {
          ...prev,
          activeAntiBonus: { type, endTime: now + cfg.duration },
          notifications: [
            ...prev.notifications,
            { id: now, message: `⚠️ ${cfg.icon} ${cfg.name}! ${cfg.description}`, type: 'danger' },
          ],
        };
      });
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const applyAchievements = (newState) => {
    const newIds = findNewAchievements(newState, newState.achievements);
    if (!newIds.length) return newState;
    return {
      ...newState,
      achievements: [...newState.achievements, ...newIds],
      notifications: [
        ...newState.notifications,
        ...newIds.map((id) => {
          const a = ACHIEVEMENTS_CONFIG.find((x) => x.id === id);
          return { id: Date.now() + Math.random(), message: `🏆 Achievement: ${a.name}!`, type: 'achievement' };
        }),
      ],
    };
  };

  // ── Click ──────────────────────────────────────────────────────────────────
  const handleClick = useCallback((pos) => {
    setState((prev) => {
      if (prev.activeAntiBonus?.type === 'ddos') return prev;

      const pm    = getPrestigeMultiplier(prev.duiktcoins);
      let value   = getClickValue(prev.upgrades, pm, prev.activeBonus, prev.activeAntiBonus);
      const crit  = getCritChance(prev.upgrades);
      const isCrit = Math.random() < crit;
      if (isCrit) value *= 10;

      const skins = checkSkinUnlocks({ ...prev, totalCreditsEarned: prev.totalCreditsEarned + value, totalClicks: prev.totalClicks + 1 });

      let ns = {
        ...prev,
        credits: prev.credits + value,
        totalCreditsEarned: prev.totalCreditsEarned + value,
        totalClicks: prev.totalClicks + 1,
        unlockedSkins: skins,
        _lastClickPos: pos,
        _lastClickValue: value,
        _lastClickCrit: isCrit,
      };
      return applyAchievements(ns);
    });
  }, []);

  // ── Buy upgrade ────────────────────────────────────────────────────────────
  const buyUpgrade = useCallback((upgradeId) => {
    setState((prev) => {
      const cfg   = UPGRADES_CONFIG[upgradeId];
      const level = prev.upgrades[upgradeId].level;
      if (level >= cfg.maxLevel) return prev;

      const cost = getUpgradeCost(upgradeId, level);
      if (prev.credits < cost) return prev;

      const ns = {
        ...prev,
        credits: prev.credits - cost,
        upgrades: { ...prev.upgrades, [upgradeId]: { level: level + 1 } },
      };
      return applyAchievements(ns);
    });
  }, []);

  // ── Open case ──────────────────────────────────────────────────────────────
  const openCase = useCallback(() => {
    setState((prev) => {
      if (prev.credits < CASE_COST) return prev;

      const roll = Math.random();
      let reward;
      if      (roll < 0.40) reward = { credits: 50  + Math.floor(Math.random() * 150) };
      else if (roll < 0.65) reward = { credits: 200 + Math.floor(Math.random() * 300) };
      else if (roll < 0.82) reward = { credits: 500 + Math.floor(Math.random() * 500) };
      else if (roll < 0.93) reward = { credits: 1000 + Math.floor(Math.random() * 4000) };
      else if (roll < 0.98) reward = { type: 'booster', duration: 30000 };
      else                  reward = { duiktcoins: 1 };

      const now = Date.now();
      let patch = {
        credits: prev.credits - CASE_COST + (reward.credits ?? 0),
        casesOpened: prev.casesOpened + 1,
        totalCreditsEarned: prev.totalCreditsEarned + (reward.credits ?? 0),
      };

      let msg;
      if (reward.type === 'booster') {
        patch.activeBonus = { type: 'doubleClick', endTime: now + reward.duration };
        msg = '🎁 Case: 2× Click Booster for 30s!';
      } else if (reward.duiktcoins) {
        patch.duiktcoins = prev.duiktcoins + reward.duiktcoins;
        msg = `🎁 Case: +${reward.duiktcoins} Duiktcoin!`;
      } else {
        msg = `🎁 Case: Won +${formatNumber(reward.credits)} credits!`;
      }

      const ns = {
        ...prev, ...patch,
        notifications: [...prev.notifications, { id: now, message: msg, type: 'bonus' }],
      };
      return applyAchievements(ns);
    });
  }, []);

  // ── Wheel spin result ──────────────────────────────────────────────────────
  const applyWheelResult = useCallback((segment) => {
    setState((prev) => {
      const now = Date.now();
      let patch = { wheelSpins: prev.wheelSpins + 1, lastWheelSpin: now };
      let msg;

      if (segment.type === 'credits') {
        patch.credits = prev.credits + segment.amount;
        patch.totalCreditsEarned = prev.totalCreditsEarned + segment.amount;
        msg = `🎡 Wheel: +${formatNumber(segment.amount)} credits!`;
      } else if (segment.type === 'booster') {
        const mult = segment.duration >= 120000 ? 'tripleClick' : 'doubleClick';
        patch.activeBonus = { type: mult, endTime: now + segment.duration };
        msg = `🎡 Wheel: ${mult === 'tripleClick' ? '3×' : '2×'} Booster ${segment.duration / 1000}s!`;
      } else if (segment.type === 'duiktcoins') {
        patch.duiktcoins = prev.duiktcoins + segment.amount;
        msg = `🎡 Wheel: +${segment.amount} Duiktcoin${segment.amount > 1 ? 's' : ''}!`;
      } else {
        msg = '🎡 Wheel: Nothing this time…';
      }

      const ns = {
        ...prev, ...patch,
        notifications: [...prev.notifications, { id: now, message: msg, type: segment.type === 'nothing' ? 'info' : 'bonus' }],
      };
      return applyAchievements(ns);
    });
  }, []);

  // ── Prestige ───────────────────────────────────────────────────────────────
  const prestige = useCallback(() => {
    setState((prev) => {
      const req = getPrestigeRequirement(prev.prestigeCount);
      if (prev.totalCreditsEarned < req) return prev;

      const earned      = getDuiktcoinsEarned(prev.totalCreditsEarned, prev.prestigeCount);
      const newDuikt    = prev.duiktcoins + earned;
      const newPrestige = prev.prestigeCount + 1;
      const newSkins    = checkSkinUnlocks({ ...prev, prestigeCount: newPrestige, unlockedSkins: prev.unlockedSkins });

      const now = Date.now();
      const ns = {
        ...createInitialState(),
        duiktcoins: newDuikt,
        prestigeCount: newPrestige,
        activeSkin: prev.activeSkin,
        unlockedSkins: newSkins,
        achievements: prev.achievements,
        totalClicks: prev.totalClicks,
        casesOpened: prev.casesOpened,
        wheelSpins: prev.wheelSpins,
        lastWheelSpin: prev.lastWheelSpin,
        antiBonusesSurvived: prev.antiBonusesSurvived,
        lastOnline: now,
        notifications: [{
          id: now,
          message: `✨ Prestige! Earned ${earned} Duiktcoin${earned !== 1 ? 's' : ''} (×${getPrestigeMultiplier(newDuikt).toFixed(2)} income bonus)`,
          type: 'prestige',
        }],
      };
      return applyAchievements(ns);
    });
  }, []);

  // ── Equip skin ─────────────────────────────────────────────────────────────
  const equipSkin = useCallback((skinId) => {
    setState((prev) => {
      if (!prev.unlockedSkins.includes(skinId)) return prev;
      return { ...prev, activeSkin: skinId };
    });
  }, []);

  // ── Fix anti-bonus early (pay 500 credits) ─────────────────────────────────
  const fixAntiBonusEarly = useCallback(() => {
    setState((prev) => {
      if (!prev.activeAntiBonus || prev.credits < FIX_ANTIBONU_COST) return prev;
      const survived = (prev.antiBonusesSurvived ?? 0) + 1;
      return {
        ...prev,
        credits: prev.credits - FIX_ANTIBONU_COST,
        activeAntiBonus: null,
        antiBonusesSurvived: survived,
        notifications: [
          ...prev.notifications,
          { id: Date.now(), message: `🔧 Fixed! Spent ${FIX_ANTIBONU_COST} credits`, type: 'success' },
        ],
      };
    });
  }, []);

  // ── Dismiss notification ───────────────────────────────────────────────────
  const dismissNotification = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.filter((n) => n.id !== id),
    }));
  }, []);

  // ── Reset (dev / debug) ────────────────────────────────────────────────────
  const resetGame = useCallback(() => {
    setState(createInitialState());
  }, []);

  // ── Derived values (computed, not stored) ──────────────────────────────────
  const pm               = getPrestigeMultiplier(state.duiktcoins);
  const creditsPerClick  = getClickValue(state.upgrades, pm, state.activeBonus, state.activeAntiBonus);
  const creditsPerSecond = getCPS(state.upgrades, pm, state.activeAntiBonus);
  const prestigeReq      = getPrestigeRequirement(state.prestigeCount);
  const canPrestige      = state.totalCreditsEarned >= prestigeReq;

  return {
    state,
    loaded,
    creditsPerClick,
    creditsPerSecond,
    prestigeReq,
    canPrestige,
    handleClick,
    buyUpgrade,
    openCase,
    applyWheelResult,
    prestige,
    equipSkin,
    fixAntiBonusEarly,
    dismissNotification,
    resetGame,
  };
};