import { ReactNode, useEffect, useRef, useState } from 'react';

import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from '@/components/ui/sidebar';
import { Sidebar as SidebarType } from '@/types/blocks/dashboard';

import { Sidebar } from './sidebar';

function SidebarResizer({
  width: _width,
  setWidth,
  providerRef,
}: {
  width: number;
  setWidth: (width: number) => void;
  providerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { state, setOpen } = useSidebar();
  const isResizing = useRef(false);
  const isExpandedRef = useRef(state === 'expanded');

  useEffect(() => {
    isExpandedRef.current = state === 'expanded';
  }, [state]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isResizing.current = true;
    // Disable all CSS transitions during drag for instant 1:1 mouse tracking feedback
    const styleEl = document.createElement('style');
    styleEl.id = 'sidebar-drag-transition-override';
    styleEl.innerHTML =
      '[data-slot="sidebar-wrapper"] * { transition: none !important; }';
    document.head.appendChild(styleEl);

    const handleMouseMove = (mouseEvent: MouseEvent) => {
      if (!isResizing.current) return;
      let newWidth = mouseEvent.clientX;

      // Threshold: if dragged below 120px, snap to collapsed icon state (48px)
      if (newWidth < 120) {
        if (isExpandedRef.current) {
          setOpen(false);
          isExpandedRef.current = false;
        }
        newWidth = 48; // visual clamp
      } else {
        if (!isExpandedRef.current) {
          setOpen(true);
          isExpandedRef.current = true;
        }
        // Max limit 600px
        newWidth = Math.min(600, newWidth);
      }

      if (providerRef.current && isExpandedRef.current) {
        providerRef.current.style.setProperty(
          '--sidebar-width',
          `${newWidth}px`
        );
      }
    };

    const handleMouseUp = (mouseEvent: MouseEvent) => {
      if (!isResizing.current) return;
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      const styleEl = document.getElementById(
        'sidebar-drag-transition-override'
      );
      if (styleEl) document.head.removeChild(styleEl);

      let finalWidth = mouseEvent.clientX;
      if (finalWidth >= 120) {
        finalWidth = Math.min(600, finalWidth);
        setWidth(finalWidth);
        localStorage.setItem('admin_sidebar_width', finalWidth.toString());
      }

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const isCollapsed = state === 'collapsed';

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`group/resizer fixed inset-y-0 z-50 -ml-2 hidden w-4 cursor-col-resize items-center justify-center opacity-0 transition-colors hover:bg-primary/5 hover:opacity-100 md:flex`}
      style={{
        left: isCollapsed
          ? 'var(--sidebar-width-icon)'
          : 'var(--sidebar-width)',
      }}
    >
      <div className="h-full w-[2px] bg-border/50 transition-colors group-hover/resizer:bg-primary/40" />
    </div>
  );
}

export function DashboardLayout({
  children,
  sidebar,
}: {
  children: ReactNode;
  sidebar: SidebarType;
}) {
  const providerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(288); // Default 72 spacing -> 288px

  useEffect(() => {
    const savedWidth = localStorage.getItem('admin_sidebar_width');
    if (savedWidth) {
      setWidth(parseInt(savedWidth, 10));
    }
  }, []);

  return (
    <SidebarProvider
      ref={providerRef}
      className="admin-theme"
      style={
        {
          '--sidebar-width': `${width}px`,
          '--header-height': 'calc(var(--spacing) * 14)',
        } as React.CSSProperties
      }
    >
      {sidebar && (
        <Sidebar variant={sidebar.variant || 'inset'} sidebar={sidebar} />
      )}
      <SidebarInset className="h-svh min-h-0 overflow-hidden md:h-[calc(100svh-1rem)]">
        {children}
      </SidebarInset>

      {/* Draggable vertical rail area */}
      {sidebar && (
        <SidebarResizer
          width={width}
          setWidth={setWidth}
          providerRef={providerRef as React.RefObject<HTMLDivElement | null>}
        />
      )}
    </SidebarProvider>
  );
}
