import { type MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { Footer } from '../../components/layout/Footer/Footer';
import { Header } from '../../components/layout/Header/Header';
import { AlbumCard } from '../../components/ui/AlbumCard/AlbumCard';
import { CatalogFilter } from '../../components/ui/CatalogFilter/CatalogFilter';
import { routes } from '../../app/routes';
import { ArtistDetailsModal } from '../../features/home/components/ArtistDetailsModal/ArtistDetailsModal';
import {
  type CatalogFilters,
  filtersFromSearchParams,
  filtersToSearchParams,
  toReleaseQuery,
} from '../../features/home/home.filters';
import {
  getArtistDetailsBySlug,
  getSearchResultAlbums,
} from '../../features/home/home.service';
import type {
  AlbumSummary,
  ArtistDetails,
} from '../../features/home/home.types';
import './SearchResults.scss';

type SearchResultsStatus =
  | { state: 'loading' }
  | {
      state: 'ready';
      albums: AlbumSummary[];
      count: number;
      next: string | null;
      previous: string | null;
    }
  | { state: 'error'; message: string };

function pageFromApiUrl(url: string | null, fallback: number) {
  if (!url) return null;

  try {
    const page = Number(new URL(url).searchParams.get('page'));
    return Number.isInteger(page) && page > 0 ? page : fallback;
  } catch {
    return fallback;
  }
}

export function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchParamsKey = searchParams.toString();
  const query = searchParams.get('q') ?? '';
  const artistSlug = searchParams.get('artist') ?? '';
  const [status, setStatus] = useState<SearchResultsStatus>({
    state: 'loading',
  });
  const [isCatalogFilterOpen, setIsCatalogFilterOpen] = useState(false);
  const [catalogFilterSession, setCatalogFilterSession] = useState(0);
  const appliedFilters = useMemo(
    () => filtersFromSearchParams(new URLSearchParams(searchParamsKey)),
    [searchParamsKey],
  );
  const requestedPage = Number(searchParams.get('page'));
  const currentPage =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const [selectedArtistDetails, setSelectedArtistDetails] =
    useState<ArtistDetails | null>(null);
  const artistTriggerRef = useRef<HTMLElement | null>(null);
  const catalogFilterId = 'search-results-catalog-filter';

  useEffect(() => {
    let isActive = true;

    async function loadSearchResults() {
      try {
        const response = await getSearchResultAlbums({
          search: query,
          artist: artistSlug,
          page: currentPage,
          ...toReleaseQuery(appliedFilters),
        });

        if (isActive) {
          setStatus({
            state: 'ready',
            albums: response.albums,
            count: response.count,
            next: response.next,
            previous: response.previous,
          });
        }
      } catch {
        if (isActive) {
          setStatus({
            state: 'error',
            message: 'Search results could not be loaded.',
          });
        }
      }
    }

    void loadSearchResults();

    return () => {
      isActive = false;
    };
  }, [appliedFilters, artistSlug, currentPage, query]);

  async function handleArtistSelect(
    artistSlug: string,
    event: MouseEvent<HTMLElement>,
  ) {
    artistTriggerRef.current = event.currentTarget;
    const artistDetails = await getArtistDetailsBySlug(artistSlug);

    if (artistDetails) {
      setSelectedArtistDetails(artistDetails);
    }
  }

  function handleArtistModalClose() {
    setSelectedArtistDetails(null);
    window.requestAnimationFrame(() => {
      artistTriggerRef.current?.focus();
      artistTriggerRef.current = null;
    });
  }

  function handleCatalogFilterToggle() {
    setIsCatalogFilterOpen((currentState) => {
      if (!currentState) {
        setCatalogFilterSession((currentSession) => currentSession + 1);
      }

      return !currentState;
    });
  }

  function handleCatalogFilterApply(nextFilters: CatalogFilters) {
    setIsCatalogFilterOpen(false);

    const nextParams = filtersToSearchParams(nextFilters);
    if (query) nextParams.set('q', query);
    if (artistSlug) nextParams.set('artist', artistSlug);
    navigate(`${routes.search}?${nextParams.toString()}`);
  }

  const albums = status.state === 'ready' ? status.albums : [];
  const nextPage =
    status.state === 'ready'
      ? pageFromApiUrl(status.next, currentPage + 1)
      : null;
  const previousPage =
    status.state === 'ready'
      ? pageFromApiUrl(status.previous, Math.max(currentPage - 1, 1))
      : null;
  const totalPages =
    status.state !== 'ready'
      ? 0
      : status.next
        ? Math.ceil(status.count / Math.max(status.albums.length, 1))
        : currentPage;

  function handlePageChange(page: number) {
    const nextParams = new URLSearchParams(searchParams);
    if (page === 1) nextParams.delete('page');
    else nextParams.set('page', String(page));
    navigate(`${routes.search}?${nextParams.toString()}`);

    window.requestAnimationFrame(() => {
      document.getElementById('search-results-title')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }
  return (
    <>
      <main className="search-results-page">
        <Header
          key={query}
          filterPanelId={catalogFilterId}
          isFilterOpen={isCatalogFilterOpen}
          onFilterToggle={handleCatalogFilterToggle}
          searchQuery={query}
        />
        <CatalogFilter
          key={catalogFilterSession}
          id={catalogFilterId}
          isOpen={isCatalogFilterOpen}
          appliedFilters={appliedFilters}
          onApply={handleCatalogFilterApply}
          onClose={() => setIsCatalogFilterOpen(false)}
        />

        <section
          className="app-container search-results-page__content"
          aria-labelledby="search-results-title"
        >
          <h1 className="search-results-page__title" id="search-results-title">
            Search results
          </h1>

          {status.state === 'loading' ? (
            <p className="search-results-page__status" aria-live="polite">
              Loading search results...
            </p>
          ) : null}

          {status.state === 'error' ? (
            <p className="search-results-page__status" role="alert">
              {status.message}
            </p>
          ) : null}

          {status.state === 'ready' && albums.length > 0 ? (
            <div className="search-results-page__grid">
              {albums.map((album) => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  onArtistSelect={(artistSlug, event) => {
                    void handleArtistSelect(artistSlug, event);
                  }}
                />
              ))}
            </div>
          ) : null}

          {status.state === 'ready' && albums.length === 0 ? (
            <p className="search-results-page__status">
              No albums match this search.
            </p>
          ) : null}
        </section>
      </main>
      {selectedArtistDetails ? (
        <ArtistDetailsModal
          artist={selectedArtistDetails}
          onClose={handleArtistModalClose}
        />
      ) : null}
      {status.state === 'ready' && totalPages > 1 ? (
        <nav
          className="search-results-page__pagination"
          aria-label="Search results pagination"
        >
          <button
            className="search-results-page__pagination-button"
            type="button"
            disabled={previousPage === null}
            onClick={() => previousPage && handlePageChange(previousPage)}
          >
            <span aria-hidden="true">←</span>
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, index) => {
            const page = index + 1;

            return (
              <button
                className={`search-results-page__pagination-button${
                  page === currentPage
                    ? ' search-results-page__pagination-button--active'
                    : ''
                }`}
                type="button"
                aria-current={page === currentPage ? 'page' : undefined}
                key={page}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            );
          })}

          <button
            className="search-results-page__pagination-button"
            type="button"
            disabled={nextPage === null}
            onClick={() => nextPage && handlePageChange(nextPage)}
          >
            Next
            <span aria-hidden="true">→</span>
          </button>
        </nav>
      ) : null}
      <Footer />
    </>
  );
}
