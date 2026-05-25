import { useState, useEffect } from 'react';
import { useClicker } from './hooks/useClicker';
import { SKINS } from './utils/constants';

import StatsPanel      from './components/StatsPanel/StatsPanel';
import ClickButton     from './components/ClickButton/ClickButton';
import UpgradePanel    from './components/UpgradePanel/UpgradePanel';
import BonusPanel      from './components/BonusPanel/BonusPanel';
import PrestigePanel   from './components/PrestigePanel/PrestigePanel';
import SkinsPanel      from './components/SkinsPanel/SkinsPanel';
import Achievements    from './components/Achievements/Achievements';
import AntiBonusAlert  from './components/AntiBonusAlert/AntiBonusAlert';
import Notifications   from './components/Notifications/Notifications';

import styles from './App.module.scss';

const TABS = [
  { id: 'upgrades',     label: '⚙️ Upgrades'    },
  { id: 'bonuses',      label: '🎁 Bonuses'      },
  { id: 'prestige',     label: '✨ Prestige'     },
  { id: 'skins',        label: '🎨 Skins'        },
  { id: 'achievements', label: '🏆 Achievements' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('upgrades');
  const game = useClicker();

  // Apply skin CSS variables whenever the active skin changes
  useEffect(() => {
    const skin = SKINS[game.state.activeSkin] ?? SKINS.default;
    Object.entries(skin.vars).forEach(([k, v]) =>
      document.documentElement.style.setProperty(k, v)
    );
  }, [game.state.activeSkin]);

  if (!game.loaded) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <p>INITIALIZING SYSTEM…</p>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerLogo}>
          <span className={styles.logoIcon}>💎</span>
          <span className={styles.logoText}>DUIKT<span>CLICKER</span></span>
        </div>
        <StatsPanel
          credits={game.state.credits}
          cps={game.creditsPerSecond}
          cpc={game.creditsPerClick}
          duiktcoins={game.state.duiktcoins}
          prestigeCount={game.state.prestigeCount}
        />
      </header>

      {/* ── Anti-bonus alert ── */}
      {game.state.activeAntiBonus && (
        <AntiBonusAlert
          antiBonus={game.state.activeAntiBonus}
          credits={game.state.credits}
          onFix={game.fixAntiBonusEarly}
        />
      )}

      {/* ── Main layout ── */}
      <main className={styles.main}>
        {/* Left: click area */}
        <section className={styles.clickArea}>
          <ClickButton
            onClick={game.handleClick}
            cpc={game.creditsPerClick}
            isBlocked={game.state.activeAntiBonus?.type === 'ddos'}
            activeBonus={game.state.activeBonus}
          />

          {/* Active effects display */}
          <div className={styles.activeEffects}>
            {game.state.activeBonus && (
              <div className={styles.effectBadge} data-type="bonus">
                {game.state.activeBonus.type === 'tripleClick' ? '⚡ 3× Click' : '⚡ 2× Click'}
                <span className={styles.effectTimer}>
                  {Math.ceil((game.state.activeBonus.endTime - Date.now()) / 1000)}s
                </span>
              </div>
            )}
            {game.state.activeAntiBonus && (
              <div className={styles.effectBadge} data-type="danger">
                ⚠️ {game.state.activeAntiBonus.type.toUpperCase()}
                <span className={styles.effectTimer}>
                  {Math.ceil((game.state.activeAntiBonus.endTime - Date.now()) / 1000)}s
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Right: tabbed panel */}
        <section className={styles.panel}>
          <nav className={styles.tabs}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className={styles.tabContent}>
            {activeTab === 'upgrades' && (
              <UpgradePanel
                upgrades={game.state.upgrades}
                credits={game.state.credits}
                onBuy={game.buyUpgrade}
              />
            )}
            {activeTab === 'bonuses' && (
              <BonusPanel
                credits={game.state.credits}
                lastWheelSpin={game.state.lastWheelSpin}
                casesOpened={game.state.casesOpened}
                onOpenCase={game.openCase}
                onWheelResult={game.applyWheelResult}
              />
            )}
            {activeTab === 'prestige' && (
              <PrestigePanel
                totalCreditsEarned={game.state.totalCreditsEarned}
                prestigeCount={game.state.prestigeCount}
                duiktcoins={game.state.duiktcoins}
                prestigeReq={game.prestigeReq}
                canPrestige={game.canPrestige}
                onPrestige={game.prestige}
              />
            )}
            {activeTab === 'skins' && (
              <SkinsPanel
                unlockedSkins={game.state.unlockedSkins}
                activeSkin={game.state.activeSkin}
                onEquip={game.equipSkin}
                totalCreditsEarned={game.state.totalCreditsEarned}
                totalClicks={game.state.totalClicks}
                prestigeCount={game.state.prestigeCount}
              />
            )}
            {activeTab === 'achievements' && (
              <Achievements
                achievements={game.state.achievements}
                state={game.state}
              />
            )}
          </div>
        </section>
      </main>

      {/* ── Notifications (toast) ── */}
      <Notifications
        notifications={game.state.notifications}
        onDismiss={game.dismissNotification}
      />
    </div>
  );
}
