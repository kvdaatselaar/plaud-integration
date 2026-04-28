#!/usr/bin/env bash
# Plaud → OneNote bootstrap.
# Designed for one-liner install:
#   curl -fsSL https://raw.githubusercontent.com/kvdaatselaar/plaud-integration/main/bootstrap.sh | bash
set -euo pipefail

REPO_URL="https://github.com/kvdaatselaar/plaud-integration.git"
DEFAULT_DIR="$HOME/plaud-integration"

# When piped to bash, stdin == the script. Reattach to terminal so `read` works.
if [ ! -t 0 ]; then
  if [ -e /dev/tty ]; then
    exec < /dev/tty
  else
    echo "Cannot read from terminal — run with:"
    echo "  bash <(curl -fsSL https://raw.githubusercontent.com/kvdaatselaar/plaud-integration/main/bootstrap.sh)"
    exit 1
  fi
fi

cat <<'EOF'

  ___ _              _
 | _ \ |__ _ _  _ __| |
 |  _/ / _` | || / _` |
 |_| |_\__,_|\_,_\__,_|   →  OneNote bootstrap

EOF

# 1. macOS-only smoke check
if [ "$(uname)" != "Darwin" ]; then
  echo "⚠ Dit project is macOS-only (gebruikt launchd). Doorgaan op eigen risico."
  read -r -p "Toch doorgaan? [y/N]: " A
  [ "$A" = "y" ] || [ "$A" = "Y" ] || exit 1
fi

# 2. Required tools
for cmd in git node npm; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "✗ $cmd niet gevonden. Installeer 'm eerst:"
    case "$cmd" in
      git) echo "  xcode-select --install   (of: brew install git)";;
      node|npm) echo "  brew install node     (of: https://nodejs.org/)";;
    esac
    exit 1
  fi
done

NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "✗ Node 20+ vereist (huidige: $(node -v)). Update via brew of nvm."
  exit 1
fi

# 3. Install location
read -r -p "Install location [$DEFAULT_DIR]: " DIR
DIR=${DIR:-$DEFAULT_DIR}
DIR="${DIR/#\~/$HOME}"

if [ -e "$DIR" ]; then
  if [ -d "$DIR/.git" ]; then
    echo "→ $DIR bestaat al — git pull"
    cd "$DIR"
    git pull --ff-only
  else
    echo "✗ $DIR bestaat al en is geen git checkout. Verwijder/verplaats of kies een andere locatie."
    exit 1
  fi
else
  echo "→ git clone $REPO_URL → $DIR"
  git clone --depth 1 "$REPO_URL" "$DIR"
  cd "$DIR"
fi

# 4. Run installer
echo ""
echo "→ ./install.sh"
echo ""
exec ./install.sh
