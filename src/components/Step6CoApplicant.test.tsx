import {
  render, screen, fireEvent, act,
} from '@testing-library/react';
import Step6CoApplicant from './Step6CoApplicant';
import useFormStore from '../store/formStore';

describe('Step6CoApplicant', () => {
  beforeEach(() => {
    useFormStore.getState().resetForm();
  });

  it('renders Step 6 co-applicant fields correctly', () => {
    render(<Step6CoApplicant />);

    expect(screen.getByText('Co-Applicant Details')).toBeInTheDocument();
    expect(screen.getByLabelText(/co-applicant name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/relationship/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/co-applicant pan/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/co-applicant monthly income/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/consent/i)).toBeInTheDocument();
  });

  it('defaults relationship to Spouse if user is Married', () => {
    useFormStore.getState().setStep2Data({
      fullName: 'John Doe',
      fatherName: 'Father Doe',
      motherName: 'Mother Doe',
      dob: '1995-05-15',
      gender: 'Male',
      maritalStatus: 'Married',
      email: 'john@example.com',
      mobile: '9876543210',
    });

    render(<Step6CoApplicant />);

    const relationSelect = screen.getByLabelText(/relationship/i);
    expect(relationSelect).toHaveValue('Spouse');
  });

  it('does not default relationship if user is not Married', () => {
    useFormStore.getState().setStep2Data({
      fullName: 'John Doe',
      fatherName: 'Father Doe',
      motherName: 'Mother Doe',
      dob: '1995-05-15',
      gender: 'Male',
      maritalStatus: 'Single',
      email: 'john@example.com',
      mobile: '9876543210',
    });

    render(<Step6CoApplicant />);

    const relationSelect = screen.getByLabelText(/relationship/i);
    expect(relationSelect).toHaveValue('');
  });

  it('evaluates dynamic co-applicant routing thresholds correctly', () => {
    const store = useFormStore.getState();

    // Home Loan: always required
    store.setStep1Data({
      loanType: 'Home',
      loanAmount: 100000,
      loanTenure: 120,
      loanPurpose: 'Buy House',
    });
    expect(store.isStep6Required()).toBe(true);

    // Personal Loan <= 5L: not required
    store.setStep1Data({
      loanType: 'Personal',
      loanAmount: 400000,
      loanTenure: 36,
      loanPurpose: 'Personal',
    });
    expect(store.isStep6Required()).toBe(false);

    // Personal Loan > 5L: required
    store.setStep1Data({
      loanType: 'Personal',
      loanAmount: 600000,
      loanTenure: 36,
      loanPurpose: 'Personal',
    });
    expect(store.isStep6Required()).toBe(true);

    // Business Loan <= 20L: not required
    store.setStep1Data({
      loanType: 'Business',
      loanAmount: 1500000,
      loanTenure: 48,
      loanPurpose: 'Business',
    });
    expect(store.isStep6Required()).toBe(false);

    // Business Loan > 20L: required
    store.setStep1Data({
      loanType: 'Business',
      loanAmount: 2500000,
      loanTenure: 48,
      loanPurpose: 'Business',
    });
    expect(store.isStep6Required()).toBe(true);
  });

  it('verifies co-applicant PAN on blur successfully', async () => {
    render(<Step6CoApplicant />);

    const panInput = screen.getByLabelText(/co-applicant pan/i);
    fireEvent.change(panInput, { target: { value: 'ABCPe1234f' } });
    fireEvent.blur(panInput);

    await act(async () => {
      await new Promise((resolve) => { setTimeout(resolve, 1600); });
    });

    expect(await screen.findByText('✓ PAN Verified')).toBeInTheDocument();
  });
});
