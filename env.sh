#!/bin/sh

# Replace environment variables in the built JavaScript files
# This script runs at container startup to inject runtime environment variables

# Get the API URL from environment variable, default to empty string
API_URL=${API_URL:-}

# Find all JavaScript files in the build directory
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|PLACEHOLDER_API_URL|${API_URL}|g" {} \;

echo "Environment variables injected: API_URL=${API_URL}"
