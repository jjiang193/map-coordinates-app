#!/bin/bash

# Deploy script for Vercel

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo "Vercel CLI is not installed. Installing..."
    npm install -g vercel
fi

# Ensure we're in the right directory
cd "$(dirname "$0")"

echo "Preparing for deployment..."

# Build the project
npm run build

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod

echo "Deployment complete!" 