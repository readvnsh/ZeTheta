import { render, screen } from '@testing-library/react';
import MainLayout from './MainLayout';

describe('MainLayout', () => {
  it('renders the layout with navigation buttons', () => {
    render(<MainLayout />);
    // Check if the Next and Back buttons are in the document
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled(); // Should be disabled initially
  });
});
