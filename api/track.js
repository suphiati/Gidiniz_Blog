const { redis, pipeline } = require('./lib/redis');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { page, referrer, userAgent, language, screenWidth } = req.body || {};
    if (!page) return res.status(400).json({ error: 'Page is required' });

    // Skip tracking for dashboard
    if (page.includes('dashboard')) {
      return res.status(200).json({ ok: true, skipped: true });
    }

    const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
    const country = req.headers['x-vercel-ip-country'] || 'unknown';
    const city = req.headers['x-vercel-ip-city'] || 'unknown';

    // Rate limiting: same IP + page = max once per 30 min
    const rateLimitKey = `ratelimit:${ip}:${page}`;
    const existing = await redis('GET', rateLimitKey);
    if (existing) {
      return res.status(200).json({ ok: true, skipped: true });
    }
    await redis('SET', rateLimitKey, '1', 'EX', 1800);

    // Determine device type from screen width
    let device = 'desktop';
    if (screenWidth) {
      if (screenWidth < 768) device = 'mobile';
      else if (screenWidth < 1024) device = 'tablet';
    }

    // Parse browser from user agent
    const browser = parseBrowser(userAgent || '');

    const now = new Date();
    const dateKey = now.toISOString().split('T')[0]; // YYYY-MM-DD

    // Clean page path
    const cleanPage = page.replace(/^\//, '').replace(/\.html$/, '') || 'anasayfa';

    const visitData = JSON.stringify({
      page: cleanPage,
      referrer: referrer || 'direct',
      browser,
      device,
      country,
      city: decodeURIComponent(city),
      language: language || 'unknown',
      ip: ip.split(',')[0].trim(),
      timestamp: now.toISOString(),
    });

    // Pipeline: increment counters + store visit
    await pipeline([
      ['INCR', `pageviews:${dateKey}`],
      ['INCR', `pageviews:${dateKey}:${cleanPage}`],
      ['LPUSH', 'visits', visitData],
      ['LTRIM', 'visits', '0', '999'],
      // Track unique pages set for the day
      ['SADD', `pages:${dateKey}`, cleanPage],
      ['EXPIRE', `pages:${dateKey}`, 2592000], // 30 days TTL
      ['EXPIRE', `pageviews:${dateKey}`, 2592000],
      ['EXPIRE', `pageviews:${dateKey}:${cleanPage}`, 2592000],
    ]);

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Track error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

function parseBrowser(ua) {
  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('Chrome/') && !ua.includes('Edg/')) return 'Chrome';
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
  if (ua.includes('Opera') || ua.includes('OPR/')) return 'Opera';
  return 'Other';
}
