import { useState, useEffect } from 'react';
import { ANTI_BONUS_CONFIG, FIX_ANTIBONU_COST } from '../../utils/constants';
import { formatNumber, formatTime } from '../../utils/formulas';
import styles from './AntiBonusAlert.module.scss';

export default function AntiBonusAlert({ antiBonus, credits, onFix }) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, antiBonus.endTime - Date.now()));
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [antiBonus.endTime]);

  const cfg     = ANTI_BONUS_CONFIG[antiBonus.type];
  const canFix  = credits >= FIX_ANTIBONU_COST;

  return (
    <div className={styles.banner}>
      <span className={styles.icon}>{cfg.icon}</span>
      <div className={styles.info}>
        <span className={styles.name}>{cfg.name}</span>
        <span className={styles.desc}>{cfg.description}</span>
      </div>
      <div className={styles.timer}>{formatTime(remaining)}</div>
      <button
        className={`${styles.fixBtn} ${!canFix ? styles.fixDisabled : ''}`}
        onClick={onFix}
        disabled={!canFix}
        title={canFix ? `Pay ${FIX_ANTIBONU_COST} credits to fix now` : 'Need more credits'}
      >
        🔧 Fix ({formatNumber(FIX_ANTIBONU_COST)} CR)
      </button>
    </div>
  );
}
