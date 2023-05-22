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
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
import 'cypress-file-upload'

// Upload meta.json and data.json files by name
// @example:
//    cy.upload('example_data.json', 'example_meta.json')
//    cy.upload('example_data.json') // defaults to example_meta.json
Cypress.Commands.add('upload', (data, meta, path = '../../repos/core/src/pages/main/examples/') => {
  if (!meta) meta = data.replace('data.json', 'meta.json')
  return cy.get('.test-data input[type="file"]')
    .attachFile(`${path}${data}`, {subjectType: 'drag-n-drop'})
    .then(() => {
      return cy.get('.test-meta input[type="file"]')
        .attachFile(`${path}${meta}`, {subjectType: 'drag-n-drop'})
    })
})
