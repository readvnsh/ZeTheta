import { forwardRef, useImperativeHandle } from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Step7Documents from './Step7Documents';
import useFormStore from '../store/formStore';

// Mock react-signature-canvas using forwardRef & useImperativeHandle
vi.mock('react-signature-canvas', () => {
  const MockSignatureCanvas = forwardRef((props: any, ref) => {
    useImperativeHandle(ref, () => ({
      clear: vi.fn(),
      isEmpty: vi.fn(() => false),
      getTrimmedCanvas: vi.fn(() => ({
        toDataURL: vi.fn(() => 'data:image/png;base64,mock-signature'),
      })),
    }));
    return (
      <button
        type="button"
        data-testid="mock-sig-canvas"
        onClick={props.onEnd}
      >
        Mock Sign Area
      </button>
    );
  });
  MockSignatureCanvas.displayName = 'MockSignatureCanvas';
  return { default: MockSignatureCanvas };
});

describe('Step7Documents', () => {
  beforeEach(() => {
    useFormStore.getState().resetForm();
  });

  it('renders default required uploads (Aadhaar, Photograph, Signature, PAN if unverified)', () => {
    useFormStore.getState().setPanVerified(false);

    render(<Step7Documents />);

    expect(screen.getByText('Documents & Signature')).toBeInTheDocument();
    expect(screen.getByText(/pan card/i)).toBeInTheDocument();
    expect(screen.getByText(/aadhaar card front/i)).toBeInTheDocument();
    expect(screen.getByText(/aadhaar card back/i)).toBeInTheDocument();
    expect(screen.getByText(/passport size photograph/i)).toBeInTheDocument();
    expect(screen.getByText(/digital signature/i)).toBeInTheDocument();

    // Salaried documents should not be visible by default
    expect(screen.queryByText(/salary slips/i)).not.toBeInTheDocument();
  });

  it('hides PAN card upload bay when PAN is verified', () => {
    useFormStore.getState().setPanVerified(true);

    render(<Step7Documents />);

    expect(screen.queryByText(/pan card/i)).not.toBeInTheDocument();
  });

  it('renders property ownership documents for Home loans', () => {
    useFormStore.getState().setStep1Data({
      loanType: 'Home',
      loanAmount: 1000000,
      loanTenure: 120,
      loanPurpose: 'Buy House',
    });

    render(<Step7Documents />);

    expect(screen.getByText(/property ownership documents/i)).toBeInTheDocument();
    expect(screen.queryByText(/business registration/i)).not.toBeInTheDocument();
  });

  it('renders business registration & GST returns for Business loans', () => {
    useFormStore.getState().setStep1Data({
      loanType: 'Business',
      loanAmount: 3000000,
      loanTenure: 60,
      loanPurpose: 'Expand Office',
    });

    render(<Step7Documents />);

    expect(screen.getByText(/business registration & gst returns/i)).toBeInTheDocument();
    expect(screen.queryByText(/property ownership documents/i)).not.toBeInTheDocument();
  });

  it('renders salary slips and bank statements for Salaried profiles', () => {
    useFormStore.getState().setStep5Data({
      employmentType: 'SALARIED',
      companyName: 'LendSwift Tech',
      designation: 'Architect',
      monthlyNetSalary: 80000,
      yearsOfExperience: 5,
    });

    render(<Step7Documents />);

    expect(screen.getByText(/salary slips - 3 months/i)).toBeInTheDocument();
    expect(screen.getByText(/bank statements - 6 months/i)).toBeInTheDocument();
    expect(screen.queryByText(/itr - 2 years/i)).not.toBeInTheDocument();
  });

  it('renders ITR and bank statements for Business Owners', () => {
    useFormStore.getState().setStep5Data({
      employmentType: 'BUSINESS_OWNER',
      businessName: 'Apex Trader',
      businessType: 'Partnership',
      annualTurnover: 5000000,
      yearsInBusiness: 6,
      officeAddress: 'Mumbai Office',
      gstNumber: '27AAAAA1111A1Z1',
    });

    render(<Step7Documents />);

    expect(screen.getByText(/itr - 2 years/i)).toBeInTheDocument();
    expect(screen.getByText(/bank statements - 6 months/i)).toBeInTheDocument();
    expect(screen.queryByText(/salary slips - 3 months/i)).not.toBeInTheDocument();
  });
});
