export default {
  "view": "VerticalLayout",
  "styles": "bg-info-light",
  "relativeData": false,
  "items": [
    {
      "@class": "org.openl.generated.beans.Layout",
      "view": "VerticalLayout",
      "styles": "bg-neutral padding-larger margin-top-larger",
      "items": [
        {
          "@class": "org.openl.generated.beans.Layout",
          "view": "VerticalLayout",
          "styles": "bg-neutral padding-larger margin-top-larger",
          "relativeData": false,
          "showIf": {
            "relativeData": false,
            "name": "request.policy.experienceData"
          },
          "items": [
            {
              "@class": "org.openl.generated.beans.Title",
              "view": "Title",
              "label": "Claims Experience",
              "styles": "padding-v-smaller"
            },
            {
              "@class": "org.openl.generated.beans.Input",
              "view": "Input",
              "name": "request.policy.experienceData.credibility",
              "label": "Credibility",
              "type": "number",
              "disabled": false
            },
            {
              "@class": "org.openl.generated.beans.Element",
              "view": "Space"
            },
            {
              "@class": "org.openl.generated.beans.Layout",
              "view": "HorizontalLayout",
              "styles": "bg-neutral padding-larger top margin-top-larger",
              "items": [
                {
                  "@class": "org.openl.generated.beans.Table",
                  "view": "Table",
                  "name": "request.policy.experienceData.ratesAndHistoricalInfo[0].historicalInformation",
                  "styles": "margin-v no-border",
                  "headers": [
                    {
                      "id": "periodName",
                      "label": "Period Name",
                      "classNameHeader": "padding-h-small text-align-left border-right",
                      "classNameCellWrap": "border-right"
                    },
                    {
                      "id": "startDate",
                      "label": "Start Date",
                      "classNameHeader": "padding-h-small text-align-left",
                      "renderCell": {
                        "@class": "org.openl.generated.beans.RenderCell",
                        "name": "Date"
                      }
                    },
                    {
                      "id": "endDate",
                      "label": "End Date",
                      "classNameHeader": "padding-h-small text-align-left",
                      "renderCell": {
                        "@class": "org.openl.generated.beans.RenderCell",
                        "name": "Date"
                      }
                    },
                    {
                      "id": "numberOfLives",
                      "label": "Number of Lives",
                      "classNameHeader": "padding-h-small text-align-left"
                    },
                    {
                      "id": "totalBenefit",
                      "label": "Total Benefit",
                      "classNameHeader": "padding-h-small text-align-left",
                      "renderCell": {
                        "@class": "org.openl.generated.beans.RenderCell",
                        "name": "Currency"
                      }
                    },
                    {
                      "id": "totalClaims",
                      "label": "Total Claims",
                      "classNameHeader": "padding-h-small text-align-left",
                      "renderCell": {
                        "@class": "org.openl.generated.beans.RenderCell",
                        "name": "Currency"
                      }
                    },
                    {
                      "id": "basicUnitRate",
                      "label": "Basic Unit Rate",
                      "classNameHeader": "padding-h-small text-align-left"
                    },
                    {
                      "id": "loading1",
                      "label": "Loading 1",
                      "classNameHeader": "padding-h-small text-align-left"
                    },
                    {
                      "id": "loading2",
                      "label": "Loading 2",
                      "classNameHeader": "padding-h-small text-align-left"
                    },
                    {
                      "id": "expectedClaims",
                      "label": "Expected Claims",
                      "classNameHeader": "padding-h-small text-align-left",
                      "renderCell": {
                        "@class": "org.openl.generated.beans.RenderCell",
                        "name": "Currency"
                      }
                    },
                    {
                      "id": "expectedClaimsPeriod",
                      "label": "Expected Claims (Period)",
                      "classNameHeader": "padding-h-small text-align-left",
                      "renderCell": {
                        "@class": "org.openl.generated.beans.RenderCell",
                        "name": "Currency"
                      }
                    }
                  ],
                  "vertical": true
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
                      "label": "Feature",
                      "styleHeader": {
                        "width": "300px"
                      }
                    },
                    {
                      "id": "Total",
                      "label": "Value",
                      "styleHeader": {
                        "width": "200px"
                      }
                    }
                  ],
                  "extraItems": [
                    {
                      "@class": "org.openl.generated.beans.TableRowsItems1",
                      "Description": "Actual Claims",
                      "Total": {
                        "@class": "org.openl.generated.beans.Text",
                        "view": "Text",
                        "renderLabel": {
                          "@class": "org.openl.generated.beans.RenderLabel",
                          "name": "Currency"
                        },
                        "children": {
                          "name": "request.policy.experienceData.actualClaims"
                        }
                      }
                    },
                    {
                      "@class": "org.openl.generated.beans.TableRowsItems1",
                      "Description": "Expected Claims",
                      "Total": {
                        "@class": "org.openl.generated.beans.Text",
                        "view": "Text",
                        "renderLabel": {
                          "@class": "org.openl.generated.beans.RenderLabel",
                          "name": "Currency"
                        },
                        "children": {
                          "name": "request.policy.experienceData.overallExpectedClaims"
                        }
                      }
                    },
                    {
                      "@class": "org.openl.generated.beans.TableRowsItems1",
                      "Description": "A/E",
                      "Total": {
                        "@class": "org.openl.generated.beans.Text",
                        "view": "Text",
                        "renderLabel": {
                          "@class": "org.openl.generated.beans.RenderLabel",
                          "name": "Double_5",
                          "decimals": 4
                        },
                        "children": {
                          "name": "request.policy.experienceData.ae"
                        }
                      }
                    },
                    {
                      "@class": "org.openl.generated.beans.TableRowsItems1",
                      "Description": "Claims Loading",
                      "Total": {
                        "@class": "org.openl.generated.beans.Text",
                        "view": "Text",
                        "renderLabel": {
                          "@class": "org.openl.generated.beans.RenderLabel",
                          "name": "Double_5",
                          "decimals": 4
                        },
                        "children": {
                          "name": "request.policy.experienceData.claimsLoading"
                        }
                      }
                    }
                  ]
                }
              ],
              "version": "ExperienceDetailsLayout"
            }
          ],
          "version": "ExperienceDataLayout"
        }
      ],
      "version": "NextLayout"
    }
  ],
  "version": "0.19.1"
}