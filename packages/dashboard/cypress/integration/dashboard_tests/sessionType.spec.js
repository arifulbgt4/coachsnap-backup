/// <reference types="Cypress" />

context('sessionType', () => {
  beforeEach(() => {
    cy.login('coach@coachsnap.com', '123456');
  });

  it('visits to session page', () => {
    cy.visit('http://localhost:1234');
    cy.waitUntil(() => cy.get('.go-coach-panel'));
    cy.get('.go-coach-panel')
      .should('contain.text', 'Coach Panel')
      .click();
    cy.waitUntil(() => cy.get('.ant-menu'));
    cy.get('.ant-menu > :nth-child(4)')
      .should('not.have.class', 'ant-menu-item-selected')
      .click();
  });

  it('Removes existing sessionTypes if there any', () => {
    let sessionCount;
    cy.get('.ant-card-head-title').then(elem => {
      sessionCount = parseInt(elem[0].innerText.match(/\d+/)[0], 10);
      if (sessionCount) {
        for (let i = 1; i <= sessionCount; i++) {
          cy.get(
            `:nth-child(1) > .ant-list-item-action > :nth-child(2) > .ant-btn`
          ).click();
          cy.contains('Yes').click();
        }
      }
    });
  });

  it('open the session type form', () => {
    cy.get('.ant-card-extra > .ant-btn')
      .should('have.class', 'ant-btn-primary')
      .click();
  });

  it('create a session type', () => {
    cy.get('#coordinated_name')
      .should('have.class', 'ant-input')
      .focus()
      .type('Testing Session Type')
      .should('have.value', 'Testing Session Type');

    cy.get('#coordinated_description')
      .should('have.class', 'ant-input')
      .focus()
      .type('Testing Description')
      .should('have.value', 'Testing Description');

    cy.get('#coordinated_cost')
      .should('have.class', 'ant-input')
      .focus()
      .type('30')
      .should('have.value', '30');
    cy.get('#coordinated_duration')
      .should('have.class', 'ant-input')
      .focus()
      .type('25')
      .should('have.value', '25');
    cy.get('#coordinated_maxSeats')
      .should('have.class', 'ant-input')
      .focus()
      .type('60')
      .should('have.value', '60');
    cy.wait(1000);
    cy.get('.ant-form-item-children > .ant-btn-primary')
      .should('contain.text', 'Save')
      .click();
    cy.get('.ant-message-success > span').should(
      'contain.text',
      'Session type created.'
    );
  });

  it('Edit a session type', () => {
    cy.reload();
    cy.get(
      ':nth-child(1) > .ant-list-item-action > :nth-child(1) > .ant-btn'
    ).click();

    cy.get('#coordinated_name')
      .should('have.class', 'ant-input')
      .focus()
      .clear()
      .type('Edited Testing Session Type')
      .should('have.value', 'Edited Testing Session Type');

    cy.get('#coordinated_description')
      .should('have.class', 'ant-input')
      .focus()
      .clear()
      .type('Edited Testing Description')
      .should('have.value', 'Edited Testing Description');

    // cy.get(
    //   '#coordinated_businessHourStart > .ant-select-selection > .ant-select-selection__rendered'
    // ).click();
    // cy.get('div > div > ul > .business-hour-start:nth-child(5)').click();
    // cy.get(
    //   '#coordinated_businessHourEnd > .ant-select-selection > .ant-select-selection__rendered'
    // ).click();
    // cy.get('div > div > ul > .business-hour-end:nth-child(29)').click();
    cy.get('#coordinated_cost')
      .should('have.class', 'ant-input')
      .focus()
      .clear()
      .type('25')
      .should('have.value', '25');
    cy.get('#coordinated_duration')
      .should('have.class', 'ant-input')
      .focus()
      .clear()
      .type('30')
      .should('have.value', '30');
    cy.get('#coordinated_maxSeats')
      .should('have.class', 'ant-input')
      .focus()
      .clear()
      .type('100')
      .should('have.value', '100');
    cy.wait(1000);
    cy.get('.ant-form-item-children > .ant-btn-primary')
      .should('contain.text', 'Save')
      .click();

    cy.get('.ant-message-success > span').should(
      'contain.text',
      'Session type updated.'
    );
  });

  it('Deletes a session Type', () => {
    cy.get(
      ':nth-child(1) > .ant-list-item-action > :nth-child(2) > .ant-btn'
    ).click();
    cy.get('.ant-popover-buttons > .ant-btn-primary')
      .should('contain.text', 'Yes')
      .click();
    cy.get('.ant-message-success > span').should(
      'contain.text',
      'Successfully Deleted Session Type'
    );
  });
});
