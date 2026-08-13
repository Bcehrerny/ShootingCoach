import { sql } from '@vercel/postgres';
import type { CoachingAnalysis, ExtractedSessionData, SessionRecord } from './types';

export async function createSession(params: {
  shooterId: string;
  sessionDate: string | null;
  discipline: string | null;
  imageUrl: string | null;
  extractedData: ExtractedSessionData;
  reflectionText: string | null;
  analysis: CoachingAnalysis | null;
}): Promise<SessionRecord> {
  const { shooterId, sessionDate, discipline, imageUrl, extractedData, reflectionText, analysis } = params;

  // Ensure the shooter row exists (supports future multi-user without extra setup).
  await sql`
    INSERT INTO shooters (id, name, discipline)
    VALUES (${shooterId}, ${shooterId}, ${discipline})
    ON CONFLICT (id) DO NOTHING;
  `;

  const totalScore = extractedData.totalScoreDecimal ?? null;
  const averageScore = extractedData.averagePerShot ?? null;
  const innerTens = extractedData.innerTens ?? null;

  const result = await sql`
    INSERT INTO sessions (
      shooter_id, session_date, discipline, image_url,
      extracted_data, reflection_text, analysis,
      total_score, average_score, inner_tens
    ) VALUES (
      ${shooterId}, ${sessionDate}, ${discipline}, ${imageUrl},
      ${JSON.stringify(extractedData)}::jsonb, ${reflectionText}, ${analysis ? JSON.stringify(analysis) : null}::jsonb,
      ${totalScore}, ${averageScore}, ${innerTens}
    )
    RETURNING *;
  `;

  return result.rows[0] as unknown as SessionRecord;
}

export async function listSessions(shooterId: string, limit = 50): Promise<SessionRecord[]> {
  const result = await sql`
    SELECT * FROM sessions
    WHERE shooter_id = ${shooterId}
    ORDER BY session_date DESC NULLS LAST, created_at DESC
    LIMIT ${limit};
  `;
  return result.rows as unknown as SessionRecord[];
}

export async function getSession(id: string): Promise<SessionRecord | null> {
  const result = await sql`SELECT * FROM sessions WHERE id = ${id};`;
  return (result.rows[0] as unknown as SessionRecord) ?? null;
}

export async function getRecentHistoryForPrompt(shooterId: string, excludeSessionId?: string, limit = 5) {
  const result = await sql`
    SELECT session_date, total_score, average_score, inner_tens, extracted_data
    FROM sessions
    WHERE shooter_id = ${shooterId}
      AND (${excludeSessionId ?? null}::uuid IS NULL OR id != ${excludeSessionId ?? null}::uuid)
    ORDER BY session_date DESC NULLS LAST, created_at DESC
    LIMIT ${limit};
  `;
  return result.rows;
}
