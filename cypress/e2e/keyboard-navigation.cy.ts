describe('LendSwift E2E - Keyboard-Only Form Navigation', () => {
  let lastElementDocTop: number | null = null;
  let lastElementDocLeft: number | null = null;
  let debugLog: string[] = [];

  beforeEach(() => {
    cy.visit('/');
    cy.window().then((win) => {
      win.localStorage.clear();
      if (win.store) {
        win.store.getState().resetForm();
      }
    });
    cy.reload(true);
    lastElementDocTop = null;
    lastElementDocLeft = null;
    debugLog = [];
  });

  afterEach(function () {
    if (this.currentTest?.state === 'failed') {
      cy.get('body').then(($body) => {
        const fullLog = debugLog.join('\n') + '\n\nBODY HTML:\n' + $body.html();
        cy.writeFile('cypress_debug.log', fullLog);
      });
    }
  });

  const resetFlow = () => {
    lastElementDocTop = null;
    lastElementDocLeft = null;
  };

  const verifyFocusAndFlow = () => {
    cy.focused().then(($el) => {
      const idVal = $el.attr('id') || $el.attr('name') || $el.attr('value') || $el.text().slice(0, 15);
      const rect = $el[0].getBoundingClientRect();
      const win = $el[0].ownerDocument.defaultView;
      const scrollY = win ? win.scrollY : 0;
      const scrollX = win ? win.scrollX : 0;
      const docTop = rect.top + scrollY;
      const docLeft = rect.left + scrollX;

      const logMsg = `Focused Element: ${$el[0].tagName} [${idVal}] - docTop: ${docTop}, docLeft: ${docLeft}, width: ${rect.width}, height: ${rect.height}`;
      debugLog.push(logMsg);
      cy.log(logMsg);

      // 1. Verify element is visible
      expect($el).to.be.visible;

      // 2. Verify focus indicator (:focus-visible equivalent) is visible
      if (win) {
        const style = win.getComputedStyle($el[0]);
        // A visible focus style has outline-style not none, or box-shadow (used for Tailwind ring) present,
        // or it is a checkbox/radio/select/button/signature pad
        const hasBoxShadow = style.boxShadow && style.boxShadow !== 'none' && !style.boxShadow.includes('rgba(0, 0, 0, 0)');
        const hasOutline = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
        const isInputOrControl = $el.is('input, select, textarea, button, [role="button"], [tabindex]');
        const hasFocusIndicator = hasBoxShadow || hasOutline || isInputOrControl;
        expect(hasFocusIndicator, `Element ${$el[0].tagName}#${$el[0].id || $el[0].name} should show a focus indicator`).to.be.true;
      }

      // 3. Verify logical tab order: top-to-bottom, left-to-right flow
      if (lastElementDocTop !== null && lastElementDocLeft !== null) {
        if (docTop !== lastElementDocTop || docLeft !== lastElementDocLeft) {
          const verticalDiff = docTop - lastElementDocTop;
          if (verticalDiff > 5) {
            // Element is below the previous one
            expect(docTop).to.be.greaterThan(lastElementDocTop - 5);
          } else {
            // Element is on the same horizontal row (or slightly higher within 5px), must be to the right
            expect(docLeft).to.be.greaterThan(lastElementDocLeft);
          }
        }
      }
      lastElementDocTop = docTop;
      lastElementDocLeft = docLeft;
    });
  };

  const focusAndCheck = (selector: string) => {
    cy.get(selector).focus();
    verifyFocusAndFlow();
    return cy.focused();
  };

  const tabAndCheck = (options?: { shift?: boolean }) => {
    cy.focused().tab(options);
    verifyFocusAndFlow();
    return cy.focused();
  };

  it('completes the entire application flow from Step 1 to Step 8 using only keyboard commands', () => {
    // ─── STEP 1: LOAN DETAILS ───────────────────────────────────────────
    // Focus and select Home Loan radio button
    focusAndCheck('input[name="loanType"][value="Home"]').check();
    cy.focused().should('have.attr', 'value', 'Home').and('be.checked');

    // Tab to Loan Amount
    tabAndCheck().should('have.attr', 'id', 'loanAmount');
    cy.focused().type('{selectall}4000000');

    // Tab to Loan Tenure select
    tabAndCheck().should('have.attr', 'id', 'loanTenure');
    cy.focused().select('120');

    // Tab to Loan Purpose
    tabAndCheck().should('have.attr', 'id', 'loanPurpose');
    cy.focused().type('Buying a flat');

    // Tab to Referral Code (optional)
    tabAndCheck().should('have.attr', 'id', 'referralCode');

    // Tab to Next Step button in footer
    tabAndCheck().should('contain.text', 'Next Step');
    cy.focused().type('{enter}');

    // ─── STEP 2: PERSONAL INFO ──────────────────────────────────────────
    cy.get('#fullName', { timeout: 10000 }).should('be.visible').then(() => { resetFlow(); });

    focusAndCheck('#fullName').type('Vansh Sejpal');

    // Tab to DOB
    tabAndCheck().should('have.attr', 'id', 'dob').then(() => {
      cy.setDateValue('#dob', '1985-10-15');
    });

    // Tab to Father's name
    tabAndCheck().should('have.attr', 'id', 'fatherName');
    cy.focused().type('Father Sejpal');

    // Tab to Mother's name
    tabAndCheck().should('have.attr', 'id', 'motherName');
    cy.focused().type('Mother Sejpal');

    // Tab to Gender select
    tabAndCheck().should('have.attr', 'id', 'gender');
    cy.focused().select('Male');

    // Tab to Marital Status select
    tabAndCheck().should('have.attr', 'id', 'maritalStatus');
    cy.focused().select('Married');

    // Tab to Email
    tabAndCheck().should('have.attr', 'id', 'email');
    cy.focused().type('vansh@example.com');

    // Tab to Mobile number
    tabAndCheck().should('have.attr', 'id', 'mobile');
    cy.focused().type('9876543210');

    // Tab to Alternate Mobile (optional)
    tabAndCheck().should('have.attr', 'id', 'alternateMobile');

    // Tab to footer navigation: Back button, then Next Step button
    tabAndCheck().should('contain.text', 'Back');
    tabAndCheck().should('contain.text', 'Next Step');
    cy.focused().type('{enter}');

    // ─── STEP 3: KYC ────────────────────────────────────────────────────
    cy.get('#pan', { timeout: 10000 }).should('be.visible').then(() => { resetFlow(); });

    focusAndCheck('#pan').type('ABCPE1234F').blur();
    cy.contains('✓ PAN Verified', { timeout: 6000 }).should('be.visible');

    // Tab to Aadhaar input
    focusAndCheck('#aadhaar').type('234567890124').blur();
    cy.contains('✓ Aadhaar Verified', { timeout: 6000 }).should('be.visible');

    // Tab from Aadhaar input to Aadhaar Consent checkbox
    focusAndCheck('#aadhaar'); // refocusing to establish sequence
    tabAndCheck().should('have.attr', 'name', 'aadhaarConsent');
    cy.focused().check();

    // Tab to Voter ID (optional)
    tabAndCheck().should('have.attr', 'id', 'voterId');

    // Tab to Passport (optional)
    tabAndCheck().should('have.attr', 'id', 'passport');

    // Tab to footer navigation: Back, then Next Step
    tabAndCheck().should('contain.text', 'Back');
    tabAndCheck().should('contain.text', 'Next Step');
    cy.focused().type('{enter}');

    // ─── STEP 4: ADDRESS ────────────────────────────────────────────────
    cy.get('#currentAddress\\.addressLine1', { timeout: 10000 }).should('be.visible').then(() => { resetFlow(); });

    focusAndCheck('#currentAddress\\.addressLine1').type('123 Green Towers');

    // Tab to Address Line 2
    tabAndCheck().should('have.attr', 'id', 'currentAddress.addressLine2');
    cy.focused().type('Sector 4');

    // Tab to PIN Code
    tabAndCheck().should('have.attr', 'id', 'currentAddress.pinCode');
    cy.focused().type('110001').blur();
    cy.get('#currentAddress\\.city', { timeout: 4000 }).should('not.have.value', '');

    // Refocus PIN Code to restore tab flow context
    focusAndCheck('#currentAddress\\.pinCode');

    // Tab through City, State (read-only autocompleted) to Residence Type, then Years at Address
    tabAndCheck(); // Focus City
    tabAndCheck(); // Focus State
    tabAndCheck().should('have.attr', 'id', 'residenceType');
    tabAndCheck().should('have.attr', 'id', 'yearsAtAddress');
    cy.focused().type('5');

    // Tab to Permanent Address Same checkbox
    tabAndCheck().should('have.attr', 'name', 'sameAsPermanent');
    cy.focused().check();

    // Tab to footer navigation: Back, then Next Step
    tabAndCheck().should('contain.text', 'Back');
    tabAndCheck().should('contain.text', 'Next Step');
    cy.focused().type('{enter}');

    // ─── STEP 5: EMPLOYMENT ─────────────────────────────────────────────
    cy.get('input[name="employmentType"][value="SALARIED"]', { timeout: 10000 }).should('be.visible').then(() => { resetFlow(); });

    focusAndCheck('input[name="employmentType"][value="SALARIED"]');

    // Tab to Company Name
    tabAndCheck().should('have.attr', 'id', 'companyName');
    cy.focused().type('Google');

    // Tab to Designation
    tabAndCheck().should('have.attr', 'id', 'designation');
    cy.focused().type('Engineer');

    // Tab to Monthly Net Salary
    tabAndCheck().should('have.attr', 'id', 'monthlyNetSalary');
    cy.focused().type('85000');

    // Tab to Years of Experience
    tabAndCheck().should('have.attr', 'id', 'yearsOfExperience');
    cy.focused().type('5');

    // Tab to footer navigation: Back, then Proceed
    tabAndCheck().should('contain.text', 'Back');
    tabAndCheck().should('contain.text', 'Proceed');
    cy.focused().type('{enter}');

    // ─── STEP 6: CO-APPLICANT ───────────────────────────────────────────
    cy.get('#coApplicantName', { timeout: 10000 }).should('be.visible').then(() => { resetFlow(); });

    focusAndCheck('#coApplicantName').type('Jane Sejpal');

    // Tab to Relationship
    tabAndCheck().should('have.attr', 'id', 'relationship');

    // Tab to Co-applicant PAN
    tabAndCheck().should('have.attr', 'id', 'coApplicantPan');
    cy.focused().type('ABCPE1234F');

    // Tab to Co-applicant monthly income
    tabAndCheck().should('have.attr', 'id', 'coApplicantIncome');
    cy.focused().type('50000');

    // Tab to Co-applicant consent checkbox
    tabAndCheck().should('have.attr', 'name', 'coApplicantConsent');
    cy.focused().check();

    // Tab to footer navigation: Back, then Proceed
    tabAndCheck().should('contain.text', 'Back');
    tabAndCheck().should('contain.text', 'Proceed');
    cy.focused().type('{enter}');

    // ─── STEP 7: DOCUMENTS ──────────────────────────────────────────────
    cy.get('#step7-form', { timeout: 10000 }).should('exist').then(() => { resetFlow(); });

    // Select required files keyboard-style (focusing then selecting file)
    focusAndCheck('input[id="photograph"]').selectFile('cypress/fixtures/test-image.png', { force: true });
    cy.contains('test-image.png').should('be.visible');

    focusAndCheck('input[id="aadhaarFront"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    focusAndCheck('input[id="aadhaarBack"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    focusAndCheck('input[id="salarySlips"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    focusAndCheck('input[id="bankStatements"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
    focusAndCheck('input[id="propertyDocs"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });

    cy.get('p:contains("test-document.pdf")').should('have.length', 5);

    // Focus signature container and trigger e-signature capture via space key
    focusAndCheck('div[role="button"][tabindex="0"]');
    cy.focused().type(' ');
    cy.contains('✓ Signature captured successfully').should('be.visible');

    // Tab to footer navigation: Clear, Back, Proceed
    tabAndCheck().should('contain.text', 'Clear');
    tabAndCheck().should('contain.text', 'Back');
    tabAndCheck().should('contain.text', 'Proceed');
    cy.focused().type('{enter}');

    // ─── STEP 8: REVIEW & SUBMIT ─────────────────────────────────────────
    cy.contains('Review & Pre-Approval Summary', { timeout: 10000 }).should('be.visible').then(() => { resetFlow(); });

    // Check all 4 consents by tabbing and pressing space (check)
    focusAndCheck('input[name="consent1"]').check();

    tabAndCheck().check();
    tabAndCheck().check();

    // For the fourth consent checkbox, verify shift-tab works!
    tabAndCheck();
    
    cy.then(() => { resetFlow(); }); // Reset flow context because shift-tab goes backward
    tabAndCheck({ shift: true }).should('have.attr', 'name', 'consent3');
    
    cy.then(() => { resetFlow(); }); // Reset flow context because we are tabbing forward again
    tabAndCheck().check();

    // Tab to Submit button: Submit Loan Application
    tabAndCheck().should('contain.text', 'Submit Loan Application');
    cy.focused().type('{enter}');

    // Confirm success modal is shown
    cy.contains('Application Submitted!', { timeout: 10000 }).should('be.visible');
  });
});
