# Brand assets

Images for the landing page and other brand surfaces. Original artwork only: no Pokémon names, species, or Poké Balls (see the trademark note in the root [README](../../../README.md)).

| File                     | Size      | Use                               |
| ------------------------ | --------- | --------------------------------- |
| `hero-desktop-3424.webp` | 3424×1248 | Desktop landing banner, full size |
| `hero-desktop-1712.webp` | 1712×624  | Desktop landing banner, half size |

Serve both through `srcset` (`1712w`, `3424w`) with `object-fit: cover` and `object-position: 75% 50%`, so narrow screens crop the empty sea on the left and keep the castle in view. Keep headline copy to about 480px wide over the open sea on the left.

The GitHub Pages build (`scripts/build-pages.sh`) copies both banners into the site, where the Under construction page (`site/index.html`) uses them.
