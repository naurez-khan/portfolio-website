import { NextResponse } from 'next/server';
import { listStoredProjects, saveStoredProjects } from '@/lib/projects';
import { isOwner } from '../route';

export async function PATCH(request: Request) {
  if (!(await isOwner(request))) return NextResponse.json({ message: 'Not found.' }, { status: 404 });
  try {
    const body = await request.json() as { ids?: unknown[] };
    const ids = body.ids?.map(Number);
    if (!ids?.length || ids.some((id) => !Number.isInteger(id))) return NextResponse.json({ message: 'Invalid project order.' }, { status: 400 });
    const projects = await listStoredProjects();
    if (ids.length !== projects.length || new Set(ids).size !== ids.length || ids.some((id) => !projects.some((project) => project.id === id))) {
      return NextResponse.json({ message: 'Invalid project order.' }, { status: 400 });
    }
    const byId = new Map(projects.map((project) => [project.id, project]));
    await saveStoredProjects(ids.map((id, position) => ({ ...byId.get(id)!, position })));
    return NextResponse.json({ message: 'Project order saved.' });
  } catch (error) {
    if (error instanceof Error && error.message === 'PROJECT_STORAGE_NOT_CONFIGURED') return NextResponse.json({ message: 'Connect a Vercel Blob store before editing projects.' }, { status: 503 });
    console.error('Unable to reorder projects', error);
    return NextResponse.json({ message: 'The project order could not be saved.' }, { status: 500 });
  }
}
