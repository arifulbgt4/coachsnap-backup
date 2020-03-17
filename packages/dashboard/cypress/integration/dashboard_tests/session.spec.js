/// <reference types="Cypress" />

context('session', () => {
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
    cy.get('#coordinated_singleEvent').click();
    cy.get('.ant-select-selection__rendered').click();
    cy.get('.single-session-time:nth-child(1)').click();
    cy.get('.create #coordinated_description')
      .focus()
      .clear()
      .type('Testing Session Description');

    cy.get('.session-form-btn > .ant-btn-primary').click();
  });

  it('Click open a session modal', () => {
    cy.get(
      '.ant-drawer-body > .scrollbar-container > .ant-list > .ant-spin-nested-loading > .ant-spin-container > .ant-list-items > .ant-list-item'
    )
      .last()
      .click();
  });

  it('Edits the session', () => {
    cy.get(
      '[style="padding: 0px 24px 0px 0px;"] > :nth-child(1) > .ant-form-item-control-wrapper > .ant-form-item-control > .ant-form-item-children > #coordinated_name'
    )
      .focus()
      .clear()
      .type('Session Type Edited...');

    cy.get('#coordinated_singleEvent').click();

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
    cy.get('#coordinated_location')
      .focus()
      .clear()
      .type('Jatrabari, Dhaka');
    cy.get('.update #coordinated_description')
      .last()
      .focus()
      .clear()
      .type('Session Description is edited');
    cy.get('.session-form-btn > .ant-btn-primary').click();
  });

  it('Deletes a session', () => {
    cy.get('.session-form-btn > .ant-btn-danger').click();
    cy.get('.ant-popover-buttons > .ant-btn-primary').click();
    cy.get('.ant-message-success > span').should(
      'contain.text',
      'Successfully Deleted Session'
    );
    cy.get('.session-list-footer > .ant-btn').click();
  });

  it('Opens the calendar page', () => {
    cy.get('.ant-menu > :nth-child(2)').click();
  });

  it('Fills up the session form and submits it', () => {
    cy.get('.calendar-box > :nth-child(2) > :nth-child(3)').click('topLeft');
    cy.get(
      '#coordinated_session_type > .ant-select-selection > .ant-select-selection__rendered'
    ).click();
    cy.get('.ant-select-dropdown-menu > :nth-child(2)').click();
    cy.get('#coordinated_name')
      .focus()
      .clear()
      .type('Testing Session');
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
    cy.get('#coordinated_duration')
      .focus()
      .clear()
      .type('50');
    cy.get('#coordinated_maxSeats')
      .focus()
      .clear()
      .type('100');
    cy.get('#coordinated_cost')
      .focus()
      .clear()
      .type('200');
    cy.get('#coordinated_location')
      .focus()
      .clear()
      .type('Dhaka, Bangladesh');
    cy.get('#coordinated_description')
      .focus()
      .clear()
      .type('Testing Session Description');
    cy.get('.session-form-btn > .ant-btn-primary').dblclick({ force: true });
    cy.wait(1500);
  });

  it('Click open a session modal', () => {
    cy.get(
      '.calendar-box > :nth-child(2) > :nth-child(3) > :nth-child(3)'
    ).click();
  });

  it('Opens a dropdown', () => {
    cy.get('.drop-down > .ant-btn').click();
  });

  it('Opens Session Edit Modal', () => {
    cy.get('.modal-opener').click();
  });

  it('Edits the session', () => {
    cy.get('#coordinated_name')
      .focus()
      .clear()
      .type('Session type edited');

    cy.get('#coordinated_singleEvent').click();
    cy.get('#coordinated_location')
      .focus()
      .clear()
      .type('Fakirapul, Dhaka');
    cy.get('#coordinated_description')
      .focus()
      .clear()
      .type('Edited Testing Session Description');
    cy.get('.session-form-btn > .ant-btn-primary').click();
    cy.get('.ant-modal-close-x > .anticon > svg').click();
  });

  it('Deletes a session', () => {
    cy.get(
      '.calendar-box > :nth-child(2) > :nth-child(3) > :nth-child(3)'
    ).click();
    cy.get('.drop-down > .ant-btn').click();
    cy.get('.ant-dropdown-menu > :nth-child(2)').click();
    cy.get('.ant-popover-buttons > .ant-btn-primary').click();
    cy.get('.ant-message-success > span').should(
      'contain.text',
      'Successfully Deleted Session'
    );
  });
});
