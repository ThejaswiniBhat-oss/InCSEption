const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { runVerification } = require('./lib/verifyEngine');

const SCHEMES_FILE = path.join(__dirname, 'data', 'schemes.json');
const APPLICATIONS_FILE = path.join(__dirname, 'data', 'applications.json');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

function readApplicationsFs() {
  if (!fs.existsSync(APPLICATIONS_FILE)) {
    fs.mkdirSync(path.dirname(APPLICATIONS_FILE), { recursive: true });
    fs.writeFileSync(APPLICATIONS_FILE, '[]');
    return [];
  }
  try { return JSON.parse(fs.readFileSync(APPLICATIONS_FILE, 'utf8')); } catch { return []; }
}
function writeApplicationsFs(rows) {
  fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify(rows, null, 2));
}
function loadSchemes() {
  if (!fs.existsSync(SCHEMES_FILE)) return [];
  return JSON.parse(fs.readFileSync(SCHEMES_FILE, 'utf8'));
}
let schemesCache = [];

function buildAgentsFromOutcome(outcome) {
  const dup = outcome && outcome.flags && outcome.flags.includes('POSSIBLE_DUPLICATE');
  const fraud = outcome && outcome.flags && outcome.flags.some((f) => f.includes('FRAUD'));
  const geo = outcome && outcome.flags && outcome.flags.includes('GEO_RURAL_MISMATCH');
  return [
    { id: 'a1', name: 'Deduplication Agent', description: 'Cross-application Aadhaar match.', status: 'completed', lastRun: new Date().toISOString(), detail: dup ? 'Duplicate signal.' : 'No duplicate.', logs: [] },
    { id: 'a2', name: 'Fraud Detection Agent', description: 'Pattern checks.', status: 'completed', lastRun: new Date().toISOString(), detail: fraud ? 'Fraud signal.' : 'Clean.', logs: [] },
    { id: 'a3', name: 'Eligibility Checker', description: 'Rules + income.', status: 'completed', lastRun: new Date().toISOString(), detail: 'Evaluated.', logs: [] },
    { id: 'a4', name: 'Geo Integrity Agent', description: 'State vs scheme.', status: geo ? 'completed' : 'idle', lastRun: new Date().toISOString(), detail: geo ? 'Geo flag.' : 'Geo OK.', logs: [] },
    { id: 'a5', name: 'Document Authenticity Agent', description: 'Uploads.', status: 'completed', lastRun: new Date().toISOString(), detail: 'Received.', logs: [] },
    { id: 'a6', name: 'Outcome Explainer', description: 'Justification.', status: 'completed', lastRun: new Date().toISOString(), detail: 'Ready.', logs: [] },
  ];
}

function registerExtensionRoutes(app, { findUserById, authenticate, toPublicUser, signToken, readUsers, writeUsers }) {
  schemesCache = loadSchemes();

  app.put('/api/auth/role', authenticate, async (req, res) => {
    const role = req.body && req.body.role;
    const allowed = ['individual', 'ngo', 'government_officer', 'admin'];
    if (!allowed.includes(role)) return res.status(400).json({ message: 'Invalid role' });
    const users = readUsers();
    const idx = users.findIndex((u) => u.id === req.user.id);
    if (idx < 0) return res.status(404).json({ message: 'User not found' });
    users[idx] = { ...users[idx], role };
    writeUsers(users);
    res.json({ user: toPublicUser(users[idx]), token: signToken(users[idx]) });
  });

  const REQ_TEMPLATE = {
    checklist: [
      { id: 'c1', label: 'Aadhaar card', required: true },
      { id: 'c2', label: 'Income certificate', required: true },
      { id: 'c3', label: 'Category certificate (if applicable)', required: false },
      { id: 'c4', label: 'Bank passbook', required: true },
      { id: 'c5', label: 'Land records (if required)', required: false },
      { id: 'c6', label: 'Photograph', required: true },
      { id: 'c7', label: 'Mobile linked to Aadhaar', required: true },
    ],
    formFields: [
      { id: 'f1', label: 'Full name (as on Aadhaar)', type: 'text', required: true },
      { id: 'f2', label: 'Aadhaar number', type: 'text', required: true },
      { id: 'f3', label: 'Date of birth', type: 'date', required: true },
      { id: 'f4', label: 'Annual household income (Rs)', type: 'number', required: true },
      { id: 'f5', label: 'State', type: 'select', required: true, options: ['Delhi', 'Goa', 'Karnataka', 'Maharashtra', 'Tamil Nadu', 'Uttar Pradesh', 'West Bengal', 'Kerala', 'Bihar', 'Odisha'] },
      { id: 'f6', label: 'Upload Aadhaar', type: 'file', required: true, accept: '.pdf,.jpg,.jpeg,.png' },
      { id: 'f7', label: 'Upload income certificate', type: 'file', required: true, accept: '.pdf,.jpg,.jpeg,.png' },
      { id: 'f8', label: 'Upload category (optional)', type: 'file', required: false, accept: '.pdf,.jpg,.jpeg,.png' },
    ],
  };

  app.get('/api/schemes', (req, res) => {
    const q = (req.query.q || '').toLowerCase().trim();
    let list = schemesCache;
    if (q) {
      list = list.filter((s) =>
        s.title.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.ministry.toLowerCase().includes(q) ||
        (s.tags || []).some((t) => t.includes(q))
      );
    }
    res.json(list);
  });

  app.get('/api/schemes/:id', (req, res) => {
    const s = schemesCache.find((x) => x.id === req.params.id);
    if (!s) return res.status(404).json({ message: 'Scheme not found' });
    res.json(s);
  });

  app.get('/api/schemes/:id/requirements', authenticate, (req, res) => {
    const s = schemesCache.find((x) => x.id === req.params.id);
    if (!s) return res.status(404).json({ message: 'Scheme not found' });
    res.json({ schemeId: s.id, checklist: REQ_TEMPLATE.checklist, formFields: REQ_TEMPLATE.formFields });
  });

  app.post('/api/schemes/:schemeId/apply', authenticate, upload.any(), async (req, res) => {
    const schemeId = req.params.schemeId;
    const scheme = schemesCache.find((x) => x.id === schemeId);
    if (!scheme) return res.status(404).json({ message: 'Scheme not found' });

    const formData = { ...req.body };
    for (const f of req.files || []) formData[f.fieldname] = f.originalname;

    const user = await findUserById(req.user.id);
    if (!user) return res.status(401).json({ message: 'User not found' });

    const rows = readApplicationsFs();
    const existingAadhaarIndex = rows.map((a) => ({
      userId: a.userId,
      applicationId: a.applicationId,
      aadhaar: String((a.formData && a.formData.f2) || '').replace(/\s/g, ''),
    }));

    const v = runVerification({
      formData,
      scheme,
      user: { id: user.id, role: user.role || 'individual', email: user.email },
      existingAadhaarIndex,
    });

    const applicationId = 'TG-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 89999);
    const doc = {
      applicationId,
      userId: user.id,
      schemeId,
      formData,
      status: v.status,
      score: v.score,
      justificationPoints: v.justificationPoints,
      flags: v.flags,
      linkedApplicant: v.linkedApplicant,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    rows.push(doc);
    writeApplicationsFs(rows);
    res.status(201).json({ applicationId });
  });

  app.get('/api/applications/:applicationId/verify', authenticate, (req, res) => {
    const rows = readApplicationsFs();
    const appDoc = rows.find((a) => a.applicationId === req.params.applicationId);
    if (!appDoc) return res.status(404).json({ message: 'Application not found' });
    if (appDoc.userId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    res.json({
      applicationId: appDoc.applicationId,
      status: appDoc.status,
      score: appDoc.score,
      justificationPoints: appDoc.justificationPoints || [],
      flags: appDoc.flags || [],
      linkedApplicant: appDoc.linkedApplicant,
    });
  });

  app.get('/api/my-schemes', authenticate, (req, res) => {
    const rows = readApplicationsFs().filter((a) => a.userId === req.user.id);
    const out = rows.map((a) => {
      const sch = schemesCache.find((s) => s.id === a.schemeId);
      return {
        id: a.applicationId,
        schemeId: a.schemeId,
        schemeTitle: sch ? sch.title : a.schemeId,
        status: a.status,
        submittedAt: a.createdAt ? String(a.createdAt).slice(0, 10) : undefined,
        updatedAt: a.updatedAt || a.createdAt,
        justificationPoints: a.justificationPoints,
      };
    });
    res.json(out);
  });

  app.get('/api/agents', authenticate, (req, res) => {
    const rows = readApplicationsFs().filter((a) => a.userId === req.user.id);
    const latest = rows.length ? rows[rows.length - 1] : null;
    const outcome = latest ? { status: latest.status, flags: latest.flags || [] } : null;
    res.json(buildAgentsFromOutcome(outcome));
  });
}

module.exports = { registerExtensionRoutes };
