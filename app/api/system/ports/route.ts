import { NextResponse } from 'next/server';
import { getActivePorts, PortInfo } from '@/lib/server-cmd';

export const dynamic = 'force-dynamic';

const mockPorts: PortInfo[] = [
  { command: 'node', pid: '1234', user: 'user', protocol: 'IPv4', port: 3000, state: 'LISTEN' },
  { command: 'nginx', pid: '5678', user: 'root', protocol: 'IPv4', port: 80, state: 'LISTEN' },
  { command: 'node', pid: '9012', user: 'user', protocol: 'IPv4', port: 8888, state: 'LISTEN' },
  { command: 'python3', pid: '3456', user: 'user', protocol: 'IPv4', port: 5000, state: 'LISTEN' },
  { command: 'postgres', pid: '7890', user: 'postgres', protocol: 'IPv4', port: 5432, state: 'LISTEN' },
  { command: 'docker', pid: '1001', user: 'root', protocol: 'IPv4', port: 3001, state: 'LISTEN' },
  { command: 'docker', pid: '1002', user: 'root', protocol: 'IPv4', port: 3002, state: 'LISTEN' },
  { command: 'docker', pid: '1003', user: 'root', protocol: 'IPv4', port: 3003, state: 'LISTEN' },
  { command: 'node', pid: '2001', user: 'user', protocol: 'IPv4', port: 4000, state: 'LISTEN' },
  { command: 'node', pid: '2002', user: 'user', protocol: 'IPv4', port: 4001, state: 'LISTEN' },
  { command: 'node', pid: '2003', user: 'user', protocol: 'IPv4', port: 4002, state: 'LISTEN' },
  { command: 'python3', pid: '3001', user: 'user', protocol: 'IPv4', port: 6000, state: 'LISTEN' },
  { command: 'python3', pid: '3002', user: 'user', protocol: 'IPv4', port: 6001, state: 'LISTEN' },
  { command: 'nginx', pid: '4001', user: 'www-data', protocol: 'IPv4', port: 443, state: 'LISTEN' },
  { command: 'redis', pid: '5001', user: 'redis', protocol: 'IPv4', port: 6379, state: 'LISTEN' },
  { command: 'mysql', pid: '6001', user: 'mysql', protocol: 'IPv4', port: 3306, state: 'LISTEN' },
  { command: 'mongodb', pid: '7001', user: 'mongodb', protocol: 'IPv4', port: 27017, state: 'LISTEN' },
  { command: 'node', pid: '8001', user: 'user', protocol: 'IPv4', port: 8080, state: 'LISTEN' },
  { command: 'node', pid: '8002', user: 'user', protocol: 'IPv4', port: 8081, state: 'LISTEN' },
  { command: 'node', pid: '8003', user: 'user', protocol: 'IPv4', port: 8082, state: 'LISTEN' },
  { command: 'docker', pid: '9001', user: 'root', protocol: 'IPv4', port: 9000, state: 'LISTEN' },
  { command: 'docker', pid: '9002', user: 'root', protocol: 'IPv4', port: 9001, state: 'LISTEN' },
  { command: 'docker', pid: '9003', user: 'root', protocol: 'IPv4', port: 9002, state: 'LISTEN' },
  { command: 'python3', pid: '10001', user: 'user', protocol: 'IPv4', port: 7000, state: 'LISTEN' },
  { command: 'python3', pid: '10002', user: 'user', protocol: 'IPv4', port: 7001, state: 'LISTEN' },
  { command: 'nginx', pid: '11001', user: 'www-data', protocol: 'IPv4', port: 8443, state: 'LISTEN' },
  { command: 'node', pid: '12001', user: 'user', protocol: 'IPv4', port: 5000, state: 'LISTEN' },
  { command: 'node', pid: '12002', user: 'user', protocol: 'IPv4', port: 5001, state: 'LISTEN' },
  { command: 'node', pid: '12003', user: 'user', protocol: 'IPv4', port: 5002, state: 'LISTEN' },
  { command: 'docker', pid: '13001', user: 'root', protocol: 'IPv4', port: 8000, state: 'LISTEN' },
  { command: 'docker', pid: '13002', user: 'root', protocol: 'IPv4', port: 8001, state: 'LISTEN' },
  { command: 'postgres', pid: '14001', user: 'postgres', protocol: 'IPv4', port: 5433, state: 'LISTEN' },
  { command: 'redis', pid: '15001', user: 'redis', protocol: 'IPv4', port: 6380, state: 'LISTEN' },
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

