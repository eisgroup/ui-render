export default {
  view: 'Col',
  items: [
    {
      view: 'Expand',
      title: 'Admin Expenses',
      className: 'border-gradient-h-right',
      expanded: false,
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
    },
    {
      view: 'Expand',
      renderTitle: {
        view: 'Row',
        className: 'middle',
        items: [
          {
            view: 'Text', children: 'Rate Details - ', className: 'margin-right-small'
          },
          {
            view: 'Dropdown',
            name: 'planCalculations.0.planName',
            options: ['ALACARTE', 'GOLD'],
          }
        ]
      },
      className: 'border-gradient-h-right',
      expanded: true,
      items: [
        {
          view: 'Tabs',
          items: [
            {
              tab: 'Demographic',
              content: {
                view: 'Col',
                items: [
                  {view: 'Title', children: 'Summary'},
                  {
                    view: 'Row',
                    items: [
                      // {view: 'PieChart'}
                    ]
                  },
                  {view: 'Title', children: 'Area Factors'},
                ]
              }
            },
            {
              tab: 'Factors',
              content: {
                view: 'Col',
                items: [
                  {view: 'Title', children: 'Factors'},
                  {
                    view: 'Row',
                    items: [
                      // {view: 'Table'}
                    ]
                  },
                  {view: 'Title', children: 'PPO'},
                ]
              }
            }
          ]
        }
      ]
    }
  ]
}
