describe(`Examples`, () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/docs/examples')
  })

  it(`Decimal Points have correct rounding and truncated values`, () => {
    cy.get('#decimal').click().get('.ui__render').within(() => {
      cy.contains('.7123456789')
      cy.contains('.71234')
      cy.get('table').within(() => {
        cy.contains('.23')
      })
    })
  })

  it(`Dropdown has options and changes option when selected`, () => {
    cy.get('#dropdown').click().get('.ui__render').within(() => {
      cy.contains('Gold')
      const dropdown = cy.get('.ui.selection.dropdown')
      dropdown.click()
      dropdown.contains('Silver').click()
      dropdown.contains('Silver')
      dropdown.contains('Gold').should('not.exist')
    })
  })

  it(`Dynamic Layout changes with dropdown selection`, () => {
    cy.get('#layout').click().get('.ui__render').within(() => {
      cy.get('.bg-primary').should('exist')
      cy.get('.bg-primary-light').should('not.exist')
      cy.get('.bg-grey').should('not.exist')

      // Change Layout
      const dropdown = cy.get('.ui.selection.dropdown')
      dropdown.click()
      dropdown.contains('Layout Beta').click()
      cy.get('.bg-primary').should('exist')
      cy.get('.bg-primary-light').should('exist')
      cy.get('.bg-grey').should('exist')
    })
  })

  it(`Dynamic List renders as two sections`, () => {
    cy.get('#list').click().get('.ui__render').within(() => {
      cy.get('input').should('have.length', 2)
      cy.get('input').first().should('have.value', 378)
      cy.get('input').last().should('have.value', 478)
    })
  })

  it(`Expand List renders as two collapsible sections`, () => {
    cy.get('#expandList').click().get('.ui__render').within(() => {
      cy.get('.app__expand').should('have.length', 2)
      cy.get('.app__expand').first().click().within(() => {
        cy.get('input').should('have.value', 378)
      })
      cy.get('.app__expand').last().click().within(() => {
        cy.get('input').should('have.value', 478)
      })
    })
  })

  it(`Tab List renders as two tabbed sections`, () => {
    cy.get('#tabList').click().get('.ui__render').within(() => {
      cy.get('.tabs__item').should('have.length', 2)
      cy.get('.tabs__item').first().click()
      cy.get('input').should('have.value', 378)
      cy.get('.tabs__item').last().click()
      cy.get('input').should('have.value', 478)
    })
  })

  it(`Tabs renders correctly`, () => {
    cy.get('#tabs').click().get('.ui__render').within(() => {
      cy.get('.tabs__item').should('have.length', 2)
      cy.contains('Non-contributory')
      cy.get('.tabs__item').last().click()
      cy.contains('Contributory')
    })
  })

  it(`Tabs Buttoned renders correctly`, () => {
    cy.get('#tabsButtoned').click().get('.ui__render').within(() => {
      cy.get('.tabs__item').should('have.length', 2)
      cy.contains('Non-contributory')
      cy.get('.tabs__item').last().click()
      cy.contains('Contributory')
    })
  })

  it(`Table Nested within Table Collapse/Expand All one level deep`, () => {
    cy.get('#tableNested').click().get('.ui__render').within(() => {
      cy.get('.table').should('have.length', 1)
      cy.get('.app__expand').first().click()
      cy.get('.table').should('have.length', 2)
      cy.get('.app__expand').last().click()
      cy.get('.table').should('have.length', 3)
      cy.get('.app__expand').last().click()
      cy.get('.table').should('have.length', 4)
      // Collapse/Expand all nested tables on level deep
      cy.contains('Expand All').click()
        .click() // untick all
      cy.get('.table').should('have.length', 1)
      cy.contains('Expand All').click()
      cy.get('.table').should('have.length', 3)
    })
  })

  it(`Table Rows as Columns (Vertical Layout)`, () => {
    cy.get('#tableVertical').click().get('.ui__render').within(() => {
      cy.get('.table').should('have.length', 1)
      cy.contains('Contribution Type').parents('th')
        .next().children().children().should('have.text', 'Non-contributory').parents('td')
        .next().children().children().should('have.text', 'Contributory')
    })
  })

  it(`Table with Custom Data renders input with value`, () => {
    cy.get('#tableExtraItems').click().get('.ui__render').within(() => {
      cy.get('.table').should('have.length', 1).within(() => {
        cy.get('input').should('have.value', 0.7123456789)
      })
    })
  })

  it(`Table with Matrix Data renders items grouped into sections`, () => {
    cy.get('#tableMatrix').click().get('.ui__render').within(() => {
      cy.get('.table').should('have.length', 1).within(() => {
        // Headers
        cy.get('thead tr:first-child th:nth-child(2) .text').first().should('have.text', 'Final Manual Rate (with UW Adj)')
        cy.get('thead tr:nth-child(2) th:nth-child(1) .text').first().should('have.text', 'Tier')
        cy.get('thead tr:nth-child(2) th:nth-child(2) .text').first().should('have.text', 'Employee/Spouse/Child')
        cy.get('thead tr:nth-child(2) th:nth-child(3) .text').first().should('have.text', 'Employer')
        cy.get('thead tr:nth-child(3) th:nth-child(1) .text').first().should('have.text', 'Age')
        cy.get('thead tr:nth-child(3) th:nth-child(2) .text').first().should('have.text', 'Undiff')
        cy.get('thead tr:nth-child(3) th:nth-child(3) .text').first().should('have.text', 'Smoker')
        cy.get('thead tr:nth-child(3) th:nth-child(4) .text').first().should('have.text', 'Non')
        cy.get('thead tr:nth-child(3) th:nth-child(5) .text').first().should('have.text', 'Undiff')
        cy.get('thead tr:nth-child(3) th:nth-child(6) .text').first().should('have.text', 'Smoker')
        cy.get('thead tr:nth-child(3) th:nth-child(7) .text').first().should('have.text', 'Non')
        // Content
        cy.get('tbody tr:nth-child(1) td:nth-child(1) .text').first().should('have.text', '0-19')
        cy.get('tbody tr:nth-child(1) td:nth-child(2) .text').first().should('have.text', '1.05')
        cy.get('tbody tr:nth-child(1) td:nth-child(3) .text').first().should('have.text', '1.09')
        cy.get('tbody tr:nth-child(1) td:nth-child(4) .text').first().should('have.text', '1.04')
        cy.get('tbody tr:nth-child(1) td:nth-child(5) .text').first().should('have.text', '0.06')
        cy.get('tbody tr:nth-child(1) td:nth-child(6) .text').first().should('have.text', '0.03')
        cy.get('tbody tr:nth-child(1) td:nth-child(7) .text').first().should('have.text', '0.07')
        // Second row
        cy.get('tbody tr:nth-child(2) td:nth-child(1) .text').first().should('have.text', '19-29')
        // Not more rows
        cy.get('tbody tr:nth-child(3) td:nth-child(1) .text').should('not.exist')
      })
    })
  })

  it(`Pie Chart renders legend and total label`, () => {
    cy.get('#pieChart').click().get('.ui__render').within(() => {
      cy.get('.app__pie-chart').should('have.length', 2)
      cy.get('.app__pie-chart--ref').first().within(() => {
        cy.contains('19')
        cy.contains('Total')
        cy.contains('65+')
        cy.get('.app__pie-chart__ref__item ').should('have.length', 6)
      })
      cy.get('.app__pie-chart--ref').last().within(() => {
        cy.contains('Label')
        cy.contains('Anything')
        cy.contains('65+')
        cy.get('.app__pie-chart__ref__item ').should('have.length', 6)
      })
    })
  })

  it(`Show If Condition works correctly`, () => {
    cy.get('#showIf').click().get('.ui__render').within(() => {
      cy.contains('Gold')
        .next().should('have.text', 'You see this because <"showIf": "coverageID"> resolves to \'data.coverages.{index}.coverageID\', which is considered \'Truthy\'')
        .next().should('have.text', 'And here is how to evaluate it <"showIf": {"equal": "Gold"}>')
      cy.contains('Silver')
        .next().should('have.text', 'You see this because <"showIf": "coverageID"> resolves to \'data.coverages.{index}.coverageID\', which is considered \'Truthy\'')
        .next().should('have.text', 'Finally, only Silver shows up because <"equal": {"name": "coverages.1.coverageID", "relativeData": false}> evaluates to \'Silver\'')
    })
  })

  it(`Input renders labels with required star, icon and unit`, () => {
    cy.get('#input').click().get('.ui__render').within(() => {
      cy.get('label').should('have.text', 'Annual Premium')
      cy.get('input').should('have.value', 12600)
      cy.get('i.icon-dollar').should('exist')
      cy.get('.input__unit .text.invisible').should('have.text', '12600')
      cy.contains('USD')
    })
  })

  it(`Invalid Array Data renders without error`, () => {
    cy.get('#invalidArray').click().get('.ui__render').within(() => {
      cy.contains('Coverage Summary')
      cy.get('table').should('have.length', 2)
    })
  })
})
