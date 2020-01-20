export default {
  view: 'Expand',
  title: 'Admin Expenses',
  className: 'border-gradient-h-right',
  expanded: true,
  items: [
    {
      view: 'Col',
      className: 'padding',
      items: [
        {
          view: 'Title',
          children: 'Fully Insured'
        },
        {
          view: 'Input',
          className: 'margin-bottom',
          label: 'Number of claims per employee',
          name: 'adminExpenses.perEmployeeClaims',
          type: 'number',
          min: 1
        },
        {
          view: 'Table',
          name: 'adminCosts',
          headers: [
            {
              id: 'adminCategory',
              classNameCell: 'uppercase',
              renderCell: 'TitleWithFilter',
              title: 'Description'
            },
            {
              id: 'annualAmt',
              className: 'right',
              classNameCell: 'right',
              renderCell: 'Currency',
              title: 'Annual Amount'
            },
            {
              id: 'premiumPct',
              className: 'right',
              classNameCell: 'right',
              renderCell: 'Percent',
              title: '% of Premium'
            },
            {
              id: 'perClaimAmt',
              className: 'right',
              classNameCell: 'right',
              renderCell: 'Currency',
              title: 'Per Claim'
            },
            {
              id: 'perEmployeeAmt',
              className: 'right',
              classNameCell: 'right',
              renderCell: 'Currency',
              title: 'Per Employee'
            },
          ]
        }
      ]
    }
  ]
}
