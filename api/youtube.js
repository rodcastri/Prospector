export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { handle, name } = req.body || {};
  if (!handle && !name) return res.status(400).json({ error: 'Missing handle or name' });

  const key = process.env.GROQ_API_KEY;
  if (!key) return res.status(500).json({ error: 'GROQ_API_KEY not configured' });

  const cleanHandle = (handle || '').replace('@', '').trim();
  const displayName = name || cleanHandle;

  const extractEmail = (text) => {
    const matches = (text || '').match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    return matches.filter(e =>
      !e.includes('youtube.com') && !e.includes('google.com') &&
      !e.includes('example.com') && !e.includes('sentry.io') &&
      !e.includes('w3.org') && !e.includes('schema.org') &&
      !e.endsWith('.png') && !e.endsWith('.jpg') &&
      e.length < 80
    );
  };

  // 1. Try fetching YouTube about page
  const ytUrls = [
    `https://www.youtube.com/@${cleanHandle}/about`,
    `https://www.youtube.com/c/${cleanHandle}/about`,
    `https://www.youtube.com/user/${cleanHandle}/about`
  ];

  for (const url of ytUrls) {
    try {
      const r = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      if (!r.ok) continue;
      const html = await r.text();
      const emails = extractEmail(html);
      if (emails.length > 0) {
        return res.status(200).json({ email: emails[0], all: emails.slice(0,3), source: 'youtube_direct' });
      }
    } catch(e) { continue; }
  }

  // 2. Parallel Groq compound-beta searches
  const queries = [
    `Find the business contact email for YouTube creator "${displayName}" @${cleanHandle}. Search YouTube About page, their website, Twitter bio, Linktree. Return ONLY the email address or "not found".`,
    `Search web for: ${displayName} crypto youtuber contact email business inquiries. Return ONLY an email address if found, or "not found".`
  ];

  try {
    const results = await Promise.all(queries.map(q =>
      fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'compound-beta',
          messages: [{ role: 'user', content: q }],
          temperature: 0.1,
          max_tokens: 150
        })
      }).then(r => r.json()).catch(() => null)
    ));

    for (const data of results) {
      const text = data?.choices?.[0]?.message?.content || '';
      const emails = extractEmail(text);
      if (emails.length > 0) {
        return res.status(200).json({ email: emails[0], source: 'groq_compound' });
      }
    }
  } catch(e) {}

  // 3. Try llama knowledge base
  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: `Do you know the business or contact email for crypto YouTuber "${displayName}" (@${cleanHandle})? Return ONLY the email if you know it, or "unknown" if not.` }],
        temperature: 0.1,
        max_tokens: 100
      })
    });
    const data = await r.json();
    const text = data.choices?.[0]?.message?.content || '';
    const emails = extractEmail(text);
    if (emails.length > 0) {
      return res.status(200).json({ email: emails[0], source: 'llama_knowledge' });
    }
  } catch(e) {}

  return res.status(200).json({ email: null, message: 'No public email found. Paste manually.' });
}
