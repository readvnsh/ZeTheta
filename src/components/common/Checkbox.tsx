import React from 'react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
  hasError?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = '', hasError, ...props }, ref) => {
    return (
      <label className={`flex items-center gap-2 text-sm cursor-pointer ${className}`}>
        <input
          type="checkbox"
          ref={ref}
          className={`rounded text-blue-600 focus:ring-blue-500 w-4 h-4 ${
            hasError ? 'border-red-500' : 'border-gray-300'
          }`}
          {...props}
        />
        <span>{label}</span>
      </label>
    );
  }
);
Checkbox.displayName = 'Checkbox';
