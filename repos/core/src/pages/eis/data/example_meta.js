import table from './table-nested_meta'

export default {
  view: 'Column',
  className: 'padding',
  items: [
    {
      view: 'Row',
      className: 'wrap spread margin-v',
      items: [
        {
          view: 'Column',
          label: 'Dynamic State Mapping',
          items: [
            {
              view: 'Dropdown',
              name: 'coverage',
              options: 'coverages',
              mapOptions: 'coverageID',
              placeholder: 'Select Coverage',
            },
            {
              view: 'Row',
              items: [
                {
                  view: 'Title',
                  label: 'Coverage chosen:'
                },
                {
                  view: 'Title',
                  className: 'padding-h',
                  label: {name: 'coverages.{state.coverage,0}.coverageID'}
                },
              ]
            },
          ]
        },
        {view: 'Space'},
        {
          view: 'Column',
          label: 'Dynamic Layout',
          items: [
            {
              view: 'Dropdown',
              name: 'layout',
              options: 'layouts',
              mapOptions: 'name',
              placeholder: 'Select Layout',
            },
            {
              view: 'Row',
              items: [
                {
                  view: 'Title',
                  label: 'Plan chosen:'
                },
                {
                  view: 'Title',
                  className: 'padding-h',
                  label: {name: 'layouts.{state.layout,0}.name'}
                },
              ]
            },
            {
              view: 'Tabs',
              activeIndex: {name: '{state.layout,0}'},
              classNameTabs: 'hide',
              items: [
                {
                  content: {
                    view: 'Row',
                    className: 'bg-primary',
                    style: {display: 'block', width: 100, height: 100},
                  }
                },
                {
                  content: {
                    view: 'Row',
                    items: [
                      {
                        view: 'Col',
                        className: 'bg-grey',
                        style: {display: 'block', width: 100, height: 100},
                      },
                      {
                        view: 'Col',
                        className: 'bg-primary-light',
                        style: {display: 'block', width: 100, height: 100},
                      },
                      {
                        view: 'Col',
                        className: 'bg-primary',
                        style: {display: 'block', width: 100, height: 100},
                      }
                    ]
                  }
                }
              ]
            },
          ]
        },
      ]
    },
    {...table},
  ]
}

