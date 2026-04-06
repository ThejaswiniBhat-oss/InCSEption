const fs = require("fs");
const s0 = fs.readFileSync("d:/InCSEption/server/index.js", "utf8");
let s = s0.replace(
  "const path = require('path');",
  "const path = require('path');\nconst { registerExtensionRoutes } = require('./extra');"
);
s = s.replace(
  `function signToken(user) {\n  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });\n}`,
  `function signToken(user) {\n  return jwt.sign({ id: user.id, email: user.email, role: user.role || 'individual' }, JWT_SECRET, { expiresIn: '7d' });\n}`
);
s = s.replace(
  `    /^http:\\/\\/localhost(:\\d+)?$/,`,
  `    /^http:\\/\\/localhost(:\\d+)?$/,\n    /^http:\\/\\/127\\.0\\.0\\.1(:\\d+)?$/,`
);
const block = `
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

`;
s = s.replace("// ─── Health check ─────────────────────────────────────────────────────────────", block + "// ─── Health check ─────────────────────────────────────────────────────────────");
s = s.replace(/TrueGrant Auth/g, "TrueGrant API");
fs.writeFileSync("d:/InCSEption/backend/index.js", s);
console.log("written", s.length);
