import { useState } from 'react';
import { formatNumber } from '../../utils/formulas';
import { getPrestigeMultiplier, getDuiktcoinsEarned } from '../../utils/formulas';
import styles from './PrestigePanel.module.scss';

export default function PrestigePanel({
  totalCreditsEarned,
  prestigeCount,
  duiktcoins,
  prestigeReq,
  canPrestige,
  onPrestige,
}) {
  const [confirming, setConfirming] = useState(false);

  const pct       = Math.min(100, (totalCreditsEarned / prestigeReq) * 100);
  const willEarn  = getDuiktcoinsEarned(totalCreditsEarned, prestigeCount);
  const currentMult = getPrestigeMultiplier(duiktcoins);
  const afterMult   = getPrestigeMultiplier(duiktcoins + willEarn);

  const handlePrestige = () => {
    if (!confirming) { setConfirming(true); return; }
    onPrestige();
    setConfirming(false);
  };

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>PRESTIGE SYSTEM</h2>

      {/* Info block */}
      <div className={styles.infoCard}>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Current Prestige</span>
          <span className={styles.infoValue} data-gold="true">×{prestigeCount}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Duiktcoins</span>
          <span className={styles.infoValue} data-gold="true">🪙 {formatNumber(duiktcoins)}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Income Multiplier</span>
          <span className={styles.infoValue}>×{currentMult.toFixed(2)}</span>
        </div>
        <div className={styles.sep} />
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Requirement</span>
          <span className={styles.infoValue}>{formatNumber(prestigeReq)} CR total</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Your Total</span>
          <span className={styles.infoValue} style={{ color: canPrestige ? 'var(--success)' : 'var(--text-muted)' }}>
            {formatNumber(totalCreditsEarned)} CR
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className={styles.progressWrap}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${pct}%` }} />
        </div>
        <span className={styles.progressLabel}>{pct.toFixed(1)}%</span>
      </div>

      {/* Prestige reward preview */}
      <div className={`${styles.rewardCard} ${canPrestige ? styles.rewardReady : ''}`}>
        <div className={styles.rewardTitle}>
          {canPrestige ? '✨ PRESTIGE AVAILABLE' : '🔒 NEXT PRESTIGE REWARD'}
        </div>
        <div className={styles.rewardRow}>
          <span>Will earn</span>
          <span className={styles.rewardVal}>+{willEarn} Duiktcoins 🪙</span>
        </div>
        <div className={styles.rewardRow}>
          <span>New multiplier</span>
          <span className={styles.rewardVal}>×{afterMult.toFixed(2)}</span>
        </div>
        <div className={styles.rewardNote}>
          ⚠️ Resets credits & upgrades. Keeps skins, achievements, Duiktcoins.
        </div>
      </div>

      {/* Formula explanation */}
      <div className={styles.formula}>
        <div className={styles.formulaTitle}>DUIKTCOIN FORMULA</div>
        <code className={styles.formulaCode}>
          DC = √(totalCredits / 1M) × (1 + prestige × 0.25)
        </code>
        <div className={styles.formulaNote}>
          Each Duiktcoin gives +5% to all income permanently.
        </div>
      </div>

      {/* Prestige button */}
      <button
        className={`${styles.prestigeBtn} ${!canPrestige ? styles.disabled : ''} ${confirming ? styles.confirm : ''}`}
        onClick={handlePrestige}
        disabled={!canPrestige}
        onBlur={() => setConfirming(false)}
      >
        {confirming
          ? '⚠️ Confirm Prestige (click again)'
          : canPrestige
            ? `✨ PRESTIGE (earn ${willEarn} DC)`
            : `Need ${formatNumber(prestigeReq - totalCreditsEarned)} more CR`}
      </button>
    </div>
  );
}
