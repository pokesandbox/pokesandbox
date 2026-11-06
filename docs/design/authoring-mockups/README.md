# Authoring UI mockups

Mid-fidelity mockups for the webapp's public pages and region builder (issue #250), exported as standalone pages from the PokeSandbox design system artifact. Open [`index.html`](index.html) in a browser; it links every screen.

- `assets/`: the design tokens (`tokens.css`), the shared mockup styles and icon/chrome helpers (`mockups.css`, `mockups.js`), and the page chrome with the light/dark toggle (`page.css`, `page.js`).
- `components/`: one page per component, from Button to the condition editor.
- `screens/public/`: A–E, landing through access states.
- `screens/builder/`: F–J, the save/conflict states, and round 3's location authoring (R1 hidden items, R2 traversal costs, R3 events) and encounter methods (R4).
- `screens/conditions/`, `screens/people/`, `screens/templates/`: round 2 (where conditions appear; the one NPCs list with trainers folded in; templates).
- `screens/publishing/`, `screens/content/`: round 2 group 4 (Region Health and publishing; TMs & HMs, Pokédex, progressions).
- `screens/scripts/`: round 4 (S1 the basic step editor and Scripts list, S2 the Oak's Parcel worked example). S3 (New game) is on `screens/builder/h-settings.html`, and N5 (Starter Gift) is with the templates.
- `screens/player/`: player-facing pages (canon species page, region Pokédex with seen and caught).

Phone frames are drawn at 390×844 and desktop frames at 1440, side by side on one page, so the pages aren't responsive. Screens marked ★ also show a dark version; the top bar's toggle switches everything else.

These files are generated: change the design system, then re-export, rather than editing them by hand. The `ps-*` classes are reference styles for the mockups, not production CSS; the webapp builds these with Tailwind and shadcn/ui (see [28](../../architecture/concepts/28-webapp-authoring-and-mobile-first-ux.md)).

## Clickable prototype

[`prototype.html`](prototype.html) puts the same screens on one page you can tap through, starting at the landing page. It's a single file that works offline, with phone and desktop modes, dark mode, and a Tap targets toggle (or press H) that shows what's wired. The side list jumps to any screen or state.

The prototype is generated, not drawn: it shows each frame exactly as it renders above, and [`prototype/rules.js`](prototype/rules.js) says which tap goes to which frame. After a re-export, rebuild it from the repo root:

```bash
node docs/design/authoring-mockups/prototype/build.js
```

The build renders every page in headless Chrome, so it needs Chrome or Playwright's Chromium. It ends by listing any rule that no longer matches a tap target, which usually means a button was renamed or a page's frames were reordered. Fix those in `rules.js` and build again. A new page needs a key in `build.js` before `rules.js` can wire it.
