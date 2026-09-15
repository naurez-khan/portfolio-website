import { NextResponse } from 'next/server';
import { env } from 'cloudflare:workers';
import { getBindings } from '@/lib/projects';
import { isOwner } from '../projects/route';

async function emailContactMessage(details: { name:string; email:string; subject:string; message:string }) {
  if (!env.RESEND_API_KEY || !env.CONTACT_TO_EMAIL || !env.CONTACT_FROM_EMAIL) {
    throw new Error('Email delivery is not configured.');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      'content-type': 'application/json',
      'idempotency-key': crypto.randomUUID(),
      'user-agent': 'Muhammad-Naurez-Portfolio/1.0',
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM_EMAIL,
      to: [env.CONTACT_TO_EMAIL],
      reply_to: details.email,
      subject: `[Portfolio] ${details.subject}`,
      text: `New portfolio enquiry\n\nName: ${details.name}\nEmail: ${details.email}\nSubject: ${details.subject}\n\n${details.message}`,
    }),
  });

  if (!response.ok) {
    const providerMessage = await response.text();
    console.error('Resend rejected contact email', response.status, providerMessage.slice(0, 500));
    throw new Error('Email delivery failed.');
  }
}

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
    await emailContactMessage({ name, email, subject, message });

    try {
      const { db } = getBindings();
      await db.prepare('INSERT INTO contact_messages (name, email, subject, message, created_at) VALUES (?, ?, ?, ?, ?)')
        .bind(name, email, subject, message, Date.now()).run();
    } catch (storageError) {
      console.error('Email sent, but contact backup could not be saved', storageError);
    }

    return NextResponse.json({ message: 'Thanks — your message was emailed successfully.' }, { status: 201 });
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
