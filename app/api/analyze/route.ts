import { NextRequest, NextResponse } from 'next/server';
import { anthropic, MODEL } from '@/lib/anthropic';
import { COACHING_SYSTEM_PROMPT, buildAnalysisUserPrompt } from '@/lib/coachPrompt';
import { createSession, getRecentHistoryForPrompt } from '@/lib/db';
import type { ExtractedSessionData } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

function summarizeHistory(rows: any[]): string | null {
  if (!rows.length) return null;
  return rows
    .map((r) => {
      const d = r.session_date ? new Date(r.session_date).toISOString().slice(0, 10) : 'unknown date';
      return `- ${d}: total=${r.total_score ?? 'n/a'}, avg/shot=${r.average_score ?? 'n/a'}, inner-tens=${r.inner_tens ?? 'n/a'}`;
    })
    .join('\n');
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not configured on the server.' }, { status: 500 });
    }

    const body = await req.json();
    const {
      extractedData,
      reflectionText,
      shooterId = 'default',
      sessionDate = null,
      imageUrl = null
    }: {
      extractedData: ExtractedSessionData;
      reflectionText: string;
      shooterId?: string;
      sessionDate?: string | null;
      imageUrl?: string | null;
    } = body;

    if (!extractedData) {
      return NextResponse.json({ error: 'extractedData is required.' }, { status: 400 });
    }

    let historySummary: string | null = null;
    try {
      const rows = await getRecentHistoryForPrompt(shooterId);
      historySummary = summarizeHistory(rows);
    } catch (e) {
      // Database might not be initialized yet (first run before schema.sql applied) — proceed without history.
      console.warn('Could not fetch history, continuing without it:', e);
    }

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 3000,
      system: COACHING_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: buildAnalysisUserPrompt(JSON.stringify(extractedData, null, 2), reflectionText, historySummary)
        }
      ]
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'Model returned no text.' }, { status: 502 });
    }

    let analysis;
    try {
      const cleaned = textBlock.text.trim().replace(/^```json\s*|\s*```$/g, '');
      analysis = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: 'Could not parse analysis as JSON.', raw: textBlock.text },
        { status: 502 }
      );
    }

    let saved;
    try {
      saved = await createSession({
        shooterId,
        sessionDate,
        discipline: extractedData.discipline ?? null,
        imageUrl,
        extractedData,
        reflectionText,
        analysis
      });
    } catch (e: any) {
      console.error('Could not save session (is the database initialized? see schema.sql):', e);
      // Still return the analysis even if persistence failed, so the user isn't blocked.
      return NextResponse.json({
        analysis,
        saved: false,
        warning: 'Analysis succeeded but saving to the database failed. Have you run schema.sql against your database?'
      });
    }

    return NextResponse.json({ analysis, saved: true, session: saved });
  } catch (err: any) {
    console.error('analyze error', err);
    return NextResponse.json({ error: err?.message ?? 'Analysis failed.' }, { status: 500 });
  }
}
