module.exports = async function handler(req, res) {
  // This page receives the OAuth redirect from Google
  // Google sends the token in the URL hash (client-side only)
  // So we serve an HTML page that reads the hash and saves the token
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Conectando Gmail...</title>
<style>
body{background:#09090f;color:#eeeef5;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center;}
.spin{display:inline-block;width:32px;height:32px;border:3px solid rgba(127,255,106,0.2);border-top-color:#7fff6a;border-radius:50%;animation:sp 0.7s linear infinite;margin-bottom:1rem;}
@keyframes sp{to{transform:rotate(360deg);}}
</style>
</head>
<body>
<div>
  <div class="spin"></div>
  <div style="font-size:16px;color:#7fff6a;font-weight:600;margin-bottom:8px;">Conectando Gmail...</div>
  <div style="font-size:12px;color:rgba(238,238,245,0.5);">Redirigiendo a la app...</div>
</div>
<script>
var hash = window.location.hash || '';
if (hash && hash.indexOf('access_token') >= 0) {
  var params = new URLSearchParams(hash.replace('#',''));
  var token = params.get('access_token');
  var exp = Date.now() + parseInt(params.get('expires_in') || '3600') * 1000;
  if (token) {
    localStorage.setItem('bx_gt', token);
    localStorage.setItem('bx_ge', String(exp));
  }
}
setTimeout(function(){ window.location.href = '/'; }, 1000);
</script>
</body>
</html>`);
}
