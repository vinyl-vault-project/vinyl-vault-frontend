import { Link } from 'react-router';

import { routes } from '../../../../app/routes';
import type { HeroPromotion } from '../../home.types';

interface HeroBannerProps {
  promotions: HeroPromotion[];
}

function LabelMark({ type }: { type: 'aphex' | 'warp' }) {
  return (
    <span
      className={`hero-banner__mark hero-banner__mark--${type}`}
      aria-hidden="true"
    >
      {type === 'aphex' ? 'A' : 'WARP'}
    </span>
  );
}

export function HeroBanner({ promotions }: HeroBannerProps) {
  const activePromotion = promotions[0];

  if (!activePromotion) {
    return (
      <section
        className="hero-banner hero-banner--empty"
        aria-labelledby="home-title"
      >
        <div className="app-container">
          <h1 id="home-title">Vinyl Vault</h1>
          <p className="empty-state">
            No featured release is available right now.
          </p>
        </div>
      </section>
    );
  }

  const hasMultiplePromotions = promotions.length > 1;

  return (
    <section className="hero-banner" aria-labelledby="home-title">
      <img
        className="hero-banner__background"
        src={activePromotion.backgroundSrc}
        alt=""
        aria-hidden="true"
      />
      <div className="app-container hero-banner__inner">
        <div className="hero-banner__copy">
          <div className="hero-banner__marks" aria-label="Aphex Twin and Warp">
            {activePromotion.eyebrowMarks.map((mark) => (
              <LabelMark key={mark} type={mark} />
            ))}
          </div>
          <h1 className="hero-banner__title" id="home-title">
            {activePromotion.title}
            <span>{activePromotion.releaseLine}</span>
          </h1>
          <p className="hero-banner__description">
            {activePromotion.description}
          </p>
          <Link
            className="hero-banner__cta"
            to={routes.album(activePromotion.albumSlug)}
          >
            {activePromotion.ctaLabel}
            <span aria-hidden="true" />
          </Link>
        </div>

        <div className="hero-banner__visual">
          <img
            className="hero-banner__artwork"
            src={activePromotion.artworkSrc}
            alt={activePromotion.artworkAlt}
            width="600"
            height="600"
          />
        </div>

        {hasMultiplePromotions ? (
          <div
            className="hero-banner__indicators"
            aria-label="Featured release slides"
          >
            {promotions.map((promotion, index) => (
              <button
                className="hero-banner__indicator"
                type="button"
                aria-label={`Show ${promotion.title}`}
                aria-current={index === 0 ? 'true' : undefined}
                key={promotion.id}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
