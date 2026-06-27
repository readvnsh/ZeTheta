import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import Step5Employment from './Step5Employment';
import useFormStore from '../store/formStore';

describe('Step5Employment', () => {
  beforeEach(() => {
    useFormStore.getState().resetForm();
  });

  it('renders Step 5 and mounts Salaried sub-form by default', () => {
    render(<Step5Employment />);

    expect(screen.getByText('Employment & Income Details')).toBeInTheDocument();
    expect(screen.getByLabelText(/salaried/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/self employed/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/business owner/i)).toBeInTheDocument();

    // Salaried fields should be visible
    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/designation/i)).toBeInTheDocument();

    // Self-employed/Business fields should NOT be visible
    expect(screen.queryByLabelText(/monthly income/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/gst number/i)).not.toBeInTheDocument();
  });

  it('mounts Self Employed sub-form when selected', async () => {
    render(<Step5Employment />);

    const radio = screen.getByLabelText(/self employed/i);
    fireEvent.click(radio);

    // Self employed fields should mount
    expect(await screen.findByLabelText(/monthly income/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/years in business/i)).toBeInTheDocument();

    // Salaried fields should unmount
    expect(screen.queryByLabelText(/company name/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/gst number/i)).not.toBeInTheDocument();
  });

  it('mounts Business Owner sub-form when selected', async () => {
    render(<Step5Employment />);

    const radio = screen.getByLabelText(/business owner/i);
    fireEvent.click(radio);

    // Business Owner fields should mount
    expect(await screen.findByLabelText(/gst number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/annual turnover/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/office address/i)).toBeInTheDocument();

    // Salaried fields should unmount
    expect(screen.queryByLabelText(/company name/i)).not.toBeInTheDocument();
  });

  it('fails validation for salaried salary less than 15,000', async () => {
    render(<Step5Employment />);

    const companyInput = screen.getByLabelText(/company name/i);
    const designationInput = screen.getByLabelText(/designation/i);
    const salaryInput = screen.getByLabelText(/monthly net salary/i);
    const experienceInput = screen.getByLabelText(/years of experience/i);

    fireEvent.change(companyInput, { target: { value: 'Google' } });
    fireEvent.change(designationInput, { target: { value: 'Staff Architect' } });
    fireEvent.change(salaryInput, { target: { value: '12000' } }); // below 15k
    fireEvent.change(experienceInput, { target: { value: '8' } });

    const form = document.getElementById('step5-form');
    fireEvent.submit(form!);

    expect(await screen.findByText('Monthly Net Salary must be at least ₹15,000')).toBeInTheDocument();
  });

  it('fails validation for invalid GST regex format', async () => {
    render(<Step5Employment />);

    const radio = screen.getByLabelText(/business owner/i);
    fireEvent.click(radio);

    const gstInput = await screen.findByLabelText(/gst number/i);
    fireEvent.change(gstInput, { target: { value: '22AAAAA0000A1Z' } }); // invalid length/format

    const form = document.getElementById('step5-form');
    fireEvent.submit(form!);

    expect(await screen.findByText('GST Number must be a valid 15-character Indian GSTIN')).toBeInTheDocument();
  });

  it('enforces cross-step block for SALARIED profiles on business loans', async () => {
    // Set loanType to Business in Step 1
    useFormStore.getState().setStep1Data({
      loanType: 'Business',
      loanAmount: 1000000,
      loanTenure: 36,
      loanPurpose: 'Expansion',
    });

    render(<Step5Employment />);

    // Selector is SALARIED by default, should trigger validation error reactively
    await waitFor(() => {
      expect(screen.getByText(/salaried employees are not eligible for business loans/i)).toBeInTheDocument();
    });
  });
});
