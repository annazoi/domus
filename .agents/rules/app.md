---
trigger: always_on
---

You are a senior React + TypeScript engineer.

Follow these rules strictly:

- Use functional components only
- Use TypeScript everywhere, no `any`
- Prefer composition over inheritance
- Keep components small and focused (single responsibility)
- No business logic inside JSX
- No inline functions inside JSX unless memoized
- Extract logic into hooks
- Use immutable state updates only
- Prefer controlled components
- Avoid prop drilling; use context or stores
- Prefer named exports
- Do not over-abstract
- Optimize for readability first, performance second
- Follow React 18 best practices
- Assume production-grade code

Component rules:

- Props must be explicitly typed
- No default exports
- JSX must be minimal and readable
- No calculations inside JSX
- Use early returns
- Use memoization only when needed
- Styling must be separated
- Component must be testable in isolation

State rules:

- Global game state must live in a store (Zustand or equivalent)
- UI state stays local
- No derived state stored
- No mutation
- All game state changes go through actions
- No direct state writes inside components

Hooks rules:

- One responsibility per hook
- Hooks must not render JSX
- Hooks return stable APIs
- Hooks must be pure except for effects
- Side effects only inside useEffect
- All hooks typed explicitly

TypeScript rules:

- strict mode assumed
- No `any`, `unknown` only when justified
- Use union types instead of enums where possible
- Prefer readonly types for state
- Prefer explicit return types for public functions
- Discriminated unions for game logic

Game logic rules:

- No game rules inside components
- Movement logic goes in /utils
- Validation must be deterministic
- Board is the single source of truth
- Client never decides legality
- All rules must be unit-testable

All constant values used in:

- dropdowns
- selects
- filters
- enums shown to users
- game options
- feature flags
- size / mode / type selectors

MUST be defined in a dedicated config file.

All dropdown constants must follow this pattern:

- Uppercase keys
- Literal string values
- `as const`
- Exported union type derived from values

DO NOT:

- Use enums for UI-facing options
- Use magic strings in JSX
- Define options inside components
- Define values without `as const`
- Manually write union types

Helper methods MUST NEVER be defined:

- Inside components
- Inside services
- Inside controllers
- Inside hooks
- Inside gateways

Helpers must always live in a dedicated helper or utils folder.
If a helper is used across multiple features:

Place it in the root utils folder.

Helper files must:

- End with .helper.ts or .utils.ts
- Be named after their responsibility
- Export named functions only

Never:

- use comments to explain the code
- Use useEffect for derived state
- Use index as React key
- Mutate arrays or objects
- Inline complex logic in JSX
- Create god components
- Mix UI and rules

- features/

  - user/
    - hooks/use-user.ts
    - services/user.services.ts
    - interfaces/user.interfaces.ts
    - utils/user.utils.ts

- pages/
  - user/
    - utils/user.utiles.ts
    - contants/user.constants.ts
    - interfaces/user.interfaces.ts
    - hooks/use-user.ts
    - components/
      - user-card.tsx
      - user-list.tsx
      - user-form.tsx
      - user-loading.tsx
    - pages/
      - user-page.tsx
      - user-list-page.tsx

- services/
- interfaces/
- utils/
- hooks/
- stores/
- routes/
- lib/
- config/
- constants/

Tailwind & Design System Rules
Core styling philosophy

Utility-first styling only with Tailwind CSS

No custom CSS files unless absolutely required

No inline style attributes

Design must feel calm, modern, minimal, and structured

Prioritize clarity, spacing rhythm, and visual hierarchy over decoration

Every visual decision must be systematic, not arbitrary

Layout & spacing

Use an 8-point spacing system exclusively

Prefer gap utilities over margins for layout separation

Containers must use consistent max-widths and horizontal padding

Avoid deep nesting of layout wrappers

Pages must follow a clear vertical rhythm:

Header

Primary content

Secondary/supporting content

Safe bottom spacing

Typography

Use Tailwind typography scale only

Maximum two font weights per view

Headings must create clear scanning hierarchy

Avoid long line lengths; keep readable measure

Text contrast must always meet accessibility standards

Color system

Colors must come from the design token palette, never hard-coded

Use semantic roles:

background

surface

border

primary

secondary

muted

destructive

success

Avoid pure black; prefer softened neutrals

Gradients allowed only for subtle emphasis, never decoration

Surfaces & depth

Prefer flat surfaces with soft elevation

Use shadows sparingly and consistently

Radius scale must be consistent across all components

Avoid skeuomorphic or heavy visual effects

Components

Every component must support:

hover

focus

active

disabled

loading

Interactive targets must meet minimum touch size

Use clear affordances, never ambiguous clickable areas

Icons must always align visually with text baseline

Motion & feedback

Motion must be fast, subtle, and purposeful

Use Tailwind transition utilities only

Avoid long or decorative animations

Feedback must feel instant and responsive

Loading states must never shift layout unexpectedly

Forms & inputs

Inputs must have:

visible label

clear focus ring

error state

helper text space

Validation feedback must be immediate and deterministic

Avoid placeholder-only labels

Group related controls with consistent spacing

Data density & readability

Prefer cards, sections, and visual grouping over raw lists

Use whitespace to separate meaning, not borders alone

Important values must be visually dominant

Secondary information must be de-emphasized, not hidden

Responsiveness

Mobile-first always

No breakpoint-specific hacks

Layout must remain usable at all intermediate widths

Avoid horizontal scrolling for primary content

Dark mode

Dark mode must be designed, not inverted

Maintain contrast and hierarchy parity with light mode

Shadows must adapt to darker surfaces

Avoid overly saturated colors in dark theme

Consistency enforcement

No one-off spacing, colors, or radii

Repeated UI patterns must become reusable components

Visual decisions must be traceable to the design system

If a style is used twice, it must be tokenized or componentized