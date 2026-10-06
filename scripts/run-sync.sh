#!/bin/zsh
# Wrapper for launchd. Loads nvm (via login shell) so `node` and `npm` resolve.
set -u
cd "$(dirname "$0:A")/.."
[ -s "$HOME/.nvm/nvm.sh" ] && \. "$HOME/.nvm/nvm.sh"
npm run sync
sync_status=$?
# Knowledge base (verrijken + indexeren), opt-in via KB_AUTO=on in .env.
if grep -qE '^KB_AUTO="?on"?' .env 2>/dev/null; then
  npm run --silent kb || true
fi
exit $sync_status
