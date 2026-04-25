export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.GROQ_API_KEY;
  if (!key) return res.status(500).json({ error: 'GROQ_API_KEY not configured' });

  const { cats, mkts } = req.body || {};
  const catStr = (cats || ['KOLs futuros cripto']).join(', ');
  const mktStr = (mkts || ['Global']).join(', ');
  const excluded = 'Canada, China, Hong Kong, Singapore, North Korea, Cuba, Iran, Syria, Sudan';

  const promptLlama = `List 8 real crypto influencers for Bitunix futures exchange BD outreach.
Categories: ${catStr}
Markets: ${mktStr}  
Excluded: ${excluded}

Requirements: REAL people active NOW, focus on futures/leverage/signals/copy trading.
Include their known exchange deals. Mix tier 1 (1M+) and tier 2 (100K+).

Return ONLY this JSON array:
[{"name":"Coin Bureau","handle":"@coinbureau","platform":"YouTube","market":"EE.UU.","tier":1,"followers":"3.2M","engagement":"Alto 7%","niche":"crypto education futures","email":null,"hasExistingDeal":true,"currentExchange":"OKX","isGlobalBig":true,"reason":"Top crypto educator covering futures","category":"mega"}]

8 real creators for ${mktStr}. JSON only:`;

  const promptCompound = `Search web for active crypto futures/trading influencers in ${mktStr}.
Find real creators who make content about: ${catStr}
NOT from: ${excluded}

Search Twitter, YouTube, Telegram for crypto KOLs with 50K+ followers who cover futures trading or leverage trading in ${mktStr} markets.

Return ONLY JSON array with 5 people:
[{"name":"PersonName","handle":"@handle","platform":"YouTube","market":"${mkts?.[0]||'Global'}","tier":2,"followers":"300K","engagement":"Alto 5%","niche":"crypto futures signals","email":null,"hasExistingDeal":false,"currentExchange":null,"isGlobalBig":false,"reason":"Why relevant for Bitunix futures","category":"kols"}]
JSON only:`;

  try {
    const [llamaRes, compoundRes] = await Promise.allSettled([
      fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'Crypto BD expert. Return valid JSON only, no markdown.' },
            { role: 'user', content: promptLlama }
          ],
          temperature: 0.6,
          max_tokens: 3000
        })
      }).then(r => r.json()),

      fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'compound-beta',
          messages: [{ role: 'user', content: promptCompound }],
          temperature: 0.3,
          max_tokens: 3000
        })
      }).then(r => r.json())
    ]);

    const parse = (result) => {
      if (!result?.value) return [];
      const text = (result.value.choices?.[0]?.message?.content || '')
        .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const s = text.indexOf('['), e = text.lastIndexOf(']');
      if (s < 0 || e < 0) return [];
      try { return JSON.parse(text.slice(s, e + 1)); } catch { return []; }
    };

    const llamaKols = parse(llamaRes);
    const compoundKols = parse(compoundRes);

    const seen = new Set();
    const merged = [];
    [...compoundKols, ...llamaKols].forEach(k => {
      if (!k?.handle) return;
      const key2 = k.handle.toLowerCase().replace('@', '');
      if (!seen.has(key2)) { seen.add(key2); merged.push(k); }
    });

    if (!merged.length) return res.status(200).json({ error: 'No results', results: [] });
    return res.status(200).json({ results: merged.slice(0, 10) });

  } catch (err) {
    return res.status(500).json({ error: err.message, results: [] });
  }
}