/**
 * DYNAMIC COMPONENTS JSON =====================================================
 * =============================================================================
 */
export default [
  {
    name: 'Rating Details',
    elementConfigs: [
      {
        view: 'Dropdown',
        displayName: 'Plan Dropdown',
        name: 'active.plan', // -> must be unique key path identifier that does not exist in *_data.json
        options: 'coverages', // -> key path pointing to array in *_data.json
        mapOptions: 'coverageID', // -> key path pointing to human readable value within each option (used as label)
      },
      {
        view: 'Text',
        displayName: 'Plan Text',
        label: {
          name: 'coverages.{state.active.plan,0}.coverageID'
        },
      },
      // {
      //   view: 'Table',
      //   displayName: 'Layouts Table',
      //   name: 'layouts'
      // },
      {
        view: 'Table',
        displayName: 'Coverages Table',
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
        ],
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
      },
    ]
  },
]
