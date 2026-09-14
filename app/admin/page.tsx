import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { requireChatGPTUser } from '@/app/chatgpt-auth';
import { AdminProjectForm } from './project-form';

const OWNER_USER_ID = 'f4e7052e-2a2b-481f-8063-8da67caa6931';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const requestHeaders = await headers();
  const host = requestHeaders.get('host') ?? '';
  const isLocal = host.startsWith('localhost') || host.startsWith('127.0.0.1');

  if (!isLocal) {
    const user = await requireChatGPTUser('/admin.html');
    if (user.userId !== OWNER_USER_ID) notFound();
  }

  return <AdminProjectForm />;
}
