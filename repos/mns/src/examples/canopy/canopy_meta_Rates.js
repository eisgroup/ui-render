export default {
  "view": "VerticalLayout",
  "styles": "padding-h-largest bg-info-light",
  "relativeData": false,
  "showIf": {
    "relativeData": false,
    "name": "Response.RatingDetails"
  },
  "items": [
    {
      "@class": "org.openl.generated.beans.Layout",
      "view": "VerticalLayout",
      "styles": "margin-v-largest",
      "relativeData": false,
      "items": [
        {
          "@class": "org.openl.generated.beans.Title",
          "view": "Title",
          "label": "Rates",
          "styles": "padding"
        },
        {
          "@class": "org.openl.generated.beans.Layout",
          "view": "HorizontalLayout",
          "styles": "padding-h-largest top bg-neutral align-center",
          "relativeData": false,
          "items": [
            {
              "@class": "org.openl.generated.beans.TableRows",
              "view": "Table",
              "headers": [
                {
                  "id": "Description",
                  "label": "Description",
                  "styleHeader": {
                    "width": "300px"
                  }
                },
                {
                  "id": "Total",
                  "label": "Amount",
                  "styleHeader": {
                    "width": "200px"
                  }
                }
              ],
              "extraItems": [
                {
                  "@class": "org.openl.generated.beans.TableRowsItems1",
                  "Description": "Total Male Benefit",
                  "Total": {
                    "@class": "org.openl.generated.beans.Text",
                    "view": "Text",
                    "renderLabel": {
                      "@class": "org.openl.generated.beans.RenderLabel",
                      "name": "Currency"
                    },
                    "children": {
                      "name": "Response.RatingDetails.Plans[0].MaleBenefit"
                    }
                  }
                },
                {
                  "@class": "org.openl.generated.beans.TableRowsItems1",
                  "Description": "Total Female Benefit",
                  "Total": {
                    "@class": "org.openl.generated.beans.Text",
                    "view": "Text",
                    "renderLabel": {
                      "@class": "org.openl.generated.beans.RenderLabel",
                      "name": "Currency"
                    },
                    "children": {
                      "name": "Response.RatingDetails.Plans[0].FemaleBenefit"
                    }
                  }
                },
                {
                  "@class": "org.openl.generated.beans.TableRowsItems1",
                  "Description": "Total Benefit",
                  "Total": {
                    "@class": "org.openl.generated.beans.Text",
                    "view": "Text",
                    "renderLabel": {
                      "@class": "org.openl.generated.beans.RenderLabel",
                      "name": "Currency"
                    },
                    "children": {
                      "name": "Response.RatingDetails.Plans[0].TotalBenefit"
                    }
                  }
                }
              ]
            },
            {
              "@class": "org.openl.generated.beans.Element",
              "view": "Space"
            },
            {
              "@class": "org.openl.generated.beans.TableRows",
              "view": "Table",
              "headers": [
                {
                  "id": "Description",
                  "label": "Description",
                  "styleHeader": {
                    "width": "300px"
                  }
                },
                {
                  "id": "Total",
                  "label": "Amount",
                  "styleHeader": {
                    "width": "200px"
                  }
                }
              ],
              "extraItems": [
                {
                  "@class": "org.openl.generated.beans.TableRowsItems1",
                  "Description": "Basic Cost",
                  "Total": {
                    "@class": "org.openl.generated.beans.Text",
                    "view": "Text",
                    "renderLabel": {
                      "@class": "org.openl.generated.beans.RenderLabel",
                      "name": "Currency"
                    },
                    "children": {
                      "name": "Response.RatingDetails.Plans[0].BasicCost"
                    }
                  }
                },
                {
                  "@class": "org.openl.generated.beans.TableRowsItems1",
                  "Description": "Premium",
                  "Total": {
                    "@class": "org.openl.generated.beans.Text",
                    "view": "Text",
                    "renderLabel": {
                      "@class": "org.openl.generated.beans.RenderLabel",
                      "name": "Currency"
                    },
                    "children": {
                      "name": "Response.RatingDetails.Plans[0].Premium"
                    }
                  }
                }
              ]
            }
          ],
          "version": "RatesDetailsLayout"
        },
        {
          "@class": "org.openl.generated.beans.Element",
          "view": "Space"
        },
        {
          "@class": "org.openl.generated.beans.Layout",
          "view": "HorizontalLayout",
          "styles": "padding-h-largest top bg-neutral align-center",
          "relativeData": false,
          "items": [
            {
              "@class": "org.openl.generated.beans.Table",
              "view": "Table",
              "name": "Response.RatingDetails.Plans[0].AdjustedAgeRates",
              "styles": "margin-v border",
              "headers": [
                {
                  "id": "Age",
                  "label": "Age",
                  "classNameHeader": "padding-h-small text-align-left border-right",
                  "classNameCellWrap": "border-right"
                },
                {
                  "id": "MaleBenefit",
                  "label": "Male",
                  "classNameHeader": "padding-h-small text-align-left",
                  "renderCell": {
                    "@class": "org.openl.generated.beans.RenderCell",
                    "name": "Currency"
                  }
                },
                {
                  "id": "FemaleBenefit",
                  "label": "Female",
                  "classNameHeader": "padding-h-small text-align-left",
                  "renderCell": {
                    "@class": "org.openl.generated.beans.RenderCell",
                    "name": "Currency"
                  }
                },
                {
                  "id": "AgeProportionMale",
                  "label": "Proportion Male",
                  "classNameHeader": "padding-h-small text-align-left",
                  "renderCell": {
                    "@class": "org.openl.generated.beans.RenderCell",
                    "name": "Percent",
                    "decimals": 4
                  }
                },
                {
                  "id": "AgeUwOverride",
                  "label": "UW Override",
                  "classNameHeader": "padding-h-small text-align-left",
                  "renderCell": {
                    "@class": "org.openl.generated.beans.RenderCell",
                    "name": "Percent",
                    "decimals": 4
                  }
                }
              ]
            },
            {
              "@class": "org.openl.generated.beans.Element",
              "view": "Space"
            },
            {
              "@class": "org.openl.generated.beans.Table",
              "view": "Table",
              "name": "Response.RatingDetails.Plans[0].AdjustedAgeRates",
              "styles": "margin-v border",
              "headers": [
                {
                  "id": "Age",
                  "label": "Age",
                  "classNameHeader": "padding-h-small text-align-left border-right",
                  "classNameCellWrap": "border-right"
                },
                {
                  "id": "UnisexFlexRateBeforeOverride",
                  "label": "Unisex Flex Rate Before Override",
                  "classNameHeader": "padding-h-small text-align-left"
                },
                {
                  "id": "UnisexFlexRateAfterOverride",
                  "label": "Unisex Flex Rate After Override",
                  "classNameHeader": "padding-h-small text-align-left",
                  "renderCell": {
                    "@class": "org.openl.generated.beans.RenderCell",
                    "name": "Double_5",
                    "decimals": 4
                  }
                }
              ]
            }
          ],
          "version": "AgeRatesLayout"
        },
        {
          "@class": "org.openl.generated.beans.Element",
          "view": "Space"
        },
        {
          "@class": "org.openl.generated.beans.Title",
          "view": "Title",
          "label": "UW Workbench",
          "styles": "padding"
        },
        {
          "@class": "org.openl.generated.beans.TableRows",
          "view": "Table",
          "headers": [
            {
              "id": "Description",
              "label": "Loading Name",
              "styleHeader": {
                "width": "300px"
              }
            },
            {
              "id": "Factors",
              "label": "System Generated Loading",
              "styleHeader": {
                "width": "200px"
              }
            },
            {
              "id": "Comments",
              "label": "Underwriter Override",
              "styleHeader": {
                "width": "200px"
              }
            },
            {
              "id": "Comments",
              "label": "Comments/Rationale for Override",
              "styleHeader": {
                "width": "300px"
              }
            }
          ],
          "extraItems": [
            {
              "@class": "org.openl.generated.beans.TableRowsItems1",
              "Description": "Accounting Frequency",
              "Factors": {
                "@class": "org.openl.generated.beans.Text",
                "view": "Text",
                "renderLabel": {
                  "@class": "org.openl.generated.beans.RenderLabel",
                  "name": "Double_5"
                },
                "children": {
                  "name": "Response.RatingDetails.Plans[0].AccountingFrequency"
                }
              },
              "Comments": {
                "@class": "org.openl.generated.beans.Input",
                "view": "Input",
                "name": "coverageUWAdjustedInfo.factors.comment1",
                "type": "number",
                "format": "Double_5",
                "disabled": false,
                "relativeData": true
              }
            },
            {
              "@class": "org.openl.generated.beans.TableRowsItems1",
              "Description": "Free Cover Limit (FCL)",
              "Factors": {
                "@class": "org.openl.generated.beans.Text",
                "view": "Text",
                "renderLabel": {
                  "@class": "org.openl.generated.beans.RenderLabel",
                  "name": "Double_5"
                },
                "children": {
                  "name": "Response.RatingDetails.Plans[0].FCL"
                }
              },
              "Comments": {
                "@class": "org.openl.generated.beans.Input",
                "view": "Input",
                "name": "coverageUWAdjustedInfo.factors.comment2",
                "type": "number",
                "format": "Double_5",
                "disabled": false,
                "relativeData": true
              }
            },
            {
              "@class": "org.openl.generated.beans.TableRowsItems1",
              "Description": "Salary Loading",
              "Factors": {
                "@class": "org.openl.generated.beans.Text",
                "view": "Text",
                "renderLabel": {
                  "@class": "org.openl.generated.beans.RenderLabel",
                  "name": "Double_5"
                },
                "children": {
                  "name": "Response.RatingDetails.Plans[0].SalaryLoading"
                }
              },
              "Comments": {
                "@class": "org.openl.generated.beans.Input",
                "view": "Input",
                "name": "coverageUWAdjustedInfo.factors.comment3",
                "type": "number",
                "format": "Double_5",
                "disabled": false,
                "relativeData": true
              }
            },
            {
              "@class": "org.openl.generated.beans.TableRowsItems1",
              "Description": "Occupation Loading",
              "Factors": {
                "@class": "org.openl.generated.beans.Text",
                "view": "Text",
                "renderLabel": {
                  "@class": "org.openl.generated.beans.RenderLabel",
                  "name": "Double_5"
                },
                "children": {
                  "name": "Response.RatingDetails.Plans[0].OccupationLoading"
                }
              },
              "Comments": {
                "@class": "org.openl.generated.beans.Input",
                "view": "Input",
                "name": "coverageUWAdjustedInfo.factors.comment4",
                "type": "number",
                "format": "Double_5",
                "disabled": false,
                "relativeData": true
              }
            },
            {
              "@class": "org.openl.generated.beans.TableRowsItems1",
              "Description": "Location Loading",
              "Factors": {
                "@class": "org.openl.generated.beans.Text",
                "view": "Text",
                "renderLabel": {
                  "@class": "org.openl.generated.beans.RenderLabel",
                  "name": "Double_5"
                },
                "children": {
                  "name": "Response.RatingDetails.Plans[0].LocationLoading"
                }
              },
              "Comments": {
                "@class": "org.openl.generated.beans.Input",
                "view": "Input",
                "name": "coverageUWAdjustedInfo.factors.comment5",
                "type": "number",
                "format": "Double_5",
                "disabled": false,
                "relativeData": true
              }
            },
            {
              "@class": "org.openl.generated.beans.TableRowsItems1",
              "Description": "Reinsurance Loading",
              "Factors": {
                "@class": "org.openl.generated.beans.Text",
                "view": "Text",
                "renderLabel": {
                  "@class": "org.openl.generated.beans.RenderLabel",
                  "name": "Double_5"
                },
                "children": {
                  "name": "Response.RatingDetails.Plans[0].ReinsuranceLoading"
                }
              },
              "Comments": {
                "@class": "org.openl.generated.beans.Input",
                "view": "Input",
                "name": "coverageUWAdjustedInfo.factors.comment6",
                "type": "number",
                "format": "Double_5",
                "disabled": false,
                "relativeData": true
              }
            },
            {
              "@class": "org.openl.generated.beans.TableRowsItems1",
              "Description": "Long Term Absence (LTA)",
              "Factors": {
                "@class": "org.openl.generated.beans.Text",
                "view": "Text",
                "renderLabel": {
                  "@class": "org.openl.generated.beans.RenderLabel",
                  "name": "Double_5"
                },
                "children": {
                  "name": "Response.RatingDetails.Plans[0].LTA"
                }
              },
              "Comments": {
                "@class": "org.openl.generated.beans.Input",
                "view": "Input",
                "name": "coverageUWAdjustedInfo.factors.comment7",
                "type": "number",
                "format": "Double_5",
                "disabled": false,
                "relativeData": true
              }
            },
            {
              "@class": "org.openl.generated.beans.TableRowsItems1",
              "Description": "Claims Experience",
              "Factors": {
                "@class": "org.openl.generated.beans.Text",
                "view": "Text",
                "renderLabel": {
                  "@class": "org.openl.generated.beans.RenderLabel",
                  "name": "Double_5"
                },
                "children": {
                  "name": "Response.RatingDetails.Plans[0].ClaimsExperience"
                }
              },
              "Comments": {
                "@class": "org.openl.generated.beans.Input",
                "view": "Input",
                "name": "coverageUWAdjustedInfo.factors.comment8",
                "type": "number",
                "format": "Double_5",
                "disabled": false,
                "relativeData": true
              }
            },
            {
              "@class": "org.openl.generated.beans.TableRowsItems1",
              "Description": "ML Price Adjustment",
              "Factors": {
                "@class": "org.openl.generated.beans.Text",
                "view": "Text",
                "renderLabel": {
                  "@class": "org.openl.generated.beans.RenderLabel",
                  "name": "Double_5"
                },
                "children": {
                  "name": "Response.RatingDetails.Plans[0].MLPriceAdjustment"
                }
              },
              "Comments": {
                "@class": "org.openl.generated.beans.Input",
                "view": "Input",
                "name": "coverageUWAdjustedInfo.factors.comment9",
                "type": "number",
                "format": "Double_5",
                "disabled": false,
                "relativeData": true
              }
            }
          ]
        }
      ],
      "version": "RatingDetailsLayout"
    }
  ],
  "version": "0.19.1"
}