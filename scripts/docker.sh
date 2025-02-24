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
    running=$(docker ps -q -f name=starknet-agent-kit)
    if [ -n "$running" ]; then
        echo "Container 'starknet-agent-kit' is already running. Stopping it first."
        docker stop starknet-agent-kit
        docker rm starknet-agent-kit
    fi

    # Base directories to mount
    DIRECTORIES=(
        "config"
        "scripts"
        "src"
    )

    AGENT_SERVER_PORT=$(grep AGENT_SERVER_PORT .env | cut -d '=' -f2)
    AGENT_SERVER_PORT=${AGENT_SERVER_PORT:-8080}

    # Build the docker run command
    CMD="docker run --platform linux/amd64 -p ${AGENT_SERVER_PORT}:${AGENT_SERVER_PORT}"

    # Add environment variables from .env file
    if [ -f .env ]; then
        while IFS='=' read -r key value || [ -n "$key" ]; do
            # Skip empty lines and comments
            if [[ ! "$key" =~ ^[[:space:]]*# && -n "$key" ]]; then
                # Remove any leading/trailing whitespace
                key=$(echo "$key" | xargs)
                value=$(echo "$value" | xargs)

                # Handle quoted values
                if [[ $value == \"*\" || $value == \'*\' ]]; then
                    CMD="$CMD -e $key=$value"
                else
                    CMD="$CMD -e $key=\"$value\""
                fi
            fi
        done <.env
    else
        echo "Warning: .env file not found"
    fi

    # Add volume mounts
    for dir in "${DIRECTORIES[@]}"; do
        if [ -d "$(pwd)/${dir}" ]; then
            CMD="$CMD -v $(pwd)/${dir}:/app/${dir}"
        else
            echo "Warning: Directory ${dir} not found"
        fi
    done

    # Add name and container configuration
    CMD="$CMD -d --name starknet-agent-kit starknet-agent-kit"

    # Add startup command - using only backend
    CMD="$CMD sh -c 'pnpm start:backend'"

    # Print the command (optional, for debugging)
    echo "Executing: $CMD"

    # Execute the command
    eval "$CMD"
    ;;
start)
    docker start starknet-agent-kit
    ;;
bash)
    running=$(docker ps -q -f name=starknet-agent-kit)
    if [ -n "$running" ]; then
        docker exec -it starknet-agent-kit bash
    else
        echo "Container 'starknet-agent-kit' is not running. Please start it first."
        exit 1
    fi
    ;;
*)
    echo "Invalid option: $1"
    echo "Usage: $0 {build|run|start|bash}"
    exit 1
    ;;
esac
