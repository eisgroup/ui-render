export default {
  'view': 'VerticalLayout',
  'styles': 'padding-h-largest',
  'items': [
    {
      '@class': 'org.openl.generated.beans.Layout',
      'view': 'VerticalLayout',
      'styles': 'margin-v-largest',
      'relativeData': false,
      'items': [
        {
          '@class': 'org.openl.generated.beans.Title',
          'view': 'Title',
          'label': 'Rating Details',
          'styles': 'padding'
        },
        {
          '@class': 'org.openl.generated.beans.Tabs',
          'view': 'Tabs',
          'items': [
            {
              'view': 'Tab',
              'tab': 'General Summary',
              'content': {
                '@class': 'org.openl.generated.beans.Layout',
                'view': 'VerticalLayout',
                'items': [
                  {
                    '@class': 'org.openl.generated.beans.Layout',
                    'view': 'VerticalLayout',
                    'styles': 'padding-largest margin-top-largest radius bg-neutral',
                    'items': [
                      {
                        '@class': 'org.openl.generated.beans.Text',
                        'view': 'Text',
                        'label': 'Manual Rates And Premiums',
                        'styles': 'h5 padding-smaller'
                      },
                      {
                        '@class': 'org.openl.generated.beans.Table',
                        'view': 'Table',
                        'name': 'Plans[{state.plan,0}].Coverages[0].Classes',
                        'headers': [
                          {
                            '@class': 'org.openl.generated.beans.TableHeader',
                            'id': 'ClassName',
                            'label': 'Class'
                          }
                        ],
                        'renderItem': {
                          '@class': 'org.openl.generated.beans.Table',
                          'view': 'Table',
                          'name': 'RatesAndPremiumByTier',
                          'headers': [
                            {
                              '@class': 'org.openl.generated.beans.TableHeader',
                              'id': 'TierName',
                              'label': 'Tier',
                              'styleHeader': {
                                'width': '150px'
                              }
                            },
                            {
                              '@class': 'org.openl.generated.beans.TableHeader',
                              'id': 'NumberOfLives',
                              'label': 'Number Of Lives',
                              'styleHeader': {
                                'width': '100px'
                              }
                            },
                            {
                              '@class': 'org.openl.generated.beans.TableHeader',
                              'id': 'ManualRate',
                              'label': 'Manual Rate',
                              'styleHeader': {
                                'width': '120px'
                              },
                              'renderCell': {
                                '@class': 'org.openl.generated.beans.RenderCell',
                                'name': 'Currency',
                                'decimals': 2
                              }
                            },
                            {
                              '@class': 'org.openl.generated.beans.TableHeader',
                              'id': 'MonthlyPremium',
                              'label': 'Monthly Premium',
                              'styleHeader': {
                                'width': '120px'
                              },
                              'renderCell': {
                                '@class': 'org.openl.generated.beans.RenderCell',
                                'name': 'Currency',
                                'decimals': 2
                              }
                            },
                            {
                              '@class': 'org.openl.generated.beans.TableHeader',
                              'id': 'AnnualPremium',
                              'label': 'Annual Premium',
                              'styleHeader': {
                                'width': '120px'
                              },
                              'renderCell': {
                                '@class': 'org.openl.generated.beans.RenderCell',
                                'name': 'Currency',
                                'decimals': 2
                              }
                            }
                          ],
                          'showIf': {}
                        },
                        'itemsExpanded': true,
                        'showIf': {}
                      }
                    ],
                    'version': 'RatesAndPremiumBlock'
                  },
                  {
                    '@class': 'org.openl.generated.beans.Element',
                    'view': 'Space'
                  },
                  {
                    '@class': 'org.openl.generated.beans.Layout',
                    'view': 'VerticalLayout',
                    'styles': 'padding-largest margin-top-largest radius bg-neutral',
                    'items': [
                      {
                        '@class': 'org.openl.generated.beans.Text',
                        'view': 'Text',
                        'label': 'Claim Costs By Benefit',
                        'styles': 'h5 padding-smaller'
                      },
                      {
                        '@class': 'org.openl.generated.beans.Table',
                        'view': 'Table',
                        'name': 'Plans[{state.plan,0}].Coverages',
                        'headers': [
                          {
                            '@class': 'org.openl.generated.beans.TableHeader',
                            'id': 'PlanCategory',
                            'label': 'Plan Category'
                          }
                        ],
                        'renderItem': {
                          '@class': 'org.openl.generated.beans.Table',
                          'view': 'Table',
                          'name': 'RatesAndPremiumByTierElement',
                          'headers': [
                            {
                              '@class': 'org.openl.generated.beans.TableHeader',
                              'id': 'TierElement',
                              'label': 'Tier Element'
                            },
                            {
                              '@class': 'org.openl.generated.beans.TableHeader',
                              'id': 'Orthodontics',
                              'label': 'Orthodontics',
                              'renderCell': {
                                '@class': 'org.openl.generated.beans.RenderCell',
                                'name': 'Currency',
                                'decimals': 2
                              }
                            },
                            {
                              '@class': 'org.openl.generated.beans.TableHeader',
                              'id': 'TMJ',
                              'label': 'TM Joint',
                              'renderCell': {
                                '@class': 'org.openl.generated.beans.RenderCell',
                                'name': 'Currency',
                                'decimals': 2
                              }
                            },
                            {
                              '@class': 'org.openl.generated.beans.TableHeader',
                              'id': 'Implants',
                              'label': 'Implants',
                              'renderCell': {
                                '@class': 'org.openl.generated.beans.RenderCell',
                                'name': 'Currency',
                                'decimals': 2
                              }
                            },
                            {
                              '@class': 'org.openl.generated.beans.TableHeader',
                              'id': 'CosmeticServices',
                              'label': 'Cosmetic Services',
                              'renderCell': {
                                '@class': 'org.openl.generated.beans.RenderCell',
                                'name': 'Currency',
                                'decimals': 2
                              }
                            },
                            {
                              '@class': 'org.openl.generated.beans.TableHeader',
                              'id': 'ContributionFactor',
                              'label': 'Contribution',
                              'renderCell': {
                                '@class': 'org.openl.generated.beans.RenderCell',
                                'name': 'Float',
                                'decimals': 3
                              }
                            },
                            {
                              '@class': 'org.openl.generated.beans.TableHeader',
                              'id': 'SizeFactor',
                              'label': 'Size Factor',
                              'renderCell': {
                                '@class': 'org.openl.generated.beans.RenderCell',
                                'name': 'Float',
                                'decimals': 3
                              }
                            },
                            {
                              '@class': 'org.openl.generated.beans.TableHeader',
                              'id': 'MorbidityFactor',
                              'label': 'Morbidity',
                              'renderCell': {
                                '@class': 'org.openl.generated.beans.RenderCell',
                                'name': 'Float',
                                'decimals': 3
                              }
                            },
                            {
                              '@class': 'org.openl.generated.beans.TableHeader',
                              'id': 'DepAgeLimitFactor',
                              'label': 'Dep Age Limit',
                              'renderCell': {
                                '@class': 'org.openl.generated.beans.RenderCell',
                                'name': 'Float',
                                'decimals': 3
                              }
                            },
                            {
                              '@class': 'org.openl.generated.beans.TableHeader',
                              'id': 'ExclusionsFactor',
                              'label': 'Exclusions',
                              'renderCell': {
                                '@class': 'org.openl.generated.beans.RenderCell',
                                'name': 'Float',
                                'decimals': 3
                              }
                            },
                            {
                              '@class': 'org.openl.generated.beans.TableHeader',
                              'id': 'ClaimCostWithAddCov',
                              'label': 'Claim Cost',
                              'renderCell': {
                                '@class': 'org.openl.generated.beans.RenderCell',
                                'name': 'Currency',
                                'decimals': 2
                              }
                            },
                            {
                              '@class': 'org.openl.generated.beans.TableHeader',
                              'id': 'TierElementRate',
                              'label': 'Manual Rate',
                              'renderCell': {
                                '@class': 'org.openl.generated.beans.RenderCell',
                                'name': 'Currency',
                                'decimals': 2
                              }
                            }
                          ],
                          'renderItem': {
                            '@class': 'org.openl.generated.beans.Table',
                            'view': 'Table',
                            'name': 'ServiceTypeDetailsCalc',
                            'headers': [
                              {
                                '@class': 'org.openl.generated.beans.TableHeader',
                                'id': 'ServiceType',
                                'label': 'Service Type',
                                'styleHeader': {
                                  'width': '100px'
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableHeader',
                                'id': 'EmployeeAgeFactor',
                                'label': 'Employee Age',
                                'styleHeader': {
                                  'width': '70px'
                                },
                                'renderCell': {
                                  '@class': 'org.openl.generated.beans.RenderCell',
                                  'name': 'Float',
                                  'decimals': 3
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableHeader',
                                'id': 'AreaFactor',
                                'label': 'Area',
                                'styleHeader': {
                                  'width': '70px'
                                },
                                'renderCell': {
                                  '@class': 'org.openl.generated.beans.RenderCell',
                                  'name': 'Float',
                                  'decimals': 3
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableHeader',
                                'id': 'UtilizationFactor',
                                'label': 'Utilization',
                                'styleHeader': {
                                  'width': '70px'
                                },
                                'renderCell': {
                                  '@class': 'org.openl.generated.beans.RenderCell',
                                  'name': 'Float',
                                  'decimals': 3
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableHeader',
                                'id': 'SpouseFactor',
                                'label': 'Spouse',
                                'styleHeader': {
                                  'width': '80px'
                                },
                                'renderCell': {
                                  '@class': 'org.openl.generated.beans.RenderCell',
                                  'name': 'Float',
                                  'decimals': 3
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableHeader',
                                'id': 'UtilizationAdjustment',
                                'label': 'Utilization',
                                'styleHeader': {
                                  'width': '70px'
                                },
                                'renderCell': {
                                  '@class': 'org.openl.generated.beans.RenderCell',
                                  'name': 'Float',
                                  'decimals': 3
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableHeader',
                                'id': 'WaitingPeriodFactor',
                                'label': 'Waiting Period',
                                'styleHeader': {
                                  'width': '80px'
                                },
                                'renderCell': {
                                  '@class': 'org.openl.generated.beans.RenderCell',
                                  'name': 'Float',
                                  'decimals': 3
                                }
                              },
                              {
                                '@class': 'org.openl.generated.beans.TableHeader',
                                'id': 'ClaimCost',
                                'label': 'Claim Cost',
                                'styleHeader': {
                                  'width': '80px'
                                },
                                'renderCell': {
                                  '@class': 'org.openl.generated.beans.RenderCell',
                                  'name': 'Currency',
                                  'decimals': 2
                                }
                              }
                            ],
                            'itemsExpanded': true,
                            'showIf': {}
                          },
                          'itemsExpanded': true,
                          'showIf': {}
                        },
                        'itemsExpanded': true,
                        'showIf': {}
                      }
                    ],
                    'version': 'CostSummaryBlock'
                  }
                ],
                'version': 'GeneralSummaryBlock'
              }
            },
            {
              'view': 'Tab',
              'tab': 'Policy Factors',
              'content': {
                '@class': 'org.openl.generated.beans.Layout',
                'view': 'VerticalLayout',
                'styles': 'padding-largest margin-v radius bg-white',
                'items': [
                  {
                    '@class': 'org.openl.generated.beans.Title',
                    'view': 'Title',
                    'label': 'Policy Factors',
                    'styles': 'padding'
                  },
                  {
                    '@class': 'org.openl.generated.beans.Layout',
                    'view': 'HorizontalLayout',
                    'styles': 'align-left',
                    'items': [
                      {
                        '@class': 'org.openl.generated.beans.Layout',
                        'view': 'VerticalLayout',
                        'styles': 'padding-largest margin-v align-center',
                        'items': [
                          {
                            '@class': 'org.openl.generated.beans.Text',
                            'view': 'Text',
                            'renderLabel': {
                              '@class': 'org.openl.generated.beans.RenderLabel',
                              'name': 'Float',
                              'decimals': 3
                            },
                            'children': {
                              'name': 'PolicyFactors.IndustryFactor',
                              'relativeData': null
                            },
                            'styles': 'h4'
                          },
                          {
                            '@class': 'org.openl.generated.beans.Text',
                            'view': 'Text',
                            'label': 'Industry'
                          }
                        ],
                        'version': 'FactorPolicyRowIndustry'
                      },
                      {
                        '@class': 'org.openl.generated.beans.Layout',
                        'view': 'VerticalLayout',
                        'styles': 'padding-largest margin-v align-center',
                        'items': [
                          {
                            '@class': 'org.openl.generated.beans.Text',
                            'view': 'Text',
                            'renderLabel': {
                              '@class': 'org.openl.generated.beans.RenderLabel',
                              'name': 'Float',
                              'decimals': 3
                            },
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
                        'version': 'FactorPolicyRowRateGuarantee'
                      },
                      {
                        '@class': 'org.openl.generated.beans.Layout',
                        'view': 'VerticalLayout',
                        'styles': 'padding-largest margin-v align-center',
                        'items': [
                          {
                            '@class': 'org.openl.generated.beans.Text',
                            'view': 'Text',
                            'renderLabel': {
                              '@class': 'org.openl.generated.beans.RenderLabel',
                              'name': 'Float',
                              'decimals': 3
                            },
                            'children': {
                              'name': 'PolicyFactors.StateFactor',
                              'relativeData': null
                            },
                            'styles': 'h4'
                          },
                          {
                            '@class': 'org.openl.generated.beans.Text',
                            'view': 'Text',
                            'label': 'State'
                          }
                        ],
                        'version': 'FactorPolicyRowState'
                      }
                    ],
                    'version': 'FactorsPolicyRow',
                    'style': {
                      'minWidth': '0.45'
                    }
                  }
                ],
                'version': 'FactorPolicy',
                'style': {
                  'maxWidth': '0.48'
                }
              }
            }
          ],
          'buttoned': true,
          'childrenBeforeTabs': {
            'view': 'HorizontalLayout',
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
                'mapOptions': 'PlanName',
                'compact': true
              }
            ],
            'version': 'PlanList'
          },
          'classNameTabs': 'padding-largest bg-neutral radius-bottom',
          'styleTabs': {
            'overflow': 'visible'
          },
          'classNameContent': 'margin-v-small'
        }
      ],
      'version': 'MainLayoutTabBlock'
    }
  ],
  'version': '0.20.1'
}