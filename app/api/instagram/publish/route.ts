import { NextRequest, NextResponse } from 'next/server';
import { publishImageNow, PublishSchema } from '@/lib/instagram';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = PublishSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    if (!process.env.IG_ACCESS_TOKEN || !process.env.IG_USER_ID) {
      return NextResponse.json({ error: 'Server is not configured (missing IG env vars)' }, { status: 500 });
    }

    const { imageUrl, caption } = parsed.data;
    const { permalink, mediaId } = await publishImageNow({ imageUrl, caption });
    return NextResponse.json({ ok: true, mediaId, permalink });
  } catch (err: any) {
    const message = err?.message || 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
