import {
  type CSSProperties,
  type MouseEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router';
import { getOrders } from '../../api/orders.api';
import type { OrderDto } from '../../api/api.types';

import { routes } from '../../app/routes';
import accountBackground from '../../assets/vinyl-vault/account-library-shelf-turntable-headphones.png';
import { Footer } from '../../components/layout/Footer/Footer';
import { Header } from '../../components/layout/Header/Header';
import { AlbumCard } from '../../components/ui/AlbumCard/AlbumCard';
import { CatalogFilter } from '../../components/ui/CatalogFilter/CatalogFilter';
import {
  type CatalogFilters,
  defaultCatalogFilters,
  filtersToSearchParams,
} from '../../features/home/home.filters';
import { logoutUser, openAuthModal, useAuthState } from '../../state/auth';
import { refreshSavedAlbums, useSavedAlbums } from '../../state/library';
import './AccountPage.scss';
import { OrderCard } from './components/OrderCard';

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export function AccountPage() {
  const navigate = useNavigate();
  const auth = useAuthState();
  const savedItems = useSavedAlbums();
  const [isCatalogFilterOpen, setIsCatalogFilterOpen] = useState(false);
  const [catalogFilterSession, setCatalogFilterSession] = useState(0);
  const [appliedFilters] = useState(defaultCatalogFilters);
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const savedAlbums = useMemo(
    () =>
      savedItems.map((item) => ({
        id: String(item.release.id),
        slug: item.release.slug,
        artistSlug: item.release.artists[0]?.slug || '',
        artist: item.release.artists[0]?.name || 'Unknown artist',
        title: item.release.title,
        coverSrc: item.release.cover_url || '',
        coverAlt: `${item.release.title} cover`,
        filterMetadata: {
          countries: item.release.country ? [item.release.country] : [],
          genres: (item.release.genres ?? []).map((genre) =>
            typeof genre === 'string' ? genre : genre.name,
          ),
          releaseYear: item.release.release_year || 0,
          styles: (item.release.styles ?? []).map((style) =>
            typeof style === 'string' ? style : style.name,
          ),
        },
      })),
    [savedItems],
  );
  const catalogFilterId = 'account-page-catalog-filter';

  useEffect(() => {
    if (auth.isAuthenticated) {
      return;
    }

    openAuthModal({
      context: 'account',
      message: 'Please log in or create an account to view your library.',
      mode: 'login',
    });
    navigate(routes.home, { replace: true });
  }, [auth.isAuthenticated, navigate]);

  useEffect(() => {
    if (auth.isAuthenticated) void refreshSavedAlbums();
  }, [auth.isAuthenticated]);

  useEffect(() => {
    if (!auth.isAuthenticated) return;
    void getOrders().then((response) =>
      setOrders(Array.isArray(response) ? response : response.results),
    );
  }, [auth.isAuthenticated]);

  if (!auth.isAuthenticated) {
    return null;
  }

  function handleArtistSelect(
    artistSlug: string,
    event: MouseEvent<HTMLButtonElement>,
  ) {
    event.currentTarget.blur();
    navigate(routes.searchByArtist(artistSlug));
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
    navigate(`${routes.search}?${filtersToSearchParams(nextFilters)}`);
  }

  async function handleLogout() {
    await logoutUser();
    navigate(routes.home);
  }

  return (
    <>
      <main
        className="account-page"
        style={
          {
            '--account-page-bg': `url(${accountBackground})`,
          } as CSSProperties
        }
      >
        <Header
          filterPanelId={catalogFilterId}
          isFilterOpen={isCatalogFilterOpen}
          onFilterToggle={handleCatalogFilterToggle}
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
          className="app-container account-page__content"
          aria-labelledby="account-title"
        >
          <div className="account-page__heading-row">
            <div>
              <h1 id="account-title">{auth.user?.name ?? 'Your account'}</h1>
              <p>View your purchased music</p>
            </div>
            <button
              className="account-page__logout"
              type="button"
              aria-label={`Log out ${auth.user?.name ?? 'account'}`}
              onClick={handleLogout}
            >
              <LogoutIcon />
              Log out
            </button>
          </div>

          <section
            className="account-page__orders"
            aria-labelledby="order-history-title"
          >
            <h2 id="order-history-title">Order history</h2>
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </section>

          <section
            className="account-page__saved"
            aria-labelledby="saved-title"
          >
            <h2 id="saved-title">Saved</h2>
            {savedAlbums.length > 0 ? (
              <div className="account-page__saved-grid">
                {savedAlbums.map((album) => (
                  <AlbumCard
                    key={album.id}
                    album={album}
                    onArtistSelect={handleArtistSelect}
                  />
                ))}
              </div>
            ) : (
              <p className="account-page__saved-empty">
                No saved albums yet. Use the bookmark on album pages to add
                records here.
              </p>
            )}
          </section>
        </section>
      </main>
      <Footer />
    </>
  );
}
