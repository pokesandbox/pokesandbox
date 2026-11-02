# 28: Webapp Authoring & Mobile-first UX

> **TL;DR:** MVP region authoring happens in the **webapp**, designed **mobile-first**, because most server admins are on their phones and Discord's components are too cramped for scripts, maps, and grids (Q36). Discord stays the place to **play**, and keeps entry points for authors (Region Health, publish, "Open in builder" links). Both clients call the same `libs/authoring` commands, so rules are never duplicated. The **existing Discord builders** (Pokédex, progressions, locations) stay in the code and working until the webapp covers everything they do, but the Discord authoring commands are **hidden in production behind a feature flag** until they're ready for a full release (on in dev). The webapp moves **off antd** to Tailwind plus a headless component library, picked by a trial (React Aria vs Base UI) that happens before any webapp authoring work.

**MVP impact:** High (every MVP builder feature) · **Cost to change later:** Medium (the commands are shared, so a client can be added later; the UI work is what's at stake)

## Why webapp-first (decided Oct 2026, Q36)
The earlier plan was Discord-complete authoring with targeted webapp editors for the hardest tasks. Working through the MVP builders showed that most of them are the hard kind:
- **Discord's limits bind on every editor.** A modal holds at most 5 text inputs; a message holds 40 components and about 4,000 characters; select menus hold 25 options. A script step list, a location graph, an encounter table, or a trainer party each needs paging, nested menus, and many round trips in Discord.
- **Two full UIs per feature doubles the UI work** for a small team. The commands are shared, but every screen would be built twice.
- **The webapp can be mobile-first.** A phone browser gives full-screen lists, real text areas, drag handles, and autocomplete, which is a better phone experience than a Discord modal chain.
- **Discord stays the play surface.** Players never need the webapp to play; admins use Discord for the quick things (health checks, publishing, playtesting).

| Option | For | Against |
|---|---|---|
| Discord-complete + targeted webapp editors (the earlier decision) | Creators never leave Discord | Every builder built twice; the Discord versions of scripts, maps, and grids are the worst UX in the product |
| **Webapp-first, mobile-first; Discord for play and quick author actions** (chosen) | One builder UI per feature; editors fit the data; works on phones | Authors open a browser; a Discord-only creator can't author new MVP features until post-MVP parity work |
| Webapp-only, remove the Discord builders now | Least code | Breaks today's Discord authors before the webapp can replace them |

## What lives where
| Surface | MVP |
|---|---|
| **Webapp builder** | Every new MVP builder feature: region settings and rules, locations and connections (list/detail, plus the map canvas on wide screens), encounters, NPCs and placements, trainers and parties, scripts and templates, shops, transport, TM/HM lists, progressions, the shared condition builder, Region Health, the publish review, JSON import/export. |
| **Discord (`/region`)** | Region Health summary, publish (review then confirm, [16](16-authoring-validation-and-portability.md#open-questions)), "Play draft as test journey" (later), and **Open in builder** link buttons that deep-link into the webapp. |
| **Existing Discord builders** | Pokédex, progressions, and locations keep working, migrated onto `libs/authoring` commands ([M0B-17](https://github.com/pokesandbox/pokesandbox/issues/146), [M0B-18](https://github.com/pokesandbox/pokesandbox/issues/147), [M0B-19](https://github.com/pokesandbox/pokesandbox/issues/148)), behind the `discord.authoring` flag (on in dev, off in production). See [Transition](#transition-the-existing-discord-builders). |
| **Discord authoring for new features** | Post-MVP, per feature, where it's worth it (a Discord step-list editor for small script edits, quick encounter tweaks). Large graphs may never get a Discord editor. |

## Transition: the existing Discord builders
- The Pokédex, progression, and location builders **stay in the code and keep working** until the webapp reaches parity with each one: everything the Discord builder can do, the webapp can do too. They aren't removed before that, and bugs in them are still fixed.
- **They're hidden in production until they're ready for a full release.** The Discord authoring commands sit behind the `discord.authoring` feature flag ([21 § Feature flags](21-hosting-and-environments.md#feature-flags-decided-oct-2026)): on in dev (`FEATURE_FLAGS=*`), off in production except on servers with an override (e.g. the HQ server). Releasing them is turning the flag on; nothing has to be rebuilt.
- They move onto `libs/authoring` commands as planned ([M0B-17](https://github.com/pokesandbox/pokesandbox/issues/146), [M0B-18](https://github.com/pokesandbox/pokesandbox/issues/147), [M0B-19](https://github.com/pokesandbox/pokesandbox/issues/148)), so both clients share rules and edits made in either are visible in the other.
- Removing a Discord builder for good is a separate, per-builder decision, made only after webapp parity is checked against that builder's feature list.

## Mobile-first rules
Every builder screen is designed for a phone first and enhanced for wider screens.
- **Breakpoints:** Tailwind's mobile-first breakpoints. Base styles are the phone layout; `md:` and up add columns, side panels, and the canvas.
- **List/detail editors are the primary pattern.** A list of items (locations, steps, encounter rows), tap one to edit it in a full-screen detail view, back to return. On wide screens the two sit side by side. The map canvas and other drag-heavy views are **desktop enhancements**; everything they do is also possible through the list/detail editors.
- **Touch targets** are at least 44×44 px. Reordering uses drag handles plus "move up/down" actions, so it works without precise dragging.
- **No hover-only interactions.** Tooltips and menus open on tap; anything shown on hover is also reachable without it.
- **Forms:** one column on phones, native input types (number, search), labels above inputs, and validation messages next to the field. Zod command schemas double as form schemas ([16](16-authoring-validation-and-portability.md#authoring-the-same-pattern-for-region-building)).
- **Long text** (passages, dialogue) gets a real text area with a live preview of how the passage renders in Discord, built from the same `libs/presentation` view models the bot renders (passage paging included), drawn as HTML ([26](26-discord-surface-and-ux-patterns.md#principles)).
- **Saving and conflicts:** each edit is a `libs/authoring` command with per-entity optimistic concurrency. A conflict shows "This was changed by X, reload" instead of overwriting ([16](16-authoring-validation-and-portability.md#authoring-the-same-pattern-for-region-building)).
- **Tested at phone width:** Playwright tests run each builder flow at a 390×844 viewport as well as desktop.

## Getting from Discord to the builder
- `/region` shows **Open in builder** link buttons that point straight at the relevant webapp screen (the region, a location, a failing Region Health item).
- Links are plain URLs with no tokens in them, because links get shared and land in browser history. The webapp signs in with Discord OAuth (NextAuth, already in place) and checks the user's server role on every authoring command server-side, never trusting the browser ([16](16-authoring-validation-and-portability.md#authoring-the-same-pattern-for-region-building)).
- Discord on mobile opens links in its in-app browser; the first visit may ask the author to sign in. That's acceptable for MVP.

## UI stack: off antd, onto Tailwind plus a headless library
The webapp uses antd 6 in a handful of files (headers, the search bar, server cards, the profile page, the theme provider) alongside Tailwind. It moves fully to **Tailwind plus a headless component library**.

- **What "headless" means:** a library that provides component **behavior** without any styling: focus management, keyboard navigation, ARIA attributes for screen readers, positioning for popovers and menus, dismiss-on-outside-tap, and scroll locking for dialogs. You write all the markup classes yourself in Tailwind. Examples: Radix UI, React Aria, Headless UI, Ark UI. A styled library like antd ships its own look, which is hard to make mobile-first and fights Tailwind.
- **shadcn/ui is a layer, not the behavior library.** It copies small Tailwind-styled components into our repo, so we own the code. Since 2026 it can sit on one of three headless bases: **Base UI** (its default for new projects), **Radix** (still supported, maintained more slowly than it once was), or **React Aria** (a first-class base since July 2026). So the decision is "shadcn/ui, on which base".
- **Decided (Nov 2026): headless, chosen by a trial.** React Aria and Base UI (each under shadcn/ui) are trialled side by side in [M3-05](https://github.com/pokesandbox/pokesandbox/issues/202), and the owner picks one. **The trial happens before any webapp authoring work:** the builder shell and every editor are blocked on it. Going in, **React Aria is the favorite**, with Base UI the main contender. Our builder is phone-first and list-heavy, and React Aria is strongest exactly there: press handling that behaves the same for touch, mouse, and keyboard; built-in drag-to-reorder for lists and grids with accessible non-drag alternatives (Base UI and Radix need a separate drag library such as dnd-kit); a combobox with async loading and virtualization for 1,000+ species; and color and date pickers for later (region themes). Its costs: a more verbose API and a larger bundle, which only the webapp pays. Radix isn't trialled; it isn't recommended for new work. The trial checks all of this on a real phone.
- **Migration ([M3-07](https://github.com/pokesandbox/pokesandbox/issues/203), after the trial):** replace the antd usages, remove antd and `@ant-design/*`, and add the chosen primitives. The current Tailwind is 3.4; upgrading to Tailwind 4 is part of the migration if the chosen library's current templates expect it.
- **Shared builder components** (built once, used by every editor): a list/detail shell, a species/move/item search combobox, a sortable list, the condition builder, a passage editor with preview, and a confirm dialog.

## MVP scope
- The webapp builder for every MVP authoring feature, mobile-first, on `libs/authoring` commands.
- `/region` in Discord: Region Health summary, publish, and Open in builder links.
- The existing Discord builders kept working and migrated onto authoring commands until webapp parity, hidden in production behind the `discord.authoring` flag.
- The headless library trial (before any webapp authoring work); antd removed; Tailwind plus the chosen library; Playwright tests at phone width.
- Not MVP: Discord editors for new authoring features, retiring the existing Discord builders (only after parity), a native app.

## Open questions
- Which headless base under shadcn/ui: React Aria (favorite) or Base UI? Decided by the owner from the [M3-05](https://github.com/pokesandbox/pokesandbox/issues/202) trial, before any webapp authoring work.
