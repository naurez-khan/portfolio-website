import { getChatGPTUser, requireChatGPTUser } from '@/app/chatgpt-auth';

const ADMIN_EMAIL = 'muhammadnaurezkhan@gmail.com';

function isAdminEmail(email: string) {
  return email.trim().toLowerCase() === ADMIN_EMAIL;
}

export async function requireAdmin(returnTo = '/admin.html') {
  const user = await requireChatGPTUser(returnTo);
  return isAdminEmail(user.email) ? user : null;
}

export async function isAdminMutation(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return false;

  try {
    if (new URL(origin).origin !== new URL(request.url).origin) return false;
  } catch {
    return false;
  }

  const user = await getChatGPTUser();
  return Boolean(user && isAdminEmail(user.email));
}
