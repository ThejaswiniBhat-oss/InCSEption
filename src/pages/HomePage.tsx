import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSchemes } from '../hooks/useSchemes';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import SchemeCard from '../components/schemes/SchemeCard';
import styles from './HomePage.module.css';

const ROLE_LABELS: Record<string, string> = {
  individual: 'Individual',
  ngo: 'NGO',
  government_officer: 'Government Officer',
  admin: 'Admin',
};

const CHIPS = ['Agriculture', 'Housing', 'Education', 'Technology', 'NGO', 'Startup'];

function useDebounce<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function HomePage() {
  const { user, setRole } = useAuth();
  const [raw, setRaw] = useState('');
  const query = useDebounce(raw, 350);
  const { schemes, loading, error } = useSchemes(query);
  const searchRef = useRef<HTMLInputElement>(null);

  const handleVoiceResult = useCallback((text: string) => { setRaw(text); }, []);
  const { listening, supported, start, stop } = useVoiceSearch(handleVoiceResult);

  const roleLabel = ROLE_LABELS[user?.role ?? 'individual'];

  return (
    <div className={`page ${styles.page}`}>
      <div className={styles.container}>

        {/* Role context */}
        <div className={styles.roleRow}>
          <span className={styles.roleLabel}>
            Viewing schemes for
            <strong> {roleLabel}</strong>
          </span>
          <select
            className={styles.roleSelect}
            value={user?.role ?? 'individual'}
            onChange={e => setRole(e.target.value as Parameters<typeof setRole>[0])}
            aria-label="Change role"
          >
            <option value="individual">Individual</option>
            <option value="ngo">NGO</option>
            <option value="government_officer">Government Officer</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Search bar */}
        <div className={styles.searchWrap}>
          <label htmlFor="scheme-search" className="sr-only">Search schemes</label>
          <div className={styles.searchBar}>
            <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              id="scheme-search"
              ref={searchRef}
              className={styles.searchInput}
              type="search"
              placeholder="Search schemes, categories…"
              value={raw}
              onChange={e => setRaw(e.target.value)}
              autoComplete="off"
            />
            {raw && (
              <button
                className={styles.clearBtn}
                onClick={() => setRaw('')}
                aria-label="Clear search"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
          {/* Mic FAB above nav — or inline if inside search row */}
          {supported && (
            <button
              className={`${styles.micBtn} ${listening ? styles.micActive : ''}`}
              onClick={listening ? stop : start}
              aria-label={listening ? 'Stop voice search' : 'Voice search'}
              aria-pressed={listening}
            >
              {listening ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <rect x="6" y="6" width="12" height="12" rx="2"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/>
                </svg>
              )}
            </button>
          )}
        </div>

        {listening && (
          <p className={styles.listeningHint} role="status">
            Listening… speak a scheme name or category
          </p>
        )}

        {/* Fallback chips */}
        {!raw && (
          <div className={styles.chips} role="list" aria-label="Quick search topics">
            {CHIPS.map(c => (
              <button
                key={c}
                role="listitem"
                className={styles.chip}
                onClick={() => setRaw(c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Voice privacy notice */}
        {supported && (
          <p className={styles.privacyNote}>
            Voice search processes audio on-device. Nothing is stored.
          </p>
        )}

        {/* Results */}
        <section aria-label="Schemes" className={styles.results}>
          {loading && (
            <div className={styles.center}>
              <span className="spinner" style={{ width: 28, height: 28 }} />
            </div>
          )}
          {error && <p className={styles.errorMsg}>{error}</p>}
          {!loading && !error && schemes.length === 0 && (
            <div className={styles.empty}>
              <p>No schemes match <strong>"{raw}"</strong></p>
              <button className="btn btn--ghost" onClick={() => setRaw('')}>Clear search</button>
            </div>
          )}
          {!loading && schemes.map(s => (
            <SchemeCard key={s.id} scheme={s} />
          ))}
        </section>
      </div>
    </div>
  );
}
