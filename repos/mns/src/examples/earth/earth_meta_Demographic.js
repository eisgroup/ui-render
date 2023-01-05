export default {
  view: 'Col',
  className: 'card-glass margin-auto margin-v-small',
  'showIf': {
    'relativeData': false,
    'name': 'response.ratingDetails'
  },
  items: [
    {
      'view': 'VerticalLayout',
      className: 'radius padding padding-h-largest bg-neutral',
      'items': [
        // Plan Dropdown
        {
          'view': 'HorizontalLayout',
          'className': 'left middle',
          'relativeData': false,
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
              'options': {
                'name': 'response.ratingDetails.plans'
              },
              'mapOptions': 'plan',
              'compact': true
            },
            {
              'view': 'Space'
            }
          ],
          'version': 'PlanListLayout'
        },
        // Table with Title
        {
          'view': 'VerticalLayout',
          'className': 'margin-v',
          'relativeData': false,
          'items': [
            {
              'view': 'Text',
              'label': 'Demographic Summary',
              'className': 'h6 padding-v-small',
            },
            {
              view: 'Col',
              className: 'left',
              items: [
                {
                  'view': 'Table',
                  className: 'striped',
                  'headers': [
                    {
                      'id': 'Description',
                      'label': 'Description',
                      className: 'margin-left-smallest margin-right',
                      classNameCell: 'margin-left-smallest margin-right',
                    },
                    {
                      'id': 'Total',
                      'label': 'Total',
                      className: 'margin-h',
                      classNameCell: 'margin-h',
                    }
                  ],
                  'extraItems': [
                    {
                      'Description': '% of Whole Group - Lives',
                      'Total': {
                        '@class': 'org.openl.generated.beans.Text',
                        'view': 'Text',
                        'renderLabel': {
                          '@class': 'org.openl.generated.beans.RenderLabel',
                          'name': 'Percent',
                          'decimals': 2
                        },
                        'children': {
                          'name': 'response.ratingDetails.plans[{state.plan,0}].demograficInfo.livesPercent'
                        }
                      }
                    },
                    {
                      '@class': 'org.openl.generated.beans.TableRowsItems1',
                      'Description': '% of Whole Group - Volume',
                      'Total': {
                        '@class': 'org.openl.generated.beans.Text',
                        'view': 'Text',
                        'renderLabel': {
                          '@class': 'org.openl.generated.beans.RenderLabel',
                          'name': 'Percent',
                          'decimals': 2
                        },
                        'children': {
                          'name': 'response.ratingDetails.plans[{state.plan,0}].demograficInfo.volumePercent'
                        }
                      }
                    },
                    {
                      '@class': 'org.openl.generated.beans.TableRowsItems1',
                      'Description': 'Total Age',
                      'Total': {
                        '@class': 'org.openl.generated.beans.Text',
                        'view': 'Text',
                        'children': {
                          'name': 'response.ratingDetails.plans[{state.plan,0}].demograficInfo.totalAge'
                        }
                      }
                    },
                    {
                      '@class': 'org.openl.generated.beans.TableRowsItems1',
                      'Description': 'Average Age',
                      'Total': {
                        '@class': 'org.openl.generated.beans.Text',
                        'view': 'Text',
                        'children': {
                          'name': 'response.ratingDetails.plans[{state.plan,0}].demograficInfo.personAverageAge'
                        }
                      }
                    },
                    {
                      '@class': 'org.openl.generated.beans.TableRowsItems1',
                      'Description': 'Females Lives',
                      'Total': {
                        '@class': 'org.openl.generated.beans.Text',
                        'view': 'Text',
                        'children': {
                          'name': 'response.ratingDetails.plans[{state.plan,0}].demograficInfo.femaleLives'
                        }
                      }
                    },
                    {
                      '@class': 'org.openl.generated.beans.TableRowsItems1',
                      'Description': 'Male Lives',
                      'Total': {
                        '@class': 'org.openl.generated.beans.Text',
                        'view': 'Text',
                        'children': {
                          'name': 'response.ratingDetails.plans[{state.plan,0}].demograficInfo.maleLives'
                        }
                      }
                    },
                    {
                      '@class': 'org.openl.generated.beans.TableRowsItems1',
                      'Description': '% Female',
                      'Total': {
                        '@class': 'org.openl.generated.beans.Text',
                        'view': 'Text',
                        'renderLabel': {
                          '@class': 'org.openl.generated.beans.RenderLabel',
                          'name': 'Percent',
                          'decimals': 2
                        },
                        'children': {
                          'name': 'response.ratingDetails.plans[{state.plan,0}].demograficInfo.percentFemale'
                        }
                      }
                    },
                    {
                      '@class': 'org.openl.generated.beans.TableRowsItems1',
                      'Description': 'Average Salary',
                      'Total': {
                        '@class': 'org.openl.generated.beans.Text',
                        'view': 'Text',
                        'renderLabel': {
                          '@class': 'org.openl.generated.beans.RenderLabel',
                          'name': 'Currency'
                        },
                        'children': {
                          'name': 'response.ratingDetails.plans[{state.plan,0}].demograficInfo.averageAnnualSalary'
                        }
                      }
                    },
                    {
                      '@class': 'org.openl.generated.beans.TableRowsItems1',
                      'Description': 'Average Volume',
                      'Total': {
                        '@class': 'org.openl.generated.beans.Text',
                        'view': 'Text',
                        'renderLabel': {
                          '@class': 'org.openl.generated.beans.RenderLabel',
                          'name': 'Currency'
                        },
                        'children': {
                          'name': 'response.ratingDetails.plans[{state.plan,0}].demograficInfo.averagePlanAmount'
                        }
                      }
                    },
                    {
                      '@class': 'org.openl.generated.beans.TableRowsItems1',
                      'Description': 'Average Claim Cost',
                      'Total': {
                        '@class': 'org.openl.generated.beans.Text',
                        'view': 'Text',
                        'renderLabel': {
                          '@class': 'org.openl.generated.beans.RenderLabel',
                          'name': 'Currency'
                        },
                        'children': {
                          'name': 'response.ratingDetails.plans[{state.plan,0}].demograficInfo.averageMonthlyClaimCost'
                        }
                      }
                    }
                  ]
                },
              ],
            },
          ],
        },
        // TList
        {
          'view': 'List',
          'name': 'response.ratingDetails.plans[{state.plan,0}].coveragesDetails',
          className: 'margin-v',
          styleContent: {
            paddingTop: 19,
          },
          fill: true,
          renderItem: {
            view: 'Col',
            className: 'margin-v',
            items: [
              {
                'view': 'Text',
                'children': {
                  'name': 'caverageName'
                },
                'className': 'h6'
              },
              {
                'view': 'HorizontalLayout',
                'className': 'top',
                'relativeData': false,
                'items': [
                  // Tables
                  {
                    view: 'Row',
                    items: [
                      {
                        'view': 'Table',
                        'headers': [
                          {
                            'id': 'Description',
                            'label': 'Description',
                            className: 'margin-left-smallest margin-right',
                            classNameCell: 'margin-left-smallest margin-right',
                          },
                          {
                            'id': 'Total',
                            'label': 'Total',
                            className: 'margin-h',
                            classNameCell: 'margin-h',
                          }
                        ],
                        'extraItems': [
                          {
                            'Description': '% of Whole Group - Lives',
                            'Total': {
                              '@class': 'org.openl.generated.beans.Text',
                              'view': 'Text',
                              'renderLabel': {
                                '@class': 'org.openl.generated.beans.RenderLabel',
                                'name': 'Percent',
                                'decimals': 2
                              },
                              'children': {
                                'name': 'demograficInfo.livesPercent'
                              }
                            }
                          },
                          {
                            'Description': '% of Whole Group - Volume',
                            'Total': {
                              '@class': 'org.openl.generated.beans.Text',
                              'view': 'Text',
                              'renderLabel': {
                                '@class': 'org.openl.generated.beans.RenderLabel',
                                'name': 'Percent',
                                'decimals': 2
                              },
                              'children': {
                                'name': 'demograficInfo.volumePercent'
                              }
                            }
                          },
                          {
                            '@class': 'org.openl.generated.beans.TableRowsItems1',
                            'Description': 'Total Age',
                            'Total': {
                              '@class': 'org.openl.generated.beans.Text',
                              'view': 'Text',
                              'children': {
                                'name': 'demograficInfo.totalAge'
                              }
                            }
                          },
                          {
                            '@class': 'org.openl.generated.beans.TableRowsItems1',
                            'Description': 'Average Age',
                            'Total': {
                              '@class': 'org.openl.generated.beans.Text',
                              'view': 'Text',
                              'children': {
                                'name': 'demograficInfo.personAverageAge'
                              }
                            }
                          },
                          {
                            '@class': 'org.openl.generated.beans.TableRowsItems1',
                            'Description': 'Females Lives',
                            'Total': {
                              '@class': 'org.openl.generated.beans.Text',
                              'view': 'Text',
                              'children': {
                                'name': 'demograficInfo.femaleLives'
                              }
                            }
                          },
                          {
                            '@class': 'org.openl.generated.beans.TableRowsItems1',
                            'Description': 'Male Lives',
                            'Total': {
                              '@class': 'org.openl.generated.beans.Text',
                              'view': 'Text',
                              'children': {
                                'name': 'demograficInfo.maleLives'
                              }
                            }
                          },
                          {
                            '@class': 'org.openl.generated.beans.TableRowsItems1',
                            'Description': '% Female',
                            'Total': {
                              '@class': 'org.openl.generated.beans.Text',
                              'view': 'Text',
                              'renderLabel': {
                                '@class': 'org.openl.generated.beans.RenderLabel',
                                'name': 'Percent',
                                'decimals': 2
                              },
                              'children': {
                                'name': 'demograficInfo.percentFemale'
                              }
                            }
                          },
                          {
                            '@class': 'org.openl.generated.beans.TableRowsItems1',
                            'Description': 'Average Salary',
                            'Total': {
                              '@class': 'org.openl.generated.beans.Text',
                              'view': 'Text',
                              'renderLabel': {
                                '@class': 'org.openl.generated.beans.RenderLabel',
                                'name': 'Currency'
                              },
                              'children': {
                                'name': 'demograficInfo.averageAnnualSalary'
                              }
                            }
                          },
                          {
                            '@class': 'org.openl.generated.beans.TableRowsItems1',
                            'Description': 'Average Volume',
                            'Total': {
                              '@class': 'org.openl.generated.beans.Text',
                              'view': 'Text',
                              'renderLabel': {
                                '@class': 'org.openl.generated.beans.RenderLabel',
                                'name': 'Currency'
                              },
                              'children': {
                                'name': 'demograficInfo.averagePlanAmount'
                              }
                            }
                          },
                          {
                            '@class': 'org.openl.generated.beans.TableRowsItems1',
                            'Description': 'Average Claim Cost',
                            'Total': {
                              '@class': 'org.openl.generated.beans.Text',
                              'view': 'Text',
                              'renderLabel': {
                                '@class': 'org.openl.generated.beans.RenderLabel',
                                'name': 'Currency'
                              },
                              'children': {
                                'name': 'demograficInfo.averageMonthlyClaimCost'
                              }
                            }
                          }
                        ]
                      },
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
                            'id': 'demograficInfo.livesPercent',
                            'label': '_',
                            'classNameHeader': 'invisible',
                            'classNameCellWrap': 'border-left',
                            'renderCell': {
                              '@class': 'org.openl.generated.beans.RenderCell',
                              'name': 'Percent',
                              'decimals': 2
                            }
                          },
                          {
                            'id': 'demograficInfo.volumePercent',
                            'label': '_',
                            'classNameHeader': 'invisible',
                            'classNameCellWrap': 'border-left',
                            'renderCell': {
                              '@class': 'org.openl.generated.beans.RenderCell',
                              'name': 'Percent',
                              'decimals': 2
                            }
                          },
                          {
                            'id': 'demograficInfo.totalAge',
                            'label': '_',
                            'classNameHeader': 'invisible',
                            'classNameCellWrap': 'border-left'
                          },
                          {
                            'id': 'demograficInfo.personAverageAge',
                            'label': '_',
                            'classNameHeader': 'invisible',
                            'classNameCellWrap': 'border-left'
                          },
                          {
                            'id': 'demograficInfo.femaleLives',
                            'label': '_',
                            'classNameHeader': 'invisible',
                            'classNameCellWrap': 'border-left'
                          },
                          {
                            'id': 'demograficInfo.maleLives',
                            'label': '_',
                            'classNameHeader': 'invisible',
                            'classNameCellWrap': 'border-left'
                          },
                          {
                            'id': 'demograficInfo.percentFemale',
                            'label': '_',
                            'classNameHeader': 'invisible',
                            'classNameCellWrap': 'border-left',
                            'renderCell': {
                              '@class': 'org.openl.generated.beans.RenderCell',
                              'name': 'Percent',
                              'decimals': 2
                            }
                          },
                          {
                            'id': 'demograficInfo.averageAnnualSalary',
                            'label': '_',
                            'classNameHeader': 'invisible',
                            'classNameCellWrap': 'border-left',
                            'renderCell': {
                              '@class': 'org.openl.generated.beans.RenderCell',
                              'name': 'Currency'
                            }
                          },
                          {
                            'id': 'demograficInfo.averagePlanAmount',
                            'label': '_',
                            'classNameHeader': 'invisible',
                            'classNameCellWrap': 'border-left',
                            'renderCell': {
                              '@class': 'org.openl.generated.beans.RenderCell',
                              'name': 'Currency'
                            }
                          },
                          {
                            'id': 'demograficInfo.averageMonthlyClaimCost',
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
                    ]
                  },
                  // Pie Chart
                  {
                    'view': 'Col',
                    'className': 'fill padding-h-largest padding-top-small',
                    'relativeData': false,
                    'items': [
                      {
                        'view': 'Text',
                        'label': 'Number Of Lives By Age Bands',
                        className: 'bold',
                        style: {marginBottom: -35},
                      },
                      {
                        'view': 'PieChart',
                        'name': 'demographicLivesByAgeBands.livesByAgeBands',
                        'mapItems': {
                          'label': 'ageBand',
                          'value': 'numberOfLives'
                        },
                        'legends': {
                          'bottom': true,
                          // 'background': false,
                          'columns': 5
                        },
                        'relativeData': true
                      }
                    ],
                    'version': 'CoverageDemographicPieChartLayout'
                  },
                ],
                'version': 'CoverageDetailsLayout'
              },
            ],
          },
          'relativeData': true
        }

      ],
    }
  ]
}
