// Builds index.html: the winter plan, encrypted behind a passcode.
//
//   PASSCODE='your passphrase here' node build.mjs
//   node build.mjs --plain      (unencrypted preview.html, for checking only; do not publish)
//
// Edit plan.json, run the build again, commit index.html.

import { webcrypto as crypto } from 'node:crypto';
import fs from 'node:fs';

const here = (f) => new URL(f, import.meta.url);
const plan = JSON.parse(fs.readFileSync(here('./plan.json'), 'utf8'));
const plain = process.argv.includes('--plain');
const passcode = process.env.PASSCODE;
if (!plain && !passcode) {
  console.error("Set a passcode first:  PASSCODE='four or more words' node build.mjs");
  process.exit(1);
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const pill = {
  calm: 'background:#DDEBDD;color:#1F4A2A',
  gentle: 'background:#E4E8EE;color:#2B3A4C',
  big: 'background:#F3D6CF;color:#7A2618',
  festive: 'background:#F8E7B8;color:#5E4300'
};
const rowBase = 'display:flex;gap:10px;align-items:baseline;';
const rowStyle = {
  school: rowBase,
  fun: rowBase,
  big: rowBase + 'background:#F8E3DE;border-radius:8px;padding:8px 10px;',
  idea: rowBase + 'border:1px dashed #6B7684;border-radius:8px;padding:8px 10px;'
};

const dayTile = (day, lines, bg, fg, border) =>
  `<div class="tile" style="background:${bg};color:${fg};${border ? 'border:1px solid #D9D2C1;' : ''}"><div class="tile-day">${day}</div><div class="tile-body">${lines.map(esc).join('<br>')}</div></div>`;

const weekCard = (w) => {
  const dad = w.who === 'dad';
  const chip = dad
    ? `<span class="chip" style="background:#DCE9F2;color:#17384F">Dad’s weekend · ${esc(w.weekend)}</span>`
    : `<span class="chip" style="background:#F6E3C8;color:#6B4108">Mum’s weekend · ${esc(w.weekend)}</span>`;
  const events = w.events.map((e) => `
      <div style="${rowStyle[e.kind]}">
        <div class="ev-day">${esc(e.day)}</div>
        <div class="ev-text">${e.tag ? `<span class="ev-tag">${esc(e.tag)}</span>` : ''}${esc(e.text)}</div>
      </div>`).join('');
  return `
  <article class="card">
    <div>
      <div class="eyebrow">${esc(w.num)}</div>
      <h3 class="card-title">${esc(w.dates)}</h3>
    </div>
    <div class="chips">${chip}<span class="chip" style="${pill[w.loadKind]}">${esc(w.load)}</span></div>
    ${w.note ? `<div class="note">${esc(w.note)}</div>` : ''}
    <div class="events">${events}</div>
    <div class="anchor">
      <div class="anchor-label">Outdoor anchor · ${esc(w.anchorDay)}</div>
      <div>${esc(w.anchorText)}</div>
      <div class="anchor-sub">Dark by about ${esc(w.sunset)}</div>
    </div>
  </article>`;
};

const sun = `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="#1F4A2A" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="18" cy="18" r="6"/><path d="M18 4v4M18 28v4M4 18h4M28 18h4M8.1 8.1l2.8 2.8M25.1 25.1l2.8 2.8M8.1 27.9l2.8-2.8M25.1 10.9l2.8-2.8"/></svg>`;
const dusk = `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="#1F4A2A" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 24h24"/><path d="M10 24a8 8 0 0 1 16 0"/><path d="M18 8v3M8.5 12.5l2 2M27.5 12.5l-2 2"/></svg>`;

const planHtml = `
<style>
  .wrap{max-width:1120px;margin:0 auto;padding:48px 24px 64px;box-sizing:border-box;display:flex;flex-direction:column;gap:40px}
  .eyebrow{font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#46607A}
  h1.title{margin:0;font-family:'Fraunces',Georgia,serif;font-weight:700;font-size:52px;line-height:1.1;color:#1B2B3C;text-wrap:balance}
  h2.sec{margin:0;font-family:'Fraunces',Georgia,serif;font-weight:600;font-size:28px;color:#1B2B3C}
  .lede{margin:0;max-width:720px;font-size:18px;color:#3A4654;text-wrap:pretty}
  section{display:flex;flex-direction:column;gap:16px}
  .tiles{display:flex;flex-wrap:wrap;gap:10px}
  .tile{flex:1 1 130px;border-radius:12px;padding:14px 14px 16px;box-sizing:border-box}
  .tile-day{font-weight:700;font-size:15px}
  .tile-body{font-size:14px}
  .small{margin:0;font-size:14px;color:#4A5563}
  .two{display:flex;flex-wrap:wrap;gap:16px}
  .panel{flex:1 1 340px;background:#fff;border:1px solid #D9D2C1;border-radius:16px;padding:24px;box-sizing:border-box;display:flex;flex-direction:column;gap:10px}
  .panel-head{display:flex;align-items:center;gap:12px}
  .panel h3{margin:0;font-family:'Fraunces',Georgia,serif;font-weight:600;font-size:22px;color:#1B2B3C}
  .panel p{margin:0;color:#3A4654}
  .cards{display:flex;flex-wrap:wrap;gap:16px;align-items:stretch}
  .card{flex:1 1 320px;max-width:100%;background:#fff;border:1px solid #D9D2C1;border-radius:16px;padding:22px;box-sizing:border-box;display:flex;flex-direction:column;gap:14px}
  .card-title{margin:4px 0 0;font-family:'Fraunces',Georgia,serif;font-weight:600;font-size:26px;color:#1B2B3C}
  .chips{display:flex;flex-wrap:wrap;gap:8px}
  .chip{font-size:13px;font-weight:600;padding:4px 10px;border-radius:999px}
  .note{font-size:13px;color:#4A5563}
  .events{display:flex;flex-direction:column;gap:8px}
  .ev-day{flex:0 0 56px;font-size:14px;font-weight:700;color:#1B2B3C}
  .ev-text{flex:1 1 auto;min-width:0;font-size:15px}
  .ev-tag{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#46607A;margin-right:6px}
  .anchor{margin-top:auto;background:#DDEBDD;color:#1F4A2A;border-radius:12px;padding:12px 14px;display:flex;flex-direction:column;gap:2px}
  .anchor-label{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase}
  .anchor-sub{font-size:13px}
  .ahead{background:#1B2B3C;color:#F6F3EC;border-radius:16px;padding:28px;gap:8px}
  .ahead h2{margin:0;font-family:'Fraunces',Georgia,serif;font-weight:600;font-size:26px}
  .ahead p{margin:0;font-size:17px;max-width:760px}
  footer.foot{font-size:13px;color:#4A5563;display:flex;flex-direction:column;gap:4px}
  @media (max-width:600px){h1.title{font-size:38px}.wrap{padding:32px 16px 48px}}
</style>
<div class="wrap">
  <header style="display:flex;flex-direction:column;gap:12px">
    <div class="eyebrow">${esc(plan.range)}</div>
    <h1 class="title">${esc(plan.title)}</h1>
    <p class="lede">Every week has its own card, so nothing arrives as a surprise. Two things stay the same all winter: a Saturday daylight adventure and a short Sunday stroll. The shortest day is Monday 21 December, and after that the light starts coming back.</p>
  </header>

  <section>
    <h2 class="sec">The shape of every week</h2>
    <div class="tiles">
      ${dayTile('Mon', ['With Dad', 'Indoor PE'], '#DCE9F2', '#17384F')}
      ${dayTile('Tue', ['With Dad'], '#DCE9F2', '#17384F')}
      ${dayTile('Wed', ['With Mum'], '#F6E3C8', '#6B4108')}
      ${dayTile('Thu', ['With Mum'], '#F6E3C8', '#6B4108')}
      ${dayTile('Fri', ['Outdoor PE', 'Piano 4pm', 'Weekend starts'], '#FFFFFF', '#1F2A37', true)}
      ${dayTile('Sat', ['Daylight adventure'], '#DDEBDD', '#1F4A2A')}
      ${dayTile('Sun', ['Short stroll'], '#DDEBDD', '#1F4A2A')}
    </div>
    <p class="small">Weekends alternate between Dad’s and Mum’s. The two outdoor anchors happen at both homes, so the rhythm stays the same wherever Ali is.</p>
  </section>

  <section>
    <h2 class="sec">The two weekend anchors</h2>
    <div class="two">
      <div class="panel">
        <div class="panel-head">${sun}<h3>Saturday daylight adventure</h3></div>
        <p>Out of the door by 11am, outside for 1½ to 2 hours, with a hot drink or snack at the end. Late morning is the brightest part of a short winter day, so it goes first.</p>
        <p class="small">Each weekly card suggests a place. Ali picks the adventure on his birthday weekend.</p>
      </div>
      <div class="panel">
        <div class="panel-head">${dusk}<h3>Sunday short stroll</h3></div>
        <p>About 30 minutes, leaving roughly an hour before sunset. Small and easy, so it still happens on a busy Sunday.</p>
        <p class="small">Each card shows roughly when it gets dark that week.</p>
      </div>
    </div>
  </section>

  <section>
    <h2 class="sec">Week by week</h2>
    <div class="cards">${plan.weeks.map(weekCard).join('')}
    </div>
  </section>

  <section class="ahead">
    <h2>Then it gets lighter</h2>
    <p>${esc(plan.lookingAhead)}</p>
  </section>

  <footer class="foot">
    <div>Sunset times are approximate, for Edinburgh and West Lothian. Weekends after 1 January follow the usual fortnight pattern.</div>
    <div>Items marked “Idea” are suggestions, not booked plans. Swap any of them freely.</div>
  </footer>
</div>`;

const head = `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Ali’s winter plan</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">`;

const baseCss = `
  html,body{margin:0}
  body{background:#F6F3EC;color:#1F2A37;font-family:'Inter',system-ui,sans-serif;font-size:16px;line-height:1.5}
`;

if (plain) {
  fs.writeFileSync(here('./preview.html'), `<!doctype html><html lang="en-GB"><head>${head}<style>${baseCss}</style></head><body>${planHtml}</body></html>`);
  console.log('Wrote preview.html (unencrypted, do not publish)');
  process.exit(0);
}

// --- encrypt (PBKDF2-SHA256 -> AES-256-GCM) ---
const ITER = 250000;
const b64 = (u8) => Buffer.from(u8).toString('base64');
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const km = await crypto.subtle.importKey('raw', new TextEncoder().encode(passcode), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' }, km, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(planHtml)));
const payload = { v: 1, iter: ITER, salt: b64(salt), iv: b64(iv), data: b64(ct) };

const shell = `<!doctype html>
<html lang="en-GB">
<head>
${head}
<style>${baseCss}
  .lock{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box}
  .lock-card{width:100%;max-width:400px;background:#fff;border:1px solid #D9D2C1;border-radius:16px;padding:32px;box-sizing:border-box;display:flex;flex-direction:column;gap:16px}
  .lock-card h1{margin:0;font-family:'Fraunces',Georgia,serif;font-weight:700;font-size:30px;line-height:1.15;color:#1B2B3C}
  .lock-card p{margin:0;color:#3A4654}
  .lock-card label{font-size:14px;font-weight:600;color:#1B2B3C}
  .lock-card input[type=password]{width:100%;box-sizing:border-box;font:inherit;font-size:18px;padding:12px 14px;border:1px solid #8A93A0;border-radius:10px;background:#fff;color:#1F2A37}
  .lock-card input[type=password]:focus-visible{outline:3px solid #46607A;outline-offset:1px}
  .lock-card button{font:inherit;font-weight:600;font-size:17px;min-height:48px;border:0;border-radius:10px;background:#1B2B3C;color:#F6F3EC;cursor:pointer}
  .lock-card button:focus-visible{outline:3px solid #46607A;outline-offset:2px}
  .lock-card button[disabled]{opacity:.6;cursor:default}
  .remember{display:flex;align-items:center;gap:10px;font-size:14px;color:#3A4654}
  .remember input{width:20px;height:20px}
  .err{min-height:22px;font-size:14px;color:#8A2F22;font-weight:600}
</style>
</head>
<body>
<main id="lock" class="lock">
  <form id="form" class="lock-card" autocomplete="off">
    <h1>Ali’s winter plan</h1>
    <p>Enter the family passcode to open it.</p>
    <div style="display:flex;flex-direction:column;gap:6px">
      <label for="pw">Passcode</label>
      <input id="pw" type="password" autocomplete="current-password" required>
    </div>
    <label class="remember"><input id="rem" type="checkbox"> Remember on this device</label>
    <div id="err" class="err" role="alert"></div>
    <button id="go" type="submit">Open</button>
  </form>
</main>
<div id="app" hidden></div>
<script>
(function () {
  var P = ${JSON.stringify(payload)};
  var KEY = 'ali-winter-plan-pass';
  var lock = document.getElementById('lock'), app = document.getElementById('app');
  var form = document.getElementById('form'), pw = document.getElementById('pw');
  var err = document.getElementById('err'), go = document.getElementById('go'), rem = document.getElementById('rem');

  function fromB64(s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); }

  async function decrypt(pass) {
    var km = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
    var key = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: fromB64(P.salt), iterations: P.iter, hash: 'SHA-256' },
      km, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    var buf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(P.iv) }, key, fromB64(P.data));
    return new TextDecoder().decode(buf);
  }

  function show(html) {
    app.innerHTML = html;
    app.hidden = false;
    lock.hidden = true;
    lock.style.display = 'none';
    window.scrollTo(0, 0);
  }

  function remember(pass) { try { localStorage.setItem(KEY, pass); } catch (e) {} }
  function forget() { try { localStorage.removeItem(KEY); } catch (e) {} }

  if (!window.crypto || !crypto.subtle) {
    err.textContent = 'This browser cannot unlock the page. Try opening the https link in a current browser.';
    go.disabled = true;
    return;
  }

  form.addEventListener('submit', async function (ev) {
    ev.preventDefault();
    err.textContent = '';
    go.disabled = true;
    go.textContent = 'Opening…';
    try {
      var html = await decrypt(pw.value);
      if (rem.checked) remember(pw.value); else forget();
      show(html);
    } catch (e) {
      err.textContent = 'That passcode did not work. Please try again.';
      go.disabled = false;
      go.textContent = 'Open';
      pw.select();
    }
  });

  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved) {
    decrypt(saved).then(show).catch(function () { forget(); });
  }
})();
</script>
</body>
</html>
`;

fs.writeFileSync(here('./index.html'), shell);
console.log('Wrote index.html (' + Math.round(shell.length / 1024) + ' KB), encrypted');
