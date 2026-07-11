import { createContext } from 'react';

import type { User } from '@/models/user.server';

export interface ContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
  isCheckSign: boolean;
  setIsCheckSign: (isCheckSign: boolean) => void;
  isShowSignModal: boolean;
  setIsShowSignModal: (show: boolean) => void;
  isShowPaymentModal: boolean;
  setIsShowPaymentModal: (show: boolean) => void;
  configs: Record<string, string>;
  fetchConfigs: () => Promise<Record<string, string>>;
  fetchUserCredits: () => Promise<void>;
  fetchUserInfo: () => Promise<void>;
  showOneTap: (configs: Record<string, string>) => Promise<void>;
}

export const AppContext = createContext({} as ContextValue);
