import meta from './expand-list_meta'

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
        index: '{index}',
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
      renderCell: 'Percent',
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
      renderCell: 'Currency',
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
  renderItem: meta.renderItem,
}

