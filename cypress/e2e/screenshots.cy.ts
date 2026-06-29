describe('LendSwift Viewport Screenshot Capturer', () => {
  const viewports = [
    { name: 'mobile', width: 320, height: 568 },
    { name: 'desktop', width: 1440, height: 900 },
  ];

  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('captures screenshots of all steps across mobile and desktop viewports', () => {
    // ─── STEP 1 ───
    cy.visit('/');
    cy.get('input[name="loanType"][value="Home"]').should('be.visible');
    viewports.forEach((vp) => {
      cy.viewport(vp.width, vp.height);
      cy.screenshot(`step1-${vp.name}`, { capture: 'viewport' });
    });

    // Fill Step 1
    cy.viewport(1440, 900);
    cy.get('input[name="loanType"][value="Home"]').check();
    cy.get('#loanAmount').type('{selectall}4000000');
    cy.get('#loanTenure').select('120');
    cy.get('#loanPurpose').type('Buying a residential apartment');
    cy.contains('button', 'Next Step').click();

    // ─── STEP 2 ───
    cy.get('#fullName', { timeout: 10000 }).should('be.visible');
    viewports.forEach((vp) => {
      cy.viewport(vp.width, vp.height);
      cy.screenshot(`step2-${vp.name}`, { capture: 'viewport' });
    });

    // Fill Step 2
    cy.viewport(1440, 900);
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
    viewports.forEach((vp) => {
      cy.viewport(vp.width, vp.height);
      cy.screenshot(`step3-${vp.name}`, { capture: 'viewport' });
    });

    // Fill Step 3
    cy.viewport(1440, 900);
    cy.get('#pan').type('ABCPE1234F').blur();
    cy.contains('✓ PAN Verified', { timeout: 6000 }).should('be.visible');
    cy.get('#aadhaar').type('234567890124').blur();
    cy.contains('✓ Aadhaar Verified', { timeout: 6000 }).should('be.visible');
    cy.get('input[name="aadhaarConsent"]').check({ force: true });
    cy.contains('button', 'Next Step').click();

    // ─── STEP 4 ───
    cy.get('#currentAddress\\.addressLine1', { timeout: 10000 }).should('be.visible');
    viewports.forEach((vp) => {
      cy.viewport(vp.width, vp.height);
      cy.screenshot(`step4-${vp.name}`, { capture: 'viewport' });
    });

    // Fill Step 4
    cy.viewport(1440, 900);
    cy.get('#currentAddress\\.addressLine1').type('123 Green Towers, Connaught Place');
    cy.get('#currentAddress\\.pinCode').type('110001').blur();
    cy.get('#currentAddress\\.city', { timeout: 3000 }).should('not.have.value', '');
    cy.get('#residenceType').select('Owned');
    cy.get('#yearsAtAddress').type('{selectall}5');
    cy.get('input[name="sameAsPermanent"]').should('be.checked');
    cy.contains('button', 'Next Step').click();

    // ─── STEP 5 ───
    cy.get('input[name="employmentType"][value="SALARIED"]', { timeout: 10000 }).should('be.visible');
    viewports.forEach((vp) => {
      cy.viewport(vp.width, vp.height);
      cy.screenshot(`step5-${vp.name}`, { capture: 'viewport' });
    });

    // Fill Step 5
    cy.viewport(1440, 900);
    cy.get('input[name="employmentType"][value="SALARIED"]').check();
    cy.get('#companyName').type('Google India');
    cy.get('#designation').type('Software Engineer');
    cy.get('#monthlyNetSalary').type('{selectall}150000');
    cy.get('#yearsOfExperience').type('{selectall}5');
    cy.contains('button', 'Proceed').click();

    // ─── STEP 6 ───
    cy.get('#coApplicantName', { timeout: 10000 }).should('be.visible');
    viewports.forEach((vp) => {
      cy.viewport(vp.width, vp.height);
      cy.screenshot(`step6-${vp.name}`, { capture: 'viewport' });
    });

    // Fill Step 6
    cy.viewport(1440, 900);
    cy.get('#coApplicantName').type('Jane Sejpal');
    cy.get('#coApplicantPan').type('ABCPE1234F');
    cy.get('#coApplicantIncome').type('{selectall}50000');
    cy.get('input[name="coApplicantConsent"]').check({ force: true });
    cy.contains('button', 'Proceed').click();

    // ─── STEP 7 ───
    cy.get('#step7-form', { timeout: 10000 }).should('exist');
    viewports.forEach((vp) => {
      cy.viewport(vp.width, vp.height);
      cy.screenshot(`step7-${vp.name}`, { capture: 'viewport' });
    });

    // Fill Step 7
    cy.viewport(1440, 900);
    cy.get('input[id="photograph"]').selectFile('cypress/fixtures/test-image.png', { force: true });
    cy.contains('test-image.png').should('be.visible');
    cy.get('input[id="aadhaarFront"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="aadhaarBack"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="salarySlips"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="bankStatements"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('input[id="propertyDocs"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    cy.get('p:contains("test-document.pdf")').should('have.length', 5);
    cy.get('canvas').click({ force: true });
    cy.wait(500);
    cy.contains('button', 'Proceed').click();

    // ─── STEP 8 ───
    cy.contains('Review & Pre-Approval Summary', { timeout: 10000 }).should('be.visible');
    viewports.forEach((vp) => {
      cy.viewport(vp.width, vp.height);
      cy.screenshot(`step8-${vp.name}`, { capture: 'viewport' });
    });

    // Fill Step 8
    cy.viewport(1440, 900);
    cy.get('#step8-form').find('input[type="checkbox"]').each(($el) => {
      cy.wrap($el).check({ force: true });
    });
    cy.contains('button', 'Submit Loan Application').click();

    // ─── SUCCESS MODAL ───
    cy.contains('Application Submitted!', { timeout: 5000 }).should('be.visible');
    viewports.forEach((vp) => {
      cy.viewport(vp.width, vp.height);
      cy.screenshot(`success-${vp.name}`, { capture: 'viewport' });
    });

    // Done
    cy.viewport(1440, 900);
    cy.contains('button', 'Done & Return Home').click();
  });
});
