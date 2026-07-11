---
name: db-migration
description: Migrate data from Supabase PostgreSQL to Cloudflare D1. Use when the user wants to migrate, transfer, copy, or move data from Supabase (or any PostgreSQL database) to Cloudflare D1, or when they mention "supabase to d1", "pg to d1", "postgres to sqlite", or ask about switching database providers from PostgreSQL to D1.
---

# PostgreSQL to D1 Migration

Migrate data from a Supabase PostgreSQL database to Cloudflare D1 in one shot.

## Prerequisites

Before starting, verify:

1. **pg_dump** version matches or exceeds the Supabase PostgreSQL version. Check with `pg_dump --version`. If too old, install a newer version:

   **macOS (Homebrew):**

   ```bash
   brew install postgresql@17
   # Then use: /opt/homebrew/opt/postgresql@17/bin/pg_dump
   ```

   **Docker (any platform):**

   ```bash
   docker run --rm postgres:17 pg_dump "<CONNECTION_STRING>" --data-only --inserts --no-owner --no-privileges -t user -t config > supabase_data.sql
   ```

2. **D1 database exists** and tables are already created (via `wrangler d1 migrations apply`). If not, guide the user through creating the D1 database and applying the SQLite schema first.

3. **wrangler.toml** has the D1 binding configured:

   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "your-db-name"
   database_id = "your-database-id"
   migrations_dir = "src/config/db/migrations_sqlite"
   ```

4. **Python 3** is available (for the conversion script). Check with `python3 --version` or `python --version` on Windows.

## Migration Steps

### Step 1: Export data from Supabase

Ask the user for their Supabase connection string if not already known. Then export:

```bash
pg_dump "<SUPABASE_CONNECTION_STRING>" \
  --data-only \
  --inserts \
  --no-owner \
  --no-privileges \
  -t user -t session -t account -t verification \
  -t config -t taxonomy -t post -t "order" \
  -t subscription -t credit -t apikey \
  -t role -t permission -t role_permission -t user_role \
  -t ai_task -t chat -t chat_message \
  > supabase_data.sql
```

### Step 2: Convert PostgreSQL SQL to D1/SQLite format

Run the conversion script bundled with this skill:

```bash
python3 scripts/pg2d1.py supabase_data.sql > d1_data.sql
```

The script handles:

- **Timestamps**: PostgreSQL `'2025-10-19 10:25:55.046'` → epoch milliseconds
- **Booleans**: `true/false` → `1/0`
- **Schema prefix**: removes `public.` prefix
- **Type casts**: strips `::character varying`, `::timestamp`, etc.
- **Multi-line values**: properly escaped
- **Non-INSERT lines**: SET, SELECT, comments are removed

### Step 3: Import into D1

```bash
bunx wrangler d1 execute <database-name> --remote --file=d1_data.sql
```

### Step 4: Clean up

```bash
rm supabase_data.sql d1_data.sql
```

## Troubleshooting

### pg_dump version mismatch

Install the matching PostgreSQL client version (see Prerequisites above).

### UNIQUE constraint violation

Data already exists in D1. Either clear the D1 tables first or skip duplicate rows:

```bash
bunx wrangler d1 execute <db> --remote --command "DELETE FROM <table>;"
```

### Large datasets (>10MB)

Split the file by table and import each separately:

```bash
for table in user session account config post order; do
  grep "INSERT INTO \"$table\"" d1_data.sql > "d1_${table}.sql"
  bunx wrangler d1 execute <db> --remote --file="d1_${table}.sql"
done
```
