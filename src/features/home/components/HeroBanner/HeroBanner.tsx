import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';

import { routes } from '../../../../app/routes';
import type { HeroPromotion } from '../../home.types';

interface HeroBannerProps {
  promotions: HeroPromotion[];
}

export function HeroBanner({ promotions }: HeroBannerProps) {
  const activePromotion = promotions[0];
  const slides = activePromotion?.slides ?? [];
  const hasMultipleSlides = slides.length > 1;
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [exitingSlideIndex, setExitingSlideIndex] = useState<number | null>(
    null,
  );
  const transitionTimeoutRef = useRef<number | null>(null);
  const autoplayIntervalRef = useRef<number | null>(null);

  const clearTransitionTimeout = useCallback(() => {
    if (transitionTimeoutRef.current !== null) {
      window.clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
  }, []);

  const showSlide = useCallback(
    (nextSlideIndex: number) => {
      if (nextSlideIndex === activeSlideIndex) {
        return;
      }

      clearTransitionTimeout();
      setExitingSlideIndex(activeSlideIndex);
      setActiveSlideIndex(nextSlideIndex);
      transitionTimeoutRef.current = window.setTimeout(() => {
        setExitingSlideIndex(null);
        transitionTimeoutRef.current = null;
      }, 950);
    },
    [activeSlideIndex, clearTransitionTimeout],
  );

  const showNextSlide = useCallback(() => {
    if (!hasMultipleSlides) {
      return;
    }

    const nextSlideIndex = (activeSlideIndex + 1) % slides.length;
    showSlide(nextSlideIndex);
  }, [activeSlideIndex, hasMultipleSlides, showSlide, slides.length]);

  useEffect(() => {
    if (!hasMultipleSlides) {
      return undefined;
    }

    autoplayIntervalRef.current = window.setInterval(() => {
      showNextSlide();
    }, 5000);

    return () => {
      if (autoplayIntervalRef.current !== null) {
        window.clearInterval(autoplayIntervalRef.current);
        autoplayIntervalRef.current = null;
      }
    };
  }, [hasMultipleSlides, showNextSlide]);
  useEffect(
    () => () => {
      clearTransitionTimeout();

      if (autoplayIntervalRef.current !== null) {
        window.clearInterval(autoplayIntervalRef.current);
      }
    },
    [clearTransitionTimeout],
  );

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
            {activePromotion.brandLogos.map((logo) => (
              <img
                className="hero-banner__mark"
                key={logo.id}
                src={logo.src}
                width="58"
                height="45"
                alt={logo.alt}
              />
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
          <div className="hero-banner__slider-viewport" onClick={showNextSlide}>
            {slides.map((slide, index) => {
              const slideStateClass =
                index === activeSlideIndex
                  ? 'hero-banner__slide--active'
                  : index === exitingSlideIndex
                    ? 'hero-banner__slide--exiting'
                    : 'hero-banner__slide--idle';

              return (
                <img
                  className={`hero-banner__slide ${slideStateClass}`}
                  src={slide.imageSrc}
                  alt={slide.imageAlt}
                  width="600"
                  height="600"
                  key={slide.id}
                />
              );
            })}
          </div>
          <div
            className="hero-banner__indicators"
            aria-label="Featured release slides"
          >
            {slides.map((slide, index) => (
              <button
                className="hero-banner__indicator"
                type="button"
                aria-label={`Show ${slide.imageAlt}`}
                aria-current={index === activeSlideIndex ? 'true' : undefined}
                key={slide.id}
                onClick={() => showSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
