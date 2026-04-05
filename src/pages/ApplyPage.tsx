import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchRequirements, submitApplication } from '../services/api';
import type { ApplicationRequirements } from '../types/api';
import styles from './ApplyPage.module.css';

type Step = 'checklist' | 'form';

export default function ApplyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reqs, setReqs] = useState<ApplicationRequirements | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('checklist');
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [fileNames, setFileNames] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchRequirements(id)
      .then(r => {
        setReqs(r);
        const init: Record<string, boolean> = {};
        r.checklist.forEach(c => { init[c.id] = false; });
        setChecked(init);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const allRequired = reqs?.checklist
    .filter(c => c.required)
    .every(c => checked[c.id]) ?? false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    setError('');
    try {
      const { applicationId } = await submitApplication({ schemeId: id, formData: formValues });
      navigate(`/scheme/${id}/verify/${applicationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className={`page ${styles.center}`}>
      <span className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  return (
    <div className={`page ${styles.page}`}>
      {/* Sticky top bar */}
      <div className={styles.stickyTop}>
        <div className={styles.topBar}>
          <button className={styles.backBtn} onClick={() => step === 'form' ? setStep('checklist') : navigate(-1)} aria-label="Back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </button>
          <div className={styles.steps}>
            <div className={`${styles.step} ${step === 'checklist' ? styles.stepActive : styles.stepDone}`}>
              <span>1</span> Requirements
            </div>
            <div className={styles.stepLine} />
            <div className={`${styles.step} ${step === 'form' ? styles.stepActive : ''}`}>
              <span>2</span> Application
            </div>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        {step === 'checklist' && reqs && (
          <div className={styles.fade}>
            <h1 className={styles.heading}>Before you begin</h1>
            <p className={styles.sub}>Check that you have all required documents ready to upload.</p>

            <div className={styles.checklistGroup}>
              {reqs.checklist.map(item => (
                <label key={item.id} className={styles.checkItem}>
                  <input
                    type="checkbox"
                    checked={checked[item.id] ?? false}
                    onChange={e => setChecked(p => ({ ...p, [item.id]: e.target.checked }))}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkLabel}>
                    {item.label}
                    {item.required && <abbr title="Required" className={styles.required}> *</abbr>}
                  </span>
                </label>
              ))}
            </div>

            <p className={styles.hint}>* Required documents must be checked before proceeding.</p>

            <button
              className="btn btn--primary btn--full"
              disabled={!allRequired}
              onClick={() => setStep('form')}
            >
              Continue to application
            </button>
          </div>
        )}

        {step === 'form' && reqs && (
          <form className={styles.fade} onSubmit={handleSubmit} noValidate>
            <h1 className={styles.heading}>Application form</h1>
            <p className={styles.sub}>Fill in your details and upload required documents.</p>

            {reqs.formFields.map(field => (
              <div key={field.id} className={styles.field}>
                <label htmlFor={field.id} className={styles.label}>
                  {field.label}
                  {field.required && <abbr title="Required" className={styles.required}> *</abbr>}
                </label>

                {field.type === 'select' ? (
                  <select
                    id={field.id}
                    className="input"
                    required={field.required}
                    value={formValues[field.id] ?? ''}
                    onChange={e => setFormValues(p => ({ ...p, [field.id]: e.target.value }))}
                  >
                    <option value="">Select…</option>
                    {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : field.type === 'file' ? (
                  <label className={styles.fileLabel} htmlFor={field.id}>
                    <input
                      id={field.id}
                      type="file"
                      accept={field.accept}
                      required={field.required}
                      className={styles.fileInput}
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) setFileNames(p => ({ ...p, [field.id]: f.name }));
                      }}
                    />
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <span>{fileNames[field.id] ?? 'Choose file…'}</span>
                    <span className={styles.fileHint}>{field.accept}</span>
                  </label>
                ) : (
                  <input
                    id={field.id}
                    className="input"
                    type={field.type}
                    required={field.required}
                    value={formValues[field.id] ?? ''}
                    onChange={e => setFormValues(p => ({ ...p, [field.id]: e.target.value }))}
                  />
                )}
              </div>
            ))}

            {error && <p className={styles.error} role="alert">{error}</p>}

            <button type="submit" className="btn btn--primary btn--full" disabled={submitting}>
              {submitting ? <><span className="spinner" /> Submitting…</> : 'Submit application'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
