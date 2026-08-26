import { NextRequest, NextResponse } from 'next/server';
import { baseUrl } from './lib/api';

export async function middleware(req: NextRequest, res: NextResponse) {
  const { nextUrl } = req;

  // console.log('url', nextUrl);

  const dashboardPath = '/dashboard';
  const authPath = '/auth';

  const accessToken = req.cookies.get('accessToken')?.value;
  const refreshToken = req.cookies.get('refreshToken')?.value;

  const isAuthenticated = !!(accessToken || refreshToken);

  if (isAuthenticated) {
    // Authenticated redirect to dashboard
    if (nextUrl.pathname.startsWith(authPath)) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    if (accessToken) {
      return NextResponse.next();
    }

    // refresh access token
    if (refreshToken) {
      try {
        const refreshTokneResponse = await fetch(
          `${baseUrl}/auth/refresh-token`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Cookie: `refreshToken=${refreshToken}`,
            },
          },
        );
        // if response not fail
        if (refreshTokneResponse.ok) {
          const response = NextResponse.next();
          // console.log('Refresh token response');
          // console.log(refreshTokneResponse);
          // console.log('Set Cookies', setCookies);

          // Extract cookies and set
          const setCookies = refreshTokneResponse.headers.get('set-cookie');
          if (setCookies) {
            const cookies = setCookies.split(',');
            cookies.forEach((cookie) => {
              const [nameValue] = cookie.split(';');
              const [name, value] = nameValue.split('=');
              // console.log(cookie)
              // console.log(nameValue)
              if (name && value) {
                console.log({ name, value });
                response.cookies.set(name.trim(), value.trim(), {
                  httpOnly: true,
                  secure: process.env.NODE_ENV === 'production',
                  sameSite: 'lax' as const,
                  path: '/',
                  maxAge:
                    name.toLowerCase() == 'refreshtoken'
                      ? 7 * 24 * 60 * 60 * 1000
                      : 15 * 60 * 1000,
                });
              }
            });

            return response;
          }
        } else {
          // if response fails delete refresh-token
          const response = NextResponse.next();
          response.cookies.delete('refreshToken');
          return response;
        }
      } catch (error) {
        console.error('Failed to refresh token', error);
      }
    }
  } else {
    // Not authenticated redirect to login
    if (nextUrl.pathname.startsWith(dashboardPath)) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/auth/:path*', '/dashboard/:path*'],
};
