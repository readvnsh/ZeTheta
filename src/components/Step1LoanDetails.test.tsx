import {
  render, screen, fireEvent,
} from '@testing-library/react';
import Step1LoanDetails from './Step1LoanDetails';
import useFormStore from '../store/formStore';

describe('Step1LoanDetails', () => {
  beforeEach(() => {
    useFormStore.getState().resetForm();
  });

  it('renders Step 1 fields correctly', () => {
    render(<Step1LoanDetails />);

    expect(screen.getByText('Loan Details')).toBeInTheDocument();
    expect(screen.getByText('Personal Loan')).toBeInTheDocument();
    expect(screen.getByText('Home Loan')).toBeInTheDocument();
    expect(screen.getByText('Business Loan')).toBeInTheDocument();
    expect(screen.getByLabelText(/loan amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/loan tenure/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/loan purpose/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/referral code/i)).toBeInTheDocument();
  });

  it('validates required fields and shows errors', async () => {
    render(<Step1LoanDetails />);

    // Clear and trigger submit
    const form = document.getElementById('step1-form');
    fireEvent.submit(form!);

    expect(await screen.findByText('Loan purpose is required')).toBeInTheDocument();
  });

  it('shows error for invalid referral code', async () => {
    render(<Step1LoanDetails />);

    const referralInput = screen.getByLabelText(/referral code/i);
    fireEvent.change(referralInput, { target: { value: 'short' } });

    const form = document.getElementById('step1-form');
    fireEvent.submit(form!);

    expect(await screen.findByText('Referral code must be 6-10 alphanumeric characters')).toBeInTheDocument();
  });
});
