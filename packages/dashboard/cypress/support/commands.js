// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

import 'cypress-wait-until';

Cypress.Commands.add('login', (email, password) => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:4000/',
    body: {
      operationName: 'signin',
      variables: {
        email,
        password,
      },
      query: `mutation signin($email: String!, $password: String!) {
        signin(email: $email, password: $password) {
          token
          user {
            verified
          }
        }
      }`,
    },
  }).then(resp => {
    cy.wait(1000);
    localStorage.setItem('jwtToken', resp.body.data.signin.token);
  });
});
