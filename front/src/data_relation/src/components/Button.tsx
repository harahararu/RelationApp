'use client';

import { clsx } from 'clsx';
import { forwardRef, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
  className?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', isLoading = false, className, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-500',
    };

    const computedClasses = clsx(
      baseStyles,
      variantStyles[variant],
      isLoading && 'opacity-50 cursor-not-allowed',
      className,
    );

    return (
      <button
        ref={ref}
        className={computedClasses}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <span className="animate-spin mr-2">⟳</span>}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;