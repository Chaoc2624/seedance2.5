export type HeroReferenceRole =
  | 'first-frame'
  | 'last-frame'
  | 'reference-image'
  | 'reference-video'
  | 'reference-audio';

export type ResolvedHeroReferenceAsset = {
  mediaType: 'image' | 'video' | 'audio';
  referenceRole?: HeroReferenceRole;
  url: string;
};

export function buildSeedanceReferenceSettings(
  assets: ResolvedHeroReferenceAsset[]
) {
  const firstFrame = assets.find(
    (asset) => asset.referenceRole === 'first-frame'
  )?.url;
  const lastFrame = assets.find(
    (asset) => asset.referenceRole === 'last-frame'
  )?.url;
  const referenceImages = assets
    .filter(
      (asset) =>
        asset.referenceRole === 'reference-image' ||
        (!asset.referenceRole && asset.mediaType === 'image')
    )
    .map((asset) => asset.url);
  const referenceVideos = assets
    .filter(
      (asset) =>
        asset.referenceRole === 'reference-video' ||
        (!asset.referenceRole && asset.mediaType === 'video')
    )
    .map((asset) => asset.url);
  const referenceAudio = assets
    .filter(
      (asset) =>
        asset.referenceRole === 'reference-audio' ||
        (!asset.referenceRole && asset.mediaType === 'audio')
    )
    .map((asset) => asset.url);

  if (firstFrame || lastFrame) {
    return {
      ...(firstFrame ? { reference_first_frame: firstFrame } : {}),
      ...(lastFrame ? { reference_last_frame: lastFrame } : {}),
    };
  }

  return {
    ...(referenceImages.length > 0
      ? { reference_images: referenceImages }
      : {}),
    ...(referenceVideos.length > 0
      ? { reference_videos: referenceVideos }
      : {}),
    ...(referenceAudio.length > 0 ? { reference_audio: referenceAudio } : {}),
  };
}
