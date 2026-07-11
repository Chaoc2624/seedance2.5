import { useContext } from 'react';

import { AppContext, type ContextValue } from '@/contexts/app-context';

export const useAppContext = () => useContext(AppContext);

export type { ContextValue };
