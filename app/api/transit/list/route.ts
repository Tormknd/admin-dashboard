import { NextResponse } from 'next/server';
import { getFiles } from '@/lib/file-store';

export async function GET() {
  const files = await getFiles();
  return NextResponse.json(files);
}

