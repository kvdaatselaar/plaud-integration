#!/usr/bin/env bash
# Plaud → OneNote installer (macOS).
# Idempotent: safe to re-run; skips steps that are already done.
set -euo pipefail

cd "$(dirname "$0")"

PROJECT_DIR=$(pwd)
LAUNCH_AGENT="$HOME/Library/LaunchAgents/local.plaud-integration.plist"
STATE_DIR="$HOME/.plaud-integration"
PLAUD_CFG="$HOME/.plaud/config.json"

echo "==============================="
echo "Plaud → OneNote installer"
echo "==============================="
echo "Project: $PROJECT_DIR"
echo ""

prompt() {
  local p="$1" v=""
  read -r -p "$p" v
  printf '%s' "$v"
}

# --- 1. Node ---
if ! command -v node >/dev/null 2>&1; then
  echo "✗ Node niet gevonden. Installeer Node 20+ (https://nodejs.org/)."
  exit 1
fi
NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "✗ Node 20+ vereist (huidige: $(node -v))"
  exit 1
fi
echo "✓ Node $(node -v)"

# --- 2. npm install ---
if [ ! -d node_modules ]; then
  echo "→ npm install ..."
  npm install --silent
fi
echo "✓ Dependencies"

# --- 3. .env ---
if [ ! -f .env ]; then
  cp .env.example .env
  echo ""
  echo "Voor een Azure / Entra app-registratie volg README.md → 'Azure / Entra app-registratie'."
  echo "Daarna voer je hier het Application (client) ID in (of laat leeg om handmatig in .env te bewerken):"
  CLIENT_ID=$(prompt "  AZURE_CLIENT_ID: ")
  if [ -n "$CLIENT_ID" ]; then
    /usr/bin/sed -i '' "s|^AZURE_CLIENT_ID=.*|AZURE_CLIENT_ID=$CLIENT_ID|" .env
  fi
  TENANT=$(prompt "  AZURE_TENANT_ID [consumers voor persoonlijke MS-account]: ")
  if [ -n "$TENANT" ]; then
    /usr/bin/sed -i '' "s|^AZURE_TENANT_ID=.*|AZURE_TENANT_ID=$TENANT|" .env
  fi
fi

if ! grep -E "^AZURE_CLIENT_ID=.+" .env >/dev/null; then
  echo "⚠ AZURE_CLIENT_ID is nog leeg in .env. Bewerk en run install.sh opnieuw."
  exit 1
fi
echo "✓ .env"

# --- 4. State dir ---
mkdir -p "$STATE_DIR"
chmod 700 "$STATE_DIR"

# --- 5. Plaud login ---
if [ ! -f "$PLAUD_CFG" ] || ! grep -q '"token"' "$PLAUD_CFG" 2>/dev/null; then
  echo ""
  echo "→ Plaud-login (Playwright opent Chrome — log in met Google)"
  prompt "  Druk Enter om te starten: " >/dev/null
  npm run --silent plaud:browser-login
else
  echo "✓ Plaud-login (token aanwezig in $PLAUD_CFG)"
fi

# --- 6. Microsoft Graph login ---
if [ ! -f "$STATE_DIR/msal-cache.json" ]; then
  echo ""
  echo "→ Microsoft-login (device-code flow — open de URL en plak de code)"
  prompt "  Druk Enter om te starten: " >/dev/null
  npm run --silent graph:login
else
  echo "✓ MS-login (cache aanwezig)"
fi

# --- 7. Notebook ---
if [ ! -f "$STATE_DIR/state.json" ] || ! grep -q '"notebookId"' "$STATE_DIR/state.json" 2>/dev/null; then
  echo ""
  echo "→ OneNote notebook resolveren / aanmaken"
  npm run --silent graph:setup-notebook
else
  echo "✓ OneNote notebook (state.json heeft notebookId)"
fi

# --- 8. launchd ---
echo ""
if [ -f "$LAUNCH_AGENT" ]; then
  echo "✓ launchd plist al geïnstalleerd ($LAUNCH_AGENT)"
else
  ANS=$(prompt "Dagelijks automatisch syncen om 07:00 (launchd)? [Y/n]: ")
  if [ -z "$ANS" ] || [ "$ANS" = "y" ] || [ "$ANS" = "Y" ]; then
    /usr/bin/sed \
      -e "s|__PROJECT_DIR__|$PROJECT_DIR|g" \
      -e "s|__HOME__|$HOME|g" \
      launchd/local.plaud-integration.plist.template > "$LAUNCH_AGENT"
    launchctl load "$LAUNCH_AGENT"
    echo "✓ launchd geladen — draait elke dag om 07:00"
  else
    echo "Overgeslagen. Later activeren: ./install.sh"
  fi
fi

# --- 9. Wrapper executable ---
chmod +x scripts/run-sync.sh

echo ""
echo "==============================="
echo "Setup compleet."
echo ""
echo "Eerste sync:        npm run sync"
echo "Notebook openen:    npm run onenote:open"
echo "Logs:               $STATE_DIR/sync.log"
echo "==============================="
