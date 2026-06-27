describe('LendSwift E2E Happy Path - Personal Loan / Salaried', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.clearLocalStorage();
  });

  it('completes the entire personal loan salaried flow successfully', () => {
    // Step 1: Loan Details
    cy.contains('Personal Loan').click();
    cy.get('#loanAmount').clear().type('400000');
    cy.get('#loanTenure').select('24');
    cy.get('#loanPurpose').clear().type('Medical Treatment');
    cy.contains('button', 'Next Step').click();

    // Step 2: Personal Info
    cy.get('#fullName').type('Vansh Sejpal');
    cy.get('#fatherName').type('Father Sejpal');
    cy.get('#motherName').type('Mother Sejpal');
    cy.get('#dob').type('1995-10-15');
    cy.get('#gender').select('Male');
    cy.get('#maritalStatus').select('Single');
    cy.get('#email').type('vansh@example.com');
    cy.get('#mobile').type('9876543210');
    cy.contains('button', 'Next Step').click();

    // Step 3: KYC & Verification
    cy.get('#panNumber').type('ABCDE1234P').blur();
    cy.contains('✓ PAN Verified', { timeout: 3000 }).should('be.visible');

    cy.get('#aadhaarNumber').type('123456789012').blur();
    cy.contains('✓ Aadhaar Verified', { timeout: 3000 }).should('be.visible');

    cy.get('input[type="checkbox"]').check();
    cy.contains('button', 'Next Step').click();

    // Step 4: Address Info
    cy.get('#currentAddress\\.addressLine1').type('123 Green Towers');
    cy.get('#currentAddress\\.pinCode').type('110001').blur();
    // Wait for mock PIN lookup autofill
    cy.get('#currentAddress\\.city').should('have.value', 'New Delhi');
    cy.get('#currentAddress\\.state').should('have.value', 'Delhi');

    cy.get('#residenceType').select('Owned');
    cy.get('#yearsAtAddress').clear().type('5');
    cy.get('input[name="sameAsPermanent"]').check();
    cy.contains('button', 'Next Step').click();

    // Step 5: Employment & Income
    cy.contains('Salaried').click();
    cy.get('#companyName').type('LendSwift Inc');
    cy.get('#designation').type('Staff Architect');
    cy.get('#monthlyNetSalary').type('85000');
    cy.get('#yearsOfExperience').type('6');
    cy.contains('button', 'Proceed').click();

    // Step 6 should be automatically bypassed (amount 4L <= 5L for Personal)
    // Verify we are on Step 7 (Documents)
    cy.contains('Documents & Signature').should('be.visible');

    // Step 7: Document Uploads & Signature
    // Upload files to dropzone inputs
    cy.get('input[id="photograph"]').selectFile('cypress/fixtures/test-image.png', { force: true });
    cy.get('input[id="aadhaarFront"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="aadhaarBack"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="salarySlips"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="bankStatements"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });

    // Draw Signature on canvas
    cy.get('canvas')
      .trigger('mousedown', { which: 1, clientX: 100, clientY: 50 })
      .trigger('mousemove', { clientX: 200, clientY: 50 })
      .trigger('mouseup');

    cy.contains('button', 'Proceed').click();

    // Step 8: Review & Summary
    cy.contains('Review & Pre-Approval Summary').should('be.visible');
    // EMI summary checks
    cy.contains('Pre-Approval Summary').should('be.visible');

    // Check all consents
    cy.get('input[type="checkbox"]').check();

    // Submit
    cy.contains('button', 'Submit Loan Application').click();

    // Success Modal check
    cy.contains('Application Submitted!', { timeout: 3000 }).should('be.visible');
    cy.contains('Application Reference ID').should('be.visible');

    // Done
    cy.contains('button', 'Done & Return Home').click();
    cy.contains('Loan Details').should('be.visible'); // Back to Step 1
  });
});
