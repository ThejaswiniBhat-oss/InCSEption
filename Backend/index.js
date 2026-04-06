const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { registerExtensionRoutes } = require('./extra');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'truegrant-dev-secret-2026-change-in-production';
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({
  origin: [
    /^http:\/\/localhost(:\d+)?$/,
    /^http:\/\/127\.0\.0\.1(:\d+)?$/,
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
  return jwt.sign({ id: user.id, email: user.email, role: user.role || 'individual' }, JWT_SECRET, { expiresIn: '7d' });
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


async function findUserById(id) {
  return readUsers().find((u) => u.id === id) || null;
}

registerExtensionRoutes(app, {
  findUserById,
  authenticate,
  toPublicUser,
  signToken,
  readUsers,
  writeUsers,
});

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'TrueGrant API', time: new Date().toISOString() });
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n  TrueGrant API Server`);
  console.log(`  ─────────────────────`);
  console.log(`  http://localhost:${PORT}/api/health\n`);
});
