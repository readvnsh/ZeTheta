import { calculateAmortization, formatINR } from './emiCalculator';

describe('emiCalculator', () => {
  it('correctly calculates EMI for Home Loan', () => {
    // 50 Lakhs (5,000,000) Home Loan at 8.5% for 20 years (240 months)
    const result = calculateAmortization(5000000, 240, 'Home');

    // Expected EMI is approx ₹43,391
    expect(result.emi).toBeCloseTo(43391, -2);
    expect(result.processingFee).toBe(25000); // capped at max ₹25,000
  });

  it('correctly calculates EMI for Personal Loan', () => {
    // 1 Lakh (100,000) Personal Loan at 10.5% for 1 year (12 months)
    const result = calculateAmortization(100000, 12, 'Personal');

    // Expected EMI is approx ₹8,815
    expect(result.emi).toBeCloseTo(8815, -2);
    expect(result.processingFee).toBe(2000); // capped at min ₹2,000
  });

  it('correctly calculates processing fee within bounds', () => {
    // 10 Lakhs (1,000,000) Business Loan (1% is 10,000)
    const result = calculateAmortization(1000000, 36, 'Business');
    expect(result.processingFee).toBe(10000); // 1% of 10L is ₹10,000
  });

  it('formats values in Indian Rupee locale', () => {
    const formatted = formatINR(1000000);
    // Should include lakhs separator: e.g. ₹10,00,000
    expect(formatted).toContain('10,00,000');
  });
});
