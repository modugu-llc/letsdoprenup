#!/bin/sh

# Docker entrypoint script for backend container
# This script ensures Prisma operations are run before starting the application

echo "Starting backend container initialization..."

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "Error: Failed to generate Prisma client"
    exit 1
fi

# Deploy Prisma migrations
echo "Deploying Prisma migrations..."
npx prisma migrate deploy
if [ $? -ne 0 ]; then
    echo "Error: Failed to deploy Prisma migrations"
    exit 1
fi

echo "Prisma initialization completed successfully"

# Start the application
echo "Starting the application..."
exec npm start