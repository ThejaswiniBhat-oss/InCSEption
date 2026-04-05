import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { fetchVerifyOutcome } from '../services/api';
import type { VerifyOutcome } from '../types/api';
import styles from './VerifyPage.module.css';

const STATUS_CONFIG = {
  approved: {
    label: 'Approved',
    color: 'var(--success)',
    bg: 'var(--success-dim)',
    ringColor: '#72b06e',
  },
  under_review: {
    label: 'Under Review',
    color: 'var(--warning)',
    bg: 'var(--warning-dim)',
    ringColor: '#c9a440',
  },
  blocked: {
    label: 'Blocked',
    color: 'var(--danger)',
    bg: 'var(--danger-dim)',
    ringColor: '#c4665a',
  },
} as const;

function StatusIcon({ status }: { status: string }) {
  if (status === 'approved') return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
  if (status === 'blocked') return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="currentColor" strokeWidth="0"/>
    </svg>
  );
}

export default function VerifyPage() {
  const { id, appId } = useParams<{ id: string; appId: string }>();
  const navigate = useNavigate();
  const [outcome, setOutcome] = useState<VerifyOutcome | null>(null);
  const [loading, setLoading] = useState(true);

  const ringRef    = useRef<SVGCircleElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!appId) return;
    fetchVerifyOutcome(appId).then(data => {
      setOutcome(data);
      setLoading(false);
    });
  }, [appId]);

  useEffect(() => {
    if (!outcome || reducedMotion) return;
    const ctx = gsap.context(() => {
      // Ring draw
      if (ringRef.current) {
        const circ = 2 * Math.PI * 52;
        gsap.set(ringRef.current, { strokeDasharray: circ, strokeDashoffset: circ });
        gsap.to(ringRef.current, { strokeDashoffset: 0, duration: 1.3, ease: 'power2.out', delay: 0.15 });
      }
      // Cards stagger in
      gsap.fromTo('.vc-item',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out', delay: 0.5, stagger: 0.1 },
      );
    }, containerRef);
    return () => ctx.revert();
  }, [outcome, reducedMotion]);

  if (loading) return (
    <div className={`page ${styles.center}`}>
      <div className={styles.loadGroup}>
        <span className="spinner" style={{ width: 36, height: 36 }} />
        <p className={styles.loadText}>Running integrity checks…</p>
      </div>
    </div>
  );

  if (!outcome) return null;

  const cfg = STATUS_CONFIG[outcome.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.under_review;

  return (
    <div className={`page ${styles.page}`} ref={containerRef}>
      <div className={styles.container}>

        {/* Ring + icon */}
        <div className={styles.ringWrap}>
          <svg width="124" height="124" viewBox="0 0 124 124" aria-hidden="true">
            <circle cx="62" cy="62" r="52" fill="none" stroke="var(--border)" strokeWidth="5" />
            <circle
              ref={ringRef}
              cx="62" cy="62" r="52"
              fill="none"
              stroke={cfg.ringColor}
              strokeWidth="5"
              strokeLinecap="round"
              transform="rotate(-90 62 62)"
            />
          </svg>
          <div className={styles.ringIcon} style={{ color: cfg.color }}>
            <StatusIcon status={outcome.status} />
          </div>
        </div>

        {/* Status + ID */}
        <div className={`vc-item ${styles.statusGroup}`}>
          <h1 className={styles.statusLabel} style={{ color: cfg.color }}>{cfg.label}</h1>
          <p className={styles.appId}>Application #{outcome.applicationId}</p>
          {outcome.score !== undefined && (
            <div className={styles.scoreBlock}>
              <span className={styles.scoreNum}>{outcome.score}</span>
              <span className={styles.scoreSuffix}>/100</span>
              <span className={styles.scoreLabel}>integrity score</span>
            </div>
          )}
        </div>

        {/* Point-wise justification */}
        <div className={`vc-item card ${styles.justCard}`}>
          <p className={styles.justHeader}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            Verification findings
          </p>
          <ol className={styles.justList}>
            {outcome.justificationPoints.map((pt, i) => (
              <li key={i} className={styles.justItem}>
                <span className={styles.justNum} style={{ color: cfg.color }}>{i + 1}</span>
                <span>{pt}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Flags */}
        {outcome.flags && outcome.flags.length > 0 && (
          <div className={`vc-item card ${styles.flagsCard}`}>
            <p className={styles.justHeader}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
              </svg>
              Flags raised
            </p>
            <ul className={styles.flagList}>
              {outcome.flags.map((f, i) => (
                <li key={i} className={styles.flag}>{f}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className={`vc-item ${styles.actions}`}>
          <button className="btn btn--secondary btn--full" onClick={() => navigate(`/scheme/${id}`)}>
            Back to scheme
          </button>
          <button className="btn btn--ghost btn--full" onClick={() => navigate('/my-schemes')}>
            View my applications
          </button>
        </div>
      </div>
    </div>
  );
}
