import { useState, useRef, useEffect } from 'react';
import { WHEEL_SEGMENTS } from '../../utils/constants';
import styles from './WheelOfFortune.module.scss';

const TOTAL   = WHEEL_SEGMENTS.length;          // 12
const SLICE   = 360 / TOTAL;                    // 30°
const R       = 140;                            // wheel radius
const CX      = 160;                            // SVG centre x
const CY      = 160;                            // SVG centre y

/** Convert polar → cartesian (0° = top) */
const polar = (angleDeg, r = R) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)];
};

/** Build the SVG arc-path for one pie slice */
const slicePath = (index) => {
  const start = index * SLICE;
  const end   = start + SLICE;
  const [x1, y1] = polar(start);
  const [x2, y2] = polar(end);
  const large     = SLICE > 180 ? 1 : 0;
  return `M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z`;
};

export default function WheelOfFortune({ onResult, onClose }) {
  const [rotation, setRotation]   = useState(0);
  const [spinning, setSpinning]   = useState(false);
  const [landed, setLanded]       = useState(null);
  const rotRef = useRef(0);

  // Close on Escape
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && !spinning && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [spinning, onClose]);

  const handleSpin = () => {
    if (spinning) return;

    // Pick a random winning segment index
    const winIndex = Math.floor(Math.random() * TOTAL);

    // We need the indicator (top, 270° in SVG = -90° offset) to point at the
    // centre of the winning segment after the wheel stops.
    // The wheel starts with segment 0 at 0°. After `totalRot` degrees of
    // clockwise rotation, the angle at the top is -totalRot (mod 360).
    // We want: (centre of winIndex) ≡ 0 (mod 360)  →  solve for rotation.
    const winCentre   = winIndex * SLICE + SLICE / 2;        // deg from top of wheel
    const extraSpins  = 5 * 360;                              // 5 full rotations
    const targetRot   = rotRef.current + extraSpins + (360 - winCentre % 360);

    setSpinning(true);
    setLanded(null);
    setRotation(targetRot);
    rotRef.current = targetRot;

    setTimeout(() => {
      setSpinning(false);
      setLanded(WHEEL_SEGMENTS[winIndex]);
    }, 4000);
  };

  const handleClaim = () => {
    if (landed) onResult(landed);
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && !spinning && onClose()}>
      <div className={styles.modal}>
        <button className={styles.close} onClick={() => !spinning && onClose()} disabled={spinning}>✕</button>

        <h2 className={styles.title}>WHEEL OF FORTUNE</h2>
        <p className={styles.sub}>5-minute cooldown · Spin for free rewards</p>

        {/* Wheel */}
        <div className={styles.wheelWrap}>
          {/* Indicator arrow (fixed, top centre) */}
          <div className={styles.arrow} />

          <svg
            viewBox="0 0 320 320"
            width="320"
            height="320"
            className={styles.svg}
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning
                ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)'
                : 'none',
            }}
          >
            {WHEEL_SEGMENTS.map((seg, i) => {
              const mid   = i * SLICE + SLICE / 2;
              const [tx, ty] = polar(mid, R * 0.68);
              return (
                <g key={i}>
                  <path
                    d={slicePath(i)}
                    fill={seg.color}
                    stroke="#000"
                    strokeWidth="1.5"
                    opacity="0.92"
                  />
                  <text
                    x={tx}
                    y={ty}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10"
                    fontFamily="'Orbitron', sans-serif"
                    fontWeight="700"
                    fill="#fff"
                    transform={`rotate(${mid}, ${tx}, ${ty})`}
                    style={{ textShadow: '0 1px 3px #000', pointerEvents: 'none' }}
                  >
                    {seg.label}
                  </text>
                </g>
              );
            })}
            {/* Centre hub */}
            <circle cx={CX} cy={CY} r="18" fill="#000" stroke="var(--primary)" strokeWidth="2" />
            <circle cx={CX} cy={CY} r="6"  fill="var(--primary)" />
          </svg>
        </div>

        {/* Result or spin button */}
        {landed ? (
          <div className={styles.result}>
            <div className={styles.resultLabel}>YOU WON</div>
            <div className={styles.resultValue} style={{ color: landed.color }}>
              {landed.label}
            </div>
            <button className={styles.claimBtn} onClick={handleClaim}>
              🎉 Claim Reward
            </button>
          </div>
        ) : (
          <button
            className={`${styles.spinBtn} ${spinning ? styles.spinning : ''}`}
            onClick={handleSpin}
            disabled={spinning}
          >
            {spinning ? 'SPINNING…' : '🎡 SPIN'}
          </button>
        )}
      </div>
    </div>
  );
}
