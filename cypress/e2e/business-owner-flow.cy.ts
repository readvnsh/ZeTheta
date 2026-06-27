describe('LendSwift E2E Happy Path - Business Loan / Business Owner', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.clearLocalStorage();
  });

  it('completes the entire business loan business owner flow successfully', () => {
    // Step 1: Loan Details
    cy.contains('Business Loan').click();
    cy.get('#loanAmount').clear().type('1500000'); // 15 Lakhs
    cy.get('#loanTenure').select('36'); // 3 years
    cy.get('#loanPurpose').clear().type('Equipment Procurement');
    cy.contains('button', 'Next Step').click();

    // Step 2: Personal Info
    cy.get('#fullName').type('Vansh Sejpal');
    cy.get('#fatherName').type('Father Sejpal');
    cy.get('#motherName').type('Mother Sejpal');
    cy.get('#dob').type('1988-08-20');
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
    cy.get('#currentAddress\\.addressLine1').type('Industrial Zone, Block C');
    cy.get('#currentAddress\\.pinCode').type('560001').blur();
    cy.get('#currentAddress\\.city').should('have.value', 'Bengaluru');
    cy.get('#currentAddress\\.state').should('have.value', 'Karnataka');

    cy.get('#residenceType').select('Owned');
    cy.get('#yearsAtAddress').clear().type('4');
    cy.get('input[name="sameAsPermanent"]').check();
    cy.contains('button', 'Next Step').click();

    // Step 5: Employment & Income (Business Owner)
    cy.contains('Business Owner').click();
    cy.get('#businessName').type('Apex Enterprise');
    cy.get('#businessType').select('Sole Proprietorship');
    cy.get('#annualTurnover').type('4500000'); // 45L
    cy.get('#yearsInBusiness').type('5');
    cy.get('#gstNumber').type('29ABCDE1234F1Z5');
    cy.get('#officeAddress').type('Office 402, High Street Mall');
    cy.contains('button', 'Proceed').click();

    // Step 6 should be bypassed (amount 15L <= 20L for Business)
    // Verify Step 7 Documents mounts with business registry and ITR
    cy.contains('Documents & Signature').should('be.visible');
    cy.contains('Business Registration & GST Returns').should('be.visible');
    cy.contains('ITR - 2 Years').should('be.visible');

    cy.get('input[id="photograph"]').selectFile('cypress/fixtures/test-image.png', { force: true });
    cy.get('input[id="aadhaarFront"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="aadhaarBack"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="bankStatements"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="itr"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="businessReg"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });

    // Draw Signature on canvas
    cy.get('canvas')
      .trigger('mousedown', { which: 1, clientX: 100, clientY: 50 })
      .trigger('mousemove', { clientX: 200, clientY: 50 })
      .trigger('mouseup');

    cy.contains('button', 'Proceed').click();

    // Step 8: Review
    cy.contains('Review & Pre-Approval Summary').should('be.visible');
    cy.get('input[type="checkbox"]').check();
    cy.contains('button', 'Submit Loan Application').click();

    // Success Modal
    cy.contains('Application Submitted!', { timeout: 3000 }).should('be.visible');
    cy.contains('button', 'Done & Return Home').click();
  });
});
