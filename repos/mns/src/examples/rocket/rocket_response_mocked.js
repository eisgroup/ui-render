export default {
  "PolicyNumber": "Policy7",
  "RateEffectiveDate": "2023-10-13T00:00:00.000Z",
  "RequestDate": "2023-04-05T00:00:00.000Z",
  "SitusState": "NY",
  "RatingDetails": {
  "Plans": [
    {
      "PlanName": "Low",
      "Coverages": [
        {
          "CoverageCode": "Dental Coverage 1",
          "PlanCategory": "PPO",
          "PlanPaysByBenefitCategory": [
            {
              "Provider": "PPO Dentist",
              "Preventive": 1,
              "Basic": 0.72,
              "Major": 0.45,
              "Orthodontics": 0.45
            },
            {
              "Provider": "Premier Dentist",
              "Preventive": 1,
              "Basic": 0.72,
              "Major": 0.45,
              "Orthodontics": 0.45
            },
            {
              "Provider": "Non-Participating Dentist",
              "Preventive": 0.9,
              "Basic": 0.5,
              "Major": 0.4,
              "Orthodontics": 0.4
            }
          ],
          "Classes": [
            {
              "ClassName": "Class1",
              "RatesAndPremiumByTier": [
                {
                  "TierName": "Individual",
                  "NumberOfLives": 5,
                  "ManualRate": 46.83,
                  "MonthlyPremium": 234.15,
                  "AnnualPremium": 2809.8
                },
                {
                  "TierName": "Individual + Spouse",
                  "NumberOfLives": 4,
                  "ManualRate": 93.66,
                  "MonthlyPremium": 374.64,
                  "AnnualPremium": 4495.68
                },
                {
                  "TierName": "Individual + Child(ren)",
                  "NumberOfLives": 1,
                  "ManualRate": 107.6,
                  "MonthlyPremium": 107.6,
                  "AnnualPremium": 1291.2
                },
                {
                  "TierName": "Family",
                  "NumberOfLives": 4,
                  "ManualRate": 171.65,
                  "MonthlyPremium": 686.6,
                  "AnnualPremium": 8239.2
                }
              ]
            }
          ],
          "RatesAndPremiumByTierElement": [
            {
              "TierElement": "Individual",
              "ServiceTypeDetailsCalc": [
                {
                  "ServiceType": "Preventive",
                  "InAndOutOfNetwork": [
                    {
                      "NetworkType": "In Network",
                      "Deductible": 0.924,
                      "Coinsurance": 0.8,
                      "Maximum": 0.956
                    },
                    {
                      "NetworkType": "Out of Network",
                      "Deductible": 0.93,
                      "Coinsurance": 0.8,
                      "Maximum": 1.064
                    }
                  ],
                  "EmployeeAgeFactor": 1,
                  "AreaFactor": 0.647,
                  "UtilizationFactor": 0.647,
                  "SpouseFactor": 1,
                  "UtilizationAdjustment": 1,
                  "WaitingPeriodFactor": 1.053,
                  "ClaimCost": 52.12998648
                },
                {
                  "ServiceType": "Basic",
                  "InAndOutOfNetwork": [
                    {
                      "NetworkType": "In Network",
                      "Deductible": 0.952,
                      "Coinsurance": 0.5,
                      "Maximum": 0.956
                    },
                    {
                      "NetworkType": "Out of Network",
                      "Deductible": 0.958,
                      "Coinsurance": 0.5,
                      "Maximum": 1.064
                    }
                  ],
                  "EmployeeAgeFactor": 1,
                  "AreaFactor": 0.645,
                  "UtilizationFactor": 0.645,
                  "SpouseFactor": 1,
                  "UtilizationAdjustment": 1,
                  "WaitingPeriodFactor": 1.032,
                  "ClaimCost": 19.3558824
                },
                {
                  "ServiceType": "Major",
                  "InAndOutOfNetwork": [
                    {
                      "NetworkType": "In Network",
                      "Deductible": 0.952,
                      "Coinsurance": 0.5,
                      "Maximum": 0.956
                    },
                    {
                      "NetworkType": "Out of Network",
                      "Deductible": 0.958,
                      "Coinsurance": 0.5,
                      "Maximum": 1.064
                    }
                  ],
                  "EmployeeAgeFactor": 1,
                  "AreaFactor": 0.639,
                  "UtilizationFactor": 0.639,
                  "SpouseFactor": 1,
                  "UtilizationAdjustment": 1,
                  "WaitingPeriodFactor": 1,
                  "ClaimCost": 28.594109999999998
                }
              ],
              "ContributionFactor": 1.665,
              "SizeFactor": 0.838,
              "MorbidityFactor": 0.98,
              "DepAgeLimitFactor": 1,
              "ExclusionsFactor": 0.9,
              "ClaimCostWithoutAddCoverages": 68.56540565952001,
              "Orthodontics": 6.34,
              "AdditionalCoveragesClaimCostSum": 6.34,
              "ClaimCostWithAddCov": 72.87011356352001,
              "TierElementRate": 86.24
            },
            {
              "TierElement": "Spouse",
              "ServiceTypeDetailsCalc": [
                {
                  "ServiceType": "Preventive",
                  "InAndOutOfNetwork": [
                    {
                      "NetworkType": "In Network",
                      "Deductible": 0.924,
                      "Coinsurance": 0.8,
                      "Maximum": 0.956
                    },
                    {
                      "NetworkType": "Out of Network",
                      "Deductible": 0.93,
                      "Coinsurance": 0.8,
                      "Maximum": 1.064
                    }
                  ],
                  "EmployeeAgeFactor": 1,
                  "AreaFactor": 0.647,
                  "UtilizationFactor": 0.647,
                  "SpouseFactor": 0.98,
                  "UtilizationAdjustment": 0.98,
                  "WaitingPeriodFactor": 1.053,
                  "ClaimCost": 49.53633800169601
                },
                {
                  "ServiceType": "Basic",
                  "InAndOutOfNetwork": [
                    {
                      "NetworkType": "In Network",
                      "Deductible": 0.952,
                      "Coinsurance": 0.5,
                      "Maximum": 0.956
                    },
                    {
                      "NetworkType": "Out of Network",
                      "Deductible": 0.958,
                      "Coinsurance": 0.5,
                      "Maximum": 1.064
                    }
                  ],
                  "EmployeeAgeFactor": 1,
                  "AreaFactor": 0.645,
                  "UtilizationFactor": 0.645,
                  "SpouseFactor": 1.01,
                  "UtilizationAdjustment": 1.01,
                  "WaitingPeriodFactor": 1.032,
                  "ClaimCost": 18.369874050695999
                },
                {
                  "ServiceType": "Major",
                  "InAndOutOfNetwork": [
                    {
                      "NetworkType": "In Network",
                      "Deductible": 0.952,
                      "Coinsurance": 0.5,
                      "Maximum": 0.956
                    },
                    {
                      "NetworkType": "Out of Network",
                      "Deductible": 0.958,
                      "Coinsurance": 0.5,
                      "Maximum": 1.064
                    }
                  ],
                  "EmployeeAgeFactor": 1,
                  "AreaFactor": 0.639,
                  "UtilizationFactor": 0.639,
                  "SpouseFactor": 1.02,
                  "UtilizationAdjustment": 1.02,
                  "WaitingPeriodFactor": 1,
                  "ClaimCost": 29.744964600000004
                }
              ],
              "ContributionFactor": 1.665,
              "SizeFactor": 0.838,
              "MorbidityFactor": 0.98,
              "DepAgeLimitFactor": 1,
              "ExclusionsFactor": 0.9,
              "ClaimCostWithoutAddCoverages": 66.91624894697418,
              "Orthodontics": 6.324,
              "AdditionalCoveragesClaimCostSum": 6.324,
              "ClaimCostWithAddCov": 71.21024494697419,
              "TierElementRate": 84.29
            },
            {
              "TierElement": "Child",
              "ServiceTypeDetailsCalc": [
                {
                  "ServiceType": "Preventive",
                  "InAndOutOfNetwork": [
                    {
                      "NetworkType": "In Network",
                      "Coinsurance": 0.8,
                      "Maximum": 0.975
                    },
                    {
                      "NetworkType": "Out of Network",
                      "Coinsurance": 0.8,
                      "Maximum": 1.086
                    }
                  ],
                  "EmployeeAgeFactor": 1,
                  "AreaFactor": 0.647,
                  "UtilizationFactor": 0.647,
                  "SpouseFactor": 1,
                  "UtilizationAdjustment": 1,
                  "WaitingPeriodFactor": 1.053,
                  "ClaimCost": 50.729456802959997
                },
                {
                  "ServiceType": "Basic",
                  "InAndOutOfNetwork": [
                    {
                      "NetworkType": "In Network",
                      "Coinsurance": 0.5,
                      "Maximum": 0.975
                    },
                    {
                      "NetworkType": "Out of Network",
                      "Coinsurance": 0.5,
                      "Maximum": 1.086
                    }
                  ],
                  "EmployeeAgeFactor": 1,
                  "AreaFactor": 0.645,
                  "UtilizationFactor": 0.645,
                  "SpouseFactor": 1,
                  "UtilizationAdjustment": 1,
                  "WaitingPeriodFactor": 1.032,
                  "ClaimCost": 15.309056062799998
                },
                {
                  "ServiceType": "Major",
                  "InAndOutOfNetwork": [
                    {
                      "NetworkType": "In Network",
                      "Coinsurance": 0.5,
                      "Maximum": 0.975
                    },
                    {
                      "NetworkType": "Out of Network",
                      "Coinsurance": 0.5,
                      "Maximum": 1.086
                    }
                  ],
                  "EmployeeAgeFactor": 1,
                  "AreaFactor": 0.639,
                  "UtilizationFactor": 0.639,
                  "SpouseFactor": 1,
                  "UtilizationAdjustment": 1,
                  "WaitingPeriodFactor": 1,
                  "ClaimCost": 9.554692949999998
                }
              ],
              "ContributionFactor": 1.665,
              "SizeFactor": 0.838,
              "MorbidityFactor": 0.98,
              "DepAgeLimitFactor": 1.072,
              "ExclusionsFactor": 0.9,
              "ClaimCostWithoutAddCoverages": 55.678486594821929,
              "Orthodontics": 14.87,
              "AdditionalCoveragesClaimCostSum": 14.87,
              "ClaimCostWithAddCov": 65.77512789895313,
              "TierElementRate": 77.89
            }
          ]
        }
      ]
    },
    {
      "PlanName": "High",
      "Coverages": [
        {
          "CoverageCode": "Dental Coverage 1",
          "PlanCategory": "PPO",
          "PlanPaysByBenefitCategory": [
            {
              "Provider": "PPO Dentist",
              "Preventive": 1,
              "Basic": 0.8,
              "Major": 0.5,
              "Orthodontics": 0.5
            },
            {
              "Provider": "Premier Dentist",
              "Preventive": 1,
              "Basic": 0.8,
              "Major": 0.5,
              "Orthodontics": 0.5
            },
            {
              "Provider": "Non-Participating Dentist",
              "Preventive": 0.9,
              "Basic": 0.72,
              "Major": 0.45,
              "Orthodontics": 0.45
            }
          ],
          "Classes": [
            {
              "ClassName": "Class1",
              "RatesAndPremiumByTier": [
                {
                  "TierName": "Individual",
                  "NumberOfLives": 5,
                  "ManualRate": 50.63,
                  "MonthlyPremium": 253.15,
                  "AnnualPremium": 3037.8
                },
                {
                  "TierName": "Individual + Spouse",
                  "NumberOfLives": 4,
                  "ManualRate": 101.24,
                  "MonthlyPremium": 404.96,
                  "AnnualPremium": 4859.52
                },
                {
                  "TierName": "Individual + Child(ren)",
                  "NumberOfLives": 1,
                  "ManualRate": 113.41,
                  "MonthlyPremium": 113.41,
                  "AnnualPremium": 1360.92
                },
                {
                  "TierName": "Family",
                  "NumberOfLives": 4,
                  "ManualRate": 181.82,
                  "MonthlyPremium": 727.28,
                  "AnnualPremium": 8727.36
                }
              ]
            }
          ],
          "RatesAndPremiumByTierElement": [
            {
              "TierElement": "Individual",
              "ServiceTypeDetailsCalc": [
                {
                  "ServiceType": "Preventive",
                  "InAndOutOfNetwork": [
                    {
                      "NetworkType": "In Network",
                      "Deductible": 0.924,
                      "Coinsurance": 0.8,
                      "Maximum": 0.956
                    },
                    {
                      "NetworkType": "Out of Network",
                      "Deductible": 0.93,
                      "Coinsurance": 0.8,
                      "Maximum": 1.064
                    }
                  ],
                  "EmployeeAgeFactor": 1,
                  "AreaFactor": 0.647,
                  "UtilizationFactor": 0.647,
                  "SpouseFactor": 1,
                  "UtilizationAdjustment": 1,
                  "WaitingPeriodFactor": 1.053,
                  "ClaimCost": 52.12998648
                },
                {
                  "ServiceType": "Basic",
                  "InAndOutOfNetwork": [
                    {
                      "NetworkType": "In Network",
                      "Deductible": 0.952,
                      "Coinsurance": 0.5,
                      "Maximum": 0.956
                    },
                    {
                      "NetworkType": "Out of Network",
                      "Deductible": 0.958,
                      "Coinsurance": 0.5,
                      "Maximum": 1.064
                    }
                  ],
                  "EmployeeAgeFactor": 1,
                  "AreaFactor": 0.645,
                  "UtilizationFactor": 0.645,
                  "SpouseFactor": 1,
                  "UtilizationAdjustment": 1,
                  "WaitingPeriodFactor": 1.032,
                  "ClaimCost": 19.3558824
                },
                {
                  "ServiceType": "Major",
                  "InAndOutOfNetwork": [
                    {
                      "NetworkType": "In Network",
                      "Deductible": 0.952,
                      "Coinsurance": 0.5,
                      "Maximum": 0.956
                    },
                    {
                      "NetworkType": "Out of Network",
                      "Deductible": 0.958,
                      "Coinsurance": 0.5,
                      "Maximum": 1.064
                    }
                  ],
                  "EmployeeAgeFactor": 1,
                  "AreaFactor": 0.639,
                  "UtilizationFactor": 0.639,
                  "SpouseFactor": 1,
                  "UtilizationAdjustment": 1,
                  "WaitingPeriodFactor": 1,
                  "ClaimCost": 28.594109999999998
                }
              ],
              "ContributionFactor": 1.665,
              "SizeFactor": 0.838,
              "MorbidityFactor": 0.98,
              "DepAgeLimitFactor": 1,
              "ExclusionsFactor": 0.9,
              "ClaimCostWithoutAddCoverages": 68.56540565952001,
              "Orthodontics": 6.34,
              "AdditionalCoveragesClaimCostSum": 6.34,
              "ClaimCostWithAddCov": 72.87011356352001,
              "TierElementRate": 86.24
            },
            {
              "TierElement": "Spouse",
              "ServiceTypeDetailsCalc": [
                {
                  "ServiceType": "Preventive",
                  "InAndOutOfNetwork": [
                    {
                      "NetworkType": "In Network",
                      "Deductible": 0.924,
                      "Coinsurance": 0.8,
                      "Maximum": 0.956
                    },
                    {
                      "NetworkType": "Out of Network",
                      "Deductible": 0.93,
                      "Coinsurance": 0.8,
                      "Maximum": 1.064
                    }
                  ],
                  "EmployeeAgeFactor": 1,
                  "AreaFactor": 0.647,
                  "UtilizationFactor": 0.647,
                  "SpouseFactor": 0.98,
                  "UtilizationAdjustment": 0.98,
                  "WaitingPeriodFactor": 1.053,
                  "ClaimCost": 49.53633800169601
                },
                {
                  "ServiceType": "Basic",
                  "InAndOutOfNetwork": [
                    {
                      "NetworkType": "In Network",
                      "Deductible": 0.952,
                      "Coinsurance": 0.5,
                      "Maximum": 0.956
                    },
                    {
                      "NetworkType": "Out of Network",
                      "Deductible": 0.958,
                      "Coinsurance": 0.5,
                      "Maximum": 1.064
                    }
                  ],
                  "EmployeeAgeFactor": 1,
                  "AreaFactor": 0.645,
                  "UtilizationFactor": 0.645,
                  "SpouseFactor": 1.01,
                  "UtilizationAdjustment": 1.01,
                  "WaitingPeriodFactor": 1.032,
                  "ClaimCost": 18.369874050695999
                },
                {
                  "ServiceType": "Major",
                  "InAndOutOfNetwork": [
                    {
                      "NetworkType": "In Network",
                      "Deductible": 0.952,
                      "Coinsurance": 0.5,
                      "Maximum": 0.956
                    },
                    {
                      "NetworkType": "Out of Network",
                      "Deductible": 0.958,
                      "Coinsurance": 0.5,
                      "Maximum": 1.064
                    }
                  ],
                  "EmployeeAgeFactor": 1,
                  "AreaFactor": 0.639,
                  "UtilizationFactor": 0.639,
                  "SpouseFactor": 1.02,
                  "UtilizationAdjustment": 1.02,
                  "WaitingPeriodFactor": 1,
                  "ClaimCost": 29.744964600000004
                }
              ],
              "ContributionFactor": 1.665,
              "SizeFactor": 0.838,
              "MorbidityFactor": 0.98,
              "DepAgeLimitFactor": 1,
              "ExclusionsFactor": 0.9,
              "ClaimCostWithoutAddCoverages": 66.91624894697418,
              "Orthodontics": 6.324,
              "AdditionalCoveragesClaimCostSum": 6.324,
              "ClaimCostWithAddCov": 71.21024494697419,
              "TierElementRate": 84.29
            },
            {
              "TierElement": "Child",
              "ServiceTypeDetailsCalc": [
                {
                  "ServiceType": "Preventive",
                  "InAndOutOfNetwork": [
                    {
                      "NetworkType": "In Network",
                      "Coinsurance": 0.8,
                      "Maximum": 0.975
                    },
                    {
                      "NetworkType": "Out of Network",
                      "Coinsurance": 0.8,
                      "Maximum": 1.086
                    }
                  ],
                  "EmployeeAgeFactor": 1,
                  "AreaFactor": 0.647,
                  "UtilizationFactor": 0.647,
                  "SpouseFactor": 1,
                  "UtilizationAdjustment": 1,
                  "WaitingPeriodFactor": 1.053,
                  "ClaimCost": 50.729456802959997
                },
                {
                  "ServiceType": "Basic",
                  "InAndOutOfNetwork": [
                    {
                      "NetworkType": "In Network",
                      "Coinsurance": 0.5,
                      "Maximum": 0.975
                    },
                    {
                      "NetworkType": "Out of Network",
                      "Coinsurance": 0.5,
                      "Maximum": 1.086
                    }
                  ],
                  "EmployeeAgeFactor": 1,
                  "AreaFactor": 0.645,
                  "UtilizationFactor": 0.645,
                  "SpouseFactor": 1,
                  "UtilizationAdjustment": 1,
                  "WaitingPeriodFactor": 1.032,
                  "ClaimCost": 15.309056062799998
                },
                {
                  "ServiceType": "Major",
                  "InAndOutOfNetwork": [
                    {
                      "NetworkType": "In Network",
                      "Coinsurance": 0.5,
                      "Maximum": 0.975
                    },
                    {
                      "NetworkType": "Out of Network",
                      "Coinsurance": 0.5,
                      "Maximum": 1.086
                    }
                  ],
                  "EmployeeAgeFactor": 1,
                  "AreaFactor": 0.639,
                  "UtilizationFactor": 0.639,
                  "SpouseFactor": 1,
                  "UtilizationAdjustment": 1,
                  "WaitingPeriodFactor": 1,
                  "ClaimCost": 9.554692949999998
                }
              ],
              "ContributionFactor": 1.665,
              "SizeFactor": 0.838,
              "MorbidityFactor": 0.98,
              "DepAgeLimitFactor": 1.072,
              "ExclusionsFactor": 0.9,
              "ClaimCostWithoutAddCoverages": 55.678486594821929,
              "Orthodontics": 14.87,
              "AdditionalCoveragesClaimCostSum": 14.87,
              "ClaimCostWithAddCov": 65.77512789895313,
              "TierElementRate": 77.89
            }
          ]
        }
      ]
    }
  ],
    "PolicyFactors": {
    "IndustryFactor": 0.94,
      "RateGuaranteeFactor": 0.99,
      "StateFactor": 0.73,
      "PolicyFactor": 0.679
  }
},
  "UseExperienceRating": true,
  "ExperienceRatesCalc": {
  "showExperienceRating": true,
    "periodBasis": [
    {
      "periodBasisType": "Year"
    },
    {
      "periodBasisType": "Month"
    },
    {
      "periodBasisType": "Month"
    },
    {
      "periodBasisType": "Year"
    }
  ],
    "trendAssumption": 1.03,
    "credibility": 1,
    "dataKind": {
    "experiencePeriods": [
      {
        "periodName": "Current2021",
        "startDate": "2021-01-01",
        "endDate": "2021-12-31",
        "weight": 0.5,
        "numberOfMonths": 12
      },
      {
        "periodName": "1st Period",
        "startDate": "2020-01-01",
        "endDate": "2020-12-31",
        "weight": 0.3,
        "numberOfMonths": 12
      },
      {
        "periodName": "2nd Period",
        "startDate": "2019-01-01",
        "endDate": "2019-12-31",
        "weight": 0.2,
        "numberOfMonths": 12
      }
    ]
  },
  "ratesAndHistoricalInfo": [
    {
      "planName": "High",
      "historicalInformation": [
        {
          "periodName": "Current2021",
          "billedPremium": 60112,
          "exposure": 3572,
          "paidClaims": 40662,
          "fullyIncurredClaims": 44495.07771634615,
          "historicalInfoEntries": [
            {
              "planName": "High",
              "periodDate": "2021-01-01",
              "billedPremium": 40662,
              "exposure": 3572,
              "paidClaims": 60112
            }
          ]
        },
        {
          "periodName": "1st Period",
          "billedPremium": 61312,
          "exposure": 3572,
          "paidClaims": 40662,
          "fullyIncurredClaims": 40905.972,
          "historicalInfoEntries": [
            {
              "planName": "High",
              "periodDate": "2020-01-01",
              "billedPremium": 40662,
              "exposure": 3572,
              "paidClaims": 61312
            }
          ]
        },
        {
          "periodName": "2nd Period",
          "billedPremium": 29506,
          "exposure": 2461,
          "paidClaims": 20296,
          "fullyIncurredClaims": 20417.776,
          "historicalInfoEntries": [
            {
              "planName": "High",
              "periodDate": "2019-01-01",
              "billedPremium": 20296,
              "exposure": 2461,
              "paidClaims": 29506
            }
          ]
        }
      ],
      "rates": [
        {
          "tier": "Individual",
          "tierName": "Individual",
          "tierRates": [
            {
              "periodName": "Current2021",
              "rateValue": 21
            },
            {
              "periodName": "1st Period",
              "rateValue": 22
            },
            {
              "periodName": "2nd Period",
              "rateValue": 20.240000000000003
            }
          ]
        },
        {
          "tier": "IndividualAndSpouse",
          "tierName": "Individual + Spouse",
          "tierRates": [
            {
              "periodName": "Current2021",
              "rateValue": 31
            },
            {
              "periodName": "1st Period",
              "rateValue": 41
            },
            {
              "periodName": "2nd Period",
              "rateValue": 37.72
            }
          ]
        },
        {
          "tier": "IndividualAndChildren",
          "tierName": "Individual + Child(ren)",
          "tierRates": [
            {
              "periodName": "Current2021",
              "rateValue": 37
            },
            {
              "periodName": "1st Period",
              "rateValue": 44
            },
            {
              "periodName": "2nd Period",
              "rateValue": 40.480000000000007
            }
          ]
        },
        {
          "tier": "Family",
          "tierName": "Family",
          "tierRates": [
            {
              "periodName": "Current2021",
              "rateValue": 50
            },
            {
              "periodName": "1st Period",
              "rateValue": 70
            },
            {
              "periodName": "2nd Period",
              "rateValue": 64.4
            }
          ]
        }
      ]
    }
  ],
    "experienceResults": [
    {
      "planName": "High",
      "coverages": [
        {
          "coverageCode": "Dental Coverage 1",
          "experienceDetailsPerPeriod": [
            {
              "periodName": "Current2021",
              "startDate": "2021-01-01",
              "endDate": "2021-12-31",
              "numberOfMonths": 12,
              "coveredLives": 3572,
              "billedPremium": 60112,
              "paidClaims": 40662,
              "paidLossRatio": 0.6764373170082513,
              "fullyIncurredClaims": 44495.07771634615,
              "incurredLossRatio": 0.7402029164949786,
              "trendFactor": 1.0873569549863294,
              "trendedIncurredClaims": 48382.03221752623,
              "trendedIncurredLossRatio": 0.8048647893519803,
              "targetLossRatio": 0.5525,
              "experienceModificationFactor": 1.4567688495058467
            },
            {
              "periodName": "1st Period",
              "startDate": "2020-01-01",
              "endDate": "2020-12-31",
              "numberOfMonths": 12,
              "coveredLives": 3572,
              "billedPremium": 61312,
              "paidClaims": 40662,
              "paidLossRatio": 0.6631980688935282,
              "fullyIncurredClaims": 40905.972,
              "incurredLossRatio": 0.6671772573068894,
              "trendFactor": 1.1199776636359194,
              "trendedIncurredClaims": 45813.774949316336,
              "trendedIncurredLossRatio": 0.7472236258695906,
              "targetLossRatio": 0.5525,
              "experienceModificationFactor": 1.3524409518001639
            },
            {
              "periodName": "2nd Period",
              "startDate": "2019-01-01",
              "endDate": "2019-12-31",
              "numberOfMonths": 12,
              "coveredLives": 2461,
              "billedPremium": 29506,
              "paidClaims": 20296,
              "paidLossRatio": 0.6878600962516098,
              "fullyIncurredClaims": 20417.776,
              "incurredLossRatio": 0.6919872568291196,
              "trendFactor": 1.1535769935449969,
              "trendedIncurredClaims": 23553.476652955193,
              "trendedIncurredLossRatio": 0.7982605793043853,
              "targetLossRatio": 0.5525,
              "experienceModificationFactor": 1.4448155281527338
            }
          ],
          "experienceRatesPerTier": [
            {
              "tier": "Individual",
              "tierName": "Individual",
              "currentChargedRate": 21,
              "formulaRate": 30.07,
              "experienceAdjustmentPercent": 1.4319,
              "experienceRatesPerPeriod": [
                {
                  "periodName": "Current2021",
                  "experienceRate": 30.59214583962278,
                  "credibilityRate": 30.59214583962278,
                  "formulaRate": 15.29607291981139
                },
                {
                  "periodName": "1st Period",
                  "experienceRate": 29.753700939603605,
                  "credibilityRate": 29.753700939603605,
                  "formulaRate": 8.926110281881082
                },
                {
                  "periodName": "2nd Period",
                  "experienceRate": 29.243066289811336,
                  "credibilityRate": 29.243066289811336,
                  "formulaRate": 5.848613257962267
                }
              ]
            },
            {
              "tier": "IndividualAndSpouse",
              "tierName": "Individual + Spouse",
              "currentChargedRate": 31,
              "formulaRate": 50.11,
              "experienceAdjustmentPercent": 1.6165,
              "experienceRatesPerPeriod": [
                {
                  "periodName": "Current2021",
                  "experienceRate": 45.15983433468124,
                  "credibilityRate": 45.15983433468124,
                  "formulaRate": 22.57991716734062
                },
                {
                  "periodName": "1st Period",
                  "experienceRate": 55.45007902380672,
                  "credibilityRate": 55.45007902380672,
                  "formulaRate": 16.635023707142016
                },
                {
                  "periodName": "2nd Period",
                  "experienceRate": 54.49844172192112,
                  "credibilityRate": 54.49844172192112,
                  "formulaRate": 10.899688344384224
                }
              ]
            },
            {
              "tier": "IndividualAndChildren",
              "tierName": "Individual + Child(ren)",
              "currentChargedRate": 37,
              "formulaRate": 56.5,
              "experienceAdjustmentPercent": 1.527,
              "experienceRatesPerPeriod": [
                {
                  "periodName": "Current2021",
                  "experienceRate": 53.90044743171632,
                  "credibilityRate": 53.90044743171632,
                  "formulaRate": 26.95022371585816
                },
                {
                  "periodName": "1st Period",
                  "experienceRate": 59.50740187920721,
                  "credibilityRate": 59.50740187920721,
                  "formulaRate": 17.852220563762164
                },
                {
                  "periodName": "2nd Period",
                  "experienceRate": 58.48613257962267,
                  "credibilityRate": 58.48613257962267,
                  "formulaRate": 11.697226515924534
                }
              ]
            },
            {
              "tier": "Family",
              "tierName": "Family",
              "currentChargedRate": 50,
              "formulaRate": 83.43,
              "experienceAdjustmentPercent": 1.6686,
              "experienceRatesPerPeriod": [
                {
                  "periodName": "Current2021",
                  "experienceRate": 72.83844247529233,
                  "credibilityRate": 72.83844247529233,
                  "formulaRate": 36.41922123764616
                },
                {
                  "periodName": "1st Period",
                  "experienceRate": 94.67086662601148,
                  "credibilityRate": 94.67086662601148,
                  "formulaRate": 28.401259987803443
                },
                {
                  "periodName": "2nd Period",
                  "experienceRate": 93.04612001303606,
                  "credibilityRate": 93.04612001303606,
                  "formulaRate": 18.609224002607215
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "planName": "Low",
      "coverages": [
        {
          "coverageCode": "Dental Coverage 2",
          "experienceDetailsPerPeriod": [
            {
              "periodName": "Current2021",
              "startDate": "2021-01-01",
              "endDate": "2021-12-31",
              "numberOfMonths": 12,
              "coveredLives": 3472,
              "billedPremium": 60012,
              "paidClaims": 40562,
              "paidLossRatio": 0.62123456,
              "fullyIncurredClaims": 44395.07771634615,
              "incurredLossRatio": 0.73123456,
              "trendFactor": 1.07123456,
              "trendedIncurredClaims": 48282.03221752623,
              "trendedIncurredLossRatio": 0.8123456,
              "targetLossRatio": 0.5425,
              "experienceModificationFactor": 1.44123456
            },
            {
              "periodName": "1st Period",
              "startDate": "2020-01-01",
              "endDate": "2020-12-31",
              "numberOfMonths": 12,
              "coveredLives": 3472,
              "billedPremium": 61012,
              "paidClaims": 40562,
              "paidLossRatio": 0.65123456,
              "fullyIncurredClaims": 40805.972,
              "incurredLossRatio": 0.67123456,
              "trendFactor": 1.12123456,
              "trendedIncurredClaims": 45713.774949316336,
              "trendedIncurredLossRatio": 0.75123456,
              "targetLossRatio": 0.5425,
              "experienceModificationFactor": 1.34123456
            },
            {
              "periodName": "2nd Period",
              "startDate": "2019-01-01",
              "endDate": "2019-12-31",
              "numberOfMonths": 12,
              "coveredLives": 2361,
              "billedPremium": 29406,
              "paidClaims": 20196,
              "paidLossRatio": 0.689123456,
              "fullyIncurredClaims": 20317.776,
              "incurredLossRatio": 0.692123456,
              "trendFactor": 1.154123456,
              "trendedIncurredClaims": 23453.476652955193,
              "trendedIncurredLossRatio": 0.797123456,
              "targetLossRatio": 0.5425,
              "experienceModificationFactor": 1.445123456
            }
          ],
          "experienceRatesPerTier": [
            {
              "tier": "Individual",
              "tierName": "Individual",
              "currentChargedRate": 21,
              "formulaRate": 31.07,
              "experienceAdjustmentPercent": 1.4421,
              "experienceRatesPerPeriod": [
                {
                  "periodName": "Current2021",
                  "experienceRate": 31.59214583962278,
                  "credibilityRate": 31.59214583962278,
                  "formulaRate": 16.29607291981139
                },
                {
                  "periodName": "1st Period",
                  "experienceRate": 30.753700939603605,
                  "credibilityRate": 30.753700939603605,
                  "formulaRate": 9.926110281881082
                },
                {
                  "periodName": "2nd Period",
                  "experienceRate": 30.243066289811336,
                  "credibilityRate": 30.243066289811336,
                  "formulaRate": 5.948613257962267
                }
              ]
            },
            {
              "tier": "IndividualAndSpouse",
              "tierName": "Individual + Spouse",
              "currentChargedRate": 31,
              "formulaRate": 51.11,
              "experienceAdjustmentPercent": 1.6265,
              "experienceRatesPerPeriod": [
                {
                  "periodName": "Current2021",
                  "experienceRate": 46.15983433468124,
                  "credibilityRate": 46.15983433468124,
                  "formulaRate": 23.57991716734062
                },
                {
                  "periodName": "1st Period",
                  "experienceRate": 56.45007902380672,
                  "credibilityRate": 56.45007902380672,
                  "formulaRate": 17.635023707142016
                },
                {
                  "periodName": "2nd Period",
                  "experienceRate": 55.49844172192112,
                  "credibilityRate": 55.49844172192112,
                  "formulaRate": 11.899688344384224
                }
              ]
            },
            {
              "tier": "IndividualAndChildren",
              "tierName": "Individual + Child(ren)",
              "currentChargedRate": 38,
              "formulaRate": 56.7,
              "experienceAdjustmentPercent": 1.537,
              "experienceRatesPerPeriod": [
                {
                  "periodName": "Current2021",
                  "experienceRate": 54.90044743171632,
                  "credibilityRate": 54.90044743171632,
                  "formulaRate": 27.95022371585816
                },
                {
                  "periodName": "1st Period",
                  "experienceRate": 59.51740187920721,
                  "credibilityRate": 59.51740187920721,
                  "formulaRate": 18.852220563762164
                },
                {
                  "periodName": "2nd Period",
                  "experienceRate": 59.48613257962267,
                  "credibilityRate": 59.48613257962267,
                  "formulaRate": 12.697226515924534
                }
              ]
            },
            {
              "tier": "Family",
              "tierName": "Family",
              "currentChargedRate": 50,
              "formulaRate": 83.53,
              "experienceAdjustmentPercent": 1.6786,
              "experienceRatesPerPeriod": [
                {
                  "periodName": "Current2021",
                  "experienceRate": 73.83844247529233,
                  "credibilityRate": 73.83844247529233,
                  "formulaRate": 37.41922123764616
                },
                {
                  "periodName": "1st Period",
                  "experienceRate": 95.67086662601148,
                  "credibilityRate": 95.67086662601148,
                  "formulaRate": 29.401259987803443
                },
                {
                  "periodName": "2nd Period",
                  "experienceRate": 94.04612001303606,
                  "credibilityRate": 94.04612001303606,
                  "formulaRate": 19.609224002607215
                }
              ]
            }
          ]
        }
      ]
    }
  ]
},
  "UseRedistributionRates": false,
  "RedistributionRatesCalc": {
  "showRedistributionRating": false,
    "numberOfLives": 14,
    "manualMonthlyPremium": 4640.2,
    "formulaMonthlyPremium": 1537.82,
    "redistributionMode": [
    "Single",
    "Multi"
  ],
    "multiModeDistribution": [
    "Manual",
    "Target"
  ],
    "redistributionPlans": [
    {
      "planName": "High",
      "numberOfLives": 14,
      "manualMonthlyPremium": 4640.2,
      "formulaMonthlyPremium": 1537.82,
      "coverages": [
        {
          "coverageCode": "Dental Coverage 1",
          "redistributionType": [
            "Manual",
            "Target"
          ],
          "tierRates": [
            {
              "tier": "Individual",
              "totalNumberOfLives": 5,
              "manualRate": 50.63,
              "formulaRate": 30.07
            },
            {
              "tier": "IndividualAndSpouse",
              "totalNumberOfLives": 4,
              "manualRate": 101.24,
              "formulaRate": 50.11
            },
            {
              "tier": "IndividualAndChildren",
              "totalNumberOfLives": 1,
              "manualRate": 113.41,
              "formulaRate": 56.5
            },
            {
              "tier": "Family",
              "totalNumberOfLives": 4,
              "manualRate": 181.82,
              "formulaRate": 83.43
            }
          ],
          "classes": [
            {
              "className": "Class1",
              "numberOfLives": 14,
              "manualMonthlyPremium": 4640.2,
              "formulaMonthlyPremium": 1537.82,
              "tiersDetails": [
                {
                  "tier": "Individual",
                  "numberOfLives": 5,
                  "manualMonthlyPremium": 3037.8,
                  "formulaMonthlyPremium": 541.26
                },
                {
                  "tier": "IndividualAndSpouse",
                  "numberOfLives": 7,
                  "manualMonthlyPremium": 4859.52,
                  "formulaMonthlyPremium": 350.77
                },
                {
                  "tier": "IndividualAndChildren",
                  "numberOfLives": 7,
                  "manualMonthlyPremium": 1360.92,
                  "formulaMonthlyPremium": 395.5
                },
                {
                  "tier": "Family",
                  "numberOfLives": 3,
                  "manualMonthlyPremium": 8727.36,
                  "formulaMonthlyPremium": 250.29
                }
              ]
            }
          ]
        }
      ]
    }
  ]
},
  "Plans": [
  {
    "PlanName": "High",
    "Coverages": [
      {
        "CoverageCode": "Dental Coverage 1",
        "PlanCategory": "PPO",
        "RateBasis": "PerEmployeePerMonth",
        "RateFormat": "Composite",
        "Classes": [
          {
            "ClassName": "Class1",
            "ClassNumber": "1",
            "Tiers": [
              {
                "Tier": "Individual",
                "RateCard": {
                  "NumberOfLives": 5,
                  "ManualRate": 50.63,
                  "FormulaRate": 30.07
                },
                "RateCardPremium": {
                  "ManualMonthlyPremium": 1552.32,
                  "FormulaMonthlyPremium": 541.26,
                  "ManualAnnualPremium": 18627.84,
                  "FormulaAnnualPremium": 6495.12
                }
              },
              {
                "Tier": "IndividualAndSpouse",
                "RateCard": {
                  "NumberOfLives": 4,
                  "ManualRate": 101.24,
                  "FormulaRate": 50.11
                },
                "RateCardPremium": {
                  "ManualMonthlyPremium": 1193.71,
                  "FormulaMonthlyPremium": 350.77,
                  "ManualAnnualPremium": 14324.52,
                  "FormulaAnnualPremium": 4209.24
                }
              },
              {
                "Tier": "IndividualAndChildren",
                "RateCard": {
                  "NumberOfLives": 1,
                  "ManualRate": 113.41,
                  "FormulaRate": 56.5
                },
                "RateCardPremium": {
                  "ManualMonthlyPremium": 1148.91,
                  "FormulaMonthlyPremium": 395.5,
                  "ManualAnnualPremium": 13786.920000000002,
                  "FormulaAnnualPremium": 4746
                }
              },
              {
                "Tier": "Family",
                "RateCard": {
                  "NumberOfLives": 4,
                  "ManualRate": 181.82,
                  "FormulaRate": 83.43
                },
                "RateCardPremium": {
                  "ManualMonthlyPremium": 745.26,
                  "FormulaMonthlyPremium": 250.29,
                  "ManualAnnualPremium": 8943.119999999999,
                  "FormulaAnnualPremium": 3003.48
                }
              }
            ],
            "NumberOfLives": 14,
            "RateCardPremium": {
              "ManualMonthlyPremium": 4640.2,
              "FormulaMonthlyPremium": 1537.82,
              "ManualAnnualPremium": 55682.4,
              "FormulaAnnualPremium": 18453.84
            }
          }
        ],
        "NumberOfLives": 14,
        "RateCardPremium": {
          "ManualMonthlyPremium": 4640.2,
          "FormulaMonthlyPremium": 1537.82,
          "ManualAnnualPremium": 55682.4,
          "FormulaAnnualPremium": 18453.84
        }
      }
    ],
    "NumberOfLives": 14,
    "RateCardPremium": {
      "ManualMonthlyPremium": 4640.2,
      "FormulaMonthlyPremium": 1537.82,
      "ManualAnnualPremium": 55682.4,
      "FormulaAnnualPremium": 18453.84
    }
  }
],
  "NumberOfLives": 14,
  "RateCardPremium": {
  "ManualMonthlyPremium": 4640.2,
    "FormulaMonthlyPremium": 1537.82,
    "ManualAnnualPremium": 55682.4,
    "FormulaAnnualPremium": 18453.84
}
}