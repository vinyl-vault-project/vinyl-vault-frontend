import { Link } from 'react-router';

import { routes } from '../../../app/routes';
import type { OrderDto } from '../../../api/api.types';

interface OrderCardProps {
  order: OrderDto;
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

export function OrderCard({ order }: OrderCardProps) {
  const itemCount = (order.items || []).reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <article className="account-page__order-card">
      <div className="account-page__order-heading">
        <div>
          <h3>Order {order.order_number}</h3>
          <p>{new Date(order.created_at).toLocaleDateString()}</p>
        </div>
        <span
          className={`account-page__status-badge account-page__status-badge--${order.status}`}
        >
          {order.status}
        </span>
      </div>

      <div className="account-page__order-items">
        {(order.items || []).map((item) => (
          <div className="account-page__order-item" key={item.id}>
            <Link
              to={routes.album(item.product.release.slug)}
              aria-label={`Open ${item.product.release.title}`}
            >
              <img
                src={item.product.release.cover_url || ''}
                width="240"
                height="240"
                alt={`${item.product.release.title} cover`}
              />
            </Link>
            <span>{String(item.quantity).padStart(2, '0')}</span>
          </div>
        ))}
      </div>

      <div className="account-page__order-summary">
        <span>{itemCount} items</span>
        <strong>Total: {order.total}</strong>
      </div>

      <Link
        className="account-page__order-link"
        to={routes.accountOrder(order.order_number)}
        aria-label={`View details for order ${order.order_number}`}
      >
        <span>View order</span>
        <ChevronIcon />
      </Link>
    </article>
  );
}
