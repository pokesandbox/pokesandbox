# Shared helpers for the Claude Code hooks in this folder.

# Prints the Bash command from the PreToolUse JSON on stdin.
read_command() {
  node -e 'let s="";process.stdin.on("data",(d)=>(s+=d)).on("end",()=>{try{process.stdout.write(JSON.parse(s).tool_input.command||"")}catch{}})'
}

# Switches to the Node major in .nvmrc when the hook inherited another one
# (Claude Code runs hooks with the Node it was launched with), since npm
# refuses to run under a Node that devEngines rejects. Uses nvm when it's
# installed; returns 1 with a message when the right Node can't be found.
# #226 (mise or Volta) replaces this.
use_repo_node() {
  [ -f .nvmrc ] || return 0
  local want have
  want="$(tr -d '[:space:]v' <.nvmrc)"
  have="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || true)"
  [ "$have" = "${want%%.*}" ] && return 0

  local nvm_sh="${NVM_DIR:-$HOME/.nvm}/nvm.sh"
  if [ -s "$nvm_sh" ]; then
    # nvm.sh reads unset variables, so relax `set -u` while it loads.
    set +u
    . "$nvm_sh" --no-use && nvm use --silent >/dev/null 2>&1
    local status=$?
    set -u
    [ "$status" -eq 0 ] && return 0
  fi
  echo "Node ${have:-(none)} is active but .nvmrc wants $want, and nvm couldn't switch to it. Install it with 'nvm install', or start Claude Code from a shell running Node $want." >&2
  return 1
}
