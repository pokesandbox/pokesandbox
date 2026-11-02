#!/usr/bin/env bash
# Rewrites the SF: paths in each project's lcov.info so they are relative to the
# repo root, where the single SonarCloud project (sonar-project.properties) lives.
#
# Jest/istanbul writes SF: paths relative to each project's jest rootDir
# (e.g. coverage/apps/bot/lcov.info contains "SF:src/main.ts"). Each project's
# coverage lands in coverage/<projectRoot>/, so the project root is the lcov
# file's directory with the leading "coverage/" removed.
#
# Idempotent: paths that already start with the project root are left alone.
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

[ -d coverage ] || { echo "No coverage/ directory — nothing to normalize."; exit 0; }

find coverage -name lcov.info -print0 | while IFS= read -r -d '' lcov; do
  project_root="$(dirname "${lcov#coverage/}")"
  if [ ! -d "$project_root" ]; then
    echo "::warning::$lcov does not map to a project directory ($project_root) — skipped."
    continue
  fi
  # Prefix relative SF: paths that don't already start with the project root.
  awk -v root="$project_root/" '
    /^SF:/ {
      path = substr($0, 4)
      if (path !~ /^\// && index(path, root) != 1) { print "SF:" root path; next }
    }
    { print }
  ' "$lcov" > "$lcov.tmp" && mv "$lcov.tmp" "$lcov"
  echo "Normalized $lcov -> $project_root/"
done
