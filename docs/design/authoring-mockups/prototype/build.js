// Builds ../prototype.html: renders every mockup page in headless Chrome, keeps each phone and
// desktop frame as it was drawn, and wires them together with the click map in rules.js.
// Run from the repo root: node docs/design/authoring-mockups/prototype/build.js
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'prototype.html');

// Short keys used in rules.js. A page missing here isn't in the prototype.
const KEYS = {
  'screens/public/a-landing.html': 'a',
  'screens/public/b-home.html': 'b',
  'screens/public/c-server.html': 'c',
  'screens/public/d-region.html': 'd',
  'screens/public/e-access.html': 'e',
  'screens/player/species-page.html': 'sp',
  'screens/player/region-pokedex.html': 'rp',
  'screens/builder/f-builder-home.html': 'f',
  'screens/builder/g-create-region.html': 'g',
  'screens/builder/h-settings.html': 'h',
  'screens/builder/r4-encounter-methods.html': 'r4',
  'screens/builder/states.html': 'st',
  'screens/publishing/o1-region-health.html': 'o1',
  'screens/publishing/o2-publish.html': 'o2',
  'screens/builder/i-locations.html': 'il',
  'screens/builder/i-connections.html': 'ic',
  'screens/builder/j-encounters.html': 'j',
  'screens/builder/r1-hidden-items.html': 'r1',
  'screens/builder/r2-traversal-costs.html': 'r2',
  'screens/builder/r3-events.html': 'r3',
  'screens/conditions/k3-where-conditions-appear.html': 'k3',
  'screens/people/npcs.html': 'npc',
  'screens/people/l2-npc-editor-trainer.html': 'l2',
  'screens/scripts/s1-step-editor.html': 's1',
  'screens/scripts/s2-oaks-parcel.html': 's2',
  'screens/templates/n1-template-picker.html': 'n1',
  'screens/templates/n2-gym-leader.html': 'n2',
  'screens/templates/n3-forced-encounter.html': 'n3',
  'screens/templates/n4-gift-npc.html': 'n4',
  'screens/templates/n5-starter-gift.html': 'n5',
  'screens/content/q1-pokedex.html': 'q1',
  'screens/content/q1-player-pokedex.html': 'qp',
  'screens/content/p1-tms-and-hms.html': 'p1',
  'screens/content/q2-progressions.html': 'q2',
  'components/condition-builder.html': 'k2',
  'components/species-info-panel.html': 'si',
  'components/search-combobox.html': 'sc',
};

async function launch() {
  // Prefer the installed Chrome; fall back to Playwright's own Chromium.
  try {
    return await chromium.launch({ channel: 'chrome' });
  } catch {
    return chromium.launch();
  }
}

// Renders each page and returns its frames: label, theme, kind, size and markup.
async function extract(browser) {
  const page = await browser.newPage({
    viewport: { width: 1600, height: 1000 },
  });
  const out = [];
  for (const file of Object.keys(KEYS)) {
    const abs = path.join(ROOT, file);
    if (!fs.existsSync(abs)) throw new Error('Missing mockup page: ' + file);
    await page.goto('file://' + abs);
    await page.waitForTimeout(150);
    const r = await page.evaluate(() => {
      const labels = [...document.querySelectorAll('.ps-frame-label')];
      const notes = labels
        .filter((l) => /^Notes/.test(l.textContent.trim()))
        .map((l) => {
          const ul = l.parentElement.querySelector(
            'ul,ol,p:not(.ps-frame-label)',
          );
          return ul ? ul.innerText : '';
        })
        .join('\n');
      const frames = [
        ...document.querySelectorAll('.ps-phone, .ps-desktop'),
      ].map((el, i) => {
        let label = '';
        for (const l of labels)
          if (l.compareDocumentPosition(el) & 4) label = l.textContent.trim();
        const t = el.closest('[data-theme]');
        return {
          i,
          kind: el.classList.contains('ps-phone') ? 'phone' : 'desktop',
          theme: t ? t.getAttribute('data-theme') : 'light',
          label,
          w: el.offsetWidth,
          h: el.offsetHeight,
          html: el.outerHTML,
        };
      });
      return {
        title: document.title.replace(' · PokeSandbox mockups', ''),
        notes,
        frames,
      };
    });
    out.push({ file, ...r });
  }
  await page.close();
  return out;
}

// The rendered icons are re-drawn by PS.mount in the page, so drop them to keep the file small.
function stripSvg(h) {
  return h.replace(
    /(<span[^>]*\bdata-i="[^"]*"[^>]*>)<svg class="ps-icon"[\s\S]*?<\/svg>/g,
    '$1',
  );
}

function assemble(pages) {
  const index = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const clean = (s) =>
    s
      .replace(/\s+/g, ' ')
      .replace(/&#x27;/g, "'")
      .replace(/&amp;/g, '&')
      .trim();
  const desc = {};
  for (const m of index.matchAll(
    /href="([^"]+)"\s*><b>([\s\S]*?)<\/b\s*><span\s*>([\s\S]*?)<\/span/g,
  )) {
    desc[m[1]] = { title: clean(m[2]), desc: clean(m[3]) };
  }

  const screens = {};
  const frames = {};
  for (const s of pages) {
    const key = KEYS[s.file];
    const d = desc[s.file] || { title: s.title, desc: '' };
    screens[key] = {
      key,
      file: s.file,
      title: d.title,
      desc: d.desc,
      notes: s.notes || '',
      frames: [],
    };
    let prev = null;
    for (const f of s.frames) {
      const html = stripSvg(f.html);
      // Dark duplicates are the same markup as the light frame; the theme toggle covers them.
      if (f.theme === 'dark' && prev === html) continue;
      const id = key + '/' + f.i;
      const label =
        (f.label || '').replace(/ · light$/, '') ||
        (f.kind === 'desktop' ? 'Desktop' : 'Phone');
      frames[id] = {
        id,
        key,
        i: f.i,
        kind: f.kind,
        label,
        html,
        sheet: /class="ps-(sheet|dialog)[ "]/.test(html),
        h: f.h,
        w: f.w,
      };
      screens[key].frames.push(id);
      prev = html;
    }
  }

  const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
  const noClose = (s) => s.replace(/<\/script/gi, '<\\/script');
  const css = read('assets/tokens.css') + '\n' + read('assets/mockups.css');
  const json = noClose(JSON.stringify({ screens, frames }));
  const html = read('prototype/app.html')
    .replace('/*__CSS__*/', () => css)
    .replace('/*__PSJS__*/', () => noClose(read('assets/mockups.js')))
    .replace('/*__DATA__*/', () => 'window.DATA = ' + json + ';')
    .replace('/*__RULES__*/', () => read('prototype/rules.js'));
  fs.writeFileSync(OUT, html);
  return Object.keys(frames).length;
}

// Opens the built page and lists click-map rules that no longer match anything in their frame,
// which is what happens when a re-export renames a button or reorders a page's frames.
async function check(browser) {
  const page = await browser.newPage({
    viewport: { width: 1500, height: 1000 },
  });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('file://' + OUT);
  const stale = await page.evaluate(() => {
    const out = [];
    for (const id of Object.keys(FRAME)) {
      if (!DATA.frames[id]) {
        out.push(id + ': no such frame');
        continue;
      }
      __pt.go(id, false);
      const taps = __pt.taps();
      for (const r of FRAME[id]) {
        const want = r[1].indexOf('toast:') === 0 ? r[1] : __pt.concrete(r[1]);
        if (!want)
          out.push(id + ': ' + r[0] + ' → ' + r[1] + ' (no such frame)');
        else if (!taps.some((t) => t.t === want))
          out.push(id + ': ' + r[0] + ' → ' + r[1]);
      }
    }
    return out;
  });
  await page.close();
  return { stale, errors };
}

(async () => {
  const browser = await launch();
  try {
    const n = assemble(await extract(browser));
    console.log(
      'Wrote ' + path.relative(process.cwd(), OUT) + ' with ' + n + ' frames.',
    );
    const { stale, errors } = await check(browser);
    if (errors.length) console.log('Page errors:\n  ' + errors.join('\n  '));
    if (stale.length)
      console.log(
        'Rules that match nothing (update rules.js):\n  ' + stale.join('\n  '),
      );
    if (errors.length || stale.length) process.exitCode = 1;
    else console.log('Every rule in rules.js matches a tap target.');
  } finally {
    await browser.close();
  }
})();
