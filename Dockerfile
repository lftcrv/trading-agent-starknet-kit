# Use a specific Node.js version for better reproducibility
FROM node:20-slim AS builder
# Install pnpm globally and necessary build tools
RUN npm install -g pnpm@9.15.4 && \
    apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y \
    git \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    curl \
    node-gyp \
    make \
    g++ \
    build-essential \
    openssl \
    libssl-dev && \
# Install Rust
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y && \
    . $HOME/.cargo/env && \
    rustup default stable && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
# Make sure Rust is in the PATH
ENV PATH="/root/.cargo/bin:${PATH}"
ENV RUSTUP_HOME=/root/.rustup
ENV CARGO_HOME=/root/.cargo
# Set the working directory
WORKDIR /app
# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY client/package.json ./client/package.json
# Install dependencies
RUN pnpm install --frozen-lockfile
# Copy application code
COPY . .
# Build the project
RUN pnpm run build:backend && pnpm prune --prod

# Build Python dependencies directly in the correct location
FROM python:3.11-slim AS python-deps
WORKDIR /app
# Install build dependencies and Rust
RUN apt-get update && \
    apt-get install -y \
    build-essential \
    curl \
    make \
    g++ \
    libssl-dev && \
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y && \
    . $HOME/.cargo/env && \
    rustup default stable
# Add Rust to PATH
ENV PATH="/root/.cargo/bin:${PATH}"
ENV RUSTUP_HOME=/root/.rustup
ENV CARGO_HOME=/root/.cargo

# Create the directory structure
RUN mkdir -p /app/scripts/paradex-python/.venv

# Copy requirements and install Python dependencies directly into the correct location
COPY scripts/paradex-python/requirements.txt /app/scripts/paradex-python/
RUN python -m pip install --upgrade pip && \
    pip install --target=/app/scripts/paradex-python/.venv/lib/python3.11/site-packages --no-cache-dir -r /app/scripts/paradex-python/requirements.txt && \
    # Create the Python structure needed for a proper virtual environment
    mkdir -p /app/scripts/paradex-python/.venv/bin && \
    ln -s /usr/local/bin/python /app/scripts/paradex-python/.venv/bin/python && \
    ln -s /usr/local/bin/python3 /app/scripts/paradex-python/.venv/bin/python3 && \
    # Create the activation script
    echo '# This file must be used with "source bin/activate" *from bash*' > /app/scripts/paradex-python/.venv/bin/activate && \
    echo 'export VIRTUAL_ENV="/app/scripts/paradex-python/.venv"' >> /app/scripts/paradex-python/.venv/bin/activate && \
    echo 'export PATH="$VIRTUAL_ENV/bin:$PATH"' >> /app/scripts/paradex-python/.venv/bin/activate && \
    echo 'export PYTHONPATH="$VIRTUAL_ENV/lib/python3.11/site-packages:$PYTHONPATH"' >> /app/scripts/paradex-python/.venv/bin/activate

# Final runtime image
FROM node:20-slim
# Install runtime dependencies
RUN npm install -g pnpm@9.15.4 && \
    apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    python3.11-venv \
    build-essential \
    curl \
    openssl \
    libssl-dev && \
# Install Rust (needed for runtime)
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y && \
    . $HOME/.cargo/env && \
    rustup default stable && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
# Set Rust environment variables
ENV PATH="/root/.cargo/bin:${PATH}"
ENV RUSTUP_HOME=/root/.rustup
ENV CARGO_HOME=/root/.cargo

# Set the working directory
WORKDIR /app

# Copy the pre-built Python environment in the correct location
COPY --from=python-deps /app/scripts/paradex-python/.venv /app/scripts/paradex-python/.venv

# Make Python packages globally available (this is key for the updated onboarding.sh)
ENV PYTHONPATH="/app/scripts/paradex-python/.venv/lib/python3.11/site-packages:${PYTHONPATH}"

# Copy built artifacts and production dependencies from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client ./client
COPY --from=builder /app/config ./config
COPY --from=builder /app/scripts ./scripts

# Copy and setup entrypoint script
COPY scripts/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh && \
    chmod +x /app/scripts/onboarding.sh

# Create the environment file if it doesn't exist
RUN touch /app/scripts/paradex-python/.venv/.paradex_env && \
    chmod 600 /app/scripts/paradex-python/.venv/.paradex_env

# Expose the ports
EXPOSE 8080

# Set the entrypoint
ENTRYPOINT ["/entrypoint.sh"]