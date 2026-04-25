export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.GROQ_API_KEY;
  if (!key) return res.status(500).json({ error: 'GROQ_API_KEY not configured' });

  const { name, handle, platform } = req.body || {};
  const query = handle || name;
  if (!query) return res.status(400).json({ error: 'Missing handle or name' });

  // Detect platform from handle context
  const cleanHandle = query.replace('@','').trim();
  const isYT = platform?.toLowerCase().includes('youtube');
  const isTG = platform?.toLowerCase().includes('telegram');

  try {
    // Use compound-beta to search for the actual profile data
    const prompt = `Search for the social media profile of crypto influencer "${cleanHandle}"${platform ? ' on '+platform : ''}.

Find their:
1. Exact follower/subscriber count
2. Main content niche (what they post about)
3. Which markets/countries their audience is from
4. Whether they promote any crypto exchange and which one
5. Their engagement rate if available
6. Their business email if publicly listed

Return ONLY this JSON (no other text):
{
  "name": "Full Name",
  "handle": "@${cleanHandle}",
  "platform": "YouTube/Twitter/Telegram",
  "followers": "XXK or XM",
  "engagement": "Alto X%",
  "niche": "specific niche description",
  "market": "Country/Region",
  "hasExistingDeal": false,
  "currentExchange": null,
  "email": null,
  "tier": 2,
  "isGlobalBig": false,
  "reason": "Why relevant for Bitunix futures outreach",
  "category": "kols",
  "verified": true
}`;

    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'compound-beta',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 600
      })
    });

    const data = await r.json();
    const text = (data.choices?.[0]?.message?.content || '').replace(/```json\n?/g,'').replace(/```\n?/g,'').trim();
    const s = text.indexOf('{'), e = text.lastIndexOf('}');
    if (s < 0) return res.status(200).json({ error: 'Profile not found', text: text.slice(0,200) });

    const profile = JSON.parse(text.slice(s, e+1));
    // Ensure handle has @ prefix
    if (profile.handle && !profile.handle.startsWith('@')) profile.handle = '@'+profile.handle;
    return res.status(200).json(profile);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}