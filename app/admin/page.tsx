import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { requireChatGPTUser } from '@/app/chatgpt-auth';
import { AdminProjectForm } from './project-form';
import { getBindings, listStoredProjects } from '@/lib/projects';

const OWNER_EMAIL = 'muhammadnaurezkhan@gmail.com';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const requestHeaders = await headers();
  const host = requestHeaders.get('host') ?? '';
  const isLocal = host.startsWith('localhost') || host.startsWith('127.0.0.1');

  if (!isLocal) {
    const user = await requireChatGPTUser('/admin.html');
    if (user.email.toLowerCase() !== OWNER_EMAIL) notFound();
  }

  const [initialProjects, messageResult] = await Promise.all([
    listStoredProjects(),
    getBindings().db.prepare('SELECT id, name, email, subject, message, created_at FROM contact_messages ORDER BY created_at DESC LIMIT 50').all(),
  ]);

  return <AdminProjectForm initialProjects={initialProjects} initialMessages={messageResult.results as never[]} />;
}
