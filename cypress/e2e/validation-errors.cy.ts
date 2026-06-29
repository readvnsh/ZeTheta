describe('LendSwift E2E Negative Testing - Validation Errors', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('verifies empty-state and field-level validation errors across Steps 1-8', () => {
    // ─── STEP 1: LOAN DETAILS ───────────────────────────────────────────
    // Trigger validation errors on empty submission
    cy.get('#loanAmount').click().type('{selectall}{backspace}');
    cy.get('#loanPurpose').click().type('{selectall}{backspace}');
    cy.contains('button', 'Next Step').click();
    cy.contains('Loan amount is required').should('be.visible');
    cy.contains('Loan purpose is required').should('be.visible');

    // Trigger field-level errors (Personal Loan)
    cy.get('#loanAmount').click().type('{selectall}45000');
    cy.contains('button', 'Next Step').click();
    cy.contains('Minimum loan amount is 50,000').should('be.visible');

    // Max loan amount for Personal Loan is 10 Lakhs (1,000,000)
    cy.get('#loanAmount').click().type('{selectall}1200000');
    cy.contains('button', 'Next Step').click();
    cy.contains('Maximum loan amount for Personal loan is 1,000,000 (10L)').should('be.visible');

    // Tenure for Personal Loan must be 12-60 months. Append an invalid option to select.
    cy.get('#loanTenure').then(($select) => {
      $select.append('<option value="6">6 Months</option>');
    });
    cy.get('#loanTenure').select('6');
    cy.contains('button', 'Next Step').click();
    cy.contains('Loan tenure for Personal loan must be between 12 and 60 months').should('be.visible');

    // Referral code invalid
    cy.get('#referralCode').type('abc');
    cy.contains('button', 'Next Step').click();
    cy.contains('Referral code must be 6-10 alphanumeric characters').should('be.visible');

    // Correct Step 1 values to proceed (Select Home Loan now so we can test Step 6 co-applicant locks)
    cy.get('input[name="loanType"][value="Home"]').check({ force: true });
    cy.get('#loanAmount').click().type('{selectall}4000000'); // 40L
    cy.get('#loanTenure').select('120 Months (10 Years)'); // Correct select text
    cy.get('#loanPurpose').type('Buying a flat');
    cy.get('#referralCode').clear();
    cy.contains('button', 'Next Step').click();

    // ─── STEP 2: PERSONAL INFO ──────────────────────────────────────────
    cy.get('#fullName', { timeout: 10000 }).should('be.visible');
    // Trigger validation errors on empty submission
    cy.contains('button', 'Next Step').click();
    cy.contains('Full name must be at least 2 characters').should('be.visible');
    cy.contains("Father's name must be at least 2 characters").should('be.visible');
    cy.contains("Mother's name must be at least 2 characters").should('be.visible');
    cy.contains('Date of birth is required').should('be.visible');
    cy.contains('Please enter a valid email address').should('be.visible');
    cy.contains('Mobile number must be 10 digits starting with 6-9').should('be.visible');

    // Trigger field-level errors
    cy.setDateValue('#dob', '2015-05-15'); // Too young
    cy.contains('button', 'Next Step').click();
    cy.contains('Age must be between 21 and 65 years').should('be.visible');

    cy.get('#mobile').type('123456789'); // Short/invalid format
    cy.contains('button', 'Next Step').click();
    cy.contains('Mobile number must be 10 digits starting with 6-9').should('be.visible');

    // Duplicate alternate mobile
    cy.get('#mobile').click().type('{selectall}9876543210');
    cy.get('#alternateMobile').type('9876543210');
    cy.contains('button', 'Next Step').click();
    cy.contains('Alternate mobile number must differ from primary mobile number').should('be.visible');

    // Correct Step 2 values (applicant Married to test Step 6 locks)
    cy.get('#fullName').type('Vansh Sejpal');
    cy.setDateValue('#dob', '1985-10-15');
    cy.get('#fatherName').type('Father Sejpal');
    cy.get('#motherName').type('Mother Sejpal');
    cy.get('#gender').select('Male');
    cy.get('#maritalStatus').select('Married');
    cy.get('#email').click().type('{selectall}vansh@example.com');
    cy.get('#alternateMobile').clear();
    cy.contains('button', 'Next Step').click();

    // ─── STEP 3: KYC ────────────────────────────────────────────────────
    cy.get('#pan', { timeout: 10000 }).should('be.visible');
    // Trigger validation errors on empty submission (submit form directly as Next Step button is disabled)
    cy.get('#step3-form').submit();
    cy.contains('PAN must be in AAAAA9999A format').should('be.visible');
    cy.contains('Aadhaar must be exactly 12 digits').should('be.visible');
    cy.contains('Aadhaar consent is required').should('be.visible');

    // Trigger field-level errors
    // PAN wrong entity character ('D' is invalid for Home loan, requires 'P')
    cy.get('#pan').type('ABCDE1234F').blur();
    cy.contains('Invalid entity character (4th char) for this loan type').should('be.visible');

    // Aadhaar invalid checksum
    cy.get('#aadhaar').type('123456789012').blur();
    cy.contains('Invalid Aadhaar checksum').should('be.visible');

    // Correct Step 3 values
    cy.get('#pan').click().type('{selectall}ABCPE1234F').blur();
    cy.contains('✓ PAN Verified', { timeout: 6000 }).should('be.visible');
    cy.get('#aadhaar').click().type('{selectall}234567890124').blur();
    cy.contains('✓ Aadhaar Verified', { timeout: 6000 }).should('be.visible');
    cy.get('input[name="aadhaarConsent"]').check({ force: true });
    // Click Next Step (now enabled)
    cy.contains('button', 'Next Step').click();

    // ─── STEP 4: ADDRESS ────────────────────────────────────────────────
    cy.get('#currentAddress\\.addressLine1', { timeout: 10000 }).should('be.visible');
    // Trigger validation errors on empty submission
    cy.contains('button', 'Next Step').click();
    cy.contains('Address Line 1 must be at least 5 characters').should('be.visible');
    cy.contains('PIN Code must be exactly 6 digits').should('be.visible');
    cy.contains('City is required').should('be.visible');
    cy.contains('State is required').should('be.visible');

    // Trigger state mismatch field error
    cy.get('#currentAddress\\.addressLine1').type('123 Green Towers');
    cy.get('#currentAddress\\.pinCode').type('110001').blur();
    cy.get('#currentAddress\\.city', { timeout: 3000 }).should('not.have.value', '');
    // Force set mismatched state value
    cy.get('#currentAddress\\.state').click().type('{selectall}Karnataka');
    cy.contains('button', 'Next Step').click();
    cy.contains('State does not match expected state (Delhi) for PIN 110001').should('be.visible');

    // Correct Step 4 values
    cy.get('#currentAddress\\.state').click().type('{selectall}Delhi');
    cy.get('#yearsAtAddress').click().type('{selectall}5');
    cy.contains('button', 'Next Step').click();

    // ─── STEP 5: EMPLOYMENT ─────────────────────────────────────────────
    cy.get('#companyName', { timeout: 10000 }).should('be.visible');
    // Trigger validation errors on empty submission (SALARIED defaults)
    cy.contains('button', 'Proceed').click();
    cy.contains('Company name is required').should('be.visible');
    cy.contains('Designation is required').should('be.visible');
    cy.contains('Monthly net salary must be a number').should('be.visible');
    cy.contains('Years of experience must be a number').should('be.visible');

    // Trigger field errors
    cy.get('#monthlyNetSalary').click().type('{selectall}10000');
    cy.get('#yearsOfExperience').click().type('{selectall}60');
    cy.contains('button', 'Proceed').click();
    cy.contains('Monthly Net Salary must be at least ₹15,000').should('be.visible');
    cy.contains('Years of experience cannot exceed 50').should('be.visible');

    // Correct Step 5 values to proceed
    cy.get('#companyName').type('Google');
    cy.get('#designation').type('Engineer');
    cy.get('#monthlyNetSalary').click().type('{selectall}85000');
    cy.get('#yearsOfExperience').click().type('{selectall}5');
    cy.contains('button', 'Proceed').click();

    // ─── STEP 6: CO-APPLICANT ───────────────────────────────────────────
    cy.get('#coApplicantName', { timeout: 10000 }).should('be.visible');
    // Trigger validation errors on empty submission (coApplicantIncome starts empty, needs to be a number)
    cy.contains('button', 'Proceed').click();
    cy.contains('Co-applicant name is required').should('be.visible');
    cy.contains('PAN must be in AAAAA9999A format').should('be.visible');
    cy.contains('Monthly income must be a number').should('be.visible');
    cy.contains('Co-applicant consent is required').should('be.visible');

    // Fill in valid details but select Sibling to trigger Spouse lock error
    cy.get('#coApplicantName').type('Jane Sejpal');
    cy.get('#relationship').select('Sibling');
    cy.get('#coApplicantPan').type('ABCPE1234F');
    cy.get('#coApplicantIncome').click().type('{selectall}50000');
    cy.get('input[name="coApplicantConsent"]').check({ force: true });
    cy.contains('button', 'Proceed').click();
    cy.contains('Relationship must be Spouse for married applicants.').should('be.visible');

    // Correct Step 6 values
    cy.get('#relationship').select('Spouse');
    cy.contains('button', 'Proceed').click();

    // ─── STEP 7: DOCUMENTS ──────────────────────────────────────────────
    cy.get('#step7-form', { timeout: 10000 }).should('exist');
    // Trigger validation errors on empty submission (signature missing)
    cy.contains('button', 'Proceed').click();
    cy.contains('Signature is required').should('be.visible');

    // Correct Step 7 values
    cy.get('input[id="photograph"]').selectFile('cypress/fixtures/test-image.png', { force: true });
    cy.contains('test-image.png').should('be.visible'); // Wait for image compression to complete

    cy.get('input[id="aadhaarFront"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="aadhaarBack"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="salarySlips"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="bankStatements"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="propertyDocs"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });

    // Wait for all 5 PDF uploads to be complete and visible
    cy.get('p:contains("test-document.pdf")').should('have.length', 5);
    cy.get('canvas').click({ force: true });
    cy.contains('button', 'Proceed').click();

    // ─── STEP 8: REVIEW & SUBMIT ─────────────────────────────────────────
    cy.contains('Review & Pre-Approval Summary', { timeout: 10000 }).should('be.visible');
    // Verify Submit button is disabled
    cy.contains('button', 'Submit Loan Application').should('be.disabled');
    // Check all 4 consents
    cy.get('input[type="checkbox"]').each(($el) => {
      cy.wrap($el).check({ force: true });
    });
    // Should be enabled now
    cy.contains('button', 'Submit Loan Application').should('not.be.disabled');
  });
});
