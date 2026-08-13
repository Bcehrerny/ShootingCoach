import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      // Not configured — the app still works, it just won't keep a copy of the image.
      return NextResponse.json({ url: null, warning: 'Blob storage not configured; image was not saved.' });
    }
    const formData = await req.formData();
    const file = formData.get('image') as File | null;
    if (!file) return NextResponse.json({ error: 'No image provided.' }, { status: 400 });

    const blob = await put(`sessions/${Date.now()}-${file.name}`, file, {
      access: 'public'
    });

    return NextResponse.json({ url: blob.url });
  } catch (err: any) {
    console.error('upload error', err);
    return NextResponse.json({ error: err?.message ?? 'Upload failed.' }, { status: 500 });
  }
}
