import moment from 'moment';

import { useLocale } from '@/core/i18n/hooks';

import { getMomentLocale } from '@/config/locale';

export function Time({
  value,
  placeholder,
  metadata,
  className,
}: {
  value: string | Date;
  placeholder?: string;
  metadata?: Record<string, any>;
  className?: string;
}) {
  if (!value) {
    if (placeholder) {
      return <div className={className}>{placeholder}</div>;
    }

    return null;
  }

  const locale = getMomentLocale(useLocale());

  return (
    <div className={className}>
      {metadata?.format
        ? moment(value).locale(locale).format(metadata?.format)
        : moment(value).locale(locale).fromNow()}
    </div>
  );
}
