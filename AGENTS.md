# Frontend Architecture & Styling Rules

These rules are the project standard for all current and future Vinyl Vault frontend work.

## Ownership

- Page styles live with the page: `src/pages/PageName/PageName.scss`.
- Reusable component styles live with the component: `ComponentName.scss` next to `ComponentName.tsx`.
- Page-only components may live under `src/pages/PageName/components/`.
- Reusable components belong under `src/components/layout/` or `src/components/ui/`.
- Global styles contain only reset, base HTML/body/root rules, accessibility defaults, and truly global element defaults.
- App styles contain only app shell rules, such as shared app containers and app-level fallback layouts.
- Design values belong in `src/styles/tokens.scss`.

## SCSS Rules

- Use SCSS nesting with `&` for BEM blocks when it improves readability.
- Keep responsive rules with the page or component that owns them.
- Do not create empty style files or placeholder page folders.
- Do not create one large style file for the whole site.
- Do not place new page-specific styles in `App.scss`, `index.scss`, or global styles.
- Avoid generic class names such as `.content`, `.wrapper`, `.left`, `.right`, `.box1`, or `.section2`.

## File Structure

Use this pattern for pages:

```text
src/pages/PageName/
  PageName.tsx
  PageName.scss
  components/
```

Use this pattern for reusable components:

```text
src/components/ui/ComponentName/
  ComponentName.tsx
  ComponentName.scss
```

or:

```text
src/components/layout/ComponentName/
  ComponentName.tsx
  ComponentName.scss
```

## Responsibility Check

Before adding or editing a style, ask: "Who owns this style?"

- One page owns it -> put it in that page's SCSS.
- One reusable component owns it -> put it in that component's SCSS.
- The whole app shell owns it -> put it in `App.scss`.
- It is a global reset/base rule -> put it in `index.scss`.
- It is a repeated design value -> put it in `tokens.scss`.

Do not change the visual design during architecture refactors unless the user explicitly asks for a visual change.
