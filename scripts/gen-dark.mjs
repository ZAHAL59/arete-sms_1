// Builds src/dark.css — the dark-mode palette — from the colours the app actually uses.
// Re-run after adding new hard-coded colours:   node scripts/gen-dark.mjs
import fs from 'fs'; import path from 'path';

const SRC = new URL('../src/', import.meta.url).pathname;
const files = []; (function walk(d) { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); if (f.isDirectory()) walk(p); else if (/\.(jsx?|html)$/.test(f.name)) files.push(p); } })(SRC);
const text = files.map(f => fs.readFileSync(f, 'utf8')).join('\n') + fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

/* ───── colour helpers ───── */
const hex2rgb = h => { h = h.replace('#', ''); if (h.length === 3) h = [...h].map(c => c + c).join(''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); };
const rgb2hsl = ([r, g, b]) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let h = 0, s = 0; if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [h, s, l]; };
const hsl2hex = ([h, s, l]) => { const f = n => { const k = (n + h / 30) % 12, a = s * Math.min(l, 1 - l); return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))).toString(16).padStart(2, '0'); }; return '#' + f(0) + f(8) + f(4); };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rgba = (hex, a) => { const [r, g, b] = hex2rgb(hex); return `rgba(${r},${g},${b},${+a.toFixed(3)})`; };
const hslToRgbStr = ([h, s, l], a) => rgba(hsl2hex([h, s, l]), a);

// explicit choices for the greys that carry the page hierarchy (page darkest → card → raised/subtle)
const BG = { '#FFFFFF': '#1B1B1F', '#FFF': '#1B1B1F', '#F4F4F5': '#0F0F11', '#FAFAFA': '#202025', '#F9F9F9': '#212126', '#F8F8F8': '#222227', '#F6F6F7': '#27272C', '#F5F5F5': '#27272C', '#F2F2F2': '#2A2A30', '#F1F1F1': '#2A2A30', '#EEE': '#2E2E34', '#EEEEEE': '#2E2E34', '#EBEBEB': '#2E2E34', '#E4E4E4': '#2E2E34' };
const NEUTRAL_HUE = 240;

function darkBg(hex, alpha) {
  const H = hex.toUpperCase(); const [h, s, l] = rgb2hsl(hex2rgb(H));
  if (BG[H]) return alpha != null ? rgba(BG[H], alpha) : BG[H];
  if (l < 0.7) return null;                                                 // solid brand/semantic colours stay as they are
  if (s < 0.12) return hsl2hex([NEUTRAL_HUE, 0.05, clamp(0.105 + (1 - l) * 0.85, 0.1, 0.3)]);
  const a = clamp(0.08 + (1 - l) * 1.9, 0.08, 0.36) * (alpha ?? 1);          // tinted fills become a soft glow of the same hue
  return hslToRgbStr([h, 0.72, 0.55], a);
}
function darkText(hex) {
  const [h, s, l] = rgb2hsl(hex2rgb(hex));
  if (s < 0.12) { if (l > 0.93) return null; return hsl2hex([NEUTRAL_HUE, 0.04, clamp(1.002 - 0.777 * l, 0.47, 0.95)]); }
  if (l >= 0.62) return null;
  return hsl2hex([h, clamp(s + 0.04, 0.5, 0.9), clamp(0.62 + (0.5 - l) * 0.2, 0.62, 0.74)]);   // dark coloured text → lighter shade of the same hue
}
function darkBorder(hex, alpha) {
  const [h, s, l] = rgb2hsl(hex2rgb(hex));
  if (l < 0.6) return null;
  if (s < 0.12) return hsl2hex([NEUTRAL_HUE, 0.05, clamp(0.085 + (1 - l) * 0.92, 0.1, 0.4)]);
  return hslToRgbStr([h, 0.7, 0.55], clamp(0.2 + (1 - l) * 1.5, 0.2, 0.5) * (alpha ?? 1));
}

/* ───── collect what the app uses ───── */
const esc = s => s.replace(/([^a-zA-Z0-9_-])/g, '\\$1');
const rules = new Map();   // selector → declaration
const VAR = { hover: ':hover', focus: ':focus', 'focus-within': ':focus-within', last: ':last-child', first: ':first-child', disabled: ':disabled', placeholder: '::placeholder' };
const unsupported = new Set(); const PROP = { bg: 'background-color', text: 'color', border: 'border-color', divide: 'border-color', ring: '--tw-ring-color', outline: 'outline-color', accent: 'accent-color', caret: 'caret-color', decoration: 'text-decoration-color', placeholder: 'color', fill: 'fill', stroke: 'stroke' };

const tokRe = /(?<![\w-])((?:[a-z0-9-]+:)*)(bg|text|border|divide|ring|outline|accent|caret|decoration|placeholder|fill|stroke)-\[(#[0-9a-fA-F]{3,8})\](?:\/(\d{1,3}))?/g;
for (const m of text.matchAll(tokRe)) {
  const [full, variants, kind, hex, op] = m; let value;
  const alpha = op ? +op / 100 : undefined; const base = hex.length > 7 ? hex.slice(0, 7) : hex;
  value = kind === 'bg' ? darkBg(base, alpha) : (kind === 'text' || kind === 'placeholder') ? darkText(base) : kind === 'accent' ? null : darkBorder(base, alpha);
  if (kind === 'text' && alpha != null && value) value = rgba(value, alpha);
  if (!value) continue;
  let sfx = '', ok = true; for (const v of variants.split(':').filter(Boolean)) { if (VAR[v]) sfx += VAR[v]; else { unsupported.add(v); ok = false; } }
  if (!ok) continue;
  const cls = '.' + esc(full.replace(/^\s+/, ''));
  rules.set(`html.dark ${cls}${sfx}`, `${PROP[kind]}:${value}`);
}
// plain white backgrounds
for (const m of text.matchAll(/(?<![\w-])((?:[a-z0-9-]+:)*)bg-white(?![\w\/-])/g)) {
  let sfx = '', ok = true; for (const v of m[1].split(':').filter(Boolean)) { if (VAR[v]) sfx += VAR[v]; else { unsupported.add(v); ok = false; } }
  if (ok) rules.set(`html.dark .${esc(m[0])}${sfx}`, `background-color:${BG['#FFFFFF']}`);
}
// the "divide" utilities colour the lines BETWEEN children
for (const k of [...rules.keys()]) if (/\.divide-/.test(k)) { const v = rules.get(k); rules.delete(k); rules.set(k.replace(/(\.divide-[^ ]+)$/, '$1 > :not([hidden]) ~ :not([hidden])'), v); }

/* ───── inline styles (React writes them as  color: rgb(…) ) — covers EVERY hex colour found anywhere in the source,
         including ones that come from data objects (timetable tints, menu colours, default props…) ───── */
const allHex = new Set((text.match(/#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b/g) || []).map(h => { h = h.toUpperCase(); return h.length === 4 ? '#' + [...h.slice(1)].map(c => c + c).join('') : h; }));
const lines = [];
for (const hex of [...allHex].sort()) {
  const [r, g, b] = hex2rgb(hex); const rgb = `rgb(${r}, ${g}, ${b})`;
  const t = darkText(hex), bg = darkBg(hex), bd = darkBorder(hex);
  if (t) lines.push(`html.dark [style^="color: ${rgb}"],\nhtml.dark [style*="; color: ${rgb}"]{color:${t} !important}`);
  if (bg) lines.push(`html.dark [style*="background: ${rgb}"],\nhtml.dark [style*="background-color: ${rgb}"]{background-color:${bg} !important}`);
  if (bd) lines.push(`html.dark [style*="solid ${rgb}"],\nhtml.dark [style*="border-color: ${rgb}"]{border-color:${bd} !important}`);
}

/* ───── write the stylesheet ───── */
const head = `/* ============================================================================
   DARK MODE — generated by scripts/gen-dark.mjs from the colours used in src/.
   Applies when <html class="dark">. Do not edit by hand; re-run the script.
   Palette: neutral charcoal (page #0F0F11 → card #1B1B1F → raised #222227), crimson kept as the accent.
   ============================================================================ */
@media screen {
html.dark { color-scheme: dark; }
html.dark body { background:#0F0F11; color:#E8E8EC; }
html.dark ::selection { background:rgba(240,82,93,.35); }
html.dark ::-webkit-scrollbar { width:11px; height:11px; }
html.dark ::-webkit-scrollbar-track { background:transparent; }
html.dark ::-webkit-scrollbar-thumb { background:#34343A; border-radius:8px; border:3px solid #0F0F11; }
html.dark ::-webkit-scrollbar-thumb:hover { background:#48484F; }
html.dark input, html.dark select, html.dark textarea { color-scheme: dark; }
html.dark input::placeholder, html.dark textarea::placeholder { color:#6C6C74; }
html.dark kbd { color:#A0A0A8; }
/* the big red cards: a lighter, softer red on dark, with text kept readable */
html.dark .arete-hero { background:linear-gradient(135deg,#D8505A 0%,#BC3640 100%) !important; box-shadow:0 10px 34px rgba(216,80,90,.18) !important; }
html.dark .arete-hero [class*="text-white/"] { color:rgba(255,255,255,.93) !important; }
html.dark .arete-hero .arete-stat { background:rgba(110,16,26,.30) !important; border-color:rgba(255,255,255,.18) !important; }
html.dark .arete-hero .arete-stat:hover { background:rgba(110,16,26,.42) !important; }
html.dark img[src*="logo"] { background:#fff; border-radius:8px; }
`;
const body = [...rules.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([s, d]) => `${s}{${d}}`).join('\n');
fs.writeFileSync(new URL('../src/dark.css', import.meta.url), head + '\n/* class colours */\n' + body + '\n\n/* inline-style colours */\n' + lines.join('\n') + '\n}\n');
console.log(`dark.css: ${rules.size} class rules + ${lines.length} inline-style rules from ${files.length} files`);
if (unsupported.size) console.log('variants not handled (skipped):', [...unsupported].join(', '));
