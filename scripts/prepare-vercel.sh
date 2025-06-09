#!/bin/bash

# Print current directory and contents for debugging
pwd
ls -la

# Move to project root (one level up from scripts directory)
cd "$(dirname "$0")/.."
echo "Moving to project root:"
pwd
ls -la

# Create necessary directories
mkdir -p dist/public
mkdir -p dist/api

# Copy API files
cp -r api/* dist/api/

# Copy static files
cp -r public/* dist/public/
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
