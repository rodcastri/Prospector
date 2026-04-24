module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const key = process.env.GROQ_API_KEY;
  
  if (!key) {
    return res.status(200).json({ 
      status: 'ERROR',
      message: 'GROQ_API_KEY no está configurada en Vercel'
    });
  }

  // Test 1: Simple call to llama (no web search)
  let simpleTest, compoundTest;

  try {
    const r1 = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'Reply with exactly: {"status":"ok"}' }],
        max_tokens: 50
      })
    });
    const d1 = await r1.json();
    simpleTest = {
      status: r1.ok ? 'OK' : 'ERROR',
      httpStatus: r1.status,
      response: d1.choices?.[0]?.message?.content || d1.error?.message || JSON.stringify(d1)
    };
  } catch(e) {
    simpleTest = { status: 'FETCH_ERROR', response: e.message };
  }

  // Test 2: Compound beta (web search)
  try {
    const r2 = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'compound-beta',
        messages: [{ role: 'user', content: 'What is 2+2? Reply with just the number.' }],
        max_tokens: 50
      })
    });
    const d2 = await r2.json();
    compoundTest = {
      status: r2.ok ? 'OK' : 'ERROR',
      httpStatus: r2.status,
      response: d2.choices?.[0]?.message?.content || d2.error?.message || JSON.stringify(d2)
    };
  } catch(e) {
    compoundTest = { status: 'FETCH_ERROR', response: e.message };
  }

  return res.status(200).json({
    keyConfigured: true,
    keyPrefix: key.slice(0, 8) + '...',
    llamaTest: simpleTest,
    compoundTest: compoundTest
  });
}
