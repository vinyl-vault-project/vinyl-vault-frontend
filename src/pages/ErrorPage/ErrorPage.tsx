import { Link } from 'react-router';

import { routes } from '../../app/routes';
import brokenVinyl from '../../assets/vinyl-vault/broken-vinyl-404.png';
import { Footer } from '../../components/layout/Footer/Footer';
import { Header } from '../../components/layout/Header/Header';
import './ErrorPage.scss';

export function ErrorPage() {
  return (
    <div className="error-page">
      <Header searchQuery="Electronic music" />
      <main className="error-page__main">
        <section className="app-container error-page__content" aria-labelledby="error-title">
          <h1 className="error-page__title" id="error-title">
            Error 404
          </h1>
          <img
            className="error-page__vinyl"
            src={brokenVinyl}
            width="204"
            height="204"
            alt=""
            aria-hidden="true"
          />
          <Link className="error-page__home-link" to={routes.home}>
            Back home
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
