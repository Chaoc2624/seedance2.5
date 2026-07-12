# Seedance 2.5 visual remodel PRD

## Context

The current Seedance 2.5 project was copied from an earlier sibling project, so several public and product surfaces still carry the old black and acid-green visual language. The screenshots show a mismatch between the intended ByteDance-adjacent blue and white brand direction and the current UI.

## Goal

Rework the visible Seedance 2.5 experience into a clear, premium, video-first product surface:

1. Use a blue and white Seedance 2.5 identity across public navigation, auth, composer controls, dropdowns, and Generate.
2. Make the home hero feel more cinematic and conversion-focused, with a clearer video backdrop and stronger copy.
3. Keep the product video-only by default in the landing composer.
4. Highlight Seedance 2.5 multilingual creation, including small-language and localized-story support.
5. Add a lightweight "What's new" section so the homepage feels current and more complete.

## Non-goals

1. Do not change the generation API, task pipeline, auth flow, or routing.
2. Do not reintroduce image-generation landing modules into the Seedance 2.5 home.
3. Do not add new navigation tools to the sidebar.
4. Do not change payment logic or plan entitlements.

## Visual direction

Primary visual language:

1. Electric blue primary actions.
2. White, mist, and pale-blue surfaces.
3. Slate/navy text for readability.
4. Glass and shadow only where it clarifies hierarchy.
5. Dark surfaces reserved for immersive media preview or footer/paywall contrast, not for ordinary form controls.

## Acceptance criteria

1. Top-right sign-in no longer uses green text, green hover, or green glow.
2. Locale, model, workflow, duration, resolution, and aspect-ratio popovers use light blue and white styling.
3. The homepage composer is light, legible, and consistent with the blue-white theme.
4. The Generate workspace background, filter, timeline cards, skeletons, and bottom composer are no longer black.
5. Auth modal, auth page card, inputs, labels, and submit buttons are blue-white and legible.
6. The home hero video is visibly clearer than the previous washed-out background.
7. Homepage copy is more direct and focused on Seedance 2.5 video generation, references, sound, and multilingual direction.
8. A "What's new" section appears on the home page.
9. Multilingual content emphasizes global markets and small-language support.
10. Formatting and lint checks are run before handoff.
