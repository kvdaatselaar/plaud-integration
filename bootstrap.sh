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

# 2. Brew-aware install helper
HAS_BREW=0
command -v brew >/dev/null 2>&1 && HAS_BREW=1

try_install() {
  local what="$1" brew_pkg="$2" alt="$3"
  echo "✗ $what niet gevonden"
  echo "  Suggested: $alt"
  if [ "$HAS_BREW" -eq 1 ]; then
    read -r -p "  Nu installeren via 'brew install $brew_pkg'? [Y/n]: " A
    if [ -z "$A" ] || [ "$A" = "y" ] || [ "$A" = "Y" ]; then
      brew install "$brew_pkg" || { echo "  brew install faalde."; return 1; }
      return 0
    fi
    echo "  Geannuleerd. Installeer handmatig en probeer opnieuw."
  else
    echo "  Homebrew niet gevonden — installeer Homebrew eerst:"
    echo "    /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
  fi
  return 1
}

# 3. Required tools (auto-install if mogelijk)
if ! command -v git >/dev/null 2>&1; then
  echo "✗ git niet gevonden"
  echo "  Snelste optie: xcode-select --install   (~200MB, levert git + clang)"
  if [ "$HAS_BREW" -eq 1 ]; then
    read -r -p "  Of via 'brew install git'? [Y/n]: " A
    if [ -z "$A" ] || [ "$A" = "y" ] || [ "$A" = "Y" ]; then
      brew install git || exit 1
    else
      exit 1
    fi
  else
    exit 1
  fi
fi

if ! command -v node >/dev/null 2>&1; then
  try_install node node "brew install node  (of nvm: https://github.com/nvm-sh/nvm)" || exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "✗ npm niet gevonden — herinstalleer node ('brew reinstall node')."
  exit 1
fi

NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "✗ Node 20+ vereist (huidige: $(node -v))"
  if [ "$HAS_BREW" -eq 1 ]; then
    read -r -p "  Upgraden via 'brew upgrade node'? [Y/n]: " A
    if [ -z "$A" ] || [ "$A" = "y" ] || [ "$A" = "Y" ]; then
      brew upgrade node || exit 1
    else
      exit 1
    fi
  else
    echo "  Update via brew of nvm."
    exit 1
  fi
fi
echo "✓ Prerequisites: git, node $(node -v), npm"

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
