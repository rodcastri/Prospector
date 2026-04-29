export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const LOBSTR = process.env.LOBSTR_API_KEY;
  const CRAWLER_ID = '1b16ff414d27920fb325b68436dbf5fc';
  const log = [];

  try {
    // Step 1: Create squid
    const twitterUrl = 'https://x.com/search?q=crypto+futures+Nigeria&f=user&src=typed_query';
    log.push('Creating squid with URL: ' + twitterUrl);
    
    const squidRes = await fetch('https://api.lobstr.io/v1/squids/', {
      method: 'POST',
      headers: { 'Authorization': 'Token ' + LOBSTR, 'Content-Type': 'application/json' },
      body: JSON.stringify({ crawler: CRAWLER_ID, inputs: [{ url: twitterUrl }], limit: 10 })
    });
    const squid = await squidRes.json();
    log.push('Squid response status: ' + squidRes.status);
    log.push('Squid: ' + JSON.stringify(squid).slice(0, 300));

    if (!squid.hash) return res.status(200).json({ log, error: 'No hash' });

    // Step 2: Wait and poll status
    await new Promise(r => setTimeout(r, 8000));
    
    const statusRes = await fetch('https://api.lobstr.io/v1/squids/' + squid.hash + '/', {
      headers: { 'Authorization': 'Token ' + LOBSTR }
    });
    const status = await statusRes.json();
    log.push('Status: ' + JSON.stringify(status).slice(0, 300));

    // Step 3: Try to get results regardless of status
    const exportRes = await fetch('https://api.lobstr.io/v1/squids/' + squid.hash + '/export/?format=json', {
      headers: { 'Authorization': 'Token ' + LOBSTR }
    });
    const exportStatus = exportRes.status;
    const exportData = await exportRes.text();
    log.push('Export status: ' + exportStatus);
    log.push('Export data: ' + exportData.slice(0, 500));

    return res.status(200).json({ log, squidHash: squid.hash, squidStatus: status.status });
  } catch(e) {
    return res.status(500).json({ log, error: e.message });
  }
}