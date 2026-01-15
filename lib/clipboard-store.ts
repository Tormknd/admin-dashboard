import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const CLIPBOARD_PATH = path.join(DATA_DIR, 'clipboard.json');

export interface ClipboardItem {
  id: string;
  content: string;
  createdAt: number;
  expiresAt?: number;
}

async function ensureInit() {
  try {
    await fs.access(CLIPBOARD_PATH);
  } catch {
    await fs.writeFile(CLIPBOARD_PATH, JSON.stringify([]));
  }
}

export async function getClipboard(): Promise<ClipboardItem[]> {
  await ensureInit();
  const data = await fs.readFile(CLIPBOARD_PATH, 'utf-8');
  const items = JSON.parse(data) as ClipboardItem[];
  
  const now = Date.now();
  return items.filter(item => !item.expiresAt || item.expiresAt > now);
}

export async function addClipboard(content: string, ttl?: number): Promise<ClipboardItem> {
  const items = await getClipboard();
  const now = Date.now();
  
  const newItem: ClipboardItem = {
    id: crypto.randomUUID(),
    content,
    createdAt: now,
    expiresAt: ttl ? now + ttl : undefined
  };
  
  items.unshift(newItem);
  
  const maxItems = 50;
  const trimmed = items.slice(0, maxItems);
  
  await fs.writeFile(CLIPBOARD_PATH, JSON.stringify(trimmed, null, 2));
  
  return newItem;
}

export async function deleteClipboard(id: string) {
  const items = await getClipboard();
  const filtered = items.filter(item => item.id !== id);
  await fs.writeFile(CLIPBOARD_PATH, JSON.stringify(filtered, null, 2));
}

export async function clearClipboard() {
  await fs.writeFile(CLIPBOARD_PATH, JSON.stringify([]));
}

