const { requireAuth } = require('../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = requireAuth(req);
  if (!payload) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  res.status(200).json({ ok: true, role: payload.role });
};
