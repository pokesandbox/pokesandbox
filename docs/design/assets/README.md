# Brand assets

Images for the landing page, the Pages site, Discord, and community posts. Original artwork only: no Pokémon names, species, or Poké Balls (see the trademark note in the root [README](../../../README.md)). Colours come from the design tokens in [`tokens.css`](../authoring-mockups/assets/tokens.css).

## `hero/`

| File                     | Size      | Use                               |
| ------------------------ | --------- | --------------------------------- |
| `hero-desktop-3424.webp` | 3424×1248 | Desktop landing banner, full size |
| `hero-desktop-1712.webp` | 1712×624  | Desktop landing banner, half size |

Serve both through `srcset` (`1712w`, `3424w`) with `object-fit: cover` and `object-position: 75% 50%`, so narrow screens crop the empty sea on the left and keep the castle in view. Keep headline copy to about 480px wide over the open sea on the left.

The GitHub Pages build (`scripts/build-pages.sh`) copies both banners into the site, where the Under construction page (`site/index.html`) uses them.

## `icon/`

| File                               | Use                                                      |
| ---------------------------------- | -------------------------------------------------------- |
| `pokesandbox-icon.svg`             | Source for 48px and up: tower top, window, flag          |
| `pokesandbox-icon-small.svg`       | Source for 32px and below: no window, heavier outlines   |
| `favicon.ico`                      | Browser tab: 16 and 32 from the small icon, 48 from main |
| `png/icon-180.png`                 | Apple touch icon                                         |
| `png/icon-192.png`, `icon-512.png` | Web app manifest                                         |
| `png/icon-1024.png`                | Discord app icon, store and directory listings           |
| `png/icon-{16,32,48,64,128}.png`   | Anywhere else that needs a fixed size                    |

Both icons are a full-bleed teal square; Discord and other platforms crop them to a circle, and everything important sits inside it. Re-export the PNGs and `favicon.ico` from the SVGs rather than editing them. The sand shades (`#F3E3C6`, `#E3C796`) are warmed from `--surface-muted` toward `--brand-ink`, because the token itself reads grey against the teal.

## `social/`

| File               | Size     | Use                                                             |
| ------------------ | -------- | --------------------------------------------------------------- |
| `forum-banner.png` | 1712×624 | Recruitment and forum posts: wordmark and tagline over the hero |
