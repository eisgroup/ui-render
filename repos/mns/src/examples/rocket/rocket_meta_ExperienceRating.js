export default {
  "view": "VerticalLayout",
  "styles": "bg-info-light",
  "items": [
  {
    "view": "VerticalLayout",
    "styles": "bg-neutral padding-larger margin-top-larger",
    "showIf": {
      "name": "experienceResults"
    },
    "items": [
      {
        "view": "Title",
        "label": "Experience Rating Results",
        "styles": "padding-v-smaller"
      },
      {
        "view": "HorizontalLayout",
        "items": [
          {
            "view": "Dropdown",
            "name": "planResult",
            "options": {
              "name": "experienceResults",
              "relativeData": false
            },
            "mapOptions": "planName",
            "compact": true
          }
        ]
      },
      {
        "view": "Table",
        "name": "ExperienceData.experienceResults.{state.planResult,0}.coverages.0.experienceRatesPerTier",
        "styles": "margin-v no-border",
        "headers": [
          {
            "id": "tierName",
            "label": "Tier"
          },
          {
            "id": "currentChargedRate",
            "label": "Charged Rate",
            "renderCell": {
              "name": "Currency",
              "decimals": 2
            }
          },
          {
            "id": "formulaRate",
            "label": "Formula Rate",
            "renderCell": {
              "name": "Currency",
              "decimals": 2
            }
          },
          {
            "id": "experienceAdjustmentPercent",
            "label": "% Change",
            "renderCell": {
              "name": "Float",
              "decimals": 3
            }
          }
        ]
      },
      {
        "view": "Title",
        "label": "Experience Rate Calculation Details",
        "styles": "padding-v-smaller"
      },
      {
        "view": "RowList",
        "name": "ExperienceData.experienceResults.{state.planResult,0}.coverages.0.experienceRatesPerTier",
        "renderItem": {
          "view": "VerticalLayout",
          "styles": "bg-neutral margin-top-larger padding-right",
          "items": [
            {
              "view": "Text",
              "children": {
                "name": "tierName"
              },
              "className": "h6 padding-left"
            },
            {
              "view": "Table",
              "name": "experienceRatesPerPeriod",
              "styles": "margin-v no-border",
              "headers": [
                {
                  "id": "periodName",
                  "label": "Period"
                },
                {
                  "id": "experienceRate",
                  "label": "Experience Rate",
                  "renderCell": {
                    "name": "Currency",
                    "decimals": 2
                  }
                },
                {
                  "id": "credibilityRate",
                  "label": "Credibility Rate",
                  "renderCell": {
                    "name": "Currency",
                    "decimals": 2
                  }
                }
              ]
            }
          ]
        },
        "className": "wrap"
      },
      {
        "view": "Table",
        "name": "ExperienceData.experienceResults.{state.planResult,0}.coverages.0.experienceDetailsPerPeriod",
        "styles": "margin-v no-border",
        "headers": [
          {
            "id": "periodName",
            "label": "Period"
          },
          {
            "id": "startDate",
            "label": "Start Date"
          },
          {
            "id": "endDate",
            "label": "End Date"
          },
          {
            "id": "numberOfMonths",
            "label": "# of Month"
          },
          {
            "id": "coveredLives",
            "label": "Covered Lives"
          },
          {
            "id": "billedPremium",
            "label": "Billed Premium",
            "renderCell": {
              "name": "Currency"
            }
          },
          {
            "id": "paidClaims",
            "label": "Paid Claims",
            "renderCell": {
              "name": "Currency"
            }
          },
          {
            "id": "fullyIncurredClaims",
            "label": "Fully Incurred Claims",
            "renderCell": {
              "name": "Currency"
            }
          },
          {
            "id": "paidLossRatio",
            "label": "Paid Loss Ratio",
            "renderCell": {
              "name": "Float",
              "decimals": 2
            }
          },
          {
            "id": "incurredLossRatio",
            "label": "Incurred Paid Loss Ratio",
            "renderCell": {
              "name": "Float",
              "decimals": 2
            }
          },
          {
            "id": "trendedIncurredLossRatio",
            "label": "Trended Inc. Loss Ratio",
            "renderCell": {
              "name": "Float",
              "decimals": 2
            }
          },
          {
            "id": "targetLossRatio",
            "label": "Target Inc. Loss Ratio",
            "renderCell": {
              "name": "Float",
              "decimals": 2
            }
          },
          {
            "id": "trendedIncurredClaims",
            "label": "Trended Inc. Claims",
            "renderCell": {
              "name": "Currency"
            }
          },
          {
            "id": "trendFactor",
            "label": "Trend Factor",
            "renderCell": {
              "name": "Float",
              "decimals": 2
            }
          },
          {
            "id": "experienceModificationFactor",
            "label": "Experience Modification Factor",
            "renderCell": {
              "name": "Float",
              "decimals": 2
            }
          }
        ],
        "vertical": true
      }
    ]
  },
  {
    "view": "VerticalLayout",
    "styles": "bg-neutral  padding-larger margin-top-larger",
    "items": [
      {
        "view": "Title",
        "label": "Experience Rating",
        "styles": "padding-v-smaller"
      },
      {
        "view": "Row",
        "items": [
          {
            "view": "Input",
            "name": "ExperienceData.showExperienceRating",
            "label": " ",
            "type": "toggle",
            "disabled": false,
            "onChange": "updateDataOnChange"
          },
          {
            "view": "Text",
            "label": "Experience Rating",
            "children": {
              "name": "Experience Rating"
            },
            "className": "padding-left"
          }
        ],
        "styles": "middle"
      }
    ]
  },
  {
    "view": "VerticalLayout",
    "showIf": {
      "relativeData": false,
      "name": "ExperienceData.showExperienceRating",
      "equal": true
    },
    "items": [
      {
        "view": "VerticalLayout",
        "styles": "bg-neutral padding-larger margin-top-larger",
        "items": [
          {
            "view": "Title",
            "label": "Experience Periods",
            "styles": "padding-v-smaller"
          },
          {
            "view": "HorizontalLayout",
            "styles": "wrap margin-bottom-smaller",
            "items": [
              {
                "view": "Input",
                "name": "ExperienceData.credibility",
                "label": "Credibility",
                "type": "number",
                "disabled": false,
                "className": "margin-right-larger",
                "placeholder": "Enter the value"
              },
              {
                "view": "Input",
                "name": "ExperienceData.trendAssumption",
                "label": "Trend Assumption",
                "type": "text",
                "disabled": false,
                "placeholder": "Enter the value"
              }
            ]
          },
          {
            "view": "Table",
            "name": "ExperienceData.dataKind.experiencePeriods",
            "styles": "margin-v no-border",
            "headers": [
              {
                "id": "periodName",
                "label": "Period",
                "classNameHeader": "padding-left-small border-right"
              },
              {
                "id": "startDate",
                "label": "Period Start",
                "classNameHeader": "padding-left-small"
              },
              {
                "id": "endDate",
                "label": "Period End",
                "classNameHeader": "padding-left-small"
              },
              {
                "id": "weight",
                "label": "Weight",
                "classNameHeader": "padding-left-small"
              },
              {
                "id": "numberOfMonths",
                "label": "# of Month",
                "classNameHeader": "padding-left-small"
              },
              {
                "id": "null",
                "label": "",
                "classNameHeader": "align-center"
              }
            ],
            "renderItemCells": {
              "view": "Data",
              "kind": "experiencePeriods",
              "embedded": true,
              "meta": {
                "view": "TableCells",
                "style": {
                  "verticalAlign": "top"
                },
                "styles": "no-border-right-last-item",
                "items": [
                  {
                    "view": "Input",
                    "name": "periodName",
                    "type": "text",
                    "disabled": false,
                    "className": "border-on-hover border-right",
                    "validate": "required"
                  },
                  {
                    "view": "Input",
                    "name": "startDate",
                    "type": "date",
                    "format": "date",
                    "disabled": false,
                    "className": "border-on-hover",
                    "validate": "required",
                    "verify": {
                      "dataKind": "experiencePeriods",
                      "validate": [
                        {
                          "name": "notWithinRange",
                          "args": [
                            "startDate",
                            "endDate"
                          ]
                        }
                      ]
                    }
                  },
                  {
                    "view": "Input",
                    "name": "endDate",
                    "type": "date",
                    "format": "date",
                    "disabled": false,
                    "className": "border-on-hover",
                    "validate": "required",
                    "verify": {
                      "dataKind": "experiencePeriods",
                      "validate": [
                        {
                          "name": "notWithinRange",
                          "args": [
                            "startDate",
                            "endDate"
                          ]
                        }
                      ]
                    }
                  },
                  {
                    "view": "Input",
                    "name": "weight",
                    "type": "number",
                    "disabled": false,
                    "className": "border-on-hover",
                    "validate": "required"
                  },
                  {
                    "view": "Input",
                    "name": "numberOfMonths",
                    "type": "number",
                    "disabled": true,
                    "className": "border-on-hover",
                    "validate": "required"
                  },
                  {
                    "view": "VerticalLayout",
                    "items": [
                      {
                        "view": "Button",
                        "styles": "a transparent",
                        "items": [
                          {
                            "view": "Icon",
                            "name": "trash"
                          }
                        ],
                        "onClick": {
                          "name": "removeData"
                        },
                        "disabled": false
                      }
                    ]
                  }
                ]
              }
            },
            "renderExtraItem": {
              "view": "Data",
              "kind": "experiencePeriods",
              "embedded": true,
              "meta": {
                "view": "TableCells",
                "style": {
                  "verticalAlign": "top"
                },
                "styles": "fade--quarter",
                "items": [
                  {
                    "view": "Input",
                    "name": "periodName",
                    "label": "Period",
                    "type": "text",
                    "disabled": false,
                    "validate": "required"
                  },
                  {
                    "view": "Input",
                    "name": "startDate",
                    "label": "Period Start",
                    "type": "date",
                    "format": "date",
                    "disabled": false,
                    "validate": "required",
                    "verify": {
                      "dataKind": "experiencePeriods",
                      "validate": [
                        {
                          "name": "notWithinRange",
                          "args": [
                            "startDate",
                            "endDate"
                          ]
                        }
                      ]
                    }
                  },
                  {
                    "view": "Input",
                    "name": "endDate",
                    "label": "Period End",
                    "type": "date",
                    "format": "date",
                    "disabled": false,
                    "validate": "required",
                    "verify": {
                      "dataKind": "experiencePeriods",
                      "validate": [
                        {
                          "name": "notWithinRange",
                          "args": [
                            "startDate",
                            "endDate"
                          ]
                        }
                      ]
                    }
                  },
                  {
                    "view": "Input",
                    "name": "weight",
                    "label": "Weight",
                    "type": "number",
                    "disabled": false,
                    "validate": "required"
                  },
                  {
                    "view": "Input",
                    "name": "numberOfMonths",
                    "label": "# of Month",
                    "type": "number",
                    "disabled": true
                  },
                  {
                    "view": "VerticalLayout",
                    "items": [
                      {
                        "view": "Button",
                        "styles": "a transparent",
                        "style": {
                          "marginTop": 35
                        },
                        "onClick": {
                          "name": "addData"
                        },
                        "children": "Add",
                        "disabled": false
                      }
                    ]
                  }
                ]
              },
              "initialValues": {}
            }
          },
          {
            "view": "VerticalLayout",
            "styles": "right margin-h-largest",
            "items": [
              {
                "view": "Button",
                "items": [
                  {
                    "view": "Text",
                    "label": "Apply Periods"
                  }
                ],
                "onClick": {
                  "name": "onApplyPeriods"
                },
                "disabled": false
              }
            ]
          }
        ]
      },
      {
        "view": "HorizontalLayout",
        "styles": "bg-neutral padding-larger middle margin-top-larger",
        "items": [
          {
            "view": "Title",
            "label": "Plan",
            "styles": "padding-v-smaller"
          },
          {
            "view": "Space"
          },
          {
            "view": "Dropdown",
            "name": "plan",
            "options": {
              "name": "ExperienceData.ratesAndHistoricalInfo",
              "relativeData": false
            },
            "mapOptions": "planName",
            "compact": true
          }
        ]
      },
      {
        "view": "VerticalLayout",
        "styles": "bg-neutral padding-larger margin-top-larger",
        "items": [
          {
            "view": "Title",
            "label": "Charged Rates",
            "styles": "padding-v-smaller"
          },
          {
            "view": "RowList",
            "name": "ExperienceData.ratesAndHistoricalInfo.{state.plan,0}.rates",
            "renderItem": {
              "view": "VerticalLayout",
              "styles": "bg-neutral margin-top-larger padding-right",
              "items": [
                {
                  "view": "Text",
                  "children": {
                    "name": "tierName"
                  },
                  "className": "h6 padding-left"
                },
                {
                  "view": "Table",
                  "name": "tierRates",
                  "styles": "margin-v no-border",
                  "headers": [
                    {
                      "id": "periodName",
                      "label": "Period",
                      "classNameHeader": "padding-h-small text-align-left border-right",
                      "classNameCellWrap": "padding-smaller border-right"
                    },
                    {
                      "id": "rateValue",
                      "label": "Rate",
                      "classNameHeader": "padding-h-small text-align-left",
                      "renderCell": {
                        "view": "Input",
                        "name": "rateValue",
                        "type": "number",
                        "format": "currency",
                        "disabled": false,
                        "className": "border-on-hover",
                        "validate": "required",
                        "icon": {
                          "view": "Text",
                          "label": "$",
                          "className": "icon"
                        },
                        "lefty": true
                      }
                    }
                  ]
                }
              ]
            },
            "className": "wrap"
          }
        ]
      },
      {
        "view": "VerticalLayout",
        "styles": "bg-neutral padding-larger margin-top-larger",
        "items": [
          {
            "view": "Title",
            "label": "Historical Information",
            "styles": "padding-v-smaller"
          },
          {
            "view": "HorizontalLayout",
            "styles": "wrap margin-top",
            "items": [
              {
                "view": "Select",
                "name": "periodBasisSelection",
                "options": {
                  "name": "ExperienceData.periodBasis"
                },
                "mapOptions": "periodBasisType",
                "styles": "margin-right",
                "disabled": false,
                "compact": true
              },
              {
                "view": "Button",
                "styles": "margin-right",
                "items": [
                  {
                    "view": "Icon",
                    "name": "file-download",
                    "styles": "margin-right-smaller"
                  },
                  {
                    "view": "Text",
                    "label": "Download File Template"
                  }
                ],
                "onClick": {
                  "name": "download",
                  "args": [
                    "historical-data-template.csv"
                  ]
                },
                "disabled": false
              },
              {
                "view": "VerticalLayout",
                "items": [
                  {
                    "view": "Input",
                    "name": "file",
                    "type": "file",
                    "title": "Upload CSV File",
                    "className": "button margin-right",
                    "formats": [
                      "csv"
                    ],
                    "multiple": false,
                    "maxSize": 16777216,
                    "autoSubmit": false,
                    "showTypes": false,
                    "items": [
                      {
                        "view": "Icon",
                        "name": "file-upload",
                        "styles": "margin-right-smaller"
                      },
                      {
                        "view": "Text",
                        "label": "Upload File"
                      }
                    ],
                    "disabled": false,
                    "onChange": "upload"
                  }
                ]
              }
            ]
          },
          {
            "view": "Table",
            "name": "ExperienceData.ratesAndHistoricalInfo.{state.plan,0}.historicalInformation",
            "styles": "margin-v no-border",
            "headers": [
              {
                "id": "periodName",
                "label": "Period",
                "classNameHeader": "padding-h-small text-align-left border-right",
                "classNameCellWrap": "padding-smaller border-right"
              },
              {
                "id": "billedPremium",
                "label": "Billed Premium",
                "classNameHeader": "padding-h-small text-align-left",
                "renderCell": {
                  "view": "Input",
                  "name": "billedPremium",
                  "type": "number",
                  "format": "currency",
                  "disabled": false,
                  "className": "border-on-hover",
                  "validate": "required",
                  "icon": {
                    "view": "Text",
                    "label": "$",
                    "className": "icon"
                  },
                  "lefty": true
                }
              },
              {
                "id": "exposure",
                "label": "Exposure",
                "classNameHeader": "padding-h-small text-align-left",
                "renderCell": {
                  "view": "Input",
                  "name": "exposure",
                  "type": "number",
                  "disabled": false,
                  "className": "border-on-hover",
                  "validate": "required"
                }
              },
              {
                "id": "paidClaims",
                "label": "Paid Claims",
                "classNameHeader": "padding-h-small text-align-left",
                "renderCell": {
                  "view": "Input",
                  "name": "paidClaims",
                  "type": "number",
                  "format": "currency",
                  "disabled": false,
                  "className": "border-on-hover",
                  "validate": "required",
                  "icon": {
                    "view": "Text",
                    "label": "$",
                    "className": "icon"
                  },
                  "lefty": true
                }
              },
              {
                "id": "completionFactor",
                "label": "Completion Factor",
                "classNameHeader": "padding-h-small text-align-left",
                "renderCell": {
                  "name": "Float",
                  "decimals": 3
                }
              },
              {
                "id": "fullyIncurredClaims",
                "label": "Fully Incurred Claims",
                "classNameHeader": "padding-h-small text-align-left",
                "renderCell": {
                  "name": "Currency"
                }
              }
            ],
            "showIf": {
              "relativeData": false,
              "name": "ExperienceData.periodBasis.{state.periodBasisSelection,0}.periodBasisType",
              "equal": "Year"
            }
          },
          {
            "view": "Table",
            "name": "ExperienceData.ratesAndHistoricalInfo.{state.plan,0}.historicalInformation",
            "styles": "margin-v no-border",
            "headers": [
              {
                "id": "periodName",
                "label": "Period",
                "classNameHeader": "padding-h-small text-align-left border-right",
                "classNameCellWrap": "border-right"
              },
              {
                "id": "billedPremium",
                "label": "Billed Premium",
                "classNameHeader": "padding-h-small text-align-left",
                "renderCell": {
                  "name": "Currency"
                }
              },
              {
                "id": "exposure",
                "label": "Exposure",
                "classNameHeader": "padding-h-small text-align-left"
              },
              {
                "id": "paidClaims",
                "label": "Paid Claims",
                "classNameHeader": "padding-h-small text-align-left",
                "renderCell": {
                  "name": "Currency"
                }
              },
              {
                "id": "completionFactor",
                "label": "Completion Factor",
                "classNameHeader": "padding-h-small text-align-left",
                "renderCell": {
                  "name": "Float",
                  "decimals": 3
                }
              },
              {
                "id": "fullyIncurredClaims",
                "label": "Fully Incurred Claims",
                "classNameHeader": "padding-h-small text-align-left",
                "renderCell": {
                  "name": "Currency"
                }
              }
            ],
            "showIf": {
              "relativeData": false,
              "name": "ExperienceData.periodBasis.{state.periodBasisSelection,0}.periodBasisType",
              "equal": "Month"
            },
            "renderItem": {
              "view": "Table",
              "name": "historicalInfoEntries",
              "headers": [
                {
                  "id": "periodDate",
                  "label": "Date",
                  "classNameHeader": "padding-h-small text-align-left border-right",
                  "classNameCellWrap": "border-right"
                },
                {
                  "id": "billedPremium",
                  "label": "Billed Premium",
                  "classNameHeader": "padding-h-small text-align-left",
                  "renderCell": {
                    "view": "Input",
                    "name": "billedPremium",
                    "type": "number",
                    "format": "currency",
                    "disabled": false,
                    "className": "border-on-hover",
                    "validate": "required",
                    "icon": {
                      "view": "Text",
                      "label": "$",
                      "className": "icon"
                    },
                    "lefty": true
                  }
                },
                {
                  "id": "exposure",
                  "label": "Exposure",
                  "classNameHeader": "padding-h-small text-align-left",
                  "renderCell": {
                    "view": "Input",
                    "name": "exposure",
                    "type": "number",
                    "disabled": false,
                    "className": "border-on-hover",
                    "validate": "required"
                  }
                },
                {
                  "id": "paidClaims",
                  "label": "Paid Claims",
                  "classNameHeader": "padding-h-small text-align-left",
                  "renderCell": {
                    "view": "Input",
                    "name": "paidClaims",
                    "type": "number",
                    "format": "currency",
                    "disabled": false,
                    "className": "border-on-hover",
                    "validate": "required",
                    "icon": {
                      "view": "Text",
                      "label": "$",
                      "className": "icon"
                    },
                    "lefty": true
                  }
                },
                {
                  "id": "completionFactor",
                  "label": "Completion Factor",
                  "classNameHeader": "padding-h-small text-align-left",
                  "renderCell": {
                    "name": "Float",
                    "decimals": 2
                  }
                },
                {
                  "id": "fullyIncurredClaims",
                  "label": "Fully Incurred Claims",
                  "classNameHeader": "padding-h-small text-align-left",
                  "renderCell": {
                    "name": "Currency"
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