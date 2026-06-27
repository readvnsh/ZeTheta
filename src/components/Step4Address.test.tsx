import {
  render, screen, fireEvent, act,
} from '@testing-library/react';
import Step4Address from './Step4Address';
import useFormStore from '../store/formStore';

describe('Step4Address', () => {
  beforeEach(() => {
    useFormStore.getState().resetForm();
  });

  it('renders Step 4 core fields correctly', () => {
    render(<Step4Address />);

    expect(screen.getByText('Address Information')).toBeInTheDocument();
    expect(document.getElementById('currentAddress.addressLine1')).toBeInTheDocument();
    expect(document.getElementById('currentAddress.pinCode')).toBeInTheDocument();
    expect(document.getElementById('currentAddress.city')).toBeInTheDocument();
    expect(document.getElementById('currentAddress.state')).toBeInTheDocument();
    expect(screen.getByLabelText(/residence type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/years lived at current address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/permanent address is same as current address/i)).toBeInTheDocument();
  });

  it('conditionally renders rent field when residenceType is Rented', async () => {
    render(<Step4Address />);

    const resSelect = screen.getByLabelText(/residence type/i);
    fireEvent.change(resSelect, { target: { value: 'Rented' } });

    expect(await screen.findByLabelText(/monthly rent amount/i)).toBeInTheDocument();
  });

  it('conditionally renders previous address section when years lived < 1', async () => {
    render(<Step4Address />);

    const yearsInput = screen.getByLabelText(/years lived at current address/i);
    fireEvent.change(yearsInput, { target: { value: '0' } });

    expect(await screen.findByText('Previous Address')).toBeInTheDocument();
  });

  it('conditionally renders permanent address section when sameAsPermanent checkbox is unchecked', async () => {
    render(<Step4Address />);

    const checkbox = screen.getByLabelText(/permanent address is same as current address/i);
    fireEvent.click(checkbox); // unchecks it

    expect(await screen.findByRole('heading', { name: 'Permanent Address' })).toBeInTheDocument();
  });

  it('autofills City and State when exactly 6 digits are entered in Current Address PIN', async () => {
    render(<Step4Address />);

    const pinInput = document.getElementById('currentAddress.pinCode') as HTMLInputElement;
    const cityInput = document.getElementById('currentAddress.city') as HTMLInputElement;
    const stateInput = document.getElementById('currentAddress.state') as HTMLInputElement;

    // Enter a valid PIN code from our JSON (e.g. 110001 for New Delhi, Delhi)
    fireEvent.change(pinInput, { target: { value: '110001' } });

    // Wait for the 800ms mock delay to complete
    await act(async () => {
      await new Promise((resolve) => { setTimeout(resolve, 900); });
    });

    expect(cityInput).toHaveValue('New Delhi');
    expect(stateInput).toHaveValue('Delhi');
  });

  it('fails validation when user enters state different from expected PIN state', async () => {
    render(<Step4Address />);

    const line1 = document.getElementById('currentAddress.addressLine1') as HTMLInputElement;
    const pinInput = document.getElementById('currentAddress.pinCode') as HTMLInputElement;
    const cityInput = document.getElementById('currentAddress.city') as HTMLInputElement;
    const stateInput = document.getElementById('currentAddress.state') as HTMLInputElement;
    const yearsInput = screen.getByLabelText(/years lived at current address/i);

    // Fill valid core fields but invalid state
    fireEvent.change(line1, { target: { value: '123 Main Road' } });
    fireEvent.change(pinInput, { target: { value: '400001' } }); // Mumbai, Maharashtra
    fireEvent.change(cityInput, { target: { value: 'Mumbai' } });
    fireEvent.change(stateInput, { target: { value: 'Karnataka' } }); // Mismatch state!
    fireEvent.change(yearsInput, { target: { value: '5' } });

    const form = document.getElementById('step4-form');
    fireEvent.submit(form!);

    expect(await screen.findByText(/state does not match expected state/i)).toBeInTheDocument();
  });
});
