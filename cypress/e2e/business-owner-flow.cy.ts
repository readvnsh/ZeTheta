describe('LendSwift E2E Happy Path - Business Loan / Business Owner', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('completes the entire business loan business owner flow successfully', () => {
    // ─── STEP 1: LOAN DETAILS ───────────────────────────────────────────
    cy.get('input[name="loanType"][value="Business"]').check({ force: true });
    cy.get('#loanTenure').should('contain', '12');
    cy.get('#loanAmount').click().type('{selectall}1500000');
    cy.get('#loanTenure').select('36');
    cy.get('#loanPurpose').type('Equipment Procurement');
    cy.contains('button', 'Next Step').click();

    // ─── STEP 2: PERSONAL INFO ──────────────────────────────────────────
    cy.get('#fullName', { timeout: 10000 }).should('be.visible');
    cy.get('#fullName').type('Vansh Sejpal');
    cy.setDateValue('#dob', '1988-08-20');
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
    cy.get('#currentAddress\\.addressLine1').type('Industrial Zone, Block C');
    cy.get('#currentAddress\\.pinCode').type('560001').blur();
    cy.get('#currentAddress\\.city', { timeout: 3000 }).should('not.have.value', '');

    cy.get('#residenceType').select('Owned');
    cy.get('#yearsAtAddress').click().type('{selectall}4');
    cy.get('input[name="sameAsPermanent"]').should('be.checked');
    cy.contains('button', 'Next Step').click();

    // ─── STEP 5: EMPLOYMENT (BUSINESS OWNER) ────────────────────────────
    cy.get('input[name="employmentType"][value="BUSINESS_OWNER"]', { timeout: 10000 })
      .check({ force: true });
    cy.get('#businessName').type('Apex Enterprise');
    cy.get('#businessType').select('Sole Proprietorship');
    cy.get('#annualTurnover').click().type('{selectall}4500000');
    cy.get('#yearsInBusiness').click().type('{selectall}5');
    // 15-character valid GSTIN
    cy.get('#gstNumber').type('29ABCDE1234F1Z5');
    cy.get('#officeAddress').type('Office 402, High Street Mall');
    cy.contains('button', 'Proceed').click();

    // ─── STEP 6 BYPASS CHECK ────────────────────────────────────────────
    // Business 15L < 20L threshold → Step 6 skipped → Step 7 visible
    cy.get('#step7-form', { timeout: 10000 }).should('exist');

    // ─── STEP 7: DOCUMENTS (Business-specific docs must render) ──────────
    cy.contains('Business Registration', { timeout: 6000 }).should('be.visible');
    cy.contains('ITR').should('be.visible');

    cy.get('input[id="photograph"]').selectFile('cypress/fixtures/test-image.png', { force: true });
    cy.get('input[id="aadhaarFront"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="aadhaarBack"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="bankStatements"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="itr"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="businessReg"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });

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
