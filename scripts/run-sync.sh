#!/bin/zsh
# Wrapper for launchd. Loads nvm (via login shell) so `node` and `npm` resolve.
set -eu
cd "$(dirname "$0:A")/.."
[ -s "$HOME/.nvm/nvm.sh" ] && \. "$HOME/.nvm/nvm.sh"
exec npm run sync
