import { localeOptions } from '@/config/locale';
import { Link } from '@/core/i18n/navigation';
import type { Footer } from '@/types/blocks/landing';

type LuseePublicFooterProps = {
  footer: Footer;
};

export function LuseePublicFooter({ footer }: LuseePublicFooterProps) {
  const columns =
    footer.nav?.items?.filter((item) => item.children?.length) ?? [];

  return (
    <footer
      className="border-t border-blue-500/10 bg-slate-950 py-10 md:py-12"
      id={footer.id || 'footer'}
    >
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[minmax(13rem,1fr)_minmax(0,2fr)]">
          <Link href="/" className="flex items-start gap-2 text-white">
            <img
              alt=""
              className="size-7 rounded-md object-contain"
              decoding="async"
              loading="lazy"
              src="/logo.svg"
            />
            <span className="font-semibold">
              {footer.brand?.title || 'Seedance 2.5'}
            </span>
          </Link>

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 text-[12px] md:grid-cols-3">
            {columns.map((column) => (
              <div className="space-y-2" key={column.title}>
                <p className="font-semibold text-white">{column.title}</p>
                {column.children?.map((link) =>
                  link.url ? (
                    <Link
                      className="block text-slate-400 transition-colors hover:text-blue-200"
                      href={link.url}
                      key={link.title}
                    >
                      {link.title}
                    </Link>
                  ) : null
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6">
          <p className="mb-3 text-[12px] font-semibold text-white">
            Languages
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-[12px]">
            {localeOptions.map((option) => (
              <Link
                className="inline-flex items-center gap-1.5 text-slate-400 transition-colors hover:text-blue-200"
                href="/"
                key={option.code}
                locale={option.code}
              >
                <span>{option.flag}</span>
                <span>{option.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-12 font-display text-[20vw] leading-none font-black tracking-normal text-white md:text-[10rem]">
          Seedance 2.5
        </div>
        <p className="mt-6 border-t border-white/10 pt-6 text-[11px] text-slate-500">
          {footer.copyright || '2026 All rights reserved.'}
        </p>
      </div>
    </footer>
  );
}
