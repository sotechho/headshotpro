import axios from 'axios';
export * from './headshot.helper';
export * from './rate-limit.util';

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function getFileExtension(url: string, contentType?: string) {
  if (contentType?.includes('jpeg') || contentType?.includes('jpg')) {
    return 'jpg';
  }
  if (contentType?.includes('webp')) {
    return 'webp';
  }
  if (contentType?.includes('png')) {
    return 'png';
  }

  const pathname = url.split('?')[0] ?? url;
  const ext = pathname.split('.').pop()?.toLowerCase();
  if (ext && ['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
    return ext === 'jpeg' ? 'jpg' : ext;
  }

  return 'png';
}

export async function downloadFile(
  url: string,
): Promise<{ fileBuffer: Buffer<ArrayBuffer>; response: any }> {
  const response = await axios.get<ArrayBuffer>(url, {
    responseType: 'arraybuffer',
  });
  const fileBuffer = Buffer.from(response.data);
  return { fileBuffer, response };
}
