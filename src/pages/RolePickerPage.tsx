import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Role } from '../types/api';
import styles from './RolePickerPage.module.css';

const ROLES: { value: Role; label: string; subtitle: string; icon: React.ReactNode }[] = [
  {
    value: 'individual',
    label: 'Individual',
    subtitle: 'Apply for personal grants and schemes',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    value: 'ngo',
    label: 'NGO',
    subtitle: 'Manage grants for your organisation',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    value: 'government_officer',
    label: 'Government Officer',
    subtitle: 'Review applications and manage disbursements',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="7" width="20" height="15" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2M12 12v4M10 14h4"/>
      </svg>
    ),
  },
  {
    value: 'admin',
    label: 'Admin',
    subtitle: 'Full platform access and oversight',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
      </svg>
    ),
  },
];

export default function RolePickerPage() {
  const { setRole, clearFirstLogin, user } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Role>(user?.role ?? 'individual');
  const [saving, setSaving] = useState(false);

  const handleContinue = async () => {
    setSaving(true);
    setRole(selected);
    clearFirstLogin();
    navigate('/home', { replace: true });
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Applying as…</h1>
          <p className={styles.subtitle}>Choose how you'll use TrueGrant. You can change this later in your profile.</p>
        </div>

        <div className={styles.grid}>
          {ROLES.map(r => (
            <button
              key={r.value}
              className={`${styles.card} ${selected === r.value ? styles.selected : ''}`}
              onClick={() => setSelected(r.value)}
              aria-pressed={selected === r.value}
            >
              <span className={styles.icon}>{r.icon}</span>
              <span className={styles.label}>{r.label}</span>
              <span className={styles.sub}>{r.subtitle}</span>
              {selected === r.value && (
                <span className={styles.check} aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>

        <button
          className={`btn btn--primary btn--full ${styles.continueBtn}`}
          onClick={handleContinue}
          disabled={saving}
        >
          {saving ? <span className="spinner" /> : 'Continue'}
        </button>
      </div>
    </div>
  );
}
