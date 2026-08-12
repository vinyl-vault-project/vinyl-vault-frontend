import {
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import authModalBackground from '../../../assets/vinyl-vault/auth-modal-background.png';
import {
  closeAuthModal,
  isDemoAccountEmail,
  mockLogin,
  mockRegister,
  setAuthModalMode,
  useAuthModalState,
} from '../../../state/auth';
import './AuthModal.scss';

interface AuthFormValues {
  email: string;
  name: string;
  password: string;
}

const initialValues: AuthFormValues = {
  email: '',
  name: '',
  password: '',
};

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidGmail(email: string) {
  return /^[^\s@]+@gmail\.com$/i.test(email.trim());
}

export function AuthModal() {
  const modalState = useAuthModalState();

  if (!modalState.isOpen) {
    return null;
  }

  return <AuthModalDialog key={`${modalState.context}-${modalState.mode}`} />;
}

function AuthModalDialog() {
  const modalState = useAuthModalState();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof AuthFormValues, string>>>(
    {},
  );
  const [statusMessage, setStatusMessage] = useState('');
  const titleId = useId();
  const messageId = useId();

  useEffect(() => {
    if (!modalState.isOpen) {
      return;
    }

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.requestAnimationFrame(() => {
      getFocusableElements(dialogRef.current)[0]?.focus();
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeAuthModal();
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusableElements = getFocusableElements(dialogRef.current);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

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
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    };
  }, [modalState.isOpen]);

  const isLoginMode = modalState.mode === 'login';
  const isRegisterMode = modalState.mode === 'register';
  const isResetMode = modalState.mode === 'reset-password';
  const subtitle = isResetMode
    ? 'Write your mail'
    : isRegisterMode
      ? 'Register and start your story'
      : 'Log in to your account';
  const actionLabel = isResetMode ? 'send' : 'Continue';

  function handleChange(field: keyof AuthFormValues, value: string) {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
    setStatusMessage('');
  }

  function validateForm() {
    const nextErrors: Partial<Record<keyof AuthFormValues, string>> = {};

    if (isRegisterMode && values.name.trim().length === 0) {
      nextErrors.name = 'Enter your name';
    }

    if (!values.email.trim()) {
      nextErrors.email = 'Enter your email';
    } else if (isResetMode && !isValidGmail(values.email)) {
      nextErrors.email = 'Enter a valid Gmail address';
    } else if (!isValidEmail(values.email)) {
      nextErrors.email = 'Email is entered incorrectly';
    }

    if (!isResetMode && values.password.trim().length < 6) {
      nextErrors.password = 'Use at least 6 characters';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (isResetMode) {
      if (!isDemoAccountEmail(values.email)) {
        setErrors({
          email: 'No account was found for this email. Please register.',
        });
        setStatusMessage('');
        return;
      }

      setStatusMessage('Instructions have been sent to your email.');
      return;
    }

    if (isRegisterMode) {
      mockRegister({ email: values.email, name: values.name });
    } else {
      const didLogin = mockLogin({
        email: values.email,
        password: values.password,
      });

      if (!didLogin) {
        setStatusMessage('Email or password is incorrect.');
        return;
      }
    }

    closeAuthModal();
  }

  function handleBack() {
    if (isLoginMode) {
      closeAuthModal();
      return;
    }

    setAuthModalMode('login');
  }

  function handleDialogKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' && event.target instanceof HTMLButtonElement) {
      event.currentTarget.focus();
    }
  }

  return (
    <div
      className="auth-modal"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeAuthModal();
        }
      }}
    >
      <section
        className={`auth-modal__dialog auth-modal__dialog--${modalState.mode}`}
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={modalState.message ? messageId : undefined}
        style={{ '--auth-modal-bg': `url(${authModalBackground})` } as React.CSSProperties}
        onKeyDown={handleDialogKeyDown}
      >
        <button className="auth-modal__back" type="button" onClick={handleBack}>
          <BackIcon />
          <span className="visually-hidden">
            {isLoginMode ? 'Close authentication modal' : 'Back to login'}
          </span>
        </button>

        <form className="auth-modal__form" noValidate onSubmit={handleSubmit}>
          <div className="auth-modal__heading">
            <h2 id={titleId}>
              <strong>Welcome to</strong> Vinyl Vault
            </h2>
            <p>{subtitle}</p>
          </div>

          {modalState.message ? (
            <p className="auth-modal__context-message" id={messageId}>
              {modalState.message}
            </p>
          ) : null}

          <div className="auth-modal__fields">
            {isRegisterMode ? (
              <AuthField
                id="auth-name"
                label="Name"
                value={values.name}
                placeholder="Jonny"
                error={errors.name}
                onChange={(value) => handleChange('name', value)}
              />
            ) : null}
            <AuthField
              id="auth-email"
              label="Enter your email"
              type="email"
              value={values.email}
              placeholder="Example.@gmail.com"
              error={errors.email}
              onChange={(value) => handleChange('email', value)}
            />
            {!isResetMode ? (
              <AuthField
                id="auth-password"
                label="Keep a password"
                type="password"
                value={values.password}
                placeholder="Password228"
                error={errors.password}
                onChange={(value) => handleChange('password', value)}
              />
            ) : null}
          </div>

          <button className="auth-modal__submit" type="submit">
            {actionLabel}
            <ArrowIcon />
          </button>

          {statusMessage ? (
            <p className="auth-modal__status" aria-live="polite">
              {statusMessage}
            </p>
          ) : null}

          {isResetMode && errors.email ? (
            <div className="auth-modal__links auth-modal__links--compact">
              <button type="button" onClick={() => setAuthModalMode('register')}>
                Register now
              </button>
            </div>
          ) : null}

          {isLoginMode ? (
            <div className="auth-modal__links">
              <button
                type="button"
                onClick={() => setAuthModalMode('reset-password')}
              >
                Forgot your password? Let's fix it
              </button>
              <button type="button" onClick={() => setAuthModalMode('register')}>
                Don't have an account? Create one now
              </button>
            </div>
          ) : null}

          {isRegisterMode ? (
            <div className="auth-modal__links">
              <button type="button" onClick={() => setAuthModalMode('login')}>
                Already have an account? Log in
              </button>
            </div>
          ) : null}
        </form>
      </section>
    </div>
  );
}

interface AuthFieldProps {
  error?: string;
  id: string;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  value: string;
}

function AuthField({
  error,
  id,
  label,
  onChange,
  placeholder,
  type = 'text',
  value,
}: AuthFieldProps) {
  return (
    <label className="auth-field">
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
