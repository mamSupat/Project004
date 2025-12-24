#!/usr/bin/env bash
set -euo pipefail

# Build Next.js static export from frontend and place it in ./build for Render static site deploys.
cd "$(dirname "$0")/frontend"

# Install pnpm if missing
if ! command -v pnpm >/dev/null 2>&1; then
  npm install -g pnpm
fi

pnpm install --no-frozen-lockfile
pnpm run build

# Copy export to root/build (Render publish directory)
rm -rf ../build
mkdir -p ../build
cp -r out/* ../build/
