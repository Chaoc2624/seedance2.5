import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import { useEffect, useState } from 'react';

import { Link, usePathname } from '@/core/i18n/navigation';

import { SmartIcon } from '@/components/blocks/common/smart-icon';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { NavItem, type Nav as NavType } from '@/types/blocks/common';

export function Nav({ nav, className }: { nav: NavType; className?: string }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <SidebarGroup className={className}>
      <SidebarGroupContent className="mt-0 flex flex-col gap-2">
        {nav.title && <SidebarGroupLabel>{nav.title}</SidebarGroupLabel>}
        <SidebarMenu>
          {nav.items.map((item: NavItem | undefined) => (
            <Collapsible
              key={item?.url || item?.title || ''}
              asChild
              defaultOpen={item?.is_expand || false}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                {item?.children ? (
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item?.title}
                      className={`${
                        item?.is_active ||
                        (mounted &&
                          item?.url &&
                          pathname.startsWith(item?.url as string))
                          ? 'min-w-8 bg-sidebar-accent text-sidebar-accent-foreground duration-200 ease-linear hover:bg-sidebar-accent/90 hover:text-sidebar-accent-foreground active:bg-sidebar-accent/90 active:text-sidebar-accent-foreground'
                          : ''
                      }`}
                    >
                      {item?.icon && <SmartIcon name={item.icon as string} />}
                      <span>{item?.title || ''}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                ) : (
                  <SidebarMenuButton
                    asChild
                    tooltip={item?.title}
                    className={`${
                      item?.is_active ||
                      (mounted &&
                        item?.url &&
                        pathname.startsWith(item?.url as string))
                        ? 'min-w-8 bg-sidebar-accent text-sidebar-accent-foreground duration-200 ease-linear hover:bg-sidebar-accent/90 hover:text-sidebar-accent-foreground active:bg-sidebar-accent/90 active:text-sidebar-accent-foreground'
                        : ''
                    }`}
                  >
                    <Link
                      href={item?.url as string}
                      target={item?.target as string}
                    >
                      {item?.icon && <SmartIcon name={item.icon as string} />}
                      <span>{item?.title || ''}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
                {item?.children && (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.children?.map((subItem: NavItem) => (
                        <SidebarMenuSubItem key={subItem.url || subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            className={`${
                              subItem.is_active ||
                              (mounted &&
                                pathname.endsWith(subItem.url as string))
                                ? 'min-w-8 bg-sidebar-accent text-sidebar-accent-foreground duration-200 ease-linear hover:bg-sidebar-accent/90 hover:text-sidebar-accent-foreground active:bg-sidebar-accent/90 active:text-sidebar-accent-foreground'
                                : ''
                            }`}
                          >
                            <Link
                              href={subItem.url as string}
                              target={subItem.target as string}
                            >
                              {/* {subItem.icon && (
                                <SmartIcon name={subItem.icon as string} />
                              )} */}
                              <span className="px-2">{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
