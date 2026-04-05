import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import styles from './SplashPage.module.css';

export default function SplashPage() {
  const navigate = useNavigate();
  const logoRef = useRef<HTMLDivElement>(null);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const timer = setTimeout(() => navigate('/auth', { replace: true }), 2800);

    if (!reducedMotion && logoRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          '.splash-logo',
          { opacity: 0, y: 24, scale: 0.92 },
          { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'power3.out' },
        );
        gsap.fromTo(
          '.splash-tagline',
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 0.5 },
        );
      }, logoRef);
      return () => { ctx.revert(); clearTimeout(timer); };
    }

    return () => clearTimeout(timer);
  }, [navigate, reducedMotion]);

  return (
    <div className={styles.splash}>
      <div className={styles.bg} />
      <div className={styles.content} ref={logoRef}>
        <div className={`splash-logo ${styles.logoWrap}`}>
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
            <rect width="56" height="56" rx="16" fill="#c9a96e" fillOpacity="0.15"/>
            <path d="M14 20h28M14 28h20M14 36h14" stroke="#c9a96e" strokeWidth="3.5" strokeLinecap="round"/>
            <circle cx="40" cy="34" r="8" fill="#c9a96e" fillOpacity="0.15" stroke="#c9a96e" strokeWidth="2"/>
            <path d="M37 34l2 2 4-4" stroke="#c9a96e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className={styles.wordmark}>TrueGrant</span>
        </div>
        <p className={`splash-tagline ${styles.tagline}`}>Authentic IDs, Authentic Impact.</p>
      </div>
      <button
        className={styles.skipBtn}
        onClick={() => navigate('/auth', { replace: true })}
        aria-label="Skip splash screen"
      >
        Skip
      </button>
    </div>
  );
}
