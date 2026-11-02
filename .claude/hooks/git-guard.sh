#!/usr/bin/env bash
# PreToolUse (Bash, git): blocks the git commands AGENTS.md forbids.
# Exit 2 blocks the call; stderr is shown to the agent as the reason.
set -uo pipefail
. "$(dirname "$0")/lib.sh"

cmd="$(read_command)"
[ -n "$cmd" ] || exit 0

block() {
  echo "Blocked by .claude/hooks/git-guard.sh: $1 (see AGENTS.md, Musts)." >&2
  exit 2
}

# Skipping hooks: --no-verify on any git command, or HUSKY=0.
if printf '%s' "$cmd" | grep -Eq 'git[[:space:]].*--no-verify|(^|[[:space:];&|])HUSKY=0'; then
  block "skipping git hooks is not allowed; fix what the hook reports instead"
fi

# Bulk staging: git add -A / --all / -u / --update / .
if printf '%s' "$cmd" | grep -Eq 'git[[:space:]]+add[^;&|]*[[:space:]](-A|--all|-u|--update|\.)([[:space:];&|]|$)'; then
  block "stage files by name instead of 'git add -A', '-u', or '.'"
fi

# Pushing to develop directly (git push origin develop, HEAD:develop, ...).
if printf '%s' "$cmd" | grep -Eq 'git[[:space:]]+push[^;&|]*([[:space:]]|:)(refs/heads/)?develop([[:space:];&|]|$)'; then
  block "never push to develop; push your <issue>-<description> branch and open a PR"
fi

exit 0
