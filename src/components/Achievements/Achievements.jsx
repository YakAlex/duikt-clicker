import { ACHIEVEMENTS_CONFIG } from '../../utils/constants';
import styles from './Achievements.module.scss';

export default function Achievements({ achievements, state }) {
  const unlocked = achievements.length;
  const total    = ACHIEVEMENTS_CONFIG.length;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>ACHIEVEMENTS</h2>
        <span className={styles.counter}>
          {unlocked} / {total}
        </span>
      </div>

      {/* Overall progress bar */}
      <div className={styles.overallBar}>
        <div
          className={styles.overallFill}
          style={{ width: `${(unlocked / total) * 100}%` }}
        />
      </div>

      <div className={styles.grid}>
        {ACHIEVEMENTS_CONFIG.map((a) => {
          const done = achievements.includes(a.id);
          return (
            <div
              key={a.id}
              className={`${styles.card} ${done ? styles.done : styles.locked}`}
              title={a.description}
            >
              <span className={styles.icon}>{done ? a.icon : '🔒'}</span>
              <div className={styles.info}>
                <div className={styles.name}>{a.name}</div>
                <div className={styles.desc}>{a.description}</div>
              </div>
              {done && <span className={styles.check}>✓</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
