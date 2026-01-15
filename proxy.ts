import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: ['/', '/api/:path*'], // Protège la home et l'API
};

export function proxy(req: NextRequest) {
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.next();
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

