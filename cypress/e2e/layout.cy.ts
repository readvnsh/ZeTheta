describe('Day 1 Layout Smoke Test', () => {
  it('loads the main application wrapper', () => {
    cy.visit('/');
    cy.get('button').contains('Next').should('exist');
    cy.get('button').contains('Back').should('exist');
  });
});
