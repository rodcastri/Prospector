export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.GROQ_API_KEY;
  if (!key) return res.status(500).json({ error: 'NO_API_KEY: GROQ_API_KEY not set in Vercel environment variables' });

  const { cats, mkts } = req.body || {};
  if (!cats || !mkts) return res.status(400).json({ error: 'MISSING_PARAMS: cats and mkts required' });

  const prompt = `You are a crypto business development expert. List 8 REAL crypto influencers for Bitunix futures exchange.

PARTNER TYPE: ${cats.join(', ')}
MARKETS: ${mkts.join(', ')}
EXCLUDE: Canada, China, Hong Kong, Singapore, Iran, Cuba, North Korea, Syria, Sudan

Return ONLY a JSON array. Start with [ end with ]. No text outside the array:
[{"name":"Coin Bureau","handle":"@coinbureau","platform":"YouTube","market":"EE.UU.","tier":1,"followers":"2.9M","engagement":"Alto 8%","niche":"crypto education futures","email":null,"hasExistingDeal":true,"currentExchange":"OKX","isGlobalBig":true,"reason":"Top global crypto educator focused on futures","category":"mega"}]

Generate 8 real KOLs now for markets: ${mkts.join(', ')}. JSON array only:`;

  let groqResponse, groqData, rawText;

  try {
    groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
  } catch (fetchErr) {
    return res.status(500).json({ error: `FETCH_FAILED: ${fetchErr.message}` });
  }

  try {
    groqData = await groqResponse.json();
  } catch (parseErr) {
    return res.status(500).json({ error: `GROQ_PARSE_FAILED: status=${groqResponse.status}` });
  }

  if (!groqResponse.ok) {
    return res.status(groqResponse.status).json({
      error: `GROQ_ERROR_${groqResponse.status}: ${groqData?.error?.message || JSON.stringify(groqData)}`
    });
  }

  rawText = groqData.choices?.[0]?.message?.content || '';

  if (!rawText) {
    return res.status(200).json({ error: 'GROQ_EMPTY_RESPONSE', results: [] });
  }

  // Clean markdown fences
  let cleaned = rawText.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  // Extract JSON array
  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');

  if (start === -1 || end === -1) {
    return res.status(200).json({
      error: `NO_JSON_ARRAY_FOUND`,
      raw: rawText.slice(0, 500),
      results: []
    });
  }

  try {
    const results = JSON.parse(cleaned.slice(start, end + 1));
    return res.status(200).json({ results, count: results.length });
  } catch (jsonErr) {
    return res.status(200).json({
      error: `JSON_PARSE_FAILED: ${jsonErr.message}`,
      raw: cleaned.slice(0, 500),
      results: []
    });
  }
}
