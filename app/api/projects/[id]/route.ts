import { NextResponse } from 'next/server';
import { deleteProjectImage, listStoredProjects, saveStoredProjects } from '@/lib/projects';
import { isOwner, readProjectFields, saveImage, validateProject } from '../route';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isOwner(request))) return NextResponse.json({ message: 'Not found.' }, { status: 404 });
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ message: 'Invalid project.' }, { status: 400 });
  let newImageUrl: string | null = null;
  try {
    const formData = await request.formData();
    const fields = readProjectFields(formData);
    const validationError = validateProject(fields, formData);
    if (validationError) return NextResponse.json({ message: validationError }, { status: 400 });
    const projects = await listStoredProjects();
    const index = projects.findIndex((project) => project.id === id);
    if (index < 0) return NextResponse.json({ message: 'Project not found.' }, { status: 404 });
    const current = projects[index];
    const image = formData.get('image');
    if (image instanceof File && image.size > 0) newImageUrl = await saveImage(image);
    projects[index] = { ...current, ...fields, imageUrl: newImageUrl ?? current.imageUrl, imageAlt: `${fields.title} project preview` };
    await saveStoredProjects(projects);
    if (newImageUrl) await deleteProjectImage(current.imageUrl).catch(() => undefined);
    return NextResponse.json({ message: 'Project updated.' });
  } catch (error) {
    if (newImageUrl) await deleteProjectImage(newImageUrl).catch(() => undefined);
    if (error instanceof Error && error.message === 'PROJECT_STORAGE_NOT_CONFIGURED') return NextResponse.json({ message: 'Connect a Vercel Blob store before editing projects.' }, { status: 503 });
    if (error instanceof Error && error.message === 'INVALID_IMAGE') return NextResponse.json({ message: 'Use a JPG, PNG, WebP, or GIF image up to 5 MB.' }, { status: 400 });
    console.error('Unable to update project', error);
    return NextResponse.json({ message: 'The project could not be updated.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isOwner(request))) return NextResponse.json({ message: 'Not found.' }, { status: 404 });
  const id = Number((await params).id);
  try {
    const projects = await listStoredProjects();
    const current = projects.find((project) => project.id === id);
    if (!current) return NextResponse.json({ message: 'Project not found.' }, { status: 404 });
    await saveStoredProjects(projects.filter((project) => project.id !== id).map((project, position) => ({ ...project, position })));
    await deleteProjectImage(current.imageUrl).catch(() => undefined);
    return NextResponse.json({ message: 'Project deleted.' });
  } catch (error) {
    if (error instanceof Error && error.message === 'PROJECT_STORAGE_NOT_CONFIGURED') return NextResponse.json({ message: 'Connect a Vercel Blob store before editing projects.' }, { status: 503 });
    console.error('Unable to delete project', error);
    return NextResponse.json({ message: 'The project could not be deleted.' }, { status: 500 });
  }
}
