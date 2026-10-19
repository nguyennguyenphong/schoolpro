#!/usr/bin/env bash
# ==============================================================================
# Script: create-branch-from-issue.sh
# Purpose: Interactively select an open GitHub issue, create a standardized branch
#          (issue code + slug), push to origin, and auto-generate a linked Pull Request.
# ==============================================================================

set -euo pipefail

# Color palette for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${CYAN}${BOLD}======================================================================${NC}"
echo -e "${CYAN}${BOLD}   🚀 SchoolPro - Create Git Branch & Pull Request from Issue        ${NC}"
echo -e "${CYAN}${BOLD}======================================================================${NC}"

# 1. Check prerequisites
if ! command -v git >/dev/null 2>&1; then
  echo -e "${RED}❌ Error: Git is not installed on your system.${NC}"
  exit 1
fi

# 2. Check current branch must be 'main'
current_branch=$(git branch --show-current 2>/dev/null || git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")

if [ "$current_branch" != "main" ]; then
  echo -e "\n${RED}${BOLD}======================================================================${NC}"
  echo -e "${RED}${BOLD}   ❌ ERROR: YOU MUST SWITCH TO 'main' BRANCH BEFORE PROCEEDING!     ${NC}"
  echo -e "${RED}${BOLD}======================================================================${NC}"
  echo -e "${RED}Current branch:${NC} ${YELLOW}${BOLD}${current_branch:-<unknown>}${NC}"
  echo -e "${RED}Mandatory requirement: You must be on the '${BOLD}main${NC}${RED}' branch to create a new branch and Pull Request.${NC}"
  echo -e "${RED}This ensures your new feature branch cleanly diverges from the latest codebase.${NC}\n"
  echo -e "${YELLOW}👉 Please run the following command in your terminal:${NC}"
  echo -e "   ${CYAN}${BOLD}git checkout main${NC}  ${YELLOW}(or: ${CYAN}${BOLD}git switch main${NC}${YELLOW})${NC}"
  echo -e "   ${CYAN}${BOLD}git pull origin main${NC}  ${YELLOW}(to sync latest changes)${NC}"
  echo -e "${YELLOW}Then rerun the '${BOLD}create branch from issue${NC}${YELLOW}' task.${NC}\n"
  exit 1
fi

echo -e "\n${GREEN}✅ Current branch: ${BOLD}main${NC}${GREEN} (Valid to create a new branch).${NC}"

# 3. Check GitHub CLI prerequisites
if ! command -v gh >/dev/null 2>&1; then
  echo -e "${RED}❌ Error: GitHub CLI ('gh') is not installed.${NC}"
  echo -e "${YELLOW}👉 Install with: brew install gh${NC}"
  exit 1
fi

# Check GitHub CLI authentication
if ! gh auth status >/dev/null 2>&1; then
  echo -e "${YELLOW}⚠️  You are not authenticated with GitHub CLI.${NC}"
  echo -e "${CYAN}Launching GitHub CLI login flow...${NC}"
  gh auth login
fi

# 4. Check git working directory status
if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
  echo -e "${YELLOW}⚠️  Warning: Working directory on 'main' branch has uncommitted changes.${NC}"
  read -r -p "Do you want to continue creating a branch from the current state? [y/N]: " continue_dirty
  if [[ ! "$continue_dirty" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Operation cancelled. Please commit or stash changes before creating a new branch.${NC}"
    exit 0
  fi
else
  # Optionally sync latest main from origin when working tree is clean
  echo -e "${BLUE}⏳ Checking and syncing latest changes from origin/main...${NC}"
  if git pull origin main --ff-only 2>/dev/null; then
    echo -e "${GREEN}✅ Branch 'main' is up to date with origin/main.${NC}"
  fi
fi

# 5. Fetch open issues from repository
echo -e "\n${BLUE}⏳ Fetching open GitHub issues...${NC}"
issues_json=$(gh issue list --state open --limit 30 --json number,title,labels 2>/dev/null || echo "[]")

issue_count=$(echo "$issues_json" | node -e '
  const data = JSON.parse(require("fs").readFileSync(0, "utf-8") || "[]");
  console.log(data.length);
' 2>/dev/null || echo "0")

if [ "$issue_count" -eq 0 ]; then
  echo -e "${YELLOW}ℹ️  No open issues found in this repository.${NC}"
  read -r -p "Enter issue number manually (or 'q' to cancel): " manual_issue
  if [[ "$manual_issue" =~ ^[Qq]$ || -z "$manual_issue" ]]; then
    exit 0
  fi
  selected_number="${manual_issue#\#}"
  selected_title=$(gh issue view "$selected_number" --json title -q .title 2>/dev/null || echo "issue-$selected_number")
else
  echo -e "${GREEN}Found ${BOLD}${issue_count}${NC}${GREEN} open issues:${NC}\n"

  # Display formatted list of issues
  node -e '
    const issues = JSON.parse(process.argv[1]);
    issues.forEach((item, index) => {
      const idx = String(index + 1).padStart(2, " ");
      const num = `#${item.number}`.padEnd(6, " ");
      const labels = (item.labels || []).map(l => l.name).join(", ");
      const labelBadge = labels ? ` \x1b[35m[${labels}]\x1b[0m` : "";
      console.log(` \x1b[36m[${idx}]\x1b[0m \x1b[33m${num}\x1b[0m \x1b[1m${item.title}\x1b[0m${labelBadge}`);
    });
  ' "$issues_json"

  echo ""
  while true; do
    read -r -p "👉 Enter index [1-${issue_count}] or issue number (#XX) (or 'q' to cancel): " user_choice

    if [[ "$user_choice" =~ ^[Qq]$ ]]; then
      echo -e "${YELLOW}Operation cancelled.${NC}"
      exit 0
    fi

    # Check if user entered an index (1..N)
    if [[ "$user_choice" =~ ^[0-9]+$ ]] && [ "$user_choice" -ge 1 ] && [ "$user_choice" -le "$issue_count" ]; then
      selected_number=$(node -e '
        const issues = JSON.parse(process.argv[1]);
        const idx = parseInt(process.argv[2], 10) - 1;
        console.log(issues[idx]?.number || "");
      ' "$issues_json" "$user_choice")

      selected_title=$(node -e '
        const issues = JSON.parse(process.argv[1]);
        const idx = parseInt(process.argv[2], 10) - 1;
        console.log(issues[idx]?.title || "");
      ' "$issues_json" "$user_choice")
      break
    fi

    # Check if user entered issue number directly (#42 or 42)
    clean_num="${user_choice#\#}"
    matched_title=$(node -e '
      const issues = JSON.parse(process.argv[1]);
      const num = parseInt(process.argv[2], 10);
      const found = issues.find(i => i.number === num);
      console.log(found ? found.title : "");
    ' "$issues_json" "$clean_num")

    if [ -n "$matched_title" ]; then
      selected_number="$clean_num"
      selected_title="$matched_title"
      break
    else
      echo -e "${RED}Invalid selection, please try again!${NC}"
    fi
  done
fi

echo -e "\n${CYAN}Selected issue: ${BOLD}#${selected_number} - ${selected_title}${NC}"

# 6. Generate clean URL/Git slug (with full accent normalization)
slug=$(node -e '
  const input = process.argv[1] || "";
  const slug = input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50)
    .replace(/-+$/, "");
  console.log(slug);
' "$selected_title")

# Standard branch name: <issue_number>-<slug>
default_branch="${selected_number}-${slug}"

echo -e "\n${BLUE}Recommended branch name:${NC} ${GREEN}${BOLD}${default_branch}${NC}"
read -r -p "Press [Enter] to accept, or enter custom branch name: " custom_branch
branch_name="${custom_branch:-$default_branch}"

# Sanitize branch name
branch_name=$(echo "$branch_name" | tr ' ' '-' | sed 's/--*/-/g')

# 7. Create and switch to local branch
echo -e "\n${BLUE}⏳ Creating and checking out branch '${BOLD}${branch_name}${NC}${BLUE}'...${NC}"

if git show-ref --verify --quiet "refs/heads/${branch_name}"; then
  echo -e "${YELLOW}Branch '${branch_name}' already exists locally. Switching to branch...${NC}"
  git checkout "${branch_name}"
else
  git checkout -b "${branch_name}"
fi

# 8. Initialize branch and push to remote origin
echo -e "\n${BLUE}⏳ Initializing commit and pushing branch to origin...${NC}"

# Create an initial empty commit to allow creating Pull Request immediately if branch has no commits
if ! git log -n 1 --pretty=format:"%s" 2>/dev/null | grep -q "issue-${selected_number}"; then
  git commit --allow-empty -m "chore(issue-${selected_number}): start work on #${selected_number} - ${selected_title}" --quiet
fi

git push -u origin "${branch_name}"

# 9. Auto-create Pull Request linked to the Issue
echo -e "\n${BLUE}⏳ Auto-generating Pull Request for Issue #${selected_number}...${NC}"

# Check if a PR already exists for this branch
existing_pr=$(gh pr list --head "${branch_name}" --json url --jq '.[0].url' 2>/dev/null || echo "")

if [ -n "$existing_pr" ]; then
  echo -e "${GREEN}✅ Pull Request already exists for this branch:${NC} ${BOLD}${existing_pr}${NC}"
else
  pr_title="[#${selected_number}] ${selected_title}"
  
  # GitHub keywords like 'Closes #XX' or 'Fixes #XX' will automatically link and close the issue on merge
  pr_body=$(cat <<EOF
## 🎯 Linked Issue
Closes #${selected_number}

## 📝 Summary
Work in progress for issue **#${selected_number}**: ${selected_title}

## 📋 Planned Checklist
- [ ] Analyze requirements and design implementation
- [ ] Implement source code changes
- [ ] Add and execute automated tests
- [ ] Verify linting and code quality standards

---
*Pull Request automatically generated by SchoolPro workflow task.*
EOF
)

  echo -e "${CYAN}Select Pull Request status:${NC}"
  echo "  1) Draft PR (Recommended while in progress)"
  echo "  2) Ready for Review"
  read -r -p "Select [1/2] (default: 1): " pr_type_choice

  extra_args=()
  if [[ "$pr_type_choice" != "2" ]]; then
    extra_args+=("--draft")
  fi

  pr_url=$(gh pr create \
    --title "$pr_title" \
    --body "$pr_body" \
    --base "main" \
    --head "$branch_name" \
    "${extra_args[@]}" 2>/dev/null || echo "")

  if [ -n "$pr_url" ]; then
    echo -e "\n${GREEN}${BOLD}🎉 Pull Request successfully created!${NC}"
    echo -e "${GREEN}👉 PR Link: ${BOLD}${pr_url}${NC}"
  else
    # Fallback if pr create needs manual intervention or web prompt
    echo -e "${YELLOW}Opening GitHub CLI Pull Request creation interface...${NC}"
    gh pr create --title "$pr_title" --body "$pr_body" --base "main" --head "$branch_name" "${extra_args[@]}" || true
  fi
fi

# 10. Success Summary
echo -e "\n${GREEN}${BOLD}======================================================================${NC}"
echo -e "${GREEN}${BOLD}   ✅ Branch & Pull Request Setup Complete!                          ${NC}"
echo -e "${GREEN}${BOLD}======================================================================${NC}"
echo -e "  📌 ${BOLD}Issue:${NC}       #${selected_number} - ${selected_title}"
echo -e "  🌿 ${BOLD}Branch:${NC}      ${branch_name}"
echo -e "  🔗 ${BOLD}Tracking:${NC}    origin/${branch_name}"
echo -e "  🚀 ${BOLD}Workflow:${NC}    You are ready to start coding!"
echo -e "${GREEN}${BOLD}======================================================================${NC}\n"
