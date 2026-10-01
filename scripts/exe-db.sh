#!/usr/bin/env bash
# ==============================================================================
# Runner script for 'exe db' task in SchoolPro
# ==============================================================================
set -e

# 1. Check if Docker daemon is running, start Docker Desktop if needed
if ! docker info >/dev/null 2>&1; then
  printf "\r\n\033[1;33m[!] Docker Desktop chua khoi dong. Dang tu dong mo Docker Desktop, vui long doi giay lat...\033[0m\r\n"
  open -a Docker 2>/dev/null || true
  while ! docker info >/dev/null 2>&1; do
    sleep 2
  done
  printf "\033[1;32m[+] Docker Desktop da san sang!\033[0m\r\n"
fi

# 2. Start PostgreSQL & pgAdmin containers
docker compose -f schoolpro-db/docker-compose.yml up -d

# 3. Print beautifully aligned summary box
printf "\r\n"
printf "\033[1;36m+-------------------------------------------------------------+\033[0m\r\n"
printf "\033[1;36m| \033[1;32m    POSTGRESQL & PGADMIN DA KHOI DONG THANH CONG!         \033[1;36m|\033[0m\r\n"
printf "\033[1;36m+-------------------------------------------------------------+\033[0m\r\n"
printf "\033[1;33m[*] THONG TIN KET NOI TU PGADMIN / DBEAVER / TABLEPLUS:\033[0m\r\n"
printf "    - Host name / address : localhost\r\n"
printf "    - Port                : 5433  (Cong Docker, tranh xung dot Postgres may)\r\n"
printf "    - Maintenance database: schoolpro\r\n"
printf "    - Username            : postgres\r\n"
printf "    - Password            : password123\r\n"
printf "\033[1;36m+-------------------------------------------------------------+\033[0m\r\n"
printf "\033[1;35m[*] PGADMIN 4 WEB UI (Mo tren trinh duyet):\033[0m\r\n"
printf "    - URL                 : http://localhost:5050\r\n"
printf "    - Email dang nhap     : admin@schoolpro.edu.vn\r\n"
printf "    - Mat khau            : admin\r\n"
printf "    - Server san co       : Da tu dong ket noi 'SchoolPro'\r\n"
printf "\033[1;36m+-------------------------------------------------------------+\033[0m\r\n"
printf "\r\n"
