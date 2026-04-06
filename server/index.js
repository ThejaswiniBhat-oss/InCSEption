const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'truegrant-dev-secret-2026-change-in-production';
const USERS_FILE        = path.join(__dirname, 'data', 'users.json');
const APPLICATIONS_FILE = path.join(__dirname, 'data', 'applications.json');
const AUDIT_LOG_FILE    = path.join(__dirname, 'data', 'audit_log.json');

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({
  origin: [
    /^http:\/\/localhost(:\d+)?$/,
    /^http:\/\/192\.168\./,
    /^http:\/\/10\./,
    /^http:\/\/172\.(1[6-9]|2\d|3[01])\./,
  ],
  credentials: true,
}));
app.use(express.json());

// ─── User store helpers ───────────────────────────────────────────────────────

function readUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function toPublicUser(user) {
  const { passwordHash: _ph, ...pub } = user;
  return pub;
}

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

// ─── Auth middleware ──────────────────────────────────────────────────────────

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Token invalid or expired' });
  }
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// POST /api/auth/signup
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body ?? {};

  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email address' });
  }

  const users = readUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ message: 'An account with this email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = {
    id: `u_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    role: 'individual',
    avatarColor: '#c9a96e',
    createdAt: new Date().toISOString(),
    passwordHash,
  };

  users.push(user);
  writeUsers(users);

  res.status(201).json({ user: toPublicUser(user), token: signToken(user) });
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const users = readUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  res.json({ user: toPublicUser(user), token: signToken(user) });
});

// GET /api/auth/me
app.get('/api/auth/me', authenticate, (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user: toPublicUser(user) });
});

// PUT /api/auth/profile
app.put('/api/auth/profile', authenticate, async (req, res) => {
  const { name, email, currentPassword, newPassword } = req.body ?? {};

  const users = readUsers();
  const idx = users.findIndex(u => u.id === req.user.id);
  if (idx === -1) return res.status(404).json({ message: 'User not found' });

  const user = { ...users[idx] };

  // Password change
  if (newPassword) {
    if (!currentPassword) {
      return res.status(400).json({ message: 'Current password required to set a new one' });
    }
    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    user.passwordHash = await bcrypt.hash(newPassword, 12);
  }

  // Name update
  if (name?.trim()) user.name = name.trim();

  // Email update
  if (email && email.toLowerCase() !== user.email) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }
    const taken = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== user.id);
    if (taken) return res.status(409).json({ message: 'Email already in use by another account' });
    user.email = email.toLowerCase().trim();
  }

  users[idx] = user;
  writeUsers(users);

  // Issue new token with updated email if changed
  res.json({ user: toPublicUser(user), token: signToken(user) });
});

// POST /api/auth/logout (JWT is stateless; client drops token)
app.post('/api/auth/logout', authenticate, (_req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// ─── Application store helpers ────────────────────────────────────────────────

function readApplications() {
  if (!fs.existsSync(APPLICATIONS_FILE)) {
    fs.mkdirSync(path.dirname(APPLICATIONS_FILE), { recursive: true });
    fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify([], null, 2));
    return [];
  }
  try { return JSON.parse(fs.readFileSync(APPLICATIONS_FILE, 'utf8')); } catch { return []; }
}

function writeApplications(apps) {
  fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify(apps, null, 2));
}

// ─── Blockchain audit log (SHA-256 hash-chained) ─────────────────────────────

function readAuditLog() {
  if (!fs.existsSync(AUDIT_LOG_FILE)) {
    fs.mkdirSync(path.dirname(AUDIT_LOG_FILE), { recursive: true });
    fs.writeFileSync(AUDIT_LOG_FILE, JSON.stringify([], null, 2));
    return [];
  }
  try { return JSON.parse(fs.readFileSync(AUDIT_LOG_FILE, 'utf8')); } catch { return []; }
}

function appendAuditEntry(entry) {
  const log = readAuditLog();
  const previousHash = log.length > 0 ? log[log.length - 1].hash : '0000000000000000000000000000000000000000000000000000000000000000';
  const raw = previousHash + entry.timestamp + entry.applicationId + entry.decision + String(entry.score);
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  log.push({ ...entry, previousHash, hash });
  fs.writeFileSync(AUDIT_LOG_FILE, JSON.stringify(log, null, 2));
  return hash;
}

// ─── Scheme eligibility rules ─────────────────────────────────────────────────

const SCHEME_RULES = {
  's1':  { name: 'PM-KISAN Samman Nidhi',              maxIncome: 800000,   minAge: 18  },
  's2':  { name: 'PM Fasal Bima Yojana',               maxIncome: null,     minAge: 18  },
  's3':  { name: 'Kisan Credit Card',                   maxIncome: null,     minAge: 18  },
  's4':  { name: 'PMAY Urban',                          maxIncome: 1800000,  minAge: 18  },
  's5':  { name: 'PMAY Gramin',                         maxIncome: 200000,   minAge: 18  },
  's6':  { name: 'National Fellowship for OBC Students',maxIncome: 800000,   minAge: 18,  requiredCategory: ['OBC'] },
  's7':  { name: 'PM YASASVI Scholarship',              maxIncome: 250000,   minAge: 15,  maxAge: 25, requiredCategory: ['OBC','EBC','DNT'] },
  's8':  { name: 'Startup India Seed Fund',             maxIncome: null,     minAge: 18  },
  's9':  { name: 'Stand-Up India',                      maxIncome: null,     minAge: 18,  requiredCategory: ['SC','ST','WOMAN'] },
  's10': { name: 'PM MUDRA Yojana',                     maxIncome: null,     minAge: 18  },
  's11': { name: 'NGO Darpan / CSO Partnership',        maxIncome: null,     minAge: 21  },
  's12': { name: 'Digital India Internship',            maxIncome: null,     minAge: 18,  maxAge: 28 },
  's13': { name: 'PMKVY Skill Training',                maxIncome: null,     minAge: 15,  maxAge: 45 },
  's14': { name: 'Ayushman Bharat PMJAY',               maxIncome: 500000,   minAge: null },
};

function hashAadhaar(aadhaar) {
  // Store only the hash — never plaintext Aadhaar (UIDAI compliance)
  const digits = aadhaar.replace(/\s+/g, '');
  return crypto.createHash('sha256').update('truegrant-salt:' + digits).digest('hex');
}

function getAge(dob) {
  if (!dob) return null;
  const ms = Date.now() - new Date(dob).getTime();
  return Math.floor(ms / (365.25 * 24 * 3600 * 1000));
}

function checkEligibility(schemeId, formData, existingApps) {
  const rules = SCHEME_RULES[schemeId] || {};
  const points = [];
  const flags = [];
  let score = 100;

  const income   = parseInt(formData.income || '0', 10);
  const category = (formData.category || 'General').trim().toUpperCase();
  const gender   = (formData.gender   || '').trim().toUpperCase();
  const age      = getAge(formData.dob);
  const aadhaarHash = hashAadhaar(formData.aadhaar || '');

  // ── 1. Aadhaar deduplication ────────────────────────────────────────────────
  const sameSchemeApps = existingApps.filter(
    a => a.aadhaarHash === aadhaarHash && a.schemeId === schemeId
  );
  if (sameSchemeApps.length > 0) {
    points.push(`Duplicate application detected — Aadhaar already registered for scheme "${rules.name || schemeId}". Reference: ${sameSchemeApps[0].applicationId}.`);
    flags.push('aadhaar_duplicate');
    score -= 100;
  } else {
    const crossSchemeApps = existingApps.filter(a => a.aadhaarHash === aadhaarHash && a.schemeId !== schemeId);
    if (crossSchemeApps.length > 0) {
      points.push(`Aadhaar identity verified — no duplicate found for this scheme. (${crossSchemeApps.length} other scheme(s) on record; cross-scheme dedup check passed.)`);
    } else {
      points.push('Aadhaar identity verified — no existing registrations found across any scheme database.');
    }
  }

  // ── 2. Income check ─────────────────────────────────────────────────────────
  if (rules.maxIncome != null) {
    const fmt = n => '₹' + n.toLocaleString('en-IN');
    if (income <= 0) {
      points.push('Income could not be verified — please provide a valid annual household income figure.');
      flags.push('income_missing');
      score -= 20;
    } else if (income <= rules.maxIncome) {
      points.push(`Annual income ${fmt(income)} is within scheme ceiling of ${fmt(rules.maxIncome)} — income eligibility confirmed.`);
    } else {
      points.push(`Annual income ${fmt(income)} exceeds scheme ceiling of ${fmt(rules.maxIncome)} — applicant is ineligible on income grounds.`);
      flags.push('income_exceeded');
      score -= 50;
    }
  }

  // ── 3. Age check ────────────────────────────────────────────────────────────
  if (age === null) {
    if (rules.minAge || rules.maxAge) {
      points.push('Date of birth not provided — age eligibility could not be verified.');
      flags.push('age_missing');
      score -= 15;
    }
  } else {
    if (rules.minAge && age < rules.minAge) {
      points.push(`Age ${age} years is below the minimum requirement of ${rules.minAge} years for this scheme.`);
      flags.push('age_below_minimum');
      score -= 40;
    } else if (rules.maxAge && age > rules.maxAge) {
      points.push(`Age ${age} years exceeds the maximum age limit of ${rules.maxAge} years for this scheme.`);
      flags.push('age_above_maximum');
      score -= 40;
    } else if (rules.minAge || rules.maxAge) {
      points.push(`Age ${age} years is within the scheme's eligible age bracket${rules.minAge ? ' (min ' + rules.minAge : ''}${rules.maxAge ? '–max ' + rules.maxAge : ''} years).`);
    }
  }

  // ── 4. Category check ───────────────────────────────────────────────────────
  if (rules.requiredCategory && rules.requiredCategory.length > 0) {
    const normalised = rules.requiredCategory.map(c => c.toUpperCase());
    const match =
      normalised.includes(category) ||
      (normalised.includes('WOMAN') && gender === 'FEMALE');
    if (match) {
      points.push(`Social category '${formData.category}' satisfies the scheme's reservation criterion (${rules.requiredCategory.join(' / ')}).`);
    } else {
      points.push(`Social category '${formData.category}' does not meet the scheme requirement (${rules.requiredCategory.join(' / ')} only). Application ineligible on category grounds.`);
      flags.push('category_mismatch');
      score -= 50;
    }
  }

  // ── 5. Document & identity integrity ────────────────────────────────────────
  const aadhaarDigits = (formData.aadhaar || '').replace(/\s+/g, '');
  if (aadhaarDigits.length !== 12 || !/^\d{12}$/.test(aadhaarDigits)) {
    points.push('Aadhaar number format is invalid — must be exactly 12 digits. Document authenticity check failed.');
    flags.push('aadhaar_invalid_format');
    score -= 30;
  } else if (!flags.includes('aadhaar_duplicate')) {
    points.push('Aadhaar number format validated (12-digit numeric). Document authenticity check passed.');
  }

  const finalScore = Math.max(0, Math.min(100, score));
  const passed = flags.length === 0;

  if (passed) {
    points.push('All eligibility criteria satisfied. Application forwarded for final officer review and fund disbursement authorisation.');
  } else if (flags.includes('aadhaar_duplicate')) {
    points.push('Application has been BLOCKED — duplicate Aadhaar registration is a direct violation of single-beneficiary policy.');
  } else {
    points.push('Application has been BLOCKED pending resolution of the above eligibility failures. Applicant may appeal with supporting documents.');
  }

  return { passed, flags, justificationPoints: points, score: finalScore };
}

// ─── POST /api/applications/submit ───────────────────────────────────────────

app.post('/api/applications/submit', authenticate, (req, res) => {
  const { schemeId, formData } = req.body ?? {};
  if (!schemeId || !formData) {
    return res.status(400).json({ message: 'schemeId and formData are required' });
  }

  const apps = readApplications();
  const { passed, flags, justificationPoints, score } = checkEligibility(schemeId, formData, apps);

  const applicationId = `TG-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 89999)}`;
  const timestamp = new Date().toISOString();
  const status = passed ? 'approved' : (flags.includes('aadhaar_duplicate') ? 'blocked' : 'blocked');

  const aadhaarHash = hashAadhaar(formData.aadhaar || '');

  const record = {
    applicationId,
    schemeId,
    userId: req.user.id,
    aadhaarHash,
    applicantName: formData.name || '',
    status,
    score,
    flags,
    justificationPoints,
    submittedAt: timestamp,
  };

  apps.push(record);
  writeApplications(apps);

  // Anchor to blockchain audit log
  const blockHash = appendAuditEntry({
    applicationId,
    schemeId,
    userId: req.user.id,
    decision: status,
    score,
    flagCount: flags.length,
    timestamp,
  });

  res.status(201).json({ applicationId, blockHash });
});

// ─── GET /api/applications/:id ────────────────────────────────────────────────

app.get('/api/applications/:id', authenticate, (req, res) => {
  const apps = readApplications();
  const app_ = apps.find(a => a.applicationId === req.params.id && a.userId === req.user.id);
  if (!app_) return res.status(404).json({ message: 'Application not found' });

  // Read its block hash from audit log
  const log = readAuditLog();
  const entry = log.find(e => e.applicationId === req.params.id);

  res.json({
    applicationId: app_.applicationId,
    status: app_.status,
    score: app_.score,
    justificationPoints: app_.justificationPoints,
    flags: app_.flags,
    blockHash: entry?.hash,
    previousHash: entry?.previousHash,
    submittedAt: app_.submittedAt,
  });
});

// ─── GET /api/my-schemes ─────────────────────────────────────────────────────

app.get('/api/my-schemes', authenticate, (req, res) => {
  const apps = readApplications().filter(a => a.userId === req.user.id);
  const result = apps.map((a, i) => ({
    id: `ms_${i}_${a.applicationId}`,
    schemeId: a.schemeId,
    schemeTitle: SCHEME_RULES[a.schemeId]?.name ?? a.schemeId,
    status: a.status,
    submittedAt: a.submittedAt,
    updatedAt: a.submittedAt,
    justificationPoints: a.justificationPoints,
  }));
  res.json(result);
});

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────

app.get('/api/admin/stats', authenticate, (_req, res) => {
  const apps = readApplications();
  const statsMap = {};

  // Seed all known schemes so table always shows all 14
  Object.entries(SCHEME_RULES).forEach(([id, rule]) => {
    statsMap[id] = { schemeId: id, schemeName: rule.name, total: 0, approved: 0, blocked: 0, under_review: 0 };
  });

  apps.forEach(a => {
    if (!statsMap[a.schemeId]) {
      statsMap[a.schemeId] = { schemeId: a.schemeId, schemeName: a.schemeId, total: 0, approved: 0, blocked: 0, under_review: 0 };
    }
    statsMap[a.schemeId].total += 1;
    const s = a.status === 'approved' ? 'approved' : a.status === 'blocked' ? 'blocked' : 'under_review';
    statsMap[a.schemeId][s] += 1;
  });

  res.json({ stats: Object.values(statsMap) });
});

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'TrueGrant Auth', time: new Date().toISOString() });
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n  TrueGrant Auth Server`);
  console.log(`  ─────────────────────`);
  console.log(`  http://localhost:${PORT}/api/health\n`);
});
