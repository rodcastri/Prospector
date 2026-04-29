export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  const LOBSTR = process.env.LOBSTR_API_KEY;
  const CRAWLER_ID = '1b16ff414d27920fb325b68436dbf5fc';
  const { action, hash, query } = req.query || {};

  // ACTION: start — create a new squid
  if (action === 'start' || !action) {
    const q = query || 'crypto futures Nigeria';
    const url = 'https://x.com/search?q=' + encodeURIComponent(q) + '&f=user&src=typed_query';
    const r = await fetch('https://api.lobstr.io/v1/squids/', {
      method: 'POST',
      headers: { 'Authorization': 'Token ' + LOBSTR, 'Content-Type': 'application/json' },
      body: JSON.stringify({ crawler: CRAWLER_ID, inputs: [{ url }], limit: 20 })
    });
    const d = await r.json();
    return res.status(200).json({ status: r.status, squid: d, url });
  }

  // ACTION: check — get status of existing squid
  if (action === 'check' && hash) {
    const r = await fetch('https://api.lobstr.io/v1/squids/' + hash + '/', {
      headers: { 'Authorization': 'Token ' + LOBSTR }
    });
    const d = await r.json();
    return res.status(200).json({ squidStatus: d.status, squid: d });
  }

  // ACTION: results — download results of a squid
  if (action === 'results' && hash) {
    const r = await fetch('https://api.lobstr.io/v1/squids/' + hash + '/export/?format=json', {
      headers: { 'Authorization': 'Token ' + LOBSTR }
    });
    const text = await r.text();
    try {
      const data = JSON.parse(text);
      return res.status(200).json({ exportStatus: r.status, count: Array.isArray(data)?data.length:(data.data?.length||0), sample: JSON.stringify(data).slice(0,1000) });
    } catch(e) {
      return res.status(200).json({ exportStatus: r.status, rawText: text.slice(0,500) });
    }
  }

  return res.status(400).json({ error: 'Missing action param. Use ?action=start or ?action=check&hash=X or ?action=results&hash=X' });
}