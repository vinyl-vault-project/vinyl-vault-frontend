import { type CSSProperties, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { cancelOrder, getOrder } from '../../api/orders.api';
import type { OrderDto } from '../../api/api.types';
import { routes } from '../../app/routes';
import accountBackground from '../../assets/vinyl-vault/account-library-shelf-turntable-headphones.png';
import { Footer } from '../../components/layout/Footer/Footer';
import { Header } from '../../components/layout/Header/Header';
import { useAuthState } from '../../state/auth';
import './OrderDetailsPage.scss';

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 5-7 7 7 7" />
    </svg>
  );
}
function formatPrice(price: string) {
  return price;
}

export function OrderDetailsPage() {
  const { orderId = '' } = useParams();
  const navigate = useNavigate();
  const auth = useAuthState();
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate(routes.home, { replace: true });
      return;
    }
    let active = true;
    void getOrder(orderId)
      .then((next) => {
        if (active) setOrder(next);
      })
      .catch((reason: unknown) => {
        if (active)
          setError(
            reason instanceof Error
              ? reason.message
              : 'Order could not be loaded.',
          );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [auth.isAuthenticated, navigate, orderId]);
  if (!auth.isAuthenticated) return null;
  async function handleCancelOrder() {
    if (!order || order.status.toUpperCase() !== 'PENDING') return;
    setIsCancelling(true);
    try {
      setOrder(await cancelOrder(order.order_number));
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'Order could not be cancelled.',
      );
    } finally {
      setIsCancelling(false);
    }
  }
  const shipping = order?.checkout_data;
  return (
    <>
      <main
        className="order-details-page"
        style={
          { '--order-details-bg': `url(${accountBackground})` } as CSSProperties
        }
      >
        <Header />
        <section className="app-container order-details-page__content">
          <Link className="order-details-page__back" to={routes.account}>
            <ChevronIcon />
            Back
          </Link>
          {isLoading ? <p>Loading order…</p> : null}
          {!isLoading && (!order || error) ? (
            <>
              <h1>Order not found</h1>
              <p>{error || 'This order is not available.'}</p>
            </>
          ) : null}
          {order ? (
            <>
              <div className="order-details-page__heading">
                <div>
                  <div className="order-details-page__title-row">
                    <h1>Order {order.order_number}</h1>
                    <span
                      className={`order-details-page__status order-details-page__status--${order.status.toLowerCase()}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p>{new Date(order.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="order-details-page__divider" />
              <section aria-labelledby="order-items-title">
                <h2 id="order-items-title">
                  Items ({order.line_items_count ?? order.items?.length ?? 0})
                </h2>
                <div className="order-details-page__items">
                  {(order.items ?? []).map((item) => (
                    <article className="order-details-page__item" key={item.id}>
                      <img
                        src={item.product.release.cover_url || ''}
                        width="184"
                        height="184"
                        alt={`${item.product.release.title} cover`}
                      />
                      <div className="order-details-page__item-copy">
                        <strong>
                          {item.product.release.artists[0]?.name ||
                            'Unknown artist'}
                        </strong>
                        <h3>{item.product.release.title}</h3>
                        <p>
                          {item.product.release.release_year} •{' '}
                          {item.product.pressing_country || ''}
                        </p>
                      </div>
                      <div className="order-details-page__item-price">
                        <span>{formatPrice(item.subtotal)}</span>
                        <small>{String(item.quantity).padStart(2, '0')}</small>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
              <section
                className="order-details-page__summary"
                aria-labelledby="order-summary-title"
              >
                <h2 id="order-summary-title">Order summary</h2>
                <div className="order-details-page__summary-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal || order.total)}</span>
                </div>
                <div className="order-details-page__summary-row order-details-page__summary-row--total">
                  <strong>Total</strong>
                  <strong>{formatPrice(order.total)}</strong>
                </div>
              </section>
              {shipping ? (
                <section
                  className="order-details-page__shipping"
                  aria-labelledby="shipping-title"
                >
                  <h2 id="shipping-title">Shipping details</h2>
                  <p>
                    {shipping.first_name} {shipping.last_name}
                  </p>
                  <p>{shipping.phone}</p>
                  <p>{shipping.email}</p>
                  <p>{shipping.shipping_address}</p>
                  <p>
                    {shipping.postal_code} {shipping.city}
                  </p>
                  <p>{shipping.country}</p>
                </section>
              ) : null}
              {order.status.toUpperCase() === 'PENDING' ? (
                <button
                  className="order-details-page__cancel"
                  type="button"
                  disabled={isCancelling}
                  onClick={() => void handleCancelOrder()}
                >
                  {isCancelling ? 'Cancelling…' : 'Cancel order'}
                </button>
              ) : null}
            </>
          ) : null}
        </section>
      </main>
      <Footer />
    </>
  );
}
