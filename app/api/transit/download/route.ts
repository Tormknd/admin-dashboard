import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filename = searchParams.get('filename');
  const originalName = searchParams.get('name') || 'download';

  if (!filename) return new NextResponse('No filename', { status: 400 });

  const safeFilename = path.basename(filename);
  const filePath = path.join(process.cwd(), 'data', 'uploads', safeFilename);

  try {
    const fileBuffer = await fs.readFile(filePath);
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Disposition': `attachment; filename="${originalName}"`,
        'Content-Type': 'application/octet-stream',
      },
    });
  } catch (e) {
    return new NextResponse('File not found', { status: 404 });
  }
}

