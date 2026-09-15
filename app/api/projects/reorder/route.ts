import { NextResponse } from 'next/server';
import { getBindings } from '@/lib/projects';
import { isOwner } from '../route';

export async function PATCH(request: Request) {
  if (!(await isOwner(request))) return NextResponse.json({ message: 'Not found.' }, { status: 404 });
  try {
    const body = await request.json() as { ids?: unknown[] };
    const ids = body.ids?.map(Number);
    if (!ids?.length || ids.some((id) => !Number.isInteger(id))) return NextResponse.json({ message: 'Invalid project order.' }, { status: 400 });
    const { db } = getBindings();
    await db.batch(ids.map((id, position) => db.prepare('UPDATE projects SET position = ?, updated_at = ? WHERE id = ?').bind(position, Date.now(), id)));
    return NextResponse.json({ message: 'Project order saved.' });
  } catch (error) {
    console.error('Unable to reorder projects', error);
    return NextResponse.json({ message: 'The project order could not be saved.' }, { status: 500 });
  }
}
