describe('template spec', () => {
  it('navigates between login and register screens and verifies header back button', () => {
    // Open login screen
    cy.visit('/login');
    cy.get('[data-testid="login-button-login"]').should('exist');

    // Verify no header back button on login screen
    cy.get('[data-testid="header-button-back"]').should('not.exist');
    
    // Go to register screen from login
    cy.get('[data-testid="login-button-register"]').click();

    // Verify header back button is visible on register screen
    cy.get('[data-testid="header-button-back"]').should('exist');
    cy.get('[data-testid="register-button-register"]').should('exist');

    // Click header back button
    cy.get('[data-testid="header-button-back"]').click();

    // Verify login screen is visible again
    cy.url().should('include', '/login');
    cy.get('[data-testid="login-button-login"]').should('exist');

    // Verify no header back button on login screen
    cy.get('[data-testid="header-button-back"]').should('not.exist');
  });

  it('language switch functionality', () => {
    // Open login screen
    cy.visit('/login');
    cy.get('[data-testid="login-button-login"]').should('exist');

    // Verify no header back button on login screen
    cy.get('[data-testid="header-button-back"]').should('not.exist');

    // Verify texts are in English
    cy.get('[data-testid="header-text-title"]').should('have.text', 'Login');
    cy.get('[data-testid="login-button-login"]').should('have.text', 'Login');
    cy.get('[data-testid="login-button-register"]').should('have.text', 'Go to Register');

    // Open language dropdown
    cy.get('[data-testid="header-button-language"]').click();

    // Select "si" language from the dropdown
    cy.get('[data-testid="header-listitem-language-si"]').click();

    // Verify texts are in Sinhala
    cy.get('[data-testid="header-text-title"]').should('have.text', 'පිවිසුම');
    cy.get('[data-testid="login-button-login"]').should('have.text', 'ඇතුල් වන්න');
    cy.get('[data-testid="login-button-register"]').should('have.text', 'අලුතින් ලියාපදිංචි වීමට මෙතැනින්');
  
    // Go to register screen from login
    cy.get('[data-testid="login-button-register"]').click();

    // Verify texts are still in Sinhala
    cy.get('[data-testid="header-text-title"]').should('have.text', 'ලියාපදිංචි වීම');
    cy.get('[data-testid="register-button-register"]').should('have.text', 'ලියාපදිංචි වන්න');

  });
})