export default {
  view: 'Table',
  name: 'coverages',
  headers: [  // -> must be defined if data contains nested tables, because rendering cells as objects will cause errors
    {
      id: 'coverageID',
      label: 'Coverage Name',
      // Custom render function for Table Cells (columns in default layout)
      renderCell: {
        view: 'Expand',
        name: '{value}',
        id: 'coverageID',
        // toggle extra table item expansion (row in default layout)
        onClick: 'handleItemExpand', // function is injected by TableView instance on render
        // items: [{}], // can also make it expand any content inside clicked cell
      },
    },
    {
      id: 'fundingStructure.contributionType',
      label: 'Contribution Type'
    },
    {
      id: 'fundingStructure.requiredParticipationPrct',
      label: 'Contribution',
      renderCell: 'percent',
    },
    {
      id: 'rate',
      label: 'Quote Rate',
      renderCell: 'double5',
    },
    // {
    //   id: 'rate', // declaring duplicate ID will work, but will give warning in debug console.
    //   label: 'Manual Rate',
    // },
    {
      id: 'annualPremium',
      label: 'Annual Premium',
      renderCell: 'currency',
    },
    {
      id: '#',
      renderHeader: {
        view: 'Input',
        name: 'expandAllStates', // unique name that does not exist in *_data.json
        type: 'checkbox',
        label: 'Expand All',
        onChange: 'handleToggleExpandAll', // function is injected by TableView instance on render
      },
    },
  ],

  // Nested Table (one level deep)
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
            view: 'Col',
            styles: 'border radius',
            items: [
              {
                view: 'Row',
                styles: 'justify padding',
                items: [
                  {view: 'Text', label: 'Annual Rate'},
                  {view: 'Text', label: {name: 'rate'}, renderLabel: 'percent'},
                ]
              },
              {
                view: 'Row',
                styles: 'justify padding border-top',
                items: [
                  {view: 'Text', label: 'Annual Premium'},
                  {view: 'Text', label: {name: 'annualPremium'}, renderLabel: 'currency'},
                ]
              },
            ],
          },
        ]
      },
      {
        view: 'Table',
        name: 'classes',
        relativeData: true, // use attribute `name` above as key path relative to each Table item's data, not *_data.json
        headers: [ // -> must be defined if data contains nested tables
          {
            id: 'classID',
            label: 'Class Name',
            // Custom render function for Table Cells (columns in default layout)
            renderCell: {
              view: 'Expand',
              name: '{value}',
              id: 'classID',
              // toggle extra table item expansion (row in default layout)
              onClick: 'handleItemExpand', // function is injected by TableView instance on render
              // items: [{}], // can also make it expand any content inside clicked cell
            },
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

