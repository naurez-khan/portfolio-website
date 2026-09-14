import { NextResponse } from 'next/server';
import { getBindings } from '@/lib/projects';
import { isOwner } from '../projects/route';

export async function POST(request: Request) {
  try {
    const data = await request.json() as Record<string, unknown>;
    const name = String(data.name ?? '').trim();
    const email = String(data.email ?? '').trim();
    const subject = String(data.subject ?? '').trim();
    const message = String(data.message ?? '').trim();
    if (String(data.website ?? '')) return NextResponse.json({ message: 'Message received.' }, { status: 201 });
    if (!name || name.length > 100 || !/^\S+@\S+\.\S+$/.test(email) || email.length > 200 || !subject || subject.length > 160 || !message || message.length > 3000) {
      return NextResponse.json({ message: 'Please complete every field with valid information.' }, { status: 400 });
    }
    const { db } = getBindings();
    await db.prepare('INSERT INTO contact_messages (name, email, subject, message, created_at) VALUES (?, ?, ?, ?, ?)')
      .bind(name, email, subject, message, Date.now()).run();
    return NextResponse.json({ message: 'Thanks — your message has been sent.' }, { status: 201 });
  } catch (error) {
    console.error('Unable to save contact message', error);
    return NextResponse.json({ message: 'Your message could not be sent. Please try again.' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  if (!(await isOwner(request))) return NextResponse.json({ message: 'Not authorized.' }, { status: 403 });
  try {
    const { db } = getBindings();
    const result = await db.prepare('SELECT id, name, email, subject, message, created_at FROM contact_messages ORDER BY created_at DESC LIMIT 50').all();
    return NextResponse.json({ messages: result.results });
  } catch (error) {
    console.error('Unable to load messages', error);
    return NextResponse.json({ message: 'Messages are temporarily unavailable.' }, { status: 503 });
  }
}
