#!/bin/bash

echo "🚀 Starting Frontend Development Server"
echo "======================================"

# Clear cache
echo "Clearing cache..."
rm -rf node_modules/.cache

# Set environment variables for better development experience
export FAST_REFRESH=false
export GENERATE_SOURCEMAP=false

# Start the development server
echo "Starting React development server..."
yarn start