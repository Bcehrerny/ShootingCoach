'use client';

import { useState } from 'react';
import ExtractedDataEditor from '@/components/ExtractedDataEditor';
import AnalysisReport from '@/components/AnalysisReport';
import type { CoachingAnalysis, ExtractedSessionData } from '@/lib/types';

type Step = 'upload' | 'reviewing' | 'analyzing' | 'done';

export default function HomePage() {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [reflection, setReflection] = useState('');
  const [extracted, setExtracted] = useState<ExtractedSessionData | null>(null);
  const [analysis, setAnalysis] = useState<CoachingAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function handleFile(f: File) {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleExtract() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch('/api/extract', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Extraction failed');
      setExtracted(json.extractedData);
      setStep('reviewing');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleAnalyze() {
    if (!extracted) return;
    setBusy(true);
    setError(null);
    setStep('analyzing');
    try {
      // Best-effort: upload the source image to blob storage for the record.
      let imageUrl: string | null = null;
      if (file) {
        try {
          const fd = new FormData();
          fd.append('image', file);
          const up = await fetch('/api/upload', { method: 'POST', body: fd });
          const upJson = await up.json();
          imageUrl = upJson.url ?? null;
        } catch {
          // non-fatal
        }
      }

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extractedData: extracted,
          reflectionText: reflection,
          shooterId: 'default',
          sessionDate: parseSessionDate(extracted.sessionDateTime),
          imageUrl
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Analysis failed');
      setAnalysis(json.analysis);
      setStep('done');
    } catch (e: any) {
      setError(e.message);
      setStep('reviewing');
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setStep('upload');
    setFile(null);
    setPreview(null);
    setReflection('');
    setExtracted(null);
    setAnalysis(null);
    setError(null);
  }

  return (
    <main>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">New session</h1>
      <p className="text-black/60 text-sm mb-8">
        Upload a photo of your target sheet and add your self-reflection. Get a coaching analysis grounded in your
        actual shot data.
      </p>

      {error && (
        <div className="border border-red-300 bg-red-50 text-red-800 rounded-lg px-4 py-3 text-sm mb-6">{error}</div>
      )}

      {step === 'upload' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Target sheet photo</label>
            <label
              htmlFor="file-input"
              className="block border-2 border-dashed border-black/20 rounded-xl p-8 text-center cursor-pointer hover:border-[var(--ring-red)]/50 transition-colors"
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="preview" className="max-h-96 mx-auto rounded-lg" />
              ) : (
                <span className="text-black/50 text-sm">Click to choose a photo, or drag one here</span>
              )}
              <input
                id="file-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Self-reflection</label>
            <textarea
              className="w-full border border-black/15 rounded-lg px-3 py-2 text-sm min-h-[120px]"
              placeholder="How did the session feel? Any nerves, fatigue, equipment changes, technical focus, things you noticed while shooting…"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
            />
          </div>

          <button
            disabled={!file || busy}
            onClick={handleExtract}
            className="bg-ink text-white rounded-lg px-5 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            {busy ? 'Reading target sheet…' : 'Read target sheet'}
          </button>
        </div>
      )}

      {step === 'reviewing' && extracted && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-black/70">Check the extracted data before analyzing</h2>
            <button onClick={reset} className="text-xs text-black/40 hover:text-black/70">
              Start over
            </button>
          </div>
          <ExtractedDataEditor data={extracted} onChange={setExtracted} />
          <button
            disabled={busy}
            onClick={handleAnalyze}
            className="bg-[var(--ring-red)] text-white rounded-lg px-5 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            {busy ? 'Analyzing…' : 'Looks right — analyze this session'}
          </button>
        </div>
      )}

      {step === 'analyzing' && (
        <div className="text-sm text-black/60 py-16 text-center">Analyzing your session…</div>
      )}

      {step === 'done' && analysis && (
        <div className="space-y-8">
          <AnalysisReport analysis={analysis} />
          <div className="flex gap-3">
            <a href="/history" className="text-sm underline text-black/60 hover:text-black">
              View history
            </a>
            <button onClick={reset} className="text-sm underline text-black/60 hover:text-black">
              Log another session
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function parseSessionDate(raw?: string | null): string | null {
  if (!raw) return null;
  const match = raw.match(/(\d{2})-(\d{2})-(\d{4})/); // dd-mm-yyyy as on the Dutch sheet
  if (match) {
    const [, dd, mm, yyyy] = match;
    return `${yyyy}-${mm}-${dd}`;
  }
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}
