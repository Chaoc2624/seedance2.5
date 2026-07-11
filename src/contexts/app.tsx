import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { getAuthClient } from '@/core/auth/client';

import { envConfigs } from '@/config';
import { ensureDeviceFingerprint } from '@/lib/device-fingerprint';
import type { User } from '@/models/user.server';

import { AppContext } from './app-context';

export const AppContextProvider = ({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser?: Partial<User> | null;
}) => {
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [user, setUser] = useState<User | null>((initialUser as User) ?? null);
  const userRef = useRef<User | null>(null);
  const [isCheckSign, setIsCheckSign] = useState(
    !!envConfigs.auth_secret && !initialUser
  );
  const [isShowSignModal, setIsShowSignModal] = useState(false);
  const [isShowPaymentModal, setIsShowPaymentModal] = useState(false);

  const fetchConfigs = useCallback(async () => {
    try {
      const { getConfigsFn } = await import('@/server/config.functions');
      const data = await getConfigsFn();
      setConfigs(data);
      return data;
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('fetch configs failed:', e);
      }
      return {};
    }
  }, []);

  const fetchUserCredits = useCallback(async () => {
    try {
      if (!userRef.current) return;
      const { getUserCreditsFn } = await import('@/server/user.functions');
      const credits = await getUserCreditsFn();
      setUser((prev) =>
        prev
          ? { ...prev, credits: { ...credits, expiresAt: null } as any }
          : prev
      );
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('fetch user credits failed:', e);
      }
    }
  }, []);

  const fetchUserInfo = useCallback(async () => {
    try {
      const { getUserInfoFn } = await import('@/server/user.functions');
      const user = await getUserInfoFn();
      setUser((user as User) ?? null);
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('fetch user info failed:', e);
      }
    }
  }, []);

  const showOneTap = useCallback(async (configs: Record<string, string>) => {
    try {
      const authClient = getAuthClient(configs);
      await authClient.oneTap({
        callbackURL: '/',
        onPromptNotification: (notification: any) => {
          if (process.env.NODE_ENV !== 'production') {
            console.log('One Tap prompt notification:', notification);
          }
        },
      });
    } catch {
      // Silently handle One Tap cancellation errors
    }
  }, []);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    void ensureDeviceFingerprint();
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      isCheckSign,
      setIsCheckSign,
      isShowSignModal,
      setIsShowSignModal,
      isShowPaymentModal,
      setIsShowPaymentModal,
      configs,
      fetchConfigs,
      fetchUserCredits,
      fetchUserInfo,
      showOneTap,
    }),
    [
      user,
      isCheckSign,
      isShowSignModal,
      isShowPaymentModal,
      configs,
      fetchConfigs,
      fetchUserCredits,
      fetchUserInfo,
      showOneTap,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
