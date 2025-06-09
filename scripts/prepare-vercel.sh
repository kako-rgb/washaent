#!/bin/bash

# Print current directory and contents for debugging
echo "=== Starting Vercel preparation script ==="
pwd
ls -la

# Move to project root (one level up from scripts directory)
cd "$(dirname "$0")/.."
echo "=== Moving to project root ==="
pwd
ls -la

# Create necessary directories
echo "=== Creating deployment directories ==="
mkdir -p dist/public
mkdir -p dist/api

# Ensure required environment variables
echo "=== Checking environment variables ==="
if [ -f .env ]; then
    echo "Found .env file, copying to dist/api/"
    cp .env dist/api/.env
else
    echo "Warning: No .env file found"
fi

# Copy API files
echo "=== Copying API files ==="
cp -r api/* dist/api/
cp package.json dist/api/
cp package-lock.json dist/api/

# Install production dependencies in the api directory
echo "=== Installing production dependencies ==="
cd dist/api
npm ci --production
cd ../..

# Copy static files
echo "=== Copying static files ==="
cp -r public/* dist/public/

echo "=== Build preparation complete ==="
cp -r css dist/public/
cp -r js dist/public/
cp -r data dist/public/

# Copy HTML files
cp *.html dist/public/

# Copy package files
cp package.json dist/
cp package-lock.json dist/
cp vercel.json dist/

# Copy environment file
cp .env dist/

echo "Build completed successfully"
