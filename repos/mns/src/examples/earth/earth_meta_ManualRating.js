export default {
  view: 'Col',
  className: 'card-glass margin-auto margin-v-small',
  'showIf': {
    'relativeData': false,
    'name': 'response.ratingDetails'
  },
  'items': [
    {
      'view': 'VerticalLayout',
      'className': 'radius padding padding-h-largest bg-neutral',
      'relativeData': false,
      'items': [
        {
          view: 'HorizontalLayout',
          className: 'middle margin-right-largest',
          'items': [
            {
              'view': 'Text',
              'label': 'Plans',
              'className': 'h4'
            },
            {
              'view': 'Space'
            },
            {
              'view': 'Dropdown',
              'name': 'plan',
              relativeData: false,
              options: {
                name: 'response.ratingDetails.plans',
                relativeData: false,
              },
              'mapOptions': 'plan',
              'compact': true
            },
          ],
          'version': 'PlanListLayout'
        },
        {
          'view': 'TabList',
          'name': 'response.ratingDetails.plans[{state.plan,0}].coveragesDetails',
          className: 'margin-top-largest',
          // Required for Dropdown menu to show correctly inside Tabs, but will break Tabs layout in narrow screens!
          // styleTabs: {overflow: 'visible'},
          // classNameTabsInner: 'middle',
          // childrenBeforeTabs: {
          //   view: 'HorizontalLayout',
          //   className: 'middle margin-right-largest',
          //   'items': [
          //     {
          //       'view': 'Text',
          //       'label': 'Plans',
          //       'className': 'h4'
          //     },
          //     {
          //       'view': 'Space'
          //     },
          //     {
          //       'view': 'Dropdown',
          //       'name': 'plan',
          //       relativeData: false,
          //       options: {
          //         name: 'response.ratingDetails.plans',
          //         relativeData: false,
          //       },
          //       'mapOptions': 'plan',
          //       value: {name: '{state.plan,0}'}, // -> automatically added by default due to OpenL rules
          //       onChange: 'setState,plan', // function defined as string, added by default due to OpenL rules
          //       'compact': true
          //     },
          //   ],
          //   'version': 'PlanListLayout'
          // },
          'renderLabel': {
            'view': 'Text',
            'children': {
              'name': 'caverageName'
            },
            'relativeData': true
          },
          'renderItem': {
            'view': 'VerticalLayout',
            'className': 'margin-v',
            'relativeData': false,
            'items': [
              {
                'view': 'VerticalLayout',
                'relativeData': false,
                'items': [
                  {
                    '@class': 'org.openl.generated.beans.Text',
                    'view': 'Text',
                    'label': 'Exposure',
                    'className': 'h6'
                  },
                  {
                    'view': 'HorizontalLayout',
                    'className': 'middle fill-width',
                    'relativeData': false,
                    'items': [
                      {
                        'view': 'VerticalLayout',
                        'className': 'full-width',
                        'relativeData': false,
                        'items': [
                          {
                            '@class': 'org.openl.generated.beans.TableRows',
                            'view': 'Table',
                            'headers': [
                              {
                                'id': 'Description',
                                'label': 'Description',
                                'styleHeader': {
                                  'width': '300px'
                                }
                              },
                              {
                                'id': 'Total',
                                'label': 'Total',
                                'styleHeader': {
                                  'width': '0.3'
                                }
                              },
                              {
                                'id': 'Factors',
                                'label': 'Factors',
                                'styleHeader': {
                                  'width': '0.15'
                                }
                              },
                              {
                                'id': 'Comments',
                                'label': 'Comments',
                                'styleHeader': {
                                  'width': '300px'
                                }
                              }
                            ],
                            'extraItems': [
                              {
                                '@class': 'org.openl.generated.beans.TableRowsItems1',
                                'Description': 'Lives - Eligible',
                                'Total': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'children': {
                                    'name': 'claimCostInfo.livesEligible'
                                  }
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableRowsItems1',
                                'Description': 'Lives - Participating',
                                'Total': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'children': {
                                    'name': 'claimCostInfo.livesParticipating'
                                  }
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableRowsItems1',
                                'Description': 'Participation',
                                'Total': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Percent',
                                    'decimals': 2
                                  },
                                  'children': {
                                    'name': 'claimCostInfo.participation'
                                  }
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableRowsItems1',
                                'Description': 'Monthly Salary',
                                'Total': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Currency'
                                  },
                                  'children': {
                                    'name': 'claimCostInfo.monthlySalary'
                                  }
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableRowsItems1',
                                'Description': 'Volume',
                                'Total': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Currency'
                                  },
                                  'children': {
                                    'name': 'claimCostInfo.volume'
                                  }
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableRowsItems1',
                                'Description': 'Monthly Claim Cost - Base - Total',
                                'Total': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Currency'
                                  },
                                  'children': {
                                    'name': 'claimCostInfo.monthlyClaimCost'
                                  }
                                }
                              }
                            ]
                          }
                        ],
                        'version': 'ClaimCostTableVLayout'
                      },
                      {
                        '@class': 'org.openl.generated.beans.Layout',
                        'view': 'VerticalLayout',
                        'className': 'fill-width',
                        'relativeData': false,
                        'items': [
                          {
                            'view': 'Table',
                            'name': 'classesDetails',
                            'headers': [
                              {
                                'id': '_class',
                                'label': '_',
                                'classNameHeader': 'invisible',
                                'classNameCellWrap': 'border-left bg-grey-lightest bold'
                              },
                              {
                                'id': 'claimCostInfo.livesEligible',
                                'label': '_',
                                'classNameHeader': 'invisible',
                                'classNameCellWrap': 'border-left'
                              },
                              {
                                'id': 'claimCostInfo.livesParticipating',
                                'label': '_',
                                'classNameHeader': 'invisible',
                                'classNameCellWrap': 'border-left'
                              },
                              {
                                'id': 'claimCostInfo.participation',
                                'label': '_',
                                'classNameHeader': 'invisible',
                                'classNameCellWrap': 'border-left',
                                'renderCell': {
                                  'name': 'Percent',
                                  'decimals': 2
                                }
                              },
                              {
                                'id': 'claimCostInfo.monthlySalary',
                                'label': '_',
                                'classNameHeader': 'invisible',
                                'classNameCellWrap': 'border-left'
                              },
                              {
                                'id': 'claimCostInfo.volume',
                                'label': '_',
                                'classNameHeader': 'invisible',
                                'classNameCellWrap': 'border-left',
                                'renderCell': {
                                  '@class': 'org.openl.generated.beans.RenderCell',
                                  'name': 'Currency'
                                }
                              },
                              {
                                'id': 'claimCostInfo.monthlyClaimCost',
                                'label': '_',
                                'classNameHeader': 'invisible',
                                'classNameCellWrap': 'border-left',
                                'renderCell': {
                                  '@class': 'org.openl.generated.beans.RenderCell',
                                  'name': 'Currency'
                                }
                              }
                            ],
                            'vertical': true
                          }
                        ],
                        'version': 'ClassClaimCostTableVLayout'
                      }
                    ],
                    'version': 'ClaimCostTables'
                  },
                  {
                    '@class': 'org.openl.generated.beans.Element',
                    'view': 'Space'
                  }
                ],
                'version': 'ClaimCostLayout'
              },
              {
                '@class': 'org.openl.generated.beans.Element',
                'view': 'Space'
              },
              {
                '@class': 'org.openl.generated.beans.Layout',
                'view': 'VerticalLayout',
                'relativeData': false,
                'items': [
                  {
                    '@class': 'org.openl.generated.beans.Text',
                    'view': 'Text',
                    'label': 'Formula',
                    'className': 'h6'
                  },
                  {
                    '@class': 'org.openl.generated.beans.Layout',
                    'view': 'HorizontalLayout',
                    'className': 'middle fill-width',
                    'relativeData': false,
                    'items': [
                      {
                        '@class': 'org.openl.generated.beans.Layout',
                        'view': 'VerticalLayout',
                        'className': 'full-width',
                        'relativeData': false,
                        'items': [
                          {
                            '@class': 'org.openl.generated.beans.TableRows',
                            'view': 'Table',
                            'headers': [
                              {
                                'id': 'Description',
                                'label': 'Description',
                                'styleHeader': {
                                  'width': '300px'
                                }
                              },
                              {
                                'id': 'Total',
                                'label': 'Total',
                                'styleHeader': {
                                  'width': '0.3'
                                }
                              },
                              {
                                'id': 'Factors',
                                'label': 'Factors',
                                'styleHeader': {
                                  'width': '0.15'
                                }
                              },
                              {
                                'id': 'Comments',
                                'label': 'Comments',
                                'styleHeader': {
                                  'width': '300px'
                                }
                              }
                            ],
                            'extraItems': [
                              {
                                '@class': 'org.openl.generated.beans.TableRowsItems1',
                                'Description': 'Contribution',
                                'Total': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Currency'
                                  },
                                  'children': {
                                    'name': 'coverageFormulaInfo.factors.contributionValue'
                                  }
                                },
                                'Factors': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'children': {
                                    'name': 'coverageFormulaInfo.factors.contributionFactor'
                                  }
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableRowsItems1',
                                'Description': 'Duration Of Disability',
                                'Total': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Currency'
                                  },
                                  'children': {
                                    'name': 'coverageFormulaInfo.factors.durationOfDisabilityValue'
                                  }
                                },
                                'Factors': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'children': {
                                    'name': 'coverageFormulaInfo.factors.durationOfDisabilityFactor'
                                  }
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableRowsItems1',
                                'Description': 'Portability',
                                'Total': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Currency'
                                  },
                                  'children': {
                                    'name': 'coverageFormulaInfo.factors.portabilityValue'
                                  }
                                },
                                'Factors': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'children': {
                                    'name': 'coverageFormulaInfo.factors.portabilityFactor'
                                  }
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableRowsItems1',
                                'Description': 'Conversion',
                                'Total': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Currency'
                                  },
                                  'children': {
                                    'name': 'coverageFormulaInfo.factors.conversionValue'
                                  }
                                },
                                'Factors': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'children': {
                                    'name': 'coverageFormulaInfo.factors.conversionFactor'
                                  }
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableRowsItems1',
                                'Description': 'Industry',
                                'Total': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Currency'
                                  },
                                  'children': {
                                    'name': 'coverageFormulaInfo.factors.industryValue'
                                  }
                                },
                                'Factors': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'children': {
                                    'name': 'coverageFormulaInfo.factors.industryFactor'
                                  }
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableRowsItems1',
                                'Description': 'Area',
                                'Total': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Currency'
                                  },
                                  'children': {
                                    'name': 'coverageFormulaInfo.factors.areaValue'
                                  }
                                },
                                'Factors': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'children': {
                                    'name': 'coverageFormulaInfo.factors.areaFactor'
                                  }
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableRowsItems1',
                                'Description': 'Case Size',
                                'Total': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Currency'
                                  },
                                  'children': {
                                    'name': 'coverageFormulaInfo.factors.caseSizeValue'
                                  }
                                },
                                'Factors': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'children': {
                                    'name': 'coverageFormulaInfo.factors.caseSizeFactor'
                                  }
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableRowsItems1',
                                'Description': 'Adjusted Monthly Claim Cost',
                                'Total': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Currency'
                                  },
                                  'children': {
                                    'name': 'coverageFormulaInfo.adjustedMonthlyClaimCost'
                                  }
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableRowsItems1',
                                'Description': 'Monthly Claim Rate',
                                'Total': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'children': {
                                    'name': 'coverageFormulaInfo.monthlyClaimRate'
                                  }
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableRowsItems1',
                                'Description': 'Retention',
                                'Total': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Percent',
                                    'decimals': 2
                                  },
                                  'children': {
                                    'name': 'coverageFormulaInfo.retention'
                                  }
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableRowsItems1',
                                'Description': 'Final Claim Cost',
                                'Total': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Currency'
                                  },
                                  'children': {
                                    'name': 'coverageFormulaInfo.finalClaimCost'
                                  }
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableRowsItems1',
                                'Description': 'Monthly Rate',
                                'Total': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'children': {
                                    'name': 'coverageFormulaInfo.monthlyRate'
                                  }
                                }
                              }
                            ]
                          }
                        ],
                        'version': 'FormulaTableVLayout'
                      },
                      {
                        '@class': 'org.openl.generated.beans.Layout',
                        'view': 'VerticalLayout',
                        'className': 'fill-width',
                        'relativeData': false,
                        'items': [
                          {
                            '@class': 'org.openl.generated.beans.Table',
                            'view': 'Table',
                            'name': 'classesDetails',
                            'headers': [
                              {
                                'id': '_class',
                                'label': '_',
                                'classNameHeader': 'invisible',
                                'classNameCellWrap': 'border-left bg-grey-lightest bold'
                              },
                              {
                                'id': 'classFormulaInfo.factors.contributionFactor',
                                'label': '_',
                                'classNameHeader': 'invisible',
                                'classNameCellWrap': 'border-left'
                              },
                              {
                                'id': 'classFormulaInfo.factors.durationOfDisabilityFactor',
                                'label': '_',
                                'classNameHeader': 'invisible',
                                'classNameCellWrap': 'border-left'
                              },
                              {
                                'id': 'classFormulaInfo.factors.portabilityFactor',
                                'label': '_',
                                'classNameHeader': 'invisible',
                                'classNameCellWrap': 'border-left'
                              },
                              {
                                'id': 'classFormulaInfo.factors.conversionFactor',
                                'label': '_',
                                'classNameHeader': 'invisible',
                                'classNameCellWrap': 'border-left'
                              },
                              {
                                'id': 'classFormulaInfo.factors.industryFactor',
                                'label': '_',
                                'classNameHeader': 'invisible',
                                'classNameCellWrap': 'border-left'
                              },
                              {
                                'id': 'classFormulaInfo.factors.areaFactor',
                                'label': '_',
                                'classNameHeader': 'invisible',
                                'classNameCellWrap': 'border-left'
                              },
                              {
                                'id': 'classFormulaInfo.factors.caseSizeFactor',
                                'label': '_',
                                'classNameHeader': 'invisible',
                                'classNameCellWrap': 'border-left'
                              },
                              {
                                'label': '_',
                                'classNameHeader': 'invisible',
                                'classNameCellWrap': 'border-left'
                              },
                              {
                                'label': '_',
                                'classNameHeader': 'invisible',
                                'classNameCellWrap': 'border-left'
                              },
                              {
                                'label': '_',
                                'classNameHeader': 'invisible',
                                'classNameCellWrap': 'border-left'
                              },
                              {
                                'label': '_',
                                'classNameHeader': 'invisible',
                                'classNameCellWrap': 'border-left'
                              },
                              {
                                'label': '_',
                                'classNameHeader': 'invisible',
                                'classNameCellWrap': 'border-left'
                              }
                            ],
                            'vertical': true
                          }
                        ],
                        'version': 'ClassFormulaTableVLayout'
                      }
                    ],
                    'version': 'FormulaTables'
                  },
                  {
                    '@class': 'org.openl.generated.beans.Element',
                    'view': 'Space'
                  }
                ],
                'version': 'FormulaLayout'
              },
              {
                '@class': 'org.openl.generated.beans.Element',
                'view': 'Space'
              },
              {
                'view': 'VerticalLayout',
                'relativeData': false,
                'items': [
                  {
                    'view': 'Text',
                    'label': 'UW Adjusted',
                    'className': 'h6'
                  },
                  {
                    'view': 'HorizontalLayout',
                    'className': 'middle fill-width',
                    'relativeData': false,
                    'items': [
                      {
                        'view': 'VerticalLayout',
                        'className': 'full-width',
                        'relativeData': false,
                        'items': [
                          {
                            'view': 'Table',
                            'headers': [
                              {
                                'id': 'Description',
                                'label': 'Description',
                                'styleHeader': {
                                  'width': '300px'
                                }
                              },
                              {
                                'id': 'Total',
                                'label': 'Total',
                                'styleHeader': {
                                  'width': '0.3'
                                }
                              },
                              {
                                'id': 'Factors',
                                'label': 'Factors',
                                'styleHeader': {
                                  'width': '0.15'
                                }
                              },
                              {
                                'id': 'Comments',
                                'label': 'Comments',
                                'styleHeader': {
                                  'width': '300px'
                                }
                              }
                            ],
                            'extraItems': [
                              {
                                '@class': 'org.openl.generated.beans.TableRowsItems1',
                                'Description': 'Contribution',
                                'Total': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Currency'
                                  },
                                  'children': {
                                    'name': 'coverageUWAdjustedInfo.factors.contributionValue'
                                  }
                                },
                                'Factors': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'children': {
                                    'name': 'coverageUWAdjustedInfo.factors.contributionFactor'
                                  }
                                },
                                'Comments': {
                                  '@class': 'org.openl.generated.beans.Input',
                                  'view': 'Input',
                                  'name': 'coverageUWAdjustedInfo.factors.comment1',
                                  'type': 'string',
                                  'disabled': false,
                                  'relativeData': true
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableRowsItems1',
                                'Description': 'Duration Of Disability',
                                'Total': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Currency'
                                  },
                                  'children': {
                                    'name': 'coverageUWAdjustedInfo.factors.durationOfDisabilityValue'
                                  }
                                },
                                'Factors': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'children': {
                                    'name': 'coverageUWAdjustedInfo.factors.durationOfDisabilityFactor'
                                  }
                                },
                                'Comments': {
                                  '@class': 'org.openl.generated.beans.Input',
                                  'view': 'Input',
                                  'name': 'coverageUWAdjustedInfo.factors.comment2',
                                  'type': 'string',
                                  'disabled': false,
                                  'relativeData': true
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableRowsItems1',
                                'Description': 'Portability',
                                'Total': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Currency'
                                  },
                                  'children': {
                                    'name': 'coverageUWAdjustedInfo.factors.portabilityValue'
                                  }
                                },
                                'Factors': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'children': {
                                    'name': 'coverageUWAdjustedInfo.factors.portabilityFactor'
                                  }
                                },
                                'Comments': {
                                  '@class': 'org.openl.generated.beans.Input',
                                  'view': 'Input',
                                  'name': 'coverageUWAdjustedInfo.factors.comment3',
                                  'type': 'string',
                                  'disabled': false,
                                  'relativeData': true
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableRowsItems1',
                                'Description': 'Conversion',
                                'Total': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Currency'
                                  },
                                  'children': {
                                    'name': 'coverageUWAdjustedInfo.factors.conversionValue'
                                  }
                                },
                                'Factors': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'children': {
                                    'name': 'coverageUWAdjustedInfo.factors.conversionFactor'
                                  }
                                },
                                'Comments': {
                                  '@class': 'org.openl.generated.beans.Input',
                                  'view': 'Input',
                                  'name': 'coverageUWAdjustedInfo.factors.comment4',
                                  'type': 'string',
                                  'disabled': false,
                                  'relativeData': true
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableRowsItems1',
                                'Description': 'Industry',
                                'Total': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Currency'
                                  },
                                  'children': {
                                    'name': 'coverageUWAdjustedInfo.factors.industryValue'
                                  }
                                },
                                'Factors': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'children': {
                                    'name': 'coverageUWAdjustedInfo.factors.industryFactor'
                                  }
                                },
                                'Comments': {
                                  '@class': 'org.openl.generated.beans.Input',
                                  'view': 'Input',
                                  'name': 'coverageUWAdjustedInfo.factors.comment5',
                                  'type': 'string',
                                  'disabled': false,
                                  'relativeData': true
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableRowsItems1',
                                'Description': 'Area',
                                'Total': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Currency'
                                  },
                                  'children': {
                                    'name': 'coverageUWAdjustedInfo.factors.areaValue'
                                  }
                                },
                                'Factors': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'children': {
                                    'name': 'coverageUWAdjustedInfo.factors.areaFactor'
                                  }
                                },
                                'Comments': {
                                  '@class': 'org.openl.generated.beans.Input',
                                  'view': 'Input',
                                  'name': 'coverageUWAdjustedInfo.factors.comment6',
                                  'type': 'string',
                                  'disabled': false,
                                  'relativeData': true
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableRowsItems1',
                                'Description': 'Case Size',
                                'Total': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Currency'
                                  },
                                  'children': {
                                    'name': 'coverageUWAdjustedInfo.factors.caseSizeValue'
                                  }
                                },
                                'Factors': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'children': {
                                    'name': 'coverageUWAdjustedInfo.factors.caseSizeFactor'
                                  }
                                },
                                'Comments': {
                                  '@class': 'org.openl.generated.beans.Input',
                                  'view': 'Input',
                                  'name': 'coverageUWAdjustedInfo.factors.comment7',
                                  'type': 'string',
                                  'disabled': false,
                                  'relativeData': true
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableRowsItems1',
                                'Description': 'Adjusted Monthly Claim Cost',
                                'Total': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Currency'
                                  },
                                  'children': {
                                    'name': 'coverageUWAdjustedInfo.adjustedMonthlyClaimCost'
                                  }
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableRowsItems1',
                                'Description': 'Monthly Claim Rate',
                                'Total': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'children': {
                                    'name': 'coverageUWAdjustedInfo.monthlyClaimRate'
                                  }
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableRowsItems1',
                                'Description': 'Retention',
                                'Total': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Percent',
                                    'decimals': 2
                                  },
                                  'children': {
                                    'name': 'coverageUWAdjustedInfo.retention'
                                  }
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableRowsItems1',
                                'Description': 'Final Claim Cost',
                                'Total': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'renderLabel': {
                                    '@class': 'org.openl.generated.beans.RenderLabel',
                                    'name': 'Currency'
                                  },
                                  'children': {
                                    'name': 'coverageUWAdjustedInfo.finalClaimCost'
                                  }
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableRowsItems1',
                                'Description': 'Monthly Rate',
                                'Total': {
                                  '@class': 'org.openl.generated.beans.Text',
                                  'view': 'Text',
                                  'children': {
                                    'name': 'coverageUWAdjustedInfo.monthlyRate'
                                  }
                                }
                              }
                            ]
                          }
                        ],
                        'version': 'UWAdjustedVLayout'
                      },
                      {
                        'view': 'VerticalLayout',
                        'className': 'fill-width',
                        'relativeData': false,
                        'items': [
                          {
                            'view': 'Table',
                            'name': 'classesDetails',
                            'headers': [
                              {
                                'id': '_class',
                                'label': '_',
                                'classNameHeader': 'invisible',
                                'classNameCellWrap': 'border-left bg-grey-lightest bold'
                              },
                              {
                                'label': '_',
                                'classNameHeader': 'invisible',
                                'classNameCellWrap': 'border-left',
                                'renderCell': {
                                  '@class': 'org.openl.generated.beans.Input',
                                  'view': 'Input',
                                  'name': 'classUWAdjustedInfo.factors.contributionFactor',
                                  'type': 'number',
                                  'format': 'double5',
                                  'disabled': false,
                                  'relativeData': true,
                                  'autoSubmit': true
                                }
                              },
                              {
                                'label': '_',
                                'classNameHeader': 'invisible',
                                'classNameCellWrap': 'border-left',
                                'renderCell': {
                                  'view': 'Input',
                                  'name': 'classUWAdjustedInfo.factors.durationOfDisabilityFactor',
                                  'type': 'number',
                                  'format': 'double5',
                                  'disabled': false,
                                  'relativeData': true,
                                  'autoSubmit': true
                                }
                              },
                              {
                                'label': '_',
                                'classNameHeader': 'invisible',
                                'classNameCellWrap': 'border-left',
                                'renderCell': {
                                  '@class': 'org.openl.generated.beans.Input',
                                  'view': 'Input',
                                  'name': 'classUWAdjustedInfo.factors.portabilityFactor',
                                  'type': 'number',
                                  'format': 'double5',
                                  'disabled': false,
                                  'relativeData': true,
                                  'autoSubmit': true
                                }
                              },
                              {
                                'label': '_',
                                'classNameHeader': 'invisible',
                                'classNameCellWrap': 'border-left',
                                'renderCell': {
                                  '@class': 'org.openl.generated.beans.Input',
                                  'view': 'Input',
                                  'name': 'classUWAdjustedInfo.factors.conversionFactor',
                                  'type': 'number',
                                  'format': 'double5',
                                  'disabled': false,
                                  'relativeData': true,
                                  'autoSubmit': true
                                }
                              },
                              {
                                'label': '_',
                                'classNameHeader': 'invisible',
                                'classNameCellWrap': 'border-left',
                                'renderCell': {
                                  '@class': 'org.openl.generated.beans.Input',
                                  'view': 'Input',
                                  'name': 'classUWAdjustedInfo.factors.industryFactor',
                                  'type': 'number',
                                  'format': 'double5',
                                  'disabled': false,
                                  'relativeData': true,
                                  'autoSubmit': true
                                }
                              },
                              {
                                'label': '_',
                                'classNameHeader': 'invisible',
                                'classNameCellWrap': 'border-left',
                                'renderCell': {
                                  '@class': 'org.openl.generated.beans.Input',
                                  'view': 'Input',
                                  'name': 'classUWAdjustedInfo.factors.areaFactor',
                                  'type': 'number',
                                  'format': 'double5',
                                  'disabled': false,
                                  'relativeData': true,
                                  'autoSubmit': true
                                }
                              },
                              {
                                'label': '_',
                                'classNameHeader': 'invisible',
                                'classNameCellWrap': 'border-left',
                                'renderCell': {
                                  '@class': 'org.openl.generated.beans.Input',
                                  'view': 'Input',
                                  'name': 'classUWAdjustedInfo.factors.caseSizeFactor',
                                  'type': 'number',
                                  'format': 'double5',
                                  'disabled': false,
                                  'relativeData': true,
                                  'autoSubmit': true
                                }
                              },
                              {
                                'label': '_',
                                'classNameHeader': 'invisible',
                                'classNameCellWrap': 'border-left'
                              },
                              {
                                'label': '_',
                                'classNameHeader': 'invisible',
                                'classNameCellWrap': 'border-left'
                              },
                              {
                                'label': '_',
                                'classNameHeader': 'invisible',
                                'classNameCellWrap': 'border-left'
                              },
                              {
                                'label': '_',
                                'classNameHeader': 'invisible',
                                'classNameCellWrap': 'border-left'
                              },
                              {
                                'label': '_',
                                'classNameHeader': 'invisible',
                                'classNameCellWrap': 'border-left'
                              }
                            ],
                            'vertical': true
                          }
                        ],
                        'version': 'ClassUWAdjustedVLayout'
                      }
                    ],
                    'version': 'UWAdjustedTables'
                  },
                ],
                'version': 'UWAdjustedLayout'
              },
            ],
            'version': 'CoverageLayout'
          },
          'relativeData': true
        },
      ],
    }
  ],
  'version': '0.19.1'
}
