import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, createAdminSession, verifyAdminPassword } from '@/app/admin-auth';

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin) return new Response('Not found', { status: 404 });
  const data = await request.formData();
  const password = String(data.get('password') ?? '');
  if (!verifyAdminPassword(password)) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return NextResponse.redirect(new URL('/admin-login?error=1', request.url), 303);
  }

  const session = createAdminSession();
  const response = NextResponse.redirect(new URL('/admin.html', request.url), 303);
  response.cookies.set(ADMIN_SESSION_COOKIE, session.value, {
    httpOnly: true, sameSite: 'strict', secure: new URL(request.url).protocol === 'https:', path: '/', maxAge: session.maxAge,
  });
  return response;
}
