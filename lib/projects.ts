import { env } from 'cloudflare:workers';

export type StoredProject = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  category: string;
  year: number;
  technologies: string[];
  demoUrl: string | null;
  githubUrl: string | null;
  problem: string;
  role: string;
  result: string;
  position: number;
  createdAt: number;
};

type ProjectRow = {
  id: number;
  title: string;
  description: string;
  image_key: string;
  image_alt: string;
  category: string;
  year: number;
  technologies: string;
  demo_url: string | null;
  github_url: string | null;
  problem: string;
  role: string;
  result: string;
  position: number;
  created_at: number;
};

const defaultProjects = [
  {
    id: -1,
    title: 'Personal Portfolio',
    description: 'Designed and built a responsive portfolio that brings my work, background, CV, and contact details into one clear experience.',
    imageKey: 'public:/portfolio-preview.webp',
    imageAlt: 'Muhammad Naurez Khan portfolio website',
    category: 'Web', year: 2026, technologies: ['Next.js', 'TypeScript', 'UI'],
    demoUrl: '/', githubUrl: null,
    problem: 'My projects and background needed one credible place that recruiters could explore quickly.',
    role: 'Designer and developer',
    result: 'A fast, mobile-friendly home for my work that I can keep improving through an owner dashboard.',
    position: 0,
  },
  {
    id: -2,
    title: 'Math Department Website',
    description: 'Built a responsive department website that organizes academic information and useful resources into an easy-to-scan interface.',
    imageKey: 'public:/math-department-preview.webp',
    imageAlt: 'Department of Mathematics website',
    category: 'Web', year: 2026, technologies: ['HTML', 'CSS', 'JavaScript'],
    demoUrl: null, githubUrl: null,
    problem: 'Department information and resources were difficult to present clearly across different screen sizes.',
    role: 'Frontend developer',
    result: 'A clearer academic experience with responsive navigation and structured content.',
    position: 1,
  },
  {
    id: -3,
    title: 'Blog Website',
    description: 'Created a clean personal publishing space for sharing ideas, lessons, and notes in progress.',
    imageKey: 'public:/blog-preview.webp',
    imageAlt: 'Muhammad Naurez Khan blog website',
    category: 'Web', year: 2026, technologies: ['HTML', 'CSS', 'JavaScript'],
    demoUrl: null, githubUrl: null,
    problem: 'I needed a simple place to document what I was learning and communicate ideas clearly.',
    role: 'Designer and frontend developer',
    result: 'A focused, readable blog layout that works well on desktop and mobile.',
    position: 2,
  },
];

export function getBindings() {
  if (!env.DB || !env.BUCKET) {
    throw new Error('Project storage is unavailable.');
  }

  return { db: env.DB, bucket: env.BUCKET };
}

export async function ensureDefaultProjects(db: D1Database) {
  const marker = await db.prepare(`SELECT value FROM site_settings WHERE key = 'default-projects-v1'`).first();
  if (marker) return;

  const now = Date.now();
  const inserts = defaultProjects.map((project) => db.prepare(
    `INSERT OR IGNORE INTO projects
      (id, title, description, image_key, image_alt, category, year, technologies, demo_url, github_url, problem, role, result, position, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(project.id, project.title, project.description, project.imageKey, project.imageAlt, project.category,
    project.year, JSON.stringify(project.technologies), project.demoUrl, project.githubUrl, project.problem,
    project.role, project.result, project.position, now, now));
  await db.batch(inserts);
  await db.prepare(`INSERT OR REPLACE INTO site_settings (key, value) VALUES ('default-projects-v1', 'seeded')`).run();
}

export async function listStoredProjects(): Promise<StoredProject[]> {
  const { db } = getBindings();
  await ensureDefaultProjects(db);
  const result = await db
    .prepare(
      `SELECT id, title, description, image_key, image_alt, category, year, technologies,
              demo_url, github_url, problem, role, result, position, created_at
       FROM projects
       ORDER BY position ASC, created_at DESC, id DESC`,
    )
    .all<ProjectRow>();

  return result.results.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: row.image_key.startsWith('public:') ? row.image_key.slice(7) : `/api/project-images/${encodeURIComponent(row.image_key)}`,
    imageAlt: row.image_alt,
    category: row.category,
    year: row.year,
    technologies: (() => { try { return JSON.parse(row.technologies) as string[]; } catch { return []; } })(),
    demoUrl: row.demo_url,
    githubUrl: row.github_url,
    problem: row.problem,
    role: row.role,
    result: row.result,
    position: row.position,
    createdAt: row.created_at,
  }));
}
