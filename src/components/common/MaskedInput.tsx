import React, { useState } from 'react';

export interface MaskedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  hasError?: boolean;
}

export const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({
    value, defaultValue, onChange, hasError, className = '', onFocus, onBlur, ...props
  }, ref) => {
    const [internalValue, setInternalValue] = useState<string>(defaultValue || '');
    const [isFocused, setIsFocused] = useState(false);

    const currentVal = value !== undefined ? value : internalValue;

    const maskValue = (val: string) => {
      if (!val || val.length <= 4) return val;
      return '*'.repeat(val.length - 4) + val.slice(-4);
    };

    const displayValue = isFocused ? currentVal : maskValue(currentVal);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVal = e.target.value;
      setInternalValue(newVal);
      onChange?.(newVal);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <input
        ref={ref}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition-colors ${
          hasError ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
    );
  },
);
MaskedInput.displayName = 'MaskedInput';
