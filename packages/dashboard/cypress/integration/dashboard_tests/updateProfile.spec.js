/// <reference types="Cypress" />

context('Update Profile', () => {
  beforeEach(() => {
    cy.login('coach@coachsnap.com', '123456');
  });

  it('Visits to settings page', () => {
    cy.visit('http://localhost:1234');
    cy.waitUntil(() => cy.get('.go-coach-panel'));
    cy.get('.go-coach-panel')
      .should('contain.text', 'Coach Panel')
      .click();
    cy.waitUntil(() => cy.get('.ant-menu'));
    cy.get('.ant-menu > :nth-child(5)')
      .should('not.have.class', 'ant-menu-item-selected')
      .click();
    cy.get('#edit-profile_name')
      .should('have.class', 'ant-input')
      .focus()
      .clear()
      .type('Testing Name')
      .should('have.value', 'Testing Name');
    cy.get('#edit-profile_username')
      .should('have.class', 'ant-input')
      .focus()
      .clear()
      .type('test')
      .should('have.value', 'test');
    cy.get('.ant-select-selection__rendered')
      .click()
      .type('Asia/Brunei');
    cy.get('.ant-select-dropdown-menu-item').click();
    cy.get('#edit-profile_biography')
      .focus()
      .clear()
      .type('Testing Biography')
      .should('have.value', 'Testing Biography');
    cy.get('#edit-profile_facebook')
      .focus()
      .clear()
      .type('facebook.com/cypress');
    cy.get('#edit-profile_twitter')
      .focus()
      .clear()
      .type('twitter.com/cypress');
    cy.get('#edit-profile_website')
      .focus()
      .clear()
      .type('cypress.io');
    cy.get('#edit-profile_mobile')
      .focus()
      .clear()
      .type('+8801999999999');
    cy.get('#edit-profile_password')
      .focus()
      .clear()
      .type('test1234');
    cy.get('#edit-profile_newPassword')
      .focus()
      .clear()
      .type('test1234');
    cy.get('button[type="submit"]')
      .should('contain.text', 'Update')
      .click();
    cy.get('.ant-message-success > span').should(
      'contain.text',
      'Profile updated'
    );

    cy.get('#edit-profile_password')
      .focus()
      .clear()
      .type('123456');
    cy.get('#edit-profile_newPassword')
      .focus()
      .clear()
      .type('123456');
    cy.get('button[type="submit"]')
      .should('contain.text', 'Update')
      .click();
    cy.get('.ant-message-success > span').should(
      'contain.text',
      'Profile updated'
    );
  });
});
