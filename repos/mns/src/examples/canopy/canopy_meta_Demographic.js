export default {
  "view": "VerticalLayout",
  "styles": "padding-h-largest bg-info-light",
  "relativeData": false,
  "items": [
    {
      "@class": "org.openl.generated.beans.Layout",
      "view": "VerticalLayout",
      "styles": "margin-v-largest",
      "relativeData": false,
      "showIf": {
        "relativeData": false,
        "name": "Response.RatingDetails"
      },
      "items": [
        {
          "@class": "org.openl.generated.beans.Layout",
          "view": "VerticalLayout",
          "styles": "padding-h-largest middle bg-neutral",
          "relativeData": false,
          "items": [
            {
              "@class": "org.openl.generated.beans.Layout",
              "view": "HorizontalLayout",
              "styles": "padding-h-largest middle bg-neutral",
              "relativeData": false,
              "items": [
                {
                  "@class": "org.openl.generated.beans.Text",
                  "view": "Text",
                  "label": "Plans",
                  "styles": "h4"
                },
                {
                  "@class": "org.openl.generated.beans.Element",
                  "view": "Space"
                },
                {
                  "@class": "org.openl.generated.beans.Dropdown",
                  "view": "Dropdown",
                  "name": "Plan",
                  "options": {
                    "name": "Response.RatingDetails.Plans"
                  },
                  "mapOptions": "Plan",
                  "compact": true
                },
                {
                  "@class": "org.openl.generated.beans.Element",
                  "view": "Space"
                }
              ],
              "version": "PlanListLayout"
            },
            {
              "@class": "org.openl.generated.beans.Layout",
              "view": "HorizontalLayout",
              "styles": "padding-h-largest middle bg-neutral",
              "relativeData": false,
              "items": [
                {
                  "@class": "org.openl.generated.beans.Layout",
                  "view": "VerticalLayout",
                  "styles": "padding-h-largest middle bg-neutral left",
                  "relativeData": false,
                  "items": [
                    {
                      "@class": "org.openl.generated.beans.Element",
                      "view": "Space"
                    },
                    {
                      "@class": "org.openl.generated.beans.Text",
                      "view": "Text",
                      "label": "Demographic Summary",
                      "styles": "h6"
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
                          "label": "Total",
                          "styleHeader": {
                            "width": "200px"
                          }
                        }
                      ],
                      "extraItems": [
                        {
                          "@class": "org.openl.generated.beans.TableRowsItems1",
                          "Description": "Female Lives",
                          "Total": {
                            "@class": "org.openl.generated.beans.Text",
                            "view": "Text",
                            "renderLabel": {
                              "@class": "org.openl.generated.beans.RenderLabel",
                              "name": "Double_5",
                              "decimals": 0
                            },
                            "children": {
                              "name": "Response.RatingDetails.Plans[0].FemaleLives"
                            }
                          }
                        },
                        {
                          "@class": "org.openl.generated.beans.TableRowsItems1",
                          "Description": "Male Lives",
                          "Total": {
                            "@class": "org.openl.generated.beans.Text",
                            "view": "Text",
                            "renderLabel": {
                              "@class": "org.openl.generated.beans.RenderLabel",
                              "name": "Double_5",
                              "decimals": 0
                            },
                            "children": {
                              "name": "Response.RatingDetails.Plans[0].MaleLives"
                            }
                          }
                        },
                        {
                          "@class": "org.openl.generated.beans.TableRowsItems1",
                          "Description": "Total Member Count",
                          "Total": {
                            "@class": "org.openl.generated.beans.Text",
                            "view": "Text",
                            "renderLabel": {
                              "@class": "org.openl.generated.beans.RenderLabel",
                              "name": "Double_5",
                              "decimals": 0
                            },
                            "children": {
                              "name": "Response.RatingDetails.Plans[0].TotalCensusCount"
                            }
                          }
                        },
                        {
                          "@class": "org.openl.generated.beans.TableRowsItems1",
                          "Description": "Female Proportion",
                          "Total": {
                            "@class": "org.openl.generated.beans.Text",
                            "view": "Text",
                            "renderLabel": {
                              "@class": "org.openl.generated.beans.RenderLabel",
                              "name": "Percent",
                              "decimals": 4
                            },
                            "children": {
                              "name": "Response.RatingDetails.Plans[0].PercentFemale"
                            }
                          }
                        },
                        {
                          "@class": "org.openl.generated.beans.TableRowsItems1",
                          "Description": "Male Proportion",
                          "Total": {
                            "@class": "org.openl.generated.beans.Text",
                            "view": "Text",
                            "renderLabel": {
                              "@class": "org.openl.generated.beans.RenderLabel",
                              "name": "Percent",
                              "decimals": 4
                            },
                            "children": {
                              "name": "Response.RatingDetails.Plans[0].PercentMale"
                            }
                          }
                        },
                        {
                          "@class": "org.openl.generated.beans.TableRowsItems1",
                          "Description": "Total Age",
                          "Total": {
                            "@class": "org.openl.generated.beans.Text",
                            "view": "Text",
                            "renderLabel": {
                              "@class": "org.openl.generated.beans.RenderLabel",
                              "name": "Double_5",
                              "decimals": 0
                            },
                            "children": {
                              "name": "Response.RatingDetails.Plans[0].TotalAge"
                            }
                          }
                        },
                        {
                          "@class": "org.openl.generated.beans.TableRowsItems1",
                          "Description": "Average Age",
                          "Total": {
                            "@class": "org.openl.generated.beans.Text",
                            "view": "Text",
                            "renderLabel": {
                              "@class": "org.openl.generated.beans.RenderLabel",
                              "name": "Double_5",
                              "decimals": 4
                            },
                            "children": {
                              "name": "Response.RatingDetails.Plans[0].AverageAge"
                            }
                          }
                        },
                        {
                          "@class": "org.openl.generated.beans.TableRowsItems1",
                          "Description": "Female Total Salary",
                          "Total": {
                            "@class": "org.openl.generated.beans.Text",
                            "view": "Text",
                            "renderLabel": {
                              "@class": "org.openl.generated.beans.RenderLabel",
                              "name": "Currency"
                            },
                            "children": {
                              "name": "Response.RatingDetails.Plans[0].FemaleSalary"
                            }
                          }
                        },
                        {
                          "@class": "org.openl.generated.beans.TableRowsItems1",
                          "Description": "Male Total Salary",
                          "Total": {
                            "@class": "org.openl.generated.beans.Text",
                            "view": "Text",
                            "renderLabel": {
                              "@class": "org.openl.generated.beans.RenderLabel",
                              "name": "Currency"
                            },
                            "children": {
                              "name": "Response.RatingDetails.Plans[0].MaleSalary"
                            }
                          }
                        },
                        {
                          "@class": "org.openl.generated.beans.TableRowsItems1",
                          "Description": "Average Salary",
                          "Total": {
                            "@class": "org.openl.generated.beans.Text",
                            "view": "Text",
                            "renderLabel": {
                              "@class": "org.openl.generated.beans.RenderLabel",
                              "name": "Currency"
                            },
                            "children": {
                              "name": "Response.RatingDetails.Plans[0].AverageSalary"
                            }
                          }
                        },
                        {
                          "@class": "org.openl.generated.beans.TableRowsItems1",
                          "Description": "Male Total Benefit",
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
                          "Description": "Female Total Benefit",
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
                          "Description": "Overall Total Benefit",
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
                        },
                        {
                          "@class": "org.openl.generated.beans.TableRowsItems1",
                          "Description": "Average Benefit",
                          "Total": {
                            "@class": "org.openl.generated.beans.Text",
                            "view": "Text",
                            "renderLabel": {
                              "@class": "org.openl.generated.beans.RenderLabel",
                              "name": "Currency"
                            },
                            "children": {
                              "name": "Response.RatingDetails.Plans[0].AverageBenefit"
                            }
                          }
                        }
                      ]
                    }
                  ],
                  "version": "TableLayout"
                },
                {
                  "@class": "org.openl.generated.beans.Layout",
                  "view": "VerticalLayout",
                  "styles": "padding-h-largest middle bg-neutral",
                  "relativeData": false,
                  "items": [
                    {
                      "@class": "org.openl.generated.beans.Text",
                      "view": "Text",
                      "label": "Member Distribution by Age Band",
                      "styles": "h6"
                    },
                    {
                      "@class": "org.openl.generated.beans.PieChart",
                      "view": "PieChart",
                      "name": "Response.RatingDetails.Plans[0].AgeBreakdown",
                      "mapItems": {
                        "label": "AgeBand",
                        "value": "NumberOfLives"
                      },
                      "legends": {}
                    }
                  ],
                  "version": "PieChartLayout"
                }
              ],
              "version": "PlanLayout"
            }
          ],
          "version": "PlansLayout"
        },
        {
          "@class": "org.openl.generated.beans.Element",
          "view": "Space"
        }
      ],
      "version": "RatingDetailsLayout"
    }
  ],
  "version": "0.19.1"
}
