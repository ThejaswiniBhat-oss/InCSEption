import { useNavigate } from 'react-router-dom';
import styles from './PrivacyPage.module.css';

interface PolicySection { title: string; paras: string[] }
const SECTIONS: PolicySection[] = [
  {
    title: '1. Information we collect',
    paras: [
      'Account information: When you create a TrueGrant account, we collect your name, email address, and hashed password. We also store your selected role (Individual, NGO, Government Officer, Admin) to personalise your scheme recommendations.',
      'Application data: When you apply for a scheme, we collect the information entered in the application form — including name, Aadhaar number, date of birth, income declaration, state of residence — and the documents you upload (income certificate, category certificate, land records, etc.).',
      'Usage data: We collect anonymised data about how you interact with the app — screens visited, search queries, and session duration — to improve the product. This data is never linked to your identity in analytics reports.',
      'Device data: We collect your device type, browser, operating system, and IP address for security monitoring and fraud prevention purposes only.',
    ],
  },
  {
    title: '2. How we use your information',
    paras: [
      'Scheme matching: Your role and profile information is used to filter and display schemes relevant to you.',
      'Eligibility verification: Application data and uploaded documents are processed by TrueGrant\'s AI agents to verify your eligibility, check for duplicates, and assess fraud risk. This processing is the core purpose of the platform.',
      'Justification generation: Your application data is used to generate structured, point-wise justification reports for every approval or rejection decision.',
      'Communication: We use your email address to send important account notifications (e.g., verification links, profile change confirmations). We do not send marketing emails without explicit opt-in.',
      'Security: Device data and IP addresses are used to detect suspicious login attempts, bot activity, and fraudulent applications.',
    ],
  },
  {
    title: '3. Aadhaar data handling',
    paras: [
      'TrueGrant does not store your Aadhaar number in plain text. The number is immediately hashed using a one-way cryptographic function (SHA-256 with a site-specific salt) upon receipt. The original number is discarded from memory.',
      'The stored hash is used exclusively for deduplication — to check whether the same Aadhaar has been used in another application. The original Aadhaar number cannot be reconstructed from the hash.',
      'TrueGrant does not collect or store Aadhaar biometric data (fingerprints, iris scans). We do not perform biometric authentication. All Aadhaar-related processing is limited to the document-level (scanned copy for OCR verification only).',
      'This processing is compliant with the Aadhaar (Targeted Delivery of Financial and Other Subsidies, Benefits and Services) Act, 2016 and UIDAI regulations.',
    ],
  },
  {
    title: '4. Document retention and deletion',
    paras: [
      'Uploaded documents (PDFs and images) are processed in an isolated sandbox environment for OCR and authenticity checks. Raw files are deleted from our processing servers within 24 hours of successful verification.',
      'Extracted metadata (document type, issuing authority, dates) is retained as part of your application record for audit purposes for a period of 7 years, in accordance with Government of India record-keeping guidelines for public benefit schemes.',
      'If your application is rejected or withdrawn, your documents are deleted within 30 days. Application metadata (dates, outcome, scores) is retained for 2 years for audit trail purposes.',
      'You may request deletion of your account and all associated data by emailing privacy@truegrant.in. Deletion is processed within 30 days subject to any pending legal or audit hold requirements.',
    ],
  },
  {
    title: '5. Data sharing',
    paras: [
      'Government agencies: Verified application data and outcomes may be shared with the relevant implementing ministry or agency (e.g., Ministry of Agriculture for PM-KISAN) solely for the purpose of benefit disbursement. This sharing is the intended purpose of the platform.',
      'AI and infrastructure providers: We use third-party cloud infrastructure and AI services. All third parties are bound by data processing agreements (DPAs) and are prohibited from using your data for any purpose other than providing services to TrueGrant.',
      'We do not sell, rent, or trade your personal data to any commercial entity for marketing or profiling purposes.',
      'Law enforcement: We may disclose data if required by a valid court order or direction from a competent government authority under applicable Indian law.',
    ],
  },
  {
    title: '6. Security measures',
    paras: [
      'Passwords are hashed using bcrypt with a work factor of 12 — computationally infeasible to reverse.',
      'All API communication is encrypted using TLS 1.3. HTTPS is enforced on all endpoints.',
      'JWT tokens expire after 7 days and are signed with a server-side secret. Tokens are stateless — if you suspect compromise, changing your password immediately invalidates all existing sessions.',
      'Our systems are monitored 24/7 for anomalous access patterns. A security incident response plan is maintained and tested quarterly.',
    ],
  },
  {
    title: '7. Your rights',
    paras: [
      'Access: You may request a copy of all personal data we hold about you by emailing privacy@truegrant.in.',
      'Correction: You can update your name and email directly from Profile → Edit Profile. For corrections to application data, contact support.',
      'Deletion: You may request account and data deletion. See Section 4 for retention obligations that may delay full deletion.',
      'Portability: We can provide your application history and profile data in machine-readable JSON format upon request.',
      'Grievance redressal: If you believe your data rights have been violated, you may contact our Data Protection Officer at dpo@truegrant.in.',
    ],
  },
  {
    title: '8. Changes to this policy',
    paras: [
      'We may update this Privacy Policy as the product evolves or as legal requirements change. Material changes will be communicated via email and an in-app notification at least 14 days before they take effect.',
      'Continued use of TrueGrant after the effective date of a revised policy constitutes acceptance of the updated terms.',
      'This policy was last updated: 5 April 2026.',
    ],
  },
];

export default function PrivacyPage() {
  const navigate = useNavigate();
  return (
    <div className={`page ${styles.page}`}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <h1 className={styles.pageTitle}>Privacy Policy</h1>
      </div>

      <div className={styles.container}>
        <div className={styles.intro}>
          <p>TrueGrant is committed to protecting your personal information. This policy explains what data we collect, how we use it, and your rights. Please read it carefully — your trust is the foundation of what we do.</p>
          <p className={styles.effective}>Effective date: 5 April 2026</p>
        </div>

        {SECTIONS.map(s => (
          <div key={s.title} className={styles.section}>
            <h2 className={styles.sectionTitle}>{s.title}</h2>
            {s.paras.map((p, i) => (
              <p key={i} className={styles.para}>{p}</p>
            ))}
          </div>
        ))}

        <div className={styles.contact}>
          <p>Questions? Contact our Data Protection Officer at <strong>dpo@truegrant.in</strong></p>
        </div>
      </div>
    </div>
  );
}
