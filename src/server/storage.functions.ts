import { createServerFn } from '@tanstack/react-start';

import {
  uploadImagesToConfiguredStorage,
  uploadMediaToConfiguredStorage,
} from '@/services/image-upload.server';

export const uploadImageFn = createServerFn({ method: 'POST' })
  .inputValidator((data: FormData) => data)
  .handler(async ({ data: formData }) => {
    const files = formData.getAll('files') as File[];
    return uploadImagesToConfiguredStorage(files);
  });

export const uploadMediaFn = createServerFn({ method: 'POST' })
  .inputValidator((data: FormData) => data)
  .handler(async ({ data: formData }) => {
    const files = formData.getAll('files') as File[];
    return uploadMediaToConfiguredStorage(files);
  });
