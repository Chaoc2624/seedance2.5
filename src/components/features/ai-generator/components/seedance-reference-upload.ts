import type {
  SeedanceReferenceItem,
  SeedanceReferenceKind,
} from './seedance-reference-media';

export type SeedanceUploadTarget =
  | 'firstFrame'
  | 'lastFrame'
  | 'images'
  | 'videos'
  | 'audio';

export const TARGET_META: Record<
  SeedanceUploadTarget,
  { kind: SeedanceReferenceKind; label: string }
> = {
  firstFrame: { kind: 'image', label: 'First frame' },
  lastFrame: { kind: 'image', label: 'Last frame' },
  images: { kind: 'image', label: 'Reference images' },
  videos: { kind: 'video', label: 'Reference videos' },
  audio: { kind: 'audio', label: 'Reference audio' },
};

export const ACCEPT_BY_KIND: Record<SeedanceReferenceKind, string> = {
  image: '.jpeg,.jpg,.png,.webp,.bmp,.tiff,.tif,.gif',
  video: '.mp4,.mov',
  audio: '.wav,.mp3',
};

export function getSeedanceFileKind(file: File): SeedanceReferenceKind | null {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (
    extension &&
    ['jpeg', 'jpg', 'png', 'webp', 'bmp', 'tiff', 'tif', 'gif'].includes(
      extension
    )
  )
    return 'image';
  if (extension && ['mp4', 'mov'].includes(extension)) return 'video';
  if (extension && ['wav', 'mp3'].includes(extension)) return 'audio';
  return null;
}

export function getSeedanceMediaDuration(file: File, kind: 'video' | 'audio') {
  return new Promise<number>((resolve, reject) => {
    const element = document.createElement(kind);
    const preview = URL.createObjectURL(file);
    const cleanUp = () => {
      URL.revokeObjectURL(preview);
      element.removeAttribute('src');
      element.load();
    };
    const fail = () => {
      cleanUp();
      reject(new Error(`Could not read ${kind} duration`));
    };
    const timeout = window.setTimeout(fail, 10_000);
    element.onloadedmetadata = () => {
      window.clearTimeout(timeout);
      const duration = element.duration;
      cleanUp();
      if (Number.isFinite(duration)) {
        resolve(duration);
      } else {
        reject(new Error('Invalid media duration'));
      }
    };
    element.onerror = () => {
      window.clearTimeout(timeout);
      fail();
    };
    element.src = preview;
  });
}

export function getSeedanceImageDimensions(file: File) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();
    const preview = URL.createObjectURL(file);
    const cleanUp = () => {
      URL.revokeObjectURL(preview);
      image.removeAttribute('src');
    };
    const timeout = window.setTimeout(() => {
      cleanUp();
      reject(new Error('Could not read image dimensions'));
    }, 10_000);
    image.onload = () => {
      window.clearTimeout(timeout);
      const dimensions = {
        width: image.naturalWidth,
        height: image.naturalHeight,
      };
      cleanUp();
      resolve(dimensions);
    };
    image.onerror = () => {
      window.clearTimeout(timeout);
      cleanUp();
      reject(new Error('Could not read image dimensions'));
    };
    image.src = preview;
  });
}

export function getSeedanceVideoMetadata(file: File) {
  return new Promise<{ duration: number; width: number; height: number }>(
    (resolve, reject) => {
      const video = document.createElement('video');
      const preview = URL.createObjectURL(file);
      const cleanUp = () => {
        URL.revokeObjectURL(preview);
        video.removeAttribute('src');
        video.load();
      };
      const timeout = window.setTimeout(() => {
        cleanUp();
        reject(new Error('Could not read video metadata'));
      }, 10_000);
      video.onloadedmetadata = () => {
        window.clearTimeout(timeout);
        const metadata = {
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
        };
        cleanUp();
        if (
          Number.isFinite(metadata.duration) &&
          metadata.width > 0 &&
          metadata.height > 0
        ) {
          resolve(metadata);
        } else {
          reject(new Error('Invalid video metadata'));
        }
      };
      video.onerror = () => {
        window.clearTimeout(timeout);
        cleanUp();
        reject(new Error('Could not read video metadata'));
      };
      video.src = preview;
    }
  );
}

export function getSeedanceVideoFirstFrame(file: File) {
  return new Promise<string>((resolve, reject) => {
    const video = document.createElement('video');
    const source = URL.createObjectURL(file);
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';

    const cleanUp = () => {
      URL.revokeObjectURL(source);
      video.removeAttribute('src');
      video.load();
    };
    const fail = () => {
      cleanUp();
      reject(new Error('Could not create video preview'));
    };
    const timeout = window.setTimeout(fail, 10_000);

    video.onloadeddata = () => {
      window.clearTimeout(timeout);
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        fail();
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (!context) {
        fail();
        return;
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          cleanUp();
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            reject(new Error('Could not create video preview'));
          }
        },
        'image/jpeg',
        0.9
      );
    };
    video.onerror = () => {
      window.clearTimeout(timeout);
      fail();
    };
    video.src = source;
  });
}

export function createSeedanceReferenceItem(
  file: File,
  kind: SeedanceReferenceKind,
  duration?: number
): SeedanceReferenceItem {
  return {
    id: `${file.name}-${file.lastModified}-${Math.random()}`,
    kind,
    name: file.name,
    preview: URL.createObjectURL(file),
    size: file.size,
    duration,
    status: 'uploading',
  };
}
