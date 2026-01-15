import { NextResponse } from 'next/server';
import { getActivePorts, PortInfo } from '@/lib/server-cmd';

export const dynamic = 'force-dynamic';

const mockPorts: PortInfo[] = [
  { command: 'node', pid: '1234', user: 'user', protocol: 'IPv4', port: 3000, state: 'LISTEN' },
  { command: 'nginx', pid: '5678', user: 'root', protocol: 'IPv4', port: 80, state: 'LISTEN' },
  { command: 'node', pid: '9012', user: 'user', protocol: 'IPv4', port: 8888, state: 'LISTEN' },
  { command: 'python3', pid: '3456', user: 'user', protocol: 'IPv4', port: 5000, state: 'LISTEN' },
  { command: 'postgres', pid: '7890', user: 'postgres', protocol: 'IPv4', port: 5432, state: 'LISTEN' },
];

export async function GET() {
  try {
    const ports = await getActivePorts();
    
    return NextResponse.json({ 
      data: ports, 
      ts: new Date().toISOString() 
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ 
        data: mockPorts, 
        ts: new Date().toISOString() 
      });
    }
    
    console.error('Failed to fetch ports:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

