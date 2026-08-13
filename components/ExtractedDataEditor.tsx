'use client';

import type { ExtractedSessionData, ShotSeries } from '@/lib/types';

interface Props {
  data: ExtractedSessionData;
  onChange: (data: ExtractedSessionData) => void;
}

function updateSeries(data: ExtractedSessionData, index: number, patch: Partial<ShotSeries>): ExtractedSessionData {
  const series = data.series.map((s, i) => (i === index ? { ...s, ...patch } : s));
  return { ...data, series };
}

export default function ExtractedDataEditor({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      {data.extractionNotes && (
        <div className="border border-[var(--ring-red)]/30 bg-[var(--ring-red)]/5 rounded-lg px-4 py-3 text-sm">
          <strong>Check this:</strong> {data.extractionNotes}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
        <Field label="Shooter" value={data.shooterName} onChange={(v) => onChange({ ...data, shooterName: v })} />
        <Field label="Discipline" value={data.discipline} onChange={(v) => onChange({ ...data, discipline: v })} />
        <Field label="Category" value={data.category} onChange={(v) => onChange({ ...data, category: v })} />
        <Field label="Club" value={data.club} onChange={(v) => onChange({ ...data, club: v })} />
        <Field
          label="Date/time"
          value={data.sessionDateTime}
          onChange={(v) => onChange({ ...data, sessionDateTime: v })}
        />
        <NumField
          label="Total score (decimal)"
          value={data.totalScoreDecimal}
          onChange={(v) => onChange({ ...data, totalScoreDecimal: v })}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b border-black/10 text-black/50">
              <th className="py-2 pr-2">Series</th>
              <th className="py-2 pr-2">Shots (comma-separated)</th>
              <th className="py-2 pr-2 w-24">Sum</th>
              <th className="py-2 pr-2 w-24">Ø (mm)</th>
            </tr>
          </thead>
          <tbody className="font-mono-data">
            {data.series.map((s, i) => (
              <tr key={i} className="border-b border-black/5">
                <td className="py-2 pr-2 whitespace-nowrap">{s.shotRange}</td>
                <td className="py-2 pr-2">
                  <input
                    className="w-full border border-black/15 rounded px-2 py-1"
                    value={s.shots.join(', ')}
                    onChange={(e) => {
                      const shots = e.target.value
                        .split(',')
                        .map((v) => parseFloat(v.trim()))
                        .filter((v) => !isNaN(v));
                      updateSeries(data, i, { shots });
                      onChange(updateSeries(data, i, { shots }));
                    }}
                  />
                </td>
                <td className="py-2 pr-2">
                  <input
                    type="number"
                    step="0.1"
                    className="w-full border border-black/15 rounded px-2 py-1"
                    value={s.seriesSum}
                    onChange={(e) => onChange(updateSeries(data, i, { seriesSum: parseFloat(e.target.value) }))}
                  />
                </td>
                <td className="py-2 pr-2">
                  <input
                    type="number"
                    step="0.01"
                    className="w-full border border-black/15 rounded px-2 py-1"
                    value={s.groupDiameterMm ?? ''}
                    onChange={(e) =>
                      onChange(updateSeries(data, i, { groupDiameterMm: parseFloat(e.target.value) || undefined }))
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
        <NumField
          label="Average per shot"
          value={data.averagePerShot}
          onChange={(v) => onChange({ ...data, averagePerShot: v })}
        />
        <NumField label="Inner tens" value={data.innerTens} onChange={(v) => onChange({ ...data, innerTens: v })} />
        <NumField
          label="Overall group Ø (mm)"
          value={data.overallGroupDiameterMm}
          onChange={(v) => onChange({ ...data, overallGroupDiameterMm: v })}
        />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange
}: {
  label: string;
  value?: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-black/50 text-xs">{label}</span>
      <input
        className="w-full border border-black/15 rounded px-2 py-1 mt-1"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function NumField({
  label,
  value,
  onChange
}: {
  label: string;
  value?: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-black/50 text-xs">{label}</span>
      <input
        type="number"
        step="0.01"
        className="w-full border border-black/15 rounded px-2 py-1 mt-1 font-mono-data"
        value={value ?? ''}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </label>
  );
}
