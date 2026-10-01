#!/usr/bin/env bash
# ==============================================================================
# Runner script for 'exe db' task in SchoolPro
# ==============================================================================
set -e

# 1. Check if Docker daemon is running, start Docker Desktop if needed
if ! docker info >/dev/null 2>&1; then
  printf "\r\n\033[1;33m[!] Docker daemon is not running. Starting Docker Desktop, please wait...\033[0m\r\n"
  open -a Docker 2>/dev/null || true
  while ! docker info >/dev/null 2>&1; do
    sleep 2
  done
  printf "\033[1;32m[+] Docker Desktop is ready!\033[0m\r\n"
fi

# 2. Start PostgreSQL & pgAdmin containers
docker compose -f schoolpro-db/docker-compose.yml up -d

# 3. Print beautifully aligned summary box
printf "\r\n"
printf "\033[1;36m+-------------------------------------------------------------+\033[0m\r\n"
printf "\033[1;36m| \033[1;32m      POSTGRESQL & PGADMIN STARTED SUCCESSFULLY!            \033[1;36m|\033[0m\r\n"
printf "\033[1;36m+-------------------------------------------------------------+\033[0m\r\n"
printf "\033[1;33m[*] DATABASE CONNECTION INFO (PGADMIN / DBEAVER / TABLEPLUS):\033[0m\r\n"
printf "    - Host name / address : localhost\r\n"
printf "    - Port                : 5433  (Docker port, avoids host Postgres conflict)\r\n"
printf "    - Maintenance database: schoolpro\r\n"
printf "    - Username            : postgres\r\n"
printf "    - Password            : password123\r\n"
printf "\033[1;36m+-------------------------------------------------------------+\033[0m\r\n"
printf "\033[1;35m[*] PGADMIN 4 WEB UI (Open in your browser):\033[0m\r\n"
printf "    - URL                 : http://localhost:5050\r\n"
printf "    - Login Email         : admin@schoolpro.edu.vn\r\n"
printf "    - Password            : admin\r\n"
printf "    - Default Server      : Pre-configured 'SchoolPro' connection ready\r\n"
printf "\033[1;36m+-------------------------------------------------------------+\033[0m\r\n"
printf "\r\n"
