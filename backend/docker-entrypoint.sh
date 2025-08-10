#!/bin/sh

# Docker entrypoint script for backend container
echo "Starting backend container initialization..."

echo "Container initialization completed successfully"

# Start the application
echo "Starting the application..."
exec npm start