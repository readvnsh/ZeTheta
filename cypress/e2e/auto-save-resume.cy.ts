describe('LendSwift E2E - Auto-Save and Resume Lifecycle', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('saves progress automatically, triggers recovery modal on reload, and resumes to Step 4', () => {
    // ─── STEP 1: LOAN DETAILS ───────────────────────────────────────────
    cy.get('input[name="loanType"][value="Personal"]').check({ force: true });
    cy.get('#loanAmount').click().type('{selectall}400000');
    cy.get('#loanTenure').select('24');
    cy.get('#loanPurpose').type('Medical Expenses');
    cy.contains('button', 'Next Step').click();

    // ─── STEP 2: PERSONAL INFO ──────────────────────────────────────────
    cy.get('#fullName', { timeout: 10000 }).type('Vansh Sejpal');
    cy.setDateValue('#dob', '1985-05-15');
    cy.get('#fatherName').type('Father Sejpal');
    cy.get('#motherName').type('Mother Sejpal');
    cy.get('#gender').select('Male');
    cy.get('#maritalStatus').select('Single');
    cy.get('#email').click().type('{selectall}vansh@example.com');
    cy.get('#mobile').click().type('{selectall}9876543210');
    cy.contains('button', 'Next Step').click();

    // ─── STEP 3: KYC ────────────────────────────────────────────────────
    cy.get('#pan', { timeout: 10000 }).click().type('{selectall}ABCPE1234F').blur();
    cy.contains('✓ PAN Verified', { timeout: 6000 }).should('be.visible');
    cy.get('#aadhaar').click().type('{selectall}234567890124').blur();
    cy.contains('✓ Aadhaar Verified', { timeout: 6000 }).should('be.visible');
    cy.get('input[name="aadhaarConsent"]').check({ force: true });
    cy.contains('button', 'Next Step').click();

    // ─── STEP 4: ADDRESS ────────────────────────────────────────────────
    cy.get('#currentAddress\\.addressLine1', { timeout: 10000 }).type('123 Green Towers');
    cy.get('#currentAddress\\.pinCode').type('110001').blur();
    cy.get('#currentAddress\\.city', { timeout: 3000 }).should('not.have.value', '');
    cy.get('#yearsAtAddress').type('5');

    // Wait >30 seconds for the auto-save background interval loop to run
    cy.wait(31000);

    // Verify draft key is written to localStorage
    cy.window().then((win) => {
      const stored = win.localStorage.getItem('lendswift_draft_Personal');
      expect(stored).to.not.be.null;
      const parsed = JSON.parse(stored || '{}');
      expect(parsed.step).to.equal(4);
      expect(parsed.loanType).to.equal('Personal');
    });

    // Programmatically force reload
    cy.reload();

    // Verify recovery modal appears
    cy.contains('Retrieve Stored Draft?').should('be.visible');
    cy.contains('Resume Application').click();

    // Verify we are back on Step 4 (element is visible)
    cy.get('#currentAddress\\.addressLine1', { timeout: 10000 }).should('be.visible');

    // Assert that the Zustand store is repopulated correctly
    cy.window().then((win) => {
      const storeState = (win as any).store.getState();
      expect(storeState.step).to.equal(4);
      expect(storeState.step1Data).to.not.be.null;
      expect(storeState.step1Data.loanAmount).to.equal(400000);
      expect(storeState.step2Data).to.not.be.null;
      expect(storeState.step2Data.fullName).to.equal('Vansh Sejpal');
      expect(storeState.step3Data).to.not.be.null;
      expect(storeState.step3Data.pan).to.equal('ABCPE1234F');
    });
  });
});
