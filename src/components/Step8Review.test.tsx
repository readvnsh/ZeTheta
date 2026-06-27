import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import { vi } from 'vitest';
import Step8Review from './Step8Review';
import useFormStore from '../store/formStore';

describe('Step8Review', () => {
  beforeEach(() => {
    useFormStore.getState().resetForm();

    // Mock crypto.randomUUID
    global.crypto.randomUUID = vi.fn(() => '11111111-2222-3333-4444-555555555555');
  });

  it('renders Step 8 summaries correctly', () => {
    const store = useFormStore.getState();
    store.setStep1Data({
      loanType: 'Personal',
      loanAmount: 100000,
      loanTenure: 12,
      loanPurpose: 'Medical',
    });
    store.setStep2Data({
      fullName: 'Vansh Sejpal',
      fatherName: 'Father Sejpal',
      motherName: 'Mother Sejpal',
      dob: '1995-10-10',
      gender: 'Male',
      maritalStatus: 'Single',
      email: 'vansh@example.com',
      mobile: '9876543210',
    });

    render(<Step8Review />);

    expect(screen.getByText('Review & Pre-Approval Summary')).toBeInTheDocument();
    expect(screen.getByText('Medical')).toBeInTheDocument();
    expect(screen.getByText('Vansh Sejpal')).toBeInTheDocument();
  });

  it('enforces 4-point consent gate to enable submit button when DTI is within limits', () => {
    const store = useFormStore.getState();
    store.setStep1Data({
      loanType: 'Personal',
      loanAmount: 50000,
      loanTenure: 12,
      loanPurpose: 'Vacation',
    });
    // Set high income so DTI is low
    store.setStep5Data({
      employmentType: 'SALARIED',
      companyName: 'ZeTheta',
      designation: 'Lead Eng',
      monthlyNetSalary: 150000,
      yearsOfExperience: 5,
    });

    render(<Step8Review />);

    const submitBtn = screen.getByRole('button', { name: /submit loan application/i });
    expect(submitBtn).toBeDisabled();

    // Check all 4 consents
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(4);

    checkboxes.forEach((cb) => fireEvent.click(cb));
    expect(submitBtn).toBeEnabled();
  });

  it('triggers DTI warning and requires 5th checkbox when EMI > 50% income', () => {
    const store = useFormStore.getState();
    store.setStep1Data({
      loanType: 'Personal',
      loanAmount: 500000,
      loanTenure: 12,
      loanPurpose: 'Wedding',
    });
    // Set low income so DTI is high
    store.setStep5Data({
      employmentType: 'SALARIED',
      companyName: 'Store',
      designation: 'Sales',
      monthlyNetSalary: 15000, // EMI will be around 44k, exceeding 15k income
      yearsOfExperience: 2,
    });

    render(<Step8Review />);

    expect(screen.getByText(/high debt-to-income/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /submit loan application/i });
    expect(submitBtn).toBeDisabled();

    // Check all 5 checkboxes to enable
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(5);

    checkboxes.forEach((cb) => fireEvent.click(cb));
    expect(submitBtn).toBeEnabled();
  });

  it('redirects to Step 1 when Edit button on Loan Details is clicked', () => {
    const store = useFormStore.getState();
    store.setStep(8);
    store.setStep1Data({
      loanType: 'Personal',
      loanAmount: 50000,
      loanTenure: 12,
      loanPurpose: 'Edit Test',
    });

    render(<Step8Review />);

    const editBtn = screen.getAllByText('Edit')[0]; // First edit button is for Step 1
    fireEvent.click(editBtn);

    expect(useFormStore.getState().step).toBe(1);
  });

  it('submits application successfully and shows success modal', async () => {
    const store = useFormStore.getState();
    store.setStep1Data({
      loanType: 'Personal',
      loanAmount: 50000,
      loanTenure: 12,
      loanPurpose: 'Modal Test',
    });
    store.setStep5Data({
      employmentType: 'SALARIED',
      companyName: 'LendSwift',
      designation: 'Developer',
      monthlyNetSalary: 100000,
      yearsOfExperience: 3,
    });

    render(<Step8Review />);

    const submitBtn = screen.getByRole('button', { name: /submit loan application/i });
    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((cb) => fireEvent.click(cb));

    fireEvent.click(submitBtn);

    // Mock API 1.5s delay
    await waitFor(() => {
      expect(screen.getByText('Application Submitted!')).toBeInTheDocument();
      expect(screen.getByText('11111111-2222-3333-4444-555555555555')).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});
