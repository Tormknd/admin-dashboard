import { NextResponse } from 'next/server';
import { getClipboard, addClipboard, deleteClipboard, clearClipboard } from '@/lib/clipboard-store';

export async function GET() {
  const items = await getClipboard();
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const { content, ttl } = await req.json();
  
  if (!content || typeof content !== 'string') {
    return NextResponse.json({ error: 'Invalid content' }, { status: 400 });
  }

  const item = await addClipboard(content, ttl);
  return NextResponse.json(item);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const clear = searchParams.get('clear') === 'true';

  if (clear) {
    await clearClipboard();
    return NextResponse.json({ success: true });
  }

  if (!id) {
    return NextResponse.json({ error: 'No id provided' }, { status: 400 });
  }

  await deleteClipboard(id);
  return NextResponse.json({ success: true });
}

