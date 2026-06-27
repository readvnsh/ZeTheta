import React from 'react';
import { ErrorMessage } from './ErrorMessage';

// Input Wrapper
export interface InputProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Input({ children, className = '', ...props }: InputProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`} {...props}>
      {children}
    </div>
  );
}

// Input Label
export interface InputLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

Input.Label = function InputLabel({ children, className = '', ...props }: InputLabelProps) {
  return (
    /* eslint-disable-next-line jsx-a11y/label-has-associated-control */
    <label className={`text-sm font-medium text-gray-700 ${className}`} {...props}>
      {children}
    </label>
  );
};

// Input Field
export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

Input.Field = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ className = '', hasError, ...props }, ref) => (
    <input
      ref={ref}
      className={`border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors ${
        hasError ? 'border-red-500' : 'border-gray-300'
      } ${className}`}
      {...props}
    />
  ),
);
Input.Field.displayName = 'Input.Field';

// Input Error
Input.Error = ErrorMessage;

// Input Help Text
export interface InputHelpTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

Input.HelpText = function InputHelpText({ children, className = '', ...props }: InputHelpTextProps) {
  return (
    <p className={`text-xs text-gray-500 ${className}`} {...props}>
      {children}
    </p>
  );
};
