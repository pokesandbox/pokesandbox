#!/usr/bin/env bash
# PreToolUse (Bash, git push): agents must pass lint, typecheck, and tests for
# the affected projects before pushing (AGENTS.md, Musts). The husky pre-push
# hook only typechecks, so humans keep fast pushes; CI runs everything again.
# Exit 2 blocks the push and shows the failure to the agent.
set -uo pipefail
. "$(dirname "$0")/lib.sh"

cmd="$(read_command)"
printf '%s' "$cmd" | grep -Eq 'git[[:space:]]+push\b' || exit 0
# Dry runs and branch deletions don't need checks.
printf '%s' "$cmd" | grep -Eq -- '(--dry-run|[[:space:]]-n\b|--delete|[[:space:]]-d\b)' && exit 0

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

if [ ! -d node_modules ]; then
  echo "Blocked: dependencies aren't installed, so the pre-push checks can't run. Run 'npm ci' first." >&2
  exit 2
fi

git fetch --quiet origin develop 2>/dev/null || true

log="$(mktemp)"
if NX_DAEMON=false npx nx affected -t lint typecheck test --base=origin/develop --outputStyle=static >"$log" 2>&1; then
  rm -f "$log"
  exit 0
fi

{
  echo "Blocked: 'nx affected -t lint typecheck test --base=origin/develop' failed. Fix it before pushing (AGENTS.md, Musts). Last lines:"
  tail -n 60 "$log"
} >&2
rm -f "$log"
exit 2
