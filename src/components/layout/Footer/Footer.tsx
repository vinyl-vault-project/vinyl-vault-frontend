import { Link } from 'react-router';

import { routes } from '../../../app/routes';
import './Footer.scss';

const primaryLinks = [
  { label: 'Home', to: routes.home },
  { label: 'Cart', to: routes.cart },
  { label: 'Account / Library', to: routes.accountLibrary },
];

const secondaryLinks = [
  { label: 'Instagram', to: routes.instagram },
  { label: 'Privacy', to: routes.privacy },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="app-container site-footer__inner">
        <div className="site-footer__brand">
          <p className="site-footer__name">Vinyl Vault</p>
          <p className="site-footer__copyright">© 2026 MONOLITH RECORDINGS</p>
        </div>
        <nav className="site-footer__nav" aria-label="Footer">
          <ul className="site-footer__links">
            {primaryLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
          <ul className="site-footer__links site-footer__links--secondary">
            {secondaryLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
