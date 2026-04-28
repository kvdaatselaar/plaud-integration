#!/usr/bin/env bash
# Plaud → OneNote uninstaller (macOS).
set -euo pipefail

LAUNCH_AGENT="$HOME/Library/LaunchAgents/local.plaud-integration.plist"
STATE_DIR="$HOME/.plaud-integration"

if [ -f "$LAUNCH_AGENT" ]; then
  launchctl unload "$LAUNCH_AGENT" 2>/dev/null || true
  rm "$LAUNCH_AGENT"
  echo "✓ launchd plist verwijderd"
else
  echo "· geen launchd plist gevonden"
fi

read -r -p "Ook lokale state verwijderen ($STATE_DIR)? [y/N]: " A
if [ "$A" = "y" ] || [ "$A" = "Y" ]; then
  rm -rf "$STATE_DIR"
  echo "✓ $STATE_DIR verwijderd"
fi

read -r -p "Ook Plaud-credentials verwijderen ($HOME/.plaud)? [y/N]: " B
if [ "$B" = "y" ] || [ "$B" = "Y" ]; then
  rm -rf "$HOME/.plaud"
  echo "✓ $HOME/.plaud verwijderd"
fi

echo ""
echo "Uninstall klaar. (.env, node_modules en deze projectmap heb ik niet aangeraakt.)"
