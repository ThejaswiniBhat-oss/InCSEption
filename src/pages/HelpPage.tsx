import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HelpPage.module.css';

interface FAQItem { q: string; a: string }
const FAQ: FAQItem[] = [
  { q: 'How do I find a scheme I am eligible for?', a: 'Go to Home and use the search bar or tap one of the quick chips (Agriculture, Education, etc.). You can also use voice search by tapping the microphone icon. The scheme list automatically filters based on your selected role — make sure you\'ve set the right role in Profile or in the Home screen dropdown.' },
  { q: 'What happens after I submit an application?', a: 'Your application enters TrueGrant\'s multi-agent verification pipeline. Six AI agents check your identity, documents, eligibility, and location integrity. You\'ll be taken to the Verify screen which shows the result — Approved, Under Review, or Blocked — along with a point-wise justification explaining each decision.' },
  { q: 'Why was my application blocked?', a: 'A blocked status means one or more integrity checks could not be satisfied. The Verify screen shows exactly which checks failed. Common reasons include: mismatched name between Aadhaar and submitted certificate, income above scheme threshold, duplicate application detected, or document failed authenticity check. You can correct the issue and reapply.' },
  { q: 'Is my Aadhaar data stored by TrueGrant?', a: 'No. TrueGrant never stores your Aadhaar number or biometric data. Only a one-way cryptographic hash of your Aadhaar is retained for deduplication — the original number cannot be reverse-engineered from the hash. All processing is compliant with UIDAI guidelines.' },
  { q: 'Can I apply for multiple schemes at the same time?', a: 'Yes. You can apply for as many schemes as you are eligible for. However, some schemes explicitly restrict concurrent benefit from overlapping programmes (e.g., you cannot hold two research fellowships simultaneously). Such restrictions are stated in the Clauses & Conditions section of each scheme.' },
  { q: 'How do I change my role (Individual / NGO / etc.)?', a: 'Open Profile → tap your current role badge or use the role chip grid. Changes are saved immediately. You can also change it from the Home screen dropdown next to "Viewing schemes for".' },
  { q: 'The voice search is not working. What should I do?', a: 'Voice search uses your browser\'s built-in speech recognition. Ensure you have granted microphone permission to the site. On iOS Safari, microphone access must be enabled in Settings → Safari → Microphone. If your browser doesn\'t support it, you\'ll only see the text search field (the mic won\'t appear).' },
  { q: 'I forgot my password. How do I reset it?', a: 'Password reset via email is on the roadmap. Currently, contact support at support@truegrant.in and our team will verify your identity and issue a manual reset within 24 hours.' },
];

function FAQAccordion({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.faqItem}>
      <button className={styles.faqQ} onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span>{item.q}</span>
        <svg className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && <p className={styles.faqA}>{item.a}</p>}
    </div>
  );
}

export default function HelpPage() {
  const navigate = useNavigate();
  return (
    <div className={`page ${styles.page}`}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <h1 className={styles.pageTitle}>Help & Support</h1>
      </div>

      <div className={styles.container}>
        {/* Contact card */}
        <div className={`card ${styles.contactCard}`}>
          <div className={styles.contactRow}>
            <span className={styles.contactIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
            </span>
            <div>
              <p className={styles.contactLabel}>Email support</p>
              <p className={styles.contactValue}>support@truegrant.in</p>
              <p className={styles.contactNote}>Response within 24 hours on working days</p>
            </div>
          </div>
          <div className={styles.cardDivider} />
          <div className={styles.contactRow}>
            <span className={styles.contactIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </span>
            <div>
              <p className={styles.contactLabel}>Helpline</p>
              <p className={styles.contactValue}>1800-XXX-XXXX</p>
              <p className={styles.contactNote}>Mon–Fri, 9 AM – 6 PM IST (toll-free)</p>
            </div>
          </div>
        </div>

        {/* How to apply guide */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>How to apply for a scheme</h2>
        </div>
        <div className={`card ${styles.stepsCard}`}>
          {[
            { n: '1', t: 'Find your scheme', d: 'Browse or search from Home. Tap a scheme card to read details, eligibility, and benefits.' },
            { n: '2', t: 'Read carefully', d: 'Check the Eligibility Criteria and Clauses sections. Use the Simplify toggle for plain-language summaries.' },
            { n: '3', t: 'Gather documents', d: 'Complete the requirements checklist on the Apply screen. All required documents must be checked before proceeding.' },
            { n: '4', t: 'Fill the form', d: 'Enter your details and upload scanned copies of documents in .pdf or .jpg format (max 5 MB each).' },
            { n: '5', t: 'Submit & verify', d: 'Tap Submit. The AI verification pipeline runs automatically. Your result appears on the Verify screen within seconds.' },
          ].map(step => (
            <div key={step.n} className={styles.step}>
              <div className={styles.stepNum}>{step.n}</div>
              <div>
                <p className={styles.stepTitle}>{step.t}</p>
                <p className={styles.stepDesc}>{step.d}</p>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Frequently asked questions</h2>
        </div>
        <div className="card">
          {FAQ.map((item, i) => (
            <div key={i}>
              <FAQAccordion item={item} />
              {i < FAQ.length - 1 && <div className={styles.cardDivider} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
