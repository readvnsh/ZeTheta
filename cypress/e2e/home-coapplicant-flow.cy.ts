describe('LendSwift E2E Happy Path - Home Loan / Married Co-Applicant', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.clearLocalStorage();
  });

  it('completes the entire home loan co-applicant flow successfully', () => {
    // Step 1: Loan Details
    cy.contains('Home Loan').click();
    cy.get('#loanAmount').clear().type('4000000'); // 40 Lakhs
    cy.get('#loanTenure').select('180'); // 15 years
    cy.get('#loanPurpose').clear().type('Villa Purchase');
    cy.contains('button', 'Next Step').click();

    // Step 2: Personal Info (must set Married)
    cy.get('#fullName').type('Vansh Sejpal');
    cy.get('#fatherName').type('Father Sejpal');
    cy.get('#motherName').type('Mother Sejpal');
    cy.get('#dob').type('1990-10-15');
    cy.get('#gender').select('Male');
    cy.get('#maritalStatus').select('Married');
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
    cy.get('#currentAddress\\.addressLine1').type('Villa 42, Sunrise Meadows');
    cy.get('#currentAddress\\.pinCode').type('400001').blur();
    cy.get('#currentAddress\\.city').should('have.value', 'Mumbai');
    cy.get('#currentAddress\\.state').should('have.value', 'Maharashtra');

    cy.get('#residenceType').select('Owned');
    cy.get('#yearsAtAddress').clear().type('3');
    cy.get('input[name="sameAsPermanent"]').check();
    cy.contains('button', 'Next Step').click();

    // Step 5: Employment & Income
    cy.contains('Salaried').click();
    cy.get('#companyName').type('Tech Labs');
    cy.get('#designation').type('Manager');
    cy.get('#monthlyNetSalary').type('150000');
    cy.get('#yearsOfExperience').type('10');
    cy.contains('button', 'Proceed').click();

    // Step 6: Co-Applicant Details (Should mount since it is a Home Loan)
    cy.contains('Co-Applicant Details').should('be.visible');
    // Relationship should default to and lock to Spouse (or have Spouse pre-selected)
    cy.get('#relationship').should('have.value', 'Spouse');

    cy.get('#coApplicantName').type('Jane Sejpal');
    cy.get('#coApplicantPan').type('ABCPe1234f').blur();
    cy.contains('✓ PAN Verified', { timeout: 3000 }).should('be.visible');

    cy.get('#coApplicantIncome').type('80000');
    cy.get('input[type="checkbox"]').check();
    cy.contains('button', 'Next Step').click();

    // Step 7: Documents (Property ownership documents must be required)
    cy.contains('Documents & Signature').should('be.visible');
    cy.contains('Property Ownership Documents').should('be.visible');

    cy.get('input[id="photograph"]').selectFile('cypress/fixtures/test-image.png', { force: true });
    cy.get('input[id="aadhaarFront"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="aadhaarBack"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="salarySlips"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="bankStatements"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="propertyDocs"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });

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
