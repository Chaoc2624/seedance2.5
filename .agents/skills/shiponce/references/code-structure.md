# Code Structure Reference

Use this reference when adding or refactoring React components, route modules,
server functions, services, hooks, or shared utilities.

## Size Boundaries

- Keep each TSX component file at 400 lines or less. If a component file would
  exceed 400 lines, split visual sections into named subcomponents before
  adding more behavior.
- Keep functions and class methods small enough to scan in one screen. As a
  working ceiling, split functions that approach roughly 80 lines, and split
  earlier when they mix rendering, data shaping, side effects, and validation.
  Prefer early returns, focused helpers, and explicit data shaping over one
  giant function with many branches.
- Do not let route files become catch-all modules. Keep loaders/actions thin and
  move request orchestration to `src/server/*`, persistence to `src/models/*`,
  and reusable UI to `src/components/*`.

## Component Splitting

- Split by user-visible sections first: header, toolbar, list, empty state,
  modal, form, footer, preview, or table row.
- Keep child components prop-driven when the parent owns workflow state.
- Move reusable stateful UI behavior into a local hook only when it has a clear
  name and reduces repeated control logic.
- Keep tiny one-off markup inline when extraction would make the code harder to
  follow.

## Logic Splitting

- Move pure transforms, filtering, sorting, grouping, formatting, and option
  builders to module-scope helpers.
- Move cross-route or server-only orchestration into `src/server/*` or
  `src/services/*` instead of embedding it in UI components.
- Prefer small named helpers over deeply nested conditionals. When a function
  needs comments to explain each branch, split the branches into named helpers.

## Review Checklist

1. Is any TSX component file over 400 lines? If yes, split it before adding
   more behavior.
2. Is any function or class method approaching roughly 80 lines, or doing
   rendering, data shaping, side effects, and validation together? If yes,
   separate those concerns.
3. Are extracted pieces aligned with existing folders and ownership boundaries?
4. Did the split reduce scanning cost without adding unnecessary indirection?
