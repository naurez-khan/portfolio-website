import { NextResponse } from 'next/server';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { getBindings, listStoredProjects } from '@/lib/projects';

const OWNER_USER_ID = 'f4e7052e-2a2b-481f-8063-8da67caa6931';
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

function isLocalRequest(request: Request) {
  const hostname = new URL(request.url).hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

async function isOwner(request: Request) {
  if (isLocalRequest(request)) return true;
  const user = await getChatGPTUser();
  return user?.userId === OWNER_USER_ID;
}

export async function GET() {
  try {
    return NextResponse.json({ projects: await listStoredProjects() });
  } catch (error) {
    console.error('Unable to load projects', error);
    return NextResponse.json({ message: 'Projects are temporarily unavailable.' }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!(await isOwner(request))) {
    return NextResponse.json({ message: 'You do not have permission to add projects.' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const title = String(formData.get('title') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const image = formData.get('image');

    if (!title || title.length > 100) {
      return NextResponse.json({ message: 'Enter a project title of 100 characters or fewer.' }, { status: 400 });
    }
    if (!description || description.length > 1200) {
      return NextResponse.json({ message: 'Enter a description of 1,200 characters or fewer.' }, { status: 400 });
    }
    if (!(image instanceof File) || image.size === 0) {
      return NextResponse.json({ message: 'Choose an image for the project.' }, { status: 400 });
    }
    if (!ALLOWED_IMAGE_TYPES.has(image.type) || image.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ message: 'Use a JPG, PNG, WebP, or GIF image up to 5 MB.' }, { status: 400 });
    }

    const { db, bucket } = getBindings();
    const extension = image.type === 'image/jpeg' ? 'jpg' : image.type.split('/')[1];
    const imageKey = `${crypto.randomUUID()}.${extension}`;

    await bucket.put(imageKey, await image.arrayBuffer(), {
      httpMetadata: { contentType: image.type },
      customMetadata: { originalName: image.name.slice(0, 200) },
    });

    try {
      const result = await db
        .prepare(
          `INSERT INTO projects (title, description, image_key, image_alt, created_at)
           VALUES (?, ?, ?, ?, ?)
           RETURNING id`,
        )
        .bind(title, description, imageKey, `${title} project preview`, Date.now())
        .first<{ id: number }>();

      return NextResponse.json(
        {
          project: {
            id: result?.id,
            title,
            description,
            imageUrl: `/api/project-images/${encodeURIComponent(imageKey)}`,
            imageAlt: `${title} project preview`,
          },
        },
        { status: 201 },
      );
    } catch (error) {
      await bucket.delete(imageKey);
      throw error;
    }
  } catch (error) {
    console.error('Unable to save project', error);
    return NextResponse.json({ message: 'The project could not be saved. Please try again.' }, { status: 500 });
  }
}
