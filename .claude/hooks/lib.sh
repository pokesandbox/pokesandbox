# Shared helpers for the Claude Code hooks in this folder.

# Prints the Bash command from the PreToolUse JSON on stdin.
read_command() {
  node -e 'let s="";process.stdin.on("data",(d)=>(s+=d)).on("end",()=>{try{process.stdout.write(JSON.parse(s).tool_input.command||"")}catch{}})'
}
