#!/bin/sh
set -eu

# Apply migrations and seed demo accounts when the database section is empty.
# Safe to re-run: each section skips if data is already there.
if [ -n "${DATABASE_URL:-}" ]; then
  echo "db:setup…"
  ./node_modules/.bin/tsx --conditions=react-server scripts/db-setup.ts
else
  echo "DATABASE_URL is empty — refusing to start without Postgres in production."
  exit 1
fi

# Standalone server from `output: "standalone"` (cwd is /app).
exec node server.js
