describe('LendSwift E2E - Stress & Resilience Suite', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.window().then((win) => {
      win.localStorage.clear();
      if (win.store) {
        win.store.getState().resetForm();
      }
    });
    cy.reload(true);
  });

  afterEach(function () {
    if (this.currentTest?.state === 'failed') {
      cy.get('body').then(($body) => {
        let errorsText = '';
        const step1Err = $body.find('#step1-validation-errors');
        if (step1Err.length) errorsText += `\nStep 1 Errors: ${step1Err.text()}`;
        const step7Err = $body.find('#step7-validation-errors');
        if (step7Err.length) errorsText += `\nStep 7 Errors: ${step7Err.text()}`;
        
        cy.writeFile('cypress_stress_debug.log', `Errors:\n${errorsText}\n\nHTML:\n` + $body.html());
      });
    }
  });

  const fillFormToStep8 = () => {
    // ─── STEP 1 ───
    cy.get('input[name="loanType"][value="Home"]').check();
    cy.get('#loanAmount').type('{selectall}4000000');
    cy.get('#loanTenure').select('120');
    cy.get('#loanPurpose').type('Buying a flat');
    cy.contains('button', 'Next Step').click();

    // ─── STEP 2 ───
    cy.get('#fullName', { timeout: 10000 }).should('be.visible');
    cy.get('#fullName').type('Vansh Sejpal');
    cy.setDateValue('#dob', '1985-10-15');
    cy.get('#fatherName').type('Father Sejpal');
    cy.get('#motherName').type('Mother Sejpal');
    cy.get('#gender').select('Male');
    cy.get('#maritalStatus').select('Married');
    cy.get('#email').type('vansh@example.com');
    cy.get('#mobile').type('9876543210');
    cy.contains('button', 'Next Step').click();

    // ─── STEP 3 ───
    cy.get('#pan', { timeout: 10000 }).should('be.visible');
    cy.get('#pan').type('ABCPE1234F').blur();
    cy.contains('✓ PAN Verified', { timeout: 6000 }).should('be.visible');
    cy.get('#aadhaar').type('234567890124').blur();
    cy.contains('✓ Aadhaar Verified', { timeout: 6000 }).should('be.visible');
    cy.get('input[name="aadhaarConsent"]').check();
    cy.contains('button', 'Next Step').click();

    // ─── STEP 4 ───
    cy.get('#currentAddress\\.addressLine1', { timeout: 10000 }).should('be.visible');
    cy.get('#currentAddress\\.addressLine1').type('123 Green Towers');
    cy.get('#currentAddress\\.pinCode').type('110001').blur();
    cy.get('#currentAddress\\.city', { timeout: 4000 }).should('not.have.value', '');
    cy.get('#residenceType').select('Owned');
    cy.get('#yearsAtAddress').type('5');
    cy.get('input[name="sameAsPermanent"]').check();
    cy.contains('button', 'Next Step').click();

    // ─── STEP 5 ───
    cy.get('input[name="employmentType"][value="SALARIED"]', { timeout: 10000 }).should('be.visible');
    cy.get('#companyName').type('Google');
    cy.get('#designation').type('Engineer');
    cy.get('#monthlyNetSalary').type('85000');
    cy.get('#yearsOfExperience').type('5');
    cy.contains('button', 'Proceed').click();

    // ─── STEP 6 ───
    cy.get('#coApplicantName', { timeout: 10000 }).should('be.visible');
    cy.get('#coApplicantName').type('Jane Sejpal');
    cy.get('#coApplicantPan').type('ABCPE1234F');
    cy.get('#coApplicantIncome').type('50000');
    cy.get('input[name="coApplicantConsent"]').check();
    cy.contains('button', 'Proceed').click();

    // ─── STEP 7 ───
    cy.get('#step7-form', { timeout: 10000 }).should('exist');
    cy.get('input[id="photograph"]').selectFile('cypress/fixtures/test-image.png', { force: true });
    cy.contains('test-image.png').should('be.visible');
    cy.get('input[id="aadhaarFront"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="aadhaarBack"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="salarySlips"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="bankStatements"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="propertyDocs"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('p:contains("test-document.pdf")').should('have.length', 5);

    cy.get('div[role="button"][tabindex="0"]').click();
    cy.contains('✓ Signature captured successfully').should('be.visible');
    cy.wait(500);
    cy.contains('button', 'Proceed').click();
  };

  it('verifies rapid clicking on "Next" does not double-increment step state', () => {
    // ─── STEP 1 ───
    cy.get('input[name="loanType"][value="Home"]').check();
    cy.get('#loanAmount').type('{selectall}4000000');
    cy.get('#loanTenure').select('120');
    cy.get('#loanPurpose').type('Buying a flat');

    // Click "Next Step" button 25 times in rapid succession
    for (let i = 0; i < 25; i++) {
      cy.contains('button', 'Next Step').click({ force: true });
    }

    // Step should be exactly 2 (Personal Info), not higher
    cy.get('#fullName', { timeout: 10000 }).should('be.visible');
    cy.window().then((win) => {
      expect(win.store.getState().step).to.eq(2);
    });
  });

  it('verifies double-submit prevention guards on Step 8 review screen', () => {
    fillFormToStep8();

    // ─── STEP 8 ───
    cy.contains('Review & Pre-Approval Summary', { timeout: 10000 }).should('be.visible');

    // Check all consents
    cy.get('input[type="checkbox"]').each(($el) => {
      cy.wrap($el).check();
    });

    // Click "Submit Loan Application" button 5 times in rapid succession
    for (let i = 0; i < 5; i++) {
      cy.contains('button', 'Submit Loan Application').click({ force: true });
    }

    // Assert UI state immediately
    cy.get('#step8-form').should('have.attr', 'data-submitting', 'true');

    // Verify submit succeeded
    cy.contains('Application Submitted!', { timeout: 10000 }).should('be.visible');

    // Verify application submission was called only once
    cy.window().then((win) => {
      expect((win as any).appSubmissionCount).to.eq(1);
    });
  });

  it('verifies input sanitization with extreme-length and unicode payloads', () => {
    // Inject extreme-length (5,000+ characters) string with HTML tags and Unicode / Emojis
    const extremePayload = '🚀 <script>alert("xss")</script> 🌟 ' + 'A'.repeat(5000);

    // Step 1: fill out forms using payload
    cy.get('input[name="loanType"][value="Home"]').check();
    cy.get('#loanAmount').type('{selectall}4000000');
    cy.get('#loanTenure').select('120');
    cy.get('#loanPurpose').type(extremePayload, { delay: 0 });
    cy.contains('button', 'Next Step').click();
    cy.get('#fullName', { timeout: 10000 }).should('be.visible');

    // Verify state store has sanitized and truncated the string
    cy.window().then((win) => {
      const sanitizedPurpose = win.store.getState().step1Data.loanPurpose;
      expect(sanitizedPurpose).to.not.contain('<script>');
      expect(sanitizedPurpose).to.not.contain('</script>');
      expect(sanitizedPurpose.length).to.be.at.most(200);
      expect(sanitizedPurpose).to.contain('🚀');
      expect(sanitizedPurpose).to.contain('🌟');
    });

    // Complete the rest of the form to verify layout is stable on Step 8 Review page
    // ─── STEP 2 ───
    cy.get('#fullName', { timeout: 10000 }).should('be.visible');
    cy.get('#fullName').type('Vansh Sejpal');
    cy.setDateValue('#dob', '1985-10-15');
    cy.get('#fatherName').type('Father Sejpal');
    cy.get('#motherName').type('Mother Sejpal');
    cy.get('#gender').select('Male');
    cy.get('#maritalStatus').select('Married');
    cy.get('#email').type('vansh@example.com');
    cy.get('#mobile').type('9876543210');
    cy.contains('button', 'Next Step').click();

    // ─── STEP 3 ───
    cy.get('#pan', { timeout: 10000 }).should('be.visible');
    cy.get('#pan').type('ABCPE1234F').blur();
    cy.contains('✓ PAN Verified', { timeout: 6000 }).should('be.visible');
    cy.get('#aadhaar').type('234567890124').blur();
    cy.contains('✓ Aadhaar Verified', { timeout: 6000 }).should('be.visible');
    cy.get('input[name="aadhaarConsent"]').check();
    cy.contains('button', 'Next Step').click();

    // ─── STEP 4 ───
    cy.get('#currentAddress\\.addressLine1', { timeout: 10000 }).should('be.visible');
    cy.get('#currentAddress\\.addressLine1').type('123 Green Towers');
    cy.get('#currentAddress\\.pinCode').type('110001').blur();
    cy.get('#currentAddress\\.city', { timeout: 4000 }).should('not.have.value', '');
    cy.get('#residenceType').select('Owned');
    cy.get('#yearsAtAddress').type('5');
    cy.get('input[name="sameAsPermanent"]').check();
    cy.contains('button', 'Next Step').click();

    // ─── STEP 5 ───
    cy.get('input[name="employmentType"][value="SALARIED"]', { timeout: 10000 }).should('be.visible');
    // Inject extreme payload into Company Name (which is text-based with no max validation in zod schema)
    cy.get('#companyName').type(extremePayload, { delay: 0 });
    cy.get('#designation').type('Engineer');
    cy.get('#monthlyNetSalary').type('85000');
    cy.get('#yearsOfExperience').type('5');
    cy.contains('button', 'Proceed').click();

    // Verify companyName is sanitized
    cy.window().then((win) => {
      const sanitizedCompany = win.store.getState().step5Data.companyName;
      expect(sanitizedCompany).to.not.contain('<script>');
      expect(sanitizedCompany.length).to.be.at.most(200);
    });

    // ─── STEP 6 ───
    cy.get('#coApplicantName', { timeout: 10000 }).should('be.visible');
    cy.get('#coApplicantName').type('Jane Sejpal');
    cy.get('#coApplicantPan').type('ABCPE1234F');
    cy.get('#coApplicantIncome').type('50000');
    cy.get('input[name="coApplicantConsent"]').check();
    cy.contains('button', 'Proceed').click();

    // ─── STEP 7 ───
    cy.get('#step7-form', { timeout: 10000 }).should('exist');
    cy.get('input[id="photograph"]').selectFile('cypress/fixtures/test-image.png', { force: true });
    cy.contains('test-image.png').should('be.visible');
    cy.get('input[id="aadhaarFront"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="aadhaarBack"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="salarySlips"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="bankStatements"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="propertyDocs"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('p:contains("test-document.pdf")').should('have.length', 5);

    cy.get('div[role="button"][tabindex="0"]').click();
    cy.contains('✓ Signature captured successfully').should('be.visible');
    cy.wait(500);
    cy.contains('button', 'Proceed').click();

    // ─── STEP 8 ───
    cy.contains('Review & Pre-Approval Summary', { timeout: 10000 }).should('be.visible');

    // Confirm that the extreme content didn't break or overflow the layout
    // There shouldn't be horizontal scrolling (layout is contained)
    cy.window().then((win) => {
      expect(win.document.documentElement.scrollWidth).to.be.closeTo(win.document.documentElement.clientWidth, 5);
    });

    // Make sure we see the sanitized (truncated) strings on the review page
    cy.contains('🚀 alert("xss") 🌟').should('be.visible');
  });

  it('verifies state purging and validation cleanup when switching branches mid-flow', () => {
    // 1. Fill Step 1 with Home Loan (Salaried) and proceed to Step 5
    cy.get('input[name="loanType"][value="Home"]').check();
    cy.get('#loanAmount').type('{selectall}4000000');
    cy.get('#loanTenure').select('120');
    cy.get('#loanPurpose').type('Buying a flat');
    cy.contains('button', 'Next Step').click();

    // Step 2
    cy.get('#fullName', { timeout: 10000 }).should('be.visible');
    cy.get('#fullName').type('Vansh Sejpal');
    cy.setDateValue('#dob', '1985-10-15');
    cy.get('#fatherName').type('Father Sejpal');
    cy.get('#motherName').type('Mother Sejpal');
    cy.get('#gender').select('Male');
    cy.get('#maritalStatus').select('Married');
    cy.get('#email').type('vansh@example.com');
    cy.get('#mobile').type('9876543210');
    cy.contains('button', 'Next Step').click();

    // Step 3
    cy.get('#pan', { timeout: 10000 }).should('be.visible');
    cy.get('#pan').type('ABCPE1234F').blur();
    cy.contains('✓ PAN Verified', { timeout: 6000 }).should('be.visible');
    cy.get('#aadhaar').type('234567890124').blur();
    cy.contains('✓ Aadhaar Verified', { timeout: 6000 }).should('be.visible');
    cy.get('input[name="aadhaarConsent"]').check();
    cy.contains('button', 'Next Step').click();

    // Step 4
    cy.get('#currentAddress\\.addressLine1', { timeout: 10000 }).should('be.visible');
    cy.get('#currentAddress\\.addressLine1').type('123 Green Towers');
    cy.get('#currentAddress\\.pinCode').type('110001').blur();
    cy.get('#currentAddress\\.city', { timeout: 4000 }).should('not.have.value', '');
    cy.get('#residenceType').select('Owned');
    cy.get('#yearsAtAddress').type('5');
    cy.get('input[name="sameAsPermanent"]').check();
    cy.contains('button', 'Next Step').click();

    // Step 5
    cy.get('input[name="employmentType"][value="SALARIED"]', { timeout: 10000 }).should('be.visible');
    cy.get('#companyName').type('Google');
    cy.get('#designation').type('Engineer');
    cy.get('#monthlyNetSalary').type('85000');
    cy.get('#yearsOfExperience').type('5');
    cy.contains('button', 'Proceed').click();

    // Step 6 (co-applicant)
    cy.get('#coApplicantName', { timeout: 10000 }).should('be.visible');
    cy.get('#coApplicantName').type('Jane Sejpal');
    cy.get('#coApplicantPan').type('ABCPE1234F');
    cy.get('#coApplicantIncome').type('50000');
    cy.get('input[name="coApplicantConsent"]').check();
    cy.contains('button', 'Proceed').click();

    // Step 7 documents
    cy.get('#step7-form', { timeout: 10000 }).should('exist');
    cy.get('input[id="photograph"]').selectFile('cypress/fixtures/test-image.png', { force: true });
    cy.contains('test-image.png').should('be.visible');
    cy.get('input[id="aadhaarFront"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="aadhaarBack"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="salarySlips"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="bankStatements"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="propertyDocs"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('p:contains("test-document.pdf")').should('have.length', 5);

    // 2. Go back to Step 1 and change Loan Type to Business
    cy.window().then((win) => {
      win.store.getState().setStep(1);
    });

    cy.get('input[name="loanType"][value="Business"]').check();
    cy.wait(500);
    cy.contains('button', 'Next Step').click();

    // Proceed through Step 2-4 using next steps to load defaults
    cy.get('#fullName', { timeout: 10000 }).should('be.visible');
    cy.wait(500);
    cy.contains('button', 'Next Step').click();
    cy.get('#pan', { timeout: 10000 }).should('be.visible');
    cy.wait(500);
    cy.contains('button', 'Next Step').click();
    cy.get('#currentAddress\\.addressLine1', { timeout: 10000 }).should('be.visible');
    cy.wait(500);
    cy.contains('button', 'Next Step').click();

    // Step 5 should now show SELF_EMPLOYED by default (Salaried is ineligible for Business loan)
    cy.get('input[name="employmentType"][value="SELF_EMPLOYED"]', { timeout: 10000 }).should('be.checked');

    // Check store state: salaried data from Step 5 is cleaned up, and Step 7 salarySlips is cleared
    cy.window().then((win) => {
      const state = win.store.getState();
      expect(state.step5Data?.employmentType).to.not.eq('SALARIED');
      expect(state.step7Data?.salarySlips).to.not.exist;
    });

    // 3. In Step 2, let's also test changing marital status and resetting co-applicant relationship
    cy.window().then((win) => {
      win.store.getState().setStep(2);
    });
    cy.get('#maritalStatus', { timeout: 10000 }).should('be.visible');
    cy.get('#maritalStatus').select('Single');
    cy.contains('button', 'Next Step').click();

    // Verify co-applicant relationship has been reset from Spouse
    cy.window().then((win) => {
      const state = win.store.getState();
      if (state.step6Data) {
        expect(state.step6Data.relationship).to.not.eq('Spouse');
      }
    });
  });
});
