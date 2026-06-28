describe('LendSwift E2E Negative Testing - Upload Errors & Image Compression', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('handles prohibited file types, file size limits, and verifies image compression', () => {
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

    // ─── STEP 7: DOCUMENTS UPLOADS ───────────────────────────────────────
    cy.get('#step7-form', { timeout: 10000 }).should('exist');

    // 1. Prohibited File Type Rejection
    // Upload .zip to Photograph (allows image/jpeg, image/png)
    cy.get('input[id="photograph"]').selectFile('cypress/fixtures/invalid-type.zip', { force: true });
    cy.contains('File type not supported. Please upload allowed formats.').should('be.visible');

    // 2. File Too Large Rejection
    // Upload large-file.pdf (5.5MB) to Aadhaar Front (max size is 5MB)
    cy.get('input[id="aadhaarFront"]').selectFile('cypress/fixtures/large-file.pdf', { force: true });
    cy.contains('File exceeds the limit of 5.0 MB.').should('be.visible');

    // 3. Image Compression Pipeline
    // Upload large-image.png (2.5MB) to Aadhaar Front (5MB limit, gets compressed)
    cy.get('input[id="aadhaarFront"]').selectFile('cypress/fixtures/large-image.png', { force: true });
    // It should perform compression and display original size check
    cy.contains('was 2.5 MB', { timeout: 10000 }).should('be.visible');
    cy.contains('Compressed:').should('be.visible');
  });
});
