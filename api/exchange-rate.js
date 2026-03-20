export default async function handler(req, res) {
  const base = req.query.base || 'USD';

  const allowed = [
    'USD', 'EUR', 'GBP', 'CHF', 'CAD', 'AUD', 'JPY', 'SEK', 'NOK', 'DKK',
    'RUB', 'SAR', 'AED', 'KWD', 'QAR', 'TRY'
  ];

  if (!allowed.includes(base)) {
    return res.status(400).json({ error: 'Invalid currency code' });
  }

  const API_KEY = process.env.EXCHANGE_RATE_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${base}`
    );
    const data = await response.json();

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=600');
    res.setHeader('Access-Control-Allow-Origin', 'https://gidiniz.blog');
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch exchange rates' });
  }
}
