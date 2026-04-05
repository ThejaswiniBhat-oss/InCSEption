import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '../services/api';
import styles from './EditProfilePage.module.css';

export default function EditProfilePage() {
  const { user, login, token } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    setSaving(true);
    try {
      const resp = await updateProfile({
        name: name !== user?.name ? name : undefined,
        email: email !== user?.email ? email : undefined,
        currentPassword: newPassword ? currentPassword : undefined,
        newPassword: newPassword || undefined,
      });
      login(resp.user, resp.token ?? token ?? '');
      setSuccess('Profile updated successfully.');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`page ${styles.page}`}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate('/profile')} aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <h1 className={styles.pageTitle}>Edit Profile</h1>
      </div>

      <form className={styles.form} onSubmit={handleSave} noValidate>
        {/* Avatar */}
        <div className={styles.avatarSection}>
          <div className={styles.avatar}>{user?.name?.charAt(0).toUpperCase() ?? '?'}</div>
          <p className={styles.avatarHint}>Your initial is used as your avatar</p>
        </div>

        {/* Basic info */}
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Basic information</p>
          <div className="card">
            <div className={styles.fieldWrap}>
              <label htmlFor="ep-name" className={styles.label}>Full name</label>
              <input id="ep-name" className="input" type="text" value={name}
                onChange={e => setName(e.target.value)} placeholder="Your name" required />
            </div>
            <div className={styles.divider} />
            <div className={styles.fieldWrap}>
              <label htmlFor="ep-email" className={styles.label}>Email address</label>
              <input id="ep-email" className="input" type="email" value={email}
                onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
          </div>
        </div>

        {/* Password change */}
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Change password</p>
          <div className="card">
            <div className={styles.fieldWrap}>
              <label htmlFor="ep-cur" className={styles.label}>Current password</label>
              <input id="ep-cur" className="input" type="password" value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)} placeholder="Required to change password"
                autoComplete="current-password" />
            </div>
            <div className={styles.divider} />
            <div className={styles.fieldWrap}>
              <label htmlFor="ep-new" className={styles.label}>New password</label>
              <input id="ep-new" className="input" type="password" value={newPassword}
                onChange={e => setNewPassword(e.target.value)} placeholder="Minimum 6 characters"
                autoComplete="new-password" />
            </div>
            <div className={styles.divider} />
            <div className={styles.fieldWrap}>
              <label htmlFor="ep-confirm" className={styles.label}>Confirm new password</label>
              <input id="ep-confirm" className="input" type="password" value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password"
                autoComplete="new-password" />
            </div>
          </div>
          <p className={styles.hint}>Leave blank to keep your current password.</p>
        </div>

        {error   && <p className={styles.error}   role="alert"  >{error}</p>}
        {success && <p className={styles.success} role="status" >{success}</p>}

        <button type="submit" className="btn btn--primary btn--full" disabled={saving}>
          {saving ? <><span className="spinner" /> Saving…</> : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
