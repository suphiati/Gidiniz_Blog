const { redis } = require('./lib/redis');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    var body = req.body;

    // Support both JSON and sendBeacon (which sends as text)
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { return res.status(400).json({ error: 'Invalid JSON' }); }
    }

    var visitId = body && body.visitId;
    var duration = body && body.duration;

    if (!visitId || typeof duration !== 'number') {
      return res.status(400).json({ error: 'visitId and duration required' });
    }

    // Cap duration at 1 hour
    if (duration < 0 || duration > 3600) {
      duration = Math.min(Math.max(duration, 0), 3600);
    }

    var existing = await redis('GET', 'visit:' + visitId);
    if (!existing) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    var visit = JSON.parse(existing);
    visit.duration = Math.round(duration);
    await redis('SET', 'visit:' + visitId, JSON.stringify(visit), 'EX', 2592000);

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Track duration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
