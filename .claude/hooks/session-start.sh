#!/usr/bin/env bash
# SessionStart: in Claude Code cloud sessions the container starts without
# node_modules, so the git hooks and `npm run affected` can't run. Install
# dependencies (npm ci also installs the husky hooks via `prepare`) and fetch
# develop so `nx affected` compares against a fresh base. Cloud sessions also
# start on a harness branch (claude/...); ask for a rename to the AGENTS.md
# convention before the first commit, since git-guard.sh blocks pushing it.
# Local sessions are left alone.
set -uo pipefail

[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
case "$branch" in
"" | HEAD | develop | master) ;;
*)
  if ! node .github/scripts/conventions.js branch-name "$branch" >/dev/null 2>&1; then
    echo "Branch \"$branch\" doesn't follow AGENTS.md (<issue>-<kebab-description>). Before your first commit, rename it with 'git branch -m <issue>-<description>' and push that branch instead; the git guard blocks pushes of other names."
  fi
  ;;
esac

if [ ! -d node_modules ]; then
  if npm ci --no-audit --no-fund >/tmp/claude-npm-ci.log 2>&1; then
    echo "Installed dependencies with npm ci (git hooks are active)."
  else
    echo "npm ci failed (see /tmp/claude-npm-ci.log). Run it before committing or pushing."
  fi
fi

git fetch --quiet origin develop 2>/dev/null &&
  echo "Fetched origin/develop: compare with --base=origin/develop."
exit 0
