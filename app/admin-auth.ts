import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { getChatGPTUser } from '@/app/chatgpt-auth';

export const ADMIN_SESSION_COOKIE = 'portfolio_admin_session';
const ADMIN_EMAIL = 'muhammadnaurezkhan@gmail.com';
const SESSION_LIFETIME_SECONDS = 12 * 60 * 60;

function isAdminEmail(email: string) {
  return email.trim().toLowerCase() === ADMIN_EMAIL;
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD?.trim() ?? '';
}

function signExpiry(expiry: string) {
  return createHmac('sha256', getAdminPassword()).update(`portfolio-admin:${expiry}`).digest('hex');
}

function safeEqual(left: string, right: string) {
  const leftHash = createHash('sha256').update(left).digest();
  const rightHash = createHash('sha256').update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

export function verifyAdminPassword(password: string) {
  const expected = getAdminPassword();
  return Boolean(expected && safeEqual(password, expected));
}

export function createAdminSession() {
  const expiry = String(Math.floor(Date.now() / 1000) + SESSION_LIFETIME_SECONDS);
  return { value: `${expiry}.${signExpiry(expiry)}`, maxAge: SESSION_LIFETIME_SECONDS };
}

async function hasPasswordSession() {
  const password = getAdminPassword();
  if (!password) return false;
  const value = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!value) return false;
  const [expiry, signature] = value.split('.');
  if (!expiry || !signature || Number(expiry) <= Math.floor(Date.now() / 1000)) return false;
  return safeEqual(signature, signExpiry(expiry));
}

export async function hasAdminAccess() {
  const siteUser = await getChatGPTUser();
  if (siteUser) return isAdminEmail(siteUser.email);
  return hasPasswordSession();
}

export async function requireAdmin() {
  return hasAdminAccess();
}

export async function isAdminMutation(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    if (new URL(origin).origin !== new URL(request.url).origin) return false;
  } catch {
    return false;
  }
  return hasAdminAccess();
}
