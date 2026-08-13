#!/bin/bash
set -e

echo "=== Building ==="
tsc -b && vite build

echo "=== Starting preview server ==="
npx vite preview --port 4173 &
SERVER_PID=$!

# Wait for server to be ready
for i in $(seq 1 20); do
  if curl -s http://localhost:4173 > /dev/null 2>&1; then
    break
  fi
  sleep 0.5
done

echo "=== Prerendering ==="
node scripts/prerender.mjs
PRERENDER_EXIT=$?

echo "=== Stopping server ==="
kill $SERVER_PID 2>/dev/null || true
wait $SERVER_PID 2>/dev/null || true

exit $PRERENDER_EXIT
