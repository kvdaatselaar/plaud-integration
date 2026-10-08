#!/bin/zsh
# Runs the full knowledge-base update later, e.g. overnight after a prompt change:
#   npm run kb:later -- 20:00
# Detaches, waits for that time (today, or tomorrow if it has passed) and then enriches on mains power
# only. While it waits or runs, the daily sync skips its knowledge-base step.
# Log: ~/.plaud-integration/kb-later.log · cancel: pkill -f 'scripts/kb-(later|enrich)'
set -u
cd "$(dirname "$0:A")/.."
at="${1:-20:00}"
logfile="$HOME/.plaud-integration/kb-later.log"

target=$(date -j -f "%Y-%m-%d %H:%M" "$(date +%Y-%m-%d) $at" +%s 2>/dev/null) || { echo "Tijd als HH:MM, bijv. 20:00"; exit 1; }
[ "$target" -le "$(date +%s)" ] && target=$((target + 86400))

if [ "${KB_LATER_CHILD:-}" != 1 ]; then
  if pgrep -f 'scripts/kb-later.sh' | grep -vxqE "$$|$PPID"; then
    echo "Er staat al een kennisbank-run gepland (annuleren: pkill -f 'scripts/kb-(later|enrich)')."
    exit 1
  fi
  mkdir -p "$(dirname "$logfile")"
  KB_LATER_CHILD=1 nohup /bin/zsh "$0:A" "$at" >> "$logfile" 2>&1 &
  echo "Kennisbank-run gepland op $(date -r "$target" '+%a %d %b %H:%M'). Log: $logfile"
  echo "Tot die tijd slaat de dagelijkse sync de kennisbank over. Laat de Mac aan de lader en open staan."
  exit 0
fi

[ -s "$HOME/.nvm/nvm.sh" ] && \. "$HOME/.nvm/nvm.sh"
echo "[$(date '+%F %T')] gepland voor $(date -r "$target" '+%F %H:%M')"
# A short sleep in a loop, so the start isn't delayed by the time the Mac was asleep.
while [ "$(date +%s)" -lt "$target" ]; do sleep 60; done
echo "[$(date '+%F %T')] start"
caffeinate -i npm run --silent kb:enrich -- --alleen-op-stroom
caffeinate -i npm run --silent kb
echo "[$(date '+%F %T')] klaar"
