// Verhoeff multiplication table (d)
const d = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

// Verhoeff permutation table (p)
const p = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

/**
 * Validates a number using the Verhoeff checksum algorithm.
 * @param value The digit string to validate (e.g. 12-digit Aadhaar number).
 */
export const validateVerhoeff = (value: string): boolean => {
  if (!/^\d+$/.test(value)) return false;
  let c = 0;
  const digits = value.split('').map(Number).reverse();
  for (let i = 0; i < digits.length; i += 1) {
    c = d[c][p[i % 8][digits[i]]];
  }
  return c === 0;
};

/**
 * Validates a PAN card string format and 4th-character entity code.
 * @param pan PAN string to validate.
 * @param loanType Loan type context (Personal, Home, Business).
 */
export const validatePan = (pan: string, loanType: string): boolean => {
  const cleanPan = pan.trim().toUpperCase();
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(cleanPan)) {
    return false;
  }
  const entityChar = cleanPan[3];
  if (loanType === 'Personal' || loanType === 'Home') {
    return entityChar === 'P';
  }
  if (loanType === 'Business') {
    return entityChar === 'P' || entityChar === 'C' || entityChar === 'F';
  }
  return false;
};
