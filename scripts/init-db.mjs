// Applies schema.sql to whatever Postgres database is configured via
// POSTGRES_URL / POSTGRES_URL_NON_POOLING in your environment.
//
// Usage:
//   npm run db:init
//
// Locally, make sure your .env.local has POSTGRES_URL set (copy it from your
// Vercel project's Storage tab, or run `vercel env pull .env.local`).

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { sql } from '@vercel/postgres';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(__dirname, '..', 'schema.sql');
const schema = readFileSync(schemaPath, 'utf8');

// pg's simple protocol (used under the hood here) allows multiple
// semicolon-separated statements in one query.
const statements = schema
  .split(/;\s*(?:\n|$)/)
  .map((s) => s.trim())
  .filter(Boolean);

try {
  for (const statement of statements) {
    await sql.query(statement);
  }
  console.log(`Applied ${statements.length} statements from schema.sql successfully.`);
} catch (err) {
  console.error('Failed to initialize database:', err);
  process.exit(1);
}
