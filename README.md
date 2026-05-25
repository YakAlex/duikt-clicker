# 💎 Duikt Clicker

> A full-featured browser clicker game built with **React + Vite**, featuring upgrades, bonuses, anti-bonuses, prestige, skins, and persistent save via IndexedDB.

---

## 🚀 Demo

> _Deploy to Vercel / Netlify and paste the link here._

---

## ▶️ Quick Start

```bash
# 1 — Clone / open the project
cd duikt-clicker

# 2 — Install dependencies
npm install

# 3 — Start dev server (http://localhost:5173)
npm run dev

# 4 — Production build
npm run build

# 5 — Preview production build locally
npm run preview
```

**Requirements:** Node.js ≥ 18, npm ≥ 9.

---

## 🎮 How to Play

| Action | Effect |
|---|---|
| Click the 💎 button | Earn credits |
| Buy Upgrades | Increase CPC / CPS permanently |
| Open Cases (100 CR) | Random reward: credits, booster, or Duiktcoin |
| Spin Wheel (every 5 min) | Big random rewards |
| Prestige | Reset progress, earn Duiktcoins → permanent income % |
| Equip Skins | Change the entire colour theme |

---

## ✨ Features

### 1 · Upgrade System (6 types)
| Upgrade | Effect |
|---|---|
| Enhanced Click | +0.5 credits per click per level |
| Auto Clicker | +1 credit/sec per level |
| Passive Income | +0.5 credits/sec per level |
| Combo Multiplier | +20% click multiplier per level |
| Critical Strike | +5% chance for ×10 click per level |
| AI Assistant | +5 credits/sec per level |

Cost formula: `baseCost × 1.15^level` — grows exponentially.

### 2 · Bonuses
- **Mystery Case** — pay 100 CR → random reward (credits / 2× booster / Duiktcoin)
- **Wheel of Fortune** — free spin every 5 minutes across 12 segments

### 3 · Anti-Bonuses (4 types)
| Anti-Bonus | Effect | Duration |
|---|---|---|
| 🦠 Virus | −50% click value | 20 s |
| 🐛 System Bug | Auto clicker disabled | 15 s |
| 💀 DDoS Attack | Clicking completely blocked | 10 s |
| 🐌 Server Lag | Passive income −75% | 25 s |

Pay **500 CR** to fix any anti-bonus early.

### 4 · Prestige System
- **Requirement:** `1 000 000 × 10^prestigeCount` total credits earned
- **Reward:** Duiktcoins = `√(totalCR / 1M) × (1 + prestige × 0.25)`
- **Effect:** Each Duiktcoin gives **+5% to all income** permanently
- Resets: credits & upgrades. Keeps: skins, achievements, Duiktcoins.

### 5 · Skins (5 themes)
| Skin | Unlock Condition |
|---|---|
| 💎 DUIKT Core | Default |
| 🌈 Neon Overdrive | Prestige once |
| 👑 Golden Empire | Earn 1 000 000 total credits |
| 🚀 Deep Space | Click 10 000 times |
| 🟩 Matrix Protocol | Prestige 3 times |

### 6 · Achievements (20 total)
Covers clicks, credits, upgrades, cases, wheel spins, prestige, anti-bonus survival, skins, and Duiktcoins.

### 7 · Persistent Save
All progress is saved automatically via **IndexedDB** (idb-keyval) with a 1-second debounce. No data is lost on page refresh.

### 8 · Offline Income (Variant A)
On returning to the game, you earn **50% of your CPS** multiplied by the time away (in seconds). A notification shows the amount earned.

---

## 🗂 Project Structure

```
src/
├── components/
│   ├── AntiBonusAlert/   # Warning banner with countdown + fix button
│   ├── Achievements/     # Achievement grid with progress
│   ├── BonusPanel/       # Cases & Wheel of Fortune launcher
│   ├── ClickButton/      # Main click button with floating numbers
│   ├── Notifications/    # Toast notification stack (auto-dismiss)
│   ├── PrestigePanel/    # Prestige progress & reward preview
│   ├── SkinsPanel/       # Skin gallery with unlock conditions
│   ├── StatsPanel/       # Header stats bar
│   ├── UpgradePanel/     # Upgrade cards with progress bars
│   └── WheelOfFortune/   # SVG spinning wheel modal
├── db/
│   └── gameDB.js         # IndexedDB save / load / clear
├── hooks/
│   └── useClicker.js     # ★ Main game state & logic
│    
├── styles/
│   └── global.scss       # CSS variables, reset, keyframe animations
├── utils/
│   ├── constants.js      # All config: upgrades, skins, achievements, wheel
│   └── formulas.js       # Game math: CPC, CPS, prestige, formatNumber
└── App.jsx               # Root layout + tab routing + skin application
```

---

## 🧩 Additional Requirement: Variant A

**Implemented features:**
- ✅ **Offline income** — earn while away (50% CPS efficiency)
- ✅ **Achievements** — 20 achievements tracking all major milestones
- ✅ **Keyboard support** — Escape closes the Wheel of Fortune modal

---

## 🛠 Tech Stack

| Tool | Version |
|---|---|
| React | 18 |
| Vite | 5 |
| SCSS Modules | via `sass` |
| IndexedDB | `idb-keyval` 6 |

---

## 📄 License

MIT — free to use and modify.
