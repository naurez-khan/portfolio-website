import { env } from 'cloudflare:workers';

export type StoredProject = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  createdAt: number;
};

type ProjectRow = {
  id: number;
  title: string;
  description: string;
  image_key: string;
  image_alt: string;
  created_at: number;
};

export function getBindings() {
  if (!env.DB || !env.BUCKET) {
    throw new Error('Project storage is unavailable.');
  }

  return { db: env.DB, bucket: env.BUCKET };
}

export async function listStoredProjects(): Promise<StoredProject[]> {
  const { db } = getBindings();
  const result = await db
    .prepare(
      `SELECT id, title, description, image_key, image_alt, created_at
       FROM projects
       ORDER BY created_at DESC, id DESC`,
    )
    .all<ProjectRow>();

  return result.results.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: `/api/project-images/${encodeURIComponent(row.image_key)}`,
    imageAlt: row.image_alt,
    createdAt: row.created_at,
  }));
}
