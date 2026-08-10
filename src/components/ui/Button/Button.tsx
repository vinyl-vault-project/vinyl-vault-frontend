import { type ButtonHTMLAttributes, type ReactNode } from 'react';

import './Button.scss';

type ButtonVariant = 'primary' | 'compact' | 'wide' | 'text';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
}

export function Button({
  children,
  className,
  type = 'button',
  variant = 'primary',
  ...buttonProps
}: ButtonProps) {
  const classes = ['ui-button', `ui-button--${variant}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} type={type} {...buttonProps}>
      {children}
    </button>
  );
}
