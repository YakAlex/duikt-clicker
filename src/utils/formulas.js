import { UPGRADES_CONFIG } from './constants';

// ── Number formatting ─────────────────────────────────────────────────────────
export const formatNumber = (n) => {
  if (n === undefined || n === null || isNaN(n)) return '0';
  const num = Math.floor(n);
  if (num < 1000) return num.toString();
  if (num < 1e6)  return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  if (num < 1e9)  return (num / 1e6).toFixed(2).replace(/\.00$/, '') + 'M';
  if (num < 1e12) return (num / 1e9).toFixed(2).replace(/\.00$/, '') + 'B';
  if (num < 1e15) return (num / 1e12).toFixed(2).replace(/\.00$/, '') + 'T';
  return (num / 1e15).toFixed(2) + 'Qa';
};

export const formatTime = (ms) => {
  const s = Math.ceil(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}m ${rem}s`;
};

// ── Upgrade cost formula ──────────────────────────────────────────────────────
export const getUpgradeCost = (upgradeId, level) => {
  const config = UPGRADES_CONFIG[upgradeId];
  return Math.floor(config.baseCost * Math.pow(1.15, level));
};

// ── Prestige multiplier from Duiktcoins ───────────────────────────────────────
export const getPrestigeMultiplier = (duiktcoins) => {
  return 1 + duiktcoins * 0.05;
};

// ── Credits per click ─────────────────────────────────────────────────────────
export const getClickValue = (upgrades, prestigeMultiplier, activeBonus, activeAntiBonus) => {
  if (activeAntiBonus?.type === 'ddos') return 0;

  let base = 1 + upgrades.betterClick.level * 0.5;
  const comboMult = 1 + upgrades.comboMultiplier.level * 0.2;

  if (activeAntiBonus?.type === 'virus') base *= 0.5;

  let bonusMult = 1;
  if (activeBonus?.type === 'doubleClick') bonusMult = 2;
  if (activeBonus?.type === 'tripleClick') bonusMult = 3;

  return base * comboMult * bonusMult * prestigeMultiplier;
};

// ── Credits per second ────────────────────────────────────────────────────────
export const getCPS = (upgrades, prestigeMultiplier, activeAntiBonus) => {
  let auto    = upgrades.autoClicker.level * 1;
  let passive = upgrades.passiveIncome.level * 0.5;
  let ai      = upgrades.aiAssistant.level * 5;

  if (activeAntiBonus?.type === 'bug') auto = 0;
  if (activeAntiBonus?.type === 'lag') {
    passive *= 0.25;
    ai      *= 0.25;
  }

  return (auto + passive + ai) * prestigeMultiplier;
};

// ── Critical chance ───────────────────────────────────────────────────────────
export const getCritChance = (upgrades) => {
  return upgrades.criticalClick.level * 0.05;
};

// ── Prestige requirement formula ──────────────────────────────────────────────
// First prestige at 1M, grows × 10 each time
export const getPrestigeRequirement = (prestigeCount) => {
  return Math.floor(1_000_000 * Math.pow(10, prestigeCount));
};

// ── Duiktcoins earned on prestige ─────────────────────────────────────────────
export const getDuiktcoinsEarned = (totalCreditsEarned, prestigeCount) => {
  const base = Math.sqrt(totalCreditsEarned / 1_000_000);
  const bonus = 1 + prestigeCount * 0.25;
  return Math.max(1, Math.floor(base * bonus));
};

// ── Skin unlock check ─────────────────────────────────────────────────────────
export const checkSkinUnlocks = (state) => {
  const unlocks = [...state.unlockedSkins];

  if (state.prestigeCount >= 1 && !unlocks.includes('neon'))   unlocks.push('neon');
  if (state.prestigeCount >= 3 && !unlocks.includes('matrix')) unlocks.push('matrix');
  if (state.totalCreditsEarned >= 1_000_000 && !unlocks.includes('gold'))  unlocks.push('gold');
  if (state.totalClicks >= 10_000 && !unlocks.includes('space')) unlocks.push('space');

  return unlocks;
};
