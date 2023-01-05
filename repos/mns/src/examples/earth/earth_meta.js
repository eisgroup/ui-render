import uploadButton from 'core/src/pages/eis/examples/upload_meta'
import { cloneDeep } from 'ui-utils-pack'
import Demographic from './earth_meta_Demographic'
import ExperienceRating from './earth_meta_ExperienceRating'
import ManualRating from './earth_meta_ManualRating'
import Rates from './earth_meta_Rates'

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
        name: 'request.policy.policyID',
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
const policyTable2 = {
  ...cloneDeep(inputTable),
  headers: [
    // {
    //   id: 'policyNumber',
    //   label: 'Policy Number',
    //   renderCell: {
    //     ...inputTableProps,
    //     name: 'request.policy.policyNumber',
    //   }
    // },
    {
      id: 'situsState',
      label: 'Situs State',
      renderCell: {
        ...inputTableProps,
        ...cloneDeep(inputState),
        name: 'request.policy.situsState',
      }
    },
    {
      id: 'zip',
      label: 'ZIP Code',
      renderCell: {
        ...inputTableProps,
        type: 'number',
        name: 'request.policy.zip',
      }
    },
    // {
    //   id: 'adjustedFactors.industryFactor',
    //   label: 'Industry Factor',
    //   renderCell: {
    //     ...inputTableProps,
    //     type: 'number',
    //     name: 'request.policy.industryFactor',
    //   }
    // },
    // {
    //   id: 'adjustedFactors.caseSizeFactor',
    //   label: 'Case Size Factor',
    //   renderCell: {
    //     ...inputTableProps,
    //     type: 'number',
    //     name: 'request.policy.caseSizeFactor',
    //   }
    // },
    {
      id: 'sicCode',
      label: 'SIC Code (4-digit)',
      renderCell: {
        ...inputTableProps,
        type: 'number',
        name: 'request.policy.sicCode',
      }
    },
    // {
    //   id: 'SICCodeDescription',
    //   label: 'SIC Code - description',
    //   renderCell: {
    //     ...inputTableProps,
    //     name: 'request.policy.SICCodeDescription',
    //   }
    // },
    {
      id: 'rateGuaranteeMonths',
      label: 'Rate Guarantee Months',
      renderCell: {
        ...inputTableProps,
        type: 'number',
        name: 'request.policy.rateGuaranteeMonths',
      }
    },
    {
      id: 'numberOfEligibleLives',
      label: 'Number Of Eligible Lives',
      renderCell: {
        ...inputTableProps,
        type: 'number',
        name: 'request.policy.numberOfEligibleLives',
      }
    },
    // {
    //   id: 'CaseType',
    //   label: 'Case Type',
    //   renderCell: {
    //     ...inputTableProps,
    //     name: 'request.policy.CaseType',
    //   }
    // },
    // {
    //   id: 'BusinessType',
    //   label: 'Business Type',
    //   renderCell: {
    //     ...inputTableProps,
    //     name: 'request.policy.BusinessType',
    //   }
    // },
    // {
    //   id: 'EAP',
    //   label: 'EAP',
    //   renderCell: {
    //     ...inputTableProps,
    //     name: 'request.policy.EAP',
    //   }
    // },
    // {
    //   id: 'Everest',
    //   label: 'Everest',
    //   renderCell: {
    //     ...inputTableProps,
    //     name: 'request.policy.Everest',
    //   }
    // },
    // {
    //   id: 'numberOfEligibleLives',
    //   label: 'Number of Experience Exhibits',
    //   renderCell: {
    //     ...inputTableProps,
    //     name: 'request.policy.numberOfEligibleLives',
    //     type: 'number',
    //   }
    // },
    // {
    //   id: 'ClosedRetireeAgingCalculation',
    //   label: 'Closed Retiree Aging Calculation?',
    //   renderCell: {
    //     ...inputTableProps,
    //     ...inputYesNo,
    //     name: 'request.policy.ClosedRetireeAgingCalculation',
    //   }
    // },
    // {
    //   id: 'FirstTimeBuyer',
    //   label: 'First Time Buyer?',
    //   renderCell: {
    //     ...inputTableProps,
    //     ...inputYesNo,
    //     name: 'request.policy.FirstTimeBuyer',
    //   }
    // },
    // {
    //   id: 'SaveCalculations',
    //   label: 'Save Calculations?',
    //   renderCell: {
    //     ...inputTableProps,
    //     ...inputYesNo,
    //     name: 'request.policy.SaveCalculations',
    //   }
    // },
  ],
}
const policyTable3 = {
  ...cloneDeep(inputTable),
  style: {
    marginTop: 5,
    marginBottom: 5,
  },

  headers: [
    // {
    //   id: 'policyNumber',
    //   label: 'Policy Number',
    //   renderCell: {
    //     ...inputTableProps,
    //     name: 'request.policy.policyNumber',
    //   }
    // },
    // {
    //   id: 'adjustedFactors.industryFactor',
    //   label: 'Industry Factor',
    //   renderCell: {
    //     ...inputTableProps,
    //     type: 'number',
    //     name: 'request.policy.industryFactor',
    //   }
    // },
    // {
    //   id: 'adjustedFactors.caseSizeFactor',
    //   label: 'Case Size Factor',
    //   renderCell: {
    //     ...inputTableProps,
    //     type: 'number',
    //     name: 'request.policy.caseSizeFactor',
    //   }
    // },
    {
      id: 'priorCoverage',
      label: 'Has Prior Coverage?',
      renderCell: {
        ...inputTableProps,
        ...inputTrueFalse,
        name: 'request.policy.priorCoverage',
      }
    },
    // {
    //   id: 'CaseType',
    //   label: 'Case Type',
    //   renderCell: {
    //     ...inputTableProps,
    //     name: 'request.policy.CaseType',
    //   }
    // },
    // {
    //   id: 'BusinessType',
    //   label: 'Business Type',
    //   renderCell: {
    //     ...inputTableProps,
    //     name: 'request.policy.BusinessType',
    //   }
    // },
    // {
    //   id: 'EAP',
    //   label: 'EAP',
    //   renderCell: {
    //     ...inputTableProps,
    //     name: 'request.policy.EAP',
    //   }
    // },
    // {
    //   id: 'Everest',
    //   label: 'Everest',
    //   renderCell: {
    //     ...inputTableProps,
    //     name: 'request.policy.Everest',
    //   }
    // },
    // {
    //   id: 'numberOfEligibleLives',
    //   label: 'Number of Experience Exhibits',
    //   renderCell: {
    //     ...inputTableProps,
    //     name: 'request.policy.numberOfEligibleLives',
    //     type: 'number',
    //   }
    // },
    // {
    //   id: 'ClosedRetireeAgingCalculation',
    //   label: 'Closed Retiree Aging Calculation?',
    //   renderCell: {
    //     ...inputTableProps,
    //     ...inputYesNo,
    //     name: 'request.policy.ClosedRetireeAgingCalculation',
    //   }
    // },
    // {
    //   id: 'FirstTimeBuyer',
    //   label: 'First Time Buyer?',
    //   renderCell: {
    //     ...inputTableProps,
    //     ...inputYesNo,
    //     name: 'request.policy.FirstTimeBuyer',
    //   }
    // },
    // {
    //   id: 'SaveCalculations',
    //   label: 'Save Calculations?',
    //   renderCell: {
    //     ...inputTableProps,
    //     ...inputYesNo,
    //     name: 'request.policy.SaveCalculations',
    //   }
    // },
  ],
}
const policyTable4 = {
  ...cloneDeep(inputTable),
  // showIf: {
  //   name: 'request.policy.priorCoverage',
  //   relativeData: false,
  // },
  headers: [
    {
      id: 'priorID',
      label: 'Policy ID',
      renderCell: {
        ...inputTableProps,
        name: 'request.policy.priorID',
      }
    },
    {
      id: 'priorEffectiveDate',
      label: 'Effective Date',
      renderCell: {
        ...inputTableProps,
        ...inputDate,
        name: 'request.policy.priorEffectiveDate',
      }
    },
    {
      id: 'priorrequestDate',
      label: 'Request Date',
      renderCell: {
        ...inputTableProps,
        ...inputDate,
        name: 'request.policy.priorrequestDate',
      }
    },
  ]
}
const planPath = 'cov'
const coveragesTable = {
  view: 'Table',
  name: 'request.policy.plans',
  className: 'as-layout striped margin-v',
  fill: true,
  vertical: true,
  headers: [
    {
      id: 'coverages[0].classes[0].classNumber',
      ...cloneDeep(tableClassHeader),
      classNameCell: 'margin-left-smaller bold',
    },
    {
      id: `${planPath}.termLife`,
      label: 'Term Life',
      renderCell: {
        view: 'Input',
        ...inputTrueFalse,
        name: `${planPath}.termLife`,
      }
    },
    {
      id: `${planPath}.spouseTermLife`,
      label: 'Spouse Term Life',
      renderCell: {
        view: 'Input',
        ...inputTrueFalse,
        name: `${planPath}.spouseTermLife`,
      }
    },
    {
      id: `${planPath}.childTermLife`,
      label: 'Child Term Life',
      renderCell: {
        view: 'Input',
        ...inputTrueFalse,
        name: `${planPath}.childTermLife`,
      }
    },
    {
      id: `${planPath}.add`,
      label: 'ADD',
      renderCell: {
        view: 'Input',
        ...inputTrueFalse,
        name: `${planPath}.add`,
      }
    },
    {
      id: `${planPath}.dependentADD`,
      label: 'Dependent ADD',
      renderCell: {
        view: 'Input',
        ...inputTrueFalse,
        name: `${planPath}.dependentADD`,
      }
    },
    {
      id: `${planPath}.dependentTermLife`,
      label: 'Dependent Term Life',
      renderCell: {
        view: 'Input',
        ...inputTrueFalse,
        name: `${planPath}.dependentTermLife`,
      }
    },
    {
      id: '#',
      label: '',
      renderCell: {
        view: 'Row',
        className: 'left',
        items: [
          {
            view: 'Button',
            className: 'a transparent margin-left',
            items: [
              {
                view: 'Icon',
                name: 'trash',
              }
            ]
          }
        ]
      }
    }
  ],
  extraItems: [
    {
      'coverages[0].classes[0].classNumber': {
        view: 'Input',
        name: '#',
        placeholder: 'New Class',
        style: {
          marginLeft: -10,
          maxWidth: 115,
        },
      },
      // [`${planPath}.termLife`]: ' + ',
      // [`${planPath}.spouseTermLife`]: ' ',
      // [`${planPath}.childTermLife`]: ' ',
      // [`${planPath}.add`]: ' ',
      // [`${planPath}.dependentADD`]: ' ',
      // [`${planPath}.dependentTermLife`]: ' ',
      '#': {
        view: 'Row',
        className: 'left',
        items: [
          {
            view: 'Button',
            className: 'a transparent margin-left-smaller',
            children: 'Add',
          }
        ]
      },
    },
  ]
}
const commPath = 'commission.'
const commissionsTable = {
  view: 'Table',
  name: 'request.policy.plans[1].coverages',
  className: 'striped no-border margin-v',
  fill: true,
  headers: [
    {
      id: `coverageType`,
      label: 'Coverage Type',
      // className: 'margin-left',
      // renderCell: {
      //   view: 'Expand',
      //   name: '{value}',
      //   index: '{index}',
      //   onClick: 'handleItemExpand',
      // }
    },
    {
      id: `${commPath}commissionType`,
      label: 'Commission Type',
      className: 'margin-left-smaller',
      renderCell: {
        ...inputTableRelative,
        name: `${commPath}commissionType`,
        ...inputCommType,
      }
    },
    {
      id: `${commPath}commissionAmount`,
      label: 'Amount',
      className: 'margin-left-smaller',
      renderCell: {
        ...inputTableRelative,
        name: `${commPath}commissionAmount`,
        ...cloneDeep(inputCurrency),
      }
    },
    {
      id: `${commPath}commissionPercent`,
      label: 'Percent',
      className: 'margin-left-smaller',
      renderCell: {
        ...inputTableRelative,
        name: `${commPath}commissionPercent`,
        ...cloneDeep(inputPercent),
      }
    },
    // {
    //   id: `${commPath}isCommissionSchedules`,
    //   label: 'Commission Schedules',
    //   className: 'text-align-left',
    //   renderCell: {
    //     view: 'Input',
    //     name: `${commPath}isCommissionSchedules`,
    //     ...inputTrueFalse,
    //   }
    // }
  ],
  // renderItem: {
  //   view: 'Table',
  //   name: `${commPath}commissionSchedules`,
  //   className: 'striped no-border',
  //   headers: [
  //     {
  //       id: 'bandIndex',
  //       label: 'Band Index',
  //       renderCell: {
  //         ...inputTableRelative,
  //         name: 'bandIndex',
  //         type: 'number',
  //       }
  //     },
  //     {
  //       id: 'rangeStart',
  //       label: 'Range Start',
  //       renderCell: {
  //         ...inputTableRelative,
  //         name: 'rangeStart',
  //         type: 'number',
  //       }
  //     },
  //     {
  //       id: 'rangeEnd',
  //       label: 'Range End',
  //       renderCell: {
  //         ...inputTableRelative,
  //         name: 'rangeEnd',
  //         type: 'number',
  //       }
  //     },
  //     {
  //       id: 'gradedCommissionPercent',
  //       label: 'Graded Commission Percent',
  //       renderCell: {
  //         ...inputTableRelative,
  //         name: 'gradedCommissionPercent',
  //         ...cloneDeep(inputPercent),
  //       }
  //     },
  //     {
  //       id: 'action',
  //       label: '',
  //       renderCell: {
  //         view: 'Row',
  //         className: 'left',
  //         items: [
  //           {
  //             view: 'Button',
  //             className: 'a transparent',
  //             items: [
  //               {
  //                 view: 'Icon',
  //                 name: 'trash',
  //               }
  //             ]
  //           }
  //         ]
  //       }
  //     },
  //   ],
  //   extraItems: [
  //     {
  //       bandIndex: {
  //         view: 'Input',
  //         type: 'number',
  //         name: '#bandIndex',
  //       },
  //       rangeStart: {
  //         view: 'Input',
  //         type: 'number',
  //         name: '#rangeStart',
  //       },
  //       rangeEnd: {
  //         view: 'Input',
  //         type: 'number',
  //         name: '#rangeEnd',
  //       },
  //       gradedCommissionPercent: {
  //         view: 'Input',
  //         ...cloneDeep(inputPercent),
  //         name: '#gradedCommissionPercent',
  //       },
  //       action: {
  //         view: 'Row',
  //         className: 'left',
  //         items: [
  //           {
  //             view: 'Button',
  //             className: 'a transparent',
  //             children: 'Add'
  //           }
  //         ]
  //       }
  //     }
  //   ]
  // }
}
const designTable = {
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
      id: 'censusType',
      label: 'Census Type',
      renderCell: {
        name: `censusType`,
        ...inputTableRelative,
        ...cloneDeep(inputCensus),
      }
    },
    {
      id: `assumedParticipationPct`,
      label: 'Assumed Participation Percent',
      renderCell: {
        name: `assumedParticipationPct`,
        ...inputTableRelative,
        ...cloneDeep(inputPercent),
      }
    },
    {
      id: `lossOfLifeBenefitPct`,
      label: 'Loss of Life Benefit Percent',
      renderCell: {
        name: `lossOfLifeBenefitPct`,
        ...inputTableRelative,
        ...cloneDeep(inputPercent),
      }
    },
    {
      id: `terminationAge`,
      label: 'Termination Age',
      renderCell: {
        name: `terminationAge`,
        type: 'number',
        ...inputTableRelative,
      }
    },
    {
      id: `rateBasis`,
      label: 'Rate Basis',
      renderCell: {
        name: `rateBasis`,
        ...inputTableRelative,
        ...cloneDeep(inputRateBasis),
      }
    },
    {
      id: 'rateFormat',
      label: 'Rate Format',
      renderCell: {
        name: `rateFormat`,
        ...inputTableRelative,
        ...cloneDeep(inputRateFormat),
      }
    },
    {
      id: `giAmount`,
      label: 'Amount',
      renderCell: {
        name: `giAmount`,
        ...inputTableRelative,
        ...cloneDeep(inputCurrency),
      }
    },
    {
      id: `portability`,
      label: 'Portability',
      renderCell: {
        name: `portability`,
        ...inputTableRelative,
        ...cloneDeep(inputTrueFalse),
      }
    },
    {
      id: `conversion`,
      label: 'Conversion',
      renderCell: {
        name: `conversion`,
        ...inputTableRelative,
        ...cloneDeep(inputTrueFalse),
      }
    },
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
  name: 'request.policy.tabList',
  buttoned: true,
  className: 'margin-top',
  classNameTabs: 'margin-auto bg-neutral radius margin-v-smallest box-shadow',
  classNameContent: 'no-padding',
  renderLabel: {
    view: 'Text',
    children: {
      name: 'coverageType',
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
        // expanded: true,
        items: [
          designTable,
        ],
      },
      {
        view: 'Expand',
        label: 'Benefit Structure',
        ...cloneDeep(expandProps),
        items: [
          benefitTable,
        ],
      },
      {
        view: 'Expand',
        label: 'Funding Structure',
        ...cloneDeep(expandProps),
        items: [
          fundingTable,
        ],
      },
    ],
  },
}

// Census -------------------------------
const censusTable = {
  ...cloneDeep(headlessTable),
  name: 'request.policy.census',
  // Sorting does not work with inputs currently, due to index
  // sorts: [
  //   {id: 'employeeID', order: 0},
  //   {id: 'gender', order: 0},
  //   {id: 'dob', order: 0},
  //   // {id: 'age', order: 0},
  //   {id: 'smokerIndicator', order: 0},
  //   {id: 'salaryMode', order: 0},
  //   {id: 'isRetiree', order: 0},
  //   {id: 'salaryAmount', order: 0},
  // ],
  headers: [
    {
      id: 'employeeID',
      label: 'Employee ID',
      classNameHeader: 'padding-left-small',
      renderCell: {
        view: 'Expand',
        name: '{value}',
        index: '{index}',
        onClick: 'handleItemExpand',
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
      id: 'dob',
      label: 'Date of Birth',
      classNameHeader: 'padding-left-small',
      renderCell: {
        ...censusTableInputProps,
        ...inputDate,
        name: 'dob',
      }
    },
    // {
    //   id: 'age',
    //   label: 'Age',
    //   renderCell: {
    //     ...censusTableProps,
    //     ...inputDate,
    //     name: 'age',
    //   }
    // },
    {
      id: 'smokerIndicator',
      label: 'Smoker Indicator',
      renderCell: {
        ...censusTableInputProps,
        ...inputTrueFalse,
        name: 'smokerIndicator',
      }
    },
    {
      id: 'salaryMode',
      label: 'Salary Mode',
      classNameHeader: 'padding-left-small',
      renderCell: {
        ...censusTableInputProps,
        ...inputSalaryMode,
        name: 'salaryMode',
      }
    },
    {
      id: 'isRetiree',
      label: 'Is Retiree',
      renderCell: {
        ...censusTableInputProps,
        ...inputTrueFalse,
        name: 'isRetiree',
      }
    },
    {
      id: 'salaryAmount',
      label: 'Salary Amount',
      classNameHeader: 'padding-left-small',
      renderCell: {
        ...censusTableInputProps,
        ...cloneDeep(inputCurrency),
        name: 'salaryAmount',
      }
    },
    // {
    //   id: '#',
    //   renderHeader: {
    //     view: 'Checkbox',
    //     label: 'Expand All',
    //     onChange: 'handleToggleExpandAll',
    //     defaultValue: false,
    //   },
    // },
  ],
  renderItem: {
    ...cloneDeep(headlessTable),
    name: 'employeeCoverages',
    headers: [
      {
        id: 'coverageId',
        label: 'Coverage ID',
      },
      {
        id: 'eligible',
        label: 'Eligible',
        renderCell: {
          ...censusTableInputProps,
          ...inputTrueFalse,
          name: 'eligible',
        }
      },
      {
        id: 'elected',
        label: 'Elected',
        renderCell: {
          ...censusTableInputProps,
          ...inputTrueFalse,
          name: 'elected',
        }
      },
      {
        id: 'plan',
        label: 'Plan',
        renderCell: {
          ...censusTableInputProps,
          ...inputPlan,
          name: 'plan',
        }
      },
      {
        id: 'classNumber',
        label: 'Class Number',
        classNameHeader: 'padding-left-small',
        renderCell: {
          ...censusTableInputProps,
          name: 'classNumber',
        }
      },
      {
        id: 'censusVolume',
        label: 'Census Volume',
        classNameHeader: 'padding-left-small',
        renderCell: {
          ...censusTableInputProps,
          name: 'censusVolume',
          type: 'number',
        }
      },
      {
        id: 'dependentSpouseCensusVolume',
        label: 'Dependent Spouse Census Volume',
        classNameHeader: 'padding-left-small',
        renderCell: {
          ...censusTableInputProps,
          name: 'dependentSpouseCensusVolume',
          type: 'number',
        }
      },
      {
        id: 'dependentChildCensusVolume',
        label: 'Dependent Child Census Volume',
        classNameHeader: 'padding-left-small',
        renderCell: {
          ...censusTableInputProps,
          name: 'dependentChildCensusVolume',
          type: 'number',
        }
      },
    ]
  }
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
            policyTable,
            policyTable2,
            {
              view: 'Col',
              items: [
                policyTable3,
                policyTable4,
              ],
            }
          ]
        },
      ],
    },
    {
      view: 'Expand',
      label: 'Coverages',
      ...cloneDeep(expandProps),
      items: [
        coveragesTable,
      ],
    },
    {
      view: 'Expand',
      label: 'Commissions',
      ...cloneDeep(expandProps),
      items: [
        commissionsTable,
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
              name: 'aflac.png',
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
          name: 'aflac.png',
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
              {
                view: 'Col',
                className: 'card-glass margin-auto margin-top-small',
                items: [
                  {
                    ...cloneDeep(uploadButton),
                    title: 'Upload Census File',
                    className: 'button bg-white',
                    classWrap: 'center',
                    items: [
                      {
                        view: 'Icon',
                        name: 'file-upload',
                        className: 'margin-right-smaller'
                      },
                      {
                        view: 'Text',
                        children: 'Upload Census File'
                      },
                    ]
                  },
                ]
              },
              censusTab,
            ]
          },
        },
        {
          tab: 'Manual Rating Details',
          content: {
            view: 'Col',
            items: [
              ManualRating,
              clickCalculate('Manual Rating Details'),
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
