import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const DB_PATH = path.join(DATA_DIR, 'files-db.json');

export interface FileRecord {
  id: string;
  originalName: string;
  filename: string;
  size: number;
  uploadedAt: number;
  isPersistent: boolean;
}

async function ensureInit() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify([]));
  }
}

export async function getFiles(): Promise<FileRecord[]> {
  await ensureInit();
  const data = await fs.readFile(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

export async function addFile(record: FileRecord) {
  const files = await getFiles();
  files.push(record);
  await fs.writeFile(DB_PATH, JSON.stringify(files, null, 2));
}

export async function runCleanup() {
  const files = await getFiles();
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;

  const filesToKeep: FileRecord[] = [];
  const filesToDelete: FileRecord[] = [];

  for (const file of files) {
    const isExpired = (now - file.uploadedAt) > ONE_DAY;
    
    if (isExpired && !file.isPersistent) {
      filesToDelete.push(file);
    } else {
      filesToKeep.push(file);
    }
  }

  for (const file of filesToDelete) {
    try {
      await fs.unlink(path.join(UPLOAD_DIR, file.filename));
    } catch (e) {
      console.error(`Failed to delete ${file.filename}`, e);
    }
  }

  if (filesToDelete.length > 0) {
    await fs.writeFile(DB_PATH, JSON.stringify(filesToKeep, null, 2));
  }
  
  return filesToDelete.length;
}

