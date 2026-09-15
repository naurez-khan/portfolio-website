import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { hasAdminAccess } from '@/app/admin-auth';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Portfolio Admin', robots: { index: false, follow: false, nocache: true } };

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await hasAdminAccess()) redirect('/admin.html');
  const configured = Boolean(process.env.ADMIN_PASSWORD);
  const hasError = Boolean((await searchParams).error);

  return <main className="admin-login-page"><section className="admin-login-card">
    <a href="/" className="admin-back">← Portfolio</a>
    <p className="admin-login-kicker">Owner access</p><h1>Portfolio admin</h1>
    {configured ? <form action="/api/admin/login" method="post" className="admin-login-form">
      <input type="hidden" name="returnTo" value="/admin.html" />
      <label htmlFor="password">Admin password</label>
      <input id="password" name="password" type="password" autoComplete="current-password" required autoFocus />
      {hasError && <p className="admin-login-error" role="alert">That password is incorrect.</p>}
      <button type="submit">Sign in</button>
    </form> : <p className="admin-login-error">Admin access is not configured. Add the <code>ADMIN_PASSWORD</code> environment variable in Vercel.</p>}
  </section></main>;
}
