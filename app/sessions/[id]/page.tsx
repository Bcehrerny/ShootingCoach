'use client';

import { useEffect, useState } from 'react';
import AnalysisReport from '@/components/AnalysisReport';
import type { SessionRecord } from '@/lib/types';

export default function SessionDetailPage({ params }: { params: { id: string } }) {
  const [session, setSession] = useState<SessionRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/sessions/${params.id}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.error) setError(j.error);
        else setSession(j.session);
      });
  }, [params.id]);

  if (error) return <p className="text-sm text-red-700">{error}</p>;
  if (!session) return <p className="text-sm text-black/50">Loading…</p>;

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight mb-1">
          {session.session_date ? new Date(session.session_date).toLocaleDateString() : 'Session'}
        </h1>
        <p className="text-black/60 text-sm">{session.discipline}</p>
      </div>

      {session.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={session.image_url} alt="Target sheet" className="rounded-xl border border-black/10 max-w-full" />
      )}

      <div className="grid grid-cols-3 gap-4 text-center">
        <Stat label="Total" value={session.total_score} />
        <Stat label="Avg/shot" value={session.average_score} />
        <Stat label="Inner tens" value={session.inner_tens} />
      </div>

      {session.reflection_text && (
        <div>
          <h2 className="text-xs uppercase tracking-wide text-black/50 mb-2">Self-reflection</h2>
          <p className="text-sm italic text-black/70">{session.reflection_text}</p>
        </div>
      )}

      {session.analysis && <AnalysisReport analysis={session.analysis} />}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="border border-black/10 rounded-lg py-3">
      <p className="text-lg font-semibold font-mono-data">{value ?? '—'}</p>
      <p className="text-xs text-black/50">{label}</p>
    </div>
  );
}
