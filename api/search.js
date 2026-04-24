module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.GROQ_API_KEY;
  if (!key) return res.status(500).json({ error: 'GROQ_API_KEY not configured' });

  const { cats, mkts } = req.body || {};

  // Simple direct prompt - no complex formatting
  const prompt = `List 8 real crypto influencers for ${(mkts||['global']).join(', ')} markets.
Type: ${(cats||['KOLs']).join(', ')}
Exclude: Canada, China, Hong Kong, Singapore, Iran, Cuba, North Korea

Return ONLY this JSON array with 8 items, no other text:
[{"name":"Coin Bureau","handle":"@coinbureau","platform":"YouTube","market":"EE.UU.","tier":1,"followers":"2.9M","engagement":"Alto 8%","niche":"crypto education futures","email":null,"hasExistingDeal":true,"currentExchange":"OKX","isGlobalBig":true,"reason":"Top global crypto educator","category":"mega"},{"name":"example2","handle":"@example2","platform":"Twitter/X","market":"India","tier":1,"followers":"500K","engagement":"Alto 5%","niche":"crypto trading signals","email":null,"hasExistingDeal":false,"currentExchange":null,"isGlobalBig":false,"reason":"Large Indian crypto audience","category":"kols"}]

Now generate 8 REAL ones. JSON only:`;

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 3000
      })
    });

    const groqData = await groqRes.json();

    if (!groqRes.ok) {
      return res.status(200).json({
        results: [],
        error: groqData.error?.message || 'Groq error ' + groqRes.status
      });
    }

    let text = groqData.choices?.[0]?.message?.content || '';
    
    // Clean
    text = text.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');

    if (start === -1 || end === -1) {
      return res.status(200).json({
        results: [],
        error: 'No JSON array in response',
        raw: text.slice(0, 300)
      });
    }

    try {
      const results = JSON.parse(text.slice(start, end + 1));
      return res.status(200).json({ results });
    } catch (e) {
      return res.status(200).json({
        results: [],
        error: 'JSON parse failed: ' + e.message,
        raw: text.slice(0, 300)
      });
    }

  } catch (err) {
    return res.status(500).json({ error: err.message, results: [] });
  }
}
