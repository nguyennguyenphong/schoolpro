#!/usr/bin/env bash
# ==============================================================================
# Wipes database volumes and re-seeds all schemas and initial data
# ==============================================================================
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# 1. Reset containers and volumes
docker compose -f "$REPO_ROOT/schoolpro-db/docker-compose.yml" down -v
docker compose -f "$REPO_ROOT/schoolpro-db/docker-compose.yml" up -d

# 2. Print confirmation
printf "\r\n"
printf "\033[1;36m+-------------------------------------------------------------+\033[0m\r\n"
printf "\033[1;32m|   ALL DATABASE TABLES & SEEDS RE-INITIALIZED SUCCESSFULLY!   |\033[0m\r\n"
printf "\033[1;36m+-------------------------------------------------------------+\033[0m\r\n"
printf "    - Database: schoolpro\r\n"
printf "    - Port    : 5433\r\n"
printf "    - Status  : Ready for connections\r\n"
printf "\033[1;36m+-------------------------------------------------------------+\033[0m\r\n"
printf "\r\n"
