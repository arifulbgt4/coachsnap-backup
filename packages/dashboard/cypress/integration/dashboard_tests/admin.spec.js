/// <reference types="Cypress" />

context('Admin', () => {
  beforeEach(() => {
    cy.login(Cypress.env('ADMIN_EMAIL'), Cypress.env('ADMIN_PASSWORD'));
  });

  it('Takes to admin dashboard', () => {
    cy.visit('http://localhost:1234/admin');
    cy.get('.ant-menu > :nth-child(1)').click();
  });

  it('Send Invite to a coach', () => {
    cy.get('#name')
      .focus()
      .clear()
      .type('Testing Coach Name');
    cy.get('#email')
      .focus()
      .clear()
      .type('test.email@testing.com');
    cy.get('.ant-btn').click();
    cy.get('.alert-box').should(
      'contain.text',
      'An email sent to test.email@testing.com'
    );
  });

  it('Goes to coach page', () => {
    cy.get('tbody > tr:nth-child(2) > td:nth-child(3) > a').click();
  });

  it('Updates Coach Form', () => {
    cy.get('#update-coach_name')
      .focus()
      .clear()
      .type('Updated Test Coach');
    cy.get('#update-coach_username')
      .focus()
      .clear()
      .type('unique_test');
    cy.get('#update-coach_biography')
      .focus()
      .clear()
      .type('Updated Coach Biography');
    cy.get('#update-coach_facebook')
      .focus()
      .clear()
      .type('facebook.com/testing');
    cy.get('#update-coach_twitter')
      .focus()
      .clear()
      .type('twitter.com/testing');
    cy.get('#update-coach_website')
      .focus()
      .clear()
      .type('example.com');
    cy.get('#update-coach_mobile')
      .focus()
      .clear()
      .type('+8801666666666');
    cy.get('#update-coach_password')
      .focus()
      .clear()
      .type('123456');
    cy.get('.ant-btn-primary').click();
    cy.get('.ant-message-success > span').should(
      'contain.text',
      'Profile updated'
    );
  });

  it('Sends Reset Link to Coach Email', () => {
    cy.get('.ant-btn-info').click();
    cy.get('.ant-message-success > span').should(
      'contain.text',
      'Reset URL is sent to coach email'
    );
  });

  it('Deletes Coach', () => {
    cy.get('.ant-btn-danger').click();
    cy.get('.ant-popover-buttons > .ant-btn-primary').click();
    cy.get('.ant-message-success > span').should(
      'contain.text',
      'Successfully Deleted Coach'
    );
  });

  it('Logs Out Admin', () => {
    cy.get('.panel-avatar > .ant-avatar').click();
    cy.get('.overlay-body-logout > .ant-btn').click();
    cy.get('.ant-message-warning > span').should(
      'contain.text',
      'You are now logged out!'
    );
  });
});
