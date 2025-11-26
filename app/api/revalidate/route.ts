import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { secret, tags } = body;

    // Verify the secret to prevent unauthorized revalidation
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
    }

    // Validate that tags is an array
    if (!Array.isArray(tags) || tags.length === 0) {
      return NextResponse.json({ error: 'Tags must be a non-empty array' }, { status: 400 });
    }

    // Revalidate each tag
    for (const tag of tags) {
      revalidateTag(tag, {});
    }

    return NextResponse.json(
      {
        revalidated: true,
        tags,
        now: Date.now(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json({ error: 'Error revalidating cache' }, { status: 500 });
  }
}

