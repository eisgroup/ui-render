import { __DEV__, cloneDeep, SIZE_MB_16 } from 'ui-utils-pack'

const buttonTrash = {
  view: 'Button',
  styles: 'transparent',
  items: [
    {
      view: 'Icon',
      name: 'trash'
    },
  ],
  onClick: 'removeData'
}

const dropdownPlan = {
  'view': 'Dropdown',
  'name': 'plan',
  'options': {
    name: 'RatesAndExposure',
    relativeData: false
  },
  'mapOptions': 'PlanName',
  'compact': true
}

const dropdownPeriod = {
  'view': 'Dropdown',
  'name': 'period',
  'options': {
    name: 'ReportPeriods',
    relativeData: false
  },
  'mapOptions': 'PeriodName',
  'compact': true
}

const tableCellInputCurrency = {
  view: 'Input',
  format: 'currency',
  type: 'number',
  icon: {
    view: 'Text',
    className: 'icon',
    children: '$',
  },
  className: 'border-on-hover',
  lefty: true,
  required: true,
}

const tablePeriod = {
  'view': 'Table',
  'name': 'dataKind.Period',
  'styles': 'margin-v no-border',
  'headers': [
    {
      'id': 'PeriodName',
      'label': 'common:period',
      'classNameHeader': 'padding-left-small border-right'
    },
    {
      'id': 'StartDate',
      'label': 'common:start_date',
      'classNameHeader': 'padding-left-small'
    },
    {
      'id': 'EndDate',
      'label': 'common:end_date',
      'classNameHeader': 'padding-left-small'
    },
    {
      'id': 'Weight',
      'label': 'common:weight',
      'classNameHeader': 'padding-left-small'
    },
    {
      'id': 'NumberOfMonth',
      'label': 'common:number_of_month',
      'classNameHeader': 'padding-left-small'
    },
    {
      'id': 'null',
      'label': '',
      'styles': 'align-center'
    }
  ],
  'renderItemCells': {
    'view': 'Data',
    'kind': 'Period',
    'embedded': true,
    'meta': {
      'view': 'TableCells',
      'styles': 'no-border-right-last-item',
      'style': {
        'verticalAlign': 'top'
      },
      'items': [
        {
          'view': 'Input',
          'name': 'PeriodName',
          'type': 'text',
          'validate': 'required',
          'styles': 'border-on-hover border-right'
        },
        {
          'view': 'Input',
          'name': 'StartDate',
          format: 'date',
          'type': 'date',
          'validate': 'required',
          'verify': {
            'dataKind': 'Period',
            'validate': [
              {
                'name': 'notWithinRange',
                'args': [
                  'StartDate',
                  'EndDate'
                ]
              }
            ]
          },
          'styles': 'border-on-hover'
        },
        {
          'view': 'Input',
          'name': 'EndDate',
          format: 'date',
          'type': 'date',
          'validate': 'required',
          'verify': {
            'dataKind': 'Period',
            'validate': [
              {
                'name': 'notWithinRange',
                'args': [
                  'StartDate',
                  'EndDate'
                ]
              }
            ]
          },
          'styles': 'border-on-hover'
        },
        {
          'view': 'Input',
          'name': 'Weight',
          'type': 'number',
          'validate': 'required',
          'styles': 'border-on-hover'
        },
        {
          'view': 'Input',
          'name': 'NumberOfMonth',
          'type': 'number',
          'validate': 'required',
          'styles': 'border-on-hover'
        },
        {
          'view': 'Col',
          'items': [
            buttonTrash,
          ]
        }
      ]
    }
  },
  'renderExtraItem': {
    'view': 'Data', // @note: showIf will not work inside Data component because it has no root data access
    'kind': 'Period', // use dynamic `state` instead
    'initialValues': {},
    'embedded': true,
    'meta': {
      'view': 'TableCells',
      styles: 'fade--quarter',
      'style': {
        'verticalAlign': 'top'
      },
      'items': [
        {
          'label': 'common:period',
          'view': 'Input',
          'name': 'PeriodName',
          'type': 'text',
          'validate': 'required'
        },
        {
          'label': 'common:start_date',
          'view': 'Input',
          'name': 'StartDate',
          format: 'date',
          'type': 'date',
          'validate': 'required',
          'verify': {
            'dataKind': 'Period',
            'validate': [
              {
                'name': 'notWithinRange',
                'args': [
                  'StartDate',
                  'EndDate'
                ]
              }
            ]
          },
          'onChange': 'warn'
        },
        {
          'label': 'common:end_date',
          'view': 'Input',
          'name': 'EndDate',
          format: 'date',
          'type': 'date',
          'validate': 'required',
          'verify': {
            'dataKind': 'Period',
            'validate': [
              {
                'name': 'notWithinRange',
                'args': [
                  'StartDate',
                  'EndDate'
                ]
              }
            ]
          }
        },
        {
          'label': 'common:weight',
          'view': 'Input',
          'name': 'Weight',
          'type': 'number',
          'validate': 'required'
        },
        {
          'label': 'common:number_of_month',
          'view': 'Input',
          'name': 'NumberOfMonth',
          'type': 'number',
          'validate': 'required'
        },
        {
          'view': 'Col',
          'items': [
            {
              'view': 'Button',
              'styles': 'a transparent',
              'style': {marginTop: 35},
              'children': 'common:add',
              'onClick': 'addData'
            }
          ]
        }
      ]
    }
  }
}

const tableRatesAndExposure = {
  'view': 'Table',
  'name': 'RatesAndExposure.{state.plan,0}.Rates',
  'styles': 'margin-v no-border',
  'headers': [
    {
      'id': 'Tier',
      'label': 'common:tier',
      'classNameHeader': 'padding-h-small text-align-left border-right',
      'classNameCellWrap': 'padding-smaller border-right'
    },
    {
      'id': 'ExposureCurrentPeriod',
      'label': 'Exposure - Current Period',
      'classNameHeader': 'padding-h-small text-align-left',
      renderCell: {
        ...cloneDeep(tableCellInputCurrency),
        name: 'ExposureCurrentPeriod'
      }
    },
    {
      'id': 'ManualRatesRenewalPeriod',
      'label': 'Manual Rates - Renewal Period',
      'classNameHeader': 'padding-h-small text-align-left',
      'classNameCellWrap': 'padding-small',
      renderCell: 'Currency',
    },
    {
      'id': 'ManualRatesCurrentPeriod',
      'label': 'Manual Rates - Current Period',
      'classNameHeader': 'padding-h-small text-align-left',
      renderCell: {
        ...cloneDeep(tableCellInputCurrency),
        name: 'ManualRatesCurrentPeriod'
      }
    },
    {
      'id': 'ChargeRates1stPeriod',
      'label': 'Charge Rates - 1st Period',
      'classNameHeader': 'padding-h-small text-align-left',
      renderCell: {
        ...cloneDeep(tableCellInputCurrency),
        name: 'ChargeRates1stPeriod'
      }
    },
    {
      'id': 'ChargeRates2ndPeriod',
      'label': 'Charge Rates - 2nd Period',
      'classNameHeader': 'padding-h-small text-align-left',
      renderCell: {
        ...cloneDeep(tableCellInputCurrency),
        name: 'ChargeRates2ndPeriod'
      }
    },
    {
      'id': 'ChargeRates3rdPeriod',
      'label': 'Charge Rates - 3rd Period',
      'classNameHeader': 'padding-h-small text-align-left',
      renderCell: {
        ...cloneDeep(tableCellInputCurrency),
        name: 'ChargeRates3rdPeriod'
      }
    },
  ],
}

const tableHistoricalInformationHeaders = [
  {
    'id': 'BilledPremium',
    'label': 'Billed Premium',
    'classNameHeader': 'padding-h-small text-align-left',
    renderCell: {
      ...cloneDeep(tableCellInputCurrency),
      name: 'BilledPremium'
    }
  },
  {
    'id': 'Exposure',
    'label': 'Exposure',
    'classNameHeader': 'padding-h-small text-align-left',
    renderCell: {
      ...cloneDeep(tableCellInputCurrency),
      name: 'Exposure'
    }
  },
  {
    'id': 'PaidClaims',
    'label': 'Paid Claims',
    'classNameHeader': 'padding-h-small text-align-left',
    renderCell: {
      ...cloneDeep(tableCellInputCurrency),
      name: 'PaidClaims'
    }
  },
  {
    'id': 'CompletionFactor',
    'label': 'Completion Factor',
    'classNameHeader': 'padding-h-small text-align-left',
    renderCell: {
      ...cloneDeep(tableCellInputCurrency),
      name: 'CompletionFactor'
    }
  },
  {
    'id': 'FullyIncurredClaims',
    'label': 'Fully Incurred Claims',
    'classNameHeader': 'padding-h-small text-align-left',
    renderCell: {
      ...cloneDeep(tableCellInputCurrency),
      name: 'FullyIncurredClaims'
    }
  },
  {
    'id': 'IBNR',
    'label': 'IBNR',
    'classNameHeader': 'padding-h-small text-align-left',
    renderCell: {
      ...cloneDeep(tableCellInputCurrency),
      name: 'IBNR'
    }
  },
]

const tableHistoricalInformation = {
  'view': 'Table',
  'name': 'RatesAndExposure.{state.plan,0}.HistoricalInformation',
  'styles': 'margin-v no-border',
  headers: [
    {
      'id': 'PeriodName',
      'label': 'Period',
      'classNameHeader': 'padding-h-small text-align-left border-right',
      'classNameCellWrap': 'border-right'
    },
    ...cloneDeep(tableHistoricalInformationHeaders)
  ],
  renderItem: {
    view: 'Table',
    name: 'DailyInformation',
    headers: [
      {
        'id': 'Date',
        'label': 'Date',
        'classNameHeader': 'padding-h-small text-align-left border-right',
        'classNameCellWrap': 'padding-smaller border-right'
      },
      ...cloneDeep(tableHistoricalInformationHeaders)
    ],
  },
}

const experienceRating = {
  view: 'Col',
  styles: 'bg-neutral padding-larger margin-top-larger',
  items: [
    {
      view: 'Title',
      children: 'common:experience_rating',
      styles: 'padding-v-smaller'
    },
    {
      view: 'Row',
      styles: 'middle',
      items: [
        {
          view: 'Input',
          name: 'ShowExperienceRating',
          id: 'toggleShowExperienceRating',
          styles: 'margin-right-smaller',
          type: 'toggle',
          label: ' ',
          onChange: 'updateDataOnChange',
        },
        {
          view: 'Label',
          htmlFor: 'toggleShowExperienceRating',
          styles: 'bold pointer',
          children: 'Experience Rating'
        }
      ]
    },
    {
      view: 'Row',
      styles: 'wrap margin-top',
      items: [
        // {
        //   view: 'Input',
        //   name: 'ReportByPeriod',
        //   type: 'radio',
        //   value: 'Year',
        //   label: 'Year',
        //   styles: 'margin-right'
        // },
        // {
        //   view: 'Input',
        //   name: 'ReportByPeriod',
        //   type: 'radio',
        //   value: 'Month',
        //   label: 'Month',
        //   styles: 'margin-right'
        // },
        {
          view: 'Button',
          styles: 'margin-right',
          items: [
            {
              view: 'Icon',
              name: 'file-download',
              styles: 'margin-right-smaller'
            },
            {
              view: 'Text',
              children: 'Download File Template'
            },
          ],
          onClick: {
            name: 'download',
            args: [
              // Using path relative to the URL the page is on
              (__DEV__ ? '' : '/ui-render') + '/static/images/ui-architecture.png',
              'optional-file-name-to-save-as.png'
            ]
          }
        },
        {
          view: 'Input',
          name: 'path.to.file', // path in data.json
          type: 'file', // use dropzone file input
          title: 'Upload CSV File', // hint
          classWrap: 'left',
          styles: 'button', // style dropzone as button
          // label: 'Report', // only used in dropzone style when `showTypes = true`
          formats: ['csv'], // required
          maxSize: SIZE_MB_16, // maximum allowed file size in bytes
          multiple: false, // only allow single file upload
          showTypes: false, // disable on hover hint for dropzone
          autoSubmit: true,
          items: [
            {
              view: 'Icon',
              name: 'file-upload',
              styles: 'margin-right-smaller'
            },
            {
              view: 'Text',
              children: 'Upload File'
            },
          ]
        }
      ],
    }
  ]
}

const experiencePeriods = {
  view: 'Col',
  styles: 'bg-neutral padding-larger margin-top-larger',
  showIf: 'ShowExperienceRating',
  items: [
    {
      view: 'Title',
      children: 'Experience Periods',
      styles: 'padding-v-smaller'
    },
    {
      view: 'Row',
      styles: 'wrap margin-bottom-smaller',
      items: [
        {
          'label': 'common:credibility',
          'view': 'Input',
          'name': 'Credibility',
          'type': 'text',
          'placeholder': 'common:title',
          'styles': 'margin-right-larger'
        },
        {
          'label': 'common:trend_assumption',
          'view': 'Input',
          'name': 'TrendAssumption',
          'type': 'text',
          'placeholder': 'Text Example'
        },
      ]
    },
    tablePeriod,
  ],
}

const experienceRatesAndExposure = {
  view: 'Col',
  styles: 'bg-neutral padding-larger margin-top-larger',
  items: [
    {
      view: 'Title',
      children: 'Rates and Exposure',
      styles: 'padding-v-smaller'
    },
    {
      view: 'Row',
      styles: 'left margin-v-smaller',
      items: [
        dropdownPlan,
      ]
    },
    tableRatesAndExposure,
  ],
}

const historicalInformation = {
  view: 'Col',
  styles: 'bg-neutral padding-larger margin-top-larger',
  items: [
    {
      view: 'Row',
      styles: 'wrap bottom justify margin-v-smaller',
      items: [
        {
          view: 'Title',
          children: 'Historical Information',
        },
        dropdownPeriod,
      ]
    },
    {
      ...cloneDeep(tableHistoricalInformation),
      showIf: {
        name: 'ReportPeriods.{state.period,0}.PeriodName',
        equal: 'common:year',
        relativeData: false,
      }
    },
  ],
}

export default {
  view: 'Col',
  items: [
    experienceRating,
    experiencePeriods,
    experienceRatesAndExposure,
    historicalInformation,
  ]
}
