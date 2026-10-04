#!/bin/sh
# Validate the checked-in PostgreSQL migration history. Never rewrite applied SQL.
set -eu
if ! grep -q 'provider = "postgresql"' prisma/migrations/migration_lock.toml; then
  echo "PostgreSQL migration history is required; see DOCKER_DEPLOYMENT.md." >&2
  exit 1
fi
for migration in 0_init 20261003190000_add_user_session_version 20261003200000_add_rate_limit_bucket 20261004090000_relax_legacy_user_password 20261004091000_add_account_status_and_audit; do
  test -f "prisma/migrations/$migration/migration.sql" || {
    echo "Missing migration: $migration" >&2
    exit 1
  }
done
echo "PostgreSQL migration history validated."
