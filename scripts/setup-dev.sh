#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

npm install
