#!/usr/bin/env bash
set -euo pipefail
cd `dirname $0`
log_info() {
    printf "[INFO] %s\n" "$1"
}

log_error() {
    printf "[ERROR] %s\n" "$1" >&2
}
install_nvm_and_node() {
    if [ -s "$HOME/.nvm/nvm.sh" ]; then
        log_info "NVM is already installed."
    else
        log_info "Installing NVM..."
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
    fi

    export NVM_DIR="$HOME/.nvm"
    # Immediately source nvm and bash_completion for the current session
    if [ -s "$NVM_DIR/nvm.sh" ]; then
        . "$NVM_DIR/nvm.sh"
    else
        log_error "nvm not found. Ensure it is installed correctly."
    fi

    if [ -s "$NVM_DIR/bash_completion" ]; then
        . "$NVM_DIR/bash_completion"
    fi

    if command -v node >/dev/null 2>&1; then
        local current_node
        current_node=$(node --version)
        local latest_node
        latest_node=$(nvm version-remote node)
        if [ "$current_node" = "$latest_node" ]; then
            log_info "Latest Node.js ($current_node) is already installed."
        else
            log_info "Updating Node.js: Installed ($current_node), Latest ($latest_node)."
            nvm install node
            nvm alias default node
            nvm use default
        fi
    else
        log_info "Installing Node.js via NVM..."
        nvm install node
        nvm alias default node
        nvm use default
    fi

    echo ""
}


install_nvm_and_node

cd bot/ && npm i -y