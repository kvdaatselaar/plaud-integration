#!/bin/zsh
# Wrapper for launchd. Loads nvm (via login shell) so `node` and `npm` resolve.
set -u
cd "$(dirname "$0:A")/.."
[ -s "$HOME/.nvm/nvm.sh" ] && \. "$HOME/.nvm/nvm.sh"
# caffeinate: no idle sleep while the sync runs (a closed lid still sleeps).
caffeinate -i npm run sync
sync_status=$?
# Knowledge base (verrijken + indexeren), opt-in via KB_AUTO=on in .env.
# Skipped while another knowledge-base run is busy or scheduled (npm run kb:later).
if grep -qE '^KB_AUTO="?on"?' .env 2>/dev/null; then
  if pgrep -f 'scripts/kb-(beheer|enrich|index|later)' >/dev/null; then
    echo "Kennisbank overgeslagen: er loopt of wacht al een kennisbank-run."
  else
    # Detached (own process group), so launchd doesn't wait for it or stop it when the sync is done:
    # a long knowledge-base run must never block the next day's sync.
    node -e '
      const { spawn } = require("node:child_process");
      const log = require("node:fs").openSync(process.argv[1], "a");
      spawn("caffeinate", ["-i", "npm", "run", "--silent", "kb"], { detached: true, stdio: ["ignore", log, log] }).unref();
    ' "$HOME/.plaud-integration/sync.log"
    echo "Kennisbank gestart op de achtergrond (zie verderop in deze log)."
  fi
fi
exit $sync_status
