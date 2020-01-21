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
              // - String renderCell -> maps to FIELD.RENDER function
              // - Object renderCell -> maps to FIELD.TYPE recursive Render by matching values
              //                     -> can optionally specify `default` FIELD.RENDER function
              renderCell: {
                values: {
                  'Adjusted Fixed': {
                    view: 'Row',
                    items: [
                      {view: 'Text', fill: true, children: 'Adjusted Fixed'},
                      {
                        view: 'Col',
                        fill: true,
                        className: 'bg-grey padding',
                        items: [
                          {view: 'Input', label: 'UW Exception Dollar Amount', type: 'number'},
                        ]
                      },
                    ]
                  },
                  'Adjusted Variable': {
                    view: 'Row',
                    items: [
                      {view: 'Text', fill: true, children: 'Adjusted Variable'},
                      {
                        view: 'Col',
                        fill: true,
                        className: 'bg-grey padding',
                        items: [
                          {view: 'Input', label: 'Risk Adjustment Percent', type: 'number'},
                        ]
                      },
                    ]
                  },
                },
                // default: 'Currency',
              },
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
          ],
          rows: []
        }
      ]
    }
  ]
}
