import clsx from 'clsx';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import { Spinner } from '../Spinner/Spinner';
import styles from './Button.module.scss';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: IconName;
  iconPosition?: 'start' | 'end';
  fullWidth?: boolean;
  /** Icon-only button — requires `aria-label`. */
  iconOnly?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    iconPosition = 'start',
    fullWidth,
    iconOnly,
    disabled,
    className,
    children,
    type = 'button',
    ...props
  },
  ref,
) {
  const iconSize = size === 'sm' ? 16 : 18;
  const iconNode = loading ? (
    <Spinner size={iconSize} />
  ) : (
    icon && <Icon name={icon} size={iconSize} />
  );

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={clsx(
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        iconOnly && styles.iconOnly,
        className,
      )}
      {...props}
    >
      {iconPosition === 'start' && iconNode}
      {!iconOnly && children && <span>{children}</span>}
      {iconPosition === 'end' && iconNode}
    </button>
  );
});
