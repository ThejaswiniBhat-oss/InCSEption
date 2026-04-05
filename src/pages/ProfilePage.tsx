import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { logout as apiLogout } from '../services/api';
import type { Role } from '../types/api';
import styles from './ProfilePage.module.css';

const ROLE_LABELS: Record<Role, string> = {
  individual:        'Individual',
  ngo:               'NGO',
  government_officer:'Government Officer',
  admin:             'Admin',
};

interface MenuItemProps {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  right?: React.ReactNode;
}
function MenuItem({ label, icon, onClick, danger, right }: MenuItemProps) {
  return (
    <button className={`${styles.menuItem} ${danger ? styles.danger : ''}`} onClick={onClick}>
      <span className={styles.menuIcon}>{icon}</span>
      <span className={styles.menuLabel}>{label}</span>
      <span className={styles.menuRight}>
        {right !== undefined ? right : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        )}
      </span>
    </button>
  );
}

export default function ProfilePage() {
  const { user, logout, setRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await apiLogout().catch(() => {});
    logout();
    navigate('/auth', { replace: true });
  };

  return (
    <div className={`page ${styles.page}`}>
      <div className={styles.container}>

        {/* ── Avatar + name ──────────────────────────────────────────────── */}
        <div className={styles.profileHeader}>
          <div className={styles.avatar}>
            {user?.name?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <div className={styles.nameGroup}>
            <h1 className={styles.name}>{user?.name}</h1>
            <p className={styles.email}>{user?.email}</p>
            <span className={`badge badge--accent ${styles.roleBadge}`}>
              {ROLE_LABELS[user?.role ?? 'individual']}
            </span>
          </div>
        </div>

        {/* ── Applying as ───────────────────────────────────────────────── */}
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Applying as</p>
          <div className={styles.roleGrid}>
            {(Object.entries(ROLE_LABELS) as [Role, string][]).map(([val, label]) => (
              <button
                key={val}
                className={`${styles.roleChip} ${user?.role === val ? styles.roleChipActive : ''}`}
                onClick={() => setRole(val)}
                aria-pressed={user?.role === val}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Account ───────────────────────────────────────────────────── */}
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Account</p>
          <div className="card">
            <MenuItem
              label="Edit profile"
              onClick={() => navigate('/profile/edit')}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              }
            />
          </div>
        </div>

        {/* ── Information ───────────────────────────────────────────────── */}
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Information</p>
          <div className="card">
            <MenuItem
              label="About TrueGrant"
              onClick={() => navigate('/about')}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              }
            />
            <div className={styles.divider} />
            <MenuItem
              label="Help & support"
              onClick={() => navigate('/help')}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              }
            />
            <div className={styles.divider} />
            <MenuItem
              label="Privacy policy"
              onClick={() => navigate('/privacy')}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              }
            />
          </div>
        </div>

        {/* ── About card ────────────────────────────────────────────────── */}
        <div className={`card ${styles.aboutCard}`}>
          <div className={styles.aboutLogo}>
            <svg width="26" height="26" viewBox="0 0 56 56" fill="none" aria-hidden="true">
              <rect width="56" height="56" rx="14" fill="#c9a96e" fillOpacity="0.15"/>
              <path d="M14 20h28M14 28h20M14 36h14" stroke="#c9a96e" strokeWidth="3.5" strokeLinecap="round"/>
              <circle cx="40" cy="34" r="8" fill="#c9a96e" fillOpacity="0.15" stroke="#c9a96e" strokeWidth="2"/>
              <path d="M37 34l2 2 4-4" stroke="#c9a96e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className={styles.aboutName}>TrueGrant</span>
          </div>
          <p className={styles.aboutTagline}>Authentic IDs, Authentic Impact.</p>
          <p className={styles.aboutVersion}>Version 1.0.0 · Hackathon Build 2026</p>
        </div>

        {/* ── Logout ────────────────────────────────────────────────────── */}
        <div className={styles.section}>
          <div className="card">
            <MenuItem
              label="Log out"
              danger
              onClick={handleLogout}
              right={null}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              }
            />
          </div>
        </div>

      </div>
    </div>
  );
}
