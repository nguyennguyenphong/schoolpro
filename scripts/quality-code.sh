#!/usr/bin/env bash
# ==============================================================================
# SchoolPro - Comprehensive Code Quality & Format Verification Runner
# Verifies Frontend (Oxlint, TypeScript) and Backend (Ruff Lint, Ruff Format, Django Check)
# ==============================================================================
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
AUTO_FIX=false

for arg in "$@"; do
  if [ "$arg" == "--fix" ]; then
    AUTO_FIX=true
  fi
done

printf "\r\n"
printf "\033[1;36m+-------------------------------------------------------------+\033[0m\r\n"
printf "\033[1;36m| \033[1;34m       SCHOOLPRO FULLSTACK CODE QUALITY VERIFICATION       \033[1;36m|\033[0m\r\n"
printf "\033[1;36m+-------------------------------------------------------------+\033[0m\r\n"

# ------------------------------------------------------------------------------
# 1. FRONTEND: LINTING
# ------------------------------------------------------------------------------
printf "\r\n\033[1;33m[1/5] Frontend: Running Oxlint (Lint Check)...\033[0m\r\n"
if [ "$AUTO_FIX" = true ]; then
  (cd "$ROOT_DIR/schoolpro-frontend" && npx oxlint --fix)
else
  (cd "$ROOT_DIR/schoolpro-frontend" && npm run lint)
fi
printf "\033[1;32m--> [1/5] Frontend Oxlint: PASS\033[0m\r\n"

# ------------------------------------------------------------------------------
# 2. FRONTEND: TYPESCRIPT TYPECHECK
# ------------------------------------------------------------------------------
printf "\r\n\033[1;33m[2/5] Frontend: Running TypeScript Check (tsc -b)...\033[0m\r\n"
(cd "$ROOT_DIR/schoolpro-frontend" && npx tsc -b)
printf "\033[1;32m--> [2/5] Frontend TypeScript: PASS\033[0m\r\n"

# ------------------------------------------------------------------------------
# 3. BACKEND: RUFF LINT CHECK
# ------------------------------------------------------------------------------
printf "\r\n\033[1;33m[3/5] Backend: Running Ruff Lint Check...\033[0m\r\n"
if [ "$AUTO_FIX" = true ]; then
  (cd "$ROOT_DIR/schoolpro-backend" && source .venv/bin/activate && ruff check --fix apps/ config/ common/)
else
  (cd "$ROOT_DIR/schoolpro-backend" && source .venv/bin/activate && ruff check apps/ config/ common/)
fi
printf "\033[1;32m--> [3/5] Backend Ruff Lint: PASS\033[0m\r\n"

# ------------------------------------------------------------------------------
# 4. BACKEND: RUFF FORMAT CHECK
# ------------------------------------------------------------------------------
printf "\r\n\033[1;33m[4/5] Backend: Running Ruff Format Check...\033[0m\r\n"
if [ "$AUTO_FIX" = true ]; then
  (cd "$ROOT_DIR/schoolpro-backend" && source .venv/bin/activate && ruff format apps/ config/ common/)
else
  (cd "$ROOT_DIR/schoolpro-backend" && source .venv/bin/activate && ruff format --check apps/ config/ common/)
fi
printf "\033[1;32m--> [4/5] Backend Ruff Format: PASS\033[0m\r\n"

# ------------------------------------------------------------------------------
# 5. BACKEND: DJANGO SYSTEM CHECK
# ------------------------------------------------------------------------------
printf "\r\n\033[1;33m[5/5] Backend: Running Django System Check...\033[0m\r\n"
(cd "$ROOT_DIR/schoolpro-backend" && source .venv/bin/activate && python manage.py check)
printf "\033[1;32m--> [5/5] Backend Django System Check: PASS\033[0m\r\n"

# ------------------------------------------------------------------------------
# SUCCESS BANNER
# ------------------------------------------------------------------------------
printf "\r\n"
printf "\033[1;32m+-------------------------------------------------------------+\033[0m\r\n"
printf "\033[1;32m|   SUCCESS: ALL FRONTEND & BACKEND QUALITY CHECKS PASSED!   |\033[0m\r\n"
printf "\033[1;32m+-------------------------------------------------------------+\033[0m\r\n"
printf "\r\n"
