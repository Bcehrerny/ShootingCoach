'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer
} from 'recharts';
import type { SessionRecord } from '@/lib/types';
import { GOAL_TOTAL_SCORE, getAllLocalSessions, goalStatus } from '@/lib/localHistory';

export default function HistoryPage() {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // localStorage is the reliable source of truth (works with no database configured).
    const local = getAllLocalSessions();
    if (local.length > 0) {
      setSessions(local);
      setLoading(false);
      return;
    }
    // Fallback for older sessions that only ever made it into a server database.
    fetch('/api/sessions?shooterId=default')
      .then((r) => r.json())
      .then((j) => setSessions(j.sessions ?? []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  const chartData = [...sessions]
    .reverse()
    .map((s) => ({
      date: s.session_date ? new Date(s.session_date).toLocaleDateString() : new Date(s.created_at).toLocaleDateString(),
      total: s.total_score,
      average: s.average_score
    }));

  const status = goalStatus(sessions);

  return (
    <main>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">History</h1>
      <p className="text-black/60 text-sm mb-8">Progress across your logged sessions.</p>

      {loading && <p className="text-sm text-black/50">Loading…</p>}

      {!loading && sessions.length === 0 && (
        <div className="border border-black/10 rounded-xl p-8 text-center text-sm text-black/50">
          No sessions logged yet.{' '}
          <Link href="/" className="underline text-[var(--ring-red)]">
            Log your first one
          </Link>
          .
        </div>
      )}

      {!loading && sessions.length > 0 && (
        <div className="mb-8 border border-black/10 rounded-xl p-4">
          <h2 className="text-xs uppercase tracking-wide text-black/50 mb-3">
            Goal: consistent {GOAL_TOTAL_SCORE}+ · 目标：稳定达到 {GOAL_TOTAL_SCORE}+ 环
          </h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-lg font-semibold font-mono-data">{status.latest ?? '—'}</p>
              <p className="text-xs text-black/50">Latest total</p>
            </div>
            <div>
              <p className="text-lg font-semibold font-mono-data">{status.recentAverage ?? '—'}</p>
              <p className="text-xs text-black/50">Avg, last {status.windowSize || 0}</p>
            </div>
            <div>
              <p className="text-lg font-semibold font-mono-data">
                {status.hitsInWindow}/{status.windowSize || 0}
              </p>
              <p className="text-xs text-black/50">Sessions ≥ {GOAL_TOTAL_SCORE}</p>
            </div>
          </div>
        </div>
      )}

      {sessions.length > 1 && (
        <div className="mb-10 border border-black/10 rounded-xl p-4">
          <h2 className="text-xs uppercase tracking-wide text-black/50 mb-3">Total score per session, over time</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={['dataMin - 5', 'dataMax + 5']} tick={{ fontSize: 11 }} />
              <Tooltip />
              <ReferenceLine
                y={GOAL_TOTAL_SCORE}
                stroke="#16a34a"
                strokeDasharray="4 4"
                label={{ value: `Goal ${GOAL_TOTAL_SCORE}`, position: 'insideTopRight', fontSize: 11, fill: '#16a34a' }}
              />
              <Line type="monotone" dataKey="total" stroke="#b3382c" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {sessions.length > 0 && (
        <div className="space-y-2">
          {sessions.map((s) => {
            const hitGoal = typeof s.total_score === 'number' && s.total_score >= GOAL_TOTAL_SCORE;
            return (
              <Link
                key={s.id}
                href={`/sessions/${s.id}`}
                className="flex items-center justify-between border border-black/10 rounded-lg px-4 py-3 hover:border-[var(--ring-red)]/40 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">
                    {s.session_date ? new Date(s.session_date).toLocaleDateString() : new Date(s.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-black/50">{s.discipline || 'Session'}</p>
                </div>
                <div className="text-right font-mono-data">
                  <p className={`text-sm font-semibold ${hitGoal ? 'text-emerald-700' : ''}`}>{s.total_score ?? '—'}</p>
                  <p className="text-xs text-black/50">avg {s.average_score ?? '—'}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
