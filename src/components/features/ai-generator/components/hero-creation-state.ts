import type { GenerationMode } from './hero-creation-form-data';
import { modelsByMode, workflowsByMode } from './hero-creation-form-data';

export type HeroCreationModeState = {
  workflowId: string;
  modelId: string;
  videoModelKey: string;
  imageModelKey: string;
};

export type ComposerPageBottomAutoExpandState = {
  hasScrollablePage: boolean;
  distanceToBottom: number;
  userCollapsed: boolean;
  bottomThreshold?: number;
};

export type HeroCreationInputContentState = {
  prompt: string;
  assetCount: number;
};

export function getNextHeroCreationModeState(
  nextMode: GenerationMode,
  currentState: HeroCreationModeState
): HeroCreationModeState {
  return {
    ...currentState,
    workflowId: workflowsByMode[nextMode][0]?.id ?? currentState.workflowId,
    modelId:
      nextMode === 'agent'
        ? (modelsByMode[nextMode][0]?.id ?? currentState.modelId)
        : currentState.modelId,
  };
}

export function shouldAutoExpandComposerAtPageBottom({
  hasScrollablePage,
  distanceToBottom,
  userCollapsed,
  bottomThreshold = 24,
}: ComposerPageBottomAutoExpandState) {
  return (
    hasScrollablePage && !userCollapsed && distanceToBottom <= bottomThreshold
  );
}

export function hasHeroCreationInputContent({
  prompt,
  assetCount,
}: HeroCreationInputContentState) {
  return prompt.trim().length > 0 || assetCount > 0;
}
