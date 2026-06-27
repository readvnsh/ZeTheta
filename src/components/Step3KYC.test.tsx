import {
  render, screen, fireEvent, act,
} from '@testing-library/react';
import Step3KYC from './Step3KYC';
import useFormStore from '../store/formStore';
import { validateVerhoeff } from '../utils/validators';

// Helper to generate a valid 12-digit Verhoeff number for testing
const generateVerhoeff12 = (prefix11: string): string => {
  for (let i = 0; i <= 9; i += 1) {
    const candidate = prefix11 + i.toString();
    if (validateVerhoeff(candidate)) {
      return candidate;
    }
  }
  return `${prefix11}0`;
};

describe('Step3KYC', () => {
  beforeEach(() => {
    useFormStore.getState().resetForm();
  });

  it('renders Step 3 fields correctly', () => {
    render(<Step3KYC />);

    expect(screen.getByText('KYC & Identity Verification')).toBeInTheDocument();
    expect(screen.getByLabelText(/pan card number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/aadhaar card number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/voter id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/passport number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/consent/i)).toBeInTheDocument();
  });

  it('validates invalid PAN format', async () => {
    render(<Step3KYC />);

    const panInput = screen.getByLabelText(/pan card number/i);
    fireEvent.change(panInput, { target: { value: 'ABCD123' } });
    fireEvent.blur(panInput);

    const form = document.getElementById('step3-form');
    fireEvent.submit(form!);

    expect(await screen.findByText('PAN must be in AAAAA9999A format')).toBeInTheDocument();
  });

  it('validates 4th character PAN entity rule for Personal loan', async () => {
    render(<Step3KYC />);

    const panInput = screen.getByLabelText(/pan card number/i);
    // 4th char is 'C' (Company), which is invalid for Personal Loan
    fireEvent.change(panInput, { target: { value: 'ABCCe1234f' } });
    fireEvent.blur(panInput);

    const form = document.getElementById('step3-form');
    fireEvent.submit(form!);

    expect(await screen.findByText('Invalid entity character (4th char) for this loan type')).toBeInTheDocument();
  });

  it('triggers PAN verification on blur and shows verified state', async () => {
    render(<Step3KYC />);

    const panInput = screen.getByLabelText(/pan card number/i);
    // 4th char is 'P' (Individual)
    fireEvent.change(panInput, { target: { value: 'ABCPe1234f' } });
    fireEvent.blur(panInput);

    // Wait for the 1.5s simulated API delay using real timeout
    await act(async () => {
      await new Promise((resolve) => { setTimeout(resolve, 1600); });
    });

    expect(await screen.findByText('✓ PAN Verified')).toBeInTheDocument();
    expect(useFormStore.getState().isPanVerified).toBe(true);
  });

  it('triggers Aadhaar verification on blur and fails for incorrect checksum', async () => {
    render(<Step3KYC />);

    const aadhaarInput = screen.getByLabelText(/aadhaar card number/i);
    // Use incorrect checksum number
    fireEvent.change(aadhaarInput, { target: { value: '111111111111' } });
    fireEvent.blur(aadhaarInput);

    // Wait for the 1.5s simulated API delay using real timeout
    await act(async () => {
      await new Promise((resolve) => { setTimeout(resolve, 1600); });
    });

    expect(await screen.findByText('Invalid Aadhaar checksum (Verhoeff validation failed).')).toBeInTheDocument();
    expect(useFormStore.getState().isAadhaarVerified).toBe(false);
  });

  it('verifies valid Aadhaar successfully using Verhoeff calculator', async () => {
    const validAadhaar = generateVerhoeff12('12345678901');
    render(<Step3KYC />);

    const aadhaarInput = screen.getByLabelText(/aadhaar card number/i);
    fireEvent.change(aadhaarInput, { target: { value: validAadhaar } });
    fireEvent.blur(aadhaarInput);

    // Wait for the 1.5s simulated API delay using real timeout
    await act(async () => {
      await new Promise((resolve) => { setTimeout(resolve, 1600); });
    });

    expect(await screen.findByText('✓ Aadhaar Verified')).toBeInTheDocument();
    expect(useFormStore.getState().isAadhaarVerified).toBe(true);
  });
});
