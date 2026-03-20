const { redis, pipeline } = require('../lib/redis');
const { requireAuth } = require('../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = requireAuth(req);
  if (!payload) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = parseInt(req.query.offset) || 0;

    const raw = await redis('LRANGE', 'visits', offset, offset + limit - 1);
    const total = await redis('LLEN', 'visits');

    var visitors = (raw || []).map(function (item) {
      try { return JSON.parse(item); } catch { return null; }
    }).filter(Boolean);

    // Fetch updated visit data (with duration) for visits that have a visitId
    var visitIds = visitors.filter(function (v) { return v.visitId; }).map(function (v) { return v.visitId; });
    if (visitIds.length > 0) {
      var commands = visitIds.map(function (id) { return ['GET', 'visit:' + id]; });
      var results = await pipeline(commands);
      var updatedMap = {};
      results.forEach(function (r, i) {
        if (r.result) {
          try { updatedMap[visitIds[i]] = JSON.parse(r.result); } catch (e) {}
        }
      });
      visitors = visitors.map(function (v) {
        return (v.visitId && updatedMap[v.visitId]) ? updatedMap[v.visitId] : v;
      });
    }

    res.status(200).json({
      visitors: visitors,
      total: total || 0,
      limit: limit,
      offset: offset,
    });
  } catch (error) {
    console.error('Visitors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
