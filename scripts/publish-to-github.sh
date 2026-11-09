#!/usr/bin/env bash
#
# Creates a GitHub repository for this project and pushes the current branch to it.
#
#   GH_TOKEN=<personal access token> ./scripts/publish-to-github.sh [repo-name] [private|public]
#
# Optional:
#   GH_OWNER     owner (user or organisation). Defaults to the account that owns the token.
#   GH_API       GitHub API base URL, for GitHub Enterprise. Defaults to https://api.github.com
#
# The token needs the "repo" scope (classic) or "Administration: read and write" +
# "Contents: read and write" (fine-grained, on the new repository). It is used only for
# this run: it is never written to .git/config and never committed.
#
set -euo pipefail

REPO_NAME="${1:-ahem-corporation-website}"
VISIBILITY="${2:-private}"
API="${GH_API:-https://api.github.com}"
BRANCH="$(git symbolic-ref --short HEAD 2>/dev/null || echo main)"

die() { printf '\nError: %s\n' "$*" >&2; exit 1; }

[[ -n "${GH_TOKEN:-}" ]] || die "Set GH_TOKEN to a GitHub token with repository-creation rights. See the header of this script."
[[ "$VISIBILITY" == "private" || "$VISIBILITY" == "public" ]] || die "Visibility must be 'private' or 'public'."
command -v curl >/dev/null || die "curl is required."
[[ -d .git ]] || die "Run this from the project root (no .git directory here yet)."

api() { # method path [json-body]
  local method="$1" path="$2" body="${3:-}"
  if [[ -n "$body" ]]; then
    curl -sS -X "$method" "$API$path" \
      -H "Authorization: Bearer $GH_TOKEN" \
      -H "Accept: application/vnd.github+json" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      -H "Content-Type: application/json" \
      -d "$body" -w '\n%{http_code}'
  else
    curl -sS -X "$method" "$API$path" \
      -H "Authorization: Bearer $GH_TOKEN" \
      -H "Accept: application/vnd.github+json" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      -w '\n%{http_code}'
  fi
}

echo "Verifying token…"
response="$(api GET /user)"
code="$(tail -n1 <<<"$response")"
body="$(sed '$d' <<<"$response")"
[[ "$code" == "200" ]] || die "GitHub rejected the token (HTTP $code). $body"

OWNER="${GH_OWNER:-$(python3 -c 'import json,sys; print(json.load(sys.stdin)["login"])' <<<"$body" 2>/dev/null || sed -n 's/.*"login": *"\([^"]*\)".*/\1/p' <<<"$body" | head -1)}"
[[ -n "$OWNER" ]] || die "Could not determine the account for this token. Set GH_OWNER explicitly."

echo "Creating $OWNER/$REPO_NAME ($VISIBILITY)…"
response="$(api POST /user/repos "$(printf '{"name":"%s","private":%s,"description":"Ahem Corporation — construction, engineering and infrastructure website with a tender portal, lead management and admin dashboard.","auto_init":false,"has_issues":true,"has_wiki":false}' "$REPO_NAME" "$([[ "$VISIBILITY" == "private" ]] && echo true || echo false)")")"
code="$(tail -n1 <<<"$response")"
body="$(sed '$d' <<<"$response")"
case "$code" in
  201) echo "Repository created." ;;
  422) echo "A repository named $REPO_NAME already exists for this account — pushing to it instead." ;;
  *)   die "Could not create the repository (HTTP $code). $body" ;;
esac

REMOTE="https://github.com/$OWNER/$REPO_NAME.git"
if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REMOTE"
else
  git remote add origin "$REMOTE"
fi

echo "Pushing branch '$BRANCH'…"
# The token travels in a request header for this one push only — it is not stored in .git/config.
AUTH_HEADER="AUTHORIZATION: basic $(printf 'x-access-token:%s' "$GH_TOKEN" | base64 | tr -d '\n')"
git -c http.extraheader="$AUTH_HEADER" push -u origin "$BRANCH"

echo
echo "Done: https://github.com/$OWNER/$REPO_NAME"
echo "Remember: .env is ignored by git, so set DATABASE_URL and the other variables as"
echo "repository or deployment secrets rather than committing them."
