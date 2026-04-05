import { useNavigate } from 'react-router-dom';
import styles from './AboutPage.module.css';

function BackButton() {
  const navigate = useNavigate();
  return (
    <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Back">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 12H5M12 5l-7 7 7 7"/>
      </svg>
    </button>
  );
}

interface SectionProps { icon: React.ReactNode; title: string; children: React.ReactNode }
function InfoSection({ icon, title, children }: SectionProps) {
  return (
    <div className={styles.infoSection}>
      <div className={styles.infoHeader}>
        <span className={styles.infoIcon}>{icon}</span>
        <h2 className={styles.infoTitle}>{title}</h2>
      </div>
      <div className={styles.infoBody}>{children}</div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className={`page ${styles.page}`}>
      <div className={styles.topBar}>
        <BackButton />
        <h1 className={styles.pageTitle}>About TrueGrant</h1>
      </div>

      <div className={styles.container}>
        {/* Hero */}
        <div className={styles.hero}>
          <div className={styles.logoRow}>
            <svg width="44" height="44" viewBox="0 0 56 56" fill="none" aria-hidden="true">
              <rect width="56" height="56" rx="14" fill="#c9a96e" fillOpacity="0.15"/>
              <path d="M14 20h28M14 28h20M14 36h14" stroke="#c9a96e" strokeWidth="3.5" strokeLinecap="round"/>
              <circle cx="40" cy="34" r="8" fill="#c9a96e" fillOpacity="0.15" stroke="#c9a96e" strokeWidth="2"/>
              <path d="M37 34l2 2 4-4" stroke="#c9a96e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className={styles.logoName}>TrueGrant</span>
          </div>
          <p className={styles.tagline}>Authentic IDs, Authentic Impact.</p>
          <p className={styles.version}>Version 1.0 · Hackathon Build 2026</p>
        </div>

        <InfoSection title="The problem we solve" icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="currentColor"/>
          </svg>
        }>
          <p>India spends over ₹3.5 lakh crore annually on direct benefit transfers across hundreds of grant-in-aid schemes. Yet independent audits consistently reveal that 10–30% of disbursed funds are lost to three systemic failures:</p>
          <ul className={styles.dotList}>
            <li><strong>Ghost beneficiaries</strong> — deceased or fictitious individuals still drawing benefits due to stale enrollment records.</li>
            <li><strong>Duplicate claims</strong> — the same person or family claiming the same or similar benefits from multiple overlapping schemes simultaneously.</li>
            <li><strong>Wrong recipients</strong> — ineligible individuals receiving funds while truly eligible beneficiaries are left out due to opaque or manual verification processes.</li>
          </ul>
          <p>These failures erode public trust, waste finite government resources, and — most critically — deny rightful support to India's most vulnerable citizens.</p>
        </InfoSection>

        <InfoSection title="Our solution" icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        }>
          <p>TrueGrant is an AI-powered Grant-in-Aid Beneficiary Identification platform that makes every rupee count. We combine multi-agent AI with a clean, accessible interface to deliver:</p>
          <ul className={styles.dotList}>
            <li><strong>Real-time deduplication</strong> — cross-checking applicant identity across 14+ state beneficiary databases before a single rupee is committed.</li>
            <li><strong>Fraud risk scoring</strong> — ML models trained on historical anomaly patterns surface high-risk applications for human review before approval.</li>
            <li><strong>Automated eligibility verification</strong> — scheme criteria evaluated programmatically against live government data (income, land records, category certificates) instead of manual paper checks.</li>
            <li><strong>Explainable outcomes</strong> — every approval or rejection comes with a structured, point-wise justification that citizens and officers can read and challenge.</li>
          </ul>
        </InfoSection>

        <InfoSection title="How it works" icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
          </svg>
        }>
          <ol className={styles.numList}>
            <li><strong>Citizen applies</strong> — selects a scheme, completes the requirements checklist, and submits documents via the TrueGrant app.</li>
            <li><strong>Multi-agent pipeline activates</strong> — six specialised AI agents run in parallel: Deduplication, Fraud Detection, Eligibility Checker, Geo Integrity, Document Authenticity, and Outcome Explainer.</li>
            <li><strong>Integrity score generated</strong> — a composite score (0–100) is computed from agent outputs, aggregated by a meta-layer that weights each signal by historical accuracy.</li>
            <li><strong>Outcome delivered</strong> — Approved, Under Review, or Blocked — with a clear point-wise justification and an audit trail stored on an immutable log.</li>
            <li><strong>Government officer reviews flagged cases</strong> — cases below confidence threshold route to a human review queue in the admin dashboard.</li>
          </ol>
        </InfoSection>

        <InfoSection title="Security & privacy" icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        }>
          <ul className={styles.dotList}>
            <li><strong>Passwords</strong> are hashed with bcrypt (cost factor 12) — we never store plaintext credentials.</li>
            <li><strong>Sessions</strong> are managed via signed JSON Web Tokens (JWT, HS256) with a 7-day expiry — no session state on the server.</li>
            <li><strong>Aadhaar data</strong> is never stored by TrueGrant — only the hash digest is retained for deduplication matching, in compliance with UIDAI guidelines.</li>
            <li><strong>All API traffic</strong> is encrypted in transit via TLS 1.3 between client, server, and third-party government APIs.</li>
            <li><strong>Audit logs</strong> are write-once and tamper-evident — every agent decision is logged with timestamp, agent version, and confidence score.</li>
            <li><strong>Document uploads</strong> are scanned for malware and processed in an isolated sandbox before OCR — raw files are deleted after verification.</li>
          </ul>
        </InfoSection>

        <InfoSection title="Blockchain & immutable audit trail" icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="6" height="6" rx="1"/><rect x="9" y="7" width="6" height="6" rx="1"/><rect x="16" y="7" width="6" height="6" rx="1"/>
            <line x1="8" y1="10" x2="9" y2="10"/><line x1="15" y1="10" x2="16" y2="10"/>
          </svg>
        }>
          <p>One of the hardest problems in public benefit delivery is <strong>trust</strong> — citizens cannot verify whether their application was processed fairly, and auditors cannot easily detect tampering in centralised records. TrueGrant addresses this with a blockchain-anchored audit trail.</p>
          <p>A blockchain is a distributed ledger — a chain of records where each block contains a cryptographic hash of the previous one. This makes the history <strong>tamper-evident</strong>: altering any past record breaks every subsequent hash, making fraud instantly detectable without needing to trust any single authority.</p>
          <p>In TrueGrant, every agent decision — approval, rejection, flag — is hashed and anchored to a permissioned blockchain node. This delivers three critical guarantees:</p>
          <ul className={styles.dotList}>
            <li><strong>Non-repudiation</strong> — no government official or system administrator can alter or delete a decision record after it is written. The cryptographic proof exists independently of TrueGrant's servers.</li>
            <li><strong>Citizen verifiability</strong> — beneficiaries can independently verify their application outcome using a public hash explorer, without trusting any intermediary. Your reference ID maps directly to an on-chain record.</li>
            <li><strong>Fraud forensics</strong> — if a duplicate or ghost-beneficiary claim is detected months later, the full decision trail — which agent ran, what data was checked, what score was assigned — is preserved immutably for legal proceedings.</li>
          </ul>
          <p>This transforms TrueGrant from a mere processing system into an <strong>accountable infrastructure</strong> — where every rupee disbursed carries a permanent, verifiable, tamper-proof paper trail that any stakeholder (citizen, auditor, court) can inspect.</p>
        </InfoSection>

        <InfoSection title="Built for India" icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        }>
          <p>TrueGrant is designed for Bharat — mobile-first, available in low-bandwidth environments, and accessible to citizens with varying levels of digital literacy. Voice-search in Indian English helps users find relevant schemes without needing to type. The platform is built as a progressive web app (PWA), meaning it installs on any smartphone without an app store — reducing friction for first-time users in Tier-2 and Tier-3 cities and rural India.</p>
        </InfoSection>

        <div className={styles.footer}>
          <p>Built with purpose at the AI × Legal Systems Hackathon 2026.</p>
          <p>TrueGrant is an open-governance initiative. We believe every Indian deserves the benefit they are entitled to — no more, no less.</p>
        </div>
      </div>
    </div>
  );
}
