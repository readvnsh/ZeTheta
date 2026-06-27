import React from 'react';

export interface RadioGroupProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  options: { label: string; value: string }[];
  name: string;
  orientation?: 'vertical' | 'horizontal';
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  defaultValue?: string;
}

export const RadioGroup = React.forwardRef<HTMLInputElement, RadioGroupProps>(
  ({ options, name, orientation = 'vertical', className = '', onChange, value, defaultValue, ...props }, ref) => {
    return (
      <fieldset className={`flex gap-3 ${orientation === 'vertical' ? 'flex-col' : 'flex-row'} ${className}`} {...props}>
        {options.map((option, index) => (
          <label key={option.value} className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              ref={index === 0 ? ref : undefined}
              onChange={onChange}
              checked={value !== undefined ? value === option.value : undefined}
              defaultChecked={defaultValue !== undefined ? defaultValue === option.value : undefined}
              className="text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            {option.label}
          </label>
        ))}
      </fieldset>
    );
  }
);
RadioGroup.displayName = 'RadioGroup';
