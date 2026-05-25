import { UPGRADES_CONFIG } from '../../utils/constants';
import { getUpgradeCost, formatNumber } from '../../utils/formulas';
import styles from './UpgradePanel.module.scss';

export default function UpgradePanel({ upgrades, credits, onBuy }) {
  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>UPGRADES</h2>
      <div className={styles.list}>
        {Object.values(UPGRADES_CONFIG).map((cfg) => {
          const level   = upgrades[cfg.id]?.level ?? 0;
          const cost    = getUpgradeCost(cfg.id, level);
          const maxed   = level >= cfg.maxLevel;
          const canBuy  = credits >= cost && !maxed;
          const pct     = (level / cfg.maxLevel) * 100;

          return (
            <div
              key={cfg.id}
              className={`${styles.card} ${maxed ? styles.maxed : ''} ${canBuy ? styles.affordable : ''}`}
            >
              <div className={styles.icon}>{cfg.icon}</div>

              <div className={styles.info}>
                <div className={styles.name}>{cfg.name}</div>
                <div className={styles.desc}>{cfg.description}</div>
                <div className={styles.effect}>{cfg.effect(level)}</div>

                {/* Progress bar */}
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${pct}%` }} />
                </div>
                <div className={styles.levelText}>
                  LVL {level} / {cfg.maxLevel}
                </div>
              </div>

              <button
                className={`${styles.buyBtn} ${!canBuy ? styles.disabled : ''}`}
                onClick={() => onBuy(cfg.id)}
                disabled={!canBuy}
                title={maxed ? 'MAX LEVEL' : `Cost: ${formatNumber(cost)}`}
              >
                {maxed ? (
                  <span className={styles.maxLabel}>MAX</span>
                ) : (
                  <>
                    <span className={styles.btnCost}>{formatNumber(cost)}</span>
                    <span className={styles.btnLabel}>BUY</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
