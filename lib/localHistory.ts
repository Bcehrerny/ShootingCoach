// Client-side session history, stored in the browser's localStorage.
//
// The app also has a Postgres-backed API (lib/db.ts / app/api/sessions) for
// multi-device / server-side persistence, but that requires a database to be
// provisioned and schema.sql to have been run — if it isn't, sessions were
// silently lost. localStorage is used as the reliable source of truth for
// the History page and session detail pages so a shooter's log always
// persists on their device regardless of whether a database is configured.

import type { CoachingAnalysis, ExtractedSessionData, SessionRecord } from './types';

const STORAGE_KEY = 'shootingcoach.sessions.v1';

// The shooter's standing goal: a consistent total (decimal) score of 610+
// across sessions, not just a single lucky one.
export const GOAL_TOTAL_SCORE = 610;

function readAll(): SessionRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as SessionRecord[];
  } catch {
    return [];
  }
}

function writeAll(sessions: SessionRecord[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    // Quota exceeded or storage disabled — non-fatal, the user still sees
    // their analysis for this session even if it can't be saved.
    console.warn('Could not save session to localStorage:', e);
  }
}

export function getAllLocalSessions(): SessionRecord[] {
  return readAll().sort((a, b) => {
    const da = a.session_date ?? a.created_at;
    const db = b.session_date ?? b.created_at;
    return new Date(db).getTime() - new Date(da).getTime();
  });
}

export function getLocalSession(id: string): SessionRecord | null {
  return readAll().find((s) => s.id === id) ?? null;
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function saveLocalSession(params: {
  sessionDate: string | null;
  discipline: string | null;
  imageUrl: string | null;
  extractedData: ExtractedSessionData;
  reflectionText: string | null;
  analysis: CoachingAnalysis | null;
  serverId?: string | null;
}): SessionRecord {
  const record: SessionRecord = {
    id: params.serverId || newId(),
    shooter_id: 'default',
    session_date: params.sessionDate,
    discipline: params.discipline,
    image_url: params.imageUrl,
    extracted_data: params.extractedData,
    reflection_text: params.reflectionText,
    analysis: params.analysis,
    total_score: params.extractedData.totalScoreDecimal ?? null,
    average_score: params.extractedData.averagePerShot ?? null,
    inner_tens: params.extractedData.innerTens ?? null,
    created_at: new Date().toISOString()
  };

  const existing = readAll();
  writeAll([record, ...existing]);
  return record;
}

export function deleteLocalSession(id: string) {
  writeAll(readAll().filter((s) => s.id !== id));
}

// Builds the compact text block sent to the coaching model so it has recent
// trend context, sourced from localStorage rather than the database.
export function recentHistoryText(excludeId?: string, limit = 5): string | null {
  const rows = getAllLocalSessions()
    .filter((s) => s.id !== excludeId)
    .slice(0, limit);
  if (!rows.length) return null;
  return rows
    .map((r) => {
      const d = r.session_date ? new Date(r.session_date).toISOString().slice(0, 10) : 'unknown date';
      return `- ${d}: total=${r.total_score ?? 'n/a'}, avg/shot=${r.average_score ?? 'n/a'}, inner-tens=${r.inner_tens ?? 'n/a'}`;
    })
    .join('\n');
}

// How close the shooter is, right now, to a *consistent* 610+ habit —
// not just whether the latest session cleared it.
export function goalStatus(sessions: SessionRecord[], windowSize = 5) {
  const scored = sessions.filter((s) => typeof s.total_score === 'number') as (SessionRecord & {
    total_score: number;
  })[];
  const recent = scored.slice(0, windowSize);
  const recentAverage = recent.length ? recent.reduce((sum, s) => sum + s.total_score, 0) / recent.length : null;
  const hitsInWindow = recent.filter((s) => s.total_score >= GOAL_TOTAL_SCORE).length;
  const latest = scored[0]?.total_score ?? null;
  return {
    target: GOAL_TOTAL_SCORE,
    latest,
    recentAverage: recentAverage !== null ? Math.round(recentAverage * 10) / 10 : null,
    windowSize: recent.length,
    hitsInWindow,
    gapToTarget: latest !== null ? Math.round((GOAL_TOTAL_SCORE - latest) * 10) / 10 : null
  };
}
