import React from 'react';

export interface ErrorMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode;
}

export const ErrorMessage = React.forwardRef<HTMLParagraphElement, ErrorMessageProps>(
  ({ children, className = '', ...props }, ref) => {
    if (!children) return null;

    return (
      <p
        ref={ref}
        aria-live="polite"
        role="alert"
        className={`text-sm text-red-600 mt-1 ${className}`}
        {...props}
      >
        {children}
      </p>
    );
  }
);

ErrorMessage.displayName = 'ErrorMessage';
