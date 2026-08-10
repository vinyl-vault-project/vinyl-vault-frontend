import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router';

import { routes } from '../../../app/routes';
import accountIcon from '../../../assets/vinyl-vault/account.svg';
import basketIcon from '../../../assets/vinyl-vault/basket.svg';
import catalogFilterChevron from '../../../assets/vinyl-vault/catalog-filter-chevron.svg';
import homeIcon from '../../../assets/vinyl-vault/home.svg';
import logo from '../../../assets/vinyl-vault/logo.svg';
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

interface HeaderProps {
  filterPanelId?: string;
  isFilterOpen?: boolean;
  onFilterToggle?: () => void;
}

export function Header({
  filterPanelId,
  isFilterOpen = false,
  onFilterToggle,
}: HeaderProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = query.trim();

    if (trimmedQuery.length > 0) {
      navigate(routes.searchByQuery(trimmedQuery));
    }
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
            <img
              className="site-header__filter-icon"
              src={catalogFilterChevron}
              width="48"
              height="24"
              alt=""
              aria-hidden="true"
            />
          </button>
          <Link className="icon-button" to={routes.home} aria-label="Home">
            <img src={homeIcon} width="27" height="27" alt="" />
          </Link>
          <Link
            className="icon-button"
            to={routes.accountLibrary}
            aria-label="Account and library"
          >
            <img src={accountIcon} width="22" height="27" alt="" />
          </Link>
          <Link className="icon-button" to={routes.cart} aria-label="Cart">
            <img src={basketIcon} width="25" height="26" alt="" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
