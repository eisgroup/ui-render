export default {
  view: 'Table',
  name: 'coverages',
  headers: [  // -> must be defined if data contains nested tables, because rendering cells as objects will cause errors
    {
      id: 'coverageID',
      title: 'Coverage Name',
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
      title: 'Contribution Type'
    },
    {
      id: 'fundingStructure.requiredParticipationPrct',
      title: 'Contribution',
      renderCell: 'percent',
    },
    {
      id: 'rate',
      title: 'Quote Rate',
      renderCell: 'double5',
    },
    // {
    //   id: 'rate', // declaring duplicate ID will work, but will give warning in debug console.
    //   title: 'Manual Rate',
    // },
    {
      id: 'annualPremium',
      title: 'Annual Premium',
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
  },
}

