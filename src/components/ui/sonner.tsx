'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Toaster as Sonner, ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      position="top-center"
      richColors={false}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'relative !rounded-xl !border !border-white/[0.11] !bg-[#11140f]/[0.96] !px-4 !py-3 !text-[#f4f2e6] !shadow-[0_18px_56px_rgba(0,0,0,0.42)] !backdrop-blur-2xl before:absolute before:inset-y-3 before:left-0 before:w-0.5 before:rounded-r-full',
          title: '!text-sm !font-semibold !tracking-normal',
          description: '!text-sm !leading-5 !text-[#c3c8b9]',
          success: 'before:!bg-[#d8f269] [&_[data-icon]]:!text-[#d8f269]',
          error: 'before:!bg-rose-400 [&_[data-icon]]:!text-rose-300',
          warning: 'before:!bg-amber-300 [&_[data-icon]]:!text-amber-200',
          info: 'before:!bg-sky-300 [&_[data-icon]]:!text-sky-200',
          closeButton:
            '!border-white/[0.1] !bg-white/[0.055] !text-[#e7eadf] hover:!bg-white/[0.11]',
        },
      }}
      style={
        {
          '--normal-bg': '#11140f',
          '--normal-text': '#f4f2e6',
          '--normal-border': 'rgba(255,255,255,0.11)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
