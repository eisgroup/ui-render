export default {
  view: 'ExpandList',
  name: 'coverages',
  renderLabel: {
    view: 'Text',
    children: {
      name: 'coverageID',
      relativeData: true,
    },
  },
  // Each Expand Item
  renderItem: {
    view: 'Col',
    relativeData: true,
    items: [
      {
        view: 'Col',
        styles: 'margin-bottom-small radius',
        items: [
          {
            view: 'Title',
            label: 'Cost Summary',
            styles: 'padding no-margin',
          },
          {
            view: 'Input',
            label: 'Input inside Relative Data',
            name: 'memberAnnualPremium', // relative path
            relativeData: true,
            type: 'number',
            styles: 'padding no-margin',
          },
          {
            view: 'Col',
            styles: 'border radius',
            items: [
              {
                view: 'Row',
                styles: 'justify padding',
                items: [
                  {view: 'Text', label: 'Annual Rate'},
                  {view: 'Text', children: {name: 'rate', relativeData: true}, renderLabel: 'Percent'},
                ]
              }
            ],
          },
        ]
      }
    ],
  },
}

