import { useState } from 'react';
import { formatNumber, formatTime } from '../../utils/formulas';
import { CASE_COST, WHEEL_COOLDOWN } from '../../utils/constants';
import WheelOfFortune from '../WheelOfFortune/WheelOfFortune';
import styles from './BonusPanel.module.scss';

export default function BonusPanel({ credits, lastWheelSpin, casesOpened, onOpenCase, onWheelResult }) {
  const [showWheel, setShowWheel]   = useState(false);
  const [lastCaseRoll, setLastCaseRoll] = useState(null);

  const now           = Date.now();
  const wheelCooldownLeft = Math.max(0, WHEEL_COOLDOWN - (now - lastWheelSpin));
  const canSpin       = wheelCooldownLeft === 0;
  const canOpenCase   = credits >= CASE_COST;

  const handleOpenCase = () => {
    onOpenCase();
    setLastCaseRoll(Math.random()); // trigger animation
  };

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>BONUSES & REWARDS</h2>

      {/* ── Mystery Case ── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardIcon}>📦</span>
          <div>
            <div className={styles.cardName}>Mystery Case</div>
            <div className={styles.cardDesc}>
              Random reward — credits, booster, or even a Duiktcoin!
            </div>
          </div>
        </div>
        <div className={styles.cardFooter}>
          <span className={styles.cardStat}>Cases opened: <b>{casesOpened}</b></span>
          <button
            className={`${styles.actionBtn} ${!canOpenCase ? styles.btnDisabled : ''}`}
            onClick={handleOpenCase}
            disabled={!canOpenCase}
          >
            💎 Open ({formatNumber(CASE_COST)} CR)
          </button>
        </div>
      </div>

      {/* ── Wheel of Fortune ── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardIcon}>🎡</span>
          <div>
            <div className={styles.cardName}>Wheel of Fortune</div>
            <div className={styles.cardDesc}>
              Free spin every 5 minutes — big rewards possible!
            </div>
          </div>
        </div>
        <div className={styles.cardFooter}>
          <span className={styles.cardStat}>
            {canSpin
              ? '⚡ Ready to spin!'
              : `⏳ ${formatTime(wheelCooldownLeft)}`}
          </span>
          <button
            className={`${styles.actionBtn} ${styles.wheelBtn} ${!canSpin ? styles.btnDisabled : ''}`}
            onClick={() => canSpin && setShowWheel(true)}
            disabled={!canSpin}
          >
            🎡 Spin the Wheel
          </button>
        </div>
      </div>

      {/* Wheel modal */}
      {showWheel && (
        <WheelOfFortune
          onResult={(seg) => {
            onWheelResult(seg);
            setShowWheel(false);
          }}
          onClose={() => setShowWheel(false)}
        />
      )}
    </div>
  );
}
