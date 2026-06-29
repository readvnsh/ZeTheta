describe('LendSwift E2E Happy Path - Personal Loan / Salaried', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('completes the entire personal loan salaried flow successfully', () => {
    // ─── STEP 1: LOAN DETAILS ───────────────────────────────────────────
    // loanType defaults to Personal — already selected. Keep it.
    // loanAmount: select-all and type to avoid triggering onChange(undefined)
    cy.get('#loanAmount').click().type('{selectall}400000');
    cy.get('#loanTenure').select('24');
    cy.get('#loanPurpose').type('Medical Treatment');
    // Submit Step 1 via footer Next Step button
    cy.contains('button', 'Next Step').click();

    // ─── STEP 2: PERSONAL INFO ──────────────────────────────────────────
    cy.get('#fullName', { timeout: 10000 }).should('be.visible');
    cy.get('#fullName').type('Vansh Sejpal');
    cy.setDateValue('#dob', '1995-10-15');
    cy.get('#fatherName').type('Father Sejpal');
    cy.get('#motherName').type('Mother Sejpal');
    cy.get('#gender').select('Male');
    cy.get('#maritalStatus').select('Single');
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
    cy.get('#currentAddress\\.addressLine1').type('123 Green Towers, Connaught Place');
    cy.get('#currentAddress\\.pinCode').type('110001').blur();
    // Wait for async PIN lookup (800ms delay)
    cy.get('#currentAddress\\.city', { timeout: 3000 }).should('not.have.value', '');

    cy.get('#residenceType').select('Owned');
    cy.get('#yearsAtAddress').click().type('{selectall}5');
    // sameAsPermanent is checked by default
    cy.get('input[name="sameAsPermanent"]').should('be.checked');
    cy.contains('button', 'Next Step').click();

    // ─── STEP 5: EMPLOYMENT (SALARIED) ──────────────────────────────────
    cy.get('input[name="employmentType"][value="SALARIED"]', { timeout: 10000 })
      .check({ force: true });
    cy.get('#companyName').type('LendSwift Inc');
    cy.get('#designation').type('Staff Architect');
    cy.get('#monthlyNetSalary').click().type('{selectall}85000');
    cy.get('#yearsOfExperience').click().type('{selectall}6');
    cy.contains('button', 'Proceed').click();

    // ─── STEP 6 BYPASS CHECK ────────────────────────────────────────────
    // Personal 4L < 5L threshold → Step 6 skipped → Step 7 Documents visible
    cy.get('#step7-form', { timeout: 10000 }).should('exist');

    // ─── STEP 7: DOCUMENTS & SIGNATURE ──────────────────────────────────
    cy.get('input[id="photograph"]').selectFile('cypress/fixtures/test-image.png', { force: true });
    cy.contains('test-image.png').should('be.visible'); // Wait for image compression to complete

    cy.get('input[id="aadhaarFront"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="aadhaarBack"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="salarySlips"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="bankStatements"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });

    // Wait for all 4 PDF uploads to be complete and visible
    cy.get('p:contains("test-document.pdf")').should('have.length', 4);

    // Draw signature
    cy.get('canvas').click({ force: true });

    cy.contains('button', 'Proceed').click();

    // ─── STEP 8: REVIEW & SUBMIT ─────────────────────────────────────────
    cy.contains('Review & Pre-Approval Summary', { timeout: 10000 }).should('be.visible');
    cy.contains('Pre-Approval Summary').should('be.visible');

    // Check all 4 consent checkboxes in the right-column form
    cy.get('form').find('input[type="checkbox"]').each(($el) => {
      cy.wrap($el).check({ force: true });
    });

    cy.contains('button', 'Submit Loan Application').should('not.be.disabled').click();

    // Success Modal
    cy.contains('Application Submitted!', { timeout: 5000 }).should('be.visible');
    cy.contains('Application Reference ID').should('be.visible');

    // Done
    cy.contains('button', 'Done & Return Home').click();
    cy.contains('Loan Details', { timeout: 5000 }).should('be.visible');
  });
});
