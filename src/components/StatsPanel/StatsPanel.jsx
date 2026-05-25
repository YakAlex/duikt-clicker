import { formatNumber } from '../../utils/formulas';
import styles from './StatsPanel.module.scss';

export default function StatsPanel({ credits, cps, cpc, duiktcoins, prestigeCount }) {
  return (
    <div className={styles.stats}>
      <Stat label="CREDITS"   value={formatNumber(credits)}    highlight />
      <Stat label="PER SEC"   value={`${formatNumber(cps)}/s`} />
      <Stat label="PER CLICK" value={formatNumber(cpc)}        />
      {duiktcoins > 0 && (
        <Stat label="DUIKTCOINS" value={formatNumber(duiktcoins)} gold />
      )}
      {prestigeCount > 0 && (
        <Stat label="PRESTIGE" value={`×${prestigeCount}`} accent />
      )}
    </div>
  );
}

function Stat({ label, value, highlight, gold, accent }) {
  return (
    <div
      className={`${styles.stat}
        ${highlight ? styles.highlight : ''}
        ${gold      ? styles.gold      : ''}
        ${accent    ? styles.accent    : ''}`}
    >
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
    </div>
  );
}
