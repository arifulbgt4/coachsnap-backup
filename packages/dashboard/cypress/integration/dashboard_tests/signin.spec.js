/// <reference types="Cypress" />

context('Signin', () => {
  it('Visits public page', () => {
    cy.visit('http://localhost:1234');
  });

  it('cy.url() - get the current URL', () => {
    cy.url().should('eq', 'http://localhost:1234/public');
  });

  it('GET Signin Button', () => {
    cy.get('.sign-in-button').should('have.text', 'Sign In');
  });

  it('Click Signin Button', () => {
    cy.get('.sign-in-button').click();
  });

  it('cy.url() - get the current URL', () => {
    cy.url().should('eq', 'http://localhost:1234/signin');
  });

  it('Focus The Email Input', () => {
    cy.get('#signin_email')
      .focus()
      .should('have.class', 'ant-input')
      .type('coach@coachsnap.com')
      .should('have.value', 'coach@coachsnap.com');
  });
  it('Focus The Password Input', () => {
    cy.get('#signin_password')
      .focus()
      .should('have.class', 'ant-input')
      .type('123456')
      .should('have.value', '123456');
  });
  it('Get The Signin Button', () => {
    cy.get('button[type="submit"]').should('have.text', 'Sign In');
  });
  it('Clicks The Signin Button', () => {
    cy.get('button[type="submit"]').click();
  });

  it('cy.url() - get the current URL', () => {
    cy.waitUntil(() => cy.get('.ant-menu'));
    cy.url().should('eq', 'http://localhost:1234/coach/dashboard');
  });

  it('Should Have Sidebar', () => {
    cy.get('.coach-panel-sidebar').should(
      'have.class',
      'ant-layout-sider-collapsed'
    );
  });
});
