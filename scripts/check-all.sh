#!/usr/bin/env bash
# ==============================================================================
# Full repository syntax, typing, and system verification runner (Wrapper)
# ==============================================================================
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec bash "$DIR/quality-code.sh" "$@"
