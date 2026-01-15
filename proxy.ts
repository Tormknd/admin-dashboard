import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: ['/', '/api/:path*'], // Protège la home et l'API
};

export function proxy(req: NextRequest) {
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.next();
  }

  const pathname = req.nextUrl.pathname;
  if (pathname.startsWith('/api/cron/')) {
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || '';
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return NextResponse.next();
    }
    return new NextResponse('Forbidden', { status: 403 });
  }

  const basicAuth = req.headers.get('authorization');

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    if (
      user === process.env.DASHBOARD_USER &&
      pwd === process.env.DASHBOARD_PWD
    ) {
      return NextResponse.next();
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Dashboard"',
    },
  });
}

