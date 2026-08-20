import type { CoachingAnalysis } from '@/lib/types';

export default function AnalysisReport({ analysis }: { analysis: CoachingAnalysis }) {
  const goal = analysis.goalProgress;

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xs uppercase tracking-wide text-black/50 mb-2">Summary</h2>
        <p className="text-lg leading-relaxed">{analysis.summary}</p>
      </section>

      {goal && (
        <section className="border border-black/10 rounded-xl p-4">
          <h2 className="text-xs uppercase tracking-wide text-black/50 mb-3">
            Goal: consistent {goal.targetScore}+ · 目标：稳定达到 {goal.targetScore}+ 环
          </h2>
          <div className="grid grid-cols-3 gap-3 text-center mb-3">
            <div>
              <p className="text-lg font-semibold font-mono-data">{goal.currentSessionScore ?? '—'}</p>
              <p className="text-xs text-black/50">This session</p>
            </div>
            <div>
              <p
                className={`text-lg font-semibold font-mono-data ${
                  goal.gapToTarget !== null && goal.gapToTarget <= 0 ? 'text-emerald-700' : ''
                }`}
              >
                {goal.gapToTarget === null
                  ? '—'
                  : goal.gapToTarget <= 0
                    ? `+${Math.abs(goal.gapToTarget)}`
                    : `-${goal.gapToTarget}`}
              </p>
              <p className="text-xs text-black/50">Gap to goal (+ = above)</p>
            </div>
            <div>
              <p className="text-lg font-semibold font-mono-data">{goal.recentAverageScore ?? '—'}</p>
              <p className="text-xs text-black/50">Recent avg</p>
            </div>
          </div>
          <p className="text-sm text-black/70 leading-relaxed">{goal.consistencyNote}</p>
        </section>
      )}

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
                {c.linkedToReflection ? (
                  <p className="text-sm text-[var(--ring-red)] italic">↳ {c.linkedToReflection}</p>
                ) : (
                  <p className="text-xs text-black/40 italic">Independent of your reflection notes</p>
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

      {analysis.mandarinExplanation && (
        <section className="border-t border-black/10 pt-6">
          <h2 className="text-xs uppercase tracking-wide text-black/50 mb-2">中文讲解 (Mandarin explanation)</h2>
          <p className="text-sm leading-relaxed whitespace-pre-line">{analysis.mandarinExplanation}</p>
        </section>
      )}
    </div>
  );
}
