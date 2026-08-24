import { useEffect, useState, type CSSProperties } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { routes } from '../../app/routes';
import { Footer } from '../../components/layout/Footer/Footer';
import { Header } from '../../components/layout/Header/Header';
import accountBackground from '../../assets/vinyl-vault/account-library-shelf-turntable-headphones.png';
import { getAccountOrder, type OrderStatus } from '../../data/accountLibrary';
import { useAuthState } from '../../state/auth';
import './OrderDetailsPage.scss';

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 5-7 7 7 7" />
    </svg>
  );
}

function formatPrice(price: number) {
  return `$${price.toFixed(2)}`;
}

export function OrderDetailsPage() {
  const { orderId = '' } = useParams();
  const navigate = useNavigate();
  const auth = useAuthState();
  const order = getAccountOrder(orderId);
  const [cancelledOrderIds, setCancelledOrderIds] = useState<string[]>([]);
  const status: OrderStatus | null = order
    ? cancelledOrderIds.includes(order.id)
      ? 'cancelled'
      : order.status
    : null;

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate(routes.home, { replace: true });
    }
  }, [auth.isAuthenticated, navigate]);

  if (!auth.isAuthenticated) {
    return null;
  }

  if (!order || !status) {
    return (
      <>
        <main
          className="order-details-page"
          style={{ '--order-details-bg': `url(${accountBackground})` } as CSSProperties}
        >
          <Header showSearchOnMobile={false} />
          <section className="app-container order-details-page__content">
            <Link className="order-details-page__back" to={routes.account}>
              <ChevronIcon />
              Back
            </Link>
            <h1>Order not found</h1>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  function handleCancelOrder() {
    if (!order || status !== 'pending') {
      return;
    }

    setCancelledOrderIds((currentIds) => [...currentIds, order.id]);
  }

  return (
    <>
      <main
        className="order-details-page"
        style={{ '--order-details-bg': `url(${accountBackground})` } as CSSProperties}
      >
        <Header showSearchOnMobile={false} />
        <section className="app-container order-details-page__content">
          <Link className="order-details-page__back" to={routes.account}>
            <ChevronIcon />
            Back
          </Link>

          <div className="order-details-page__heading">
            <div>
              <div className="order-details-page__title-row">
                <h1>Order {order.number}</h1>
                <span
                  className={`order-details-page__status order-details-page__status--${status}`}
                >
                  {status === 'pending' ? 'Pending' : 'Cancelled'}
                </span>
              </div>
              <p>{order.dateTime}</p>
            </div>
          </div>

          <div className="order-details-page__divider" />

          <section aria-labelledby="order-items-title">
            <h2 id="order-items-title">Items ({order.items.length})</h2>
            <div className="order-details-page__items">
              {order.items.map((item) => (
                <article className="order-details-page__item" key={item.albumId}>
                  <img
                    src={item.album.coverSrc}
                    width="184"
                    height="184"
                    alt={item.album.coverAlt}
                  />
                  <div className="order-details-page__item-copy">
                    <strong>{item.album.artist}</strong>
                    <h3>{item.album.title}</h3>
                    <p>
                      {item.album.filterMetadata.releaseYear} • {item.format} •{' '}
                      {item.label}
                    </p>
                  </div>
                  <div className="order-details-page__item-price">
                    <span>{formatPrice(item.unitPrice * item.quantity)}</span>
                    <small>{String(item.quantity).padStart(2, '0')}</small>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="order-details-page__summary" aria-labelledby="order-summary-title">
            <h2 id="order-summary-title">Order summary</h2>
            <div className="order-details-page__summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(order.total)}</span>
            </div>
            <div className="order-details-page__summary-row order-details-page__summary-row--total">
              <strong>Total</strong>
              <strong>{formatPrice(order.total)}</strong>
            </div>
          </section>

          <section className="order-details-page__shipping" aria-labelledby="shipping-title">
            <h2 id="shipping-title">Shipping details</h2>
            <p>{order.shipping.name}</p>
            <p>{order.shipping.phone}</p>
            <p>{order.shipping.email}</p>
            <p>{order.shipping.address}</p>
            <p>
              {order.shipping.postalCode} {order.shipping.city}
            </p>
            <p>{order.shipping.country}</p>
          </section>

          {status === 'pending' ? (
            <button
              className="order-details-page__cancel"
              type="button"
              onClick={handleCancelOrder}
            >
              Cancel order
            </button>
          ) : null}
        </section>
      </main>
      <Footer />
    </>
  );
}
