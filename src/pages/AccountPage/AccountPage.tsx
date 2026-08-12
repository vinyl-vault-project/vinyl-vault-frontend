import {
  type CSSProperties,
  type MouseEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Link, useNavigate } from 'react-router';

import { routes } from '../../app/routes';
import accountBackground from '../../assets/vinyl-vault/account-library-shelf-turntable-headphones.png';
import { Footer } from '../../components/layout/Footer/Footer';
import { Header } from '../../components/layout/Header/Header';
import { AlbumCard } from '../../components/ui/AlbumCard/AlbumCard';
import { CatalogFilter } from '../../components/ui/CatalogFilter/CatalogFilter';
import { getPurchasedAlbumSummaries } from '../../data/accountLibrary';
import { getAlbumsByIds } from '../../data/albums';
import {
  type CatalogFilters,
  defaultCatalogFilters,
} from '../../features/home/home.filters';
import { mockLogout, openAuthModal, useAuthState } from '../../state/auth';
import { useSavedAlbumIds } from '../../state/library';
import './AccountPage.scss';

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  }).format(price);
}

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
  const savedAlbumIds = useSavedAlbumIds();
  const [isCatalogFilterOpen, setIsCatalogFilterOpen] = useState(false);
  const [catalogFilterSession, setCatalogFilterSession] = useState(0);
  const [appliedFilters, setAppliedFilters] = useState(defaultCatalogFilters);
  const purchasedAlbums = useMemo(() => getPurchasedAlbumSummaries(), []);
  const savedAlbums = useMemo(() => getAlbumsByIds(savedAlbumIds), [savedAlbumIds]);
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
    setAppliedFilters(nextFilters);
    setIsCatalogFilterOpen(false);
  }

  function handleLogout() {
    mockLogout();
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
          searchQuery="Electronic music"
          showSearchOnMobile={false}
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
              <h1 id="account-title">Your account</h1>
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

          <section className="account-page__purchased" aria-label="Purchased albums">
            {purchasedAlbums.map((purchase) => (
              <article className="account-page__purchase" key={purchase.albumId}>
                <Link
                  className="account-page__purchase-cover"
                  to={routes.album(purchase.album.slug)}
                  aria-label={`Open ${purchase.album.artist} - ${purchase.album.title}`}
                >
                  <img
                    src={purchase.album.coverSrc}
                    width="252"
                    height="252"
                    alt={purchase.album.coverAlt}
                  />
                </Link>
                <div className="account-page__purchase-copy">
                  <Link to={routes.album(purchase.album.slug)}>
                    {purchase.album.artist}
                  </Link>
                  <span>{purchase.album.title}</span>
                  <strong>{purchase.album.filterMetadata.releaseYear}</strong>
                </div>
                <p className="account-page__purchase-price">
                  {formatPrice(purchase.unitPrice)}_{purchase.selectedFormat}
                </p>
              </article>
            ))}
          </section>

          <section className="account-page__saved" aria-labelledby="saved-title">
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
                No saved albums yet. Use the bookmark on album pages to add records
                here.
              </p>
            )}
          </section>
        </section>
      </main>
      <Footer />
    </>
  );
}
