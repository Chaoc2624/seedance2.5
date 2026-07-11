import { md5 } from '@/lib/hash';
import { getStorageService } from '@/services/storage.server';

const IMAGE_MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'image/avif': 'avif',
  'image/heic': 'heic',
  'image/heif': 'heif',
};

const MEDIA_MIME_EXTENSIONS: Record<string, string> = {
  ...IMAGE_MIME_EXTENSIONS,
  'video/mp4': 'mp4',
  'video/mpeg': 'mpeg',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
  'video/x-m4v': 'm4v',
};

export type ImageUploadInput = {
  name: string;
  type: string;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

export type ImageUploadResult = {
  url: string;
  key: string;
  filename: string;
  deduped: boolean;
  provider?: string;
};

function mediaExtFromMime(mimeType: string) {
  return MEDIA_MIME_EXTENSIONS[mimeType] || '';
}

async function uploadFilesToConfiguredStorage({
  files,
  allowedPrefixes,
}: {
  files: ImageUploadInput[];
  allowedPrefixes: string[];
}) {
  if (!files || files.length === 0) throw new Error('No files provided');

  const storageService = await getStorageService();
  const uploadResults: ImageUploadResult[] = [];

  for (const file of files) {
    if (!allowedPrefixes.some((prefix) => file.type.startsWith(prefix))) {
      throw new Error(`File ${file.name} is not a supported media file`);
    }

    const arrayBuffer = await file.arrayBuffer();
    const body = new Uint8Array(arrayBuffer);
    const digest = md5(body);
    const ext =
      mediaExtFromMime(file.type) || file.name.split('.').pop() || 'bin';
    const key = `${digest}.${ext}`;

    const exists = await storageService.exists({ key });
    if (exists) {
      const publicUrl = storageService.getPublicUrl({ key });
      if (publicUrl) {
        uploadResults.push({
          url: publicUrl,
          key,
          filename: file.name,
          deduped: true,
        });
        continue;
      }
    }

    const result = await storageService.uploadFile({
      body,
      key,
      contentType: file.type,
      disposition: 'inline',
    });

    if (!result.success) throw new Error(result.error || 'Upload failed');
    if (!result.url || !result.key) throw new Error('Upload returned no URL');

    uploadResults.push({
      url: result.url,
      key: result.key,
      filename: file.name,
      deduped: false,
      provider: result.provider,
    });
  }

  return {
    urls: uploadResults.map((result) => result.url),
    results: uploadResults,
  };
}

export async function uploadImagesToConfiguredStorage(
  files: ImageUploadInput[]
) {
  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      throw new Error(`File ${file.name} is not an image`);
    }
  }

  return uploadFilesToConfiguredStorage({
    files,
    allowedPrefixes: ['image/'],
  });
}

export async function uploadMediaToConfiguredStorage(
  files: ImageUploadInput[]
) {
  return uploadFilesToConfiguredStorage({
    files,
    allowedPrefixes: ['image/', 'video/'],
  });
}
