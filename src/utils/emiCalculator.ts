/**
 * Formats a number to Indian Rupee (INR) currency style.
 * @param value Number value.
 */
export const formatINR = (value: number): string => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(value);

export interface AmortizationResult {
  emi: number;
  totalInterest: number;
  totalPayment: number;
  processingFee: number;
  emiFormatted: string;
  totalInterestFormatted: string;
  totalPaymentFormatted: string;
  processingFeeFormatted: string;
}

/**
 * Calculates standard EMI, interest, total cost, and processing fees.
 * Formula: EMI = [P x r x (1+r)^n]/[(1+r)^n - 1]
 */
export const calculateAmortization = (
  principal: number,
  tenureMonths: number,
  loanType: string,
): AmortizationResult => {
  let annualRate = 10.5; // Personal default
  if (loanType === 'Home') annualRate = 8.5;
  else if (loanType === 'Business') annualRate = 14.0;

  const r = annualRate / 12 / 100;
  const n = tenureMonths;

  let emi = 0;
  if (r > 0) {
    emi = (principal * r * (1 + r) ** n) / ((1 + r) ** n - 1);
  } else {
    emi = principal / n;
  }

  const totalPayment = emi * n;
  const totalInterest = totalPayment - principal;

  // Processing fee: 1% of principal, min ₹2,000, max ₹25,000
  let processingFee = principal * 0.01;
  if (processingFee < 2000) processingFee = 2000;
  else if (processingFee > 25000) processingFee = 25000;

  return {
    emi: Math.round(emi),
    totalInterest: Math.round(totalInterest),
    totalPayment: Math.round(totalPayment),
    processingFee: Math.round(processingFee),
    emiFormatted: formatINR(Math.round(emi)),
    totalInterestFormatted: formatINR(Math.round(totalInterest)),
    totalPaymentFormatted: formatINR(Math.round(totalPayment)),
    processingFeeFormatted: formatINR(Math.round(processingFee)),
  };
};
