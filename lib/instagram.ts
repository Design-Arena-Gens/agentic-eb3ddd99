import { z } from 'zod';

const GRAPH_API_VERSION = 'v21.0';

export const PublishSchema = z.object({
  imageUrl: z.string().url(),
  caption: z.string().max(2200).optional().default(''),
});

function getEnv(name: string, required = true): string | undefined {
  const value = process.env[name];
  if (required && !value) {
    throw new Error(`Missing required env var ${name}`);
  }
  return value;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timeout: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeout = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeout!);
  }
}

export async function createMediaContainer(imageUrl: string, caption: string) {
  const IG_USER_ID = getEnv('IG_USER_ID')!;
  const IG_ACCESS_TOKEN = getEnv('IG_ACCESS_TOKEN')!;

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${IG_USER_ID}/media`;
  const params = new URLSearchParams({ image_url: imageUrl, caption, access_token: IG_ACCESS_TOKEN });

  const res = await fetch(url, { method: 'POST', body: params });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || 'Failed to create media container');
  }
  return data as { id: string };
}

export async function getContainerStatus(creationId: string) {
  const IG_ACCESS_TOKEN = getEnv('IG_ACCESS_TOKEN')!;
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${creationId}?fields=status_code&access_token=${encodeURIComponent(IG_ACCESS_TOKEN)}`;
  const res = await fetch(url, { method: 'GET' });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || 'Failed to get container status');
  }
  return data as { status_code: 'IN_PROGRESS' | 'FINISHED' | 'ERROR' };
}

export async function publishContainer(creationId: string) {
  const IG_USER_ID = getEnv('IG_USER_ID')!;
  const IG_ACCESS_TOKEN = getEnv('IG_ACCESS_TOKEN')!;
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${IG_USER_ID}/media_publish`;
  const params = new URLSearchParams({ creation_id: creationId, access_token: IG_ACCESS_TOKEN });
  const res = await fetch(url, { method: 'POST', body: params });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || 'Failed to publish media');
  }
  return data as { id: string };
}

export async function getPermalink(mediaId: string) {
  const IG_ACCESS_TOKEN = getEnv('IG_ACCESS_TOKEN')!;
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${mediaId}?fields=permalink&access_token=${encodeURIComponent(IG_ACCESS_TOKEN)}`;
  const res = await fetch(url, { method: 'GET' });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || 'Failed to fetch permalink');
  }
  return data as { permalink?: string };
}

export async function publishImageNow(input: { imageUrl: string; caption?: string }) {
  const parsed = PublishSchema.parse(input);
  const timeoutMs = Number(process.env.REQUEST_TIMEOUT_MS || '15000');

  const { id: creationId } = await withTimeout(
    createMediaContainer(parsed.imageUrl, parsed.caption || ''),
    timeoutMs,
    'Create media container'
  );

  // Poll until container is ready
  const maxAttempts = 10;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const status = await withTimeout(getContainerStatus(creationId), timeoutMs, 'Check container status');
    if (status.status_code === 'FINISHED') break;
    if (status.status_code === 'ERROR') {
      throw new Error('Media processing failed on Instagram');
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  const { id: mediaId } = await withTimeout(publishContainer(creationId), timeoutMs, 'Publish media');
  const { permalink } = await withTimeout(getPermalink(mediaId), timeoutMs, 'Get permalink');
  return { mediaId, permalink };
}
