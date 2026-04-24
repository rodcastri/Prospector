// Extracts email from YouTube channel About page
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { handle } = req.body || {};
  if (!handle) return res.status(400).json({ error: 'Missing handle' });

  const key = process.env.GROQ_API_KEY;
  if (!key) return res.status(500).json({ error: 'GROQ_API_KEY not configured' });

  // Clean handle
  const cleanHandle = handle.replace('@', '').trim();
  
  // Try to fetch YouTube channel page
  const urls = [
    `https://www.youtube.com/@${cleanHandle}/about`,
    `https://www.youtube.com/c/${cleanHandle}/about`,
    `https://www.youtube.com/${cleanHandle}/about`
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      
      if (!response.ok) continue;
      
      const html = await response.text();
      
      // Extract emails using regex
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const emails = html.match(emailRegex) || [];
      
      // Filter out YouTube's own emails and common false positives
      const filtered = [...new Set(emails)].filter(e => 
        !e.includes('youtube.com') &&
        !e.includes('google.com') &&
        !e.includes('example.com') &&
        !e.includes('sentry.io') &&
        !e.includes('w3.org') &&
        !e.includes('@2x') &&
        e.length < 60
      );
      
      if (filtered.length > 0) {
        return res.status(200).json({ 
          email: filtered[0], 
          all: filtered.slice(0, 3),
          source: 'youtube_about',
          url 
        });
      }
    } catch (e) {
      continue;
    }
  }

  // If no email found directly, ask Groq compound to search
  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'compound-beta',
        messages: [{
          role: 'user',
          content: `Search for the business/contact email of YouTube channel @${cleanHandle}. Look at their YouTube About page, their website, Twitter bio, and Telegram. Return ONLY the email address if found, or "not found" if not found. Nothing else.`
        }],
        temperature: 0.1,
        max_tokens: 100
      })
    });
    
    const groqData = await groqRes.json();
    const text = (groqData.choices?.[0]?.message?.content || '').trim();
    
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      return res.status(200).json({ email: emailMatch[0], source: 'groq_search' });
    }
  } catch (e) {}

  return res.status(200).json({ email: null, message: 'No email found' });
}
