// Drive headless Edge/Chrome over the DevTools protocol: wait for the page to settle, print console errors,
// optionally evaluate an expression and save a screenshot.
// node tools/shoot.mjs <url-or-path[?q][#hash]> [--out shot.png] [--size 1440x900] [--wait 30000]
//      [--until "<js expr>"] [--print "<js expr>"] [--settle 1500]
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };
const target = args[0];
if (!target) { console.error('usage: node tools/shoot.mjs <url> [--out f.png] [--size WxH] [--wait ms] [--until expr] [--print expr]'); process.exit(2); }
const [W, H] = opt('--size', '1440x900').split('x').map(Number);
const waitMs = Number(opt('--wait', 30000)), settle = Number(opt('--settle', 1500));
const until = opt('--until', "(()=>{const l=document.getElementById('loader');return !!l&&l.classList.contains('done')})()");
const out = opt('--out'), print = opt('--print');

function toUrl(t) {
  if (t.includes('://')) return t;
  const m = /^([^?#]*)(.*)$/.exec(t);
  return pathToFileURL(resolve(m[1])).href + m[2];
}

const exe = [String.raw`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`, String.raw`C:\Program Files\Google\Chrome\Application\chrome.exe`].find(existsSync);
if (!exe) { console.error('no Edge/Chrome found'); process.exit(2); }
const profile = mkdtempSync(join(tmpdir(), 'ph-shoot-'));
const port = 9300 + Math.floor(Math.random() * 500);
const browser = spawn(exe, ['--headless=new', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars', '--no-first-run',
  '--allow-file-access-from-files', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, `--window-size=${W},${H}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let code = 0;

try {
  let page;
  for (let i = 0; i < 100 && !page; i++) {
    try { page = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t => t.type === 'page'); } catch { await sleep(150); }
  }
  if (!page) throw new Error('browser did not start');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map();
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); return; }
    if (m.method === 'Runtime.exceptionThrown') {
      const d = m.params.exceptionDetails; code = 1;
      console.log(`EXCEPTION ${d.exception?.description || d.text} @ ${d.url || ''}:${d.lineNumber}`);
    }
    if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type)) {
      console.log(`CONSOLE.${m.params.type} ${m.params.args.map(a => a.value ?? a.description).join(' ')}`);
    }
  };
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  const evaluate = async expr => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result.value;

  await send('Runtime.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: W < 600 });
  await send('Page.navigate', { url: toUrl(target) });
  const t0 = Date.now();
  let ok = false;
  while (Date.now() - t0 < waitMs) {
    try { if (await evaluate(until)) { ok = true; break; } } catch { /* page still loading */ }
    await sleep(250);
  }
  if (!ok) { console.log(`TIMEOUT waiting for: ${until}`); code = 1; }
  await sleep(settle);
  if (print) console.log(await evaluate(print));
  if (out) {
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    mkdirSync(dirname(resolve(out)), { recursive: true });
    writeFileSync(out, Buffer.from(shot.data, 'base64'));
    console.log(resolve(out));
  }
  ws.close();
} catch (e) {
  console.log(`FAILED ${e.message}`); code = 1;
} finally {
  // Edge forks helpers; kill the whole tree or they pile up across runs.
  if (process.platform === 'win32') await new Promise(r => spawn('taskkill', ['/pid', String(browser.pid), '/T', '/F'], { stdio: 'ignore' }).on('exit', r));
  else browser.kill();
  await sleep(500);
  try { rmSync(profile, { recursive: true, force: true }); } catch { /* profile still locked; temp dir */ }
  process.exit(code);
}
