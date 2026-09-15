import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/app/admin-auth';
import { AdminProjectForm } from '@/app/admin/project-form';
import { listStoredProjects } from '@/lib/projects';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminPage() {
  const allowed = await requireAdmin();
  if (!allowed) {
    if (process.env.ADMIN_PASSWORD) redirect('/admin-login?return_to=%2Fadmin.html');
    notFound();
  }

  return <AdminProjectForm initialProjects={await listStoredProjects()} />;
}
