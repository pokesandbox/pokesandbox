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

# Pushing to a protected branch (develop, master). Repository rules block these
# pushes on GitHub, but accounts on the bypass list (and agents pushing with
# their credentials) get through, so stop them here too. Covers explicit
# refspecs (develop, HEAD:master, refs/heads/develop), --all / --mirror, and a
# plain `git push [remote]` while a protected branch is checked out.
PROTECTED='^(develop|master)$'
current_branch="$(git -C "${CLAUDE_PROJECT_DIR:-.}" rev-parse --abbrev-ref HEAD 2>/dev/null || true)"

while IFS= read -r segment; do
  [ -n "$segment" ] || continue
  # Words after "push", dropping options; what's left is [remote [refspec...]].
  read -r -a words <<<"${segment#*push}"
  positional=()
  for word in "${words[@]}"; do
    case "$word" in
    --all | --mirror) block "never push every branch at once; push your <issue>-<description> branch" ;;
    -*) ;;
    *) positional+=("$word") ;;
    esac
  done

  if [ "${#positional[@]}" -le 1 ]; then
    targets=("$current_branch")
  else
    targets=()
    for refspec in "${positional[@]:1}"; do
      dest="${refspec##*:}" # src:dest pushes to dest; a bare name pushes to itself
      dest="${dest#+}"
      dest="${dest#refs/heads/}"
      [ "$dest" = "HEAD" ] && dest="$current_branch"
      targets+=("$dest")
    done
  fi

  for target in "${targets[@]}"; do
    if [[ "$target" =~ $PROTECTED ]]; then
      block "never push to $target; push your <issue>-<description> branch and open a PR"
    fi
  done
done < <(printf '%s' "$cmd" | grep -oE 'git[[:space:]]+push[^;&|]*')

exit 0
