export const meta = {
  view: 'Col',
  _comment: 'Remove this wrapper component, it is for demo purpose only',
  styles: 'padding-h-largest bg-info-light',
  items: [
    {
      'view': 'VerticalLayout',
      'styles': 'margin-v-largest',
      'items': [
        {
          '@class': 'org.openl.generated.beans.Title',
          'view': 'Title',
          'label': 'Rating Details',
          'styles': 'padding-largest no-padding-bottom no-margin bg-neutral radius-top'
        },
        {
          '@class': 'org.openl.generated.beans.Tabs',
          'view': 'Tabs',
          childrenBeforeTabs: {
            '@class': 'org.openl.generated.beans.Layout',
            'view': 'HorizontalLayout',
            'label': 'PlanList',
            'styles': 'padding-right-largest middle bg-neutral',
            'relativeData': false,
            'items': [
              {
                '@class': 'org.openl.generated.beans.Text',
                'view': 'Text',
                'label': 'FILTER BY'
              },
              {
                '@class': 'org.openl.generated.beans.Element',
                'view': 'Space'
              },
              {
                '@class': 'org.openl.generated.beans.Dropdown',
                'view': 'Dropdown',
                'name': 'plan',
                'options': {
                  'name': 'Plans'
                },
                'mapOptions': 'Plan',
                'compact': true
              }
            ],
            'version': 'PlanList'
          },

          // This applies styles to the tabs
          classNameTabs: 'padding-largest bg-neutral radius-bottom',

          // Required for Dropdown menu to show correctly inside Tabs, but will break Tabs layout in narrow screens!
          styleTabs: {overflow: 'visible'},

          // Style inner content here to have consistent layout throughout tabs
          classNameContent: 'margin-v-small',
          'buttoned': true,
          'items': [
            {
              'view': 'Tab',
              'tab': 'General Summary',
              'content': {
                'view': 'VerticalLayout',
                'styles': '',
                'items': [
                  {
                    '@class': 'org.openl.generated.beans.RowList',
                    'view': 'RowList',
                    'name': 'Plans[{state.plan,0}].Coverages',
                    'styles': 'wrap justify margin-v',
                    'relativeData': true,
                    'renderItem': {
                      '@class': 'org.openl.generated.beans.Layout',
                      'view': 'VerticalLayout',
                      'styles': 'padding-largest radius bg-neutral',
                      'items': [
                        {
                          '@class': 'org.openl.generated.beans.Text',
                          'view': 'Text',
                          'children': {
                            'name': 'CoverageType',
                            'relativeData': null
                          },
                          'styles': 'h3'
                        },
                        {
                          '@class': 'org.openl.generated.beans.Layout',
                          'view': 'HorizontalLayout',
                          'styles': 'wrap justify',
                          'items': [
                            {
                              '@class': 'org.openl.generated.beans.Layout',
                              'view': 'VerticalLayout',
                              'styles': 'padding-largest margin-v align-center radius bg-info-light',
                              'items': [
                                {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'children': {
                                    'name': 'NumberOfLives',
                                    'relativeData': null
                                  },
                                  'styles': 'h3'
                                },
                                {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'label': 'Enrolled Lives'
                                }
                              ],
                              'version': 'CoverageExpensesRow1Column1',
                              'style': {
                                'minWidth': '45%'
                              }
                            },
                            {
                              '@class': 'org.openl.generated.beans.Layout',
                              'view': 'VerticalLayout',
                              'styles': 'padding-largest margin-v align-center radius bg-info-light',
                              'items': [
                                {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'children': {
                                    'name': 'MonthlyPremium',
                                    'relativeData': null
                                  },
                                  'styles': 'h3'
                                },
                                {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'label': 'Monthly Manual Premium'
                                }
                              ],
                              'version': 'CoverageExpensesRow1Column2',
                              'style': {
                                'minWidth': '45%'
                              }
                            }
                          ],
                          'version': 'CoverageExpensesRow1'
                        },
                        {
                          '@class': 'org.openl.generated.beans.Layout',
                          'view': 'HorizontalLayout',
                          'styles': 'wrap spread padding margin-top radius bg-grey-lighter',
                          'items': [
                            {
                              '@class': 'org.openl.generated.beans.Layout',
                              'view': 'VerticalLayout',
                              'styles': 'margin-small',
                              'items': [
                                {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Percent'
                                  },
                                  'children': {
                                    'name': 'Tax',
                                    'relativeData': null
                                  },
                                  'styles': 'h3'
                                },
                                {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'label': 'Tax'
                                }
                              ],
                              'version': 'CoverageExpensesRow2Column2'
                            },
                            {
                              '@class': 'org.openl.generated.beans.Layout',
                              'view': 'VerticalLayout',
                              'styles': 'margin-small',
                              'items': [
                                {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Percent'
                                  },
                                  'children': {
                                    'name': 'Profit',
                                    'relativeData': null
                                  },
                                  'styles': 'h3'
                                },
                                {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'label': 'Profit'
                                }
                              ],
                              'version': 'CoverageExpensesRow2Column3'
                            },
                            {
                              '@class': 'org.openl.generated.beans.Layout',
                              'view': 'VerticalLayout',
                              'styles': 'margin-small',
                              'items': [
                                {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Percent'
                                  },
                                  'children': {
                                    'name': 'Expense',
                                    'relativeData': null
                                  },
                                  'styles': 'h3'
                                },
                                {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'label': 'Expenses'
                                }
                              ],
                              'version': 'CoverageExpensesRow2Column4'
                            }
                          ],
                          'version': 'CoverageExpensesRow2'
                        }
                      ],
                      'version': 'ExpenseColumn',
                      'style': {
                        'minWidth': '48%'
                      }
                    }
                  },
                  {
                    view: 'Col',
                    styles: 'padding-largest margin-top-largest radius bg-neutral',
                    items: [
                      {
                        '@class': 'org.openl.generated.beans.Text',
                        'view': 'Text',
                        'label': 'Cost Summary',
                        'styles': 'h4 margin-v-largest'
                      },
                      {
                        '@class': 'org.openl.generated.beans.TableRows',
                        'view': 'Table',
                        'headers': [
                          {
                            'id': 'Description',
                            'label': '""',
                            'styleHeader': {
                              'width': '60%'
                            }
                          },
                          {
                            'id': 'Core',
                            'label': 'Core',
                            'styleHeader': {
                              'width': '20%',
                              'minWidth': 100
                            }
                          },
                          {
                            'id': 'BuyUp',
                            'label': 'BuyUp',
                            'styleHeader': {
                              'width': '20%',
                              'minWidth': 100
                            }
                          }
                        ],
                        'extraItems': [
                          {
                            '@class': 'org.openl.generated.beans.TableRowsItems',
                            'Description': 'Eligible Lives',
                            'Core': {
                              'view': 'Text',
                              'label': {
                                'name': 'Plans[{state.plan,0}].Coverages[0].NumberOfLives',
                                'relativeData': false
                              },
                              'renderLabel': {
                                '@class': 'org.openl.generated.beans.RenderLabel',
                                'name': 'Float'
                              }
                            },
                            'BuyUp': {
                              'view': 'Text',
                              'label': {
                                'name': 'Plans[{state.plan,0}].Coverages[1].NumberOfLives',
                                'relativeData': false
                              },
                              'renderLabel': {
                                '@class': 'org.openl.generated.beans.RenderLabel',
                                'name': 'Float'
                              }
                            }
                          },
                          {
                            '@class': 'org.openl.generated.beans.TableRowsItems',
                            'Description': 'Monthly Pre-Expense Cost',
                            'Core': {
                              'view': 'Text',
                              'label': {
                                'name': 'Plans[{state.plan,0}].Coverages[0].TotalMonthlyPreExpenseCost',
                                'relativeData': false
                              },
                              'renderLabel': {
                                '@class': 'org.openl.generated.beans.RenderLabel',
                                'name': 'Currency'
                              }
                            },
                            'BuyUp': {
                              'view': 'Text',
                              'label': {
                                'name': 'Plans[{state.plan,0}].Coverages[1].TotalMonthlyPreExpenseCost',
                                'relativeData': false
                              },
                              'renderLabel': {
                                '@class': 'org.openl.generated.beans.RenderLabel',
                                'name': 'Currency'
                              }
                            }
                          },
                          {
                            '@class': 'org.openl.generated.beans.TableRowsItems',
                            'Description': 'Net ClaimCost',
                            'Core': {
                              'view': 'Text',
                              'label': {
                                'name': 'Plans[{state.plan,0}].Coverages[0].TotalNetClaimCost',
                                'relativeData': false
                              },
                              'renderLabel': {
                                '@class': 'org.openl.generated.beans.RenderLabel',
                                'name': 'Currency'
                              }
                            },
                            'BuyUp': {
                              'view': 'Text',
                              'label': {
                                'name': 'Plans[{state.plan,0}].Coverages[1].TotalNetClaimCost',
                                'relativeData': false
                              },
                              'renderLabel': {
                                '@class': 'org.openl.generated.beans.RenderLabel',
                                'name': 'Currency'
                              }
                            }
                          },
                          {
                            '@class': 'org.openl.generated.beans.TableRowsItems',
                            'Description': 'Total Weekly Benefit',
                            'Core': {
                              'view': 'Text',
                              'label': {
                                'name': 'Plans[{state.plan,0}].Coverages[0].TotalWeeklyBenefit',
                                'relativeData': false
                              },
                              'renderLabel': {
                                '@class': 'org.openl.generated.beans.RenderLabel',
                                'name': 'Currency'
                              }
                            },
                            'BuyUp': {
                              'view': 'Text',
                              'label': {
                                'name': 'Plans[{state.plan,0}].Coverages[1].TotalWeeklyBenefit',
                                'relativeData': false
                              },
                              'renderLabel': {
                                '@class': 'org.openl.generated.beans.RenderLabel',
                                'name': 'Currency'
                              }
                            }
                          },
                          {
                            '@class': 'org.openl.generated.beans.TableRowsItems',
                            'Description': 'Manual Rate',
                            'Core': {
                              'view': 'Text',
                              'label': {
                                'name': 'Plans[{state.plan,0}].Coverages[0].Rate',
                                'relativeData': false
                              },
                              'renderLabel': {
                                '@class': 'org.openl.generated.beans.RenderLabel',
                                'name': 'Float'
                              }
                            },
                            'BuyUp': {
                              'view': 'Text',
                              'label': {
                                'name': 'Plans[{state.plan,0}].Coverages[1].Rate',
                                'relativeData': false
                              },
                              'renderLabel': {
                                '@class': 'org.openl.generated.beans.RenderLabel',
                                'name': 'Float'
                              }
                            }
                          }
                        ]
                      }
                    ]
                  },
                ],
                'version': 'CostSummaryTabBlock'
              }
            },
            {
              'view': 'Tab',
              'tab': 'Demographic',
              'content': {
                'view': 'VerticalLayout',
                'styles': '',
                'items': [
                  {
                    '@class': 'org.openl.generated.beans.RowList',
                    'view': 'RowList',
                    'name': 'Plans[{state.plan,0}].Coverages',
                    'styles': 'wrap justify margin-v',
                    'relativeData': true,
                    'renderItem': {
                      '@class': 'org.openl.generated.beans.Layout',
                      'view': 'VerticalLayout',
                      'styles': 'padding-largest radius bg-neutral',
                      style: {minWidth: '48%'},
                      'relativeData': false,
                      'showIf': {
                        'relativeData': true,
                        'name': 'DemographicByAgeBands'
                      },
                      'items': [
                        {
                          '@class': 'org.openl.generated.beans.Text',
                          'view': 'Text',
                          'children': {
                            'name': 'CoverageType',
                            'relativeData': true
                          },
                          'styles': 'h3'
                        },
                        {
                          '@class': 'org.openl.generated.beans.PieChart',
                          'view': 'PieChart',
                          'name': 'DemographicByAgeBands',
                          'relativeData': true,
                          'mapItems': {
                            'label': 'RateCard',
                            'value': 'NumberOfLives'
                          },
                          'legends': true
                        }
                      ],
                      'version': 'CoveragesDemographicPieChartColumn'
                    }
                  },
                  {
                    '@class': 'org.openl.generated.beans.Layout',
                    'view': 'HorizontalLayout',
                    'styles': 'wrap middle margin-top-largest',
                    'showIf': {
                      'relativeData': false,
                      'name': 'CensusExists'
                    },
                    'items': [
                      {
                        '@class': 'org.openl.generated.beans.Layout',
                        'view': 'VerticalLayout',
                        'items': [
                          {
                            '@class': 'org.openl.generated.beans.Layout',
                            'view': 'HorizontalLayout',
                            'styles': 'justify middle padding',
                            'items': [
                              {
                                '@class': 'org.openl.generated.beans.Text',
                                'view': 'Text',
                                'label': 'Weekly Salary Summary By Age',
                                'styles': 'h4'
                              }
                            ],
                            'version': 'DemographicGenderRow1'
                          },
                          {
                            '@class': 'org.openl.generated.beans.Element',
                            'view': 'Space'
                          },
                          {
                            '@class': 'org.openl.generated.beans.Layout',
                            'view': 'HorizontalLayout',
                            'styles': 'justify middle',
                            'items': [
                              {
                                '@class': 'org.openl.generated.beans.RowList',
                                'view': 'RowList',
                                'name': 'Plans[{state.plan,0}].Coverages',
                                'styles': 'justify wrap',
                                'relativeData': true,
                                'renderItem': {
                                  '@class': 'org.openl.generated.beans.Layout',
                                  'view': 'HorizontalLayout',
                                  'styles': 'justify middle padding-left',
                                  'items': [
                                    {
                                      '@class': 'org.openl.generated.beans.Layout',
                                      'view': 'VerticalLayout',
                                      'items': [
                                        {
                                          '@class': 'org.openl.generated.beans.Text',
                                          'view': 'Text',
                                          'children': {
                                            'name': 'CoverageType',
                                            'relativeData': true
                                          },
                                          'styles': 'h6'
                                        },
                                        {
                                          '@class': 'org.openl.generated.beans.Table',
                                          'view': 'Table',
                                          'name': 'WeeklySummaryByAgeBands',
                                          'headers': [
                                            {
                                              '@class': 'org.openl.generated.beans.TableHeader',
                                              'id': 'AgeBand',
                                              'label': 'Age'
                                            },
                                            {
                                              '@class': 'org.openl.generated.beans.TableHeader',
                                              'id': 'WeeklySalaryFemale',
                                              'label': 'Female',
                                              'renderCell': {
                                                '@class': 'org.openl.generated.beans.RenderCell',
                                                'name': 'Currency'
                                              }
                                            },
                                            {
                                              '@class': 'org.openl.generated.beans.TableHeader',
                                              'id': 'WeeklySalaryMale',
                                              'label': 'Male',
                                              'renderCell': {
                                                '@class': 'org.openl.generated.beans.RenderCell',
                                                'name': 'Currency'
                                              }
                                            },
                                            {
                                              '@class': 'org.openl.generated.beans.TableHeader',
                                              'id': 'WeeklySalaryTotal',
                                              'label': 'Total',
                                              'renderCell': {
                                                '@class': 'org.openl.generated.beans.RenderCell',
                                                'name': 'Currency'
                                              }
                                            }
                                          ],
                                          'relativeData': true,
                                          'showIf': {}
                                        },
                                        {
                                          '@class': 'org.openl.generated.beans.Element',
                                          'view': 'Space'
                                        }
                                      ],
                                      'version': 'DemographicGenderColumn'
                                    }
                                  ],
                                  'version': 'DemographicGenderRowBlock'
                                }
                              }
                            ],
                            'version': 'DemographicGenderRow2'
                          }
                        ],
                        'version': 'DemographicGenderBlock'
                      }
                    ],
                    'version': 'DemographicGenderBlockRow'
                  },
                  {
                    '@class': 'org.openl.generated.beans.Layout',
                    'view': 'HorizontalLayout',
                    'styles': 'wrap middle margin-top-largest',
                    'items': [
                      {
                        '@class': 'org.openl.generated.beans.Layout',
                        'view': 'VerticalLayout',
                        'styles': 'padding-largest radius bg-neutral',
                        style: {minWidth: '48%'},
                        'items': [
                          {
                            '@class': 'org.openl.generated.beans.Text',
                            'view': 'Text',
                            'label': 'Salary',
                            'styles': 'h3'
                          },
                          {
                            '@class': 'org.openl.generated.beans.Element',
                            'view': 'Space'
                          },
                          {
                            '@class': 'org.openl.generated.beans.TableRows',
                            'view': 'Table',
                            'headers': [
                              {
                                'id': 'Description',
                                'label': '""',
                                'styleHeader': {
                                  'width': '60%'
                                }
                              },
                              {
                                'id': 'Core',
                                'label': 'Core',
                                'styleHeader': {
                                  'width': '20%',
                                  'minWidth': 100
                                }
                              },
                              {
                                'id': 'BuyUp',
                                'label': 'BuyUp',
                                'styleHeader': {
                                  'width': '20%',
                                  'minWidth': 100
                                }
                              }
                            ],
                            'extraItems': [
                              {
                                '@class': 'org.openl.generated.beans.TableRowsItems',
                                'Description': 'Top First Annual Salary',
                                'Core': {
                                  'view': 'Text',
                                  'label': {
                                    'name': 'Plans[{state.plan,0}].Coverages[0].DemographicSummary.TopFirstAnnualSalary',
                                    'relativeData': false
                                  },
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Currency'
                                  }
                                },
                                'BuyUp': {
                                  'view': 'Text',
                                  'label': {
                                    'name': 'Plans[{state.plan,0}].Coverages[1].DemographicSummary.TopFirstAnnualSalary',
                                    'relativeData': false
                                  },
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Currency'
                                  }
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableRowsItems',
                                'Description': 'Top Second Annual Salary',
                                'Core': {
                                  'view': 'Text',
                                  'label': {
                                    'name': 'Plans[{state.plan,0}].Coverages[0].DemographicSummary.TopSecondAnnualSalary',
                                    'relativeData': false
                                  },
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Currency'
                                  }
                                },
                                'BuyUp': {
                                  'view': 'Text',
                                  'label': {
                                    'name': 'Plans[{state.plan,0}].Coverages[1].DemographicSummary.TopSecondAnnualSalary',
                                    'relativeData': false
                                  },
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Currency'
                                  }
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableRowsItems',
                                'Description': 'Top Third Annual Salary',
                                'Core': {
                                  'view': 'Text',
                                  'label': {
                                    'name': 'Plans[{state.plan,0}].Coverages[0].DemographicSummary.TopThirdAnnualSalary',
                                    'relativeData': false
                                  },
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Currency'
                                  }
                                },
                                'BuyUp': {
                                  'view': 'Text',
                                  'label': {
                                    'name': 'Plans[{state.plan,0}].Coverages[1].DemographicSummary.TopThirdAnnualSalary',
                                    'relativeData': false
                                  },
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Currency'
                                  }
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableRowsItems',
                                'Description': 'Average Annual Salary',
                                'Core': {
                                  'view': 'Text',
                                  'label': {
                                    'name': 'Plans[{state.plan,0}].Coverages[0].DemographicSummary.AverageAnnualSalary',
                                    'relativeData': false
                                  },
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Currency'
                                  }
                                },
                                'BuyUp': {
                                  'view': 'Text',
                                  'label': {
                                    'name': 'Plans[{state.plan,0}].Coverages[1].DemographicSummary.AverageAnnualSalary',
                                    'relativeData': false
                                  },
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Currency'
                                  }
                                }
                              }
                            ],
                            'styles': 'margin-bottom'
                          }
                        ],
                        'version': 'DemographicWeeklySalaryBlock'
                      },
                      {
                        '@class': 'org.openl.generated.beans.Element',
                        'view': 'Space'
                      },
                      {
                        '@class': 'org.openl.generated.beans.Layout',
                        'view': 'VerticalLayout',
                        'styles': 'border radius',
                        'showIf': {
                          'relativeData': false,
                          'name': 'CensusExists'
                        },
                        'items': [
                          {
                            '@class': 'org.openl.generated.beans.Text',
                            'view': 'Text',
                            'label': 'Total Weekly Benefit',
                            'styles': 'h4'
                          },
                          {
                            '@class': 'org.openl.generated.beans.Element',
                            'view': 'Space'
                          },
                          {
                            '@class': 'org.openl.generated.beans.TableRows',
                            'view': 'Table',
                            'headers': [
                              {
                                'id': 'Description',
                                'label': '""',
                                'styleHeader': {
                                  'width': '60%'
                                }
                              },
                              {
                                'id': 'Core',
                                'label': 'Core',
                                'styleHeader': {
                                  'width': '20%',
                                  'minWidth': 100
                                }
                              },
                              {
                                'id': 'BuyUp',
                                'label': 'BuyUp',
                                'styleHeader': {
                                  'width': '20%',
                                  'minWidth': 100
                                }
                              }
                            ],
                            'extraItems': [
                              {
                                '@class': 'org.openl.generated.beans.TableRowsItems',
                                'Description': 'Percent TWB Female',
                                'Core': {
                                  'view': 'Text',
                                  'label': {
                                    'name': 'Plans[{state.plan,0}].Coverages[0].DemographicSummary.FemalePercent',
                                    'relativeData': false
                                  },
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Percent',
                                    'decimals': 2
                                  }
                                },
                                'BuyUp': {
                                  'view': 'Text',
                                  'label': {
                                    'name': 'Plans[{state.plan,0}].Coverages[1].DemographicSummary.FemalePercent',
                                    'relativeData': false
                                  },
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Percent',
                                    'decimals': 2
                                  }
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableRowsItems',
                                'Description': 'Percent TWB Female Under 40',
                                'Core': {
                                  'view': 'Text',
                                  'label': {
                                    'name': 'Plans[{state.plan,0}].Coverages[0].DemographicSummary.PercentFemaleUnder40',
                                    'relativeData': false
                                  },
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Percent',
                                    'decimals': 2
                                  }
                                },
                                'BuyUp': {
                                  'view': 'Text',
                                  'label': {
                                    'name': 'Plans[{state.plan,0}].Coverages[1].DemographicSummary.PercentFemaleUnder40',
                                    'relativeData': false
                                  },
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Percent',
                                    'decimals': 2
                                  }
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableRowsItems',
                                'Description': 'Percent TWB Female Under 45',
                                'Core': {
                                  'view': 'Text',
                                  'label': {
                                    'name': 'Plans[{state.plan,0}].Coverages[0].DemographicSummary.PercentFemaleUnder45',
                                    'relativeData': false
                                  },
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Percent',
                                    'decimals': 2
                                  }
                                },
                                'BuyUp': {
                                  'view': 'Text',
                                  'label': {
                                    'name': 'Plans[{state.plan,0}].Coverages[1].DemographicSummary.PercentFemaleUnder45',
                                    'relativeData': false
                                  },
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Percent',
                                    'decimals': 2
                                  }
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableRowsItems',
                                'Description': 'Average Total Wekly Benefit',
                                'Core': {
                                  'view': 'Text',
                                  'label': {
                                    'name': 'Plans[{state.plan,0}].Coverages[0].DemographicSummary.AverageTotalWeeklyBenefit',
                                    'relativeData': false
                                  },
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Currency'
                                  }
                                },
                                'BuyUp': {
                                  'view': 'Text',
                                  'label': {
                                    'name': 'Plans[{state.plan,0}].Coverages[1].DemographicSummary.AverageTotalWeeklyBenefit',
                                    'relativeData': false
                                  },
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Currency'
                                  }
                                }
                              }
                            ],
                            'styles': 'margin-bottom'
                          }
                        ],
                        'version': 'DemographicPercentageSalaryBlock'
                      }
                    ],
                    'version': 'DemographicSalaryBlock'
                  }
                ],
                'version': 'DemographicTabBlock'
              }
            },
            {
              'view': 'Tab',
              'tab': 'Factors',
              'content': {
                '@class': 'org.openl.generated.beans.Layout',
                'view': 'VerticalLayout',
                'styles': '',
                'items': [
                  {
                    '@class': 'org.openl.generated.beans.Layout',
                    'view': 'VerticalLayout',
                    'styles': 'padding-largest margin-v radius bg-white',
                    style: {maxWidth: '48%'},
                    'items': [
                      {
                        '@class': 'org.openl.generated.beans.Text',
                        'view': 'Text',
                        'label': 'Policy Factors',
                        'styles': 'h3'
                      },
                      {
                        '@class': 'org.openl.generated.beans.Layout',
                        'view': 'HorizontalLayout',
                        'styles': 'wrap spread',
                        'items': [
                          {
                            'view': 'Col',
                            'items': [
                              {
                                '@class': 'org.openl.generated.beans.Layout',
                                'view': 'VerticalLayout',
                                'styles': 'padding-h-largest padding-v radius border margin-v align-center',
                                'items': [
                                  {
                                    '@class': 'org.openl.generated.beans.Input',
                                    'view': 'Input',
                                    'name': 'PolicyFactors.IndustryFactor',
                                    'label': 'Industry factor',
                                    'type': 'number',
                                    'format': 'double5',
                                    'relativeData': false,
                                    'autoSubmit': true,
                                    'removable': true,
                                    compact: true,
                                    styles: 'reverse border-on-hover',
                                    'min': 0
                                  }
                                ],
                                'version': 'FactorPolicyRow1Col1',
                                'style': {
                                  'minWidth': '45%'
                                }
                              }
                            ]
                          },
                          {
                            'view': 'Col',
                            'items': [
                              {
                                '@class': 'org.openl.generated.beans.Layout',
                                'view': 'VerticalLayout',
                                'styles': 'padding-h-largest padding-v margin-v border radius align-center',
                                'items': [
                                  {
                                    '@class': 'org.openl.generated.beans.Input',
                                    'view': 'Input',
                                    'name': 'PolicyFactors.SizeFactor',
                                    'label': 'Size factor',
                                    'type': 'number',
                                    'format': 'double5',
                                    'relativeData': false,
                                    'autoSubmit': true,
                                    'removable': true,
                                    styles: 'reverse border-on-hover',
                                    compact: true,
                                    'min': 0
                                  }
                                ],
                                'version': 'FactorPolicyRow1Col2',
                                'style': {
                                  'minWidth': '45%'
                                }
                              }
                            ]
                          }
                        ],
                        'version': 'FactorIndustrySizeRow'
                      },
                      {
                        '@class': 'org.openl.generated.beans.Layout',
                        'view': 'HorizontalLayout',
                        'styles': 'wrap spread',
                        'items': [
                          {
                            '@class': 'org.openl.generated.beans.Layout',
                            'view': 'VerticalLayout',
                            'styles': 'padding-largest margin-v align-center',
                            'items': [
                              {
                                '@class': 'org.openl.generated.beans.Text',
                                'view': 'Text',
                                'children': {
                                  'name': 'PolicyFactors.GeographicFactor',
                                  'relativeData': null
                                },
                                'styles': 'h4'
                              },
                              {
                                '@class': 'org.openl.generated.beans.Text',
                                'view': 'Text',
                                'label': 'Geographic'
                              }
                            ],
                            'version': 'FactorPolicyRow2Col1',
                          },
                          {
                            '@class': 'org.openl.generated.beans.Layout',
                            'view': 'VerticalLayout',
                            'styles': 'padding-largest margin-v align-center',
                            'items': [
                              {
                                '@class': 'org.openl.generated.beans.Text',
                                'view': 'Text',
                                'children': {
                                  'name': 'PolicyFactors.RateGuaranteeFactor',
                                  'relativeData': null
                                },
                                'styles': 'h4'
                              },
                              {
                                '@class': 'org.openl.generated.beans.Text',
                                'view': 'Text',
                                'label': 'Rate Guarantee'
                              }
                            ],
                            'version': 'FactorPolicyRow2Col2',
                          },
                          {
                            '@class': 'org.openl.generated.beans.Layout',
                            'view': 'VerticalLayout',
                            'styles': 'padding-largest margin-v align-center',
                            'items': [
                              {
                                '@class': 'org.openl.generated.beans.Text',
                                'view': 'Text',
                                'styles': 'h4',
                                'children': {
                                  'name': 'PolicyFactors.OtherProductsFactor',
                                  'relativeData': null
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.Text',
                                'view': 'Text',
                                'label': 'Multi-Product',
                              },
                            ],
                            'version': 'FactorPolicyRow2Col3',
                          }
                        ],
                        'version': 'FactorsPolicyRow'
                      }
                    ],
                    'version': 'FactorPolicy'
                  },
                  {
                    '@class': 'org.openl.generated.beans.RowList',
                    'view': 'RowList',
                    'name': 'Plans[{state.plan,0}].Coverages',
                    'styles': 'wrap justify margin-top-largest',
                    'relativeData': true,
                    'renderItem': {
                      '@class': 'org.openl.generated.beans.Layout',
                      'view': 'VerticalLayout',
                      'styles': 'padding-largest radius bg-white',
                      // If number of blocks is `n`, and space between blocks is `s` minWidth = (100% - s * (n - 1)) / n
                      'style': {minWidth: '48%'},
                      'items': [
                        {
                          '@class': 'org.openl.generated.beans.Text',
                          'view': 'Text',
                          'children': {
                            'name': 'CoverageType',
                            'relativeData': true
                          },
                          'styles': 'h3'
                        },
                        {
                          '@class': 'org.openl.generated.beans.Layout',
                          'view': 'HorizontalLayout',
                          'styles': 'wrap justify',
                          'items': [
                            {
                              '@class': 'org.openl.generated.beans.Layout',
                              'view': 'VerticalLayout',
                              'styles': 'padding-largest margin-v align-center radius bg-info-light',
                              'style': {width: '30%'},
                              'items': [
                                {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'children': {
                                    'name': 'Factors.CoverageFactor',
                                    'relativeData': null
                                  },
                                  'styles': 'h4'
                                },
                                {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'label': 'Coverage Factor'
                                }
                              ],
                              'version': 'FactorCoverageRowBlockRow1Col1',
                            },
                            {
                              '@class': 'org.openl.generated.beans.Layout',
                              'view': 'VerticalLayout',
                              'styles': 'padding-largest margin-v align-center radius bg-info-light',
                              'style': {width: '30%'},
                              'items': [
                                {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'children': {
                                    'name': 'Factors.DisabilityDefinitionFactor',
                                    'relativeData': null
                                  },
                                  'styles': 'h4'
                                },
                                {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'label': 'Definition of Disability'
                                }
                              ],
                              'version': 'FactorCoverageRowBlockRow1Col2',
                            },
                            {
                              '@class': 'org.openl.generated.beans.Layout',
                              'view': 'VerticalLayout',
                              'styles': 'padding-largest margin-v align-center radius bg-info-light',
                              'style': {width: '30%'},
                              'items': [
                                {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'children': {
                                    'name': 'Factors.BenefitPercentFactor',
                                    'relativeData': null
                                  },
                                  'styles': 'h4'
                                },
                                {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'label': 'Benefit Percent'
                                }
                              ],
                              'version': 'FactorCoverageRowBlockRow1Col3',
                            }
                          ],
                          'version': 'FactorCoverageRowBlockRow1'
                        },
                        {
                          '@class': 'org.openl.generated.beans.Layout',
                          'view': 'HorizontalLayout',
                          'styles': 'wrap justify',
                          'items': [
                            {
                              '@class': 'org.openl.generated.beans.Layout',
                              'view': 'VerticalLayout',
                              'styles': 'padding-largest margin-v align-center radius bg-warning-light',
                              'style': {width: '30%'},
                              'items': [
                                {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'children': {
                                    'name': 'Factors.ReturnToWorkFactor',
                                    'relativeData': null
                                  },
                                  'styles': 'h4'
                                },
                                {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'label': 'Return to Work'
                                }
                              ],
                              'version': 'FactorCoverageRowBlockRow2Col1',
                            },
                            {
                              '@class': 'org.openl.generated.beans.Layout',
                              'view': 'VerticalLayout',
                              'styles': 'padding-largest margin-v align-center radius bg-warning-light',
                              'style': {width: '30%'},
                              'items': [
                                {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'children': {
                                    'name': 'Factors.PreExistingFactor',
                                    'relativeData': null
                                  },
                                  'styles': 'h4'
                                },
                                {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'label': 'Pre-Existing condition'
                                }
                              ],
                              'version': 'FactorCoverageRowBlockRow2Col2',
                            },
                            {
                              '@class': 'org.openl.generated.beans.Layout',
                              'view': 'VerticalLayout',
                              'styles': 'padding-largest margin-v align-center radius bg-warning-light',
                              'items': [
                                {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'children': {
                                    'name': 'Factors.HospitalConfinementWaiverRate',
                                    'relativeData': null
                                  },
                                  'styles': 'h4'
                                },
                                {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'label': 'First Day Hospitalization'
                                }
                              ],
                              'style': {width: '30%'},
                              'version': 'FactorCoverageRowBlockRow2Col3',
                            }
                          ],
                          'version': 'FactorCoverageRowBlockRow2'
                        },
                        {
                          '@class': 'org.openl.generated.beans.Layout',
                          'view': 'HorizontalLayout',
                          'styles': 'wrap justify',
                          'items': [
                            {
                              '@class': 'org.openl.generated.beans.Layout',
                              'view': 'VerticalLayout',
                              'styles': 'padding-largest margin-v align-center radius bg-success-light',
                              'style': {width: '30%'},
                              'items': [
                                {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'children': {
                                    'name': 'Factors.WorkIncentiveFactor',
                                    'relativeData': null
                                  },
                                  'styles': 'h4'
                                },
                                {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'label': 'Work Incentive'
                                }
                              ],
                              'version': 'FactorCoverageRowBlockRow3Col1',
                            },
                            {
                              '@class': 'org.openl.generated.beans.Layout',
                              'view': 'VerticalLayout',
                              'styles': 'padding-largest margin-v align-center radius bg-success-light',
                              'style': {width: '30%'},
                              'items': [
                                {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'children': {
                                    'name': 'Factors.PortabilityFactor',
                                    'relativeData': null
                                  },
                                  'styles': 'h4'
                                },
                                {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'label': 'Portability'
                                }
                              ],
                              'version': 'FactorCoverageRowBlockRow3Col2',
                            },
                            {
                              '@class': 'org.openl.generated.beans.Layout',
                              'view': 'VerticalLayout',
                              'styles': 'padding-largest margin-v align-center radius bg-success-light',
                              'style': {width: '30%'},
                              'items': [
                                {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'children': {
                                    'name': 'Factors.FICAMatchingFactor',
                                    'relativeData': null
                                  },
                                  'styles': 'h4'
                                },
                                {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'label': 'FICA Match'
                                }
                              ],
                              'version': 'FactorCoverageRowBlockRow3Col3',
                            }
                          ],
                          'version': 'FactorCoverageRowBlockRow3'
                        }
                      ],
                      'version': 'FactorCoverageRowBlock',
                    }
                  }
                ],
                'version': 'FactorsTabBlock'
              }
            }
          ],
        }
      ],
      'version': 'PlanBlock'
    }
  ]
}
export const data = {
  'PolicyFactors': {
    'GeographicFactor': 0.713,
    'OtherProductsFactor': 1,
    'RateGuaranteeFactor': 1,
    'IndustryFactor': 1.30522,
    'SizeFactor': 0.89,
    'PolicyFactor': 0.828
  },
  'Plans': [
    {
      'Plan': 'Gold',
      'Coverages': [
        {
          'CoverageType': 'Core',
          'NumberOfLives': 6,
          'MonthlyPremium': 114.29,
          'TotalMonthlyPreExpenseCost': 82.59,
          'TotalNetClaimCost': 86.03,
          'TotalWeeklyBenefit': 2484.5,
          'Rate': 0.46,
          'Factors': {
            'HospitalConfinementWaiverRate': 1,
            'PortabilityFactor': 1.06,
            'DisabilityDefinitionFactor': 1,
            'FICAMatchingFactor': 1,
            'BenefitPercentFactor': 1.02,
            'ReturnToWorkFactor': 1.08,
            'CoverageFactor': 1,
            'ProgressiveIllnessProtection': 1,
            'PreExistingFactor': 1,
            'WorkIncentiveFactor': 1,
            'NetClaimCostAggregatedFactor': 1.17
          },
          'Tax': 0.02,
          'Expense': 0.1875,
          'Profit': 0.04,
          'DemographicSummary': {
            'AverageTotalWeeklyBenefit': 310.56,
            'FemalePercent': 0.45,
            'PercentFemaleUnder40': 0.45,
            'PercentFemaleUnder45': 0.52,
            'AverageAge': 49,
            'AverageAnnualSalary': 231647,
            'LowestAnnualSalary': 52000,
            'TopFirstAnnualSalary': 546000,
            'TopSecondAnnualSalary': 376480,
            'TopThirdAnnualSalary': 368784,
            'Top3WeeklySalaryAverage': 8277.33
          },
          'DemographicByAgeBands': [
            {
              'NumberOfLives': 0,
              'RateCard': '<25'
            },
            {
              'NumberOfLives': 0,
              'RateCard': '25 - 29'
            },
            {
              'NumberOfLives': 1,
              'RateCard': '30 - 34'
            },
            {
              'NumberOfLives': 1,
              'RateCard': '35 - 39'
            },
            {
              'NumberOfLives': 1,
              'RateCard': '40 - 44'
            },
            {
              'NumberOfLives': 0,
              'RateCard': '45 - 49'
            },
            {
              'NumberOfLives': 0,
              'RateCard': '50 - 54'
            },
            {
              'NumberOfLives': 1,
              'RateCard': '55 - 59'
            },
            {
              'NumberOfLives': 0,
              'RateCard': '60 - 64'
            },
            {
              'NumberOfLives': 1,
              'RateCard': '65+'
            }
          ],
          'WeeklySummaryByAgeBands': [
            {
              'AgeBand': '<25',
              'WeeklySalaryFemale': 0,
              'WeeklySalaryMale': 0,
              'WeeklySalaryTotal': 0
            },
            {
              'AgeBand': '25 - 29',
              'WeeklySalaryFemale': 0,
              'WeeklySalaryMale': 0,
              'WeeklySalaryTotal': 0
            },
            {
              'AgeBand': '30 - 34',
              'WeeklySalaryFemale': 10240,
              'WeeklySalaryMale': 0,
              'WeeklySalaryTotal': 10240
            },
            {
              'AgeBand': '35 - 39',
              'WeeklySalaryFemale': 7092,
              'WeeklySalaryMale': 0,
              'WeeklySalaryTotal': 7092
            },
            {
              'AgeBand': '40 - 44',
              'WeeklySalaryFemale': 1000,
              'WeeklySalaryMale': 0,
              'WeeklySalaryTotal': 1000
            },
            {
              'AgeBand': '45 - 49',
              'WeeklySalaryFemale': 0,
              'WeeklySalaryMale': 0,
              'WeeklySalaryTotal': 0
            },
            {
              'AgeBand': '50 - 54',
              'WeeklySalaryFemale': 0,
              'WeeklySalaryMale': 0,
              'WeeklySalaryTotal': 0
            },
            {
              'AgeBand': '55 - 59',
              'WeeklySalaryFemale': 1250,
              'WeeklySalaryMale': 10500,
              'WeeklySalaryTotal': 11750
            },
            {
              'AgeBand': '60 - 64',
              'WeeklySalaryFemale': 0,
              'WeeklySalaryMale': 0,
              'WeeklySalaryTotal': 0
            },
            {
              'AgeBand': '65+',
              'WeeklySalaryFemale': 4056,
              'WeeklySalaryMale': 1500,
              'WeeklySalaryTotal': 5556
            }
          ]
        },
        {
          'CoverageType': 'BuyUp',
          'NumberOfLives': 6,
          'MonthlyPremium': 65.81,
          'TotalMonthlyPreExpenseCost': 47.81,
          'TotalNetClaimCost': 49.8,
          'TotalWeeklyBenefit': 2437.5,
          'Rate': 0.27,
          'Factors': {
            'HospitalConfinementWaiverRate': 1,
            'PortabilityFactor': 1.06,
            'DisabilityDefinitionFactor': 1,
            'FICAMatchingFactor': 1,
            'BenefitPercentFactor': 1.06,
            'ReturnToWorkFactor': 1.08,
            'CoverageFactor': 1,
            'ProgressiveIllnessProtection': 1,
            'PreExistingFactor': 1,
            'WorkIncentiveFactor': 1,
            'NetClaimCostAggregatedFactor': 1.21
          },
          'Tax': 0.02,
          'Expense': 0.1875,
          'Profit': 0.04,
          'DemographicSummary': {
            'AverageTotalWeeklyBenefit': 348.21,
            'FemalePercent': 0.46,
            'PercentFemaleUnder40': 0.46,
            'PercentFemaleUnder45': 0.56,
            'AverageAge': 47,
            'AverageAnnualSalary': 186739.43,
            'LowestAnnualSalary': 52000,
            'TopFirstAnnualSalary': 376480,
            'TopSecondAnnualSalary': 368784,
            'TopThirdAnnualSalary': 210912,
            'Top3WeeklySalaryAverage': 6129.33
          },
          'DemographicByAgeBands': [
            {
              'NumberOfLives': 0,
              'RateCard': '<25'
            },
            {
              'NumberOfLives': 0,
              'RateCard': '25 - 29'
            },
            {
              'NumberOfLives': 1,
              'RateCard': '30 - 34'
            },
            {
              'NumberOfLives': 1,
              'RateCard': '35 - 39'
            },
            {
              'NumberOfLives': 1,
              'RateCard': '40 - 44'
            },
            {
              'NumberOfLives': 0,
              'RateCard': '45 - 49'
            },
            {
              'NumberOfLives': 0,
              'RateCard': '50 - 54'
            },
            {
              'NumberOfLives': 1,
              'RateCard': '55 - 59'
            },
            {
              'NumberOfLives': 0,
              'RateCard': '60 - 64'
            },
            {
              'NumberOfLives': 1,
              'RateCard': '65+'
            }
          ],
          'WeeklySummaryByAgeBands': [
            {
              'AgeBand': '<25',
              'WeeklySalaryFemale': 0,
              'WeeklySalaryMale': 0,
              'WeeklySalaryTotal': 0
            },
            {
              'AgeBand': '25 - 29',
              'WeeklySalaryFemale': 0,
              'WeeklySalaryMale': 0,
              'WeeklySalaryTotal': 0
            },
            {
              'AgeBand': '30 - 34',
              'WeeklySalaryFemale': 10240,
              'WeeklySalaryMale': 0,
              'WeeklySalaryTotal': 10240
            },
            {
              'AgeBand': '35 - 39',
              'WeeklySalaryFemale': 7092,
              'WeeklySalaryMale': 0,
              'WeeklySalaryTotal': 7092
            },
            {
              'AgeBand': '40 - 44',
              'WeeklySalaryFemale': 1000,
              'WeeklySalaryMale': 0,
              'WeeklySalaryTotal': 1000
            },
            {
              'AgeBand': '45 - 49',
              'WeeklySalaryFemale': 0,
              'WeeklySalaryMale': 0,
              'WeeklySalaryTotal': 0
            },
            {
              'AgeBand': '50 - 54',
              'WeeklySalaryFemale': 0,
              'WeeklySalaryMale': 0,
              'WeeklySalaryTotal': 0
            },
            {
              'AgeBand': '55 - 59',
              'WeeklySalaryFemale': 1250,
              'WeeklySalaryMale': 0,
              'WeeklySalaryTotal': 1250
            },
            {
              'AgeBand': '60 - 64',
              'WeeklySalaryFemale': 0,
              'WeeklySalaryMale': 0,
              'WeeklySalaryTotal': 0
            },
            {
              'AgeBand': '65+',
              'WeeklySalaryFemale': 4056,
              'WeeklySalaryMale': 1500,
              'WeeklySalaryTotal': 5556
            }
          ]
        }
      ]
    },
    {
      'Plan': 'Silver',
      'Coverages': [
        {
          'CoverageType': 'Core',
          'NumberOfLives': 6,
          'MonthlyPremium': 114.29,
          'TotalMonthlyPreExpenseCost': 82.59,
          'TotalNetClaimCost': 86.03,
          'TotalWeeklyBenefit': 2484.5,
          'Rate': 0.46,
          'Factors': {
            'HospitalConfinementWaiverRate': 1,
            'PortabilityFactor': 1.06,
            'DisabilityDefinitionFactor': 1,
            'FICAMatchingFactor': 1,
            'BenefitPercentFactor': 1.02,
            'ReturnToWorkFactor': 1.08,
            'CoverageFactor': 1,
            'ProgressiveIllnessProtection': 1,
            'PreExistingFactor': 1,
            'WorkIncentiveFactor': 1,
            'NetClaimCostAggregatedFactor': 1.17
          },
          'Tax': 0.02,
          'Expense': 0.1875,
          'Profit': 0.04,
          'DemographicSummary': {
            'AverageTotalWeeklyBenefit': 310.56,
            'FemalePercent': 0.45,
            'PercentFemaleUnder40': 0.45,
            'PercentFemaleUnder45': 0.52,
            'AverageAge': 49,
            'AverageAnnualSalary': 231647,
            'LowestAnnualSalary': 52000,
            'TopFirstAnnualSalary': 546000,
            'TopSecondAnnualSalary': 376480,
            'TopThirdAnnualSalary': 368784,
            'Top3WeeklySalaryAverage': 8277.33
          },
          'DemographicByAgeBands': [
            {
              'NumberOfLives': 0,
              'RateCard': '<25'
            },
            {
              'NumberOfLives': 0,
              'RateCard': '25 - 29'
            },
            {
              'NumberOfLives': 1,
              'RateCard': '30 - 34'
            },
            {
              'NumberOfLives': 1,
              'RateCard': '35 - 39'
            },
            {
              'NumberOfLives': 1,
              'RateCard': '40 - 44'
            },
            {
              'NumberOfLives': 0,
              'RateCard': '45 - 49'
            },
            {
              'NumberOfLives': 0,
              'RateCard': '50 - 54'
            },
            {
              'NumberOfLives': 1,
              'RateCard': '55 - 59'
            },
            {
              'NumberOfLives': 0,
              'RateCard': '60 - 64'
            },
            {
              'NumberOfLives': 1,
              'RateCard': '65+'
            }
          ],
          'WeeklySummaryByAgeBands': [
            {
              'AgeBand': '<25',
              'WeeklySalaryFemale': 0,
              'WeeklySalaryMale': 0,
              'WeeklySalaryTotal': 0
            },
            {
              'AgeBand': '25 - 29',
              'WeeklySalaryFemale': 0,
              'WeeklySalaryMale': 0,
              'WeeklySalaryTotal': 0
            },
            {
              'AgeBand': '30 - 34',
              'WeeklySalaryFemale': 10240,
              'WeeklySalaryMale': 0,
              'WeeklySalaryTotal': 10240
            },
            {
              'AgeBand': '35 - 39',
              'WeeklySalaryFemale': 7092,
              'WeeklySalaryMale': 0,
              'WeeklySalaryTotal': 7092
            },
            {
              'AgeBand': '40 - 44',
              'WeeklySalaryFemale': 1000,
              'WeeklySalaryMale': 0,
              'WeeklySalaryTotal': 1000
            },
            {
              'AgeBand': '45 - 49',
              'WeeklySalaryFemale': 0,
              'WeeklySalaryMale': 0,
              'WeeklySalaryTotal': 0
            },
            {
              'AgeBand': '50 - 54',
              'WeeklySalaryFemale': 0,
              'WeeklySalaryMale': 0,
              'WeeklySalaryTotal': 0
            },
            {
              'AgeBand': '55 - 59',
              'WeeklySalaryFemale': 1250,
              'WeeklySalaryMale': 10500,
              'WeeklySalaryTotal': 11750
            },
            {
              'AgeBand': '60 - 64',
              'WeeklySalaryFemale': 0,
              'WeeklySalaryMale': 0,
              'WeeklySalaryTotal': 0
            },
            {
              'AgeBand': '65+',
              'WeeklySalaryFemale': 4056,
              'WeeklySalaryMale': 1500,
              'WeeklySalaryTotal': 5556
            }
          ]
        }
      ]
    }
  ]
}
