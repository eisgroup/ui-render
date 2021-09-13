// noinspection JSUnresolvedFunction

describe(`Demo route`, () => {
  it(`uploads json files`, () => {
    cy.visit('http://localhost:3000/demo')
    cy.upload('example_data.json')
      .then(() => {
        cy.contains('Layout Alpha')
        cy.contains('example_data.json')
        cy.contains('example_meta.json')
      })
  })
})
