#!/bin/zsh
# Wrapper for launchd. Loads nvm (via login shell) so `node` and `npm` resolve.
set -u
cd "$(dirname "$0:A")/.."
[ -s "$HOME/.nvm/nvm.sh" ] && \. "$HOME/.nvm/nvm.sh"
npm run sync
sync_status=$?
# Knowledge base (verrijken + indexeren), opt-in via KB_AUTO=on in .env.
# Skipped while another knowledge-base run is busy or scheduled (npm run kb:later).
if grep -qE '^KB_AUTO="?on"?' .env 2>/dev/null; then
  if pgrep -f 'scripts/kb-(beheer|enrich|index|later)' >/dev/null; then
    echo "Kennisbank overgeslagen: er loopt of wacht al een kennisbank-run."
  else
    npm run --silent kb || true
  fi
fi
exit $sync_status
