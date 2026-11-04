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
#
# Pushing a branch not named <issue>-<kebab-description>. The PR gate checks the
# name too, but only once a PR is open; catching it here saves a rename later.
# The rule lives in .github/scripts/conventions.js (shared with the PR gate).
# Deletions and tags are exempt, so a badly named remote branch can be removed.
PROTECTED='^(develop|master)$'
CONVENTIONS="$(dirname "$0")/../../.github/scripts/conventions.js"
current_branch="$(git -C "${CLAUDE_PROJECT_DIR:-.}" rev-parse --abbrev-ref HEAD 2>/dev/null || true)"

while IFS= read -r segment; do
  [ -n "$segment" ] || continue
  # Words after "push", dropping options; what's left is [remote [refspec...]].
  read -r -a words <<<"${segment#*push}"
  positional=()
  deleting=false
  tags=false
  for word in "${words[@]}"; do
    case "$word" in
    --all | --mirror) block "never push every branch at once; push your <issue>-<description> branch" ;;
    --delete | -d) deleting=true ;;
    --tags) tags=true ;;
    -*) ;;
    *) positional+=("$word") ;;
    esac
  done

  if [ "${#positional[@]}" -le 1 ]; then
    # `git push --tags [remote]` pushes only tags.
    if [ "$tags" = true ]; then
      refspecs=()
    else
      refspecs=("HEAD")
    fi
  else
    refspecs=("${positional[@]:1}")
  fi

  for refspec in "${refspecs[@]}"; do
    dest="${refspec##*:}" # src:dest pushes to dest; a bare name pushes to itself
    dest="${dest#+}"
    [[ "$dest" == refs/tags/* ]] && continue
    dest="${dest#refs/heads/}"
    [ "$dest" = "HEAD" ] && dest="$current_branch"

    if [[ "$dest" =~ $PROTECTED ]]; then
      block "never push to $dest; push your <issue>-<description> branch and open a PR"
    fi

    # Deleting (`--delete <branch>` or `:<branch>`), or no branch to name (detached HEAD).
    if [ "$deleting" = true ] || [[ "$refspec" == :* ]] || [ -z "$dest" ] || [ "$dest" = "HEAD" ]; then
      continue
    fi
    if ! node "$CONVENTIONS" branch-name "$dest" >/dev/null 2>&1; then
      block "branch \"$dest\" isn't named <issue>-<kebab-description>; rename it with 'git branch -m <issue>-<description>' (e.g. 104-encode-architecture-rules), then push that branch"
    fi
  done
done < <(printf '%s' "$cmd" | grep -oE 'git[[:space:]]+push[^;&|]*')

exit 0
