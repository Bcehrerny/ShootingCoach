-- Run this once against your Vercel Postgres database (see README).

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS shooters (
  id            TEXT PRIMARY KEY,           -- e.g. license number, or "default"
  name          TEXT NOT NULL,
  discipline    TEXT,                       -- e.g. "Luchtgeweer staand"
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shooter_id        TEXT NOT NULL REFERENCES shooters(id) ON DELETE CASCADE,
  session_date      DATE,                    -- date the shooting took place
  discipline        TEXT,
  image_url         TEXT,                    -- Vercel Blob URL of the uploaded target sheet
  extracted_data    JSONB NOT NULL,          -- structured shot data (see lib/types.ts)
  reflection_text   TEXT,                    -- shooter's self-reflection notes
  analysis          JSONB,                   -- coaching analysis result
  total_score       NUMERIC,
  average_score      NUMERIC,
  inner_tens        INTEGER,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_shooter_date ON sessions (shooter_id, session_date);

-- Ensure a default shooter exists so the single-user flow works out of the box.
INSERT INTO shooters (id, name, discipline)
VALUES ('default', 'Me', 'Luchtgeweer staand')
ON CONFLICT (id) DO NOTHING;
