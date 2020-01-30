export default {
  view: 'Col',
  className: 'bg-grey-lighter',
  items: [
    {
      view: 'Expand',
      title: 'Admin Expenses',
      className: 'border-gradient-h-right',
      // expanded: true,
      items: [
        {
          view: 'Col',
          className: 'padding',
          items: [
            {
              view: 'Title',
              children: 'Fully Insured'
            },
            {
              view: 'Input',
              className: 'margin-bottom',
              label: 'Number of claims per employee',
              name: 'adminExpenses.perEmployeeClaims',
              type: 'number',
              min: 1
            },
            {
              view: 'Table',
              name: 'adminCosts',
              headers: [
                {
                  id: 'adminCategory',
                  classNameCell: 'uppercase',
                  // - String renderCell -> maps to FIELD.RENDER function
                  // - Object renderCell -> maps to FIELD.TYPE recursive Render by matching values
                  //                     -> can optionally specify `default` FIELD.RENDER function
                  renderCell: {
                    values: {
                      'Adjusted Fixed': {
                        view: 'Row',
                        items: [
                          {view: 'Text', fill: true, children: 'Adjusted Fixed'},
                          {
                            view: 'Col',
                            fill: true,
                            className: 'bg-grey padding',
                            items: [
                              {view: 'Input', name: 'required1', label: 'UW Exception Dollar Amount', type: 'number'},
                            ]
                          },
                        ]
                      },
                      'Adjusted Variable': {
                        view: 'Row',
                        items: [
                          {view: 'Text', fill: true, children: 'Adjusted Variable'},
                          {
                            view: 'Col',
                            fill: true,
                            className: 'bg-grey padding',
                            items: [
                              {view: 'Input', name: 'required2', label: 'Risk Adjustment Percent', type: 'number'},
                            ]
                          },
                        ]
                      },
                    },
                    // default: 'Currency',
                  },
                  title: 'Description'
                },
                {
                  id: 'annualAmt',
                  className: 'right',
                  classNameCell: 'right',
                  renderCell: 'Currency',
                  title: 'Annual Amount'
                },
                {
                  id: 'premiumPct',
                  className: 'right',
                  classNameCell: 'right',
                  renderCell: 'Percent',
                  title: '% of Premium'
                },
                {
                  id: 'perClaimAmt',
                  className: 'right',
                  classNameCell: 'right',
                  renderCell: 'Currency',
                  title: 'Per Claim'
                },
                {
                  id: 'perEmployeeAmt',
                  className: 'right',
                  classNameCell: 'right',
                  renderCell: 'Currency',
                  title: 'Per Employee'
                },
              ],
            }
          ]
        }
      ]
    },
    {
      view: 'Expand',
      renderTitle: {
        view: 'Row',
        className: 'middle',
        items: [
          {
            view: 'Text', children: 'Rate Details - ', className: 'margin-right-small'
          },
          {
            view: 'Dropdown',
            name: 'planCalculations.0.planName',
            options: ['ALACARTE', 'ASO', 'GOLD'],
          }
        ]
      },
      className: 'border-gradient-h-right',
      // expanded: true,
      items: [
        {
          view: 'Tabs',
          // defaultIndex: 1,
          items: [
            {
              tab: 'Demographic',
              content: {
                view: 'Col',
                className: 'padding',
                items: [
                  {view: 'Title', children: 'Summary'},
                  {
                    view: 'Row',
                    className: 'wrap',
                    items: [
                      {
                        view: 'Row',
                        className: 'fill bg-white border radius margin-right center',
                        items: [
                          {
                            view: 'Label',
                            className: 'position-top-left padding-large bold',
                            children: 'By Age'
                          },
                          {
                            view: 'PieChart',
                            name: 'planCalculations[0].manualClaimDetail.ageBreakdown',
                            legends: true,
                            mapItems: {
                              label: 'ageBand',
                              value: 'numberOfLives',
                            }
                          }
                        ]
                      },
                      {
                        view: 'Row',
                        className: 'fill bg-white border radius margin-right center',
                        items: [
                          {
                            view: 'Label',
                            className: 'position-top-left padding-large bold',
                            children: 'By Enrollment'
                          },
                          {
                            view: 'PieChart',
                            name: 'planCalculations[0].subGroupEnrollmentBreakdown[0].enrollmentBreakdown',
                            legends: true,
                            mapItems: {
                              label: 'tier',
                              value: 'numberOfLives',
                            }
                          }
                        ]
                      },
                    ],
                  },
                  {view: 'Title', children: 'Enrolled by State', className: 'margin-top-largest'},
                  {
                    view: 'Table',
                    name: 'planCalculations[0].manualClaimDetail.enrollmentByState',
                    headers: [
                      {
                        id: 'state',
                        renderCell: {
                          view: 'Expand',
                          name: '{value}',
                          items: [
                            {
                              view: 'Table',
                              name: 'planCalculations[0].manualClaimDetail.enrollmentByMSA'
                            }
                          ]
                        }
                      },
                      {
                        id: 'numberOfLives',
                        label: 'Number of Lives'
                      },
                      {
                        id: 'enrolledPct',
                        label: 'Enrolled Percent'
                      },
                    ]
                  }
                ]
              }
            },
            {
              tab: 'Factors',
              content: {
                view: 'Col',
                className: 'padding',
                items: [
                  {view: 'Title', children: 'PPO'},
                  {
                    view: 'Row',
                    items: [
                      {
                        view: 'Col',
                        className: 'middle padding bg-gradient-violet-teal-light border radius',
                        items: [
                          {
                            view: 'Col',
                            className: 'center padding',
                            items: [
                              {
                                view: 'Text',
                                className: 'h3 pink margin-bottom-small',
                                items: [
                                  {
                                    view: 'Counter',
                                    end: {name: 'planCalculations[0].manualClaimDetail.networkDetails[0].ppoPenetration'},
                                    render: 'Percent'
                                  },
                                ]
                              },
                              {
                                view: 'Text',
                                className: 'bold',
                                children: 'PPO Penetration'
                              }
                            ]
                          },
                          {
                            view: 'Col',
                            className: 'center padding',
                            items: [
                              {
                                view: 'Text',
                                className: 'h3 violet margin-bottom-small',
                                items: [
                                  {
                                    view: 'Counter',
                                    end: {name: 'planCalculations[0].manualClaimDetail.networkDetails[0].netUtilization'},
                                    render: 'Percent'
                                  },
                                ]
                              },
                              {
                                view: 'Text',
                                className: 'bold',
                                children: 'Net Utilization'
                              }
                            ]
                          },
                        ],
                      },
                      {
                        view: 'Col',
                        fill: true,
                        className: 'bg-white margin-left-smaller',
                        items: [
                          {
                            view: 'Row',
                            className: 'app__form wrap padding no-padding-top border',
                            items: [
                              {
                                view: 'Input',
                                name: 'planCalculations[0].manualClaimDetail.networkDetails[0].area',
                                label: 'Area',
                              },
                              {
                                view: 'Input',
                                name: 'planCalculations[0].manualClaimDetail.networkDetails[0].trend',
                                label: 'trend',
                              },
                              {
                                view: 'Input',
                                name: 'planCalculations[0].manualClaimDetail.networkDetails[0].maximumEEandSP',
                                label: 'maximum (EE and SP)',
                              },
                              {
                                view: 'Input',
                                name: 'planCalculations[0].manualClaimDetail.networkDetails[0].maximumCH',
                                label: 'maximum (CH)',
                              },
                            ],
                          },
                          {
                            view: 'Col',
                            className: 'padding no-padding-top border',
                            items: [
                              {view: 'Text', className: 'padding-top', children: 'COPAY'},
                              {
                                view: 'Row', className: 'wrap app__form',
                                items: [
                                  {
                                    view: 'Input',
                                    name: 'planCalculations[0].manualClaimDetail.networkDetails[0].rateCalcEmp',
                                    label: 'Areas',
                                  },
                                  {
                                    view: 'Input',
                                    name: 'planCalculations[0].manualClaimDetail.networkDetails[0].rateCalcWOEmp',
                                    label: 'trends',
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ]
                  },
                  {view: 'Title', children: 'Factors', className: 'margin-top-largest'},
                  {
                    view: 'Col',
                    className: 'padding border radius no-padding-top bg-white',
                    items: [
                      {
                        view: 'Row',
                        className: 'wrap app__form',
                        items: [
                          {
                            view: 'Input',
                            name: 'planCalculations[0].manualClaimDetail.initialLoad',
                            label: 'Initial Load',
                          },
                          {
                            view: 'Input',
                            name: 'planCalculations[0].manualClaimDetail.occupationFactor',
                            label: 'Occupation',
                          },
                          {
                            view: 'Input',
                            name: 'planCalculations[0].manualClaimDetail.occupation',
                            label: 'Occupation Code',
                            readonly: true,
                          },
                          {
                            view: 'Input',
                            name: 'planCalculations[0].manualClaimDetail.waitGroupSize',
                            label: 'Wait Grp Size',
                          },
                          {
                            view: 'Input',
                            name: 'planCalculations[0].manualClaimDetail.planUtilization',
                            label: 'Plan Util',
                          },
                          {
                            view: 'Input',
                            name: 'planCalculations[0].manualClaimDetail.groupSize',
                            label: 'Group Size',
                          },
                          {
                            view: 'Input',
                            name: 'planCalculations[0].manualClaimDetail.yearLoad',
                            label: 'Cal Year Load',
                          },
                          {
                            view: 'Input',
                            name: 'planCalculations[0].manualClaimDetail.voluntaryLoad',
                            label: 'Vol Load',
                          },
                          {
                            view: 'Input',
                            name: 'planCalculations[0].manualClaimDetail.waitingLoad',
                            label: 'Wait Load',
                          },
                          {
                            view: 'Input',
                            name: 'planCalculations[0].manualClaimDetail.rolloverLoad',
                            label: 'Rollover Load',
                          },
                        ],
                      },
                      {
                        view: 'Row',
                        className: 'margin-top',
                        items: [
                          {
                            view: 'Button',
                            className: 'a transparent',
                            children: 'Apply'
                          },
                          {
                            view: 'Button',
                            className: 'a transparent',
                            children: 'Reset'
                          },
                        ]
                      },
                    ]
                  },
                ]
              }
            },
            {
              tab: 'Redistribution Calculator',
              content: {
                view: 'Col',
                className: 'padding',
                items: [
                  {view: 'Title', children: 'Calculate Rate'},
                  {
                    view: 'Table',
                    name: 'planCalculations.0.tierRates',
                    headers: [
                      {
                        id: 'tier',
                        className: 'uppercase',
                      },
                      {
                        id: 'adjManualRate',
                        renderCell: 'Currency',
                      },
                      {
                        id: 'adjFormulaRate',
                        renderCell: 'Currency',
                      },
                      {
                        id: 'manualRate',
                        renderCell: {
                          view: 'Input',
                          name: 'planCalculations.0.tierRates.{index}.manualRate',
                          type: 'number',
                          icon: 'USD',
                          unit: '/ person',
                          lefty: true,
                        },
                      },
                      {
                        id: 'formulaRate',
                        renderCell: 'Currency',
                      },
                      {
                        id: 'proposedRate',
                        renderCell: 'Currency',
                      },
                    ],
                    extraItems: [
                      {
                        tier: 'Composite Rate',
                        adjManualRate: {name: 'planCalculations[0].adjManualCompositeRate'}, // null
                        adjFormulaRate: {name: 'planCalculations[0].adjFormulaCompositeRate'}, // undefined
                        manualRate: {
                          name: 'planCalculations[0].manualCompositeRate',
                          render: 'Currency',
                        },
                        formulaRate: {
                          view: 'Input',
                          name: 'planCalculations[0].formulaCompositeRate',
                          type: 'number',
                          unit: 'USD',
                          placeholder: 'placeholder'
                        },
                        proposedRate: {name: 'planCalculations[0].proposedCompositeRate'},
                      }
                    ],
                  },
                ]
              }
            }
          ]
        }
      ]
    }
  ]
}
