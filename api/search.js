export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const YT_KEY = process.env.YOUTUBE_API_KEY;
  const APIFY_TOKEN = process.env.APIFY_TOKEN;
  const { markets=[], niches=[], platforms=[], dealFilter='nodeal' } = req.body || {};

  // Build search queries
  const nicheTerms = [];
  if (niches.includes('futures') || !niches.length) nicheTerms.push('crypto futures trading', 'bitcoin leverage trading');
  if (niches.includes('signals') || !niches.length) nicheTerms.push('crypto trading signals');
  if (niches.includes('education')) nicheTerms.push('crypto trading education');
  if (!nicheTerms.length) nicheTerms.push('crypto futures trading signals');

  const mktSuffix = {USA:'',UK:'UK',Europa:'europe',Nigeria:'Nigeria',India:'India',Vietnam:'Vietnam',Indonesia:'Indonesia',Filipinas:'Philippines',Pakistan:'Pakistan',Turquia:'Turkey',Global:''};
  const queries = [];
  const selectedMkts = markets.length ? markets.slice(0,2) : [''];
  selectedMkts.forEach(m => {
    const suffix = mktSuffix[m] || '';
    nicheTerms.slice(0,2).forEach(n => queries.push(suffix ? n+' '+suffix : n));
  });

  const results = [];
  const seen = new Set();

  // ── YOUTUBE DATA API v3 ──────────────────────────────────────────────────
  if (YT_KEY && (!platforms.length || platforms.includes('YouTube'))) {
    for (const query of queries.slice(0,3)) {
      try {
        const sr = await fetch('https://www.googleapis.com/youtube/v3/search?q='+encodeURIComponent(query)+'&type=channel&maxResults=15&relevanceLanguage=en&key='+YT_KEY);
        const sd = await sr.json();
        if (!sd.items?.length) continue;

        const ids = sd.items.map(i=>i.id?.channelId).filter(Boolean).join(',');
        if (!ids) continue;

        const dr = await fetch('https://www.googleapis.com/youtube/v3/channels?id='+ids+'&part=snippet,statistics&key='+YT_KEY);
        const dd = await dr.json();

        for (const ch of (dd.items||[])) {
          const subs = parseInt(ch.statistics?.subscriberCount||'0');
          const views = parseInt(ch.statistics?.viewCount||'0');
          const vidCount = parseInt(ch.statistics?.videoCount||'1');
          if (subs < 3000 || subs > 500000) continue;

          const rawHandle = ch.snippet?.customUrl || ch.id;
          const handle = rawHandle.startsWith('@') ? rawHandle : '@'+rawHandle;
          if (seen.has(handle)) continue;

          const bio = ((ch.snippet?.description||'')+' '+(ch.snippet?.title||'')).toLowerCase();
          const cryptoKws = ['crypto','bitcoin','futures','trading','btc','defi','leverage','signal','blockchain'];
          if (!cryptoKws.some(k=>bio.includes(k))) continue;
          if (bio.includes('bitunix')) continue;

          const exchKws = ['bybit','binance','okx','bitget','gate.io','kucoin','phemex','mexc','htx'];
          const hasDeal = exchKws.some(e=>bio.includes(e));
          const exchName = exchKws.find(e=>bio.includes(e))||null;
          if (dealFilter==='nodeal' && hasDeal) continue;
          if (dealFilter==='hasdeal' && !hasDeal) continue;

          const engRate = Math.min(((views/vidCount)/Math.max(subs,1)*100), 25).toFixed(1);
          const subsF = subs>=1000000?(subs/1000000).toFixed(1)+'M':Math.round(subs/1000)+'K';
          const types = [];
          if (bio.includes('futures')||bio.includes('leverage')||bio.includes('100x')) types.push('futures');
          if (bio.includes('signal')||bio.includes('copy')) types.push('signals');
          if (bio.includes('learn')||bio.includes('tutorial')||bio.includes('education')||bio.includes('course')) types.push('education');
          if (!types.length) types.push('education');

          seen.add(handle);
          results.push({
            name: ch.snippet?.title||handle,
            handle,
            platform:'YouTube',
            url:'https://youtube.com/'+handle,
            market: ch.snippet?.country||markets[0]||'Global',
            flag: getFlag(ch.snippet?.country||''),
            followers: subsF, folNum: subs,
            engagement: engRate+'%',
            niche: types[0],
            contentType: types,
            hasExistingDeal: hasDeal,
            currentExchange: exchName,
            reason: subsF+' subscribers · '+engRate+'% engagement'+( hasDeal?' · Deal '+exchName+' (switchable)':' · No exchange deal'),
            verified: true,
            source:'youtube_api'
          });
        }
      } catch(e) { continue; }
    }
  }

  // ── APIFY TWITTER ────────────────────────────────────────────────────────
  if (APIFY_TOKEN && APIFY_TOKEN !== 'PENDING' && (!platforms.length || platforms.includes('Twitter'))) {
    for (const query of queries.slice(0,2)) {
      try {
        const ar = await fetch(
          'https://api.apify.com/v2/acts/apidojo~twitter-user-scraper/run-sync-get-dataset-items?token='+APIFY_TOKEN+'&timeout=25',
          {method:'POST',headers:{'Content-Type':'application/json'},
           body:JSON.stringify({searchTerms:[query], maxItems:15, addUserInfo:true})}
        );
        if (!ar.ok) continue;
        const users = await ar.json();
        for (const u of (Array.isArray(users)?users:[])) {
          const flw = u.followersCount||u.followers_count||0;
          if (flw < 3000 || flw > 300000) continue;
          const handle = '@'+(u.userName||u.screen_name||'');
          if (seen.has(handle)||handle==='@') continue;
          const bio = (u.description||u.bio||'').toLowerCase();
          const cryptoKws = ['crypto','bitcoin','futures','trading','btc','leverage','signal','defi'];
          if (!cryptoKws.some(k=>bio.includes(k))) continue;
          if (bio.includes('bitunix')) continue;
          const exchKws = ['bybit','binance','okx','bitget','gate.io','kucoin'];
          const hasDeal = exchKws.some(e=>bio.includes(e));
          const exchName = exchKws.find(e=>bio.includes(e))||null;
          if (dealFilter==='nodeal' && hasDeal) continue;
          if (dealFilter==='hasdeal' && !hasDeal) continue;
          const flwF = flw>=1000000?(flw/1000000).toFixed(1)+'M':Math.round(flw/1000)+'K';
          const types=[];
          if (bio.includes('futures')||bio.includes('leverage')) types.push('futures');
          if (bio.includes('signal')||bio.includes('copy')) types.push('signals');
          if (!types.length) types.push('education');
          seen.add(handle);
          results.push({
            name: u.name||handle, handle,
            platform:'Twitter', url:'https://x.com/'+handle.replace('@',''),
            market: markets[0]||'Global', flag: getFlag(''),
            followers: flwF, folNum: flw,
            engagement: '6.0%',
            niche: types[0], contentType: types,
            hasExistingDeal: hasDeal, currentExchange: exchName,
            reason: flwF+' followers on Twitter'+( hasDeal?' · Deal '+exchName+' (can switch)':' · No exchange deal'),
            verified: true, source:'apify_twitter'
          });
        }
      } catch(e) { continue; }
    }
  }

  // Score and sort
  const scored = results.map(k=>{
    let s=0;
    const trading=['futures','signals','copy'];
    s += k.contentType.filter(c=>trading.includes(c)).length * 10;
    const eng = parseFloat(k.engagement);
    if(eng>=10)s+=20;else if(eng>=7)s+=15;else if(eng>=5)s+=10;else s+=5;
    if(!k.hasExistingDeal)s+=15;else s+=5;
    if(k.folNum>=5000&&k.folNum<=50000)s+=10;else if(k.folNum<200000)s+=5;
    return {...k, score:Math.max(1,Math.min(10,Math.round(s/8)))};
  });
  scored.sort((a,b)=>b.score!==a.score?b.score-a.score:b.folNum-a.folNum);

  return res.status(200).json({
    results: scored.slice(0,12),
    total: scored.length,
    hasYT: !!YT_KEY,
    hasApify: !!(APIFY_TOKEN&&APIFY_TOKEN!=='PENDING'),
    queries, source:'yt_apify_v4'
  });
}

function getFlag(cc){const f={US:'🇺🇸',GB:'🇬🇧',NG:'🇳🇬',IN:'🇮🇳',VN:'🇻🇳',ID:'🇮🇩',PH:'🇵🇭',PK:'🇵🇰',TR:'🇹🇷',DE:'🇩🇪',FR:'🇫🇷',BR:'🇧🇷'};return f[cc]||'🌐';}