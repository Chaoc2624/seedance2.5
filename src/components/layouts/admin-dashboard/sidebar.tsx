import ChevronsUpDown from 'lucide-react/dist/esm/icons/chevrons-up-down';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import LogOut from 'lucide-react/dist/esm/icons/log-out';
import User from 'lucide-react/dist/esm/icons/user';
import { Fragment, useEffect, useState } from 'react';

import { signOut } from '@/core/auth/client';
import { useTranslations } from '@/core/i18n/hooks';
import { Link, useRouter } from '@/core/i18n/navigation';

import { adminLocaleOptions } from '@/config/locale';

import { LocaleSelector, ThemeToggler } from '@/components/blocks/common';
import { SmartIcon } from '@/components/blocks/common/smart-icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarFooter as SidebarFooterComponent,
  SidebarHeader as SidebarHeaderComponent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAppContext } from '@/hooks/use-app-context';
import { isConfiguredUrl } from '@/lib/configured-links';
import { cn } from '@/lib/utils';
import { NavItem, Button as ButtonType } from '@/types/blocks/common';
import {
  type Sidebar as SidebarType,
  SidebarHeader as SidebarHeaderType,
  SidebarFooter as SidebarFooterType,
  SidebarUser as SidebarUserType,
} from '@/types/blocks/dashboard';

import { Nav } from './nav';
import { SignModal } from './sign-modal';

function getAdminOutgoingLocale(url?: string) {
  if (
    !url ||
    url.startsWith('/shiponce') ||
    url.startsWith('http') ||
    url.startsWith('mailto:') ||
    url.startsWith('tel:') ||
    url.startsWith('#')
  ) {
    return undefined;
  }

  return 'en';
}

// ─── SidebarHeader ───────────────────────────────────────────────

function SidebarHeader({ header }: { header: SidebarHeaderType }) {
  const { open } = useSidebar();
  return (
    <SidebarHeaderComponent className="mb-0">
      <SidebarMenu>
        <SidebarMenuItem className="flex items-center justify-between">
          {(open || !header.show_trigger) && (
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              {header.brand && (
                <Link href={header.brand.url || ''}>
                  {header.brand.logo && (
                    <img
                      src={header.brand.logo.src}
                      alt={header.brand.logo.alt || ''}
                      className="h-auto w-8 shrink-0 rounded-md"
                    />
                  )}
                  <div className="relative text-base font-semibold">
                    {header.brand.title}
                    {header.version && (
                      <Badge
                        variant="secondary"
                        className="absolute -top-0 -right-16 scale-100 px-1 py-0"
                      >
                        v{header.version}
                      </Badge>
                    )}
                  </div>
                </Link>
              )}
            </SidebarMenuButton>
          )}
          <div className="flex-1"></div>
          {header.show_trigger && <SidebarTrigger />}
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeaderComponent>
  );
}

// ─── SidebarButtons ──────────────────────────────────────────────

function SidebarButtons({ buttons }: { buttons: ButtonType[] }) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <div className="flex flex-col gap-2 px-3 py-3">
      {buttons.map((button, idx) => (
        <Button
          key={idx}
          asChild
          variant={button.variant || 'outline'}
          size={button.size || 'default'}
          className={cn(
            isCollapsed
              ? 'h-6 w-6 justify-center p-0 [&_svg]:size-4 [&_svg]:shrink-0'
              : undefined
          )}
        >
          <Link
            href={button.url || ''}
            target={button.target || '_self'}
            aria-label={button.title || undefined}
            title={button.title || undefined}
          >
            {button.icon && (
              <SmartIcon
                name={button.icon as string}
                className="size-4 shrink-0"
              />
            )}
            {button.title && !isCollapsed && (
              <span className="whitespace-nowrap">{button.title}</span>
            )}
          </Link>
        </Button>
      ))}
    </div>
  );
}

// ─── SidebarUser ─────────────────────────────────────────────────

export function SidebarUser({ user }: { user: SidebarUserType }) {
  const t = useTranslations('admin.sidebar.sign');
  const { isMobile, open } = useSidebar();
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push(user.signout_callback || '/sign-in', { locale: 'en' });
  };

  const { setIsShowSignModal, isCheckSign, user: authUser } = useAppContext();

  if (!hasMounted) {
    return (
      <div className="flex h-full items-center justify-center px-4 py-4">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (authUser) {
    return (
      <SidebarMenu className="gap-4 px-3">
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={authUser.image || ''} alt={authUser.name} />
                  <AvatarFallback className="rounded-lg">
                    {authUser.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {authUser.name}
                  </span>
                  {user.show_email && (
                    <span className="truncate text-xs">{authUser.email}</span>
                  )}
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg bg-background"
              side={isMobile ? 'bottom' : 'right'}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={authUser.image || ''}
                      alt={authUser.name}
                    />
                    <AvatarFallback className="rounded-lg">
                      {authUser.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {authUser.name}
                    </span>
                    {user.show_email && (
                      <span className="truncate text-xs">{authUser.email}</span>
                    )}
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {user.nav?.items.map((item: NavItem | undefined) => (
                  <Fragment key={item?.title || item?.url}>
                    <DropdownMenuItem className="cursor-pointer">
                      <Link
                        href={item?.url || ''}
                        target={item?.target}
                        locale={getAdminOutgoingLocale(item?.url)}
                        className="flex w-full items-center gap-2"
                      >
                        {item?.icon && <SmartIcon name={item.icon as string} />}
                        {item?.title || ''}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </Fragment>
                ))}
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={handleSignOut}
                >
                  <LogOut />
                  {t('sign_out_title')}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <>
      {open ? (
        <div className="flex h-full items-center justify-center px-4 py-4">
          {isCheckSign ? (
            <div className="flex w-full items-center justify-center">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <Button className="w-full" onClick={() => setIsShowSignModal(true)}>
              <User className="mr-1 h-4 w-4" />
              {t('sign_in_title')}
            </Button>
          )}
        </div>
      ) : (
        <SidebarMenu />
      )}
      <SignModal callbackUrl={user.signin_callback || '/'} />
    </>
  );
}

// ─── SidebarFooter ───────────────────────────────────────────────

function SidebarFooter({ footer }: { footer: SidebarFooterType }) {
  const { open } = useSidebar();
  const navItems =
    footer.nav?.items?.filter((item) => isConfiguredUrl(item.url)) ?? [];

  return (
    <>
      {open ? (
        <div className="mx-auto flex w-full items-center justify-start gap-x-4 border-t px-4 py-3">
          {navItems.map((item: NavItem, idx: number) => (
            <div className="cursor-pointer hover:text-primary" key={idx}>
              <Link
                href={item.url || ''}
                target={item.target || '_self'}
                locale={getAdminOutgoingLocale(item.url)}
              >
                {item.icon && (
                  <SmartIcon
                    name={item.icon as string}
                    className="text-md"
                    size={20}
                  />
                )}
              </Link>
            </div>
          ))}
          <div className="flex-1"></div>
          {(footer.show_theme || footer.show_locale) && (
            <Separator orientation="vertical" className="h-4" />
          )}
          {footer.show_theme && <ThemeToggler />}
          {footer.show_locale && (
            <LocaleSelector options={adminLocaleOptions} />
          )}
        </div>
      ) : null}
    </>
  );
}

// ─── Sidebar (main export) ───────────────────────────────────────

export function Sidebar({
  sidebar,
  ...props
}: React.ComponentProps<typeof SidebarComponent> & {
  sidebar: SidebarType;
}) {
  return (
    <SidebarComponent collapsible={sidebar.collapsible || 'icon'} {...props}>
      {sidebar.header && <SidebarHeader header={sidebar.header} />}
      <SidebarContent>
        {sidebar.buttons && <SidebarButtons buttons={sidebar.buttons} />}
        {sidebar.main_navs &&
          sidebar.main_navs.map((nav, idx) => <Nav key={idx} nav={nav} />)}
        {sidebar.library}
        {sidebar.bottom_nav && (
          <Nav nav={sidebar.bottom_nav} className="mt-auto" />
        )}
      </SidebarContent>
      <SidebarFooterComponent>
        {sidebar.user && <SidebarUser user={sidebar.user} />}
        {sidebar.footer && <SidebarFooter footer={sidebar.footer} />}
      </SidebarFooterComponent>
    </SidebarComponent>
  );
}
