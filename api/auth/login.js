const { redis } = require('../lib/redis');
const { verifyPassword, createToken } = require('../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { password } = req.body || {};
    if (!password) return res.status(400).json({ error: 'Password is required' });

    // Check Redis first (for changed passwords), then env variable
    let storedHash = await redis('GET', 'admin_password_hash');
    if (!storedHash) {
      storedHash = process.env.ADMIN_PASSWORD_HASH;
    }

    if (!storedHash) {
      return res.status(500).json({ error: 'Admin password not configured' });
    }

    if (!verifyPassword(password, storedHash)) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = createToken({ role: 'admin' }, 24);

    res.setHeader('Set-Cookie', `admin_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
