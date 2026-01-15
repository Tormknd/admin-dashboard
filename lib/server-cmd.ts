import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export interface PortInfo {
  command: string;
  pid: string;
  user: string;
  protocol: string;
  port: number;
  state: string;
}

export async function getActivePorts(): Promise<PortInfo[]> {
  try {
    const { stdout } = await execAsync('/usr/bin/lsof -iTCP -sTCP:LISTEN -P -n');
    return parseLsofOutput(stdout);
  } catch (error) {
    console.error('System command failed:', error);
    throw new Error('Failed to retrieve system ports');
  }
}

function parseLsofOutput(output: string): PortInfo[] {
  const lines = output.trim().split('\n');  
  
  if (lines.length <= 1) {
    return [];
  }
  
  const dataLines = lines.slice(1);

  return dataLines
    .filter(line => line.trim().length > 0)
    .map((line) => {
      const normalizedLine = line.replace(/\s+/g, ' ').trim();
      const parts = normalizedLine.split(' ');
      
      if (parts.length < 9) {
        return null;
      }
      
      const command = parts[0];
      const pid = parts[1];
      const user = parts[2];
      const protocol = parts[4] || 'IPv4';
      const name = parts.slice(8).join(' ');
      
      const portMatch = name.match(/:(\d+)/);
      const port = portMatch ? parseInt(portMatch[1], 10) : 0;

      if (isNaN(port) || port === 0) {
        return null;
      }

      return {
        command,
        pid,
        user,
        protocol,
        port,
        state: 'LISTEN',
      };
    })
    .filter((p): p is PortInfo => p !== null);
}
