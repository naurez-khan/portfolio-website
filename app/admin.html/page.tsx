import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/app/admin-auth';
import { AdminProjectForm } from '@/app/admin/project-form';
import { getBindings, listStoredProjects } from '@/lib/projects';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminPage() {
  const user = await requireAdmin('/admin.html');
  if (!user) notFound();

  const [initialProjects, messageResult] = await Promise.all([
    listStoredProjects(),
    getBindings().db.prepare('SELECT id, name, email, subject, message, created_at FROM contact_messages ORDER BY created_at DESC LIMIT 50').all(),
  ]);

  return <AdminProjectForm initialProjects={initialProjects} initialMessages={messageResult.results as never[]} />;
}
