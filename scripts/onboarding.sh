#!/bin/sh

# Function to display messages with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to check if a command executed successfully
check_error() {
    if [ $? -ne 0 ]; then
        log "❌ Error: $1"
        exit 1
    fi
}

# Path to paradex-python directory
PARADEX_PATH="/app/scripts/paradex-python"
ENV_FILE="$PARADEX_PATH/.venv/.paradex_env"
SYSTEM_ENV="/etc/environment"

# Check if directory exists
if [ ! -d "$PARADEX_PATH" ]; then
    log "❌ Error: Directory $PARADEX_PATH does not exist"
    exit 1
fi

# Move to directory
cd "$PARADEX_PATH"
check_error "Unable to access directory $PARADEX_PATH"

# Use the pre-built virtual environment from Docker build
log "🔄 Using pre-built virtual environment..."

# Ensure directory for environment file exists
mkdir -p .venv
touch .venv/.paradex_env
chmod 600 .venv/.paradex_env

# Check if ETHEREUM_PRIVATE_KEY is set
if [ -z "$ETHEREUM_PRIVATE_KEY" ]; then
    log "⚠️ ETHEREUM_PRIVATE_KEY is not set"
    exit 1
fi

log "🚀 Starting onboarding script..."

# Use the global Python environment that was prepared in the Dockerfile
# This avoids recreating and reinstalling everything
python3 onboarding.py
check_error "Error running onboarding script"

# If onboarding successful, export environment variables
if [ -f "$ENV_FILE" ]; then
    log "📥 Exporting environment variables..."
    # Backup current /etc/environment
    cp $SYSTEM_ENV "${SYSTEM_ENV}.bak"

    # Read each line from file and export variables
    while IFS= read -r line; do
        case "$line" in
        export*)
            # Export to current shell
            eval "$line"
            # Extract name and value without 'export'
            var_name=$(echo "$line" | cut -d'=' -f1 | cut -d' ' -f2)
            var_value=$(eval "echo \$$var_name")
            # Add to system file (without 'export')
            echo "$var_name='$var_value'" >>$SYSTEM_ENV
            # Display exported variable
            case "$var_name" in
            *PRIVATE_KEY*)
                log "✓ $var_name='${var_value%"${var_value#??????????}"}...'"
                ;;
            *)
                log "✓ $var_name='$var_value'"
                ;;
            esac
            ;;
        esac
    done <"$ENV_FILE"
    log "🔍 Variables added to $SYSTEM_ENV"
    # Verify exports
    log "🔍 Verifying system exports:"
    grep "PARADEX_" $SYSTEM_ENV
fi

log "✅ Onboarding completed successfully!"
