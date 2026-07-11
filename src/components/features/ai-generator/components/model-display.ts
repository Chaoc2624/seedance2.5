export function formatPublicModelMeta({
  credits,
}: {
  credits: number;
  provider?: string;
}) {
  return `${credits} credits`;
}
