import { NextResponse } from 'next/server';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { getBindings, listStoredProjects } from '@/lib/projects';

export const OWNER_EMAIL = 'muhammadnaurezkhan@gmail.com';
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export function isLocalRequest(request: Request) {
  const hostname = new URL(request.url).hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

export async function isOwner(request: Request) {
  if (isLocalRequest(request)) return true;
  const user = await getChatGPTUser();
  return user?.email.toLowerCase() === OWNER_EMAIL;
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
  const { bucket } = getBindings();
  const extension = image.type === 'image/jpeg' ? 'jpg' : image.type.split('/')[1];
  const imageKey = `${crypto.randomUUID()}.${extension}`;
  await bucket.put(imageKey, await image.arrayBuffer(), {
    httpMetadata: { contentType: image.type }, customMetadata: { originalName: image.name.slice(0, 200) },
  });
  return imageKey;
}

export async function GET() {
  try { return NextResponse.json({ projects: await listStoredProjects() }); }
  catch (error) {
    console.error('Unable to load projects', error);
    return NextResponse.json({ message: 'Projects are temporarily unavailable.' }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!(await isOwner(request))) return NextResponse.json({ message: 'You do not have permission to add projects.' }, { status: 403 });
  let imageKey: string | null = null;
  try {
    const formData = await request.formData();
    const fields = readProjectFields(formData);
    const validationError = validateProject(fields, formData);
    if (validationError) return NextResponse.json({ message: validationError }, { status: 400 });
    const image = formData.get('image');
    if (!(image instanceof File) || image.size === 0) return NextResponse.json({ message: 'Choose an image for the project.' }, { status: 400 });
    imageKey = await saveImage(image);
    const { db } = getBindings();
    const max = await db.prepare('SELECT COALESCE(MAX(position), -1) AS position FROM projects').first<{ position: number }>();
    const now = Date.now();
    await db.prepare(
      `INSERT INTO projects (title, description, image_key, image_alt, category, year, technologies, demo_url, github_url, problem, role, result, position, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(fields.title, fields.description, imageKey, `${fields.title} project preview`, fields.category, fields.year,
      JSON.stringify(fields.technologies), fields.demoUrl, fields.githubUrl, fields.problem, fields.role, fields.result,
      (max?.position ?? -1) + 1, now, now).run();
    return NextResponse.json({ message: 'Project published.' }, { status: 201 });
  } catch (error) {
    if (imageKey) await getBindings().bucket.delete(imageKey);
    if (error instanceof Error && error.message === 'INVALID_IMAGE') return NextResponse.json({ message: 'Use a JPG, PNG, WebP, or GIF image up to 5 MB.' }, { status: 400 });
    console.error('Unable to save project', error);
    return NextResponse.json({ message: 'The project could not be saved. Please try again.' }, { status: 500 });
  }
}
