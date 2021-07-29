export const meta = {
  view: 'RowList',
  name: 'coverages',
  styles: 'wrap justify padding-v bg-grey-lightest',
  renderItem: {
    view: 'Col',
    styles: 'padding-largest margin-v bg-white',
    style: {minWidth: '48%'},
    items: [
      {
        view: 'Title',
        label: {name: 'title'}
      },
      {
        view: 'Row',
        styles: 'wrap justify',
        items: [
          {
            view: 'Col',
            styles: {name: 'styles'},
            style: {minWidth: '45%'},
            items: [
              {
                view: 'Title',
                label: {name: 'enrolled'}
              },
              {
                view: 'Text',
                label: 'Enrolled Lives'
              }
            ]
          },
          {
            view: 'Col',
            styles: {name: 'styles'},
            style: {minWidth: '45%'},
            items: [
              {
                view: 'Title',
                label: {name: 'manualPremium'},
                renderLabel: 'Currency',
              },
              {
                view: 'Text',
                label: 'Monthly Manual Premium'
              }
            ]
          },
        ]
      },
      {
        view: 'Row',
        styles: 'wrap spread padding margin-top bg-grey-lighter',
        items: [
          {
            view: 'Col',
            styles: 'margin-small',
            items: [
              {
                view: 'Title',
                label: {name: 'commissions'},
                renderLabel: 'Currency',
              },
              {
                view: 'Text',
                label: 'Commissions',
              }
            ]
          },
          {
            view: 'Col',
            styles: 'margin-small',
            items: [
              {
                view: 'Title',
                label: {name: 'tax'},
                renderLabel: 'Percent',
              },
              {
                view: 'Text',
                label: 'Tax',
              }
            ]
          },
          {
            view: 'Col',
            styles: 'margin-small',
            items: [
              {
                view: 'Title',
                label: {name: 'profit'},
                renderLabel: 'Percent',
              },
              {
                view: 'Text',
                label: 'Profit',
              }
            ]
          },
          {
            view: 'Col',
            styles: 'margin-small',
            items: [
              {
                view: 'Title',
                label: {name: 'expenses'},
                renderLabel: 'Percent',
              },
              {
                view: 'Text',
                label: 'Expenses',
              }
            ]
          },
        ],
      }
    ]
  }
}

export const data = {
  coverages: [
    {
      title: 'Core Coverage',
      enrolled: 55,
      manualPremium: 48250.00,
      commissions: 44.00,
      tax: 0.02,
      profit: 0.04,
      expenses: 0.1,
      styles: 'padding-largest margin-v align-center bg-info-light',
    },
    {
      title: 'Buy-Up Coverage',
      enrolled: 32,
      manualPremium: 23950.00,
      commissions: 24.00,
      tax: 0.09,
      profit: 0.11,
      expenses: 0.96,
      styles: 'padding-largest margin-v align-center bg-warning-light',
    },
  ]
}
