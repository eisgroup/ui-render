export default {
  view: 'ExpandList',
  name: 'coverages',
  renderLabel: {
    view: 'Text',
    relativeData: true,
    children: {name: 'coverageID'},
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
                  {view: 'Text', children: {name: 'rate'}, renderLabel: 'Percent'},
                ]
              },
              {
                view: 'Row',
                styles: 'justify padding border-top',
                items: [
                  {view: 'Text', label: 'Annual Premium'},
                  {view: 'Text', children: {name: 'annualPremium'}, renderLabel: 'Currency'},
                ]
              },
            ],
          },
        ]
      },
      {
        view: 'Table',
        name: 'classes',
        headers: [ // -> must be defined if data contains nested tables
          {
            id: 'classID',
            label: 'Class Name',
          },
          {
            id: 'numberOfLives',
            label: 'Number of Participants',
          },
          {
            id: 'totalVolume',
            label: 'Total Volume',
            renderCell: 'float',
          },
          {
            id: 'annualPremium',
            label: 'Annual Premium',
          },
        ],

        // Nested Table (two levels deep)
        renderItem: {
          view: 'Table',
          name: 'rateCards',
          relativeData: true, // use attribute `name` above as key path relative to each Table item's data, not *_data.json
          // headers: [] // -> optional when has no nested tables
        },
      }
    ],
  },
}

