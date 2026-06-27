import { render, screen } from '@testing-library/react';
import { Input } from '../Input';
import React from 'react';

describe('Input Compound Component', () => {
  it('renders all compound components correctly', () => {
    render(
      <Input>
        <Input.Label htmlFor="test-input">Label</Input.Label>
        <Input.Field id="test-input" placeholder="Type here..." />
        <Input.Error>Error occurred</Input.Error>
        <Input.HelpText>Helpful text</Input.HelpText>
      </Input>
    );

    expect(screen.getByText('Label')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument();
    expect(screen.getByText('Error occurred')).toBeInTheDocument();
    expect(screen.getByText('Helpful text')).toBeInTheDocument();
  });

  it('forwards ref correctly to the input field', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(
      <Input>
        <Input.Field ref={ref} />
      </Input>
    );
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
