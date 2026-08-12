import {
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link, useSearchParams } from 'react-router';

import { routes } from '../../app/routes';
import cartBackground from '../../assets/vinyl-vault/cart-packing-desk-background.png';
import { Footer } from '../../components/layout/Footer/Footer';
import { Header } from '../../components/layout/Header/Header';
import { CatalogFilter } from '../../components/ui/CatalogFilter/CatalogFilter';
import {
  type CatalogFilters,
  defaultCatalogFilters,
} from '../../features/home/home.filters';
import { openAuthModal, useAuthState } from '../../state/auth';
import {
  decreaseCartItem,
  getCartAlbumItems,
  getCartItemCount,
  getCartTotal,
  increaseCartItem,
  useCartItems,
} from '../../state/cart';
import './CartPage.scss';

interface ShippingFormValues {
  city: string;
  country: string;
  email: string;
  name: string;
  phone: string;
  postalCode: string;
  streetAddress: string;
  surname: string;
}

const initialShippingValues: ShippingFormValues = {
  city: '',
  country: '',
  email: '',
  name: '',
  phone: '',
  postalCode: '',
  streetAddress: '',
  surname: '',
};

const requiredShippingFields: Array<keyof ShippingFormValues> = [
  'name',
  'surname',
  'email',
  'phone',
  'streetAddress',
  'city',
  'postalCode',
  'country',
];

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  }).format(price);
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function CartPage() {
  const cartItems = useCartItems();
  const auth = useAuthState();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCatalogFilterOpen, setIsCatalogFilterOpen] = useState(false);
  const [catalogFilterSession, setCatalogFilterSession] = useState(0);
  const [appliedFilters, setAppliedFilters] = useState(defaultCatalogFilters);
  const albumItems = useMemo(() => getCartAlbumItems(cartItems), [cartItems]);
  const cartItemCount = getCartItemCount(cartItems);
  const total = getCartTotal(cartItems);
  const isCheckoutOpen = searchParams.get('checkout') === 'true';
  const catalogFilterId = 'cart-page-catalog-filter';

  function openCheckout() {
    if (cartItems.length === 0) {
      return;
    }

    if (!auth.isAuthenticated) {
      openAuthModal({
        context: 'checkout',
        message: 'To complete your purchase, please log in or create an account.',
        mode: 'login',
      });
      return;
    }

    setSearchParams({ checkout: 'true' });
  }

  function closeCheckout() {
    setSearchParams({});
  }

  function handleCatalogFilterToggle() {
    setIsCatalogFilterOpen((currentState) => {
      if (!currentState) {
        setCatalogFilterSession((currentSession) => currentSession + 1);
      }

      return !currentState;
    });
  }

  function handleCatalogFilterApply(nextFilters: CatalogFilters) {
    setAppliedFilters(nextFilters);
    setIsCatalogFilterOpen(false);
  }

  return (
    <>
      <main
        className="cart-page"
        style={{ '--cart-page-bg': `url(${cartBackground})` } as CSSProperties}
      >
        <Header
          cartItemCount={cartItemCount}
          filterPanelId={catalogFilterId}
          isFilterOpen={isCatalogFilterOpen}
          onFilterToggle={handleCatalogFilterToggle}
          searchQuery="Electronic music"
        />
        <CatalogFilter
          key={catalogFilterSession}
          id={catalogFilterId}
          isOpen={isCatalogFilterOpen}
          appliedFilters={appliedFilters}
          onApply={handleCatalogFilterApply}
          onClose={() => setIsCatalogFilterOpen(false)}
        />
        <section className="app-container cart-page__content" aria-labelledby="cart-title">
          <h1 id="cart-title">Cart</h1>

          {albumItems.length > 0 ? (
            <div className="cart-page__items">
              {albumItems.map((item) => (
                <article className="cart-page__item" key={item.albumId}>
                  <Link
                    className="cart-page__cover-link"
                    to={routes.album(item.album.slug)}
                    aria-label={`Open ${item.album.artist} - ${item.album.title}`}
                  >
                    <img
                      src={item.album.coverSrc}
                      width="252"
                      height="252"
                      alt={item.album.coverAlt}
                    />
                  </Link>
                  <div className="cart-page__item-copy">
                    <Link to={routes.album(item.album.slug)}>{item.album.artist}</Link>
                    <span>{item.album.title}</span>
                    <strong>{item.album.filterMetadata.releaseYear}</strong>
                  </div>
                  <div className="cart-page__item-commerce">
                    <p>
                      {formatPrice(item.unitPrice)}_{item.selectedFormat}
                    </p>
                    <div className="cart-page__quantity" aria-live="polite">
                      <button
                        type="button"
                        aria-label={`Decrease ${item.album.title} quantity`}
                        onClick={() => decreaseCartItem(item.albumId)}
                      >
                        -
                      </button>
                      <span>{String(item.quantity).padStart(2, '0')}</span>
                      <button
                        type="button"
                        aria-label={`Increase ${item.album.title} quantity`}
                        onClick={() => increaseCartItem(item.albumId)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="cart-page__empty" role="status">
              <p>Your cart is empty.</p>
              <Link to={routes.search}>Browse records</Link>
            </div>
          )}

          <section className="cart-page__summary" aria-label="Order summary">
            <div className="cart-page__summary-total" aria-live="polite">
              <span>Subtotal</span>
              <strong>Total: {formatPrice(total)}_VINYL</strong>
            </div>
            <button type="button" disabled={cartItems.length === 0} onClick={openCheckout}>
              Pay and order
            </button>
          </section>
        </section>
      </main>

      {isCheckoutOpen ? <CheckoutModal onClose={closeCheckout} /> : null}
      <Footer />
    </>
  );
}

interface CheckoutModalProps {
  onClose: () => void;
}

function CheckoutModal({ onClose }: CheckoutModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const [values, setValues] = useState(initialShippingValues);
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingFormValues, string>>>({});
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusableElements = getFocusableElements(dialogRef.current);
    focusableElements[0]?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }

      if (event.key !== 'Tab') {
        return;
      }

      const nextFocusableElements = getFocusableElements(dialogRef.current);
      const firstElement = nextFocusableElements[0];
      const lastElement = nextFocusableElements[nextFocusableElements.length - 1];

      if (!firstElement || !lastElement) {
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  function handleChange(field: keyof ShippingFormValues, value: string) {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
    setStatusMessage('');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Partial<Record<keyof ShippingFormValues, string>> = {};

    requiredShippingFields.forEach((field) => {
      if (values[field].trim().length === 0) {
        nextErrors[field] = 'Required field';
      }
    });

    if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      nextErrors.email = 'Use a valid email';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      setStatusMessage('Shipping details are ready for PayPal integration.');
    }
  }

  function handleDialogKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' && event.target instanceof HTMLButtonElement) {
      event.currentTarget.focus();
    }
  }

  return (
    <div
      className="checkout-modal"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="checkout-modal__dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        onKeyDown={handleDialogKeyDown}
      >
        <button className="checkout-modal__back" type="button" onClick={onClose}>
          <BackIcon />
          Back
        </button>

        <form className="checkout-modal__form" noValidate onSubmit={handleSubmit}>
          <div className="checkout-modal__heading">
            <h2 id="checkout-title">Shipping details</h2>
            <p>
              <span>01.</span>
              Personal information
            </p>
          </div>

          <div className="checkout-modal__divider" />
          <div className="checkout-modal__grid checkout-modal__grid--two">
            <Field
              id="shipping-name"
              label="Name"
              placeholder="Enter your name"
              value={values.name}
              error={errors.name}
              onChange={(value) => handleChange('name', value)}
            />
            <Field
              id="shipping-surname"
              label="Surname"
              placeholder="Enter your surname"
              value={values.surname}
              error={errors.surname}
              onChange={(value) => handleChange('surname', value)}
            />
            <Field
              id="shipping-email"
              label="Email address"
              placeholder="hello@example.com"
              type="email"
              value={values.email}
              error={errors.email}
              onChange={(value) => handleChange('email', value)}
            />
            <Field
              id="shipping-phone"
              label="Phone number"
              placeholder="+1 (555) 000-0000"
              type="tel"
              value={values.phone}
              error={errors.phone}
              onChange={(value) => handleChange('phone', value)}
            />
          </div>

          <div className="checkout-modal__heading checkout-modal__heading--section">
            <p>
              <span>02.</span>
              Shipping address
            </p>
          </div>
          <div className="checkout-modal__divider" />
          <div className="checkout-modal__grid">
            <Field
              id="shipping-street"
              label="Street address"
              placeholder="House, street, apartment"
              value={values.streetAddress}
              error={errors.streetAddress}
              onChange={(value) => handleChange('streetAddress', value)}
              wide
            />
            <Field
              id="shipping-city"
              label="City"
              placeholder="City name"
              value={values.city}
              error={errors.city}
              onChange={(value) => handleChange('city', value)}
            />
            <Field
              id="shipping-postal"
              label="Postal / zip code"
              placeholder="00000"
              value={values.postalCode}
              error={errors.postalCode}
              onChange={(value) => handleChange('postalCode', value)}
            />
            <label className="checkout-field checkout-field--wide">
              <span>Country</span>
              <select
                value={values.country}
                aria-invalid={Boolean(errors.country)}
                aria-describedby={errors.country ? 'shipping-country-error' : undefined}
                onChange={(event) => handleChange('country', event.target.value)}
              >
                <option value="">Select country</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Ukraine">Ukraine</option>
                <option value="Canada">Canada</option>
              </select>
              <ChevronDownIcon />
              {errors.country ? (
                <em id="shipping-country-error">{errors.country}</em>
              ) : null}
            </label>
          </div>

          <div className="checkout-modal__actions">
            <p aria-live="polite">{statusMessage}</p>
            <button type="submit">Go to paypal payment</button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface FieldProps {
  error?: string;
  id: string;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  value: string;
  wide?: boolean;
}

function Field({
  error,
  id,
  label,
  onChange,
  placeholder,
  type = 'text',
  value,
  wide = false,
}: FieldProps) {
  return (
    <label className={`checkout-field${wide ? ' checkout-field--wide' : ''}`}>
      <span>{label}</span>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <em id={`${id}-error`}>{error}</em> : null}
    </label>
  );
}

function getFocusableElements(root: HTMLElement | null) {
  if (!root) {
    return [];
  }

  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}
