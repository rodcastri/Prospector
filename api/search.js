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

  // Strict prompt - only real verified accounts with significant following
  const prompt = `You are a crypto industry expert. List ONLY real, well-known crypto influencers/KOLs that you are CERTAIN exist and are active.

Target markets: ${mktStr}
Content type: ${catStr}
Excluded countries: ${excluded}

STRICT REQUIREMENTS - only include if ALL are true:
- You are 100% certain this person EXISTS and their handle is CORRECT
- They have AT LEAST 100,000 followers/subscribers
- They create content specifically about crypto trading, futures, or crypto signals
- They are currently ACTIVE (posting in 2024/2025)
- They are NOT from excluded countries
- Prefer creators who already partner with exchanges (higher conversion)

GOOD examples: Coin Bureau (3M YT), DataDash (500K YT), InvestAnswers (450K YT), Ivan on Tech (500K YT), Crypto Lark (500K YT), Altcoin Daily (1.4M YT), BitBoy Crypto, Michaël van de Poppe, Rekt Capital, Crypto Banter, CryptosRUs

Return ONLY this JSON array with 8 entries. Use REAL verified handles:
[
  {"name":"Coin Bureau","handle":"@coinbureau","platform":"YouTube","market":"Global","tier":1,"followers":"3.2M","engagement":"Alto 7%","niche":"crypto education futures analysis","email":null,"hasExistingDeal":true,"currentExchange":"OKX","isGlobalBig":true,"reason":"Largest crypto education channel, covers futures extensively","category":"mega"},
  {"name":"Example2","handle":"@handle2","platform":"Twitter","market":"Turquia","tier":2,"followers":"250K","engagement":"Alto 5%","niche":"crypto futures signals Turkey","email":null,"hasExistingDeal":false,"currentExchange":null,"isGlobalBig":false,"reason":"Top Turkish crypto signals account","category":"signals"}
]

IMPORTANT: Only include creators you are CERTAIN about. Better to return 5 certain ones than 8 uncertain ones. Do NOT invent handles or people.

JSON only, no other text:`;

  try {
    // Primary: llama with strict prompt (fast, reliable knowledge)
    const llamaReq = fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a crypto industry expert. You only mention real people you are certain about. Return valid JSON arrays only, no markdown.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 3000
      })
    }).then(r => r.json());

    // Secondary: compound-beta for market-specific discovery
    const compoundReq = fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'compound-beta',
        messages: [{
          role: 'user',
          content: `Search for top crypto influencers in ${mktStr} with over 100K followers who create content about crypto futures trading or signals in 2024-2025. Find their exact social media handles on YouTube, Twitter, or Telegram. Return ONLY a JSON array of real verified accounts:
[{"name":"Name","handle":"@handle","platform":"YouTube","market":"${mkts?.[0]||'Global'}","tier":2,"followers":"200K","engagement":"Alto 5%","niche":"crypto futures","email":null,"hasExistingDeal":false,"currentExchange":null,"isGlobalBig":false,"reason":"Why they matter for Bitunix","category":"kols"}]
JSON only:`
        }],
        temperature: 0.1,
        max_tokens: 2000
      })
    }).then(r => r.json());

    const [llamaRes, compoundRes] = await Promise.allSettled([llamaReq, compoundReq]);

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

    // Merge: compound first (more current), then llama
    // Filter: minimum followers sanity check
    const seen = new Set();
    const merged = [];
    [...compoundKols, ...llamaKols].forEach(k => {
      if (!k?.handle || !k?.name) return;
      const key2 = k.handle.toLowerCase().replace('@', '');
      if (seen.has(key2)) return;
      // Basic follower sanity - skip obviously fake small accounts
      const fol = (k.followers || '0').replace(/[^0-9KMk.]/g, '');
      const folNum = fol.includes('M') ? parseFloat(fol)*1000000 :
                     fol.includes('K') || fol.includes('k') ? parseFloat(fol)*1000 :
                     parseFloat(fol) || 0;
      if (folNum < 50000 && folNum > 0) return; // Skip under 50K
      seen.add(key2);
      merged.push(k);
    });

    if (!merged.length) return res.status(200).json({ error: 'No results', results: [] });
    return res.status(200).json({ results: merged.slice(0, 10) });

  } catch (err) {
    return res.status(500).json({ error: err.message, results: [] });
  }
}