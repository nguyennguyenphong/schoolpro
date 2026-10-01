#!/usr/bin/env bash
# ==============================================================================
# Runner script for 'exe check' task in SchoolPro
# Performs end-to-end linting, typing, and validation across all projects
# ==============================================================================
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

printf "\r\n"
printf "\033[1;36m+-------------------------------------------------------------+\033[0m\r\n"
printf "\033[1;36m| \033[1;34m       STARTING SCHOOLPRO FULL REPOSITORY SYNTAX CHECK     \033[1;36m|\033[0m\r\n"
printf "\033[1;36m+-------------------------------------------------------------+\033[0m\r\n"

# 1. Frontend Oxlint
printf "\r\n\033[1;33m[1/4] Frontend: Running Oxlint...\033[0m\r\n"
(cd "$ROOT_DIR/schoolpro-frontend" && npm run lint)
printf "\033[1;32m--> Frontend Oxlint: PASS\033[0m\r\n"

# 2. Frontend TypeScript Typecheck
printf "\r\n\033[1;33m[2/4] Frontend: Running TypeScript Typecheck (tsc -b)...\033[0m\r\n"
(cd "$ROOT_DIR/schoolpro-frontend" && npx tsc -b)
printf "\033[1;32m--> Frontend TypeScript: PASS\033[0m\r\n"

# 3. Backend Django System Check
printf "\r\n\033[1;33m[3/4] Backend: Running Django System Check...\033[0m\r\n"
(cd "$ROOT_DIR/schoolpro-backend" && source .venv/bin/activate && python manage.py check)
printf "\033[1;32m--> Backend Django Check: PASS\033[0m\r\n"

# 4. Backend Ruff Linting
printf "\r\n\033[1;33m[4/4] Backend: Running Ruff Lint Check...\033[0m\r\n"
(cd "$ROOT_DIR/schoolpro-backend" && source .venv/bin/activate && ruff check apps/ config/ common/)
printf "\033[1;32m--> Backend Ruff Lint: PASS\033[0m\r\n"

printf "\r\n"
printf "\033[1;32m+-------------------------------------------------------------+\033[0m\r\n"
printf "\033[1;32m|   CONGRATULATIONS: ALL FRONTEND & BACKEND CHECKS PASSED!    |\033[0m\r\n"
printf "\033[1;32m+-------------------------------------------------------------+\033[0m\r\n"
printf "\r\n"
