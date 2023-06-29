export const data = {
  reportName: 'Final Manual Rate (with UW Adj)',
  groupLabel: 'Tier',
  labelById: {
    'employee': 'Employee/Spouse/Child',
    'employer': 'Employer',
  },
  matrixTable: [
    {tier: 'employee', ageBand: '0-19', undiffRate: 1.05, smokerRate: 1.09, nonSmokerRate: 1.04},
    {tier: 'employer', ageBand: '0-19', undiffRate: 0.06, smokerRate: 0.03, nonSmokerRate: 0.07},
    {tier: 'employee', ageBand: '19-29', undiffRate: 1.15, smokerRate: 1.19, nonSmokerRate: 1.14},
    {tier: 'employer', ageBand: '19-29', undiffRate: 0.16, smokerRate: 0.13, nonSmokerRate: 0.17},
  ],
  // >>> matrixTable converts to this internally:
  // _ui_converts_to_this_matrixTable: [
  //   {
  //     ageBand: '0-19',
  //     undiffRate_employee: 1.05, smokerRate_employee: 1.09, nonSmokerRate_employee: 1.04,
  //     undiffRate_employer: 0.06, smokerRate_employer: 0.03, nonSmokerRate_employer: 0.07
  //   },
  //   {
  //     ageBand: '19-29',
  //     undiffRate_employee: 1.15, smokerRate_employee: 1.19, nonSmokerRate_employee: 1.14,
  //     undiffRate_employer: 0.16, smokerRate_employer: 0.13, nonSmokerRate_employer: 0.17
  //   },
  // ]
}

export const meta = {
  view: 'Table',
  name: 'matrixTable',
  styles: 'margin',
  extraHeaders: [
    [
      {
        label: '', // leave the first column empty for `Age`
        classNameHeader: 'bg-white',
      },
      {
        colSpan: 99999, // set this to extremely high number to span all columns
        label: {
          name: 'reportName',
          relativeData: false,
        },
        className: 'center bg-white',
      }
    ]
  ],
  headers: [
    {
      id: 'undiffRate',
      label: 'Undiff',
      className: 'center border-left',
      classNameCell: 'center border-left',
    },
    {
      id: 'smokerRate',
      label: 'Smoker',
      className: 'center border-left',
      classNameCell: 'center border-left',
    },
    {
      id: 'nonSmokerRate',
      label: 'Non',
      className: 'center border-h',
      classNameCell: 'center border-h',
    },
  ],
  group: {
    by: { // required
      id: 'tier', // required
      label: {
        name: 'labelById',
        relativeData: false,
      },
      className: 'center bg-success-light border-h',
      // renderLabel: 'Currency',
    },
    header: { // required, common header to group items by
      id: 'ageBand', // required
      label: 'Age',
      className: 'border-right', // to achieve thick border effect
      classNameCell: 'bold border-right', // to achieve thick border effect
    },
    extraHeader: { // custom header above `Age`
      label: {
        name: 'groupLabel',
        relativeData: false,
      },
      className: 'bg-success-light border-right',
    }
    // sort: '-year', // todo
  },
}

// The minimum required config
export const metaRequired = {
  view: 'Table',
  name: 'matrixTable',
  headers: [
    {
      id: 'undiffRate',
    },
    {
      id: 'smokerRate',
    },
    {
      id: 'nonSmokerRate',
    },
  ],
  group: {
    by: { // required
      id: 'tier', // required
    },
    header: { // required, common header to group items by
      id: 'ageBand', // required
    },
  },
}
