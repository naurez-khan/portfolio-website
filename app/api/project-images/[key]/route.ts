import { getBindings } from '@/lib/projects';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  try {
    const { key } = await params;
    if (!/^[a-f0-9-]+\.(jpg|png|webp|gif)$/.test(key)) {
      return new Response('Not found', { status: 404 });
    }

    const { bucket } = getBindings();
    const object = await bucket.get(key);
    if (!object) return new Response('Not found', { status: 404 });

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('cache-control', 'public, max-age=31536000, immutable');
    return new Response(object.body, { headers });
  } catch (error) {
    console.error('Unable to load project image', error);
    return new Response('Image unavailable', { status: 503 });
  }
}
