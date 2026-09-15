import { NextResponse } from 'next/server';
import { getBindings } from '@/lib/projects';
import { isOwner, readProjectFields, saveImage, validateProject } from '../route';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isOwner(request))) return NextResponse.json({ message: 'Not found.' }, { status: 404 });
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ message: 'Invalid project.' }, { status: 400 });
  let newImageKey: string | null = null;
  try {
    const formData = await request.formData();
    const fields = readProjectFields(formData);
    const validationError = validateProject(fields, formData);
    if (validationError) return NextResponse.json({ message: validationError }, { status: 400 });
    const { db, bucket } = getBindings();
    const current = await db.prepare('SELECT image_key FROM projects WHERE id = ?').bind(id).first<{ image_key: string }>();
    if (!current) return NextResponse.json({ message: 'Project not found.' }, { status: 404 });
    const image = formData.get('image');
    if (image instanceof File && image.size > 0) newImageKey = await saveImage(image);
    await db.prepare(
      `UPDATE projects SET title = ?, description = ?, image_key = ?, image_alt = ?, category = ?, year = ?, technologies = ?,
       demo_url = ?, github_url = ?, problem = ?, role = ?, result = ?, updated_at = ? WHERE id = ?`,
    ).bind(fields.title, fields.description, newImageKey ?? current.image_key, `${fields.title} project preview`, fields.category,
      fields.year, JSON.stringify(fields.technologies), fields.demoUrl, fields.githubUrl, fields.problem, fields.role,
      fields.result, Date.now(), id).run();
    if (newImageKey && !current.image_key.startsWith('public:')) await bucket.delete(current.image_key);
    return NextResponse.json({ message: 'Project updated.' });
  } catch (error) {
    if (newImageKey) await getBindings().bucket.delete(newImageKey);
    if (error instanceof Error && error.message === 'INVALID_IMAGE') return NextResponse.json({ message: 'Use a JPG, PNG, WebP, or GIF image up to 5 MB.' }, { status: 400 });
    console.error('Unable to update project', error);
    return NextResponse.json({ message: 'The project could not be updated.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isOwner(request))) return NextResponse.json({ message: 'Not found.' }, { status: 404 });
  const id = Number((await params).id);
  try {
    const { db, bucket } = getBindings();
    const current = await db.prepare('SELECT image_key FROM projects WHERE id = ?').bind(id).first<{ image_key: string }>();
    if (!current) return NextResponse.json({ message: 'Project not found.' }, { status: 404 });
    await db.prepare('DELETE FROM projects WHERE id = ?').bind(id).run();
    if (!current.image_key.startsWith('public:')) await bucket.delete(current.image_key);
    return NextResponse.json({ message: 'Project deleted.' });
  } catch (error) {
    console.error('Unable to delete project', error);
    return NextResponse.json({ message: 'The project could not be deleted.' }, { status: 500 });
  }
}
