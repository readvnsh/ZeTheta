import { render, screen } from '@testing-library/react';
import { ErrorMessage } from '../ErrorMessage';
import React from 'react';

describe('ErrorMessage', () => {
  it('renders children with correct ARIA attributes', () => {
    render(<ErrorMessage>This is an error</ErrorMessage>);
    const element = screen.getByText('This is an error');
    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('aria-live', 'polite');
    expect(element).toHaveAttribute('role', 'alert');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLParagraphElement>();
    render(<ErrorMessage ref={ref}>Error</ErrorMessage>);
    expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
  });
});
