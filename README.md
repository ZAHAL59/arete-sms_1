# Arete Model School — school management portals

One place for the school's day-to-day work: **Principal, Admissions, Teacher, HR, Finance, Hostel, Transport, Campus**, plus a public **Careers** page.
React 19 · Vite · Tailwind 3 · Zustand · React Router. Light and dark mode. Works on phones, tablets and desktops.

> ### ⚠️ Read this before using real student data
> The interface is production-grade, but **all data is saved in each person's own browser (localStorage)**. There is **no login, no shared database and no backup**.
> Two people on two computers see different data, and clearing the browser erases it. Treat this deployment as a **demo / pilot** until a backend, sign-in and
> backups are added. (A step-by-step plan for that is in the project history; the screens will not need to change.)

## Run it
```bash
npm install
npm run dev          # http://localhost:5173
npm run check        # lint + unit tests + production build — run before every push
```
Node 20+ (`.nvmrc` pins 22).

| Script | What it does |
|---|---|
| `npm run dev` | local development server |
| `npm run build` / `npm run preview` | production build / serve it locally |
| `npm run lint` | oxlint (0 errors; a few style warnings) |
| `npm test` | unit tests for fee rules, hostel fees, substitute cover and the recruitment score |
| `npm run gen:dark` | rebuilds `src/dark.css` (the dark palette) after you add new hard-coded colours |

## Deploy (Vercel)
Push to GitHub → Vercel builds `npm run build` and serves `dist/`. `vercel.json` already provides:
- single-page-app routing, so refreshing `/hostel?app=mess` works;
- security headers — a strict **Content-Security-Policy** (no inline scripts, no third-party requests — the DM Sans font is served from your own site), clickjacking protection, HSTS, `nosniff`, referrer and permissions policies;
- caching — built files are cached for a year (`/assets/*`, content-hashed), the HTML is never cached, so a new deploy shows immediately.

Optional: put your logo at `public/arete-logo.png` (or `arete_logo.png`); it is used in the app and as the tab icon.

## How it is organised
```
src/
  App.jsx                routes — each portal loads on demand (code-split)
  components/shell/      the shared frame: PortalHub (home, sidebar, top bar, search), widgets, dropdowns
  components/ui/         buttons, badges, modals, form fields, collapsibles
  pages/<portal>/        one folder per portal: its screens, data helpers and Overview
  lib/                   error reporting, storage guard, print windows, automatic form-label linking
  dark.css               GENERATED dark palette (see scripts/gen-dark.mjs)
  __tests__/             unit tests
public/                  icons, manifest, robots.txt, tiny startup scripts
scripts/gen-dark.mjs     builds the dark palette from the colours the app uses
```
**Every portal has the same shape:** Home (key numbers, areas, today, needs-attention) → an *area* (short sidebar + Overview) → pages.
To add a page: add it to the portal's `APPS` list in `pages/<portal>/Overview.jsx` and render it in the portal file. Screens call `go('page-id')`; the address bar records where you are (`/hr?app=recruitment&page=interviews`).

## Design rules
- **Ink and accent:** neutral surfaces, ink buttons, and brand red (`bg-accent`) kept to about 5% — logo, count badges, active-item bar, progress fills. Red otherwise means "danger".
- **Dark mode:** toggle in the top bar (Light / Dark / System). Colours come from the class names and inline styles in the code; run `npm run gen:dark` after adding new ones.
- **Responsive:** ≥1024px sidebar beside the page; below that it is a slide-in sheet. Wide tables scroll sideways inside their card.

## Quality checks that were run
- **Accessibility:** axe-core (WCAG 2.1 A/AA) over 98 screens — **0 violations** in light and dark on desktop and in light on phone.
  Form labels are linked automatically (`lib/autoLabel.js`), dialogs trap focus, menus are keyboard-operable, contrast meets AA.
- **Layout:** no sideways overflow at 390px (phone) and 820px (tablet); at 320px (the smallest phones) two screens scroll sideways by under 10px.
- **Resilience:** a crash shows a recovery screen (with "clear saved data and start fresh"); 404 page with suggestions; blocked or full storage degrades gracefully.
- **Security headers / CSP:** loaded every route and three print windows (fee receipt, salary slips, hostel menu) under the production policy with no violations.
- **Speed:** first screen ≈ 90 kB of JavaScript (compressed); a portal ≈ 140–170 kB when opened.

## Known limits
- Data is per-browser (see the warning above). SMS/WhatsApp/e-mail are **not sent** — invites are copy-and-paste; CVs store only a file name.
- Sample data is for demonstration (e.g. the hostel room lists contain demo names).
- Search engines are told to ignore everything except `/careers` (`robots.txt` + `noindex`).

## Troubleshooting
- **Old layout after a deploy:** hard-refresh (Ctrl/Cmd + Shift + R).
- **A screen shows "This screen hit a problem":** use *Try again* or *Reload*. If it persists, *Clear saved data and start fresh* (erases this browser's demo data).
- **Nothing saves:** the browser may be in private mode or full — a notice appears at the bottom of the screen.
