import { useState } from 'react';

import { useTranslations } from '@/core/i18n/hooks';

import { SignInForm } from '@/components/blocks/sign/sign-in-form';
import { SignUpForm } from '@/components/blocks/sign/sign-up-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useAppContext } from '@/hooks/use-app-context';
import { useMediaQuery } from '@/hooks/use-media-query';

export function SignModal({ callbackUrl = '/' }: { callbackUrl?: string }) {
  const t = useTranslations('common.sign');
  const { isShowSignModal, setIsShowSignModal } = useAppContext();
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');

  const isDesktop = useMediaQuery('(min-width: 768px)');

  const handleOpenChange = (open: boolean) => {
    setIsShowSignModal(open);
    if (!open) {
      setMode('sign-in');
    }
  };

  const title = mode === 'sign-in' ? t('sign_in_title') : t('sign_up_title');
  const description =
    mode === 'sign-in' ? t('sign_in_description') : t('sign_up_description');

  const formContent =
    mode === 'sign-in' ? (
      <SignInForm
        callbackUrl={callbackUrl}
        onSwitchToSignUp={() => setMode('sign-up')}
      />
    ) : (
      <SignUpForm
        callbackUrl={callbackUrl}
        onSwitchToSignIn={() => setMode('sign-in')}
      />
    );

  if (isDesktop) {
    return (
      <Dialog open={isShowSignModal} onOpenChange={handleOpenChange}>
        <DialogContent className="border border-blue-100 bg-white text-slate-950 shadow-[0_28px_90px_rgba(15,23,42,0.18)] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-slate-950">{title}</DialogTitle>
            <DialogDescription className="text-slate-500">
              {description}
            </DialogDescription>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isShowSignModal} onOpenChange={handleOpenChange}>
      <DrawerContent className="border-blue-100 bg-white text-slate-950">
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-slate-950">{title}</DrawerTitle>
          <DrawerDescription className="text-slate-500">
            {description}
          </DrawerDescription>
        </DrawerHeader>
        {mode === 'sign-in' ? (
          <SignInForm
            callbackUrl={callbackUrl}
            className="mt-8 px-4"
            onSwitchToSignUp={() => setMode('sign-up')}
          />
        ) : (
          <SignUpForm
            callbackUrl={callbackUrl}
            className="mt-8 px-4"
            onSwitchToSignIn={() => setMode('sign-in')}
          />
        )}
        <DrawerFooter className="pt-4">
          <DrawerClose asChild>
            <Button
              variant="outline"
              className="border-blue-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700"
            >
              {t('cancel_title')}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
