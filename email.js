export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { kol, type } = req.body || {};
  if (!kol) return res.status(400).json({ error: 'Missing kol data' });

  const key = process.env.GROQ_API_KEY;
  if (!key) return res.status(500).json({ error: 'GROQ_API_KEY not configured' });

  // Detect language by market
  const langMap = {
    'Brasil': 'Brazilian Portuguese', 'Turquia': 'Turkish', 'Rusia': 'Russian',
    'Indonesia': 'Indonesian', 'Vietnam': 'Vietnamese', 'Arabia': 'Arabic',
    'Pakistan': 'Urdu', 'India': 'English', 'EE.UU.': 'English',
    'Nigeria': 'English', 'Filipinas': 'English', 'Argentina': 'Spanish',
    'LATAM': 'Spanish', 'Mexico': 'Spanish', 'Colombia': 'Spanish',
    'Europa': 'English', 'China': 'BLOCKED'
  };
  
  let lang = 'English';
  const market = kol.market || '';
  for (const [key2, val] of Object.entries(langMap)) {
    if (market.includes(key2)) { lang = val; break; }
  }

  const isRenegotiation = type === 're' || kol.hasExistingDeal;
  const exchange = kol.currentExchange || 'their current exchange';

  const prompt = isRenegotiation ? 
`Write a SHORT, HIGH-IMPACT business development email in ${lang} from Rodrigo at Bitunix (crypto futures exchange).

TARGET: ${kol.name} (${kol.platform}, ${kol.followers} followers, ${kol.niche} niche)
SITUATION: They currently promote ${exchange}. We want to win them over.

RULES:
- Start with something specific about THEIR content or audience (show you did research)
- NEVER mention exact commission % — say "significantly better terms than ${exchange}"
- Mention: daily USDT payouts, dedicated account manager, sub-affiliate commissions
- Create urgency: "expanding in ${market} this quarter"
- End with ONE specific question or clear CTA (15-min call)
- MAX 120 words in the body
- Subject line must be curiosity-driven, NOT generic
- Write in ${lang}

Return ONLY valid JSON: {"subject":"...","body":"..."}` 
:
`Write a SHORT, HIGH-IMPACT cold outreach email in ${lang} from Rodrigo at Bitunix (crypto futures exchange).

TARGET: ${kol.name} (${kol.platform}, ${kol.followers} followers, niche: ${kol.niche}, market: ${market})

RULES:
- Open with a SPECIFIC compliment about their content style or audience (1 sentence, not generic)
- NEVER mention exact commission % — use "conditions well above market rate (top partners avg $22K USD/month)"
- Highlight: 200x leverage, copy trading, daily USDT payouts, 18K+ global affiliates
- Create urgency: "prioritizing ${market} partnerships this quarter"  
- End with ONE clear CTA: 15-min intro call this week
- MAX 120 words in the body
- Subject line: specific, curiosity-driven, personalized
- Write in ${lang}

Return ONLY valid JSON: {"subject":"...","body":"...","language":"${lang}"}`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are an expert BD email copywriter. Write emails that get responses. Be specific, concise, and compelling. Return valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.error?.message || 'Groq error' });
    }

    const data = await response.json();
    let text = data.choices?.[0]?.message?.content || '';
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const s = text.indexOf('{'), e = text.lastIndexOf('}');
    if (s === -1) return res.status(200).json({ error: 'No JSON in response', text });
    
    const result = JSON.parse(text.slice(s, e + 1));
    result.detectedLanguage = lang;
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
