#!/usr/bin/env sh

# Ensure the build fails if TypeScript fails
set -e

# Lint TypeScript source code
npx tsc --noEmit --pretty

# Bundle into JavaScript
npx esbuild \
  --bundle \
  --format=cjs \
  --outfile=XML.novaextension/Scripts/main.dist.js \
  src/Scripts/main.ts
