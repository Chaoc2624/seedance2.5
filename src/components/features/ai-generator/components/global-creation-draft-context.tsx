import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type { HeroCreationDraft } from './hero-creation-form';

type GlobalCreationDraftContextValue = {
  draft: HeroCreationDraft | null;
  setDraft: Dispatch<SetStateAction<HeroCreationDraft | null>>;
};

const GlobalCreationDraftContext =
  createContext<GlobalCreationDraftContextValue | null>(null);

function getBlobPreviewUrls(draft: HeroCreationDraft | null) {
  return new Set(
    (draft?.localAssets ?? [])
      .map((asset) => asset.previewUrl)
      .filter((url) => url.startsWith('blob:'))
  );
}

export function GlobalCreationDraftProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [draft, setDraft] = useState<HeroCreationDraft | null>(null);
  const blobUrlsRef = useRef(new Set<string>());

  useEffect(() => {
    const nextUrls = getBlobPreviewUrls(draft);
    blobUrlsRef.current.forEach((url) => {
      if (!nextUrls.has(url)) URL.revokeObjectURL(url);
    });
    blobUrlsRef.current = nextUrls;
  }, [draft]);

  useEffect(
    () => () => {
      blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    },
    []
  );

  const value = useMemo(() => ({ draft, setDraft }), [draft]);

  return (
    <GlobalCreationDraftContext.Provider value={value}>
      {children}
    </GlobalCreationDraftContext.Provider>
  );
}

export function useGlobalCreationDraft() {
  const value = useContext(GlobalCreationDraftContext);
  if (!value) {
    throw new Error(
      'useGlobalCreationDraft must be used inside GlobalCreationDraftProvider'
    );
  }
  return value;
}
