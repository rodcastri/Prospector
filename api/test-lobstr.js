export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const LOBSTR = process.env.LOBSTR_API_KEY;
  
  try {
    // Get available crawlers
    const r = await fetch('https://api.lobstr.io/v1/crawlers', {
      headers: {'Authorization': 'Token ' + LOBSTR}
    });
    const data = await r.json();
    const crawlers = data.results || data || [];
    const twitter = crawlers.filter(c => 
      (c.name||'').toLowerCase().includes('twitter') || 
      (c.slug||'').toLowerCase().includes('twitter')
    );
    return res.status(200).json({ 
      total: crawlers.length, 
      twitter,
      allNames: crawlers.map(c=>({hash:c.hash,name:c.name,slug:c.slug})).slice(0,20)
    });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}