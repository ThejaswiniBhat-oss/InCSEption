import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMySchemes } from '../services/api';
import type { MyScheme, ApplicationStatus } from '../types/api';
import styles from './MySchemesPage.module.css';

const STATUS_BADGE: Record<ApplicationStatus, { cls: string; label: string }> = {
  draft:        { cls: 'badge--muted',   label: 'Draft'        },
  submitted:    { cls: 'badge--info',    label: 'Submitted'    },
  under_review: { cls: 'badge--warning', label: 'Under Review' },
  approved:     { cls: 'badge--success', label: 'Approved'     },
  blocked:      { cls: 'badge--danger',  label: 'Blocked'      },
};

const STATUS_ACCENT: Record<ApplicationStatus, string> = {
  draft:        'var(--text-muted)',
  submitted:    'var(--info)',
  under_review: 'var(--warning)',
  approved:     'var(--success)',
  blocked:      'var(--danger)',
};

export default function MySchemesPage() {
  const [mySchemes, setMySchemes] = useState<MyScheme[]>([]);
  const [loading, setLoading]     = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMySchemes().then(setMySchemes).finally(() => setLoading(false));
  }, []);

  return (
    <div className={`page ${styles.page}`}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>My applications</h1>

        {loading && (
          <div className={styles.center}>
            <span className="spinner" style={{ width: 28, height: 28 }} />
          </div>
        )}

        {!loading && mySchemes.length === 0 && (
          <div className={styles.empty}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
              style={{ color: 'var(--text-muted)' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <p>No applications yet.</p>
            <button className="btn btn--primary" onClick={() => navigate('/home')}>
              Browse schemes
            </button>
          </div>
        )}

        {!loading && mySchemes.map(ms => {
          const cfg    = STATUS_BADGE[ms.status];
          const accent = STATUS_ACCENT[ms.status];
          return (
            <div key={ms.id} className={`card ${styles.card}`} style={{ '--accent-col': accent } as React.CSSProperties}>
              <div className={styles.cardTop}>
                <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
                <span className={styles.updatedAt}>
                  {new Date(ms.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              <h3 className={styles.schemeName}>{ms.schemeTitle}</h3>

              {ms.submittedAt && (
                <p className={styles.submittedAt}>
                  Submitted {new Date(ms.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}

              {/* Point-wise justification */}
              {ms.justificationPoints && ms.justificationPoints.length > 0 && (
                <div className={styles.justBlock}>
                  <p className={styles.justHeader}>Verification findings</p>
                  <ol className={styles.justList}>
                    {ms.justificationPoints.map((pt, i) => (
                      <li key={i} className={styles.justItem}>
                        <span className={styles.justNum} style={{ color: accent }}>
                          {i + 1}
                        </span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <button
                className={`btn btn--ghost ${styles.viewBtn}`}
                onClick={() => navigate(`/scheme/${ms.schemeId}`)}
              >
                View scheme
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
