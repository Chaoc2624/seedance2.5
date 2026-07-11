import { Link } from '@/core/i18n/navigation';

import AppImage from '@/components/blocks/common/media/app-image';
import { Brand as BrandType } from '@/types/blocks/common';

export function BrandLogo({ brand }: { brand: BrandType }) {
  const logoIncludesWordmark = brand.logo?.src?.includes('lockup');
  const logoAlt = logoIncludesWordmark
    ? brand.logo?.alt || brand.title || ''
    : brand.title
      ? ''
      : brand.logo?.alt || '';

  return (
    <Link
      href={brand.url || ''}
      target={brand.target || '_self'}
      className={`flex items-center space-x-3 ${brand.className}`}
    >
      {brand.logo && (
        <AppImage
          src={brand.logo.src}
          alt={logoAlt}
          width={brand.logo.width || 80}
          height={brand.logo.height || 80}
          className={brand.logo.className || 'h-8 w-auto rounded-lg'}
        />
      )}
      {brand.title && !logoIncludesWordmark && (
        <span className="brand-logo-title text-lg font-medium">
          {brand.title}
        </span>
      )}
    </Link>
  );
}
