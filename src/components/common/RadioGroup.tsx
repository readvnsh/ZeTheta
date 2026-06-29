import React from 'react';

export interface RadioGroupProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, 'onChange'> {
  options: { label: string; value: string }[];
  name: string;
  orientation?: 'vertical' | 'horizontal';
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  defaultValue?: string;
}

export const RadioGroup = React.forwardRef<HTMLInputElement, RadioGroupProps>(
  ({
    options, name, orientation = 'vertical', className = '', onChange, value, defaultValue, id, ...props
  }, ref) => {
    const defaultId = React.useId();
    const groupId = id || defaultId;

    return (
      <fieldset
        className={`flex gap-3 ${orientation === 'vertical' ? 'flex-col' : 'flex-row'} ${className}`}
        {...props}
      >
        {options.map((option, index) => {
          const optionId = `${groupId}-${option.value}`;
          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className="flex items-center gap-2 text-sm cursor-pointer min-h-[44px] py-1"
            >
              <input
                type="radio"
                id={optionId}
                name={name}
                value={option.value}
                ref={index === 0 ? ref : undefined}
                onChange={onChange}
                checked={value !== undefined ? value === option.value : undefined}
                defaultChecked={
                  defaultValue !== undefined ? defaultValue === option.value : undefined
                }
                className="text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              {option.label}
            </label>
          );
        })}
      </fieldset>
    );
  },
);
RadioGroup.displayName = 'RadioGroup';
