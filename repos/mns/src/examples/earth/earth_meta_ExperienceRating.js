export default {
  'view': 'VerticalLayout',
  'className': '',
  'items': [{
    'view': 'Row',
    'className': 'card-glass margin wrap',
    'showIf': {
      'name': 'request.experienceData.experienceResults'
    },
    'items': [{
      'view': 'VerticalLayout',
      'className': 'fill radius bg-neutral padding-larger',
      'items': [{
        'view': 'Title',
        'label': 'Experience Rating Results',
        'className': 'padding-v-smaller'
      }, {
        'view': 'HorizontalLayout',
        'items': [{
          '@class': 'org.openl.generated.beans.Dropdown',
          'view': 'Dropdown',
          'name': 'planResult',
          'options': {
            'name': 'request.experienceData.experienceResults',
            'relativeData': false
          },
          'mapOptions': 'planName',
          'compact': true
        }
        ]
      }, {
        'view': 'Table',
        'name': 'request.experienceData.experienceResults.{state.planResult,0}.coverages.0.experienceRatesPerAgeBand',
        'className': 'striped margin-top no-border',
        'headers': [
          {
            'id': 'ageBandName',
            'label': 'AgeBand'
          }, {
            'id': 'formulaRate',
            'label': 'Rate'
          }, {
            'id': 'experienceAdjustmentPercent',
            'label': '% Change',
            'renderCell': {
              '@class': 'org.openl.generated.beans.RenderCell',
              'name': 'Percent'
            }
          }
        ]
      }
      ]
    }, {
      'view': 'Space'
    }, {
      'view': 'Col',
      'className': 'fill radius bg-neutral padding-larger',
      'items': [{
        'view': 'Title',
        'label': 'Experience Rate Caclulation Details',
        'className': 'padding-v-smaller'
      }, {
        'view': 'Table',
        'name': 'request.experienceData.experienceResults.{state.planResult,0}.coverages.0.experienceDetailsPerPeriod',
        'className': 'margin-top no-border',
        'headers': [
          {
            'id': 'periodName',
            'label': 'Period',
            classNameCell: 'bg-grey-lightest',
          }, {
            'id': 'startDate',
            'label': 'Start Date'
          }, {
            'id': 'endDate',
            'label': 'End Date'
          }, {
            'id': 'numberOfMonth',
            'label': '# of Month'
          }, {
            'id': 'coveredLives',
            'label': 'Covered Lives'
          }, {
            'id': 'billedPremium',
            'label': 'Billed Premium',
            'renderCell': {
              '@class': 'org.openl.generated.beans.RenderCell',
              'name': 'Currency'
            }
          }, {
            'id': 'incurredClaims',
            'label': 'Incurred Claims',
            'renderCell': {
              '@class': 'org.openl.generated.beans.RenderCell',
              'name': 'Currency'
            }
          }, {
            'id': 'paidClaims',
            'label': 'Paid Claims',
            'renderCell': {
              '@class': 'org.openl.generated.beans.RenderCell',
              'name': 'Currency'
            }
          }, {
            'id': 'fullyIncurredClaims',
            'label': 'Fully Incurred Claims',
            'renderCell': {
              '@class': 'org.openl.generated.beans.RenderCell',
              'name': 'Currency'
            }
          }, {
            'id': 'paidLossRatio',
            'label': 'Paid Loss Ratio',
            'renderCell': {
              '@class': 'org.openl.generated.beans.RenderCell',
              'name': 'Float',
              'decimals': 2
            }
          }, {
            'id': 'incurredLossRatio',
            'label': 'Incurred Paid Loss Ratio',
            'renderCell': {
              '@class': 'org.openl.generated.beans.RenderCell',
              'name': 'Float',
              'decimals': 2
            }
          }, {
            'id': 'trendedIncurredLossRatio',
            'label': 'Trended Inc. Loss Ratio',
            'renderCell': {
              '@class': 'org.openl.generated.beans.RenderCell',
              'name': 'Float',
              'decimals': 2
            }
          }, {
            'id': 'targetLossRatio',
            'label': 'Target Inc. Loss Ratio',
            'renderCell': {
              '@class': 'org.openl.generated.beans.RenderCell',
              'name': 'Float',
              'decimals': 2
            }
          }, {
            'id': 'trendedIncClaims',
            'label': 'Trended Inc. Claims',
            'renderCell': {
              '@class': 'org.openl.generated.beans.RenderCell',
              'name': 'Currency'
            }
          }, {
            'id': 'trendFactor',
            'label': 'Trend Factor',
            'renderCell': {
              '@class': 'org.openl.generated.beans.RenderCell',
              'name': 'Float',
              'decimals': 2
            }
          }, {
            'id': 'experienceModificationFactor',
            'label': 'Experience Modification Factor',
            'renderCell': {
              '@class': 'org.openl.generated.beans.RenderCell',
              'name': 'Float',
              'decimals': 2
            }
          }
        ],
        'vertical': true
      }
      ]
    }
    ]
  }, {
    'view': 'Row',
    'className': 'card-glass margin',
    'items': [{
      '@class': 'org.openl.generated.beans.Layout',
      'view': 'VerticalLayout',
      'className': 'fill bg-neutral padding-larger radius',
      'items': [{
        '@class': 'org.openl.generated.beans.Title',
        'view': 'Title',
        'label': 'Experience Rating',
        'className': 'padding-v-smaller'
      }, {
        '@class': 'org.openl.generated.beans.Row',
        'view': 'Row',
        'items': [{
          '@class': 'org.openl.generated.beans.Input',
          'view': 'Input',
          'name': 'request.experienceData.showExperienceRating',
          'label': ' ',
          'type': 'toggle',
          'disabled': false
        }, {
          '@class': 'org.openl.generated.beans.Text',
          'view': 'Text',
          'label': 'Experience Rating',
          'children': {
            'name': 'Experience Rating'
          },
          'className': 'padding-left'
        }
        ],
        'className': 'middle'
      }, {
        '@class': 'org.openl.generated.beans.Layout',
        'view': 'HorizontalLayout',
        'className': 'wrap margin-top',
        'items': [{
          '@class': 'org.openl.generated.beans.Dropdown',
          'view': 'Dropdown',
          'name': 'periodBasis',
          'options': {
            'name': 'request.experienceData.periodBasis'
          },
          'mapOptions': 'periodBasisType',
          'className': 'margin-right',
          'disabled': false,
          'compact': true
        }, {
          '@class': 'org.openl.generated.beans.Button',
          'view': 'Button',
          'className': 'margin-right',
          'items': [{
            '@class': 'org.openl.generated.beans.Icon',
            'view': 'Icon',
            'name': 'file-download',
            'className': 'margin-right-smaller'
          }, {
            '@class': 'org.openl.generated.beans.Text',
            'view': 'Text',
            'label': 'Download File Template'
          }
          ],
          'onClick': {
            'name': 'download',
            'args': ['https://dxp-gateway-nightly.genci0.eisgroup.com/backoffice-rating-dn-master/v1/files/historical-data-template.csv']
          }
        }, {
          '@class': 'org.openl.generated.beans.File',
          'view': 'Input',
          'name': 'path.to.file',
          'type': 'file',
          'title': 'Upload CSV File',
          'className': 'button margin-right',
          'classWrap': 'left',
          'formats': ['csv'],
          'multiple': false,
          'maxSize': 16777216,
          'autoSubmit': true,
          'showTypes': false,
          'items': [{
            '@class': 'org.openl.generated.beans.Icon',
            'view': 'Icon',
            'name': 'file-upload',
            'className': 'margin-right-smaller'
          }, {
            '@class': 'org.openl.generated.beans.Text',
            'view': 'Text',
            'label': 'Upload File'
          }
          ],
          'disabled': false
        }
        ]
      }
      ]
    }
    ]
  }, {
    'view': 'VerticalLayout',
    'showIf': {
      'relativeData': false,
      'name': 'request.experienceData.showExperienceRating',
      'equal': true
    },
    'items': [{
      'view': 'Row',
      'className': 'card-glass margin',
      'items': [{
        'view': 'VerticalLayout',
        'className': 'fill radius bg-neutral padding-larger',
        'items': [{
          '@class': 'org.openl.generated.beans.Title',
          'view': 'Title',
          'label': 'Experience Periods',
          'className': 'padding-v-smaller'
        }, {
          '@class': 'org.openl.generated.beans.Layout',
          'view': 'HorizontalLayout',
          'className': 'wrap margin-bottom-smaller',
          'items': [
            {
              '@class': 'org.openl.generated.beans.Input',
              'view': 'Input',
              'name': 'request.experienceData.credibility',
              'label': 'Credibility',
              'type': 'number',
              'disabled': false,
              'className': 'margin-right-larger',
              'placeholder': 'Enter the value'
            }, {
              '@class': 'org.openl.generated.beans.Input',
              'view': 'Input',
              'name': 'request.experienceData.trendAssumption',
              'label': 'Trend Assumption',
              'type': 'text',
              'disabled': false,
              'placeholder': 'Enter the value'
            }
          ]
        }, {
          '@class': 'org.openl.generated.beans.Table',
          'view': 'Table',
          'name': 'request.experienceData.dataKind.experiencePeriods',
          'className': 'margin-v no-border',
          'headers': [{
            'id': 'periodName',
            'label': 'Period',
            'classNameHeader': 'padding-left-small border-right'
          }, {
            'id': 'startDate',
            'label': 'Period Start',
            'classNameHeader': 'padding-left-small'
          }, {
            'id': 'endDate',
            'label': 'Period End',
            'classNameHeader': 'padding-left-small'
          }, {
            'id': 'weight',
            'label': 'Weight',
            'classNameHeader': 'padding-left-small'
          }, {
            'id': 'numberOfMonths',
            'label': '# of Month',
            'classNameHeader': 'padding-left-small'
          }, {
            'id': 'null',
            'classNameHeader': 'align-center'
          }
          ],
          'renderItemCells': {
            '@class': 'org.openl.generated.beans.RenderItemCells',
            'view': 'Data',
            'kind': 'experiencePeriods',
            'embedded': true,
            'meta': {
              'view': 'TableCells',
              'style': {
                'verticalAlign': 'top'
              },
              'className': 'no-border-right-last-item',
              'items': [{
                '@class': 'org.openl.generated.beans.Input',
                'view': 'Input',
                'name': 'periodName',
                'type': 'text',
                'disabled': false,
                'className': 'border-on-hover border-right',
                'validate': 'required'
              }, {
                '@class': 'org.openl.generated.beans.Input',
                'view': 'Input',
                'name': 'startDate',
                'type': 'date',
                'format': 'date',
                'disabled': false,
                'className': 'border-on-hover',
                'validate': 'required',
                'verify': {
                  'dataKind': 'experiencePeriods',
                  'validate': [{
                    'name': 'notWithinRange',
                    'args': ['startDate', 'endDate']
                  }
                  ]
                }
              }, {
                '@class': 'org.openl.generated.beans.Input',
                'view': 'Input',
                'name': 'endDate',
                'type': 'date',
                'format': 'date',
                'disabled': false,
                'className': 'border-on-hover',
                'validate': 'required',
                'verify': {
                  'dataKind': 'experiencePeriods',
                  'validate': [{
                    'name': 'notWithinRange',
                    'args': ['startDate', 'endDate']
                  }
                  ]
                }
              }, {
                '@class': 'org.openl.generated.beans.Input',
                'view': 'Input',
                'name': 'weight',
                'type': 'number',
                'disabled': false,
                'className': 'border-on-hover',
                'validate': 'required'
              }, {
                '@class': 'org.openl.generated.beans.Input',
                'view': 'Input',
                'name': 'numberOfMonths',
                'type': 'number',
                'disabled': true,
                'className': 'border-on-hover',
                'validate': 'required'
              }, {
                '@class': 'org.openl.generated.beans.Layout',
                'view': 'VerticalLayout',
                'items': [{
                  '@class': 'org.openl.generated.beans.Button',
                  'view': 'Button',
                  'className': 'a transparent',
                  'items': [{
                    '@class': 'org.openl.generated.beans.Icon',
                    'view': 'Icon',
                    'name': 'trash'
                  }
                  ],
                  'onClick': {
                    'name': 'removeData'
                  },
                  'disabled': false
                }
                ]
              }
              ]
            }
          },
          'renderExtraItem': {
            '@class': 'org.openl.generated.beans.RenderExtraItem',
            'view': 'Data',
            'kind': 'experiencePeriods',
            'embedded': true,
            'meta': {
              'view': 'TableCells',
              'style': {
                'verticalAlign': 'top'
              },
              'className': 'fade--quarter',
              'items': [{
                '@class': 'org.openl.generated.beans.Input',
                'view': 'Input',
                'name': 'periodName',
                'label': 'Period',
                'type': 'text',
                'disabled': false,
                'validate': 'required'
              }, {
                '@class': 'org.openl.generated.beans.Input',
                'view': 'Input',
                'name': 'startDate',
                'label': 'Period Start',
                'type': 'date',
                'format': 'date',
                'disabled': false,
                'validate': 'required',
                'verify': {
                  'dataKind': 'experiencePeriods',
                  'validate': [{
                    'name': 'notWithinRange',
                    'args': ['startDate', 'endDate']
                  }
                  ]
                }
              }, {
                '@class': 'org.openl.generated.beans.Input',
                'view': 'Input',
                'name': 'endDate',
                'label': 'Period End',
                'type': 'date',
                'format': 'date',
                'disabled': false,
                'validate': 'required',
                'verify': {
                  'dataKind': 'experiencePeriods',
                  'validate': [{
                    'name': 'notWithinRange',
                    'args': ['startDate', 'endDate']
                  }
                  ]
                }
              }, {
                '@class': 'org.openl.generated.beans.Input',
                'view': 'Input',
                'name': 'weight',
                'label': 'Weight',
                'type': 'number',
                'disabled': false,
                'validate': 'required'
              }, {
                '@class': 'org.openl.generated.beans.Input',
                'view': 'Input',
                'name': 'numberOfMonths',
                'label': '# of Month',
                'type': 'number',
                'disabled': true
              }, {
                '@class': 'org.openl.generated.beans.Layout',
                'view': 'VerticalLayout',
                'items': [{
                  '@class': 'org.openl.generated.beans.Button',
                  'view': 'Button',
                  'className': 'a transparent',
                  'style': {
                    'marginTop': 35
                  },
                  'onClick': {
                    'name': 'addData'
                  },
                  'children': 'Add',
                  'disabled': false
                }
                ]
              }
              ]
            },
            'initialValues': {}
          }
        }
        ]
      }
      ]
    }, {
      'view': 'Row',
      'className': 'card-glass margin',
      'items': [{
        'view': 'VerticalLayout',
        'className': 'fill radius bg-neutral padding-larger',
        'items': [{
          '@class': 'org.openl.generated.beans.Title',
          'view': 'Title',
          'label': 'Charged Rates',
          'className': 'padding-v-smaller'
        }, {
          '@class': 'org.openl.generated.beans.Layout',
          'view': 'HorizontalLayout',
          'className': 'left margin-v-smaller',
          'items': [{
            '@class': 'org.openl.generated.beans.Dropdown',
            'view': 'Dropdown',
            'name': 'plan',
            'options': {
              'name': 'request.experienceData.ratesAndHistoricalInfo',
              'relativeData': false
            },
            'mapOptions': 'planName',
            'compact': true
          }
          ]
        }
        ]
      }
      ]
    }, {
      'view': 'RowList',
      'name': 'request.experienceData.ratesAndHistoricalInfo.{state.plan,0}.rates',
      'className': 'wrap spread',
      'renderItem': {
        'view': 'VerticalLayout',
        'className': 'card-glass card-glass--inner-bg-neutral margin-v-largest margin-h',
        'items': [{
          'view': 'Col',
          'items': [{
            'view': 'Text',
            'children': {
              'name': 'ageBandName'
            },
            'className': 'h6 no-margin padding-h-large padding-v-small'
          }, {
            'view': 'Table',
            'name': 'ageBandRates',
            'className': 'no-border no-radius-top',
            'headers': [{
              'id': 'periodName',
              'label': 'Period',
              'classNameHeader': 'padding-h-small text-align-left border-right',
              'classNameCellWrap': 'padding-smaller border-right'
            }, {
              'id': 'rateValue',
              'label': 'Rate',
              'classNameHeader': 'padding-h-small text-align-left',
              'renderCell': {
                '@class': 'org.openl.generated.beans.Input',
                'view': 'Input',
                'name': 'rateValue',
                'type': 'number',
                'format': 'currency',
                'disabled': false,
                'className': 'border-on-hover',
                'validate': 'required',
                'icon': {
                  '@class': 'org.openl.generated.beans.Text',
                  'view': 'Text',
                  'label': '$',
                  'className': 'icon'
                },
                'lefty': true
              }
            }
            ]
          }
          ]
        }
        ]
      }
    }, {
      'view': 'Row',
      'className': 'card-glass margin',
      'items': [{
        'view': 'VerticalLayout',
        'className': 'fill radius bg-neutral padding-larger',
        'items': [{
          '@class': 'org.openl.generated.beans.Title',
          'view': 'Title',
          'label': 'Historical Information',
          'className': 'padding-v-smaller'
        }, {
          '@class': 'org.openl.generated.beans.Table',
          'view': 'Table',
          'name': 'request.experienceData.ratesAndHistoricalInfo.{state.plan,0}.historicalInformation',
          'className': 'margin-v no-border',
          'headers': [{
            'id': 'periodName',
            'label': 'Period',
            'classNameHeader': 'padding-h-small text-align-left border-right',
            'classNameCellWrap': 'padding-smaller border-right'
          }, {
            'id': 'billedPremium',
            'label': 'BilledPremium',
            'classNameHeader': 'padding-h-small text-align-left',
            'renderCell': {
              '@class': 'org.openl.generated.beans.Input',
              'view': 'Input',
              'name': 'billedPremium',
              'type': 'number',
              'format': 'currency',
              'disabled': false,
              'className': 'border-on-hover',
              'validate': 'required',
              'icon': {
                '@class': 'org.openl.generated.beans.Text',
                'view': 'Text',
                'label': '$',
                'className': 'icon'
              },
              'lefty': true
            }
          }, {
            'id': 'exposure',
            'label': 'Exposure',
            'classNameHeader': 'padding-h-small text-align-left',
            'renderCell': {
              '@class': 'org.openl.generated.beans.Input',
              'view': 'Input',
              'name': 'exposure',
              'type': 'number',
              'disabled': false,
              'className': 'border-on-hover',
              'validate': 'required'
            }
          }, {
            'id': 'paidClaims',
            'label': 'Paid Claims',
            'classNameHeader': 'padding-h-small text-align-left',
            'renderCell': {
              '@class': 'org.openl.generated.beans.Input',
              'view': 'Input',
              'name': 'paidClaims',
              'type': 'number',
              'format': 'currency',
              'disabled': false,
              'className': 'border-on-hover',
              'validate': 'required',
              'icon': {
                '@class': 'org.openl.generated.beans.Text',
                'view': 'Text',
                'label': '$',
                'className': 'icon'
              },
              'lefty': true
            }
          }, {
            'id': 'completionFactor',
            'label': 'Completion Factor',
            'classNameHeader': 'padding-h-small text-align-left',
            'renderCell': {
              '@class': 'org.openl.generated.beans.RenderCell',
              'name': 'Float',
              'decimals': 3
            }
          }, {
            'id': 'fullyIncurredClaims',
            'label': 'Fully Incurred Claims',
            'classNameHeader': 'padding-h-small text-align-left',
            'renderCell': {
              '@class': 'org.openl.generated.beans.RenderCell',
              'name': 'Currency'
            }
          }
          ],
          'showIf': {
            'relativeData': false,
            'name': 'request.experienceData.periodBasis.{state.periodBasis,0}.periodBasisType',
            'equal': 'Year'
          }
        }, {
          '@class': 'org.openl.generated.beans.Table',
          'view': 'Table',
          'name': 'request.experienceData.ratesAndHistoricalInfo.{state.plan,0}.historicalInformation',
          'className': 'margin-v no-border',
          'headers': [{
            'id': 'periodName',
            'label': 'Period',
            'classNameHeader': 'padding-h-small text-align-left border-right',
            'classNameCellWrap': 'border-right'
          }, {
            'id': 'billedPremium',
            'label': 'BilledPremium',
            'classNameHeader': 'padding-h-small text-align-left',
            'renderCell': {
              '@class': 'org.openl.generated.beans.RenderCell',
              'name': 'Currency'
            }
          }, {
            'id': 'exposure',
            'label': 'Exposure',
            'classNameHeader': 'padding-h-small text-align-left'
          }, {
            'id': 'paidClaims',
            'label': 'Paid Claims',
            'classNameHeader': 'padding-h-small text-align-left',
            'renderCell': {
              '@class': 'org.openl.generated.beans.RenderCell',
              'name': 'Currency'
            }
          }, {
            'id': 'completionFactor',
            'label': 'Completion Factor',
            'classNameHeader': 'padding-h-small text-align-left',
            'renderCell': {
              '@class': 'org.openl.generated.beans.RenderCell',
              'name': 'Float',
              'decimals': 3
            }
          }, {
            'id': 'fullyIncurredClaims',
            'label': 'Fully Incurred Claims',
            'classNameHeader': 'padding-h-small text-align-left',
            'renderCell': {
              '@class': 'org.openl.generated.beans.RenderCell',
              'name': 'Currency'
            }
          }
          ],
          'showIf': {
            'relativeData': false,
            'name': 'request.experienceData.periodBasis.{state.periodBasis,0}.periodBasisType',
            'equal': 'Month'
          },
          'renderItem': {
            '@class': 'org.openl.generated.beans.Table',
            'view': 'Table',
            'name': 'historicalInfoEntries',
            'headers': [{
              'id': 'periodDate',
              'label': 'Date',
              'classNameHeader': 'padding-h-small text-align-left border-right',
              'classNameCellWrap': 'border-right'
            }, {
              'id': 'billedPremium',
              'label': 'Billed Premium',
              'classNameHeader': 'padding-h-small text-align-left',
              'renderCell': {
                '@class': 'org.openl.generated.beans.Input',
                'view': 'Input',
                'name': 'billedPremium',
                'type': 'number',
                'format': 'currency',
                'disabled': false,
                'className': 'border-on-hover',
                'validate': 'required',
                'icon': {
                  '@class': 'org.openl.generated.beans.Text',
                  'view': 'Text',
                  'label': '$',
                  'className': 'icon'
                },
                'lefty': true
              }
            }, {
              'id': 'exposure',
              'label': 'Exposure',
              'classNameHeader': 'padding-h-small text-align-left',
              'renderCell': {
                '@class': 'org.openl.generated.beans.Input',
                'view': 'Input',
                'name': 'exposure',
                'type': 'number',
                'disabled': false,
                'className': 'border-on-hover',
                'validate': 'required'
              }
            }, {
              'id': 'paidClaims',
              'label': 'Paid Claims',
              'classNameHeader': 'padding-h-small text-align-left',
              'renderCell': {
                '@class': 'org.openl.generated.beans.Input',
                'view': 'Input',
                'name': 'paidClaims',
                'type': 'number',
                'format': 'currency',
                'disabled': false,
                'className': 'border-on-hover',
                'validate': 'required',
                'icon': {
                  '@class': 'org.openl.generated.beans.Text',
                  'view': 'Text',
                  'label': '$',
                  'className': 'icon'
                },
                'lefty': true
              }
            }, {
              'id': 'completionFactor',
              'label': 'Completion Factor',
              'classNameHeader': 'padding-h-small text-align-left',
              'renderCell': {
                '@class': 'org.openl.generated.beans.RenderCell',
                'name': 'Float',
                'decimals': 2
              }
            }, {
              'id': 'fullyIncurredClaims',
              'label': 'Fully Incurred Claims',
              'classNameHeader': 'padding-h-small text-align-left',
              'renderCell': {
                '@class': 'org.openl.generated.beans.RenderCell',
                'name': 'Currency'
              }
            }
            ]
          }
        }
        ]
      }
      ]
    }
    ]
  }
  ]
}


