import { render, screen, fireEvent } from '@testing-library/react';
import { CurrencyInput } from '../CurrencyInput';
import React from 'react';

describe('CurrencyInput', () => {
  it('formats display value on blur and unformats on focus', () => {
    render(<CurrencyInput defaultValue={100000} data-testid="currency" />);
    const input = screen.getByTestId('currency');
    
    expect(input).toHaveValue('1,00,000');
    
    fireEvent.change(input, { target: { value: '200000' } });
    expect(input).toHaveValue('200000');
    
    fireEvent.blur(input);
    expect(input).toHaveValue('2,00,000');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<CurrencyInput ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
