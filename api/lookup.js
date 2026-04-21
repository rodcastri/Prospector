export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing name' });

  const key = process.env.GROQ_API_KEY;
  if (!key) return res.status(500).json({ error: 'GROQ_API_KEY not configured in Vercel' });

  const prompt = `Search the web RIGHT NOW for current information about this crypto influencer or KOL: "${name}"

Find their real, current data today and return ONLY this JSON (no markdown, no extra text):
{
  "name": "real name or channel name",
  "platform": "YouTube or Twitter/X or Telegram or Instagram or TikTok or Discord",
  "followers": "current count e.g. 2.1M",
  "niche": "specific niche e.g. crypto futures, BTC analysis",
  "country": "country or region",
  "language": "best language for email",
  "hasExistingDeal": true or false,
  "currentExchange": "exchange name or null",
  "email": "public email from bio/website or null"
}`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'compound-beta',
        messages: [
          {
            role: 'system',
            content: 'Search the web in real-time to find accurate current info about crypto influencers. Return valid JSON only.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 600
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.error?.message || 'Groq error ' + response.status });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
