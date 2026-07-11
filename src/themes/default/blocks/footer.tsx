import { Link } from '@/core/i18n/navigation';

import { modules } from '@/config/preset';

import { BrandLogo } from '@/components/blocks/common/branding/brand-logo';
import { Copyright } from '@/components/blocks/common/branding/copyright';
import { LocaleSelector } from '@/components/blocks/common/locale-selector';
import { SmartIcon } from '@/components/blocks/common/smart-icon';
import { ThemeToggler } from '@/components/blocks/common/theme-toggler';
import { isConfiguredUrl } from '@/lib/configured-links';
import { NavItem } from '@/types/blocks/common';
import { Footer as FooterType } from '@/types/blocks/landing';

const liteAllowedPaths = [
  '/',
  '/blog',
  '/feedback',
  '/privacy-policy',
  '/terms-of-service',
];

function isFooterLinkVisible(url?: string): boolean {
  if (modules.admin) return true; // full mode — show everything
  if (!url) return false;
  if (url.startsWith('/#') || url === '/') return true;
  if (url.startsWith('http')) return true; // external links always visible
  return liteAllowedPaths.some((p) => url === p || url.startsWith(p + '/'));
}

export function Footer({ footer }: { footer: FooterType }) {
  // Filter nav groups and their children based on preset
  const filteredNav = footer.nav?.items
    .map((item) => ({
      ...item,
      children: item.children?.filter((c) => isFooterLinkVisible(c.url)),
    }))
    .filter((item) => item.children && item.children.length > 0);
  const filteredSocial =
    footer.social?.items?.filter((item) => isConfiguredUrl(item.url)) ?? [];

  // Placeholder social/contact links stay hidden until the project configures them.
  const showSocial =
    (footer as any).show_social !== false && filteredSocial.length > 0;
  const showAgreement =
    modules.legal && (footer as any).show_agreement !== false;

  return (
    <footer
      id={footer.id}
      className={`py-8 sm:py-8 ${footer.className || ''} overflow-x-hidden`}
    >
      <div className="container space-y-8 overflow-x-hidden">
        <div className="grid min-w-0 gap-12 md:grid-cols-5">
          <div className="min-w-0 space-y-4 break-words md:col-span-2 md:space-y-6">
            {footer.brand ? <BrandLogo brand={footer.brand} /> : null}

            {footer.brand?.description ? (
              <p
                className="text-sm text-balance break-words text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: footer.brand.description }}
              />
            ) : null}
          </div>

          <div className="col-span-3 grid min-w-0 gap-6 sm:grid-cols-3">
            {filteredNav?.map((item, idx) => (
              <div key={idx} className="min-w-0 space-y-4 text-sm break-words">
                <span className="block font-medium break-words">
                  {item.title}
                </span>

                <div className="flex min-w-0 flex-wrap gap-4 sm:flex-col">
                  {item.children?.map((subItem, iidx) => (
                    <Link
                      key={iidx}
                      href={subItem.url || ''}
                      target={subItem.target || ''}
                      className="block break-words text-muted-foreground duration-150 hover:text-primary"
                    >
                      <span className="break-words">{subItem.title || ''}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-4 sm:gap-8">
          <div className="min-w-0 flex-1" />
          {footer.show_theme !== false ? <ThemeToggler /> : null}
          {footer.show_locale !== false ? (
            <LocaleSelector type="button" />
          ) : null}
        </div>

        <div
          aria-hidden
          className="h-px min-w-0 [background-image:linear-gradient(90deg,var(--color-foreground)_1px,transparent_1px)] bg-[length:6px_1px] bg-repeat-x opacity-25"
        />
        <div className="flex min-w-0 flex-wrap justify-between gap-8">
          {footer.copyright ? (
            <p
              className="text-sm text-balance break-words text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: footer.copyright }}
            />
          ) : footer.brand ? (
            <Copyright brand={footer.brand} />
          ) : null}

          <div className="min-w-0 flex-1"></div>

          {showAgreement && footer.agreement ? (
            <div className="flex min-w-0 flex-wrap items-center gap-4">
              {footer.agreement?.items.map((item: NavItem, index: number) => (
                <Link
                  key={index}
                  href={item.url || ''}
                  target={item.target || ''}
                  className="block text-xs break-words text-muted-foreground underline duration-150 hover:text-primary"
                >
                  {item.title || ''}
                </Link>
              ))}
            </div>
          ) : null}

          {showSocial && footer.social ? (
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              {filteredSocial.map((item: NavItem, index) => (
                <Link
                  key={index}
                  href={item.url || ''}
                  target={item.target || ''}
                  className="block cursor-pointer rounded-full bg-background p-2 text-muted-foreground duration-150 hover:text-primary"
                  aria-label={item.title || 'Social media link'}
                >
                  {item.icon && (
                    <SmartIcon name={item.icon as string} size={20} />
                  )}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
