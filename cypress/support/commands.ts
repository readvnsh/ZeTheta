// cypress/support/commands.ts
// Extend Cypress commands for LendSwift helpers

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      fillCurrencyInput(selector: string, value: string): Chainable<void>;
      setDateValue(selector: string, value: string): Chainable<void>;
      tab(options?: { shift?: boolean }): Chainable<JQuery<HTMLElement>>;
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

Cypress.Commands.add('tab', { prevSubject: 'optional' }, (subject, options = {}) => {
  return cy.then(() => {
    const activeElement = subject ? subject[0] : document.activeElement;
    const doc = activeElement ? activeElement.ownerDocument : document;

    const selector = 'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable]';
    const tabbables = Array.from(doc.querySelectorAll(selector)) as HTMLElement[];

    const visibleTabbables = tabbables.filter((el) => {
      const elWindow = el.ownerDocument.defaultView || window;
      const style = elWindow.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetWidth > 0 && el.offsetHeight > 0;
    });

    const currentIndex = visibleTabbables.indexOf(activeElement as HTMLElement);
    let nextIndex = currentIndex;
    
    if (currentIndex !== -1) {
      const isRadio = (activeElement as HTMLInputElement).type === 'radio';
      const currentName = (activeElement as HTMLInputElement).name;
      
      do {
        if (options.shift) {
          nextIndex -= 1;
          if (nextIndex < 0) {
            nextIndex = visibleTabbables.length - 1;
          }
        } else {
          nextIndex += 1;
          if (nextIndex >= visibleTabbables.length) {
            nextIndex = 0;
          }
        }
        
        const candidate = visibleTabbables[nextIndex] as HTMLInputElement;
        const isSameRadioGroup = isRadio && candidate && candidate.type === 'radio' && candidate.name === currentName;
        if (!isSameRadioGroup) {
          break;
        }
      } while (nextIndex !== currentIndex);
    } else {
      nextIndex = 0;
    }

    const nextElement = visibleTabbables[nextIndex];
    if (nextElement) {
      nextElement.focus();
    }
    return cy.wrap(nextElement);
  });
});

export {};
