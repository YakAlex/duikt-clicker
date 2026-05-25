import { useState, useCallback, useRef } from 'react';
import { formatNumber } from '../../utils/formulas';
import styles from './ClickButton.module.scss';

let _floatId = 0;

export default function ClickButton({ onClick, cpc, isBlocked, activeBonus }) {
  const [floats, setFloats]   = useState([]);
  const [pressing, setPressing] = useState(false);
  const btnRef = useRef(null);

  const handleClick = useCallback((e) => {
    if (isBlocked) return;

    const rect = btnRef.current?.getBoundingClientRect();
    const x = e.clientX - (rect?.left ?? 0);
    const y = e.clientY - (rect?.top  ?? 0);

    onClick({ x, y });

    // Floating number
    const id = ++_floatId;
    const isCrit = Math.random() < 0.05; // visual only placeholder
    setFloats((prev) => [...prev, { id, x, y, value: cpc, crit: isCrit }]);
    setTimeout(() => setFloats((prev) => prev.filter((f) => f.id !== id)), 900);
  }, [isBlocked, onClick, cpc]);

  const bonusClass = activeBonus
    ? activeBonus.type === 'tripleClick' ? styles.tripleBoost : styles.doubleBoost
    : '';

  return (
    <div className={styles.wrapper}>
      <button
        ref={btnRef}
        className={`${styles.btn} ${isBlocked ? styles.blocked : ''} ${bonusClass}`}
        onClick={handleClick}
        onMouseDown={() => setPressing(true)}
        onMouseUp={() => setPressing(false)}
        onMouseLeave={() => setPressing(false)}
        disabled={isBlocked}
        aria-label="Click to earn credits"
      >
        <span className={`${styles.inner} ${pressing && !isBlocked ? styles.pressed : ''}`}>
          {isBlocked ? (
            <>
              <span className={styles.blockIcon}>💀</span>
              <span className={styles.blockText}>DDoS ATTACK</span>
            </>
          ) : (
            <>
              <span className={styles.gem}>💎</span>
              <span className={styles.cpc}>+{formatNumber(cpc)}</span>
            </>
          )}
        </span>

        {/* Pulse rings */}
        {!isBlocked && <span className={styles.ring1} />}
        {!isBlocked && <span className={styles.ring2} />}
      </button>

      {/* Floating credit numbers */}
      {floats.map((f) => (
        <span
          key={f.id}
          className={`${styles.float} ${f.crit ? styles.floatCrit : ''}`}
          style={{ left: f.x, top: f.y }}
        >
          +{formatNumber(f.value)}
        </span>
      ))}
    </div>
  );
}
