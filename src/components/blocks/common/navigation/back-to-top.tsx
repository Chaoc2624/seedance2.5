import ArrowUp from 'lucide-react/dist/esm/icons/arrow-up';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SHOW_BUTTON_AFTER = 320;

export function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > SHOW_BUTTON_AFTER);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label="Back to top"
      onClick={handleBackToTop}
      className={cn(
        'fixed right-4 bottom-4 z-40 rounded-full border-border/70 bg-background/92 text-foreground shadow-[0_18px_40px_-22px_rgba(15,23,42,0.5)] backdrop-blur transition-[opacity,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-background md:right-6 md:bottom-6',
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-3 opacity-0'
      )}
    >
      <ArrowUp className="size-4" />
      <span className="sr-only">Back to top</span>
    </Button>
  );
}
