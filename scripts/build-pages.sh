#!/usr/bin/env bash
# Assembles the GitHub Pages site into $1 (default _site).
# DESIGN_PATH and PROTOTYPE_PATH (repo variables in CI) publish the unlisted pages; unset skips them.
set -euo pipefail

cd "$(dirname "$0")/.."
out="${1:-_site}"
mockups="docs/design/authoring-mockups"
noindex='<meta name="robots" content="noindex" />'

check_slug() {
  if [[ ! "$2" =~ ^[A-Za-z0-9_-]+$ ]]; then
    echo "$1 must be letters, digits, '-' or '_' only" >&2
    exit 1
  fi
}

rm -rf "$out"
mkdir -p "$out/assets"
cp -R site/. "$out/"
cp docs/design/assets/hero/hero-desktop-*.webp "$mockups/assets/tokens.css" "$out/assets/"

if [[ -n "${DESIGN_PATH:-}" ]]; then
  check_slug DESIGN_PATH "$DESIGN_PATH"
  mkdir -p "$out/$DESIGN_PATH"
  rsync -a --exclude prototype.html --exclude prototype/ "$mockups/" "$out/$DESIGN_PATH/"
  echo "Mockups published"
fi

if [[ -n "${PROTOTYPE_PATH:-}" ]]; then
  check_slug PROTOTYPE_PATH "$PROTOTYPE_PATH"
  mkdir -p "$out/$PROTOTYPE_PATH"
  cp "$mockups/prototype.html" "$out/$PROTOTYPE_PATH/index.html"
  echo "Prototype published"
fi

# The mockup files stay untouched in the repo; the served copies get noindex here.
find "$out" -name '*.html' -print0 | while IFS= read -r -d '' file; do
  grep -q 'name="robots"' "$file" || NOINDEX="$noindex" perl -0pi -e 's/<head([^>]*)>/<head$1>$ENV{NOINDEX}/i' "$file"
  if ! grep -q 'name="robots"' "$file"; then
    echo "No <head> to add noindex to: $file" >&2
    exit 1
  fi
done

echo "Site built in $out"
