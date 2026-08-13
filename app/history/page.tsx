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
  ResponsiveContainer
} from 'recharts';
import type { SessionRecord } from '@/lib/types';

export default function HistoryPage() {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/sessions?shooterId=default')
      .then((r) => r.json())
      .then((j) => {
        setSessions(j.sessions ?? []);
        if (j.error) setNote(j.error);
      })
      .finally(() => setLoading(false));
  }, []);

  const chartData = [...sessions]
    .reverse()
    .map((s) => ({
      date: s.session_date ? new Date(s.session_date).toLocaleDateString() : new Date(s.created_at).toLocaleDateString(),
      total: s.total_score,
      average: s.average_score
    }));

  return (
    <main>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">History</h1>
      <p className="text-black/60 text-sm mb-8">Progress across your logged sessions.</p>

      {loading && <p className="text-sm text-black/50">Loading…</p>}
      {note && <p className="text-sm text-amber-700 mb-4">{note}</p>}

      {!loading && sessions.length === 0 && (
        <div className="border border-black/10 rounded-xl p-8 text-center text-sm text-black/50">
          No sessions logged yet.{' '}
          <Link href="/" className="underline text-[var(--ring-red)]">
            Log your first one
          </Link>
          .
        </div>
      )}

      {sessions.length > 1 && (
        <div className="mb-10 border border-black/10 rounded-xl p-4">
          <h2 className="text-xs uppercase tracking-wide text-black/50 mb-3">Average score per shot, over time</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={['dataMin - 0.3', 'dataMax + 0.3']} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="average" stroke="#b3382c" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {sessions.length > 0 && (
        <div className="space-y-2">
          {sessions.map((s) => (
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
                <p className="text-sm font-semibold">{s.total_score ?? '—'}</p>
                <p className="text-xs text-black/50">avg {s.average_score ?? '—'}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
