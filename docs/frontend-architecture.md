# Frontend Architecture

## Stack and Commands

Vinyl Vault uses React, TypeScript, React Router, and Vite. The current package scripts are `npm run dev`, `npm run format:check`, `npm run lint`, `npm run build`, and `npm run preview`.

## Home Page Hierarchy

The `/` route renders `HomePage`, which composes `Header`, `HeroBanner`, `AlbumCollection`, `FeaturedArtists`, a second `AlbumCollection`, and `Footer`.

`HomePage` also owns artist modal state as `ArtistDetails | null`. `AlbumCollection` and `FeaturedArtists` send stable artist slugs when an artist target is selected, and `HomePage` resolves that slug through `getArtistDetailsBySlug()`.

## Folders

`src/app` holds shared route builders. `src/components/layout` holds page layout components with their own SCSS. `src/components/ui` holds reusable UI pieces with their own SCSS. `src/features/home` holds Home models, mock data, service adapter, and feature sections. `src/pages` holds route-level page components and page-owned SCSS. `src/styles` holds global design tokens. `src/assets/vinyl-vault` holds normalized local asset names imported by Vite.

## CSS and Tokens

SCSS uses BEM-style class names with nested `&` blocks where it improves readability. Shared values such as colors, container width, gutters, typography, radii, and transitions live in `src/styles/tokens.scss`.

Page-specific styles live with their page, for example `src/pages/HomePage/HomePage.scss`. Reusable component styles live next to their component, for example `src/components/ui/AlbumCard/AlbumCard.scss`. `App.scss` is reserved for app shell rules, and `index.scss` is reserved for global base styles.

The font stack intentionally prefers SF Compact-like platform fonts and falls back to Segoe UI, Roboto, Arial, and generic sans-serif because no dedicated font file is currently included.

## Data Models

Home data uses typed models in `home.types.ts`: `AlbumSummary`, `FeaturedArtist`, `HeroPromotion`, and `HomePageData`. Presentation components receive these types as props and do not own content.

Artist modal data uses `ArtistDetails`, which reuses `AlbumSummary` for the album strip.

## Data Flow

`getHomePageData()` currently returns `homePageMockData` asynchronously. A future `GET /api/home` integration should replace the body of that adapter and map API responses there, not inside React components.

`getArtistDetailsBySlug()` currently resolves artist details from typed mock data. A future `GET /api/artists/:slug` integration should keep response mapping in that adapter layer.

## Routes and Links

Route strings and builders are centralized in `src/app/routes.ts`. Album cover and title targets point to `/albums/:slug`, artist-name targets open `ArtistDetailsModal`, and search submission navigates to `/search?q=<query>`.

Featured Artist cards open `ArtistDetailsModal` with the matching artist content.

## Album Card Interactions

`AlbumCard` intentionally keeps three separate interactive areas. The cover image links to the album route, the artist name is a button that opens artist details, and the album title links to the same album route. The component must not wrap the full card in a single link or nest links and buttons.

## Artist Modal

`ArtistDetailsModal` lives in `src/features/home/components/ArtistDetailsModal`. Its current styles are owned by `HomePage.scss` because the modal is only used by the Home page. It renders through a portal, closes with the back button, Escape, or overlay click, traps keyboard focus while open, restores focus to the trigger after close, and locks body scroll without a layout jump.

## Assets

Use descriptive, lowercase asset names under `src/assets/vinyl-vault`. Do not inline images as base64, destructively crop originals, or reuse a real album image as another album. Missing album art should use the clearly named `album-placeholder.svg` until the correct cover is supplied. UI assets should also state their purpose, such as `featured-artists-next-arrow.svg`.

## Hero Behavior

Hero content is modeled as an array of `HeroPromotion`. The current asset set has one real visual, so automatic rotation and indicators are hidden. If a second genuine visual is added, the component can be extended to rotate every 5000ms, reset after manual indicator selection, and respect `prefers-reduced-motion`.

## Updating Content

Add or replace albums, artists, or hero promotions in `home.mock.ts`. Keep IDs and slugs stable, provide meaningful alt text, and import assets from `src/assets/vinyl-vault`.

## Current Limits

Album, search results, cart, account, contact, and about pages are link targets only. Several recommended album covers are placeholders because the matching source images were not provided. The next integration step is replacing mock Home data with `GET /api/home` and then implementing the linked routes.

Some recommended album covers were not supplied as separate assets, so those entries use the shared placeholder cover.
