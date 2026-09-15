import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE } from '@/app/admin-auth';

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin) return new Response('Not found', { status: 404 });
  const response = NextResponse.redirect(new URL('/', request.url), 303);
  response.cookies.set(ADMIN_SESSION_COOKIE, '', { httpOnly: true, sameSite: 'strict', secure: new URL(request.url).protocol === 'https:', path: '/', maxAge: 0 });
  return response;
}
