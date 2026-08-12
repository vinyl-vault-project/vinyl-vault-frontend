import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router';

import { routes } from '../../../app/routes';
import accountIcon from '../../../assets/vinyl-vault/account.svg';
import basketIcon from '../../../assets/vinyl-vault/basket.svg';
import homeIcon from '../../../assets/vinyl-vault/home.svg';
import logo from '../../../assets/vinyl-vault/logo.svg';
import { openAuthModal, useAuthState } from '../../../state/auth';
import { getCartItemCount, useCartItems } from '../../../state/cart';
import './Header.scss';

function SearchIcon() {
  return (
    <svg
      className="site-header__search-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="m20 20-4.6-4.6m2.6-5.15a7.75 7.75 0 1 1-15.5 0 7.75 7.75 0 0 1 15.5 0Z" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg
      className="site-header__filter-icon"
      width="32"
      height="32"
      viewBox="0 0 32 32"
      aria-hidden="true"
    >
      <path
        d="M12.9 7C12.5 5.3 10.9 4 9 4C7.1 4 5.6 5.3 5.1 7H2V9H5.1C5.5 10.7 7.1 12 9 12C10.9 12 12.4 10.7 12.9 9H30V7H12.9ZM9 10C7.9 10 7 9.1 7 8C7 6.9 7.9 6 9 6C10.1 6 11 6.9 11 8C11 9.1 10.1 10 9 10ZM23 12C21.1 12 19.6 13.3 19.1 15H2V17H19.1C19.5 18.7 21.1 20 23 20C24.9 20 26.4 18.7 26.9 17H30V15H26.9C26.5 13.3 24.9 12 23 12ZM23 18C21.9 18 21 17.1 21 16C21 14.9 21.9 14 23 14C24.1 14 25 14.9 25 16C25 17.1 24.1 18 23 18ZM14 20C12.1 20 10.6 21.3 10.1 23H2V25H10.1C10.5 26.7 12.1 28 14 28C15.9 28 17.4 26.7 17.9 25H30V23H17.9C17.5 21.3 15.9 20 14 20ZM14 26C12.9 26 12 25.1 12 24C12 22.9 12.9 22 14 22C15.1 22 16 22.9 16 24C16 25.1 15.1 26 14 26Z"
        fill="currentColor"
      />
    </svg>
  );
}

interface HeaderProps {
  cartItemCount?: number;
  filterPanelId?: string;
  isFilterOpen?: boolean;
  onFilterToggle?: () => void;
  searchQuery?: string;
}

export function Header({
  cartItemCount,
  filterPanelId,
  isFilterOpen = false,
  onFilterToggle,
  searchQuery = '',
}: HeaderProps) {
  const [query, setQuery] = useState(searchQuery);
  const cartItems = useCartItems();
  const auth = useAuthState();
  const resolvedCartItemCount = cartItemCount ?? getCartItemCount(cartItems);
  const navigate = useNavigate();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = query.trim();

    navigate(
      trimmedQuery.length > 0 ? routes.searchByQuery(trimmedQuery) : routes.search,
    );
  }

  return (
    <header className="site-header">
      <div className="app-container site-header__inner">
        <Link
          className="site-header__logo-link"
          to={routes.home}
          aria-label="Vinyl Vault home"
        >
          <img
            className="site-header__logo"
            src={logo}
            width="238"
            height="48"
            alt="Vinyl Vault"
          />
        </Link>

        <form
          className="site-header__search"
          role="search"
          onSubmit={handleSubmit}
        >
          <SearchIcon />
          <label className="visually-hidden" htmlFor="site-search">
            Search
          </label>
          <input
            id="site-search"
            className="site-header__search-input"
            type="search"
            placeholder="Search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </form>

        <nav className="site-header__nav" aria-label="Primary">
          <button
            className="icon-button icon-button--muted"
            type="button"
            aria-controls={filterPanelId}
            aria-expanded={isFilterOpen}
            aria-label={isFilterOpen ? 'Close filters' : 'Open filters'}
            onClick={onFilterToggle}
          >
            <FilterIcon />
          </button>
          <Link className="icon-button" to={routes.home} aria-label="Home">
            <img src={homeIcon} width="27" height="27" alt="" />
          </Link>
          {auth.isAuthenticated ? (
            <Link
              className="icon-button"
              to={routes.accountLibrary}
              aria-label="Account and library"
            >
              <img src={accountIcon} width="22" height="27" alt="" />
            </Link>
          ) : (
            <button
              className="icon-button"
              type="button"
              aria-label="Log in to account"
              onClick={() => openAuthModal({ context: 'account', mode: 'login' })}
            >
              <img src={accountIcon} width="22" height="27" alt="" />
            </button>
          )}
          <Link
            className={`icon-button${
              resolvedCartItemCount ? ' icon-button--badged' : ''
            }`}
            to={routes.cart}
            aria-label={
              resolvedCartItemCount
                ? `Cart with ${resolvedCartItemCount} item`
                : 'Cart'
            }
          >
            <img src={basketIcon} width="25" height="26" alt="" />
            {resolvedCartItemCount ? (
              <span className="icon-button__badge" aria-hidden="true">
                {resolvedCartItemCount}
              </span>
            ) : null}
          </Link>
        </nav>
      </div>
    </header>
  );
}
