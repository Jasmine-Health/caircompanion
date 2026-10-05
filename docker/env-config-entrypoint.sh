#!/bin/sh
# Writes the API URL from the pod environment. When the variable is unset,
# the build-time value in the bundle stays in use.
set -eu

if [ -n "${VITE_API_BASE_URL:-}" ]; then
  escaped=$(printf '%s' "$VITE_API_BASE_URL" | sed 's/\\/\\\\/g; s/"/\\"/g')
  printf 'window.__APP_CONFIG__ = { VITE_API_BASE_URL: "%s" };\n' "$escaped" > /usr/share/nginx/html/env-config.js
fi

if [ -x /docker-entrypoint.sh ]; then
  exec /docker-entrypoint.sh "$@"
fi

exec nginx -g 'daemon off;'
