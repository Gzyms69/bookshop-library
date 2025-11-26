# BookShop Library Frontend Style Guide

This reference captures the design tokens currently used by the customer-facing panel so the upcoming admin experience can match it 1:1.

## Color Palette

| Usage | Classes / Values | Notes |
| --- | --- | --- |
| Primary gradient | `from-green-400 to-teal-500` | Hero headings (CustomerPanel) |
| Background | `bg-gray-900` + dots pattern | Base page background |
| Surface panels | `bg-gray-800/80`, `bg-gray-800/50`, `bg-gray-700/70` hover | Cards, filter drawers |
| Text | `text-gray-50`, `text-gray-100`, `text-gray-300`, `text-gray-400` | Hierarchical typography |
| Success accents | `text-green-400`, `bg-green-500/20`, `bg-green-600` | Buttons, availability |
| Error accents | `bg-red-900/20`, `text-red-300`, `bg-red-500/20` | Error banner, out-of-stock |
| Type badges | Cyan (`text-cyan-500`), Lime, Fuchsia, Amber | Maps to `item_type_id` |
| Misc controls | `bg-gray-800`, `border-gray-700`, `border-gray-600` | Inputs, selects, filter buttons |

## Typography

- Global font stack: system sans (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, etc.)
- Headings:
  - Hero: `text-4xl sm:text-5xl`, `font-extrabold`, gradient text via `bg-clip-text text-transparent bg-gradient-to-r`
  - Section titles: `text-2xl font-bold text-gray-100`
- Body copy: `text-base text-gray-400` (descriptions), `text-sm text-gray-300` (meta data)
- Buttons: `text-sm font-medium`
- Line clamping utilities (`line-clamp-1`, `line-clamp-2`) used in cards to control overflow.

## Spacing System

- Page padding: `p-4 sm:p-6 lg:p-8`
- Max width constraint: `max-w-screen-2xl mx-auto`
- Vertical rhythm: `mb-6`, `mb-10`, `mt-10`, `gap-3/4/6` depending on component density
- Grid layout: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`

## Backgrounds & Patterns

- `.bg-dots-pattern`: `bg-gray-900` with a custom radial dot grid (`rgba(255,255,255,0.08)` every 20px) applied to the `<main>` containers.
- Cards use translucent surfaces (`bg-gray-800/80`) plus hover tinting to create depth.
- Filter drawers use `bg-gray-800/50` with `backdrop-blur-sm`.

## Borders & Radii

- Panels/buttons: `rounded-2xl` for cards, `rounded-lg` for controls, `rounded-full` for badges.
- Border colors: `border-gray-700` (default), `border-green-500` (active filters), badge-specific colors (`border-cyan-500/30`, etc.).
- Availability badge uses `border-green-500/30` or `border-red-500/30`.
- Global focus state: `outline: 2px solid #10b981` with 2px offset (see `App.css`).

## Shadows

- No explicit Tailwind shadows; depth is conveyed via translucent backgrounds + borders and `hover:scale-105` transforms.

## Transitions & Animations

- Global rule applies `transition-colors duration-150 ease-in-out` plus `transition-property: transform, opacity` to every element.
- Item cards include `transition-all duration-300` and `hover:scale-105`.
- Loading spinner: SVG using Tailwind `animate-spin` (default speed) and custom `.animate-spin-slow` utility (3s) available for future use.

## Component-Specific Patterns

### CustomerPanel

- Layout: flex column, centered header, footer with `text-sm text-gray-500`.
- Controls: search input with leading icon (`SearchIcon`) inside `relative` wrapper, filter toggle uses `FilterIcon`.
- Loading state: spinner with `fill-green-500`; error state uses red-tinted card and retry button.

### ItemCard

- Surface: `bg-gray-800/80 border-gray-700 rounded-2xl`.
- Type badge: dynamic color classes determined in `getTypeColor`, includes icon + label.
- Availability chip: green or red variant with `border` and translucent background.
- Pricing rows: flex layout with `text-gray-300` labels and green/teal values.
- Actions: two buttons (`Rent Now`, `Purchase`) sharing consistent padding, color palette, and disabled state styling.

### ItemGrid

- Responsive CSS grid defined in component; inherits spacing from parent container.

### SearchFilters

- Drawer-style card (`bg-gray-800/50`), uses `FilterIcon` accent in `text-green-400`.
- Filter buttons show active state via `bg-gray-700 border-green-500 text-gray-100`; inactive state uses neutral grays and hover tint.
- Close button: plain icon button with `text-gray-400` -> `text-gray-200` on hover.

### Loading / Empty States

- Loading: full-screen center column with spinner and `text-2xl text-gray-300`.
- Empty library: circle badge with `BookIcon` in `text-green-400`; message in `text-lg text-gray-400`.
- Empty search results: card with `bg-gray-800/50`, `BookIcon` in `text-gray-500`, explanatory copy referencing active search/filter.

---

Use these tokens as the authoritative reference while building the admin panel to guarantee visual parity with the existing customer experience.

