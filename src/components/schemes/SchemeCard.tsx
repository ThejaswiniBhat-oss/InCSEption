import { useNavigate } from 'react-router-dom';
import type { Scheme } from '../../types/api';
import styles from './SchemeCard.module.css';

interface Props { scheme: Scheme; }

const CATEGORY_COLORS: Record<string, string> = {
  Agriculture:     '#7aad5c',
  Housing:         '#6a8ab4',
  Entrepreneurship:'#c9a96e',
  Education:       '#9b7fba',
  'Civil Society': '#b46a6a',
  Technology:      '#5c8a8a',
  Employment:      '#7a9e7a',
  Healthcare:      '#ba6a7a',
};

export default function SchemeCard({ scheme }: Props) {
  const navigate = useNavigate();
  const color = CATEGORY_COLORS[scheme.category] ?? '#6366f1';

  return (
    <button
      className={styles.card}
      onClick={() => navigate(`/scheme/${scheme.id}`)}
      aria-label={`View details for ${scheme.title}`}
    >
      <div className={styles.top}>
        <span className={styles.category} style={{ color, background: `${color}18` }}>
          {scheme.category}
        </span>
        {scheme.amount && <span className={styles.amount}>{scheme.amount}</span>}
      </div>
      <h3 className={styles.title}>{scheme.title}</h3>
      <p className={styles.ministry}>{scheme.ministry}</p>
      <p className={styles.desc}>{scheme.description.slice(0, 110)}…</p>
      <div className={styles.footer}>
        <span className={`badge badge--success`}>Active</span>
        <span className={styles.deadline}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          {new Date(scheme.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>
    </button>
  );
}
