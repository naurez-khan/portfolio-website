import { NextResponse } from 'next/server';
import { isAdminMutation } from '@/app/admin-auth';
import { listStoredProjects, saveProjectImage, saveStoredProjects } from '@/lib/projects';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export async function isOwner(request: Request) {
  return isAdminMutation(request);
}

export function cleanUrl(value: FormDataEntryValue | null) {
  const url = String(value ?? '').trim();
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : null;
  } catch { return null; }
}

export function readProjectFields(formData: FormData) {
  return {
    title: String(formData.get('title') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim(),
    category: String(formData.get('category') ?? '').trim(),
    year: Number(formData.get('year')),
    technologies: String(formData.get('technologies') ?? '').split(',').map((item) => item.trim()).filter(Boolean).slice(0, 12),
    demoUrl: cleanUrl(formData.get('demoUrl')),
    githubUrl: cleanUrl(formData.get('githubUrl')),
    problem: String(formData.get('problem') ?? '').trim(),
    role: String(formData.get('role') ?? '').trim(),
    result: String(formData.get('result') ?? '').trim(),
  };
}

export function validateProject(fields: ReturnType<typeof readProjectFields>, formData: FormData) {
  if (!fields.title || fields.title.length > 100) return 'Enter a project title of 100 characters or fewer.';
  if (!fields.description || fields.description.length > 1200) return 'Explain what you built in 1,200 characters or fewer.';
  if (!fields.problem || fields.problem.length > 1200) return 'Explain the problem in 1,200 characters or fewer.';
  if (!fields.role || fields.role.length > 160) return 'Enter your role in 160 characters or fewer.';
  if (!fields.result || fields.result.length > 1200) return 'Explain the result in 1,200 characters or fewer.';
  if (!fields.category || fields.category.length > 60) return 'Enter a category of 60 characters or fewer.';
  if (!Number.isInteger(fields.year) || fields.year < 2000 || fields.year > 2100) return 'Enter a valid project year.';
  for (const field of ['demoUrl', 'githubUrl'] as const) {
    if (String(formData.get(field) ?? '').trim() && !fields[field]) return `Enter a valid ${field === 'demoUrl' ? 'demo' : 'GitHub'} URL.`;
  }
  return null;
}

export async function saveImage(image: File) {
  if (!ALLOWED_IMAGE_TYPES.has(image.type) || image.size > MAX_IMAGE_SIZE) throw new Error('INVALID_IMAGE');
  return saveProjectImage(image);
}

export async function GET() {
  try { return NextResponse.json({ projects: await listStoredProjects() }); }
  catch (error) {
    console.error('Unable to load projects', error);
    return NextResponse.json({ message: 'Projects are temporarily unavailable.' }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!(await isOwner(request))) return NextResponse.json({ message: 'Not found.' }, { status: 404 });
  let imageUrl: string | null = null;
  try {
    const formData = await request.formData();
    const fields = readProjectFields(formData);
    const validationError = validateProject(fields, formData);
    if (validationError) return NextResponse.json({ message: validationError }, { status: 400 });
    const image = formData.get('image');
    if (!(image instanceof File) || image.size === 0) return NextResponse.json({ message: 'Choose an image for the project.' }, { status: 400 });
    imageUrl = await saveImage(image);
    const projects = await listStoredProjects();
    const now = Date.now();
    projects.push({
      id: now, title: fields.title, description: fields.description, imageUrl, imageAlt: `${fields.title} project preview`,
      category: fields.category, year: fields.year, technologies: fields.technologies, demoUrl: fields.demoUrl,
      githubUrl: fields.githubUrl, problem: fields.problem, role: fields.role, result: fields.result,
      position: projects.length, createdAt: now,
    });
    await saveStoredProjects(projects);
    return NextResponse.json({ message: 'Project published.' }, { status: 201 });
  } catch (error) {
    if (imageUrl) {
      const { deleteProjectImage } = await import('@/lib/projects');
      await deleteProjectImage(imageUrl).catch(() => undefined);
    }
    if (error instanceof Error && error.message === 'PROJECT_STORAGE_NOT_CONFIGURED') return NextResponse.json({ message: 'Connect a Vercel Blob store before editing projects.' }, { status: 503 });
    if (error instanceof Error && error.message === 'INVALID_IMAGE') return NextResponse.json({ message: 'Use a JPG, PNG, WebP, or GIF image up to 5 MB.' }, { status: 400 });
    console.error('Unable to save project', error);
    return NextResponse.json({ message: 'The project could not be saved. Please try again.' }, { status: 500 });
  }
}
