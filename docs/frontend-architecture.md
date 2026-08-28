# Frontend Architecture

## Stack and Commands

Vinyl Vault uses React, TypeScript, React Router, and Vite. The current package scripts are `npm run dev`, `npm run format:check`, `npm run lint`, `npm run build`, and `npm run preview`.

## Home Page Hierarchy

The `/` route renders `HomePage`, which composes `Header`, `HeroBanner`, `AlbumCollection`, `FeaturedArtists`, a second `AlbumCollection`, and `Footer`.

`HomePage` also owns artist modal state as `ArtistDetails | null`. `AlbumCollection` and `FeaturedArtists` send stable artist slugs when an artist target is selected, and `HomePage` resolves that slug through `getArtistDetailsBySlug()`.

## Folders

`src/app` holds shared route builders. `src/components/layout` holds page layout components with their own SCSS. `src/components/ui` holds reusable UI pieces with their own SCSS, including `Button`, `Checkbox`, `Select`, and `AlbumCard`. `src/features/home` holds Home models, mock data, service adapter, catalog filter config, and feature sections. `src/pages` holds route-level page components and page-owned SCSS. `src/styles` holds global design tokens. `src/assets/vinyl-vault` holds normalized local asset names imported by Vite.

## CSS and Tokens

SCSS uses BEM-style class names with nested `&` blocks where it improves readability. Shared values such as colors, container width, gutters, typography, radii, form control heights, button text sizing, z-index roles, and transitions live in `src/styles/tokens.scss`.

Page-specific styles live with their page, for example `src/pages/HomePage/HomePage.scss`. Reusable component styles live next to their component, for example `src/components/ui/AlbumCard/AlbumCard.scss`. `App.scss` is reserved for app shell rules, and `index.scss` is reserved for global base styles.

The font stack intentionally prefers SF Compact-like platform fonts and falls back to Segoe UI, Roboto, Arial, and generic sans-serif because no dedicated font file is currently included.

## UI Kit Primitives

Reusable control styling is centralized in `src/components/ui`. `Button` owns the white Vinyl Vault button family with `primary`, `compact`, `wide`, and `text` variants. `Checkbox` wraps a native checkbox input with the dark UI Kit visual state, and `Select` wraps a native select with the supplied `catalog-filter-chevron.svg` asset. These primitives use semantic tokens instead of local hex values so page features do not duplicate control CSS.

## Data Models

Home data uses typed models in `home.types.ts`: `AlbumSummary`, `FeaturedArtist`, `HeroPromotion`, and `HomePageData`. `AlbumSummary` includes `filterMetadata` for the current mock catalog filter. Presentation components receive these types as props and do not own content.

Artist modal data uses `ArtistDetails`, which reuses `AlbumSummary` for the album strip.

## Data Flow

## Backend API data flow

The API base URL is configured only through `VITE_API_URL` (see `.env.example`). API modules in `src/api` use native `fetch`, typed DTOs, JSON requests, Bearer access tokens, and one guarded access-token refresh on a 401. Refresh failure clears the local session.

Catalog data is loaded from `GET /releases/`; search and applied genre/style/year filters are sent as query parameters rather than filtered from mock records. Filter choices come from `GET /genres/` and `GET /styles/`. There is currently no backend contract for a country filter, so it is not displayed. Release pages use `GET /releases/{slug}/`, mapping the backend DTO in `home.service.ts`. Track durations are formatted from `duration_seconds`, and tracks are grouped by their backend `side` value.

Authenticated cart and saved-release state are server-backed (`/cart/` and `/saved/`), with the saved-record ID retained for deletion. Authentication uses `/auth/login/`, `/auth/register/`, `/auth/me/`, `/auth/token/refresh/`, and `/auth/logout/`. Orders are created through `/orders/` and the account reads `/orders/`.

`getArtistDetailsBySlug()` loads artist details from `GET /artists/{slug}/` and maps that response in the service layer.

Catalog filter defaults and request mapping live in `src/features/home/home.filters.ts`. The filter panel keeps draft state while open; Apply causes the page to request the filtered backend catalog. Clear restores `defaultCatalogFilters`; closing with Escape, repeat toggle, or outside click discards unapplied draft changes.

## Catalog Filter Accessibility

The large Home filter is a form named `Catalog filters`. The Header filter trigger exposes `aria-controls` and `aria-expanded`. Genre and Style headings are independent buttons with `aria-expanded`; Country remains expanded. Year range validation is announced through an inline alert and blocks Apply until the range is valid. The panel overlays the Hero on desktop and does not lock body scroll.

## Routes and Links

Route strings and builders are centralized in `src/app/routes.ts`. Album cover and title targets point to `/albums/:slug`, artist-name targets open `ArtistDetailsModal`, and search submission navigates to `/search?q=<query>`.

Featured Artist cards open `ArtistDetailsModal` with the matching artist content.

## Album Card Interactions

`AlbumCard` intentionally keeps three separate interactive areas. The cover image links to the album route, the artist name is a button that opens artist details, and the album title links to the same album route. The component must not wrap the full card in a single link or nest links and buttons.

## Artist Modal

`ArtistDetailsModal` lives in `src/features/home/components/ArtistDetailsModal`. Its current styles are owned by `HomePage.scss` because the modal is only used by the Home page. It renders through a portal, closes with the back button, Escape, or overlay click, traps keyboard focus while open, restores focus to the trigger after close, and locks body scroll without a layout jump.

## Assets

Use descriptive, lowercase asset names under `src/assets/vinyl-vault`. Do not inline images as base64, destructively crop originals, or reuse a real album image as another album. Missing album art should use the clearly named `album-placeholder.svg` until the correct cover is supplied. UI assets should also state their purpose, such as `featured-artists-next-arrow.svg` and `catalog-filter-chevron.svg`.

## Hero Behavior

Hero content is modeled as an array of `HeroPromotion`. The current asset set has one real visual, so automatic rotation and indicators are hidden. If a second genuine visual is added, the component can be extended to rotate every 5000ms, reset after manual indicator selection, and respect `prefers-reduced-motion`.

## Current Limits

The backend does not provide an endpoint for home-page hero promotions, featured artists, country filters, or recommendations. These sections use empty states rather than presenting mock business data as live catalog data.
