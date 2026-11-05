# Authoring UI mockups

Mid-fidelity mockups for the webapp's public pages and region builder (issue #250), exported as standalone pages from the PokeSandbox design system artifact. Open [`index.html`](index.html) in a browser; it links every screen.

- `assets/`: the design tokens (`tokens.css`), the shared mockup styles and icon/chrome helpers (`mockups.css`, `mockups.js`), and the page chrome with the light/dark toggle (`page.css`, `page.js`).
- `components/`: one page per component, from Button to the condition editor.
- `screens/public/`: A–E, landing through access states.
- `screens/builder/`: F–J and the save/conflict states.
- `screens/conditions/`, `screens/people/`: round 2 (where conditions appear; trainers and NPCs).

Phone frames are drawn at 390×844 and desktop frames at 1440, side by side on one page, so the pages aren't responsive. Screens marked ★ also show a dark version; the top bar's toggle switches everything else.

These files are generated: change the design system, then re-export, rather than editing them by hand. The `ps-*` classes are reference styles for the mockups, not production CSS; the webapp builds these with Tailwind and shadcn/ui (see [28](../../architecture/concepts/28-webapp-authoring-and-mobile-first-ux.md)).
