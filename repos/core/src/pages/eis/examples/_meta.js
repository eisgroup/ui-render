export default {
  view: 'VerticalLayout',
  styles: 'border-bottom',
  items: [
    {
      view: 'Expand',
      label: 'Admin Expenses',
      classNameLabel: 'bg-white',
      items: [
        {
          view: 'Col',
          className: 'padding',
          items: [
            {
              view: 'Row',
              styles: 'middle',
              items: [
                {
                  view: 'Title',
                  label: 'Fully Insured',
                  styles: 'margin-right-small'
                },
                {
                  view: 'Text',
                  label: {name: 'asoAdminCost.admExpencesAmt'},
                  renderLabel: 'Currency',
                },
              ]
            },
            {
              view: 'Input',
              className: 'margin-bottom max-width-290',
              label: 'Number of claims per employee',
              name: 'adminExpenses.perEmployeeClaims',
              type: 'number',
              min: 1,
              format: 'integer',
              validate: 'required',
              removable: true,
              autoSubmit: true,
            },
            {
              view: 'Table',
              name: 'adminCosts',
              sorts: [
                {id: 'annualAmt', order: 0},
                {id: 'premiumPct', order: 1, /*sortKey: 'amt.pct'*/},
              ],
              extraHeaders: [
                [
                  {
                    label: 'Description',
                    classNameHeader: 'uppercase bg-primary-light2 border-right no-border-bottom',
                  },
                  {
                    colSpan: 2,
                    label: 'Total',
                    className: 'center border-right',
                  },
                  {
                    colSpan: 2,
                    label: 'Average',
                    className: 'center',
                  }
                ]
              ],
              headers: [
                {
                  id: 'adminCategory',
                  label: '',
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
                            label: 'Adjusted Fixed',
                          },
                          {
                            view: 'Col',
                            fill: true,
                            className: 'bg-white padding',
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
                            className: 'bg-white padding',
                            items: [
                              {view: 'Input', name: 'required2', label: 'Risk Adjustment Percent', type: 'number'},
                            ]
                          },
                        ]
                      },
                      'Administration Total': {
                        view: 'Text',
                        className: 'row p bg-success-light uppercase border-right',
                        label: 'Administration Total',
                      }
                    },
                    // default: 'Currency',
                  },
                  classNameHeader: 'bg-primary-light2 border-right',
                  classNameCell: 'bg-info-light uppercase border-right',
                },
                {
                  id: 'annualAmt',
                  className: 'right',
                  classNameCell: 'right',
                  renderCell: 'Currency',
                  label: 'Annual Amount'
                },
                {
                  id: 'premiumPct',
                  className: 'right border-right',
                  classNameCell: 'right',
                  classNameCellWrap: 'border-right',
                  renderCell: 'Percent',
                  label: '% of Premium'
                },
                {
                  id: 'perClaimAmt',
                  className: 'right',
                  classNameCell: 'right',
                  renderCell: 'Currency',
                  label: 'Per Claim'
                },
                {
                  id: 'perEmployeeAmt',
                  className: 'right',
                  classNameCell: 'right',
                  renderCell: 'Currency',
                  label: 'Per Employee'
                },
              ],
              itemClassNames: [
                {
                  id: 'adminCategory',
                  values: {
                    'Administration Total': 'bg-success-light',
                    'Grand Total': 'bg-success-light',
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
      classNameLabel: 'bg-white',
      renderLabel: {
        view: 'Row',
        className: 'wrap middle fill-width',
        items: [
          {
            view: 'Text', label: 'Rate Details', className: 'margin-right-small'
          },
          { // Shorthand definition version (must have `name` defined, but `onChange` undefined)
            view: 'Dropdown',
            name: 'active.plan', // -> must be unique key path identifier that does not exist in *_data.json
            options: 'planCalculations', // -> key path pointing to array in *_data.json
            mapOptions: 'planName', // -> key path pointing to human readable value within each option (used as label)
            // value: {name: '{state.active.plan,0}'}, // -> automatically added by default due to OpenL rules
            // onChange: 'setState,active.plan', // function defined as string, added by default due to OpenL rules
            styles: 'margin-h-smaller',
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
            styles: 'margin-h-smaller',
          },
          {
            view: 'Select',
            name: 'url', // must be unique key path identifier that does not exist in *_data.json
            placeholder: 'Select fetch API',
            onChange: { // function defined as object with nested callback
              name: 'fetch', //todo: rename to `call`?
              onDone: {
                name: 'fetch',
                mapArgs: [ // function will first receive `mapArgs`, then followed by `args`, as arguments
                  // variable `{0.payload.ip}` can be defined to get data from arguments, in addition to *_data.json
                  'https://ipapi.co/{0.payload.ip}/json', // this is the first argument passed to the function
                  // ...second (subsequent) argument/s can be defined as object/array/number/etc.
                ],
                onDone: {
                  name: 'popup',
                  args: ['Dropdown.onChange\n -> fetch(IpAddress).onDone\n -> fetch(GeoData).onDone\n -> popup'],
                }
              },
            },
            options: [
              {text: 'IP Address', value: 'https://api.ipify.org/?format=json'},
              {text: 'Geolocation Data', value: 'http://ip-api.com/json'}
            ],
            styles: 'margin-h-smaller',
          },
        ]
      },
      classNameItems: 'padding-h',
      expanded: true,
      items: [
        {
          view: 'Row',
          className: 'wrap middle padding-h',
          items: [
            {
              view: 'Title', label: 'Policy ID',
            },
            {
              view: 'Text', children: {name: 'policyID'}, styles: 'padding',
            },
          ],
        },
        {
          view: 'ProgressSteps',
          defaultIndex: 1,
          className: 'bg-white padding margin-v border radius',
          classNameSteps: 'padding-h-largest',
          items: [
            {
              label: 'Information',
              done: true,
              content: {
                view: 'Text',
                label: 'Step 1 content completed'
              }
            },
            {
              label: 'Requirements'
            },
            {
              label: 'Submission',
              error: true,
              content: {
                view: 'Text',
                label: 'Step 3 with missing content'
              }
            },
            {
              step: '?'
            },
          ]
        },
        {
          view: 'Tabs',
          // defaultIndex: 1,
          items: [
            {
              tab: 'Demographic',
              content: {
                view: 'Col',
                className: 'padding-v',
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
                        className: 'fill bg-white border radius center',
                        items: [
                          {
                            view: 'Label',
                            className: 'position-top-left padding-large bold',
                            children: 'By Age'
                          },
                          {
                            view: 'PieChart',
                            name: 'planCalculations.{state.active.plan,0}.manualClaimDetail.ageBreakdown',
                            legends: {
                              columns: 2,
                            },
                            mapItems: {
                              //         ╭ key path to value within items found for given `name` attribute above
                              label: 'ageBand',
                              value: 'numberOfLives',
                              order: 'ageBand', // value to use for sorting, can be defined as any custom attribute
                              // customOrder: 'ageBand.id', -> will also work with {sort: 'customOrder'}
                            },
                            // define which key within `mapItems` to use as sorting order (ex. 'label/value/order')
                            sort: '-order', // prefix sort attribute with `-` for descending order
                            items: [
                              {
                                view: 'Col',
                                className: 'align-center',
                                items: [
                                  {
                                    view: 'Title',
                                    label: 'Label',
                                  },
                                  {
                                    view: 'Text',
                                    label: 'Anything',
                                  }
                                ]
                              }
                            ]
                          }
                        ]
                      },
                      {view: 'Space', styles: 'visible-from-tablet'},
                      {
                        view: 'Row',
                        className: 'fill bg-white border radius center',
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
                    relativeData: false,
                    // Extra render function for Table Items (rows in default layout)
                    renderItem: {
                      view: 'Table',
                      name: 'planCalculations.{state.active.plan,0}.manualClaimDetail.enrollmentByMSA',
                      relativeData: false,
                      filterItems: [
                        //  ╭ key path to value in this child-table's item to use for filtering
                        {'state': 'state'},
                        //           ╰ key path to value from parent-table's item to match against
                      ],
                    },
                    itemsExpanded: true,
                    headers: [
                      {
                        id: 'state',
                        label: 'State',
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
                          view: 'Checkbox',
                          label: 'Expand All',
                          onChange: 'handleToggleExpandAll', // function is injected by TableView instance on render
                          defaultValue: true,
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
                className: 'padding-v',
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
                                name: 'planCalculations.{state.active.plan,0}.manualClaimDetail.networkDetails.0.area',
                                label: 'Area (autoSubmit)',
                                removable: true,
                                required: true,
                                autoSubmit: {
                                  delay: 1000
                                }
                              },
                              {view: 'Space'},
                              {
                                view: 'Input',
                                name: 'planCalculations.{state.active.plan,0}.manualClaimDetail.networkDetails.0.trend',
                                label: 'trend',
                                removable: true,
                              },
                              {view: 'Space'},
                              {
                                view: 'Input',
                                name: 'planCalculations.{state.active.plan,0}.manualClaimDetail.networkDetails.0.maximumEEandSP',
                                label: 'maximum 10 (EE and SP)',
                                type: 'number',
                                max: 10,
                              },
                              {view: 'Space'},
                              {
                                view: 'Input',
                                name: 'planCalculations.{state.active.plan,0}.manualClaimDetail.networkDetails.0.maximumCH',
                                label: 'minimum 1 (CH)',
                                type: 'number',
                                min: 1,
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
                                    label: 'Areas (format: double5)',
                                    type: 'number',
                                    format: 'double5',
                                    removable: true,
                                  },
                                  {view: 'Space'},
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
                          {view: 'Space'},
                          {
                            view: 'Input',
                            name: 'planCalculations.{state.active.plan,0}.manualClaimDetail.occupationFactor',
                            label: 'Occupation',
                          },
                          {view: 'Space'},
                          {
                            view: 'Input',
                            name: 'planCalculations.{state.active.plan,0}.manualClaimDetail.occupation',
                            label: 'Occupation Code',
                            readonly: true,
                          },
                          {view: 'Space'},
                          {
                            view: 'Input',
                            name: 'planCalculations.{state.active.plan,0}.manualClaimDetail.waitGroupSize',
                            label: 'Wait Grp Size',
                          },
                          {view: 'Space'},
                          {
                            view: 'Input',
                            name: 'planCalculations.{state.active.plan,0}.manualClaimDetail.planUtilization',
                            label: 'Plan Util',
                          },
                          {view: 'Space'},
                          {
                            view: 'Input',
                            name: 'planCalculations.{state.active.plan,0}.manualClaimDetail.groupSize',
                            label: 'Group Size',
                          },
                          {view: 'Space'},
                          {
                            view: 'Input',
                            name: 'planCalculations.{state.active.plan,0}.manualClaimDetail.yearLoad',
                            label: 'Cal Year Load',
                          },
                          {view: 'Space'},
                          {
                            view: 'Input',
                            name: 'planCalculations.{state.active.plan,0}.manualClaimDetail.voluntaryLoad',
                            label: 'Vol Load',
                          },
                          {view: 'Space'},
                          {
                            view: 'Input',
                            name: 'planCalculations.{state.active.plan,0}.manualClaimDetail.waitingLoad',
                            label: 'Wait Load',
                          },
                          {view: 'Space'},
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
                            type: 'submit,',
                            tooltip: 'Insert Changes',
                          },
                          {
                            view: 'Tooltip',
                            label: 'Remove Changes',
                            children: {
                              view: 'Button',
                              className: 'a transparent',
                              children: 'Reset',
                              onClick: 'reset',
                            }
                          },
                          {
                            view: 'Button',
                            className: 'a transparent',
                            items: [
                              {
                                view: 'Icon',
                                name: 'trash'
                              },
                            ],
                            onClick: 'popup'
                          }
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
                className: 'padding-v',
                items: [
                  {view: 'Title', children: 'Calculate Rate'},
                  {
                    view: 'Table',
                    name: 'planCalculations.0.tierRates',
                    headers: [
                      {
                        id: 'tier',
                        label: 'Tier',
                      },
                      {
                        id: 'adjManualRate',
                        label: 'Adj. Manual Rate',
                        renderCell: 'Currency',
                      },
                      {
                        id: 'adjFormulaRate',
                        label: 'Adj. Formula Rate',
                        renderCell: 'Currency',
                      },
                      {
                        id: 'manualRate',
                        label: 'Manual Rate',
                        renderCell: {
                          view: 'Input',
                          name: 'planCalculations.0.tierRates.{index}.manualRate',
                          relativeData: false,
                          type: 'number',
                          icon: 'dollar',
                          unit: '/ person',
                          lefty: true,
                        },
                      },
                      {
                        id: 'formulaRate',
                        label: 'Formula Rate',
                        renderCell: 'Currency',
                      },
                      {
                        id: 'proposedRate',
                        label: 'Proposed Rate',
                        renderCell: 'Currency',
                      },
                    ],
                    extraItems: [
                      {
                        tier: 'Composite Rate',
                        adjManualRate: {
                          name: 'planCalculations.{state.active.plan,0}.adjManualCompositeRate',
                          relativeData: false,
                        }, // null
                        adjFormulaRate: {
                          name: 'planCalculations.{state.active.plan,0}.adjFormulaCompositeRate',
                          relativeData: false,
                        }, // undefined
                        manualRate: {
                          name: 'planCalculations.{state.active.plan,0}.manualCompositeRate',
                          relativeData: false,
                          render: 'Currency',
                        },
                        formulaRate: {
                          view: 'Input',
                          name: 'planCalculations.{state.active.plan,0}.formulaCompositeRate',
                          relativeData: false,
                          type: 'number',
                          unit: 'USD',
                          placeholder: 'placeholder'
                        },
                        proposedRate: {
                          name: 'planCalculations.{state.active.plan,0}.proposedCompositeRate',
                          relativeData: false,
                        },
                      }
                    ],
                  },
                ]
              }
            }
          ]
        }
      ]
    },
    // {
    //   view: 'AutoSubmit',
    //   onChange: { // required attribute
    //     name: 'popupDelay',
    //     args: [
    //       'Popup Title',
    //     ]
    //   },
    //   delay: 1000, // 1 second (i.e. 1000 milliseconds), default is 200
    //   partial: true, // whether to submit only changed values
    //   showLoader: true,
    //   loadContent: 'Calculating...'
    // }
  ]
}
