describe('LendSwift E2E - Signature Canvas Lifecycle & Persistence', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('verifies signature validation, clear functionality, and review-step preview rendering', () => {
    // ─── NAVIGATE TO STEP 7 ──────────────────────────────────────────────
    // Step 1: Loan Details
    cy.get('input[name="loanType"][value="Home"]').check({ force: true });
    cy.get('#loanAmount').click().type('{selectall}4000000'); // 40L
    cy.get('#loanTenure').select('120 Months (10 Years)');
    cy.get('#loanPurpose').type('Buying a flat');
    cy.contains('button', 'Next Step').click();

    // Step 2: Personal Info
    cy.get('#fullName', { timeout: 10000 }).should('be.visible');
    cy.get('#fullName').type('Vansh Sejpal');
    cy.setDateValue('#dob', '1985-10-15');
    cy.get('#fatherName').type('Father Sejpal');
    cy.get('#motherName').type('Mother Sejpal');
    cy.get('#gender').select('Male');
    cy.get('#maritalStatus').select('Married');
    cy.get('#email').click().type('{selectall}vansh@example.com');
    cy.get('#mobile').click().type('{selectall}9876543210');
    cy.contains('button', 'Next Step').click();

    // Step 3: KYC
    cy.get('#pan', { timeout: 10000 }).should('be.visible');
    cy.get('#pan').click().type('{selectall}ABCPE1234F').blur();
    cy.contains('✓ PAN Verified', { timeout: 6000 }).should('be.visible');
    cy.get('#aadhaar').click().type('{selectall}234567890124').blur();
    cy.contains('✓ Aadhaar Verified', { timeout: 6000 }).should('be.visible');
    cy.get('input[name="aadhaarConsent"]').check({ force: true });
    cy.contains('button', 'Next Step').click();

    // Step 4: Address
    cy.get('#currentAddress\\.addressLine1', { timeout: 10000 }).should('be.visible');
    cy.get('#currentAddress\\.addressLine1').type('123 Green Towers');
    cy.get('#currentAddress\\.pinCode').type('110001').blur();
    cy.get('#currentAddress\\.city', { timeout: 3000 }).should('not.have.value', '');
    cy.get('#currentAddress\\.state').click().type('{selectall}Delhi');
    cy.get('#yearsAtAddress').click().type('{selectall}5');
    cy.contains('button', 'Next Step').click();

    // Step 5: Employment
    cy.get('#companyName', { timeout: 10000 }).should('be.visible');
    cy.get('#companyName').type('Google');
    cy.get('#designation').type('Engineer');
    cy.get('#monthlyNetSalary').click().type('{selectall}85000');
    cy.get('#yearsOfExperience').click().type('{selectall}5');
    cy.contains('button', 'Proceed').click();

    // Step 6: Co-Applicant
    cy.get('#coApplicantName', { timeout: 10000 }).should('be.visible');
    cy.get('#coApplicantName').type('Jane Sejpal');
    cy.get('#relationship').select('Spouse');
    cy.get('#coApplicantPan').type('ABCPE1234F');
    cy.get('#coApplicantIncome').click().type('{selectall}50000');
    cy.get('input[name="coApplicantConsent"]').check({ force: true });
    cy.contains('button', 'Proceed').click();

    // ─── STEP 7: DOCUMENTS & SIGNATURE ──────────────────────────────────
    cy.get('#step7-form', { timeout: 10000 }).should('exist');

    // Fill all required files first to isolate signature validation
    cy.get('input[id="photograph"]').selectFile('cypress/fixtures/test-image.png', { force: true });
    cy.contains('test-image.png').should('be.visible'); // Wait for image compression to complete

    cy.get('input[id="aadhaarFront"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="aadhaarBack"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="salarySlips"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="bankStatements"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="propertyDocs"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });

    // Wait for all 5 PDF uploads to be complete and visible
    cy.get('p:contains("test-document.pdf")').should('have.length', 5);

    // 1. Submit without signature interaction
    cy.contains('button', 'Proceed').click();
    cy.contains('Signature is required').should('be.visible');

    // 2. Click the canvas to draw a signature, verify capture success message
    cy.get('canvas').click({ force: true });
    cy.contains('✓ Signature captured successfully').should('be.visible');

    // 3. Click Clear, verify blank state / error triggers again on submit
    cy.contains('button', 'Clear').click();
    cy.contains('✓ Signature captured successfully').should('not.exist');
    cy.contains('button', 'Proceed').click();
    cy.contains('Signature is required').should('be.visible');

    // 4. Draw again and proceed to Step 8
    cy.get('canvas').click({ force: true });
    cy.contains('✓ Signature captured successfully').should('be.visible');
    cy.contains('button', 'Proceed').click();

    // ─── STEP 8: REVIEW & PRE-APPROVAL ──────────────────────────────────
    cy.contains('Review & Pre-Approval Summary', { timeout: 10000 }).should('be.visible');
    cy.contains('Captured Signature Preview:').should('be.visible');
    cy.get('img[alt="Signature"]').should('be.visible')
      .and('have.attr', 'src')
      .and('include', 'data:image/png;base64');
  });
});
