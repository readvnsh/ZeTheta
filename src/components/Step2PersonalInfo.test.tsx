import {
  render, screen, fireEvent,
} from '@testing-library/react';
import Step2PersonalInfo from './Step2PersonalInfo';
import useFormStore from '../store/formStore';

describe('Step2PersonalInfo', () => {
  beforeEach(() => {
    useFormStore.getState().resetForm();
  });

  it('renders Step 2 fields correctly', () => {
    render(<Step2PersonalInfo />);

    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/father's name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mother's name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/marital status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^mobile number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/alternate mobile/i)).toBeInTheDocument();
  });

  it('validates invalid special characters in names', async () => {
    render(<Step2PersonalInfo />);

    const fullNameInput = screen.getByLabelText(/full name/i);
    fireEvent.change(fullNameInput, { target: { value: 'John@Doe' } });

    const form = document.getElementById('step2-form');
    fireEvent.submit(form!);

    expect(await screen.findByText('Full name can only contain alphabetic characters, spaces, and periods')).toBeInTheDocument();
  });

  it('validates primary and alternate mobile numbers being different', async () => {
    render(<Step2PersonalInfo />);

    const mobileInput = screen.getByLabelText(/^mobile number/i);
    const altMobileInput = screen.getByLabelText(/alternate mobile/i);

    fireEvent.change(mobileInput, { target: { value: '9876543210' } });
    fireEvent.change(altMobileInput, { target: { value: '9876543210' } });

    const form = document.getElementById('step2-form');
    fireEvent.submit(form!);

    expect(await screen.findByText('Alternate mobile number must differ from primary mobile number')).toBeInTheDocument();
  });

  it('validates age is between 21 and 65 years', async () => {
    render(<Step2PersonalInfo />);

    const dobInput = screen.getByLabelText(/date of birth/i);
    // Set age too young (e.g. today's date minus 10 years)
    const tooYoungDate = new Date();
    tooYoungDate.setFullYear(tooYoungDate.getFullYear() - 10);
    const dateStr = tooYoungDate.toISOString().split('T')[0];

    fireEvent.change(dobInput, { target: { value: dateStr } });

    const form = document.getElementById('step2-form');
    fireEvent.submit(form!);

    expect(await screen.findByText('Age must be between 21 and 65 years')).toBeInTheDocument();
  });

  it('validates Age + (Loan Tenure in Years) <= 65 rule', async () => {
    // Set step1Data to have a tenure of 240 months (20 years)
    useFormStore.getState().setStep1Data({
      loanType: 'Home',
      loanAmount: 500000,
      loanTenure: 240, // 20 years
      loanPurpose: 'Home construction',
      referralCode: '',
    });

    render(<Step2PersonalInfo />);

    const dobInput = screen.getByLabelText(/date of birth/i);
    // Set age to 50 (50 + 20 = 70, which is > 65)
    const age50Date = new Date();
    age50Date.setFullYear(age50Date.getFullYear() - 50);
    const dateStr = age50Date.toISOString().split('T')[0];

    fireEvent.change(dobInput, { target: { value: dateStr } });

    const form = document.getElementById('step2-form');
    fireEvent.submit(form!);

    expect(await screen.findByText(/Combined Age \(50\) and Loan Tenure \(20.0 years\) must not exceed 65 years/i)).toBeInTheDocument();
  });
});
