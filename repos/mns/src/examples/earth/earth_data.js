export default {
  'Policy': {
    'PolicyID': 'P00005',
    'Quote': '',
    'Situs': 'TX',
    'GroupName': 'Test Group',
    'EffectiveDate': '2020-09-30T00:00:00.000Z',
    'CensusDate': '2019-09-30T00:00:00.000Z',
    'RequestDate': '2020-09-30T00:00:00.000Z',
    'BillCalculationDate': '2020-01-01T00:00:00.000Z',
    'SICCode': '2269',
    'SICCodeDescription': '',
    'Zip': '88595',
    'RateGuaranteePeriod': '3 Years',
    'CaseType': 'NewBusiness',
    'BusinessType': 'Domestic',
    'EAP': 'Not Included',
    'Everest': 'Not Included',
    'RateGuaranteeMonths': 12,
    'NumberOfEligibleLives': 9,
    'NumberOfExperienceExhibits': 4,
    'NumberOfManualInputClasses': 3,
    'ClosedRetireeAgingCalculation': 'Yes',
    'FirstTimeBuyer': 'No',
    'SaveCalculations': 'Yes',
    'Plans': [
      {
        'PlanName': 'Golden1',
        'CoveragesInput': [{
          'CoverageType': 'TermLife',
          'Quoting': 'Yes',
          'Commissions': {
            'Commissions': 'Percentage',
            'Percentage': 0.1,
            'FlatAmmount': 0,
            'SuppComp': 0.015
          }
        }, {
          'CoverageType': 'SpouseTermLife',
          'Quoting': 'Yes',
          'Commissions': {
            'Commissions': 'Percentage',
            'Percentage': 0.1,
            'FlatAmmount': 0,
            'SuppComp': 0.015
          }
        }, {
          'CoverageType': 'ChildTermLife',
          'Quoting': 'Yes',
          'Commissions': {
            'Commissions': 'Percentage',
            'Percentage': 0.1,
            'FlatAmmount': 0,
            'SuppComp': 0.015
          }
        }
        ],
        'Eligibility': {
          'Eligibility': [{
            'ClassNumber': 'Employees11',
            'EligibilityFreeForm': 'active employment with',
            'EligibilityWaitingPeriod': 'Date of Hire',
            'MinimumHoursPerWeek': 30,
            'NaturalCausesOnly': 'No',
            'Funding': 'Prospective',
            'SIC': '5961',
            'SIC Description': 'MailOrderHouses'
          }, {
            'ClassNumber': 'Managers11',
            'EligibilityFreeForm': 'active employment with',
            'EligibilityWaitingPeriod': 'Date of Hire',
            'MinimumHoursPerWeek': 30,
            'NaturalCausesOnly': 'No',
            'Funding': 'Prospective',
            'SIC': '5961',
            'SIC Description': 'MailOrderHouses'
          }
          ],
          'Rounding': [{
            'ClassNumber': 'Employees11',
            'RoundingRule': 'Multiply then Round',
            'RoundingOption': 'Up',
            'To': 1000,
            'AgeReductionTo': 1000,
            'MinimumBenefitApplyToAgeReductions': 'No'
          }, {
            'ClassNumber': 'Managers11',
            'RoundingRule': 'Multiply then Round',
            'RoundingOption': 'Up',
            'To': 1000,
            'AgeReductionTo': 1000,
            'MinimumBenefitApplyToAgeReductions': 'No'
          }
          ],
          'ContinuationOfCoverage': [{
            'ClassNumber': 'Employees11',
            'TemporaryLayoff': '1 Month',
            'LOA': '12 Months',
            'SabbaticalInjuryIllness': '12 months',
            'FMLAMilitaryLevel': '3 months'
          }, {
            'ClassNumber': 'Managers11',
            'TemporaryLayoff': '1 Month',
            'LOA': '12 Months',
            'SabbaticalInjuryIllness': '12 months',
            'FMLAMilitaryLevel': '3 months'
          }
          ]
        },
        'Coverages': [{
          'CoverageType': 'TermLife',
          'Classes': [{
            'ClassNumber': 'Employees11',
            'PlanDesign': {
              'Coverage': 'Yes',
              'ContributionType': 'Contributory',
              'ContributionBasis': 'Percent',
              'SponsorContributionAmt': 0,
              'ParticipantContributionPercent': 0.1,
              'BenefitSchedule': 'RangeValues',
              'BenefitMin': 140000,
              'BenefitMax': 10000,
              'BenefitSelection': 1.5,
              'FlatAmount': '',
              'VolumeType': 'Input',
              'AverageMultipleOfSalary': '',
              'AverageOfUnits': '',
              'AverageVolume': '',
              'ExpectedParticipation': '',
              'CensusType': 'Eligible',
              'AssumedParticipationPct': 1
            },
            'AgeReductions': {
              'AgeReductionSchedule': 'None',
              'ApplyAgeReductionsToInputVolume': 'No'
            },
            'GuaranteeIssue': {
              'Option': 'MultioleOfSalary',
              'DollarAmount': 500000,
              'MultioleOfSalary': '4x'
            },
            'DisabilityProvision': {
              'Provision': 'Premium Waiver',
              'ExtendedDeathBenefit': '',
              'DefinitionOfDisability': 'Any Occ',
              'EligibilityAge': 60,
              'TerminationAge': 65,
              'EliminationPeriod': '6 Months'
            },
            'AcceleratedDeathBenefit': {
              'Percent': 0.8,
              'Dollar': 500000,
              'Period': '12 months'
            },
            'Exclusions': {
              'WarExclusion': 'Waived',
              'SuicideExclusion': '24 months'
            },
            'Portability': {
              'Portability': 'Included',
              'TerminationAge': 75,
              'PortabilityMaximum': 10000,
              'PortabilityMinimum': 1000,
              'EOILevel': 10000,
              'DisabledsAllowedToPort': 'No'
            },
            'Conversion': {
              'Conversion': 'Yes'
            },
            'AdditionalFactor': {
              'AdditionalFactor': '1'
            },
            'InforceRates': {
              'BillingBasis': 'Per1000Benefit',
              'RateBasis': 'AgeBandedUniTobacco'
            }
          }, {
            'ClassNumber': 'Managers11',
            'PlanDesign': {
              'Coverage': 'Yes',
              'ContributionType': 'Contributory',
              'ContributionBasis': 'Percent',
              'SponsorContributionAmt': 0,
              'ParticipantContributionPercent': 0.1,
              'BenefitSchedule': 'RangeValues',
              'BenefitMin': 140000,
              'BenefitMax': 10000,
              'BenefitSelection': 1.5,
              'FlatAmount': '',
              'VolumeType': 'Input',
              'AverageMultipleOfSalary': '',
              'AverageOfUnits': '',
              'AverageVolume': '',
              'ExpectedParticipation': '',
              'CensusType': 'Eligible',
              'AssumedParticipationPct': 1
            },
            'AgeReductions': {
              'AgeReductionSchedule': 'None',
              'ApplyAgeReductionsToInputVolume': 'No'
            },
            'GuaranteeIssue': {
              'Option': 'MultioleOfSalary',
              'DollarAmount': 500000,
              'MultioleOfSalary': '4x'
            },
            'DisabilityProvision': {
              'Provision': 'Premium Waiver',
              'ExtendedDeathBenefit': '',
              'DefinitionOfDisability': 'Any Occ',
              'EligibilityAge': 60,
              'TerminationAge': 65,
              'EliminationPeriod': '6 Months'
            },
            'AcceleratedDeathBenefit': {
              'Percent': 0.8,
              'Dollar': 500000,
              'Period': '12 months'
            },
            'Exclusions': {
              'WarExclusion': 'Waived',
              'SuicideExclusion': '24 months'
            },
            'Portability': {
              'Portability': 'Included',
              'TerminationAge': 75,
              'PortabilityMaximum': 10000,
              'PortabilityMinimum': 1000,
              'EOILevel': 10000,
              'DisabledsAllowedToPort': 'No'
            },
            'Conversion': {
              'Conversion': 'Yes'
            },
            'AdditionalFactor': {
              'AdditionalFactor': '1'
            },
            'InforceRates': {
              'BillingBasis': 'Per1000Benefit',
              'RateBasis': 'AgeBandedUniTobacco'
            }
          }
          ]
        }, {
          'CoverageType': 'SpouseTermLife',
          'Classes': [{
            'ClassNumber': 'Employees11',
            'PlanDesign': {
              'Coverage': 'Yes',
              'ContributionType': 'Contributory',
              'ContributionBasis': 'Percent',
              'SponsorContributionAmt': 0,
              'ParticipantContributionPercent': 0.5,
              'BenefitSchedule': 'RangeValues',
              'BenefitMin': 110000,
              'BenefitMax': 20000,
              'BenefitSelection': 2,
              'FlatAmount': '',
              'VolumeType': 'Input',
              'AverageMultipleOfSalary': '',
              'AverageOfUnits': '',
              'AverageVolume': '',
              'ExpectedParticipation': '',
              'CensusType': 'Eligible',
              'AssumedParticipationPct': 1
            },
            'AgeReductions': {
              'AgeReductionSchedule': 'None',
              'ApplyAgeReductionsToInputVolume': 'No'
            },
            'GuaranteeIssue': {
              'Option': 'MultioleOfSalary',
              'DollarAmount': 500000,
              'MultioleOfSalary': '4x'
            },
            'DisabilityProvision': {
              'Provision': 'Premium Waiver',
              'ExtendedDeathBenefit': '',
              'DefinitionOfDisability': 'Any Occ',
              'EligibilityAge': 60,
              'TerminationAge': 65,
              'EliminationPeriod': '6 Months'
            },
            'AcceleratedDeathBenefit': {
              'Percent': 0.8,
              'Dollar': 500000,
              'Period': '12 months'
            },
            'Exclusions': {
              'WarExclusion': 'Waived',
              'SuicideExclusion': '24 months'
            },
            'Portability': {
              'Portability': 'Included',
              'TerminationAge': 80,
              'PortabilityMaximum': 10000,
              'PortabilityMinimum': 1000,
              'EOILevel': 10000,
              'DisabledsAllowedToPort': 'No'
            },
            'Conversion': {
              'Conversion': 'No'
            },
            'AdditionalFactor': {
              'AdditionalFactor': '1'
            },
            'InforceRates': {
              'BillingBasis': 'Per1000Benefit',
              'RateBasis': 'AgeBandedTobacco'
            }
          }, {
            'ClassNumber': 'Managers11',
            'PlanDesign': {
              'Coverage': 'Yes',
              'ContributionType': 'Contributory',
              'ContributionBasis': 'Percent',
              'SponsorContributionAmt': 0,
              'ParticipantContributionPercent': 0.5,
              'BenefitSchedule': 'RangeValues',
              'BenefitMin': 110000,
              'BenefitMax': 20000,
              'BenefitSelection': 2,
              'FlatAmount': '',
              'VolumeType': 'Input',
              'AverageMultipleOfSalary': '',
              'AverageOfUnits': '',
              'AverageVolume': '',
              'ExpectedParticipation': '',
              'CensusType': 'Eligible',
              'AssumedParticipationPct': 1
            },
            'AgeReductions': {
              'AgeReductionSchedule': 'None',
              'ApplyAgeReductionsToInputVolume': 'No'
            },
            'GuaranteeIssue': {
              'Option': 'MultioleOfSalary',
              'DollarAmount': 500000,
              'MultioleOfSalary': '4x'
            },
            'DisabilityProvision': {
              'Provision': 'Premium Waiver',
              'ExtendedDeathBenefit': '',
              'DefinitionOfDisability': 'Any Occ',
              'EligibilityAge': 60,
              'TerminationAge': 65,
              'EliminationPeriod': '6 Months'
            },
            'AcceleratedDeathBenefit': {
              'Percent': 0.8,
              'Dollar': 500000,
              'Period': '12 months'
            },
            'Exclusions': {
              'WarExclusion': 'Waived',
              'SuicideExclusion': '24 months'
            },
            'Portability': {
              'Portability': 'Included',
              'TerminationAge': 80,
              'PortabilityMaximum': 10000,
              'PortabilityMinimum': 1000,
              'EOILevel': 10000,
              'DisabledsAllowedToPort': 'No'
            },
            'Conversion': {
              'Conversion': 'No'
            },
            'AdditionalFactor': {
              'AdditionalFactor': '1'
            },
            'InforceRates': {
              'BillingBasis': 'Per1000Benefit',
              'RateBasis': 'AgeBandedTobacco'
            }
          }
          ]
        }, {
          'CoverageType': 'ChildTermLife',
          'Classes': [{
            'ClassNumber': 'Employees11',
            'PlanDesign': {
              'Coverage': 'Yes',
              'ContributionType': 'Contributory',
              'ContributionBasis': 'Percent',
              'SponsorContributionAmt': 0,
              'ParticipantContributionPercent': 0.45,
              'BenefitSchedule': 'RangeValues',
              'BenefitType': 'PercentageOfEmployeeAmount',
              'PercentageOfEmployeeAmount': 0.6,
              'FlatAmount': '',
              'VolumeType': 'Input',
              'AverageMultipleOfSalary': '',
              'AverageOfUnits': '',
              'AverageVolume': '',
              'ExpectedParticipation': '',
              'CensusType': 'Eligible',
              'AssumedParticipationPct': 1
            },
            'AgeReductions': {
              'AgeReductionSchedule': 'None',
              'ApplyAgeReductionsToInputVolume': 'No'
            },
            'GuaranteeIssue': {
              'Option': 'MultioleOfSalary',
              'DollarAmount': 500000,
              'MultioleOfSalary': '4x'
            },
            'DisabilityProvision': {
              'Provision': 'Premium Waiver',
              'ExtendedDeathBenefit': '',
              'DefinitionOfDisability': 'Any Occ',
              'EligibilityAge': 60,
              'TerminationAge': 65,
              'EliminationPeriod': '6 Months'
            },
            'AcceleratedDeathBenefit': {
              'Percent': 0.8,
              'Dollar': 500000,
              'Period': '12 months'
            },
            'Exclusions': {
              'WarExclusion': 'Waived',
              'SuicideExclusion': '24 months'
            },
            'Portability': {
              'Portability': 'Included',
              'TerminationAge': 18,
              'PortabilityMaximum': 10000,
              'PortabilityMinimum': 1000,
              'EOILevel': 10000,
              'DisabledsAllowedToPort': 'No'
            },
            'Conversion': {
              'Conversion': 'No'
            },
            'AdditionalFactor': {
              'AdditionalFactor': '1'
            },
            'InforceRates': {
              'BillingBasis': 'Per1000Benefit',
              'RateBasis': 'Composite'
            }
          }, {
            'ClassNumber': 'Managers11',
            'PlanDesign': {
              'Coverage': 'Yes',
              'ContributionType': 'Contributory',
              'ContributionBasis': 'Percent',
              'SponsorContributionAmt': 0,
              'ParticipantContributionPercent': 0.45,
              'BenefitSchedule': 'PercentageOfEmployeeAmount',
              'PercentageOfEmployeeAmount': 0.6,
              'FlatAmount': '',
              'VolumeType': 'Input',
              'AverageMultipleOfSalary': '',
              'AverageOfUnits': '',
              'AverageVolume': '',
              'ExpectedParticipation': '',
              'CensusType': 'Eligible',
              'AssumedParticipationPct': 1
            },
            'AgeReductions': {
              'AgeReductionSchedule': 'None',
              'ApplyAgeReductionsToInputVolume': 'No'
            },
            'GuaranteeIssue': {
              'Option': 'MultioleOfSalary',
              'DollarAmount': 500000,
              'MultioleOfSalary': '4x'
            },
            'AcceleratedDeathBenefit': {
              'Percent': 0.8,
              'Dollar': 500000,
              'Period': '12 months'
            },
            'Exclusions': {
              'WarExclusion': 'Waived',
              'SuicideExclusion': '24 months'
            },
            'Portability': {
              'Portability': 'Included',
              'TerminationAge': 18,
              'PortabilityMaximum': 10000,
              'PortabilityMinimum': 1000,
              'EOILevel': 10000,
              'DisabledsAllowedToPort': 'No'
            },
            'Conversion': {
              'Conversion': 'No'
            },
            'AdditionalFactor': {
              'AdditionalFactor': '1'
            },
            'InforceRates': {
              'BillingBasis': 'Per1000Benefit',
              'RateBasis': 'Composite'
            }
          }
          ]
        }
        ]
      }, {
        'PlanName': 'Silver1',
        'CoveragesInput': [{
          'CoverageType': 'TermLife',
          'Quoting': 'Yes',
          'Commissions': {
            'Commissions': 'Percentage',
            'Percentage': 0.1,
            'FlatAmmount': 0,
            'SuppComp': 0.015
          }
        }, {
          'CoverageType': 'SpouseTermLife',
          'Quoting': 'Yes',
          'Commissions': {
            'Commissions': 'Percentage',
            'Percentage': 0.1,
            'FlatAmmount': 0,
            'SuppComp': 0.015
          }
        }, {
          'CoverageType': 'ChildTermLife',
          'Quoting': 'Yes',
          'Commissions': {
            'Commissions': 'Percentage',
            'Percentage': 0.1,
            'FlatAmmount': 0,
            'SuppComp': 0.015
          }
        }, {
          'CoverageType': 'ADD',
          'Quoting': 'Yes',
          'Commissions': {
            'Commissions': 'Percentage',
            'Percentage': 0.1,
            'FlatAmmount': 0,
            'SuppComp': 0.015
          }
        }, {
          'CoverageType': 'DependentADD',
          'Quoting': 'Yes',
          'Commissions': {
            'Commissions': 'Percentage',
            'Percentage': 0.1,
            'FlatAmmount': 0,
            'SuppComp': 0.015
          }
        }
        ],
        'Eligibility': {
          'Eligibility': [{
            'ClassNumber': 'Employees12',
            'EligibilityFreeForm': 'active employment with',
            'EligibilityWaitingPeriod': 'Date of Hire',
            'MinimumHoursPerWeek': 30,
            'NaturalCausesOnly': 'No',
            'Funding': 'Prospective',
            'SIC': '5961',
            'SIC Description': 'MailOrderHouses'
          }, {
            'ClassNumber': 'Managers11',
            'EligibilityFreeForm': 'active employment with',
            'EligibilityWaitingPeriod': 'Date of Hire',
            'MinimumHoursPerWeek': 30,
            'NaturalCausesOnly': 'No',
            'Funding': 'Prospective',
            'SIC': '5961',
            'SIC Description': 'MailOrderHouses'
          }
          ],
          'Rounding': [{
            'ClassNumber': 'Employees12',
            'RoundingRule': 'Multiply then Round',
            'RoundingOption': 'Up',
            'To': 1000,
            'AgeReductionTo': 1000,
            'MinimumBenefitApplyToAgeReductions': 'No'
          }, {
            'ClassNumber': 'Managers11',
            'RoundingRule': 'Multiply then Round',
            'RoundingOption': 'Up',
            'To': 1000,
            'AgeReductionTo': 1000,
            'MinimumBenefitApplyToAgeReductions': 'No'
          }
          ],
          'ContinuationOfCoverage': [{
            'ClassNumber': 'Employees12',
            'TemporaryLayoff': '1 Month',
            'LOA': '12 Months',
            'SabbaticalInjuryIllness': '12 months',
            'FMLAMilitaryLevel': '3 months'
          }, {
            'ClassNumber': 'Managers11',
            'TemporaryLayoff': '1 Month',
            'LOA': '12 Months',
            'SabbaticalInjuryIllness': '12 months',
            'FMLAMilitaryLevel': '3 months'
          }
          ]
        },
        'Coverages': [{
          'CoverageType': 'TermLife',
          'Classes': [{
            'ClassNumber': 'Employees12',
            'PlanDesign': {
              'Coverage': 'Yes',
              'ContributionType': 'Contributory',
              'ContributionBasis': 'Percent',
              'SponsorContributionAmt': 0,
              'ParticipantContributionPercent': 0.5,
              'BenefitSchedule': 'SingleValue',
              'BenefitAmount': 95000,
              'FlatAmount': '',
              'VolumeType': 'Input',
              'AverageMultipleOfSalary': '',
              'AverageOfUnits': '',
              'AverageVolume': '',
              'ExpectedParticipation': '',
              'CensusType': 'Eligible',
              'AssumedParticipationPct': 0.5
            },
            'AgeReductions': {
              'AgeReductionSchedule': 'None',
              'ApplyAgeReductionsToInputVolume': 'No'
            },
            'GuaranteeIssue': {
              'Option': 'MultioleOfSalary',
              'DollarAmount': 500000,
              'MultioleOfSalary': '4x'
            },
            'DisabilityProvision': {
              'Provision': 'Premium Waiver',
              'ExtendedDeathBenefit': '',
              'DefinitionOfDisability': 'Any Occ',
              'EligibilityAge': 60,
              'TerminationAge': 65,
              'EliminationPeriod': '6 Months'
            },
            'AcceleratedDeathBenefit': {
              'Percent': 0.8,
              'Dollar': 500000,
              'Period': '12 months'
            },
            'Exclusions': {
              'WarExclusion': 'Waived',
              'SuicideExclusion': '24 months'
            },
            'Portability': {
              'Portability': 'Included',
              'TerminationAge': 73,
              'PortabilityMaximum': 10000,
              'PortabilityMinimum': 1000,
              'EOILevel': 10000,
              'DisabledsAllowedToPort': 'No'
            },
            'Conversion': {
              'Conversion': 'Yes'
            },
            'AdditionalFactor': {
              'AdditionalFactor': '1'
            },
            'InforceRates': {
              'BillingBasis': 'Per1000Benefit',
              'RateBasis': 'AgeBandedUniTobacco'
            }
          }, {
            'ClassNumber': 'Managers11',
            'PlanDesign': {
              'Coverage': 'Yes',
              'ContributionType': 'Contributory',
              'ContributionBasis': 'Percent',
              'SponsorContributionAmt': 0,
              'ParticipantContributionPercent': 0.5,
              'BenefitSchedule': 'SingleValue',
              'BenefitAmount': 95000,
              'FlatAmount': '',
              'VolumeType': 'Input',
              'AverageMultipleOfSalary': '',
              'AverageOfUnits': '',
              'AverageVolume': '',
              'ExpectedParticipation': '',
              'CensusType': 'Eligible',
              'AssumedParticipationPct': 0.5
            },
            'AgeReductions': {
              'AgeReductionSchedule': 'None',
              'ApplyAgeReductionsToInputVolume': 'No'
            },
            'GuaranteeIssue': {
              'Option': 'MultioleOfSalary',
              'DollarAmount': 500000,
              'MultioleOfSalary': '4x'
            },
            'DisabilityProvision': {
              'Provision': 'Premium Waiver',
              'ExtendedDeathBenefit': '',
              'DefinitionOfDisability': 'Any Occ',
              'EligibilityAge': 60,
              'TerminationAge': 65,
              'EliminationPeriod': '6 Months'
            },
            'AcceleratedDeathBenefit': {
              'Percent': 0.8,
              'Dollar': 500000,
              'Period': '12 months'
            },
            'Exclusions': {
              'WarExclusion': 'Waived',
              'SuicideExclusion': '24 months'
            },
            'Portability': {
              'Portability': 'Included',
              'TerminationAge': 73,
              'PortabilityMaximum': 10000,
              'PortabilityMinimum': 1000,
              'EOILevel': 10000,
              'DisabledsAllowedToPort': 'No'
            },
            'Conversion': {
              'Conversion': 'Yes'
            },
            'AdditionalFactor': {
              'AdditionalFactor': '1'
            },
            'InforceRates': {
              'BillingBasis': 'Per1000Benefit',
              'RateBasis': 'AgeBandedUniTobacco'
            }
          }
          ]
        }, {
          'CoverageType': 'SpouseTermLife',
          'Classes': [{
            'ClassNumber': 'Employees12',
            'PlanDesign': {
              'Coverage': 'Yes',
              'ContributionType': 'Voluntary',
              'ContributionBasis': 'Percent',
              'SponsorContributionAmt': 0,
              'ParticipantContributionPercent': 1,
              'BenefitSchedule': 'SingleValue',
              'BenefitAmount': 115000,
              'FlatAmount': '',
              'VolumeType': 'Input',
              'AverageMultipleOfSalary': '',
              'AverageOfUnits': '',
              'AverageVolume': '',
              'ExpectedParticipation': '',
              'CensusType': 'Eligible',
              'AssumedParticipationPct': 1
            },
            'AgeReductions': {
              'AgeReductionSchedule': 'None',
              'ApplyAgeReductionsToInputVolume': 'No'
            },
            'GuaranteeIssue': {
              'Option': 'MultioleOfSalary',
              'DollarAmount': 500000,
              'MultioleOfSalary': '4x'
            },
            'DisabilityProvision': {
              'Provision': 'Premium Waiver',
              'ExtendedDeathBenefit': '',
              'DefinitionOfDisability': 'Any Occ',
              'EligibilityAge': 60,
              'TerminationAge': 65,
              'EliminationPeriod': '6 Months'
            },
            'AcceleratedDeathBenefit': {
              'Percent': 0.8,
              'Dollar': 500000,
              'Period': '12 months'
            },
            'Exclusions': {
              'WarExclusion': 'Waived',
              'SuicideExclusion': '24 months'
            },
            'Portability': {
              'Portability': 'Included',
              'TerminationAge': 65,
              'PortabilityMaximum': 10000,
              'PortabilityMinimum': 1000,
              'EOILevel': 10000,
              'DisabledsAllowedToPort': 'No'
            },
            'Conversion': {
              'Conversion': 'Yes'
            },
            'AdditionalFactor': {
              'AdditionalFactor': '1'
            },
            'InforceRates': {
              'BillingBasis': 'Per1000Benefit',
              'RateBasis': 'AgeBandedTobacco'
            }
          }, {
            'ClassNumber': 'Managers11',
            'PlanDesign': {
              'Coverage': 'Yes',
              'ContributionType': 'Voluntary',
              'ContributionBasis': 'Percent',
              'SponsorContributionAmt': 0,
              'ParticipantContributionPercent': 1,
              'BenefitSchedule': 'SingleValue',
              'BenefitAmount': 115000,
              'FlatAmount': '',
              'VolumeType': 'Input',
              'AverageMultipleOfSalary': '',
              'AverageOfUnits': '',
              'AverageVolume': '',
              'ExpectedParticipation': '',
              'CensusType': 'Eligible',
              'AssumedParticipationPct': 1
            },
            'AgeReductions': {
              'AgeReductionSchedule': 'None',
              'ApplyAgeReductionsToInputVolume': 'No'
            },
            'GuaranteeIssue': {
              'Option': 'MultioleOfSalary',
              'DollarAmount': 500000,
              'MultioleOfSalary': '4x'
            },
            'DisabilityProvision': {
              'Provision': 'Premium Waiver',
              'ExtendedDeathBenefit': '',
              'DefinitionOfDisability': 'Any Occ',
              'EligibilityAge': 60,
              'TerminationAge': 65,
              'EliminationPeriod': '6 Months'
            },
            'AcceleratedDeathBenefit': {
              'Percent': 0.8,
              'Dollar': 500000,
              'Period': '12 months'
            },
            'Exclusions': {
              'WarExclusion': 'Waived',
              'SuicideExclusion': '24 months'
            },
            'Portability': {
              'Portability': 'Included',
              'TerminationAge': 65,
              'PortabilityMaximum': 10000,
              'PortabilityMinimum': 1000,
              'EOILevel': 10000,
              'DisabledsAllowedToPort': 'No'
            },
            'Conversion': {
              'Conversion': 'Yes'
            },
            'AdditionalFactor': {
              'AdditionalFactor': '1'
            },
            'InforceRates': {
              'BillingBasis': 'Per1000Benefit',
              'RateBasis': 'AgeBandedTobacco'
            }
          }
          ]
        }, {
          'CoverageType': 'ChildTermLife',
          'Classes': [{
            'ClassNumber': 'Employees12',
            'PlanDesign': {
              'Coverage': 'Yes',
              'ContributionType': 'Contributory',
              'ContributionBasis': 'Percent',
              'SponsorContributionAmt': 0,
              'ParticipantContributionPercent': 0.45,
              'BenefitSchedule': 'RangeValues',
              'BenefitType': 'PercentageOfEmployeeAmount',
              'PercentageOfEmployeeAmount': 0.7,
              'FlatAmount': '',
              'VolumeType': 'Input',
              'AverageMultipleOfSalary': '',
              'AverageOfUnits': '',
              'AverageVolume': '',
              'ExpectedParticipation': '',
              'CensusType': 'Eligible',
              'AssumedParticipationPct': 1
            },
            'AgeReductions': {
              'AgeReductionSchedule': 'None',
              'ApplyAgeReductionsToInputVolume': 'No'
            },
            'GuaranteeIssue': {
              'Option': 'MultioleOfSalary',
              'DollarAmount': 500000,
              'MultioleOfSalary': '4x'
            },
            'DisabilityProvision': {
              'Provision': 'Premium Waiver',
              'ExtendedDeathBenefit': '',
              'DefinitionOfDisability': 'Any Occ',
              'EligibilityAge': 60,
              'TerminationAge': 65,
              'EliminationPeriod': '6 Months'
            },
            'AcceleratedDeathBenefit': {
              'Percent': 0.8,
              'Dollar': 500000,
              'Period': '12 months'
            },
            'Exclusions': {
              'WarExclusion': 'Waived',
              'SuicideExclusion': '24 months'
            },
            'Portability': {
              'Portability': 'Included',
              'TerminationAge': 18,
              'PortabilityMaximum': 10000,
              'PortabilityMinimum': 1000,
              'EOILevel': 10000,
              'DisabledsAllowedToPort': 'No'
            },
            'Conversion': {
              'Conversion': 'No'
            },
            'AdditionalFactor': {
              'AdditionalFactor': '1'
            },
            'InforceRates': {
              'BillingBasis': 'Per1000Benefit',
              'RateBasis': 'Composite'
            }
          }, {
            'ClassNumber': 'Managers11',
            'PlanDesign': {
              'Coverage': 'Yes',
              'ContributionType': 'Contributory',
              'ContributionBasis': 'Percent',
              'SponsorContributionAmt': 0,
              'ParticipantContributionPercent': 0.45,
              'BenefitSchedule': 'PercentageOfEmployeeAmount',
              'PercentageOfEmployeeAmount': 0.7,
              'FlatAmount': '',
              'VolumeType': 'Input',
              'AverageMultipleOfSalary': '',
              'AverageOfUnits': '',
              'AverageVolume': '',
              'ExpectedParticipation': '',
              'CensusType': 'Eligible',
              'AssumedParticipationPct': 1
            },
            'AgeReductions': {
              'AgeReductionSchedule': 'None',
              'ApplyAgeReductionsToInputVolume': 'No'
            },
            'GuaranteeIssue': {
              'Option': 'MultioleOfSalary',
              'DollarAmount': 500000,
              'MultioleOfSalary': '4x'
            },
            'AcceleratedDeathBenefit': {
              'Percent': 0.8,
              'Dollar': 500000,
              'Period': '12 months'
            },
            'Exclusions': {
              'WarExclusion': 'Waived',
              'SuicideExclusion': '24 months'
            },
            'Portability': {
              'Portability': 'Included',
              'TerminationAge': 18,
              'PortabilityMaximum': 10000,
              'PortabilityMinimum': 1000,
              'EOILevel': 10000,
              'DisabledsAllowedToPort': 'No'
            },
            'Conversion': {
              'Conversion': 'No'
            },
            'AdditionalFactor': {
              'AdditionalFactor': '1'
            },
            'InforceRates': {
              'BillingBasis': 'Per1000Benefit',
              'RateBasis': 'Composite'
            }
          }
          ]
        }, {
          'CoverageType': 'ADD',
          'Classes': [{
            'ClassNumber': 'Employees12',
            'PlanDesign': {
              'Coverage': 'Yes',
              'EmployeeContribution': 1,
              'BenefitSchedule': 'Multyple of Salary',
              'BenefitSelection': '1x - 4x',
              'MaximumBenefit': 1000000,
              'CombinedMaximumADDEmployee': 1000000,
              'MinimumBenefit': 0,
              'FlatAmount': '',
              'VolumeType': 'Input - Grandfathered',
              'AverageMultipleOfSalary': '',
              'AverageOfUnits': '',
              'AverageVolume': '',
              'ExpectedParticipation': '',
              'EEOfFamilyVolume': '',
              'CensusType': 'Eligible',
              'AssumedParticipationPct': 0.5,
              'ContributionType': 'Voluntary',
              'ContributionBasis': 'Percent',
              'SponsorContributionAmt': 100,
              'ParticipantContributionPercent': 0
            },
            'AgeReductions': {
              'AgeReductionSchedule': 'None',
              'ApplyAgeReductionsToInputVolume': 'No'
            },
            'DisabilityProvision': {
              'Provision': 'Death Benefit Only',
              'ExtendedDeathBenefit': '12 months',
              'DefinitionOfDisability': '',
              'EligibilityAge': '',
              'TerminationAge': '',
              'EliminationPeriod': ''
            },
            'Exclusions': {
              'WarExclusion': 'Not Waived',
              'SuicideExclusion': 'Waived',
              'IntoxicationAndDrugAbuseExclusion': 'Waived'
            },
            'ADD': {
              'OccursWithin': '365 days',
              'Coverage': '24 Hour Coverage',
              'DismembermentParalysisAdditionalBenefits': 1
            },
            'Dismemberment': {
              'AccidentalDeath': 1,
              'LossOfLifeBenefit': 0.9,
              'LossOfBothHandsOrBothFeet': 1,
              'LossOfBothLegsOrBothArms': 0,
              'LossOfSightOfBothEyes': 1,
              'LossOfSpeech': 0.5,
              'LossOfHeringinBothEars': 0.5,
              'LossOfOneHandOrOneFoot': 0.5,
              'PartialLossOfThumb': 0,
              'TotalLossOgThumb': 0,
              'TotalLossOfForefinger': 0,
              'LossOfTwoPhalangesOfForefinger': 0,
              'LossOfThumbAndFingerOtherThanForefinger': 0,
              'LossOfTwoFingersOtherThanThumbAndForefinger': 0,
              'LossOfThreeFingersOtherThanThumbAndForefinger': 0,
              'LossOfFourFingersIncludingThumb': 0,
              'LossOfFourFingersExcludingThumb': 0,
              'LossOfMedianFinger': 0,
              'LossOfFingerOtherThanThumbForefingerAndMedian': 0,
              'LossOfUngulaPhalanxOfForefinger': 0,
              'LossOfThumbAndIndexFingerOfSameHand': 0.25,
              'TotalLossOfAllToes': 0,
              'LossOfFourToesIncludingBigToe': 0,
              'LossOfFourToes': 0,
              'LossOfBigToe': 0,
              'LossOfTwoToes': 0,
              'LossOfOneToeOtherThannTheBigToe': 0,
              'LossOfAllToesOnOneFoot': 0
            },
            'Plegia': {
              'Hemiplegia': 0.5,
              'Paraplegia': 0.5,
              'Quadriplegia': 1,
              'Triplegia': 0.75,
              'Uniplegia': 0.25
            },
            'Benefits': {
              'SeatBeltBenefit': {
                'SeatBeltBenefit': 'Percentage',
                'AppliesTo': 'All',
                'Amount': 1000,
                'Percent': 0.1
              },
              'CarjackingBenefit': {
                'CarjackingBenefit': 'Percentage',
                'AppliesTo': 'All',
                'Amount': 25000,
                'Percent': 0.1
              },
              'ChildTuitionBenefit': {
                'ChildTuitionBenefit': 'Percentage',
                'AppliesTo': 'EE, SP',
                'Amount': 5000,
                'Percent': 0.05,
                'LifeMaximum': 20000,
                'Years': 4
              },
              'CommonCarrierBenefit': {
                'CommonCarrierBenefit': 'Percentage',
                'AppliesTo': 'All',
                'Amount': 50000,
                'Percent': 1
              },
              'CommonDisasterBenefit': {
                'CommonDisasterBenefit': 'Percentage',
                'AppliesTo': 'EE, SP',
                'Amount': 50000,
                'Percent': 1
              },
              'CriticalBurnBenefit': {
                'CriticalBurnBenefit': 'Percentage',
                'AppliesTo': 'All',
                'Amount': 500,
                'Percent': 0.05
              },
              'HospitalConfinementBenefit': {
                'HospitalConfinementBenefit': 'Percentage',
                'AppliesTo': 'EE Only',
                'Amount': 10000,
                'Percent': 0.01,
                'ConfinementPeriod': 7,
                'Months': 12
              },
              'LineOfDutyBenefit': {
                'LineOfDutyBenefit': 'Percentage',
                'AppliesTo': 'EE Only',
                'Amount': 1000000,
                'Percent': 1
              },
              'MortgagePaymentBenefit': {
                'MortgagePaymentBenefit': 'Flat Amount',
                'AppliesTo': 'EE Only',
                'MonthlyAmount': 1000,
                'MaximumBenefitPeriod': 12
              },
              'OccupationalAccidentalDeath': {
                'OccupationalAccidentalDeath': 'Percentage',
                'AppliesTo': 'EE Only',
                'Percent': 1
              },
              'OccupationalHIVBenefit': {
                'OccupationalHIVBenefit': 'Percentage',
                'AppliesTo': 'EE Only',
                'Amount': 2000,
                'Percent': 1,
                'Months': 24
              },
              'OccupationalHepatitisBenefit': {
                'OccupationalHepatitisBenefit': 'Percentage',
                'AppliesTo': 'EE Only',
                'Amount': 2000,
                'Percent': 1,
                'Months': 24
              }
            },
            'Conversion': {
              'Conversion': 'Yes'
            },
            'InforceRates': {
              'BillingBasis': 'Per1000Benefit'
            }
          }, {
            'ClassNumber': 'Managers11',
            'PlanDesign': {
              'Coverage': 'Yes',
              'EmployeeContribution': 1,
              'BenefitSchedule': 'Multyple of Salary',
              'BenefitSelection': '1x - 4x',
              'MaximumBenefit': 1000000,
              'CombinedMaximumADDEmployee': 1000000,
              'MinimumBenefit': 0,
              'FlatAmount': '',
              'VolumeType': 'Input - Grandfathered',
              'AverageMultipleOfSalary': '',
              'AverageOfUnits': '',
              'AverageVolume': '',
              'ExpectedParticipation': '',
              'EEOfFamilyVolume': '',
              'CensusType': 'Eligible',
              'AssumedParticipationPct': 0.5,
              'ContributionType': 'Voluntary',
              'ContributionBasis': 'Percent',
              'SponsorContributionAmt': 100,
              'ParticipantContributionPercent': 0
            },
            'AgeReductions': {
              'AgeReductionSchedule': 'None',
              'ApplyAgeReductionsToInputVolume': 'No'
            },
            'DisabilityProvision': {
              'Provision': 'Death Benefit Only',
              'ExtendedDeathBenefit': '12 months',
              'DefinitionOfDisability': '',
              'EligibilityAge': '',
              'TerminationAge': '',
              'EliminationPeriod': ''
            },
            'Exclusions': {
              'WarExclusion': 'Not Waived',
              'SuicideExclusion': 'Waived',
              'IntoxicationAndDrugAbuseExclusion': 'Waived'
            },
            'ADD': {
              'OccursWithin': '365 days',
              'Coverage': '24 Hour Coverage',
              'DismembermentParalysisAdditionalBenefits': 1
            },
            'Dismemberment': {
              'AccidentalDeath': 1,
              'LossOfLifeBenefit': 0.9,
              'LossOfBothHandsOrBothFeet': 1,
              'LossOfBothLegsOrBothArms': 0,
              'LossOfSightOfBothEyes': 1,
              'LossOfSpeech': 0.5,
              'LossOfHeringinBothEars': 0.5,
              'LossOfOneHandOrOneFoot': 0.5,
              'PartialLossOfThumb': 0,
              'TotalLossOgThumb': 0,
              'TotalLossOfForefinger': 0,
              'LossOfTwoPhalangesOfForefinger': 0,
              'LossOfThumbAndFingerOtherThanForefinger': 0,
              'LossOfTwoFingersOtherThanThumbAndForefinger': 0,
              'LossOfThreeFingersOtherThanThumbAndForefinger': 0,
              'LossOfFourFingersIncludingThumb': 0,
              'LossOfFourFingersExcludingThumb': 0,
              'LossOfMedianFinger': 0,
              'LossOfFingerOtherThanThumbForefingerAndMedian': 0,
              'LossOfUngulaPhalanxOfForefinger': 0,
              'LossOfThumbAndIndexFingerOfSameHand': 0.25,
              'TotalLossOfAllToes': 0,
              'LossOfFourToesIncludingBigToe': 0,
              'LossOfFourToes': 0,
              'LossOfBigToe': 0,
              'LossOfTwoToes': 0,
              'LossOfOneToeOtherThannTheBigToe': 0,
              'LossOfAllToesOnOneFoot': 0
            },
            'Plegia': {
              'Hemiplegia': 0.5,
              'Paraplegia': 0.5,
              'Quadriplegia': 1,
              'Triplegia': 0.75,
              'Uniplegia': 0.25
            },
            'Benefits': {
              'SeatBeltBenefit': {
                'SeatBeltBenefit': 'Percentage',
                'AppliesTo': 'All',
                'Amount': 1000,
                'Percent': 0.1
              },
              'CarjackingBenefit': {
                'CarjackingBenefit': 'Percentage',
                'AppliesTo': 'All',
                'Amount': 25000,
                'Percent': 0.1
              },
              'ChildTuitionBenefit': {
                'ChildTuitionBenefit': 'Percentage',
                'AppliesTo': 'EE, SP',
                'Amount': 5000,
                'Percent': 0.05,
                'LifeMaximum': 20000,
                'Years': 4
              },
              'CommonCarrierBenefit': {
                'CommonCarrierBenefit': 'Percentage',
                'AppliesTo': 'All',
                'Amount': 50000,
                'Percent': 1
              },
              'CommonDisasterBenefit': {
                'CommonDisasterBenefit': 'Percentage',
                'AppliesTo': 'EE, SP',
                'Amount': 50000,
                'Percent': 1
              },
              'CriticalBurnBenefit': {
                'CriticalBurnBenefit': 'Percentage',
                'AppliesTo': 'All',
                'Amount': 500,
                'Percent': 0.05
              },
              'HospitalConfinementBenefit': {
                'HospitalConfinementBenefit': 'Percentage',
                'AppliesTo': 'EE Only',
                'Amount': 10000,
                'Percent': 0.01,
                'ConfinementPeriod': 7,
                'Months': 12
              },
              'LineOfDutyBenefit': {
                'LineOfDutyBenefit': 'Percentage',
                'AppliesTo': 'EE Only',
                'Amount': 1000000,
                'Percent': 1
              },
              'MortgagePaymentBenefit': {
                'MortgagePaymentBenefit': 'Flat Amount',
                'AppliesTo': 'EE Only',
                'MonthlyAmount': 1000,
                'MaximumBenefitPeriod': 12
              },
              'OccupationalAccidentalDeath': {
                'OccupationalAccidentalDeath': 'Percentage',
                'AppliesTo': 'EE Only',
                'Percent': 1
              },
              'OccupationalHIVBenefit': {
                'OccupationalHIVBenefit': 'Percentage',
                'AppliesTo': 'EE Only',
                'Amount': 2000,
                'Percent': 1,
                'Months': 24
              },
              'OccupationalHepatitisBenefit': {
                'OccupationalHepatitisBenefit': 'Percentage',
                'AppliesTo': 'EE Only',
                'Amount': 2000,
                'Percent': 1,
                'Months': 24
              }
            },
            'Conversion': {
              'Conversion': 'Yes'
            },
            'InforceRates': {
              'BillingBasis': 'Per1000Benefit'
            }
          }
          ]
        }, {
          'CoverageType': 'DependentADDADD',
          'Classes': [{
            'ClassNumber': 'Employees12',
            'PlanDesign': {
              'Coverage': 'Yes',
              'EmployeeContribution': 1,
              'BenefitSchedule': 'Multyple of Salary',
              'BenefitSelection': '1x - 4x',
              'MaximumBenefit': 1000000,
              'CombinedMaximumADDEmployee': 1000000,
              'MinimumBenefit': 0,
              'FlatAmount': '',
              'VolumeType': 'Input - Grandfathered',
              'AverageMultipleOfSalary': '',
              'AverageOfUnits': '',
              'AverageVolume': '',
              'ExpectedParticipation': '',
              'EEOfFamilyVolume': '',
              'CensusType': 'Eligible',
              'AssumedParticipationPct': 0.5,
              'ContributionType': 'Voluntary',
              'ContributionBasis': 'Percent',
              'SponsorContributionAmt': 100,
              'ParticipantContributionPercent': 0
            },
            'AgeReductions': {
              'AgeReductionSchedule': 'None',
              'ApplyAgeReductionsToInputVolume': 'No'
            },
            'DisabilityProvision': {
              'Provision': 'Death Benefit Only',
              'ExtendedDeathBenefit': '12 months',
              'DefinitionOfDisability': '',
              'EligibilityAge': '',
              'TerminationAge': '',
              'EliminationPeriod': ''
            },
            'Exclusions': {
              'WarExclusion': 'Not Waived',
              'SuicideExclusion': 'Waived',
              'IntoxicationAndDrugAbuseExclusion': 'Waived'
            },
            'ADD': {
              'OccursWithin': '365 days',
              'Coverage': '24 Hour Coverage',
              'DismembermentParalysisAdditionalBenefits': 1
            },
            'Dismemberment': {
              'AccidentalDeath': 1,
              'LossOfLifeBenefit': 0.9,
              'LossOfBothHandsOrBothFeet': 1,
              'LossOfBothLegsOrBothArms': 0,
              'LossOfSightOfBothEyes': 1,
              'LossOfSpeech': 0.5,
              'LossOfHeringinBothEars': 0.5,
              'LossOfOneHandOrOneFoot': 0.5,
              'PartialLossOfThumb': 0,
              'TotalLossOgThumb': 0,
              'TotalLossOfForefinger': 0,
              'LossOfTwoPhalangesOfForefinger': 0,
              'LossOfThumbAndFingerOtherThanForefinger': 0,
              'LossOfTwoFingersOtherThanThumbAndForefinger': 0,
              'LossOfThreeFingersOtherThanThumbAndForefinger': 0,
              'LossOfFourFingersIncludingThumb': 0,
              'LossOfFourFingersExcludingThumb': 0,
              'LossOfMedianFinger': 0,
              'LossOfFingerOtherThanThumbForefingerAndMedian': 0,
              'LossOfUngulaPhalanxOfForefinger': 0,
              'LossOfThumbAndIndexFingerOfSameHand': 0.25,
              'TotalLossOfAllToes': 0,
              'LossOfFourToesIncludingBigToe': 0,
              'LossOfFourToes': 0,
              'LossOfBigToe': 0,
              'LossOfTwoToes': 0,
              'LossOfOneToeOtherThannTheBigToe': 0,
              'LossOfAllToesOnOneFoot': 0
            },
            'Plegia': {
              'Hemiplegia': 0.5,
              'Paraplegia': 0.5,
              'Quadriplegia': 1,
              'Triplegia': 0.75,
              'Uniplegia': 0.25
            },
            'Benefits': {
              'SeatBeltBenefit': {
                'SeatBeltBenefit': 'Percentage',
                'AppliesTo': 'All',
                'Amount': 1000,
                'Percent': 0.1
              },
              'CarjackingBenefit': {
                'CarjackingBenefit': 'Percentage',
                'AppliesTo': 'All',
                'Amount': 25000,
                'Percent': 0.1
              },
              'ChildTuitionBenefit': {
                'ChildTuitionBenefit': 'Percentage',
                'AppliesTo': 'EE, SP',
                'Amount': 5000,
                'Percent': 0.05,
                'LifeMaximum': 20000,
                'Years': 4
              },
              'CommonCarrierBenefit': {
                'CommonCarrierBenefit': 'Percentage',
                'AppliesTo': 'All',
                'Amount': 50000,
                'Percent': 1
              },
              'CommonDisasterBenefit': {
                'CommonDisasterBenefit': 'Percentage',
                'AppliesTo': 'EE, SP',
                'Amount': 50000,
                'Percent': 1
              },
              'CriticalBurnBenefit': {
                'CriticalBurnBenefit': 'Percentage',
                'AppliesTo': 'All',
                'Amount': 500,
                'Percent': 0.05
              },
              'HospitalConfinementBenefit': {
                'HospitalConfinementBenefit': 'Percentage',
                'AppliesTo': 'EE Only',
                'Amount': 10000,
                'Percent': 0.01,
                'ConfinementPeriod': 7,
                'Months': 12
              },
              'LineOfDutyBenefit': {
                'LineOfDutyBenefit': 'Percentage',
                'AppliesTo': 'EE Only',
                'Amount': 1000000,
                'Percent': 1
              },
              'MortgagePaymentBenefit': {
                'MortgagePaymentBenefit': 'Flat Amount',
                'AppliesTo': 'EE Only',
                'MonthlyAmount': 1000,
                'MaximumBenefitPeriod': 12
              },
              'OccupationalAccidentalDeath': {
                'OccupationalAccidentalDeath': 'Percentage',
                'AppliesTo': 'EE Only',
                'Percent': 1
              },
              'OccupationalHIVBenefit': {
                'OccupationalHIVBenefit': 'Percentage',
                'AppliesTo': 'EE Only',
                'Amount': 2000,
                'Percent': 1,
                'Months': 24
              },
              'OccupationalHepatitisBenefit': {
                'OccupationalHepatitisBenefit': 'Percentage',
                'AppliesTo': 'EE Only',
                'Amount': 2000,
                'Percent': 1,
                'Months': 24
              }
            },
            'Conversion': {
              'Conversion': 'Yes'
            },
            'InforceRates': {
              'BillingBasis': 'Per1000Benefit'
            }
          }, {
            'ClassNumber': 'Managers11',
            'PlanDesign': {
              'Coverage': 'Yes',
              'EmployeeContribution': 1,
              'BenefitSchedule': 'Multyple of Salary',
              'BenefitSelection': '1x - 4x',
              'MaximumBenefit': 1000000,
              'CombinedMaximumADDEmployee': 1000000,
              'MinimumBenefit': 0,
              'FlatAmount': '',
              'VolumeType': 'Input - Grandfathered',
              'AverageMultipleOfSalary': '',
              'AverageOfUnits': '',
              'AverageVolume': '',
              'ExpectedParticipation': '',
              'EEOfFamilyVolume': '',
              'CensusType': 'Eligible',
              'AssumedParticipationPct': 0.5,
              'ContributionType': 'Voluntary',
              'ContributionBasis': 'Percent',
              'SponsorContributionAmt': 100,
              'ParticipantContributionPercent': 0
            },
            'AgeReductions': {
              'AgeReductionSchedule': 'None',
              'ApplyAgeReductionsToInputVolume': 'No'
            },
            'DisabilityProvision': {
              'Provision': 'Death Benefit Only',
              'ExtendedDeathBenefit': '12 months',
              'DefinitionOfDisability': '',
              'EligibilityAge': '',
              'TerminationAge': '',
              'EliminationPeriod': ''
            },
            'Exclusions': {
              'WarExclusion': 'Not Waived',
              'SuicideExclusion': 'Waived',
              'IntoxicationAndDrugAbuseExclusion': 'Waived'
            },
            'ADD': {
              'OccursWithin': '365 days',
              'Coverage': '24 Hour Coverage',
              'DismembermentParalysisAdditionalBenefits': 1
            },
            'Dismemberment': {
              'AccidentalDeath': 1,
              'LossOfLifeBenefit': 0.9,
              'LossOfBothHandsOrBothFeet': 1,
              'LossOfBothLegsOrBothArms': 0,
              'LossOfSightOfBothEyes': 1,
              'LossOfSpeech': 0.5,
              'LossOfHeringinBothEars': 0.5,
              'LossOfOneHandOrOneFoot': 0.5,
              'PartialLossOfThumb': 0,
              'TotalLossOgThumb': 0,
              'TotalLossOfForefinger': 0,
              'LossOfTwoPhalangesOfForefinger': 0,
              'LossOfThumbAndFingerOtherThanForefinger': 0,
              'LossOfTwoFingersOtherThanThumbAndForefinger': 0,
              'LossOfThreeFingersOtherThanThumbAndForefinger': 0,
              'LossOfFourFingersIncludingThumb': 0,
              'LossOfFourFingersExcludingThumb': 0,
              'LossOfMedianFinger': 0,
              'LossOfFingerOtherThanThumbForefingerAndMedian': 0,
              'LossOfUngulaPhalanxOfForefinger': 0,
              'LossOfThumbAndIndexFingerOfSameHand': 0.25,
              'TotalLossOfAllToes': 0,
              'LossOfFourToesIncludingBigToe': 0,
              'LossOfFourToes': 0,
              'LossOfBigToe': 0,
              'LossOfTwoToes': 0,
              'LossOfOneToeOtherThannTheBigToe': 0,
              'LossOfAllToesOnOneFoot': 0
            },
            'Plegia': {
              'Hemiplegia': 0.5,
              'Paraplegia': 0.5,
              'Quadriplegia': 1,
              'Triplegia': 0.75,
              'Uniplegia': 0.25
            },
            'Benefits': {
              'SeatBeltBenefit': {
                'SeatBeltBenefit': 'Percentage',
                'AppliesTo': 'All',
                'Amount': 1000,
                'Percent': 0.1
              },
              'CarjackingBenefit': {
                'CarjackingBenefit': 'Percentage',
                'AppliesTo': 'All',
                'Amount': 25000,
                'Percent': 0.1
              },
              'ChildTuitionBenefit': {
                'ChildTuitionBenefit': 'Percentage',
                'AppliesTo': 'EE, SP',
                'Amount': 5000,
                'Percent': 0.05,
                'LifeMaximum': 20000,
                'Years': 4
              },
              'CommonCarrierBenefit': {
                'CommonCarrierBenefit': 'Percentage',
                'AppliesTo': 'All',
                'Amount': 50000,
                'Percent': 1
              },
              'CommonDisasterBenefit': {
                'CommonDisasterBenefit': 'Percentage',
                'AppliesTo': 'EE, SP',
                'Amount': 50000,
                'Percent': 1
              },
              'CriticalBurnBenefit': {
                'CriticalBurnBenefit': 'Percentage',
                'AppliesTo': 'All',
                'Amount': 500,
                'Percent': 0.05
              },
              'HospitalConfinementBenefit': {
                'HospitalConfinementBenefit': 'Percentage',
                'AppliesTo': 'EE Only',
                'Amount': 10000,
                'Percent': 0.01,
                'ConfinementPeriod': 7,
                'Months': 12
              },
              'LineOfDutyBenefit': {
                'LineOfDutyBenefit': 'Percentage',
                'AppliesTo': 'EE Only',
                'Amount': 1000000,
                'Percent': 1
              },
              'MortgagePaymentBenefit': {
                'MortgagePaymentBenefit': 'Flat Amount',
                'AppliesTo': 'EE Only',
                'MonthlyAmount': 1000,
                'MaximumBenefitPeriod': 12
              },
              'OccupationalAccidentalDeath': {
                'OccupationalAccidentalDeath': 'Percentage',
                'AppliesTo': 'EE Only',
                'Percent': 1
              },
              'OccupationalHIVBenefit': {
                'OccupationalHIVBenefit': 'Percentage',
                'AppliesTo': 'EE Only',
                'Amount': 2000,
                'Percent': 1,
                'Months': 24
              },
              'OccupationalHepatitisBenefit': {
                'OccupationalHepatitisBenefit': 'Percentage',
                'AppliesTo': 'EE Only',
                'Amount': 2000,
                'Percent': 1,
                'Months': 24
              }
            },
            'Conversion': {
              'Conversion': 'Yes'
            },
            'InforceRates': {
              'BillingBasis': 'Per1000Benefit'
            }
          }
          ]
        }
        ]
      }
    ],
    'Census': [
      {
        'EmployeeID': 'E00111',
        'Gender': 'Female',
        'Dob': '1980-05-09T00:00:00.000Z',
        'SmokerIndicator': false,
        'SalaryMode': 'Annual',
        'IsRetiree': false,
        'SalaryAmount': 63000,
        'EmployeeCoverages': [{
          'CoverageId': 'TermLife',
          'Eligible': true,
        'Elected': true,
        'Plan': 'Golden1',
        'ClassNumber': 'Employees11',
        'CensusVolume': 80000
      }, {
        'CoverageId': 'ChildTermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Golden1',
        'ClassNumber': 'Employees11'
      }
      ]
    }, {
      'EmployeeID': 'E00112',
      'Gender': 'Male',
      'Dob': '1975-05-09T00:00:00.000Z',
      'SmokerIndicator': true,
      'SalaryMode': 'Weekly',
      'IsRetiree': false,
      'SalaryAmount': 1538,
      'EmployeeCoverages': [{
        'CoverageId': 'TermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Golden1',
        'ClassNumber': 'Employees11'
      }, {
        'CoverageId': 'SpouseTermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Golden1',
        'ClassNumber': 'Employees11'
      }
      ]
    }, {
      'EmployeeID': 'E00113',
      'Gender': 'Male',
      'Dob': '1960-05-09T00:00:00.000Z',
      'SmokerIndicator': false,
      'SalaryMode': 'Bi-Weekly',
      'IsRetiree': true,
      'SalaryAmount': 4231,
      'EmployeeCoverages': [{
        'CoverageId': 'TermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Golden1',
        'ClassNumber': 'Employees11'
      }, {
        'CoverageId': 'SpouseTermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Golden1',
        'ClassNumber': 'Employees11'
      }, {
        'CoverageId': 'ChildTermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Golden1',
        'ClassNumber': 'Employees11'
      }
      ]
    }, {
      'EmployeeID': 'E00114',
      'Gender': 'Male',
      'Dob': '1972-01-01T00:00:00.000Z',
      'SmokerIndicator': false,
      'SalaryMode': 'Hourly',
      'IsRetiree': false,
      'SalaryAmount': 38,
      'EmployeeCoverages': [{
        'CoverageId': 'TermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Golden1',
        'ClassNumber': 'Employees11'
      }, {
        'CoverageId': 'SpouseTermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Golden1',
        'ClassNumber': 'Employees11'
      }, {
        'CoverageId': 'ChildTermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Golden1',
        'ClassNumber': 'Employees11'
      }
      ]
    }, {
      'EmployeeID': 'E00115',
      'Gender': 'Female',
      'Dob': '1978-01-01T00:00:00.000Z',
      'SmokerIndicator': false,
      'SalaryMode': 'Hourly',
      'IsRetiree': false,
      'SalaryAmount': 38,
      'EmployeeCoverages': [{
        'CoverageId': 'TermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Golden1',
        'ClassNumber': 'Managers11',
        'CensusVolume': 110000
      }, {
        'CoverageId': 'SpouseTermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Golden1',
        'ClassNumber': 'Managers11',
        'CensusVolume': 80000
      }
      ]
    }, {
      'EmployeeID': 'E00116',
      'Gender': 'Female',
      'Dob': '1980-01-01T00:00:00.000Z',
      'SmokerIndicator': false,
      'SalaryMode': 'Hourly',
      'IsRetiree': false,
      'SalaryAmount': 38,
      'EmployeeCoverages': [{
        'CoverageId': 'TermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Golden1',
        'ClassNumber': 'Managers11',
        'CensusVolume': 95000
      }, {
        'CoverageId': 'SpouseTermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Golden1',
        'ClassNumber': 'Managers11'
      }
      ]
    }, {
      'EmployeeID': 'E00117',
      'Gender': 'Male',
      'Dob': '1981-01-01T00:00:00.000Z',
      'SmokerIndicator': true,
      'SalaryMode': 'Hourly',
      'IsRetiree': false,
      'SalaryAmount': 38,
      'EmployeeCoverages': [{
        'CoverageId': 'TermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Golden1',
        'ClassNumber': 'Managers11',
        'CensusVolume': 80000
      }, {
        'CoverageId': 'SpouseTermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Golden1',
        'ClassNumber': 'Managers11'
      }, {
        'CoverageId': 'ChildTermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Golden1',
        'ClassNumber': 'Managers11'
      }
      ]
    }, {
      'EmployeeID': 'E00118',
      'Gender': 'Male',
      'Dob': '1980-01-01T00:00:00.000Z',
      'SmokerIndicator': true,
      'SalaryMode': 'Hourly',
      'IsRetiree': false,
      'SalaryAmount': 38,
      'EmployeeCoverages': [{
        'CoverageId': 'TermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Golden1',
        'ClassNumber': 'Managers11',
        'CensusVolume': 75000
      }, {
        'CoverageId': 'SpouseTermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Golden1',
        'ClassNumber': 'Managers11'
      }
      ]
    }, {
      'EmployeeID': 'E00119',
      'Gender': 'Male',
      'Dob': '1959-01-01T00:00:00.000Z',
      'SmokerIndicator': false,
      'SalaryMode': 'Hourly',
      'IsRetiree': true,
      'SalaryAmount': 38,
      'EmployeeCoverages': [{
        'CoverageId': 'TermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Golden1',
        'ClassNumber': 'Managers11',
        'CensusVolume': 75000
      }, {
        'CoverageId': 'SpouseTermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Golden1',
        'ClassNumber': 'Managers11'
      }
      ]
    }, {
      'EmployeeID': 'E00211',
      'Gender': 'Female',
      'Dob': '1980-05-09T00:00:00.000Z',
      'SmokerIndicator': false,
      'SalaryMode': 'Annual',
      'IsRetiree': false,
      'SalaryAmount': 63000,
      'EmployeeCoverages': [{
        'CoverageId': 'TermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12',
        'CensusVolume': 80000
      }
      ]
    }, {
      'EmployeeID': 'E00212',
      'Gender': 'Male',
      'Dob': '1975-05-09T00:00:00.000Z',
      'SmokerIndicator': true,
      'SalaryMode': 'Weekly',
      'IsRetiree': false,
      'SalaryAmount': 1538,
      'EmployeeCoverages': [{
        'CoverageId': 'TermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12',
        'CensusVolume': 95000
      }, {
        'CoverageId': 'SpouseTermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12'
      }, {
        'CoverageId': 'ChildTermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12'
      }, {
        'CoverageId': 'ADD',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12'
      }, {
        'CoverageId': 'DependentADD',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12',
        'DependentSpouseCensusVolume': 75000,
        'DependentChildCensusVolume': 31000
      }
      ]
    }, {
      'EmployeeID': 'E00213',
      'Gender': 'Male',
      'Dob': '1960-05-09T00:00:00.000Z',
      'SmokerIndicator': false,
      'SalaryMode': 'Bi-Weekly',
      'IsRetiree': true,
      'SalaryAmount': 4231,
      'EmployeeCoverages': [{
        'CoverageId': 'TermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12',
        'CensusVolume': 80000
      }, {
        'CoverageId': 'SpouseTermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12'
      }
      ]
    }, {
      'EmployeeID': 'E00214',
      'Gender': 'Male',
      'Dob': '1972-01-01T00:00:00.000Z',
      'SmokerIndicator': false,
      'SalaryMode': 'Hourly',
      'IsRetiree': false,
      'SalaryAmount': 38,
      'EmployeeCoverages': [{
        'CoverageId': 'TermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12',
        'CensusVolume': 110000
      }, {
        'CoverageId': 'SpouseTermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12'
      }, {
        'CoverageId': 'ChildTermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12'
      }, {
        'CoverageId': 'ADD',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12'
      }, {
        'CoverageId': 'DependentADD',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12',
        'CensusVolume': 82000,
        'DependentSpouseCensusVolume': 62000,
        'DependentChildCensusVolume': 42000
      }
      ]
    }, {
      'EmployeeID': 'E00215',
      'Gender': 'Female',
      'Dob': '1978-01-01T00:00:00.000Z',
      'SmokerIndicator': false,
      'SalaryMode': 'Hourly',
      'IsRetiree': false,
      'SalaryAmount': 38,
      'EmployeeCoverages': [{
        'CoverageId': 'TermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12',
        'CensusVolume': 110000
      }, {
        'CoverageId': 'SpouseTermLife',
        'Eligible': true,
        'Elected': false,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12'
      }, {
        'CoverageId': 'ChildTermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12'
      }, {
        'CoverageId': 'ADD',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12'
      }, {
        'CoverageId': 'DependentADD',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12',
        'CensusVolume': 150000,
        'DependentSpouseCensusVolume': 107000,
        'DependentChildCensusVolume': 97000
      }
      ]
    }, {
      'EmployeeID': 'E00216',
      'Gender': 'Female',
      'Dob': '1980-01-01T00:00:00.000Z',
      'SmokerIndicator': false,
      'SalaryMode': 'Hourly',
      'IsRetiree': false,
      'SalaryAmount': 38,
      'EmployeeCoverages': [{
        'CoverageId': 'TermLife',
        'Eligible': true,
        'Elected': false,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12',
        'CensusVolume': 95000
      }, {
        'CoverageId': 'SpouseTermLife',
        'Eligible': true,
        'Elected': false,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12'
      }, {
        'CoverageId': 'ChildTermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12'
      }, {
        'CoverageId': 'ADD',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12'
      }, {
        'CoverageId': 'DependentADD',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12',
        'CensusVolume': 79000,
        'DependentSpouseCensusVolume': 69000,
        'DependentChildCensusVolume': 59000
      }
      ]
    }, {
      'EmployeeID': 'E00217',
      'Gender': 'Male',
      'Dob': '1981-01-01T00:00:00.000Z',
      'SmokerIndicator': true,
      'SalaryMode': 'Hourly',
      'IsRetiree': false,
      'SalaryAmount': 38,
      'EmployeeCoverages': [{
        'CoverageId': 'TermLife',
        'Eligible': true,
        'Elected': false,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12',
        'CensusVolume': 80000
      }, {
        'CoverageId': 'SpouseTermLife',
        'Eligible': true,
        'Elected': false,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12'
      }, {
        'CoverageId': 'ChildTermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12'
      }, {
        'CoverageId': 'ADD',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12'
      }, {
        'CoverageId': 'DependentADD',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12'
      }
      ]
    }, {
      'EmployeeID': 'E00218',
      'Gender': 'Male',
      'Dob': '1980-01-01T00:00:00.000Z',
      'SmokerIndicator': true,
      'SalaryMode': 'Hourly',
      'IsRetiree': false,
      'SalaryAmount': 38,
      'EmployeeCoverages': [{
        'CoverageId': 'TermLife',
        'Eligible': true,
        'Elected': false,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12',
        'CensusVolume': 75000
      }, {
        'CoverageId': 'SpouseTermLife',
        'Eligible': true,
        'Elected': false,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12'
      }, {
        'CoverageId': 'ChildTermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12'
      }
      ]
    }, {
      'EmployeeID': 'E00219',
      'Gender': 'Male',
      'Dob': '1959-01-01T00:00:00.000Z',
      'SmokerIndicator': false,
      'SalaryMode': 'Hourly',
      'IsRetiree': true,
      'SalaryAmount': 38,
      'EmployeeCoverages': [{
        'CoverageId': 'TermLife',
        'Eligible': true,
        'Elected': false,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12',
        'CensusVolume': 75000
      }, {
        'CoverageId': 'SpouseTermLife',
        'Eligible': true,
        'Elected': false,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12'
      }
      ]
    }, {
      'EmployeeID': 'E00220',
      'Gender': 'Male',
      'Dob': '1959-01-01T00:00:00.000Z',
      'SmokerIndicator': false,
      'SalaryMode': 'Hourly',
      'IsRetiree': true,
      'SalaryAmount': 38,
      'EmployeeCoverages': [{
        'CoverageId': 'TermLife',
        'Eligible': false,
        'Elected': true,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12',
        'CensusVolume': 75000
      }, {
        'CoverageId': 'SpouseTermLife',
        'Eligible': false,
        'Elected': true,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12'
      }
      ]
    }, {
      'EmployeeID': 'E00221',
      'Gender': 'Male',
      'Dob': '1959-01-01T00:00:00.000Z',
      'SmokerIndicator': true,
      'SalaryMode': 'Hourly',
      'IsRetiree': true,
      'SalaryAmount': 38,
      'EmployeeCoverages': [{
        'CoverageId': 'TermLife',
        'Eligible': true,
        'Elected': false,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12',
        'CensusVolume': 75000
      }, {
        'CoverageId': 'SpouseTermLife',
        'Eligible': true,
        'Elected': false,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12'
      }, {
        'CoverageId': 'ChildTermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12'
      }, {
        'CoverageId': 'ADD',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12'
      }
      ]
    }, {
      'EmployeeID': 'E00222',
      'Gender': 'Male',
      'Dob': '1972-01-01T00:00:00.000Z',
      'SmokerIndicator': false,
      'SalaryMode': 'Hourly',
      'IsRetiree': false,
      'SalaryAmount': 38,
      'EmployeeCoverages': [{
        'CoverageId': 'TermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12',
        'CensusVolume': 110000
      }, {
        'CoverageId': 'SpouseTermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12'
      }, {
        'CoverageId': 'ChildTermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12'
      }, {
        'CoverageId': 'ADD',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12'
      }, {
        'CoverageId': 'DependentADD',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12'
      }
      ]
    }, {
      'EmployeeID': 'E00223',
      'Gender': 'Male',
      'Dob': '1972-01-01T00:00:00.000Z',
      'SmokerIndicator': false,
      'SalaryMode': 'Hourly',
      'IsRetiree': false,
      'SalaryAmount': 38,
      'EmployeeCoverages': [{
        'CoverageId': 'TermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12',
        'CensusVolume': 110000
      }, {
        'CoverageId': 'SpouseTermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12'
      }, {
        'CoverageId': 'ChildTermLife',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12'
      }, {
        'CoverageId': 'ADD',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12'
      }, {
        'CoverageId': 'DependentADD',
        'Eligible': true,
        'Elected': true,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12'
      }
      ]
    }, {
      'EmployeeID': 'E00224',
      'Gender': 'Male',
      'Dob': '1980-01-01T00:00:00.000Z',
      'SmokerIndicator': true,
      'SalaryMode': 'Hourly',
      'IsRetiree': false,
      'SalaryAmount': 38,
      'EmployeeCoverages': [{
        'CoverageId': 'TermLife',
        'Eligible': true,
        'Elected': false,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12',
        'CensusVolume': 75000
      }, {
        'CoverageId': 'SpouseTermLife',
        'Eligible': true,
        'Elected': false,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12'
      }
      ]
    }, {
      'EmployeeID': 'E00225',
      'Gender': 'Male',
      'Dob': '1980-01-01T00:00:00.000Z',
      'SmokerIndicator': true,
      'SalaryMode': 'Hourly',
      'IsRetiree': false,
      'SalaryAmount': 38,
      'EmployeeCoverages': [{
        'CoverageId': 'TermLife',
        'Eligible': true,
        'Elected': false,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12',
        'CensusVolume': 75000
      }, {
        'CoverageId': 'SpouseTermLife',
        'Eligible': true,
        'Elected': false,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12'
      }
      ]
    }, {
      'EmployeeID': 'E00226',
      'Gender': 'Female',
      'Dob': '1980-01-01T00:00:00.000Z',
      'SmokerIndicator': true,
      'SalaryMode': 'Hourly',
      'IsRetiree': false,
      'SalaryAmount': 38,
      'EmployeeCoverages': [{
        'CoverageId': 'TermLife',
        'Eligible': true,
        'Elected': false,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12',
        'CensusVolume': 75000
      }, {
        'CoverageId': 'SpouseTermLife',
        'Eligible': true,
        'Elected': false,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12'
      }
      ]
    }, {
      'EmployeeID': 'E00227',
      'Gender': 'Female',
      'Dob': '1980-01-01T00:00:00.000Z',
      'SmokerIndicator': true,
      'SalaryMode': 'Hourly',
      'IsRetiree': false,
      'SalaryAmount': 38,
      'EmployeeCoverages': [{
        'CoverageId': 'TermLife',
        'Eligible': true,
        'Elected': false,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12',
        'CensusVolume': 75000
      }, {
        'CoverageId': 'SpouseTermLife',
        'Eligible': true,
        'Elected': false,
        'Plan': 'Silver1',
        'ClassNumber': 'Employees12'
      }
      ]
    }
    ]
  }
}

