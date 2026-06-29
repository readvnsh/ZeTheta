import React from 'react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
  hasError?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({
    label, className = '', hasError, id, ...props
  }, ref) => {
    const defaultId = React.useId();
    const inputId = id || defaultId;

    return (
      <label
        htmlFor={inputId}
        className={`flex items-center gap-2 text-sm cursor-pointer min-h-[44px] py-1 ${className}`}
      >
        <input
          type="checkbox"
          id={inputId}
          ref={ref}
          className={`rounded text-blue-600 focus:ring-blue-500 w-4 h-4 ${
            hasError ? 'border-red-500' : 'border-gray-300'
          }`}
          {...props}
        />
        <span>{label}</span>
      </label>
    );
  },
);
Checkbox.displayName = 'Checkbox';
