import { SKINS } from '../../utils/constants';
import { formatNumber } from '../../utils/formulas';
import styles from './SkinsPanel.module.scss';

export default function SkinsPanel({
  unlockedSkins,
  activeSkin,
  onEquip,
  totalCreditsEarned,
  totalClicks,
  prestigeCount,
}) {
  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>VISUAL SKINS</h2>
      <p className={styles.sub}>Change the entire colour theme of the game.</p>

      <div className={styles.grid}>
        {Object.values(SKINS).map((skin) => {
          const unlocked = unlockedSkins.includes(skin.id);
          const active   = activeSkin === skin.id;

          // Progress hint for locked skins
          let progress = null;
          if (!unlocked) {
            if (skin.id === 'neon')   progress = `${prestigeCount}/1 prestige`;
            if (skin.id === 'gold')   progress = `${formatNumber(totalCreditsEarned)} / 1M CR`;
            if (skin.id === 'space')  progress = `${formatNumber(totalClicks)} / 10K clicks`;
            if (skin.id === 'matrix') progress = `${prestigeCount}/3 prestiges`;
          }

          return (
            <div
              key={skin.id}
              className={`${styles.card}
                ${unlocked ? styles.unlocked : styles.locked}
                ${active   ? styles.active  : ''}`}
              style={{ '--skin-primary': skin.vars['--primary'] }}
            >
              {/* Colour swatch */}
              <div
                className={styles.swatch}
                style={{
                  background: `linear-gradient(135deg, ${skin.vars['--bg-card']}, ${skin.vars['--bg']})`,
                  borderColor: skin.vars['--primary'],
                  boxShadow: `0 0 12px ${skin.vars['--primary-glow']}`,
                }}
              >
                <span className={styles.swatchDot} style={{ background: skin.vars['--primary'] }} />
                <span className={styles.swatchDot} style={{ background: skin.vars['--secondary'] }} />
                <span className={styles.swatchDot} style={{ background: skin.vars['--accent'] }} />
              </div>

              <div className={styles.info}>
                <div className={styles.skinIcon}>{skin.icon}</div>
                <div className={styles.skinName}>{skin.name}</div>
                <div className={styles.skinDesc}>{skin.description}</div>
                {!unlocked && progress && (
                  <div className={styles.progress}>{progress}</div>
                )}
              </div>

              {unlocked ? (
                active ? (
                  <div className={styles.equippedBadge}>✓ EQUIPPED</div>
                ) : (
                  <button className={styles.equipBtn} onClick={() => onEquip(skin.id)}>
                    Equip
                  </button>
                )
              ) : (
                <div className={styles.lockBadge}>🔒 {skin.unlockHint}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
