export default {
  'view': 'Col',
  'className': 'card-glass margin-auto margin-v-small',
  'showIf': {
    'relativeData': false,
    'name': 'response.ratingDetails'
  },
  'items': [{
    'view': 'RowList',
    'name': 'response.ratingDetails.plans',
    'className': 'radius padding-h bg-neutral max-size',
    'renderItem': {
      'view': 'Col',
      'className': 'margin',
      'items': [
        {
          'view': 'Text',
          'children': {
            'name': 'plan'
          },
          'className': 'h4 padding-top'
        }, {
          '@class': 'org.openl.generated.beans.Table',
          'view': 'Table',
          'name': 'originalRateStorage',
          'className': 'margin-v no-border',
          'headers': [{
            'id': 'planName',
            'label': 'Plan Name',
            'classNameHeader': 'padding-h-small text-align-left border-right',
            'classNameCellWrap': 'padding-left-small border-right'
          }, {
            'id': 'rateCardPremium.annualPremium',
            'label': 'Annual Premium',
            'classNameHeader': 'padding-h-small text-align-left',
            'classNameCellWrap': 'padding-left-small ',
            'renderCell': {
              'name': 'Currency'
            }
          }, {
            'id': 'rateCardPremium.monthlyPremium',
            'label': 'Monthly Premium',
            'classNameHeader': 'padding-h-small text-align-left',
            'classNameCellWrap': 'padding-left-small ',
            'renderCell': {
              'name': 'Currency'
            }
          }
          ]
        }, {
          'view': 'VerticalLayout',
          'relativeData': false,
          'items': [{
            'view': 'VerticalLayout',
            'relativeData': false,
            'items': [{
              '@class': 'org.openl.generated.beans.Text',
              'view': 'Text',
              'label': 'Term Life',
              'className': 'h6'
            }, {
              '@class': 'org.openl.generated.beans.Table',
              'view': 'Table',
              'name': 'coveragesDetails[0].originalRateStorage',
              'className': 'margin-v no-border',
              'headers': [{
                'id': 'coverageType',
                'label': 'Coverage Type',
                'classNameHeader': 'padding-h-small text-align-left border-right',
                'classNameCellWrap': 'padding-left-small border-right'
              }, {
                'id': 'rateBasis',
                'label': 'Rate Basis',
                'classNameHeader': 'padding-h-small text-align-left',
                'classNameCellWrap': 'padding-left-small'
              }, {
                'id': 'rateCard.rate',
                'label': 'Rate',
                'classNameHeader': 'padding-h-small text-align-left',
                'classNameCellWrap': 'padding-left-small'
              }, {
                'id': 'rateCard.totalVolume',
                'label': 'Total Volume',
                'classNameHeader': 'padding-h-small text-align-left',
                'classNameCellWrap': 'padding-left-small'
              }, {
                'id': 'rateCard.numberOfLives',
                'label': 'Number of Lives',
                'classNameHeader': 'padding-h-small text-align-left',
                'classNameCellWrap': 'padding-left-small'
              }, {
                'id': 'rateCardPremium.annualPremium',
                'label': 'Annual Premium',
                'classNameHeader': 'padding-h-small text-align-left',
                'classNameCellWrap': 'padding-left-small',
                'renderCell': {
                  'name': 'Currency'
                }
              }, {
                'id': 'rateCardPremium.monthlyPremium',
                'label': 'Monthly Premium',
                'classNameHeader': 'padding-h-small text-align-left',
                'classNameCellWrap': 'padding-left-small',
                'renderCell': {
                  'name': 'Currency'
                }
              }
              ]
            }, {
              'view': 'VerticalLayout',
              'className': 'top',
              'relativeData': false,
              'items': [{
                'view': 'Table',
                'name': 'originalRateStorage[0].coverages[0].classes[0].ageBandedRateCards',
                'className': 'striped margin-v no-border',
                'headers': [{
                  'id': 'ageBand',
                  'label': 'Age Band',
                  'classNameHeader': 'padding-h-small text-align-left border-right',
                  'classNameCellWrap': 'padding-left-small border-right'
                }, {
                  'id': 'tobacco',
                  'label': 'Smoker Indicator',
                  'classNameHeader': 'padding-h-small text-align-left',
                  'classNameCellWrap': 'padding-left-small '
                }, {
                  'id': 'rateCard.rate',
                  'label': 'Rate',
                  'classNameHeader': 'padding-h-small text-align-left',
                  'classNameCellWrap': 'padding-left-small '
                }, {
                  'id': 'rateCard.totalVolume',
                  'label': 'Total Volume',
                  'classNameHeader': 'padding-h-small text-align-left',
                  'classNameCellWrap': 'padding-left-small '
                }, {
                  'id': 'rateCard.numberOfLives',
                  'label': 'Number of Lives',
                  'classNameHeader': 'padding-h-small text-align-left',
                  'classNameCellWrap': 'padding-left-small '
                }, {
                  'id': 'rateCardPremium.annualPremium',
                  'label': 'Annual Premium',
                  'classNameHeader': 'padding-h-small text-align-left',
                  'classNameCellWrap': 'padding-left-small ',
                  'renderCell': {
                    '@class': 'org.openl.generated.beans.RenderCell',
                    'name': 'Currency'
                  }
                }, {
                  'id': 'rateCardPremium.monthlyPremium',
                  'label': 'Monthly Premium',
                  'classNameHeader': 'padding-h-small text-align-left',
                  'classNameCellWrap': 'padding-left-small ',
                  'renderCell': {
                    '@class': 'org.openl.generated.beans.RenderCell',
                    'name': 'Currency'
                  }
                }
                ]
              }
              ],
              'version': 'AB1Layout'
            }
            ],
            'version': 'Coverage1Layout'
          }, {
            'view': 'VerticalLayout',
            'className': 'top',
            'relativeData': false,
            'items': [{
              'view': 'Text',
              'label': 'Spouse Term Life',
              'className': 'h6'
            }, {
              '@class': 'org.openl.generated.beans.Table',
              'view': 'Table',
              'name': 'coveragesDetails[1].originalRateStorage',
              'className': 'margin-v no-border',
              'headers': [{
                'id': 'coverageType',
                'label': 'Coverage Type',
                'classNameHeader': 'padding-h-small text-align-left border-right',
                'classNameCellWrap': 'padding-left-small border-right'
              }, {
                'id': 'rateBasis',
                'label': 'Rate Basis',
                'classNameHeader': 'padding-h-small text-align-left',
                'classNameCellWrap': 'padding-left-small '
              }, {
                'id': 'rateCard.rate',
                'label': 'Rate',
                'classNameHeader': 'padding-h-small text-align-left',
                'classNameCellWrap': 'padding-left-small '
              }, {
                'id': 'rateCard.totalVolume',
                'label': 'Total Volume',
                'classNameHeader': 'padding-h-small text-align-left',
                'classNameCellWrap': 'padding-left-small '
              }, {
                'id': 'rateCard.numberOfLives',
                'label': 'Number of Lives',
                'classNameHeader': 'padding-h-small text-align-left',
                'classNameCellWrap': 'padding-left-small '
              }, {
                'id': 'rateCardPremium.annualPremium',
                'label': 'Annual Premium',
                'classNameHeader': 'padding-h-small text-align-left',
                'classNameCellWrap': 'padding-left-small ',
                'renderCell': {
                  'name': 'Currency'
                }
              }, {
                'id': 'rateCardPremium.monthlyPremium',
                'label': 'Monthly Premium',
                'classNameHeader': 'padding-h-small text-align-left',
                'classNameCellWrap': 'padding-left-small ',
                'renderCell': {
                  'name': 'Currency'
                }
              }
              ]
            }, {
              'view': 'VerticalLayout',
              'relativeData': false,
              'items': [{
                '@class': 'org.openl.generated.beans.Table',
                'view': 'Table',
                'name': 'originalRateStorage[0].coverages[1].classes[0].ageBandedRateCards',
                'className': 'striped margin-v no-border',
                'headers': [{
                  'id': 'ageBand',
                  'label': 'Age Band',
                  'classNameHeader': 'padding-h-small text-align-left border-right',
                  'classNameCellWrap': 'border-right'
                }, {
                  'id': 'tobacco',
                  'label': 'Smoker Indicator',
                  'classNameHeader': 'padding-h-small text-align-left'
                }, {
                  'id': 'rateCard.rate',
                  'label': 'Rate',
                  'classNameHeader': 'padding-h-small text-align-left'
                }, {
                  'id': 'rateCard.totalVolume',
                  'label': 'Total Volume',
                  'classNameHeader': 'padding-h-small text-align-left'
                }, {
                  'id': 'rateCard.numberOfLives',
                  'label': 'Number of Lives',
                  'classNameHeader': 'padding-h-small text-align-left'
                }, {
                  'id': 'rateCardPremium.annualPremium',
                  'label': 'Annual Premium',
                  'classNameHeader': 'padding-h-small text-align-left',
                  'renderCell': {
                    '@class': 'org.openl.generated.beans.RenderCell',
                    'name': 'Currency'
                  }
                }, {
                  'id': 'rateCardPremium.monthlyPremium',
                  'label': 'Monthly Premium',
                  'classNameHeader': 'padding-h-small text-align-left',
                  'renderCell': {
                    '@class': 'org.openl.generated.beans.RenderCell',
                    'name': 'Currency'
                  }
                }
                ]
              }
              ],
              'version': 'AB2Layout'
            }
            ],
            'version': 'Coverage2Layout'
          }, {
            '@class': 'org.openl.generated.beans.Layout',
            'view': 'VerticalLayout',
            'relativeData': false,
            'items': [{
              '@class': 'org.openl.generated.beans.Text',
              'view': 'Text',
              'label': 'Child Term Life',
              'className': 'h6'
            }, {
              '@class': 'org.openl.generated.beans.Table',
              'view': 'Table',
              'name': 'coveragesDetails[2].originalRateStorage',
              'className': 'margin-v no-border',
              'headers': [{
                'id': 'coverageType',
                'label': 'Coverage Type',
                'classNameHeader': 'padding-h-small text-align-left border-right',
                'classNameCellWrap': 'border-right'
              }, {
                'id': 'rateBasis',
                'label': 'Rate Basis',
                'classNameHeader': 'padding-h-small text-align-left'
              }, {
                'id': 'rateCard.rate',
                'label': 'Rate',
                'classNameHeader': 'padding-h-small text-align-left'
              }, {
                'id': 'rateCard.totalVolume',
                'label': 'Total Volume',
                'classNameHeader': 'padding-h-small text-align-left'
              }, {
                'id': 'rateCard.numberOfLives',
                'label': 'Number of Lives',
                'classNameHeader': 'padding-h-small text-align-left'
              }, {
                'id': 'rateCardPremium.annualPremium',
                'label': 'Annual Premium',
                'classNameHeader': 'padding-h-small text-align-left',
                'renderCell': {
                  '@class': 'org.openl.generated.beans.RenderCell',
                  'name': 'Currency'
                }
              }, {
                'id': 'rateCardPremium.monthlyPremium',
                'label': 'Monthly Premium',
                'classNameHeader': 'padding-h-small text-align-left',
                'renderCell': {
                  '@class': 'org.openl.generated.beans.RenderCell',
                  'name': 'Currency'
                }
              }
              ]
            }
            ],
            'version': 'Coverage3Layout'
          }, {
            'view': 'VerticalLayout',
            'relativeData': false,
            'items': [{
              'view': 'Text',
              'label': 'ADD',
              'className': 'h6'
            }, {
              '@class': 'org.openl.generated.beans.Table',
              'view': 'Table',
              'name': 'coveragesDetails[3].originalRateStorage',
              'className': 'margin-v no-border',
              'headers': [{
                'id': 'coverageType',
                'label': 'Coverage Type',
                'classNameHeader': 'padding-h-small text-align-left border-right',
                'classNameCellWrap': 'border-right'
              }, {
                'id': 'rateBasis',
                'label': 'Rate Basis',
                'classNameHeader': 'padding-h-small text-align-left'
              }, {
                'id': 'rateCard.rate',
                'label': 'Rate',
                'classNameHeader': 'padding-h-small text-align-left'
              }, {
                'id': 'rateCard.totalVolume',
                'label': 'Total Volume',
                'classNameHeader': 'padding-h-small text-align-left'
              }, {
                'id': 'rateCard.numberOfLives',
                'label': 'Number of Lives',
                'classNameHeader': 'padding-h-small text-align-left'
              }, {
                'id': 'rateCardPremium.annualPremium',
                'label': 'Annual Premium',
                'classNameHeader': 'padding-h-small text-align-left',
                'renderCell': {
                  '@class': 'org.openl.generated.beans.RenderCell',
                  'name': 'Currency'
                }
              }, {
                'id': 'rateCardPremium.monthlyPremium',
                'label': 'Monthly Premium',
                'classNameHeader': 'padding-h-small text-align-left',
                'renderCell': {
                  '@class': 'org.openl.generated.beans.RenderCell',
                  'name': 'Currency'
                }
              }
              ]
            }
            ],
            'version': 'Coverage4Layout'
          }, {
            'view': 'VerticalLayout',
            'relativeData': false,
            'items': [{
              '@class': 'org.openl.generated.beans.Text',
              'view': 'Text',
              'label': 'Dependent ADD',
              'className': 'h6'
            }, {
              '@class': 'org.openl.generated.beans.Table',
              'view': 'Table',
              'name': 'coveragesDetails[4].originalRateStorage',
              'className': 'margin-v no-border',
              'headers': [{
                'id': 'coverageType',
                'label': 'Coverage Type',
                'classNameHeader': 'padding-h-small text-align-left border-right',
                'classNameCellWrap': 'border-right'
              }, {
                'id': 'rateBasis',
                'label': 'Rate Basis',
                'classNameHeader': 'padding-h-small text-align-left'
              }, {
                'id': 'rateCard.rate',
                'label': 'Rate',
                'classNameHeader': 'padding-h-small text-align-left'
              }, {
                'id': 'rateCard.totalVolume',
                'label': 'Total Volume',
                'classNameHeader': 'padding-h-small text-align-left'
              }, {
                'id': 'rateCard.numberOfLives',
                'label': 'Number of Lives',
                'classNameHeader': 'padding-h-small text-align-left'
              }, {
                'id': 'rateCardPremium.annualPremium',
                'label': 'Annual Premium',
                'classNameHeader': 'padding-h-small text-align-left',
                'renderCell': {
                  '@class': 'org.openl.generated.beans.RenderCell',
                  'name': 'Currency'
                }
              }, {
                'id': 'rateCardPremium.monthlyPremium',
                'label': 'Monthly Premium',
                'classNameHeader': 'padding-h-small text-align-left',
                'renderCell': {
                  '@class': 'org.openl.generated.beans.RenderCell',
                  'name': 'Currency'
                }
              }
              ]
            }
            ],
            'version': 'Coverage5Layout'
          }
          ],
          'version': 'CoveragesListLayout'
        }
      ],
      'version': 'PlanLayout'
    }
  }
  ],
  'version': 'RatingDetailsLayout'
}

