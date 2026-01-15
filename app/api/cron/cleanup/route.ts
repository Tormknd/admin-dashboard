import { NextResponse } from 'next/server';
import { runCleanup } from '@/lib/file-store';

export async function GET(req: Request) {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';
  
  if (ip !== '127.0.0.1' && ip !== '::1' && !ip.startsWith('192.168.') && !ip.startsWith('10.')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const deletedCount = await runCleanup();
  return NextResponse.json({ deleted: deletedCount, time: new Date().toISOString() });
}

