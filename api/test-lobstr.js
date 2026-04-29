export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const LOBSTR = process.env.LOBSTR_API_KEY;
  try {
    const r = await fetch('https://api.lobstr.io/v1/crawlers', {
      headers: { 'Authorization': 'Token ' + LOBSTR }
    });
    const raw = await r.json();
    return res.status(200).json({ raw, status: r.status });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}