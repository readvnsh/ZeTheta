import { render, screen } from '@testing-library/react';
import MainLayout from './MainLayout';

describe('MainLayout', () => {
  it('renders the layout with navigation buttons', () => {
    render(<MainLayout />);
    // Check if the Next and Back buttons are in the document
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back/i })).toBeDisabled(); // Back button should be disabled initially
    expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled(); // Next button should be enabled initially
  });
});
