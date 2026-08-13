import { NextRequest, NextResponse } from 'next/server';
import { anthropic, MODEL } from '@/lib/anthropic';
import { EXTRACTION_SYSTEM_PROMPT, buildExtractionUserPrompt } from '@/lib/coachPrompt';

export const runtime = 'nodejs';
export const maxDuration = 60;

const SCHEMA_EXAMPLE = `{
  "shooterName": "string or null",
  "licenseNumber": "string or null",
  "club": "string or null",
  "discipline": "string or null",
  "category": "string or null",
  "sessionDateTime": "string or null",
  "totalShots": 60,
  "series": [
    {
      "seriesIndex": 1,
      "shotRange": "1..10",
      "shots": [10.5, 10.2, 10.5, 10.3, 9.6, 10.0, 10.1, 8.8, 10.4, 9.1],
      "seriesSum": 99.5,
      "seriesIntegerSum": 96,
      "groupDiameterMm": 12.43,
      "centerOffsetXMm": 0.98,
      "centerOffsetYMm": -0.17,
      "notes": null
    }
  ],
  "totalScoreDecimal": 584.4,
  "totalScoreInteger": 561,
  "scoreDistribution": { "tens": 30, "nines": 23, "eights": 6, "sevens": 0, "sixOrBelow": 1 },
  "innerTens": 21,
  "averagePerShot": 9.74,
  "overallGroupDiameterMm": 19.15,
  "extractionNotes": "string or null"
}`;

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not configured on the server.' }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get('image') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No image uploaded.' }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const base64 = bytes.toString('base64');
    const mediaType = file.type && file.type.startsWith('image/') ? file.type : 'image/jpeg';

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: EXTRACTION_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType as any, data: base64 }
            },
            {
              type: 'text',
              text: buildExtractionUserPrompt(SCHEMA_EXAMPLE)
            }
          ]
        }
      ]
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'Model returned no text.' }, { status: 502 });
    }

    let parsed;
    try {
      const cleaned = textBlock.text.trim().replace(/^```json\s*|\s*```$/g, '');
      parsed = JSON.parse(cleaned);
    } catch (e) {
      return NextResponse.json(
        { error: 'Could not parse extracted data as JSON.', raw: textBlock.text },
        { status: 502 }
      );
    }

    return NextResponse.json({ extractedData: parsed });
  } catch (err: any) {
    console.error('extract error', err);
    return NextResponse.json({ error: err?.message ?? 'Extraction failed.' }, { status: 500 });
  }
}
