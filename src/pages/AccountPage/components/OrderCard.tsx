import { Link } from 'react-router';

import { routes } from '../../../app/routes';
import type { AccountOrderSummary } from '../../../data/accountLibrary';

interface OrderCardProps {
  order: AccountOrderSummary;
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

export function OrderCard({ order }: OrderCardProps) {
  const itemCount = order.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <article className="account-page__order-card">
      <div className="account-page__order-heading">
        <div>
          <h3>Order {order.number}</h3>
          <p>{order.date}</p>
        </div>
        <span
          className={`account-page__status-badge account-page__status-badge--${order.status}`}
        >
          {order.status === 'pending' ? 'Pending' : 'Cancelled'}
        </span>
      </div>

      <div className="account-page__order-items">
        {order.items.map((item) => (
          <div className="account-page__order-item" key={item.albumId}>
            <Link
              to={routes.album(item.album.slug)}
              aria-label={`Open ${item.album.artist} - ${item.album.title}`}
            >
              <img
                src={item.album.coverSrc}
                width="240"
                height="240"
                alt={item.album.coverAlt}
              />
            </Link>
            <span>{String(item.quantity).padStart(2, '0')}</span>
          </div>
        ))}
      </div>

      <div className="account-page__order-summary">
        <span>{itemCount} items</span>
        <strong>Total: ${order.total.toFixed(2)}</strong>
      </div>

      <Link
        className="account-page__order-link"
        to={routes.accountOrder(order.id)}
        aria-label={`View details for order ${order.number}`}
      >
        <span>View order</span>
        <ChevronIcon />
      </Link>
    </article>
  );
}
