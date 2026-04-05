import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <svg width="22" height="22" viewBox="0 0 56 56" fill="none" aria-hidden="true">
            <path d="M14 20h28M14 28h20M14 36h14" stroke="#c9a96e" strokeWidth="3.5" strokeLinecap="round"/>
            <circle cx="40" cy="34" r="8" stroke="#c9a96e" strokeWidth="2" fill="none"/>
            <path d="M37 34l2 2 4-4" stroke="#c9a96e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className={styles.welcome}>Welcome Back!</span>
        </div>
        <span className={styles.brand}>TrueGrant</span>
      </div>
    </header>
  );
}
