import type { CoachingAnalysis } from '@/lib/types';

export default function AnalysisReport({ analysis }: { analysis: CoachingAnalysis }) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xs uppercase tracking-wide text-black/50 mb-2">Summary</h2>
        <p className="text-lg leading-relaxed">{analysis.summary}</p>
      </section>

      {analysis.strengths?.length > 0 && (
        <section>
          <h2 className="text-xs uppercase tracking-wide text-black/50 mb-2">What went well</h2>
          <ul className="space-y-2">
            {analysis.strengths.map((s, i) => (
              <li key={i} className="pl-4 border-l-2 border-emerald-600/50 text-sm leading-relaxed">
                {s}
              </li>
            ))}
          </ul>
        </section>
      )}

      {analysis.likelyCauses?.length > 0 && (
        <section>
          <h2 className="text-xs uppercase tracking-wide text-black/50 mb-2">What likely happened</h2>
          <div className="space-y-4">
            {analysis.likelyCauses.map((c, i) => (
              <div key={i} className="border border-black/10 rounded-lg p-4">
                <p className="text-sm font-medium mb-1">{c.observation}</p>
                <p className="text-sm text-black/70 mb-1">{c.possibleTechnicalCause}</p>
                {c.linkedToReflection && (
                  <p className="text-sm text-[var(--ring-red)] italic">↳ {c.linkedToReflection}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {analysis.practiceRecommendations?.length > 0 && (
        <section>
          <h2 className="text-xs uppercase tracking-wide text-black/50 mb-2">Practice next</h2>
          <div className="space-y-4">
            {analysis.practiceRecommendations.map((r, i) => (
              <div key={i} className="bg-black/[0.03] rounded-lg p-4">
                <p className="text-sm font-semibold mb-1">{r.focusArea}</p>
                <p className="text-sm mb-1">{r.drill}</p>
                <p className="text-sm text-black/60">{r.rationale}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {analysis.trendNote && (
        <section>
          <h2 className="text-xs uppercase tracking-wide text-black/50 mb-2">Trend</h2>
          <p className="text-sm leading-relaxed">{analysis.trendNote}</p>
        </section>
      )}
    </div>
  );
}
