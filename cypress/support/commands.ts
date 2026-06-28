// cypress/support/commands.ts
// Extend Cypress commands for LendSwift helpers

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      fillCurrencyInput(selector: string, value: string): Chainable<void>;
      setDateValue(selector: string, value: string): Chainable<void>;
    }
  }
}

// Helper: select-all and type into a CurrencyInput (type="text") field
Cypress.Commands.add('fillCurrencyInput', (selector: string, value: string) => {
  cy.get(selector).click().type(`{selectall}${value}`);
});

// Helper: set a React-controlled date input value using the nativeInputValueSetter
// This ensures React's synthetic onChange fires even on programmatic value changes.
Cypress.Commands.add('setDateValue', (selector: string, value: string) => {
  cy.get(selector).then(($input) => {
    const input = $input[0] as HTMLInputElement;
    // Use the native property setter to bypass React's internal value tracking
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set;
    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(input, value);
    } else {
      input.value = value;
    }
    // Fire both input and change events so React Hook Form picks up the value
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
});

export {};
