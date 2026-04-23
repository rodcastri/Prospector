export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { cats, mkts } = req.body;
  if (!cats || !mkts) return res.status(400).json({ error: 'Missing cats or mkts' });

  const key = process.env.GROQ_API_KEY;
  if (!key) return res.status(500).json({ error: 'GROQ_API_KEY not configured in Vercel environment variables' });

  const catNames = cats.join(', ');
  const mktNames = mkts.join(', ');

  const prompt = `You are a crypto business development expert with knowledge of real crypto influencers.

Find 8 REAL crypto KOLs and influencers for Bitunix futures exchange outreach.

PARTNER TYPE: ${catNames}
TARGET MARKETS: ${mktNames}
EXCLUDE audiences mainly from: Canada, China, Hong Kong, Singapore, North Korea, Cuba, Iran, Syria, Sudan, Libya, Yemen, Afghanistan, Iraq, Myanmar

Requirements:
- Real influencers active on Twitter/X, YouTube, or Telegram
- Mix: some large (500K+ followers), some medium (50K-500K)  
- Check if they currently promote Binance, Bybit, or OKX
- Focus on futures/derivatives trading content

Return ONLY a valid JSON array, starting with [ and ending with ]. No text before or after:
[{"name":"Coin Bureau","handle":"@coinbureau","platform":"YouTube","market":"EE.UU.","tier":1,"followers":"2.9M","engagement":"Alto 8%","niche":"crypto education futures","email":null,"hasExistingDeal":true,"currentExchange":"OKX","isGlobalBig":true,"reason":"Top crypto educator globally with massive futures audience","category":"mega"}]

Now generate 8 real KOLs for markets: ${mktNames}, type: ${catNames}. JSON array only:`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'compound-beta',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 3000
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.error?.message || `Groq error ${response.status}` });
    }

    const data = await response.json();
    let text = data.choices?.[0]?.message?.content || '';
    text = text.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start === -1 || end === -1) return res.status(200).json({ results: [] });

    const results = JSON.parse(text.slice(start, end + 1));
    return res.status(200).json({ results });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
