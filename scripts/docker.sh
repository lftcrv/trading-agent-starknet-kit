#!/bin/bash

# Check if an argument is provided
if [ -z "$1" ]; then
    echo "Usage: $0 {build|run|start|bash}"
    exit 1
fi

# Execute the corresponding command based on the argument
case "$1" in
build)
    echo "Building production image..."
    docker build --platform linux/amd64 -t starknet-agent-kit .
    ;;
run)
    running=$(docker ps -q -f name=starknet-agent)
    if [ -n "$running" ]; then
        echo "Container 'starknet-agent' is already running. Stopping it first."
        docker stop starknet-agent
        docker rm starknet-agent
    fi

    BASE_MOUNTS=(
        "config:/app/config"
        "scripts:/app/scripts"
        "src:/app/src"
    )

    # Build the docker run command
    CMD="docker run --platform linux/amd64 -p 3000:3000"

    # Add environment file
    CMD="$CMD --env-file .env"

    # Add base mounts
    for mount in "${BASE_MOUNTS[@]}"; do
        CMD="$CMD -v $(pwd)/$mount:/app/$mount"
    done

    # Add client mount for development
    CMD="$CMD -v $(pwd)/client:/app/client"

    # Add name and container configuration
    CMD="$CMD -d --name starknet-agent starknet-agent-kit"

    # Add startup command - using pnpm start which runs both backend and frontend
    CMD="$CMD sh -c 'pnpm start'"

    # Execute the command
    eval "$CMD"
    ;;
start)
    docker start starknet-agent
    ;;
bash)
    running=$(docker ps -q -f name=starknet-agent)
    if [ -n "$running" ]; then
        docker exec -it starknet-agent bash
    else
        echo "Container 'starknet-agent' is not running. Please start it first."
        exit 1
    fi
    ;;
*)
    echo "Invalid option: $1"
    echo "Usage: $0 {build|run|start|bash}"
    exit 1
    ;;
esac
