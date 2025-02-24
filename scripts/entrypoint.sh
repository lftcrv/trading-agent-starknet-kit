#!/bin/sh

# Function to display messages with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Run onboarding if ETHEREUM_PRIVATE_KEY is provided
if [ ! -z "$ETHEREUM_PRIVATE_KEY" ]; then
    log "🔄 Running onboarding script..."
    /app/scripts/onboarding.sh
    if [ $? -ne 0 ]; then
        log "❌ Onboarding failed"
        exit 1
    fi
    log "✅ Onboarding completed"
fi

# Load environment variables from /etc/environment
if [ -f "/etc/environment" ]; then
    log "📥 Loading environment variables..."
    while IFS='=' read -r key value; do
        # Remove surrounding quotes if present
        value=$(echo "$value" | sed "s/^'//;s/'$//")
        # Export the variable
        export "$key=$value"
        log "✓ Exported: $key"
    done <"/etc/environment"
fi

# Start the backend application
log "🚀 Starting backend application..."
exec pnpm start:backend
