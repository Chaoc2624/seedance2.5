import { PricingExperience } from '@/components/blocks/pricing/pricing-experience';
import type { Subscription } from '@/models/subscription.server';
import type { Pricing as PricingType } from '@/types/blocks/pricing';

export function Pricing({
  section,
  className,
  currentSubscription,
  remainingCredits,
}: {
  section: PricingType;
  className?: string;
  currentSubscription?: Subscription | null;
  remainingCredits?: number;
}) {
  return (
    <PricingExperience
      className={className}
      currentSubscription={currentSubscription}
      remainingCredits={remainingCredits}
      section={section}
    />
  );
}
