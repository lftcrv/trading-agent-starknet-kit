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
RUN pnpm run build && pnpm prune --prod

# Final runtime image
FROM node:20-slim

# Install runtime dependencies
RUN npm install -g pnpm@9.15.4 && \
    apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y \
        python3 \
        curl \
        openssl && \
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

# Copy built artifacts and production dependencies from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client ./client
COPY --from=builder /app/config ./config
COPY --from=builder /app/scripts ./scripts

# Expose the ports (adjust according to your .env configuration)
EXPOSE 3000

# Default command to run the application
CMD ["pnpm", "start"]