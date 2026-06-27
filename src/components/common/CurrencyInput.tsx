import React, { useState, useEffect } from 'react';

export interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'defaultValue'> {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number | undefined) => void;
  hasError?: boolean;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, defaultValue, onChange, hasError, className = '', ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState<string>('');
    const [internalValue, setInternalValue] = useState<number | undefined>(defaultValue);

    const formatINR = (val: number | undefined) => {
      if (val === undefined || isNaN(val)) return '';
      return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(val);
    };

    useEffect(() => {
      if (value !== undefined) {
        setDisplayValue(formatINR(value));
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawString = e.target.value.replace(/[^0-9.]/g, '');
      const numValue = rawString ? parseFloat(rawString) : undefined;

      setDisplayValue(e.target.value);
      setInternalValue(numValue);
      onChange?.(numValue);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const valToFormat = value !== undefined ? value : internalValue;
      setDisplayValue(formatINR(valToFormat));
      props.onBlur?.(e);
    };

    return (
      <input
        ref={ref}
        type="text"
        value={value !== undefined ? (displayValue || formatINR(value)) : displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition-colors ${
          hasError ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
    );
  }
);
CurrencyInput.displayName = 'CurrencyInput';
