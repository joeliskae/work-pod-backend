#!/bin/sh
set -e

DB_PATH="/app/data/usage.sqlite"
INITIAL_DB="/app/init/usage.sqlite"

if [ ! -f "$DB_PATH" ] && [ -f "$INITIAL_DB" ]; then
  echo "📦 Initializing usage.sqlite in volume..."
  cp "$INITIAL_DB" "$DB_PATH"
else
  echo "✅ usage.sqlite already present or no initial copy needed."
fi

exec "$@"
