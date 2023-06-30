import uploadButton from 'core/src/pages/main/examples/upload_meta'
import { cloneDeep } from 'ui-utils-pack'
import ExperienceRating from './canopy_meta_ExperienceRating'
import Demographic from './canopy_meta_Demographic'
import Rates from './canopy_meta_Rates'

const orange = 'rgb(236, 155, 68)'
const primary = 'rgb(67, 156, 208)'
const primaryLight = 'rgb(211, 241, 253)'
const primaryLighter = 'rgb(231, 246, 253)'
const fontSize = 20 // header nav
const hidden = {display: 'none'}
const hiddenHeader = {
  classNameHeader: 'invisible',
  style: cloneDeep(hidden),
}

// Common ------------------------------
const dropdownPlan = {
  view: 'Dropdown',
  name: 'plan',
  options: {
    name: 'request.policy.plans',
    relativeData: false,
  },
  mapOptions: 'planName',
  compact: true,
}
const iconChevronDown = {
  view: 'Icon',
  name: 'chevron-down',
  style: {
    color: primary,
    fontSize: 14,
  },
}
const styleHeaderText = {
  className: 'margin-left-larger margin-right-smaller',
  style: {
    color: primary,
    fontSize,
  }
}
const inputCurrency = {
  type: 'number',
  format: 'currency',
  icon: {
    view: 'Text',
    className: 'icon',
    children: '$',
    // showIf: {},
  },
  className: 'border-on-hover',
  lefty: true,
}
const inputDate = {
  type: 'date',
  format: 'date',
}
const inputYesNo = {
  type: 'toggle',
  valueTrue: 'Yes',
  valueFalse: 'No',
  labelTrue: 'Yes',
  labelFalse: 'No',
}
const inputPercent = {
  type: 'number',
  format: 'percent',
  parse: 'percent',
  unit: '%',
}
const inputTrueFalse = {
  type: 'toggle',
  labelTrue: 'Yes',
  labelFalse: 'No',
}
const headlessTable = {
  view: 'Table',
  className: 'striped',
  headers: [
    {
      id: 'Description',
      ...cloneDeep(hiddenHeader),
    },
    {
      id: 'Input',
      ...cloneDeep(hiddenHeader),
    },
  ],
}
const censusTableInputProps = {
  view: 'Input',
  className: 'border-on-hover',
}
const inputGender = {
  type: 'select',
  options: ['Male', 'Female'],
  compact: true,
}
const inputPlan = {
  type: 'select',
  options: {
    name: 'request.policy.plans',
    relativeData: false,
  },
  mapOptions: 'planName',
  compact: true,
}
const inputSalaryMode = {
  type: 'select',
  options: ['Hourly', 'Daily', 'Weekly', 'Bi-Weekly', 'Monthly', 'Quarterly', 'Annual'],
  compact: true,
}
const inputState = {
  type: 'select',
  search: true,
  options: [
    'AK',
    'AL',
    'AR',
    'AZ',
    'CA',
    'CO',
    'CT',
    'DC',
    'DE',
    'FL',
    'GA',
    'HI',
    'IA',
    'ID',
    'IL',
    'IN',
    'KS',
    'KY',
    'LA',
    'MA',
    'MD',
    'ME',
    'MI',
    'MN',
    'MO',
    'MS',
    'MT',
    'NC',
    'ND',
    'NE',
    'NH',
    'NJ',
    'NM',
    'NV',
    'NY',
    'OH',
    'OK',
    'OR',
    'PA',
    'PR',
    'RI',
    'SC',
    'SD',
    'TN',
    'TX',
    'UT',
    'VA',
    'VT',
    'WA',
    'WI',
    'WV',
    'WY',
  ],
  compact: true,
}
const inputCommType = {
  type: 'select',
  options: [
    'Flat',
    'Percent',
  ]
}
const inputCensus = {
  type: 'select',
  options: [
    'Eligible',
    'Enrolled'
  ]
}
const inputRateBasis = {
  type: 'select',
  options: [
    'Per1000Benefit',
    'PercentageOfTotalPremium',
    'PerUnit',
  ]
}
const inputRateFormat = {
  type: 'select',
  options: [
    'Composite',
    'AgeBandedTobacco',
    'AgeBandedUniTobacco',
  ]
}

// Components ---------------------------
const calculateButton = {
  view: 'Button',
  className: 'primary box-shadow round',
  children: 'Calculate',
  onClick: 'submit',
}
const clickCalculate = (title) => ({
  view: 'Col',
  className: 'card-glass margin-auto margin-v-small',
  items: [
    {
      view: 'Col',
      className: 'radius bg-neutral padding center',
      items: [
        {
          view: 'Text',
          children: `Click the button below to calculate ${title}`,
          className: 'padding no-padding-top',
        },
        cloneDeep(calculateButton),
      ]
    }
  ]
})

// Input --------------------------------
const tableClassHeader = {
  label: '',
  classNameCell: 'margin-left-small bold'
}
const expandProps = {
  className: 'bg-neutral radius margin-smallest no-border',
  expanded: true,
}
const inputTableProps = {
  view: 'Input',
  relativeData: false,
  // className: 'border-on-hover',
}
const inputTableRelative = {
  view: 'Input',
  className: 'border-on-hover',
}
const inputTable = {
  view: 'Table',
  className: 'as-layout margin-right',
  vertical: true,
  _data: [
    {name: 'request.policy', relativeData: false},
  ],
}
const policyTable = {
  ...cloneDeep(inputTable),
  headers: [
    {
      id: 'policyID',
      label: 'Policy ID',
      renderCell: {
        ...inputTableProps,
        name: 'request.policy.policyNumber',
      }
    },
    {
      id: 'rateEffectiveDate',
      label: 'Policy Effective Date',
      renderCell: {
        ...inputTableProps,
        ...inputDate,
        name: 'request.policy.rateEffectiveDate',
      }
    },
    {
      id: 'requestDate',
      label: 'Policy Request Date',
      renderCell: {
        ...inputTableProps,
        ...inputDate,
        name: 'request.policy.requestDate',
      }
    },
  ],
}

const designTable = {
  ...cloneDeep(inputTable),
  // name: 'plans',
  headers: [
    {
      id: 'classNumber',
      ...cloneDeep(tableClassHeader),
    },
    {
      id: 'benefitMultiple',
      label: 'Benefit Multiple',
      renderCell: {
        name: `benefitMultiple`,
        type: 'number',
        ...inputTableRelative,
      }
    },
    {
      id: `paymentFrequency`,
      label: 'Payment Frequency',
      renderCell: {
        name: `paymentFrequency`,
        ...inputTableRelative,
      }
    },
    {
      id: `fcl`,
      label: 'FCL',
      renderCell: {
        name: `fcl`,
        type: 'number',
        ...inputTableRelative,
        ...inputCurrency
      }
    },
    {
      id: `reinsuranceLevel`,
      label: 'Reinsurance Level',
      renderCell: {
        name: `reinsuranceLevel`,
        type: 'number',
        ...inputTableRelative,
        ...inputCurrency
      }
    }
  ]
}
const benefitPath = 'benefitStructure.benefitAmountOptions[0].'
const benefitTable = {
  view: 'Table',
  name: 'classes',
  className: 'as-layout striped margin-v',
  fill: true,
  vertical: true,
  headers: [
    {
      id: 'classNumber',
      ...cloneDeep(tableClassHeader),
    },
    {
      id: `${benefitPath}participantType`,
      label: 'Participant Type',
      renderCell: {
        name: `${benefitPath}participantType`,
        ...inputTableRelative,
      }
    },
    {
      id: `${benefitPath}benefitType`,
      label: 'Benefit Type',
      renderCell: {
        name: `${benefitPath}benefitType`,
        ...inputTableRelative,
      }
    },
    {
      id: `${benefitPath}benefitMin`,
      label: 'Benefit Min',
      renderCell: {
        name: `${benefitPath}benefitMin`,
        ...inputTableRelative,
        ...cloneDeep(inputCurrency),
      }
    },
    {
      id: `${benefitPath}benefitMax`,
      label: 'Benefit Max',
      renderCell: {
        name: `${benefitPath}benefitMax`,
        ...inputTableRelative,
        ...cloneDeep(inputCurrency),
      }
    },
    {
      id: `${benefitPath}specifiedAmts[0]`,
      label: 'Specified Amounts',
      renderCell: {
        name: `${benefitPath}specifiedAmts[0]`,
        ...inputTableRelative,
        type: 'number',
      }
    },
    {
      id: `${benefitPath}salaryMultiplier`,
      label: 'Salary Multiplier',
      renderCell: {
        name: `${benefitPath}salaryMultiplier`,
        ...inputTableRelative,
        type: 'number',
      }
    },
    {
      id: `${benefitPath}roundingMethod`,
      label: 'Rounding Method',
      renderCell: {
        name: `${benefitPath}roundingMethod`,
        ...inputTableRelative,
      }
    },
    {
      id: `${benefitPath}flatAmount`,
      label: 'Flat Amount',
      renderCell: {
        name: `${benefitPath}flatAmount`,
        ...inputTableRelative,
        type: 'number',
      }
    },
    {
      id: `${benefitPath}pctOfEmpAmount`,
      label: 'Percent Of Employee Amount',
      renderCell: {
        name: `${benefitPath}pctOfEmpAmount`,
        ...inputTableRelative,
        type: 'number',
      }
    },
    {
      id: `${benefitPath}maxBenefitAmount`,
      label: 'Max Benefit Amount',
      renderCell: {
        name: `${benefitPath}maxBenefitAmount`,
        ...inputTableRelative,
        type: 'number',
      }
    },
    {
      id: `${benefitPath}additionalAmount`,
      label: 'Additional Amount',
      renderCell: {
        name: `${benefitPath}additionalAmount`,
        ...inputTableRelative,
        type: 'number',
      }
    },
  ]
}
const fundingPath = 'fundingStructure.'
const fundingTable = {
  view: 'Table',
  name: 'classes',
  className: 'as-layout striped margin-v',
  fill: true,
  vertical: true,
  headers: [
    {
      id: 'classNumber',
      ...cloneDeep(tableClassHeader),
    },
    {
      id: `${fundingPath}contributionType`,
      label: 'Contribution Type',
      renderCell: {
        name: `${fundingPath}contributionType`,
        ...inputTableRelative,
      }
    },
    {
      id: `${fundingPath}contributionBasis`,
      label: 'Contribution Basis',
      renderCell: {
        name: `${fundingPath}contributionBasis`,
        ...inputTableRelative,
      }
    },
    {
      id: `${fundingPath}sponsorContributionAmt`,
      label: 'Sponsor Contribution Amount',
      renderCell: {
        name: `${fundingPath}sponsorContributionAmt`,
        ...inputTableRelative,
        ...cloneDeep(inputCurrency),
      }
    },
    {
      id: `${fundingPath}participantContributionPercent`,
      label: 'Participant Contribution Percent',
      renderCell: {
        name: `${fundingPath}participantContributionPercent`,
        ...inputTableRelative,
        ...cloneDeep(inputPercent),
      }
    },
  ]
}

const inputTabList = {
  view: 'TabList',
  name: 'request.policy.plans',
  buttoned: true,
  className: 'margin-top',
  classNameTabs: 'margin-auto bg-neutral radius margin-v-smallest box-shadow',
  classNameContent: 'no-padding',
  renderLabel: {
    view: 'Text',
    children: {
      name: 'planName',
      relativeData: true,
    },
  },
  renderItem: {
    view: 'Col',
    items: [
      {
        view: 'Expand',
        label: 'Design Plan',
        ...cloneDeep(expandProps),
        items: [
          designTable,
        ],
      }
    ],
  },
}

// Census -------------------------------
const censusTable = {
  ...cloneDeep(headlessTable),
  name: 'request.policy.census',
  headers: [
    {
      id: 'employeeID',
      label: 'Employee ID',
      classNameHeader: 'padding-left-small',
      // renderCell: {
      //   view: 'Expand',
      //   name: '{value}',
      //   index: '{index}',
      //   onClick: 'handleItemExpand',
      // }
    },
    {
      id: 'age',
      label: 'Age',
      renderCell: {
        ...censusTableInputProps,
        type: 'number',
        name: 'age',
      }
    },
    {
      id: 'gender',
      label: 'Gender',
      classNameHeader: 'padding-left-small',
      renderCell: {
        ...censusTableInputProps,
        ...cloneDeep(inputGender),
        name: 'gender',
      }
    },
    {
      id: 'salary',
      label: 'Salary',
      classNameHeader: 'padding-left-small',
      renderCell: {
        ...censusTableInputProps,
        ...inputCurrency,
        name: 'salary',
      }
    },
    {
      id: 'location',
      label: 'Location',
      renderCell: {
        ...censusTableInputProps,
        type: 'text',
        name: 'location',
      }
    },
    {
      id: 'occupation',
      label: 'Occupation',
      renderCell: {
        ...censusTableInputProps,
        type: 'text',
        name: 'occupation',
      }
    },
  ]
}

// LTS -------------------------------
const ltaTable = {
  ...cloneDeep(headlessTable),
  name: 'request.policy.lta',
  headers: [
    {
      id: 'employeeID',
      label: 'Employee ID',
      classNameHeader: 'padding-left-small',
      // renderCell: {
      //   view: 'Expand',
      //   name: '{value}',
      //   index: '{index}',
      //   onClick: 'handleItemExpand',
      // }
    },
    {
      id: 'age',
      label: 'Age',
      renderCell: {
        ...censusTableInputProps,
        type: 'number',
        name: 'age',
      }
    },
    {
      id: 'gender',
      label: 'Gender',
      classNameHeader: 'padding-left-small',
      renderCell: {
        ...censusTableInputProps,
        ...cloneDeep(inputGender),
        name: 'gender',
      }
    },
    {
      id: 'dateOfFirstAbsence',
      label: 'Date of first absence',
      classNameHeader: 'padding-left-small',
      renderCell: {
        ...censusTableInputProps,
        ...inputDate,
        name: 'dateOfFirstAbsence',
      }
    },
    {
      id: 'reason',
      label: 'Reason of absence',
      renderCell: {
        ...censusTableInputProps,
        type: 'text',
        name: 'reason',
      }
    },
    {
      id: 'cost',
      label: 'Cost',
      renderCell: {
        ...censusTableInputProps,
        ...inputCurrency,
        type: 'text',
        name: 'cost',
      }
    },
  ]
}

// Tabs --------------------------------
const inputTab = {
  view: 'Col',
  className: 'card-glass margin-auto margin-v max-size',
  items: [
    {
      view: 'Expand',
      label: 'Policy Information',
      ...cloneDeep(expandProps),
      items: [
        {
          view: 'Row',
          className: 'fill-width top wrap padding',
          items: [
            policyTable
          ]
        },
      ],
    },
    inputTabList,
  ]
}
const censusTab = {
  view: 'Row',
  className: 'top spread wrap margin-v margin-h',
  items: [
    {
      view: 'Col',
      className: 'card-glass margin',
      items: [
        censusTable,
      ],
    },
  ]
}

const ltaTab = {
  view: 'Row',
  className: 'top spread wrap margin-v margin-h',
  items: [
    {
      view: 'Col',
      className: 'card-glass margin',
      items: [
        ltaTable,
      ],
    }
  ]
}

const header = {
  view: 'Row',
  className: 'middle justify bg-neutral box-shadow',
  items: [
    {
      view: 'Row',
      className: 'fill middle padding padding-v-small',
      items: [
        {
          view: 'Link',
          to: '/',
          items: [
            {
              view: 'Image',
              name: 'earth.png',
              style: {
                height: 36,
              },
            },
          ]
        },
        {
          view: 'Text',
          children: 'Individuals & Families',
          ...cloneDeep(styleHeaderText),
        },
        cloneDeep(iconChevronDown),
        {
          view: 'Text',
          children: 'Business Owners',
          ...cloneDeep(styleHeaderText),
        },
        cloneDeep(iconChevronDown),
        {
          view: 'Text',
          children: 'What We Do',
          ...cloneDeep(styleHeaderText),
        },
        cloneDeep(iconChevronDown),
        {
          view: 'Text',
          children: 'Resources',
          ...cloneDeep(styleHeaderText),
        },
        cloneDeep(iconChevronDown),
        {
          view: 'Text',
          children: 'File a Claim',
          ...cloneDeep(styleHeaderText),
        },
      ]
    },
    cloneDeep(calculateButton),
    {
      view: 'Button',
      className: 'primary box-shadow no-radius margin-left-larger',
      style: {
        backgroundColor: orange,
        height: '100%',
        border: 0,
        paddingLeft: 20,
        paddingRight: 20,
        fontSize,
      },
      children: 'Get a Quote',
      onClick: {
        name: 'popupOpen',
        args: [
          'getQuote',
        ]
      }
    },
    {
      view: 'Popup',
      id: 'getQuote', // is used to open popup remotely
      items: [
        {
          view: 'Title',
          className: 'margin-bottom',
          children: 'Get Quote Placeholder'
        },
        {
          view: 'Image',
          name: 'earth.png',
        },
        {
          view: 'Text',
          className: 'margin-v',
          children: 'Lorem ipsum dolor sit amet, sed do ut la...'
        }
      ]
    },
  ]
}

export default {
  view: 'Col',
  className: 'fill max-size',
  items: [
    header,
    {
      view: 'Tabs',
      classNameTabs: 'card-glass card-glass--inner-bg-neutral margin-auto',
      className: 'buttoned padding-v',
      fill: true,
      centerTabs: true,
      // activeIndex: 5,
      items: [
        {
          tab: 'Input',
          content: inputTab,
        },
        {
          tab: 'Census',
          content: {
            view: 'Col',
            items: [
              censusTab,
            ]
          },
        },
        {
          tab: 'LTA',
          content: {
            view: 'Col',
            items: [
              ltaTab,
            ]
          },
        },
        {
          tab: 'Experience Rating',
          content: ExperienceRating,
        },
        {
          tab: 'Demographic Summary',
          content: {
            view: 'Col',
            items: [
              Demographic,
              clickCalculate('Demographic Summary'),
            ]
          },
        },
        {
          tab: 'Rates',
          content: {
            view: 'Col',
            className: 'padding-h',
            items: [
              Rates,
              clickCalculate('Rates'),
            ]
          },
        },
      ]
    },
  ]
}
