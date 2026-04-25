// Hybrid search: curated DB (verified) + compound-beta (dynamic discovery)
const SEED_DB = [
  // GLOBAL - MEGA (fallback for global searches)
  {name:"Coin Bureau",handle:"@coinbureau",platform:"YouTube",market:"Global",tier:1,followers:"3.2M",niche:"crypto education futures",hasExistingDeal:true,currentExchange:"OKX",isGlobalBig:true,reason:"Top crypto educator",category:"mega",tags:["global","edu","futures","mega"]},
  {name:"Rekt Capital",handle:"@rektcapital",platform:"Twitter",market:"Global",tier:1,followers:"400K",niche:"crypto TA cycles futures",hasExistingDeal:false,currentExchange:null,isGlobalBig:true,reason:"Most followed TA analyst",category:"signals",tags:["global","signals","futures"]},
  {name:"Crypto Banter",handle:"@CryptoBanter",platform:"YouTube",market:"Global",tier:1,followers:"900K",niche:"crypto trading live futures",hasExistingDeal:true,currentExchange:"Bybit",isGlobalBig:true,reason:"Live trading show huge futures audience",category:"mega",tags:["global","mega","futures","signals"]},
  {name:"Michaël van de Poppe",handle:"@CryptoMichNL",platform:"Twitter",market:"Europa Occidental",tier:1,followers:"700K",niche:"crypto futures trading",hasExistingDeal:true,currentExchange:"Bybit",isGlobalBig:true,reason:"Top European crypto futures trader",category:"kols",tags:["europa","futures","signals","global"]},
  {name:"Pentoshi",handle:"@Pentosh1",platform:"Twitter",market:"EE.UU.",tier:2,followers:"350K",niche:"crypto futures trading signals",hasExistingDeal:true,currentExchange:"Bybit",isGlobalBig:false,reason:"Active futures trader engaged community",category:"signals",tags:["eeuu","futures","signals"]},
  {name:"Scott Melker",handle:"@scottmelker",platform:"Twitter",market:"EE.UU.",tier:2,followers:"350K",niche:"crypto trading futures podcast",hasExistingDeal:false,currentExchange:null,isGlobalBig:false,reason:"Wolf of All Streets crypto podcast",category:"kols",tags:["eeuu","futures","edu"]},
  {name:"DataDash",handle:"@DataDash",platform:"YouTube",market:"EE.UU.",tier:2,followers:"500K",niche:"crypto futures technical analysis",hasExistingDeal:false,currentExchange:null,isGlobalBig:false,reason:"Deep TA futures-focused audience",category:"kols",tags:["eeuu","futures","edu"]},
  {name:"Crypto Kaleo",handle:"@CryptoKaleo",platform:"Twitter",market:"EE.UU.",tier:2,followers:"600K",niche:"crypto TA futures signals",hasExistingDeal:false,currentExchange:null,isGlobalBig:false,reason:"High accuracy TA calls",category:"signals",tags:["eeuu","signals","futures"]},
  // MID-TIER USA
  {name:"Crypto Tony",handle:"@CryptoTony__",platform:"Twitter",market:"EE.UU.",tier:2,followers:"180K",niche:"crypto futures trading",hasExistingDeal:false,currentExchange:null,isGlobalBig:false,reason:"Active futures trader mid-tier strong community",category:"signals",tags:["eeuu","futures","signals"]},
  {name:"Credible Crypto",handle:"@CredibleCrypto",platform:"Twitter",market:"EE.UU.",tier:2,followers:"280K",niche:"crypto Elliott Wave futures",hasExistingDeal:false,currentExchange:null,isGlobalBig:false,reason:"Elliott Wave specialist popular in futures community",category:"signals",tags:["eeuu","signals","futures"]},
  {name:"Crypto Chase",handle:"@ChaseNugentFX",platform:"Twitter",market:"EE.UU.",tier:2,followers:"120K",niche:"crypto futures trading signals",hasExistingDeal:false,currentExchange:null,isGlobalBig:false,reason:"Mid-tier futures trader high engagement",category:"signals",tags:["eeuu","futures","signals"]},
  {name:"Elliot Wainman",handle:"@ElliotTrades",platform:"Twitter",market:"EE.UU.",tier:2,followers:"160K",niche:"crypto trading altcoins futures",hasExistingDeal:false,currentExchange:null,isGlobalBig:false,reason:"Active altcoin futures trader",category:"kols",tags:["eeuu","futures","kols"]},
  {name:"Crypto Rover",handle:"@crypto_rover",platform:"Twitter",market:"EE.UU.",tier:2,followers:"90K",niche:"crypto news signals daily",hasExistingDeal:false,currentExchange:null,isGlobalBig:false,reason:"Daily crypto signals accessible mid-tier",category:"signals",tags:["eeuu","signals","news"]},
  {name:"Bluntz Capital",handle:"@Bluntz_Capital",platform:"Twitter",market:"EE.UU.",tier:2,followers:"200K",niche:"crypto Elliott Wave Bitcoin futures",hasExistingDeal:false,currentExchange:null,isGlobalBig:false,reason:"Known for accurate wave analysis futures",category:"signals",tags:["eeuu","signals","futures"]},
  {name:"Byzantine General",handle:"@ByzGeneral",platform:"Twitter",market:"EE.UU.",tier:2,followers:"140K",niche:"crypto macro on-chain futures",hasExistingDeal:false,currentExchange:null,isGlobalBig:false,reason:"On-chain meets futures analysis",category:"signals",tags:["eeuu","signals","futures","funds"]},
  // TURQUIA MID
  {name:"Satoshi Sinem",handle:"@SatoshiSinem",platform:"Twitter",market:"Turquia",tier:2,followers:"180K",niche:"crypto trading Turkish",hasExistingDeal:true,currentExchange:"Binance",isGlobalBig:false,reason:"Leading Turkish crypto voice",category:"kols",tags:["turquia","kols","signals"]},
  {name:"Crypto TR",handle:"@CryptoTR_",platform:"YouTube",market:"Turquia",tier:2,followers:"85K",niche:"crypto futures Turkish education",hasExistingDeal:false,currentExchange:null,isGlobalBig:false,reason:"Growing Turkish futures channel",category:"edu",tags:["turquia","edu","futures"]},
  {name:"Bitcoin TR",handle:"@bitcointr_",platform:"Twitter",market:"Turquia",tier:2,followers:"120K",niche:"Bitcoin crypto Turkish",hasExistingDeal:false,currentExchange:null,isGlobalBig:false,reason:"Active Turkish Bitcoin community",category:"kols",tags:["turquia","kols","edu"]},
  // BRASIL MID
  {name:"Criptomaniaco",handle:"@CriptomaniakoBR",platform:"YouTube",market:"Brasil",tier:2,followers:"650K",niche:"crypto trading Brazilian",hasExistingDeal:false,currentExchange:null,isGlobalBig:false,reason:"Top Brazilian crypto channel",category:"kols",tags:["brasil","kols","news"]},
  {name:"Fernando Ulrich",handle:"@FernandoUlrich",platform:"Twitter",market:"Brasil",tier:2,followers:"200K",niche:"Bitcoin economics Portuguese",hasExistingDeal:false,currentExchange:null,isGlobalBig:false,reason:"Most respected Bitcoin voice Brazil",category:"edu",tags:["brasil","edu","funds"]},
  {name:"Cryptomanual BR",handle:"@cryptomanual",platform:"YouTube",market:"Brasil",tier:2,followers:"95K",niche:"crypto futures trading Portuguese",hasExistingDeal:false,currentExchange:null,isGlobalBig:false,reason:"Mid-tier Brazilian futures educator",category:"kols",tags:["brasil","kols","futures"]},
  // LATAM MID
  {name:"Bit2Me",handle:"@Bit2Me_es",platform:"YouTube",market:"LATAM general",tier:2,followers:"250K",niche:"crypto education Spanish",hasExistingDeal:false,currentExchange:null,isGlobalBig:false,reason:"Spanish crypto education leader",category:"edu",tags:["latam","edu","b2b"]},
  {name:"Crypto Hispano",handle:"@CryptoHispano_",platform:"Twitter",market:"LATAM general",tier:2,followers:"70K",niche:"crypto futures Spanish signals",hasExistingDeal:false,currentExchange:null,isGlobalBig:false,reason:"Mid-tier Spanish futures signals",category:"signals",tags:["latam","signals","futures"]},
  {name:"Crypto Argentina",handle:"@CryptoArgentina",platform:"Twitter",market:"Argentina",tier:2,followers:"55K",niche:"crypto trading Argentina",hasExistingDeal:false,currentExchange:null,isGlobalBig:false,reason:"Active Argentine crypto community",category:"kols",tags:["latam","kols","news"]},
  // INDIA MID
  {name:"Crypto Dost",handle:"@CryptoDost_",platform:"YouTube",market:"India",tier:2,followers:"180K",niche:"crypto trading Hindi education",hasExistingDeal:false,currentExchange:null,isGlobalBig:false,reason:"Popular Hindi crypto education channel",category:"edu",tags:["india","edu","kols"]},
  {name:"Altcoin Buzz India",handle:"@AltcoinBuzzIO",platform:"YouTube",market:"India",tier:2,followers:"320K",niche:"crypto altcoins India",hasExistingDeal:false,currentExchange:null,isGlobalBig:false,reason:"Large Indian crypto audience",category:"kols",tags:["india","kols","edu"]},
  // VIETNAM MID
  {name:"Crypto Vietnam",handle:"@CryptoVietnam_",platform:"Telegram",market:"Vietnam",tier:2,followers:"120K",niche:"crypto futures Vietnamese",hasExistingDeal:false,currentExchange:null,isGlobalBig:false,reason:"Main Vietnamese crypto futures group",category:"signals",tags:["vietnam","signals","futures"]},
  // RUSIA MID
  {name:"Lex Moskovski",handle:"@mskvsk",platform:"Twitter",market:"Rusia / CEI",tier:2,followers:"120K",niche:"crypto on-chain Russian institutional",hasExistingDeal:false,currentExchange:null,isGlobalBig:false,reason:"Top Russian crypto analyst",category:"funds",tags:["rusia","funds","edu"]},
  {name:"Crypto Rus",handle:"@CryptoRus_",platform:"Telegram",market:"Rusia / CEI",tier:2,followers:"200K",niche:"crypto signals futures Russian",hasExistingDeal:false,currentExchange:null,isGlobalBig:false,reason:"Active Russian futures signals group",category:"signals",tags:["rusia","signals","futures"]},
  // EUROPA DEL ESTE MID
  {name:"Crypto PL",handle:"@CryptoPL_",platform:"Twitter",market:"Europa del Este",tier:2,followers:"65K",niche:"crypto futures Polish",hasExistingDeal:false,currentExchange:null,isGlobalBig:false,reason:"Growing Polish crypto futures community",category:"kols",tags:["europa","kols","futures"]},
  // FILIPINAS MID
  {name:"Crypto OFW",handle:"@CryptoOFW",platform:"YouTube",market:"Filipinas",tier:2,followers:"220K",niche:"crypto trading Filipino",hasExistingDeal:false,currentExchange:null,isGlobalBig:false,reason:"Top Filipino crypto channel",category:"edu",tags:["filipinas","edu","kols"]},
  // NIGERIA MID
  {name:"Crypto Africa",handle:"@CryptoAfricaNG",platform:"Twitter",market:"Nigeria",tier:2,followers:"80K",niche:"crypto trading Africa",hasExistingDeal:false,currentExchange:null,isGlobalBig:false,reason:"Top Nigerian crypto voice",category:"kols",tags:["nigeria","kols","news"]},
  // PROP / FONDOS
  {name:"FTMO Official",handle:"@FTMO_com",platform:"Twitter",market:"Global",tier:1,followers:"200K",niche:"prop trading funded accounts",hasExistingDeal:false,currentExchange:null,isGlobalBig:false,reason:"World top prop firm community",category:"prop",tags:["global","prop","funds"]},
  {name:"Funded Trader",handle:"@TheFundedTrader",platform:"Twitter",market:"EE.UU.",tier:2,followers:"80K",niche:"prop trading crypto futures",hasExistingDeal:false,currentExchange:null,isGlobalBig:false,reason:"Popular prop firm crypto traders",category:"prop",tags:["eeuu","prop","futures"]},
  // COPY TRADING
  {name:"Crypto Signals Group",handle:"@CryptoSignals",platform:"Telegram",market:"Global",tier:2,followers:"500K",niche:"crypto futures signals copy",hasExistingDeal:true,currentExchange:"Binance",isGlobalBig:false,reason:"Largest crypto signals Telegram",category:"signals",tags:["global","signals","copy","futures"]},
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.GROQ_API_KEY;
  if (!key) return res.status(500).json({ error: 'GROQ_API_KEY not configured' });

  const { cats, mkts } = req.body || {};
  const catKeys = (cats || []).map(c => c.toLowerCase());
  const mktNames = (mkts || []).map(m => m.toLowerCase());

  // Map market names to tags
  const mktMap = {
    'eeuu': m => m.includes('ee.uu') || m.includes('estad') || m.includes('usa'),
    'turquia': m => m.includes('turqu'),
    'brasil': m => m.includes('brasil'),
    'india': m => m.includes('india'),
    'vietnam': m => m.includes('vietnam'),
    'rusia': m => m.includes('rusia') || m.includes('cei'),
    'latam': m => m.includes('argent') || m.includes('latam') || m.includes('colombia') || m.includes('mexico'),
    'filipinas': m => m.includes('filipo'),
    'indonesia': m => m.includes('indo'),
    'nigeria': m => m.includes('nigeria') || m.includes('africa'),
    'europa': m => m.includes('europa'),
    'pakistan': m => m.includes('pakis'),
  };
  const mktTags = Object.keys(mktMap).filter(tag => mktNames.some(mktMap[tag]));
  if (!mktTags.length) mktTags.push('global');

  // Map category names to tags
  const catMap = {
    'kols': c => c.includes('kol') || c.includes('futuro'),
    'mega': c => c.includes('mega') || c.includes('global'),
    'funds': c => c.includes('fondo') || c.includes('fund'),
    'prop': c => c.includes('prop'),
    'signals': c => c.includes('senal') || c.includes('signal'),
    'edu': c => c.includes('educ'),
    'copy': c => c.includes('copy'),
    'b2b': c => c.includes('b2b') || c.includes('partner'),
  };
  const catTags = Object.keys(catMap).filter(tag => catKeys.some(catMap[tag]));
  if (!catTags.length) catTags.push('kols', 'signals', 'futures');

  // Score curated DB
  const scored = SEED_DB.map(k => {
    let score = 0;
    const kTags = k.tags || [];
    if (kTags.includes('global')) score += 3;
    mktTags.forEach(mt => { if (kTags.includes(mt)) score += 12; });
    catTags.forEach(ct => { if (kTags.includes(ct) || k.category === ct) score += 6; });
    // Prefer mid-tier (more accessible)
    score += k.tier === 2 ? 4 : 2;
    if (!k.hasExistingDeal) score += 3;
    score += Math.random() * 3; // variety
    return { ...k, _score: score };
  });
  scored.sort((a, b) => b._score - a._score);
  const seedResults = scored.filter(k => k._score > 3).slice(0, 6);

  // Dynamic discovery with compound-beta (finds NEW accounts)
  const mktLabel = mkts?.slice(0,2).join(' and ') || 'global';
  const nicheFocus = catTags.includes('futures') ? 'crypto futures leverage trading' : catTags.includes('signals') ? 'crypto trading signals' : catTags.includes('prop') ? 'prop trading funded accounts' : 'crypto trading';
  
  let compoundResults = [];
  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'compound-beta',
        messages: [{
          role: 'user',
          content: `Search Twitter, YouTube, and Telegram right now for ACTIVE ${nicheFocus} influencers in ${mktLabel} with between 15,000 and 300,000 followers/subscribers. Find accounts that are NOT super famous - mid-tier creators who post regularly in 2025 about crypto futures or trading. I need their exact verified username handles.

Return ONLY a JSON array of 4 people you actually found in search results:
[{"name":"Real Name","handle":"@exacthandle","platform":"Twitter","market":"${mkts?.[0]||'Global'}","tier":2,"followers":"45K","engagement":"Alto 7%","niche":"${nicheFocus}","email":null,"hasExistingDeal":false,"currentExchange":null,"isGlobalBig":false,"reason":"Why they fit Bitunix futures outreach","category":"signals"}]
JSON only:`
        }],
        temperature: 0.1,
        max_tokens: 1500
      })
    });
    const data = await r.json();
    const text = (data.choices?.[0]?.message?.content || '').replace(/```json\n?/g,'').replace(/```\n?/g,'').trim();
    const s = text.indexOf('['), e = text.lastIndexOf(']');
    if (s >= 0 && e > s) {
      const parsed = JSON.parse(text.slice(s, e+1));
      compoundResults = parsed.filter(k => k?.handle && k?.name && k.handle.startsWith('@'));
    }
  } catch(e) {}

  // Merge: compound first (fresh), then seed
  const seen = new Set();
  const merged = [];
  [...compoundResults, ...seedResults].forEach(k => {
    if (!k?.handle) return;
    const key2 = k.handle.toLowerCase().replace('@','');
    if (!seen.has(key2)) { seen.add(key2); merged.push(k); }
  });

  const results = merged.slice(0, 10).map(({ _score, tags, ...k }) => ({ ...k, email: k.email || null }));
  return res.status(200).json({ results, dynamic: compoundResults.length, curated: seedResults.length });
}