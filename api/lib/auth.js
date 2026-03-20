const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const SALT_ROUNDS_ITERATIONS = 100000;

// --- Password hashing (PBKDF2) ---
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, SALT_ROUNDS_ITERATIONS, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const verify = crypto.pbkdf2Sync(password, salt, SALT_ROUNDS_ITERATIONS, 64, 'sha512').toString('hex');
  return hash === verify;
}

// --- JWT (HMAC-SHA256) ---
function createToken(payload, expiresInHours = 24) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const body = Buffer.from(JSON.stringify({ ...payload, iat: now, exp: now + expiresInHours * 3600 })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyToken(token) {
  try {
    const [header, body, signature] = token.split('.');
    const expected = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    if (signature !== expected) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function getTokenFromCookies(cookieHeader) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/admin_token=([^;]+)/);
  return match ? match[1] : null;
}

function requireAuth(req) {
  const token = getTokenFromCookies(req.headers.cookie);
  if (!token) return null;
  return verifyToken(token);
}

module.exports = { hashPassword, verifyPassword, createToken, verifyToken, getTokenFromCookies, requireAuth };
