const { redis } = require('../lib/redis');
const { requireAuth, verifyPassword, hashPassword } = require('../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = requireAuth(req);
  if (!payload) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    // Verify current password
    let storedHash = await redis('GET', 'admin_password_hash');
    if (!storedHash) {
      storedHash = process.env.ADMIN_PASSWORD_HASH;
    }

    if (!verifyPassword(currentPassword, storedHash)) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash and store new password in Redis
    const newHash = hashPassword(newPassword);
    await redis('SET', 'admin_password_hash', newHash);

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
