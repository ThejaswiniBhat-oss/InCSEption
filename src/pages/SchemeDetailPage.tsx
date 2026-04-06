import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchSchemeById } from '../services/api';
import type { Scheme } from '../types/api';
import type { Lang } from '../locales/schemeTranslations';
import { getSchemeLocale, UI_STRINGS } from '../locales/schemeTranslations';
import styles from './SchemeDetailPage.module.css';

function BackButton() {
  const navigate = useNavigate();
  return (
    <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Go back">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 12H5M12 5l-7 7 7 7"/>
      </svg>
    </button>
  );
}

interface SectionProps { title: string; children: React.ReactNode; }
function Section({ title, children }: SectionProps) {
  const [open, setOpen] = useState(true);
  return (
    <div className={styles.section}>
      <button className={styles.sectionHeader} onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span>{title}</span>
        <svg
          className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
          width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && <div className={styles.sectionBody}>{children}</div>}
    </div>
  );
}

export default function SchemeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [simplified, setSimplified] = useState(false);
  const lang = (localStorage.getItem('tg-lang') as Lang) ?? 'en';
  const locale = scheme ? getSchemeLocale(scheme.id, lang) : null;

  useEffect(() => {
    if (!id) return;
    fetchSchemeById(id)
      .then(setScheme)
      .catch(() => navigate('/home', { replace: true }))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return (
    <div className={`page ${styles.loadWrap}`}>
      <span className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  if (!scheme) return null;

  return (
    <div className={`page ${styles.page}`}>
      <div className={styles.stickyTop}>
        <div className={styles.topBar}>
          <BackButton />
          {/* Simplify toggle */}
          <button
            className={`${styles.simplifyBtn} ${simplified ? styles.simplifyOn : ''}`}
            onClick={() => setSimplified(s => !s)}
            aria-pressed={simplified}
          >
            {simplified && (
              <span className={styles.simplifyDot} aria-hidden="true" />
            )}
            {simplified ? 'Plain language' : 'Simplify'}
          </button>
        </div>
      </div>

      <div className={styles.container}>
        {/* Hero */}
        <div className={styles.hero}>
          <span className={styles.category}>{scheme.category}</span>
          <h1 className={styles.title}>{locale?.title ?? scheme.title}</h1>
          <p className={styles.ministry}>{scheme.ministry}</p>
          {scheme.amount && (
            <span className={styles.amount}>{scheme.amount}</span>
          )}
        </div>

        {simplified && (
          <div className={styles.simplifyBanner} role="status">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Showing plain-language summary
          </div>
        )}

        {/* Description */}
        <Section title="Description">
          <p className={styles.bodyText}>
            {simplified
              ? (locale?.simplified ?? scheme.simplifiedDescription)
              : (locale ? locale.simplified : scheme.description)}
          </p>
        </Section>

        <Section title="Who can apply">
          <p className={styles.bodyText}>{locale?.whoCanApply ?? scheme.whoCanApply}</p>
        </Section>

        <Section title="Eligibility criteria">
          <ul className={styles.list}>
            {(locale?.criteria ?? scheme.criteria).map((c, i) => (
              <li key={i} className={styles.listItem}>
                <span className={styles.bullet} aria-hidden="true">•</span>
                {c}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Benefits">
          <ul className={styles.list}>
            {(locale?.benefits ?? scheme.benefits).map((b, i) => (
              <li key={i} className={styles.listItem}>
                <svg className={styles.checkIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {b}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Clauses & conditions">
          <ul className={styles.list}>
            {(locale?.clauses ?? scheme.clauses).map((c, i) => (
              <li key={i} className={styles.listItem}>
                <span className={styles.bullet} aria-hidden="true">—</span>
                {c}
              </li>
            ))}
          </ul>
        </Section>

        {/* Apply CTA */}
        <div className={styles.applyCta}>
          <div className={styles.deadline}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Deadline: {new Date(scheme.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <button
            className="btn btn--primary btn--full"
            onClick={() => navigate(`/scheme/${scheme.id}/apply`)}
          >
            {UI_STRINGS[lang].applyNow}
          </button>
        </div>
      </div>
    </div>
  );
}
