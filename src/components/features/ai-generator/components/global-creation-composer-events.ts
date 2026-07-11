import type { HeroCreationDraft } from './hero-creation-form';

export const GLOBAL_CREATION_COMPOSER_DRAFT_EVENT_NAME =
  'lusee-create:composer-draft';
export const GLOBAL_CREATION_COMPOSER_HOME_VISIBILITY_EVENT_NAME =
  'lusee-create:home-hero-visible';

export type GlobalCreationComposerDraftDetail = {
  draft: HeroCreationDraft;
};

export type GlobalCreationComposerHomeVisibilityDetail = {
  visible: boolean;
};

export function requestGlobalCreationComposerDraft(draft: HeroCreationDraft) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<GlobalCreationComposerDraftDetail>(
      GLOBAL_CREATION_COMPOSER_DRAFT_EVENT_NAME,
      {
        detail: { draft },
      }
    )
  );
}

export function setGlobalCreationComposerHomeHeroVisible(visible: boolean) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<GlobalCreationComposerHomeVisibilityDetail>(
      GLOBAL_CREATION_COMPOSER_HOME_VISIBILITY_EVENT_NAME,
      {
        detail: { visible },
      }
    )
  );
}
