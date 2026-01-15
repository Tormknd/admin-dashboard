import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

const MIN_FREE_GB = 5;

export async function checkDiskSpace(): Promise<{ safe: boolean; freeGb: number }> {
  try {
    const { stdout } = await execAsync('df -BG /');
    
    const lines = stdout.trim().split('\n');
    const rootLine = lines[1];
    
    const parts = rootLine.replace(/\s+/g, ' ').split(' ');
    const freeStr = parts[3].replace('G', '');
    const freeGb = parseInt(freeStr, 10);

    return {
      safe: freeGb >= MIN_FREE_GB,
      freeGb
    };
  } catch (error) {
    console.error('Disk check failed:', error);
    return { safe: false, freeGb: 0 };
  }
}

