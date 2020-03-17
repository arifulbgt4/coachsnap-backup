/// <reference types="Cypress" />

context('Signup', () => {
  it('Visits public page', () => {
    cy.visit('http://localhost:1234');
  });

  it('cy.url() - get the current URL', () => {
    cy.url().should('eq', 'http://localhost:1234/public');
  });

  it('GET Signup Button', () => {
    cy.get('.sign-up-button').should('have.text', 'Sign Up');
  });

  it('Click Signup Button', () => {
    cy.get('.sign-up-button').click();
  });

  it('cy.url() - get the current URL', () => {
    cy.url().should('eq', 'http://localhost:1234/signup');
  });

  it('Focus The Full Name Input', () => {
    cy.get('#signup_name')
      .focus()
      .should('have.class', 'ant-input')
      .type('Testing Name')
      .should('have.value', 'Testing Name');
  });
  it('Focus The UserName Input', () => {
    cy.get('#signup_username')
      .focus()
      .should('have.class', 'ant-input')
      .type('testing')
      .should('have.value', 'testing');
  });
  it('Focus The Email Input', () => {
    cy.get('#signup_email')
      .focus()
      .should('have.class', 'ant-input')
      .type('testing@testing.com')
      .should('have.value', 'testing@testing.com');
  });
  it('Focus The Password Input', () => {
    cy.get('#signup_password')
      .focus()
      .should('have.class', 'ant-input')
      .type('test1234')
      .should('have.value', 'test1234');
  });
  it('Get The Signup Button', () => {
    cy.get('button[type="submit"]').should('have.text', 'Sign Up');
  });
  it('Clicks The Signup Button', () => {
    cy.get('button[type="submit"]').click();
  });

  it('cy.url() - get the current URL', () => {
    cy.waitUntil(() => cy.get('.ant-menu'));
    cy.url().should('eq', 'http://localhost:1234/coach/dashboard');
  });

  it('Have verify notification', () => {
    cy.get('.alert-box.primary').should(
      'contain.text',
      'You are almost ready to coach. Please verify your email to continue.'
    );
  });

  it('Should Have Sidebar', () => {
    cy.get('.coach-panel-sidebar').should(
      'have.class',
      'ant-layout-sider-collapsed'
    );
  });
});
