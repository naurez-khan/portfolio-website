import { del, list, put } from '@vercel/blob';

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

const PROJECT_STATE_PREFIX = 'portfolio-data/projects-';

const defaultProjects: StoredProject[] = [
  {
    id: -1, title: 'Personal Portfolio',
    description: 'Designed and built a responsive portfolio that brings my work, background, CV, and contact details into one clear experience.',
    imageUrl: '/portfolio-preview.webp', imageAlt: 'Muhammad Naurez Khan portfolio website',
    category: 'Web', year: 2026, technologies: ['Next.js', 'TypeScript', 'UI'], demoUrl: '/',
    githubUrl: 'https://github.com/naurez-khan/portfolio-website',
    problem: 'My projects and background needed one credible place that recruiters could explore quickly.',
    role: 'Designer and developer',
    result: 'A fast, mobile-friendly home for my work that I can keep improving through an owner dashboard.',
    position: 0, createdAt: 0,
  },
  {
    id: -2, title: 'Math Department Website',
    description: 'Built a responsive department website that organizes academic information and useful resources into an easy-to-scan interface.',
    imageUrl: '/math-department-preview.webp', imageAlt: 'Department of Mathematics website',
    category: 'Web', year: 2026, technologies: ['HTML', 'CSS', 'JavaScript'], demoUrl: null, githubUrl: null,
    problem: 'Department information and resources were difficult to present clearly across different screen sizes.',
    role: 'Frontend developer', result: 'A clearer academic experience with responsive navigation and structured content.',
    position: 1, createdAt: 0,
  },
  {
    id: -3, title: 'Blog Website',
    description: 'Created a clean personal publishing space for sharing ideas, lessons, and notes in progress.',
    imageUrl: '/blog-preview.webp', imageAlt: 'Muhammad Naurez Khan blog website',
    category: 'Web', year: 2026, technologies: ['HTML', 'CSS', 'JavaScript'], demoUrl: null, githubUrl: null,
    problem: 'I needed a simple place to document what I was learning and communicate ideas clearly.',
    role: 'Designer and frontend developer', result: 'A focused, readable blog layout that works well on desktop and mobile.',
    position: 2, createdAt: 0,
  },
];

export function isProjectStorageConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function listStateBlobs() {
  const result = await list({ prefix: PROJECT_STATE_PREFIX, limit: 100 });
  return result.blobs.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
}

export async function listStoredProjects(): Promise<StoredProject[]> {
  if (!isProjectStorageConfigured()) return defaultProjects.map((project) => ({ ...project }));
  const [latest] = await listStateBlobs();
  if (!latest) return defaultProjects.map((project) => ({ ...project }));

  const response = await fetch(latest.url, { cache: 'no-store' });
  if (!response.ok) throw new Error('Project storage could not be read.');
  const projects = await response.json() as StoredProject[];
  return projects.sort((a, b) => a.position - b.position);
}

export async function saveStoredProjects(projects: StoredProject[]) {
  if (!isProjectStorageConfigured()) throw new Error('PROJECT_STORAGE_NOT_CONFIGURED');
  const previous = await listStateBlobs();
  const saved = await put(`${PROJECT_STATE_PREFIX}${Date.now()}-${crypto.randomUUID()}.json`, JSON.stringify(projects), {
    access: 'public', addRandomSuffix: false, contentType: 'application/json', cacheControlMaxAge: 60,
  });
  const staleUrls = previous.map((blob) => blob.url).filter((url) => url !== saved.url);
  if (staleUrls.length) await del(staleUrls).catch((error) => console.error('Unable to remove old project state', error));
}

export async function saveProjectImage(image: File) {
  if (!isProjectStorageConfigured()) throw new Error('PROJECT_STORAGE_NOT_CONFIGURED');
  const extension = image.type === 'image/jpeg' ? 'jpg' : image.type.split('/')[1];
  const blob = await put(`portfolio-images/${crypto.randomUUID()}.${extension}`, image, {
    access: 'public', addRandomSuffix: false, contentType: image.type, cacheControlMaxAge: 31536000,
  });
  return blob.url;
}

export async function deleteProjectImage(imageUrl: string) {
  if (!imageUrl.includes('.blob.vercel-storage.com/')) return;
  await del(imageUrl);
}
