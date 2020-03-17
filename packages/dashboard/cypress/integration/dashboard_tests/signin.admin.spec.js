/// <reference types="Cypress" />

let ADMIN_PASSWORD;
let ADMIN_EMAIL;

context('Signin', () => {
  beforeEach(() => {
    ADMIN_EMAIL = Cypress.env('ADMIN_EMAIL');
    ADMIN_PASSWORD = Cypress.env('ADMIN_PASSWORD');
  });
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
      .type(Cypress.env('ADMIN_EMAIL'))
      .should('have.value', Cypress.env('ADMIN_EMAIL'));
  });
  it('Focus The Password Input', () => {
    cy.get('#signin_password')
      .focus()
      .should('have.class', 'ant-input')
      .type(Cypress.env('ADMIN_PASSWORD'))
      .should('have.value', Cypress.env('ADMIN_PASSWORD'));
  });
  it('Get The Signin Button', () => {
    cy.get('button[type="submit"]').should('have.text', 'Sign In');
  });
  it('Clicks The Signin Button', () => {
    cy.get('button[type="submit"]').click();
  });

  it('cy.url() - get the current URL', () => {
    cy.waitUntil(() => cy.get('.ant-menu'));
    cy.url().should('eq', 'http://localhost:1234/admin');
  });

  it('Should Have Sidebar', () => {
    cy.get('.coach-panel-sidebar').should(
      'have.class',
      'ant-layout-sider-collapsed'
    );
  });
});
