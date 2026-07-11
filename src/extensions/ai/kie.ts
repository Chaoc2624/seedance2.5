import { getUuid } from '@/lib/hash';

import { saveFiles } from '.';
import {
  AIConfigs,
  AIFile,
  AIGenerateParams,
  AIImage,
  AIMediaType,
  AIProvider,
  AISong,
  AITaskResult,
  AITaskStatus,
  AIVideo,
} from './types';

/**
 * Kie configs
 * @docs https://kie.ai/
 */
export interface KieConfigs extends AIConfigs {
  apiKey: string;
  customStorage?: boolean; // use custom storage to save files
}

const KIE_GPT_IMAGE_2_TEXT_MODEL = 'gpt-image-2-text-to-image';
const KIE_GPT_IMAGE_2_IMAGE_MODEL = 'gpt-image-2-image-to-image';
const KIE_GPT_IMAGE_15_TEXT_MODEL = 'gpt-image/1.5-text-to-image';
const KIE_GPT_IMAGE_15_IMAGE_MODEL = 'gpt-image/1.5-image-to-image';

const KIE_DOCUMENTED_IMAGE_MODELS = new Set<string>([
  KIE_GPT_IMAGE_2_TEXT_MODEL,
  KIE_GPT_IMAGE_2_IMAGE_MODEL,
  KIE_GPT_IMAGE_15_TEXT_MODEL,
  KIE_GPT_IMAGE_15_IMAGE_MODEL,
]);

const KIE_DOCUMENTED_IMAGE_TO_IMAGE_MODELS = new Set<string>([
  KIE_GPT_IMAGE_2_IMAGE_MODEL,
  KIE_GPT_IMAGE_15_IMAGE_MODEL,
]);

const KIE_GPT_IMAGE_15_MODELS = new Set<string>([
  KIE_GPT_IMAGE_15_TEXT_MODEL,
  KIE_GPT_IMAGE_15_IMAGE_MODEL,
]);

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

function firstString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (Array.isArray(value)) {
    return value.find(
      (item): item is string => typeof item === 'string' && Boolean(item.trim())
    );
  }

  return undefined;
}

function copyPublicOptions(
  input: Record<string, unknown>,
  options?: Record<string, unknown>
) {
  if (!options) {
    return;
  }

  for (const [key, value] of Object.entries(options)) {
    if (
      key.startsWith('_') ||
      value === undefined ||
      value === null ||
      value === '' ||
      key === 'image_input' ||
      key === 'video_input'
    ) {
      continue;
    }

    input[key] = value;
  }
}

/**
 * Kie provider
 * @docs https://kie.ai/
 */
export class KieProvider implements AIProvider {
  // provider name
  readonly name = 'kie';
  // provider configs
  configs: KieConfigs;

  // api base url
  private baseUrl = 'https://api.kie.ai/api/v1';

  // init provider
  constructor(configs: KieConfigs) {
    this.configs = configs;
  }

  async generateMusic({
    params,
  }: {
    params: AIGenerateParams;
  }): Promise<AITaskResult> {
    const apiUrl = `${this.baseUrl}/generate`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.configs.apiKey}`,
    };

    // todo: check model
    if (!params.model) {
      params.model = 'V5';
    }

    // build request params
    let payload: any = {
      prompt: params.prompt,
      model: params.model,
      callBackUrl: params.callbackUrl,
    };

    if (params.options && params.options.customMode) {
      // custom mode
      payload.customMode = true;
      payload.title = params.options.title;
      payload.style = params.options.style;
      payload.instrumental = params.options.instrumental;
      if (!params.options.instrumental) {
        // not instrumental, lyrics is used as prompt
        payload.prompt = params.options.lyrics;
      }
    } else {
      // not custom mode
      payload.customMode = false;
      payload.prompt = params.prompt;
      payload.instrumental = params.options?.instrumental;
    }

    // const params = {
    //   customMode: false,
    //   instrumental: false,
    //   style: "",
    //   title: "",
    //   prompt: prompt || "",
    //   model: model || "V4_5",
    //   callBackUrl,
    //   negativeTags: "",
    //   vocalGender: "m", // m or f
    //   styleWeight: 0.65,
    //   weirdnessConstraint: 0.65,
    //   audioWeight: 0.65,
    // };

    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      throw new Error(`request failed with status: ${resp.status}`);
    }

    const { code, msg, data } = await resp.json();

    if (code !== 200) {
      throw new Error(`generate music failed: ${msg}`);
    }

    if (!data || !data.taskId) {
      throw new Error(`generate music failed: no taskId`);
    }

    return {
      taskStatus: AITaskStatus.PENDING,
      taskId: data.taskId,
      taskInfo: {},
      taskResult: data,
    };
  }

  async generateImage({
    params,
  }: {
    params: AIGenerateParams;
  }): Promise<AITaskResult> {
    const apiUrl = `${this.baseUrl}/jobs/createTask`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.configs.apiKey}`,
    };

    if (!params.model) {
      throw new Error('model is required');
    }

    if (!params.prompt) {
      throw new Error('prompt is required');
    }

    // build request params
    let payload: any = {
      model: params.model,
      callBackUrl: params.callbackUrl,
      input: this.formatImageInput({
        model: params.model,
        prompt: params.prompt,
        options: params.options,
      }),
    };

    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      throw new Error(`request failed with status: ${resp.status}`);
    }

    const { code, msg, data } = await resp.json();

    if (code !== 200) {
      throw new Error(`generate image failed: ${msg}`);
    }

    if (!data || !data.taskId) {
      throw new Error(`generate image failed: no taskId`);
    }

    return {
      taskStatus: AITaskStatus.PENDING,
      taskId: data.taskId,
      taskInfo: {},
      taskResult: data,
    };
  }

  async generateVideo({
    params,
  }: {
    params: AIGenerateParams;
  }): Promise<AITaskResult> {
    const apiUrl = `${this.baseUrl}/jobs/createTask`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.configs.apiKey}`,
    };

    if (!params.model) {
      throw new Error('model is required');
    }

    // build request params
    const payload: any = {
      model: params.model,
      callBackUrl: params.callbackUrl,
      input: this.formatVideoInput({
        model: params.model,
        prompt: params.prompt,
        options: params.options,
      }),
    };

    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      throw new Error(`request failed with status: ${resp.status}`);
    }

    const { code, msg, data } = await resp.json();

    if (code !== 200) {
      throw new Error(`generate video failed: ${msg}`);
    }

    if (!data || !data.taskId) {
      throw new Error(`generate video failed: no taskId`);
    }

    return {
      taskStatus: AITaskStatus.PENDING,
      taskId: data.taskId,
      taskInfo: {},
      taskResult: data,
    };
  }

  // generate task
  async generate({
    params,
  }: {
    params: AIGenerateParams;
  }): Promise<AITaskResult> {
    if (
      ![AIMediaType.MUSIC, AIMediaType.IMAGE, AIMediaType.VIDEO].includes(
        params.mediaType
      )
    ) {
      throw new Error(`mediaType not supported: ${params.mediaType}`);
    }

    if (params.mediaType === AIMediaType.MUSIC) {
      return this.generateMusic({ params });
    } else if (params.mediaType === AIMediaType.IMAGE) {
      return this.generateImage({ params });
    } else if (params.mediaType === AIMediaType.VIDEO) {
      return this.generateVideo({ params });
    }

    throw new Error(`mediaType not supported: ${params.mediaType}`);
  }

  private formatImageInput({
    model,
    prompt,
    options,
  }: {
    model: string;
    prompt: string;
    options?: Record<string, unknown>;
  }): Record<string, unknown> {
    const input: Record<string, unknown> = {
      prompt,
    };

    if (!options) {
      return input;
    }

    copyPublicOptions(input, options);

    if (KIE_DOCUMENTED_IMAGE_MODELS.has(model)) {
      if (typeof options.aspect_ratio === 'string') {
        input.aspect_ratio = options.aspect_ratio;
      }

      if (
        (model === KIE_GPT_IMAGE_2_TEXT_MODEL ||
          model === KIE_GPT_IMAGE_2_IMAGE_MODEL) &&
        typeof options.resolution === 'string'
      ) {
        input.resolution = options.resolution;
      }

      if (KIE_DOCUMENTED_IMAGE_TO_IMAGE_MODELS.has(model)) {
        const inputUrls = toStringArray(options.image_input);
        if (inputUrls.length > 0) {
          input.input_urls = inputUrls;
        }
      }

      if (
        KIE_GPT_IMAGE_15_MODELS.has(model) &&
        typeof options.quality === 'string'
      ) {
        input.quality = options.quality;
      }

      return input;
    }

    this.applyImageInputs({ input, model, options });

    return input;
  }

  private applyImageInputs({
    input,
    model,
    options,
  }: {
    input: Record<string, unknown>;
    model: string;
    options: Record<string, unknown>;
  }) {
    const imageUrls = toStringArray(options.image_input);
    if (imageUrls.length === 0) {
      return;
    }

    if (
      model.includes('seedream') ||
      model.includes('nano-banana-edit') ||
      model.includes('grok-imagine/image-to-image')
    ) {
      input.image_urls = imageUrls;
      return;
    }

    if (
      model.includes('image-to-image') ||
      model.includes('flux-2') ||
      model.includes('gpt-image')
    ) {
      input.input_urls = imageUrls;
      return;
    }

    if (
      model.includes('qwen') ||
      model.includes('ideogram') ||
      model.includes('topaz')
    ) {
      input.image_url = imageUrls[0];
      if (model.includes('ideogram/character')) {
        input.reference_image_urls = imageUrls;
      }
      return;
    }

    if (model.includes('wan/2-7-image')) {
      input.input_urls = imageUrls;
      return;
    }

    input.image_input = imageUrls;
  }

  private formatVideoInput({
    model,
    prompt,
    options,
  }: {
    model: string;
    prompt: string;
    options?: Record<string, unknown>;
  }): Record<string, unknown> {
    const input: Record<string, unknown> = {};

    if (prompt) {
      input.prompt = prompt;
    }

    copyPublicOptions(input, options);

    if (!options) {
      return input;
    }

    this.applyVideoInputs({ input, model, options });

    return input;
  }

  private applyVideoInputs({
    input,
    model,
    options,
  }: {
    input: Record<string, unknown>;
    model: string;
    options: Record<string, unknown>;
  }) {
    const imageUrls = toStringArray(options.image_input);
    const videoUrls = toStringArray(options.video_input);

    if (
      imageUrls.length > 0 &&
      !this.hasAnyKey(input, [
        'image_url',
        'image_urls',
        'input_urls',
        'first_frame_url',
        'reference_image_urls',
      ])
    ) {
      if (model === 'wan/2-7-image-to-video') {
        input.first_frame_url = imageUrls[0];
        if (imageUrls[1]) {
          input.last_frame_url = imageUrls[1];
        }
      } else if (model.includes('seedance-2')) {
        input.first_frame_url = imageUrls[0];
        if (imageUrls[1]) {
          input.last_frame_url = imageUrls[1];
        }
      } else if (model.includes('kling-2.6') || model.includes('kling-3.0')) {
        input.image_urls = imageUrls;
      } else if (
        model.includes('wan/2-6') ||
        model.includes('happyhorse') ||
        model.includes('grok-imagine')
      ) {
        input.image_urls = imageUrls;
      } else {
        input.image_url = imageUrls[0];
      }
    }

    if (
      videoUrls.length > 0 &&
      !this.hasAnyKey(input, [
        'video_url',
        'video_urls',
        'first_clip_url',
        'reference_video_urls',
      ])
    ) {
      if (model === 'wan/2-7-image-to-video') {
        input.first_clip_url = videoUrls[0];
      } else if (model.includes('seedance-2')) {
        input.reference_video_urls = videoUrls;
      } else if (model.includes('wan/2-6') || model.includes('happyhorse')) {
        input.video_urls = videoUrls;
      } else {
        input.video_url = videoUrls[0];
      }
    }

    const aspectRatio = firstString(options.aspect_ratio);
    if (aspectRatio && model === 'wan/2-7-text-to-video') {
      delete input.aspect_ratio;
      input.ratio = aspectRatio;
    }

    if (typeof input.n_frames === 'string' && !input.duration) {
      input.duration = input.n_frames;
      delete input.n_frames;
    }
  }

  private hasAnyKey(input: Record<string, unknown>, keys: string[]) {
    return keys.some((key) => input[key] !== undefined);
  }

  async queryImage({ taskId }: { taskId: string }): Promise<AITaskResult> {
    const apiUrl = `${this.baseUrl}/jobs/recordInfo?taskId=${taskId}`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.configs.apiKey}`,
    };

    const resp = await fetch(apiUrl, {
      method: 'GET',
      headers,
    });
    if (!resp.ok) {
      throw new Error(`request failed with status: ${resp.status}`);
    }

    const { code, msg, data } = await resp.json();

    if (code !== 200) {
      throw new Error(msg);
    }

    if (!data || !data.state) {
      throw new Error(`query failed`);
    }

    let images: AIImage[] | undefined = undefined;

    if (data.resultJson) {
      const resultJson = JSON.parse(data.resultJson);
      const resultUrls = resultJson.resultUrls;
      if (Array.isArray(resultUrls)) {
        images = resultUrls.map((image: any) => ({
          id: '',
          createTime: new Date(data.createTime),
          imageUrl: image,
        }));
      }
    }

    const taskStatus = this.mapImageStatus(data.state);

    // use custom storage to save images
    if (
      taskStatus === AITaskStatus.SUCCESS &&
      images &&
      images.length > 0 &&
      this.configs.customStorage
    ) {
      const filesToSave: AIFile[] = [];
      images.forEach((image, index) => {
        if (image.imageUrl) {
          filesToSave.push({
            url: image.imageUrl,
            contentType: 'image/png',
            key: `kie/image/${getUuid()}.png`,
            index: index,
            type: 'image',
          });
        }
      });

      if (filesToSave.length > 0) {
        const uploadedFiles = await saveFiles(filesToSave);
        if (uploadedFiles) {
          uploadedFiles.forEach((file: AIFile) => {
            if (file && file.url && images && file.index !== undefined) {
              const image = images[file.index];
              if (image) {
                image.imageUrl = file.url;
              }
            }
          });
        }
      }
    }

    return {
      taskId,
      taskStatus,
      taskInfo: {
        images,
        status: data.state,
        errorCode: data.failCode,
        errorMessage: data.failMsg,
        createTime: new Date(data.createTime),
      },
      taskResult: data,
    };
  }

  async queryVideo({ taskId }: { taskId: string }): Promise<AITaskResult> {
    const apiUrl = `${this.baseUrl}/jobs/recordInfo?taskId=${taskId}`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.configs.apiKey}`,
    };

    const resp = await fetch(apiUrl, {
      method: 'GET',
      headers,
    });
    if (!resp.ok) {
      throw new Error(`request failed with status: ${resp.status}`);
    }

    const { code, msg, data } = await resp.json();

    if (code !== 200) {
      throw new Error(msg);
    }

    if (!data || !data.state) {
      throw new Error(`query failed`);
    }

    let videos: AIVideo[] | undefined = undefined;

    if (data.resultJson) {
      const resultJson = JSON.parse(data.resultJson);
      const resultUrls = resultJson.resultUrls;
      if (Array.isArray(resultUrls)) {
        videos = resultUrls.map((video: any) => ({
          id: '',
          createTime: new Date(data.createTime),
          videoUrl: video,
        }));
      }
    }

    const taskStatus = this.mapImageStatus(data.state);

    // use custom storage to save videos
    if (
      taskStatus === AITaskStatus.SUCCESS &&
      videos &&
      videos.length > 0 &&
      this.configs.customStorage
    ) {
      const filesToSave: AIFile[] = [];
      videos.forEach((video, index) => {
        if (video.videoUrl) {
          filesToSave.push({
            url: video.videoUrl,
            contentType: 'video/mp4',
            key: `kie/video/${getUuid()}.mp4`,
            index: index,
            type: 'video',
          });
        }
      });

      if (filesToSave.length > 0) {
        const uploadedFiles = await saveFiles(filesToSave);
        if (uploadedFiles) {
          uploadedFiles.forEach((file: AIFile) => {
            if (file && file.url && videos && file.index !== undefined) {
              const video = videos[file.index];
              if (video) {
                video.videoUrl = file.url;
              }
            }
          });
        }
      }
    }

    return {
      taskId,
      taskStatus,
      taskInfo: {
        videos,
        status: data.state,
        errorCode: data.failCode,
        errorMessage: data.failMsg,
        createTime: new Date(data.createTime),
      },
      taskResult: data,
    };
  }

  // query task
  async query({
    taskId,
    mediaType,
  }: {
    taskId: string;
    mediaType?: AIMediaType;
  }): Promise<AITaskResult> {
    if (mediaType === AIMediaType.IMAGE) {
      return this.queryImage({ taskId });
    }

    if (mediaType === AIMediaType.VIDEO) {
      return this.queryVideo({ taskId });
    }

    const apiUrl = `${this.baseUrl}/generate/record-info?taskId=${taskId}`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.configs.apiKey}`,
    };

    const resp = await fetch(apiUrl, {
      method: 'GET',
      headers,
    });
    if (!resp.ok) {
      throw new Error(`request failed with status: ${resp.status}`);
    }

    const { code, msg, data } = await resp.json();

    if (code !== 200) {
      throw new Error(msg);
    }

    if (!data || !data.status) {
      throw new Error(`query failed`);
    }

    const songs: AISong[] = data?.response?.sunoData?.map((song: any) => ({
      id: song.id,
      createTime: new Date(song.createTime),
      audioUrl: song.audioUrl,
      imageUrl: song.imageUrl,
      duration: song.duration,
      prompt: song.prompt,
      title: song.title,
      tags: song.tags,
      style: song.style,
      model: song.modelName,
      artist: song.artist,
      album: song.album,
    }));

    const taskStatus = this.mapStatus(data.status);

    // save files if custom storage is enabled
    if (
      taskStatus === AITaskStatus.SUCCESS &&
      songs &&
      songs.length > 0 &&
      this.configs.customStorage
    ) {
      const audioFilesToSave: AIFile[] = [];
      const imageFilesToSave: AIFile[] = [];

      songs.forEach((song, index) => {
        if (song.audioUrl) {
          audioFilesToSave.push({
            url: song.audioUrl,
            contentType: 'audio/mpeg',
            key: `kie/audio/${getUuid()}.mp3`,
            index: index,
            type: 'audio',
          });
        }
        if (song.imageUrl) {
          imageFilesToSave.push({
            url: song.imageUrl,
            contentType: 'image/png',
            key: `kie/image/${getUuid()}.png`,
            index: index,
            type: 'image',
          });
        }
      });

      if (audioFilesToSave.length > 0) {
        const uploadedFiles = await saveFiles(audioFilesToSave);
        if (uploadedFiles) {
          uploadedFiles.forEach((file: AIFile) => {
            if (file && file.url && songs && file.index !== undefined) {
              const song = songs[file.index];
              song.audioUrl = file.url;
            }
          });
        }
      }

      if (imageFilesToSave.length > 0) {
        const uploadedFiles = await saveFiles(imageFilesToSave);
        if (uploadedFiles) {
          uploadedFiles.forEach((file: AIFile) => {
            if (file && file.url && songs && file.index !== undefined) {
              const song = songs[file.index];
              song.imageUrl = file.url;
            }
          });
        }
      }
    }

    return {
      taskId,
      taskStatus,
      taskInfo: {
        songs,
        status: data.status,
        errorCode: data.errorCode,
        errorMessage: data.errorMessage,
        createTime: new Date(data.createTime),
      },
      taskResult: data,
    };
  }

  // map image task status
  private mapImageStatus(status: string): AITaskStatus {
    switch (status) {
      case 'waiting':
        return AITaskStatus.PENDING;
      case 'queuing':
        return AITaskStatus.PENDING;
      case 'generating':
        return AITaskStatus.PROCESSING;
      case 'success':
        return AITaskStatus.SUCCESS;
      case 'fail':
        return AITaskStatus.FAILED;
      default:
        throw new Error(`unknown status: ${status}`);
    }
  }

  // map music task status
  private mapStatus(status: string): AITaskStatus {
    switch (status) {
      case 'PENDING':
        return AITaskStatus.PENDING;
      case 'TEXT_SUCCESS':
        return AITaskStatus.PROCESSING;
      case 'FIRST_SUCCESS':
        return AITaskStatus.PROCESSING;
      case 'SUCCESS':
        return AITaskStatus.SUCCESS;
      case 'CREATE_TASK_FAILED':
      case 'GENERATE_AUDIO_FAILED':
      case 'CALLBACK_EXCEPTION':
      case 'SENSITIVE_WORD_ERROR':
        return AITaskStatus.FAILED;
      default:
        throw new Error(`unknown status: ${status}`);
    }
  }
}
