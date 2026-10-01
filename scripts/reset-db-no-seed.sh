#!/usr/bin/env bash
# ==============================================================================
# Wipes database volumes and re-creates all schemas & tables WITHOUT seed data
# ==============================================================================
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# 1. Reset containers and volumes with SKIP_SEED=true
export SKIP_SEED=true
docker compose -f "$REPO_ROOT/schoolpro-db/docker-compose.yml" down -v
docker compose -f "$REPO_ROOT/schoolpro-db/docker-compose.yml" up -d

# 2. Print confirmation
printf "\r\n"
printf "\033[1;36m+-------------------------------------------------------------+\033[0m\r\n"
printf "\033[1;33m|   DATABASE RESET COMPLETED (CLEAN SCHEMA - WITHOUT SEED)!   |\033[0m\r\n"
printf "\033[1;36m+-------------------------------------------------------------+\033[0m\r\n"
printf "    - Database : schoolpro\r\n"
printf "    - Port     : 5433\r\n"
printf "    - Tables   : All tables created\r\n"
printf "    - Seed Data: SKIPPED (Empty clean database)\r\n"
printf "\033[1;36m+-------------------------------------------------------------+\033[0m\r\n"
printf "\r\n"
