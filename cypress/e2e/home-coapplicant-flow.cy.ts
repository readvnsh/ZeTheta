describe('LendSwift E2E Happy Path - Home Loan / Married Co-Applicant', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('completes the entire home loan co-applicant flow successfully', () => {
    // ─── STEP 1: LOAN DETAILS ───────────────────────────────────────────
    cy.get('input[name="loanType"][value="Home"]').check({ force: true });
    // Wait for loanTenure to reset to Home options (60+)
    cy.get('#loanTenure').should('contain', '60');
    cy.get('#loanAmount').click().type('{selectall}4000000');
    cy.get('#loanTenure').select('180');
    cy.get('#loanPurpose').type('Villa Purchase');
    cy.contains('button', 'Next Step').click();

    // ─── STEP 2: PERSONAL INFO ──────────────────────────────────────────
    cy.get('#fullName', { timeout: 10000 }).should('be.visible');
    cy.get('#fullName').type('Vansh Sejpal');
    cy.setDateValue('#dob', '1990-10-15');
    cy.get('#fatherName').type('Father Sejpal');
    cy.get('#motherName').type('Mother Sejpal');
    cy.get('#gender').select('Male');
    cy.get('#maritalStatus').select('Married');
    cy.get('#email').type('vansh@example.com');
    cy.get('#mobile').type('9876543210');
    cy.contains('button', 'Next Step').click();

    // ─── STEP 3: KYC ────────────────────────────────────────────────────
    cy.get('#pan', { timeout: 10000 }).should('be.visible');
    cy.get('#pan').type('ABCPE1234F').blur();
    cy.contains('✓ PAN Verified', { timeout: 6000 }).should('be.visible');

    cy.get('#aadhaar').type('234567890124').blur();
    cy.contains('✓ Aadhaar Verified', { timeout: 6000 }).should('be.visible');

    cy.get('input[name="aadhaarConsent"]').check({ force: true });
    cy.contains('button', 'Next Step').click();

    // ─── STEP 4: ADDRESS ────────────────────────────────────────────────
    cy.get('#currentAddress\\.addressLine1', { timeout: 10000 }).should('be.visible');
    cy.get('#currentAddress\\.addressLine1').type('Villa 42, Sunrise Meadows');
    cy.get('#currentAddress\\.pinCode').type('400001').blur();
    cy.get('#currentAddress\\.city', { timeout: 3000 }).should('not.have.value', '');

    cy.get('#residenceType').select('Owned');
    cy.get('#yearsAtAddress').click().type('{selectall}3');
    cy.get('input[name="sameAsPermanent"]').should('be.checked');
    cy.contains('button', 'Next Step').click();

    // ─── STEP 5: EMPLOYMENT (SALARIED) ──────────────────────────────────
    cy.get('input[name="employmentType"][value="SALARIED"]', { timeout: 10000 })
      .check({ force: true });
    cy.get('#companyName').type('Tech Labs');
    cy.get('#designation').type('Manager');
    cy.get('#monthlyNetSalary').click().type('{selectall}150000');
    cy.get('#yearsOfExperience').click().type('{selectall}10');
    cy.contains('button', 'Proceed').click();

    // ─── STEP 6: CO-APPLICANT (Always required for Home loans) ───────────
    cy.get('#coApplicantName', { timeout: 10000 }).should('be.visible');
    // Married → relationship must default to Spouse
    cy.get('#relationship').should('have.value', 'Spouse');
    cy.get('#coApplicantName').type('Jane Sejpal');
    cy.get('#coApplicantPan').type('XYZPE5678K').blur();
    cy.contains('✓ PAN Verified', { timeout: 6000 }).should('be.visible');
    cy.get('#coApplicantIncome').click().type('{selectall}80000');
    cy.get('input[name="coApplicantConsent"]').check({ force: true });
    cy.contains('button', 'Proceed').click();

    // ─── STEP 7: DOCUMENTS ──────────────────────────────────────────────
    cy.get('#step7-form', { timeout: 10000 }).should('exist');
    // Property docs must be shown for Home loans
    cy.contains('Property Ownership Documents').should('be.visible');

    cy.get('input[id="photograph"]').selectFile('cypress/fixtures/test-image.png', { force: true });
    cy.contains('test-image.png').should('be.visible'); // Wait for image compression to complete

    cy.get('input[id="aadhaarFront"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="aadhaarBack"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="salarySlips"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="bankStatements"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="propertyDocs"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });

    // Wait for all 5 PDF uploads to be complete and visible
    cy.get('p:contains("test-document.pdf")').should('have.length', 5);

    // Draw signature
    cy.get('canvas').click({ force: true });

    cy.contains('button', 'Proceed').click();

    // ─── STEP 8: REVIEW & SUBMIT ─────────────────────────────────────────
    cy.contains('Review & Pre-Approval Summary', { timeout: 10000 }).should('be.visible');

    cy.get('form').find('input[type="checkbox"]').each(($el) => {
      cy.wrap($el).check({ force: true });
    });

    cy.contains('button', 'Submit Loan Application').should('not.be.disabled').click();

    cy.contains('Application Submitted!', { timeout: 5000 }).should('be.visible');
    cy.contains('button', 'Done & Return Home').click();
  });
});
