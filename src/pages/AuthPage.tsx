import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useAuth } from '../contexts/AuthContext';
import { loginWithEmail, signUpWithEmail } from '../services/api';
import AuthBackground from '../components/ui/AuthBackground';
import styles from './AuthPage.module.css';

type Mode = 'landing' | 'signin' | 'signup';

export default function AuthPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState<Mode>('landing');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const brandRef = useRef<HTMLDivElement>(null);
  const ctaRef   = useRef<HTMLDivElement>(null);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (reducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.auth-brand', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', delay: 0.3 });
      gsap.fromTo('.auth-cta',   { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.85, ease: 'power2.out', delay: 0.75 });
    });
    return () => ctx.revert();
  }, [reducedMotion]);

  const switchMode = (next: Mode) => { setMode(next); setError(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const resp = mode === 'signin'
        ? await loginWithEmail(email, password)
        : await signUpWithEmail(name, email, password);
      login(resp.user, resp.token);
      navigate('/role-picker', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <AuthBackground />

      {/* ── Top-centre brand ─────────────────────────────────────────── */}
      <div className={`auth-brand ${styles.brand}`} ref={brandRef}>
        <div className={styles.logoRow}>
          <svg width="38" height="38" viewBox="0 0 56 56" fill="none" aria-hidden="true">
            <rect width="56" height="56" rx="14" fill="#c9a96e" fillOpacity="0.15"/>
            <path d="M14 20h28M14 28h20M14 36h14" stroke="#c9a96e" strokeWidth="3.5" strokeLinecap="round"/>
            <circle cx="40" cy="34" r="8" fill="#c9a96e" fillOpacity="0.15" stroke="#c9a96e" strokeWidth="2"/>
            <path d="M37 34l2 2 4-4" stroke="#c9a96e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className={styles.wordmark}>TrueGrant</span>
        </div>
        <p className={styles.tagline}>Authentic IDs, Authentic Impact.</p>
      </div>

      {/* ── Bottom-centre CTA / forms ────────────────────────────────── */}
      <div className={`auth-cta ${styles.bottom}`} ref={ctaRef}>

        {mode === 'landing' && (
          <div className={styles.ctaGroup}>
            <button className={`btn btn--primary btn--full ${styles.mainBtn}`} onClick={() => switchMode('signin')}>
              Sign in
            </button>
            <button className={`btn btn--secondary btn--full ${styles.mainBtn}`} onClick={() => switchMode('signup')}>
              Create account
            </button>
            <p className={styles.legal}>
              By continuing you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        )}

        {(mode === 'signin' || mode === 'signup') && (
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <button type="button" className={styles.backBtn} onClick={() => switchMode('landing')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Back
            </button>

            <h2 className={styles.formTitle}>
              {mode === 'signin' ? 'Welcome back' : 'Create account'}
            </h2>

            {mode === 'signup' && (
              <div className={styles.field}>
                <label htmlFor="a-name" className={styles.label}>Full name</label>
                <input id="a-name" className="input" type="text" placeholder="Priya Sharma"
                  value={name} onChange={e => setName(e.target.value)} required autoComplete="name" />
              </div>
            )}

            <div className={styles.field}>
              <label htmlFor="a-email" className={styles.label}>Email</label>
              <input id="a-email" className="input" type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>

            <div className={styles.field}>
              <label htmlFor="a-password" className={styles.label}>Password</label>
              <input id="a-password" className="input" type="password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} />
            </div>

            {error && <p className={styles.error} role="alert">{error}</p>}

            <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
              {loading ? <span className="spinner" /> : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>

            <button type="button" className={styles.switchBtn} onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}>
              {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
