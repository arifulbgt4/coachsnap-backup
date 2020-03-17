/// <reference types="Cypress" />

context('create-session', () => {
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
    cy.get('.ant-form-item-children > .ant-btn-primary')
      .should('contain.text', 'Save')
      .click();
    cy.get('.ant-message-success > span').should(
      'contain.text',
      'Session type created.'
    );
    cy.wait(1500);
  });

  it('Opens session form', () => {
    cy.get(':nth-child(1) > .ant-list-item-meta').click();
    cy.get('.ant-drawer-body > div > button.ant-btn.ant-btn-primary').click();
  });

  it('Creates a session', () => {
    cy.get(
      '[style="padding: 0px 24px 0px 0px;"] > :nth-child(1) > .ant-form-item-control-wrapper > .ant-form-item-control > .ant-form-item-children > #coordinated_name'
    )
      .focus()
      .clear()
      .type('Testing Session');
    cy.get('.ant-calendar-picker-input').click();
    cy.get('.ant-calendar-today-btn').click();

    // start
    cy.get(
      '#coordinated_businessHourStart > .ant-select-selection > .ant-select-selection__rendered'
    ).click();
    cy.get('.ant-select-dropdown-menu-item:nth-child(13)').click();
    cy.get(
      '#coordinated_businessHourStart .ant-select-selection--single'
    ).click();
    cy.get(
      '#coordinated_businessHourEnd > .ant-select-selection > .ant-select-selection__rendered > .ant-select-selection__placeholder'
    ).click();
    cy.get('.ant-select-dropdown-menu-item:nth-child(18)')
      .last()
      .click();

    cy.get('.session-form-btn > .ant-btn-primary').click();
  });

  it('Creates another session', () => {
    cy.get('.ant-drawer-body > div > button.ant-btn.ant-btn-primary').click();
    cy.get(
      '[style="padding: 0px 24px 0px 0px;"] > :nth-child(1) > .ant-form-item-control-wrapper > .ant-form-item-control > .ant-form-item-children > #coordinated_name'
    )
      .focus()
      .clear()
      .type('Testing Session');
    cy.get('.ant-calendar-picker-input').click();
    cy.get('.ant-calendar-current-week > td:nth-child(2)').click();

    // start
    cy.get(
      '#coordinated_businessHourStart > .ant-select-selection > .ant-select-selection__rendered'
    ).click();
    cy.get('.ant-select-dropdown-menu-item:nth-child(13)').click();
    cy.get(
      '#coordinated_businessHourStart .ant-select-selection--single'
    ).click();
    cy.get(
      '#coordinated_businessHourEnd > .ant-select-selection > .ant-select-selection__rendered > .ant-select-selection__placeholder'
    ).click();
    cy.get('.ant-select-dropdown-menu-item:nth-child(18)')
      .last()
      .click();

    cy.get('.session-form-btn > .ant-btn-primary').click();
    cy.get('.session-list-footer > .ant-btn').click();
  });

  it('Logs Out user', () => {
    cy.get('.panel-avatar > .ant-avatar').click();
    cy.get('.overlay-body-logout > .ant-btn').click();
    cy.get('.ant-message-warning > span').should(
      'contain.text',
      'You are now logged out!'
    );
  });
});

context('Book Session', () => {
  it('Goes to public page', () => {
    cy.get('.logo-public').click();
  });

  it('Opens a session', () => {
    cy.get('.coach-cards-row > :nth-child(1)').click();
    cy.wait(2500);
    cy.get('.ant-fullcalendar-current-week > td:nth-child(2) > div').click();
    cy.get('.session-list-area > .ant-row > :nth-child(1)').click();
  });

  it('Reserve a spot', () => {
    cy.get('#booking-form_name')
      .focus()
      .clear()
      .type('Testing Name');
    cy.get('#booking-form_email')
      .focus()
      .clear()
      .type('testing@testingname.com');
    cy.get('.ant-select-selection__placeholder').click();
    cy.get('.ant-select-dropdown-menu-item-active').click();
    cy.get('.ant-btn').click();
    cy.contains('Confirmed');
  });
});
