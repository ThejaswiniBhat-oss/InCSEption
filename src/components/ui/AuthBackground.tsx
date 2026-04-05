import SlidingBars from './SlidingBars';
import styles from './AuthBackground.module.css';

/**
 * Full-screen auth background:
 * sliding vertical bars canvas animation (cream/beige palette)
 * + top/bottom scrims for legibility.
 */
export default function AuthBackground() {
  return (
    <div className={styles.bg} aria-hidden="true">
      <SlidingBars
        backgroundColor="#09080a"
        lineColor="rgba(218,200,168,0.06)"
        barColor="#c8b48a"
        lineWidth={0.8}
        animationSpeed={0.004}
        removeWaveLine={true}
      />
      {/* grain overlay */}
      <svg className={styles.grain} xmlns="http://www.w3.org/2000/svg">
        <filter id="auth-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#auth-grain)" />
      </svg>
      <div className={styles.scrimTop} />
      <div className={styles.scrimBottom} />
    </div>
  );
}
