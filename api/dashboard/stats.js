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
    const now = new Date();
    const today = formatDate(now);
    const yesterday = formatDate(new Date(now - 86400000));

    // Get dates for this week (Monday to today)
    const weekDates = [];
    const dayOfWeek = now.getDay() || 7; // Sunday = 7
    for (let i = dayOfWeek - 1; i >= 0; i--) {
      weekDates.push(formatDate(new Date(now - i * 86400000)));
    }

    // Get dates for this month
    const monthDates = [];
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    for (let d = new Date(firstDay); d <= now; d.setDate(d.getDate() + 1)) {
      monthDates.push(formatDate(new Date(d)));
    }

    // Build pipeline commands
    const commands = [
      ['GET', `pageviews:${today}`],
      ['GET', `pageviews:${yesterday}`],
    ];

    // Week totals
    weekDates.forEach(function (date) {
      commands.push(['GET', `pageviews:${date}`]);
    });

    // Month totals
    monthDates.forEach(function (date) {
      commands.push(['GET', `pageviews:${date}`]);
    });

    // Today's pages
    commands.push(['SMEMBERS', `pages:${today}`]);

    const results = await pipeline(commands);

    const todayViews = parseInt(results[0].result) || 0;
    const yesterdayViews = parseInt(results[1].result) || 0;

    let weekViews = 0;
    for (let i = 0; i < weekDates.length; i++) {
      weekViews += parseInt(results[2 + i].result) || 0;
    }

    let monthViews = 0;
    const weekOffset = 2 + weekDates.length;
    for (let i = 0; i < monthDates.length; i++) {
      monthViews += parseInt(results[weekOffset + i].result) || 0;
    }

    const todayPages = results[results.length - 1].result || [];

    // Get page-level stats for today
    let pageStats = [];
    if (todayPages.length > 0) {
      const pageCommands = todayPages.map(function (page) {
        return ['GET', `pageviews:${today}:${page}`];
      });
      const pageResults = await pipeline(pageCommands);
      pageStats = todayPages.map(function (page, i) {
        return { page: page, views: parseInt(pageResults[i].result) || 0 };
      }).sort(function (a, b) { return b.views - a.views; });
    }

    // Daily breakdown for chart (last 7 days)
    var dailyCommands = [];
    var dailyLabels = [];
    for (var i = 6; i >= 0; i--) {
      var date = formatDate(new Date(now - i * 86400000));
      dailyCommands.push(['GET', `pageviews:${date}`]);
      dailyLabels.push(date);
    }
    var dailyResults = await pipeline(dailyCommands);
    var dailyData = dailyLabels.map(function (label, idx) {
      return { date: label, views: parseInt(dailyResults[idx].result) || 0 };
    });

    res.status(200).json({
      today: todayViews,
      yesterday: yesterdayViews,
      week: weekViews,
      month: monthViews,
      pageStats: pageStats,
      daily: dailyData,
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

function formatDate(d) {
  return d.toISOString().split('T')[0];
}
