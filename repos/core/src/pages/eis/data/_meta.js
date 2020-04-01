export default {
  view: 'VerticalLayout',
  items: [
    {
      view: 'Expand',
      label: 'Admin Expenses',
      // expanded: true,
      items: [
        {
          view: 'Col',
          className: 'padding',
          items: [
            {
              view: 'Row',
              styles: 'middle margin-bottom',
              items: [
                {
                  view: 'Title',
                  label: 'Fully Insured - ',
                  styles: 'margin-right-small'
                },
                {
                  view: 'Title',
                  label: {name: 'asoAdminCost.admExpencesAmt'},
                  renderLabel: 'currency',
                },
              ]
            },
            {
              view: 'Input',
              className: 'margin-bottom',
              label: 'Number of claims per employee',
              name: 'adminExpenses.perEmployeeClaims',
              type: 'number',
              min: 1,
              format: 'integer',
              validate: 'required',
            },
            {
              view: 'Table',
              name: 'adminCosts',
              sorts: [
                {id: 'annualAmt', order: 0},
                {id: 'premiumPct', order: 1, /*sortKey: 'amt.pct'*/},
              ],
              headers: [
                {
                  id: 'adminCategory',
                  // - String renderCell -> maps to FIELD.RENDER function
                  // - Object renderCell -> maps to FIELD.TYPE recursive Render by matching values
                  //                     -> can optionally specify `default` FIELD.RENDER function
                  renderCell: {
                    values: {
                      'Adjusted Fixed': {
                        view: 'Row',
                        items: [
                          {
                            view: 'Text',
                            fill: true,
                            label: 'Adjusted Fixed'
                          },
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
                          {view: 'Text', fill: true, label: 'Adjusted Variable'},
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
                  label: 'Description',
                  classNameHeader: 'bg-grey',
                  classNameCell: 'bg-grey-light uppercase',
                },
                {
                  id: 'annualAmt',
                  className: 'right',
                  classNameCell: 'right',
                  renderCell: 'currency',
                  label: 'Annual Amount'
                },
                {
                  id: 'premiumPct',
                  className: 'right',
                  classNameCell: 'right',
                  renderCell: 'percent',
                  label: '% of Premium'
                },
                {
                  id: 'perClaimAmt',
                  className: 'right',
                  classNameCell: 'right',
                  renderCell: 'currency',
                  label: 'Per Claim'
                },
                {
                  id: 'perEmployeeAmt',
                  className: 'right',
                  classNameCell: 'right',
                  renderCell: 'currency',
                  label: 'Per Employee'
                },
              ],
              itemClassNames: [
                {
                  id: 'adminCategory',
                  values: {
                    'Administration Total': 'bg-green-light',
                    'Grand Total': 'bg-green-light',
                  }
                },
                {
                  id: 'premiumPct',
                  values: {
                    '1': 'text bold',
                  }
                }
              ]
            }
          ]
        }
      ]
    },
    {
      view: 'Expand',
      renderLabel: {
        view: 'Row',
        className: 'middle',
        items: [
          {
            view: 'Text', label: 'Rate Details for Policy ID - ', className: 'margin-right-small'
          },
          {
            view: 'Text', label: {name: 'policyID'},
          },
        ]
      },
      expanded: true,
      items: [
        {
          view: 'Row',
          className: 'wrap',
          items: [

            { // Shorthand definition version (must have `name` defined, but `onChange` undefined)
              view: 'Dropdown',
              name: 'active.plan', // -> must be unique key path identifier that does not exist in *_data.json
              options: 'planCalculations', // -> key path pointing to array in *_data.json
              mapOptions: 'planName', // -> key path pointing to human readable value within each option (used as label)
              // value: {name: '{state.active.plan,0}'}, // -> automatically added by default due to OpenL rules
              // onChange: 'setState,active.plan', // function defined as string, added by default due to OpenL rules
            },
            { // Full definition version
              view: 'Dropdown',
              name: 'active.plan', // -> must be unique key path identifier that does not exist in *_data.json
              value: {name: '{state.active.plan,0}'},
              onChange: { // function defined as object
                name: 'setState',
                args: ['active.plan'],
              },
              options: {name: 'planCalculations'}, // `planCalculations` is key path pointing to array in *_data.json
              mapOptions: {
                text: 'planName', // `planName` is key path pointing to value for each item in `options` above
                value: '{index}', // using index of item, instead of its value as ID
              },
            },
            {
              view: 'Dropdown',
              name: 'url', // must be unique key path identifier that does not exist in *_data.json
              placeholder: 'Select fetch API',
              onChange: { // function defined as object with nested callback
                name: 'fetch',
                onDone: {
                  name: 'fetch',
                  mapArgs: [ // function will first receive `mapArgs`, then followed by `args`, as arguments
                    // variable `{0.payload.ip}` can be defined to get data from arguments, in addition to *_data.json
                    'https://ipapi.co/{0.payload.ip}/json', // this is the first argument passed to the function
                    // ...second (subsequent) argument/s can be defined as object/array/number/etc.
                  ],
                  onDone: {
                    name: 'warn',
                    args: ['Dropdown.onChange -> fetch.onDone -> fetch.onDone -> warn'],
                  }
                },
              },
              options: [
                {text: 'IP Address', value: 'https://api.ipify.org/?format=json'},
                {text: 'Geolocation Data', value: 'http://ip-api.com/json'}
              ],
            },
          ],
        },
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
                  {
                    view: 'Title',
                    children: 'Summary'
                  },
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
                            name: 'planCalculations.{state.active.plan,0}.manualClaimDetail.ageBreakdown',
                            legends: true,
                            mapItems: {
                              //         ╭ key path to value within items found for given `name` attribute above
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
                            name: 'planCalculations.{state.active.plan,0}.subGroupEnrollmentBreakdown[0].enrollmentBreakdown',
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
                  {
                    view: 'Title',
                    label: 'Enrolled by State',
                    className: 'margin-top-largest'
                  },
                  {
                    view: 'Table',
                    name: 'planCalculations.{state.active.plan,0}.manualClaimDetail.enrollmentByState',
                    // Extra render function for Table Items (rows in default layout)
                    renderItem: {
                      view: 'Table',
                      name: 'planCalculations.{state.active.plan,0}.manualClaimDetail.enrollmentByMSA',
                      filterItems: [
                        //  ╭ key path to value in this child-table's item to use for filtering
                        {'state': 'state'},
                        //           ╰ key path to value from parent-table's item to match against
                      ],
                    },
                    headers: [
                      {
                        id: 'state',
                        // Custom render function for Table Cells (columns in default layout)
                        renderCell: {
                          view: 'Expand',
                          name: '{value}',
                          id: 'state',
                          // toggle extra table item expansion (row in default layout)
                          onClick: 'handleItemExpand', // function is injected by TableView instance on render
                          // items: [{}], // can also make it expand any content inside clicked cell
                        },
                      },
                      {
                        id: 'numberOfLives',
                        label: 'Number of Lives'
                      },
                      {
                        id: 'enrolledPct',
                        label: 'Enrolled Percent'
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
                                className: 'h3 warning margin-bottom-small',
                                items: [
                                  {
                                    view: 'Counter',
                                    end: {name: 'planCalculations.{state.active.plan,0}.manualClaimDetail.networkDetails[0].ppoPenetration'},
                                    render: 'Percent'
                                  },
                                ]
                              },
                              {
                                view: 'Text',
                                className: 'bold',
                                label: 'PPO Penetration'
                              }
                            ]
                          },
                          {
                            view: 'Col',
                            className: 'center padding',
                            items: [
                              {
                                view: 'Text',
                                className: 'h3 info margin-bottom-small',
                                items: [
                                  {
                                    view: 'Counter',
                                    end: {name: 'planCalculations.{state.active.plan,0}.manualClaimDetail.networkDetails[0].netUtilization'},
                                    render: 'Percent'
                                  },
                                ]
                              },
                              {
                                view: 'Text',
                                className: 'bold',
                                label: 'Net Utilization'
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
                                name: 'planCalculations.{state.active.plan,0}.manualClaimDetail.networkDetails[0].area',
                                label: 'Area',
                              },
                              {
                                view: 'Input',
                                name: 'planCalculations.{state.active.plan,0}.manualClaimDetail.networkDetails[0].trend',
                                label: 'trend',
                              },
                              {
                                view: 'Input',
                                name: 'planCalculations.{state.active.plan,0}.manualClaimDetail.networkDetails[0].maximumEEandSP',
                                label: 'maximum (EE and SP)',
                              },
                              {
                                view: 'Input',
                                name: 'planCalculations.{state.active.plan,0}.manualClaimDetail.networkDetails[0].maximumCH',
                                label: 'maximum (CH)',
                              },
                            ],
                          },
                          {
                            view: 'Col',
                            className: 'padding no-padding-top border',
                            items: [
                              {view: 'Text', className: 'padding-top', label: 'COPAY'},
                              {
                                view: 'Row', className: 'wrap app__form',
                                items: [
                                  {
                                    view: 'Input',
                                    name: 'planCalculations.{state.active.plan,0}.manualClaimDetail.networkDetails[0].rateCalcEmp',
                                    label: 'Areas',
                                    type: 'number',
                                    format: 'double5',
                                  },
                                  {
                                    view: 'Input',
                                    name: 'planCalculations.{state.active.plan,0}.manualClaimDetail.networkDetails[0].rateCalcWOEmp',
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
                            name: 'planCalculations.{state.active.plan,0}.manualClaimDetail.initialLoad',
                            label: 'Initial Load',
                          },
                          {
                            view: 'Input',
                            name: 'planCalculations.{state.active.plan,0}.manualClaimDetail.occupationFactor',
                            label: 'Occupation',
                          },
                          {
                            view: 'Input',
                            name: 'planCalculations.{state.active.plan,0}.manualClaimDetail.occupation',
                            label: 'Occupation Code',
                            readonly: true,
                          },
                          {
                            view: 'Input',
                            name: 'planCalculations.{state.active.plan,0}.manualClaimDetail.waitGroupSize',
                            label: 'Wait Grp Size',
                          },
                          {
                            view: 'Input',
                            name: 'planCalculations.{state.active.plan,0}.manualClaimDetail.planUtilization',
                            label: 'Plan Util',
                          },
                          {
                            view: 'Input',
                            name: 'planCalculations.{state.active.plan,0}.manualClaimDetail.groupSize',
                            label: 'Group Size',
                          },
                          {
                            view: 'Input',
                            name: 'planCalculations.{state.active.plan,0}.manualClaimDetail.yearLoad',
                            label: 'Cal Year Load',
                          },
                          {
                            view: 'Input',
                            name: 'planCalculations.{state.active.plan,0}.manualClaimDetail.voluntaryLoad',
                            label: 'Vol Load',
                          },
                          {
                            view: 'Input',
                            name: 'planCalculations.{state.active.plan,0}.manualClaimDetail.waitingLoad',
                            label: 'Wait Load',
                          },
                          {
                            view: 'Input',
                            name: 'planCalculations.{state.active.plan,0}.manualClaimDetail.rolloverLoad',
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
                            children: 'Apply',
                            type: 'submit,'
                          },
                          {
                            view: 'Button',
                            className: 'a transparent',
                            children: 'Reset',
                            onClick: 'reset',
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
                        renderCell: 'currency',
                      },
                      {
                        id: 'adjFormulaRate',
                        renderCell: 'currency',
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
                        renderCell: 'currency',
                      },
                      {
                        id: 'proposedRate',
                        renderCell: 'currency',
                      },
                    ],
                    extraItems: [
                      {
                        tier: 'Composite Rate',
                        adjManualRate: {name: 'planCalculations.{state.active.plan,0}.adjManualCompositeRate'}, // null
                        adjFormulaRate: {name: 'planCalculations.{state.active.plan,0}.adjFormulaCompositeRate'}, // undefined
                        manualRate: {
                          name: 'planCalculations.{state.active.plan,0}.manualCompositeRate',
                          render: 'Currency',
                        },
                        formulaRate: {
                          view: 'Input',
                          name: 'planCalculations.{state.active.plan,0}.formulaCompositeRate',
                          type: 'number',
                          unit: 'USD',
                          placeholder: 'placeholder'
                        },
                        proposedRate: {name: 'planCalculations.{state.active.plan,0}.proposedCompositeRate'},
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
