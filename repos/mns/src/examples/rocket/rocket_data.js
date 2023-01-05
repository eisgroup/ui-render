export default {
  'Policy': {
    'policyNumber': 'Policy7',
    'rateEffectiveDate': '2023-10-13T00:00:00.000Z',
    'requestDate': '2023-04-05T00:00:00.000Z',
    'situsState': 'NY',
    'sicCode': 259,
    'zip': '49931',
    'plans': [
      {
        'planName': 'High',
        'coverages': [
          {
            'coverageCode': 'Dental Coverage 1',
            'censusType': 'Eligible',
            'assumedParticipationPercent': 0.35,
            'planCategory': 'PPO',
            'tiers': [
              'Individual',
              'IndividualAndSpouse',
              'IndividualAndChildren',
              'Family'
            ],
            'serviceTypes': [
              'Preventive',
              'Basic',
              'Major'
            ],
            'fundingStructure': {
              'fundingType': 'ASO',
              'contributionType': 'Voluntary',
              'contributionBasis': 'Percent',
              'participantContributionPercent': 1,
              'asoType': 'ATPwithCheck'
            },
            'childMaxAge': '26',
            'fullTimeStudentAge': '26',
            'preventiveWaitingPeriod': 0,
            'basicWaitingPeriod': 6,
            'majorWaitingPeriod': 12,
            'rateType': 'Tier',
            'rateBasis': 'PerEmployeePerMonth',
            'rateFormat': 'Composite',
            'deductibleDetails': {
              'deductibleAccumulationPeriod': 'BenefitYear',
              'isGradedDeductible': false,
              'deductibleServicesInNetwork': [
                'Preventive',
                'Basic',
                'Major'
              ],
              'deductibleServicesOutOfNetwork': [
                'Preventive',
                'Basic',
                'Major'
              ],
              'deductibles': [
                {
                  'deductibleType': 'IndividualAnnual',
                  'deductibleInNetworkAmount': 50,
                  'deductibleOutOfNetworkAmount': 50
                }
              ]
            },
            'maximumDetails': {
              'maximumAccumulationPeriod': 'BenefitYear',
              'isGradedMaximum': false,
              'isMaximumRollover': false,
              'dentalMaximums': [
                {
                  'maximumType': 'AnnualMaximum',
                  'maximumINAmount': 1000,
                  'maximumOONAmount': 1000
                }
              ],
              'maximumServicesInNetwork': [
                'Preventive',
                'Basic',
                'Major'
              ],
              'maximumServicesOutOfNetwork': [
                'Preventive',
                'Basic',
                'Major'
              ]
            },
            'coinsuranceDetails': {
              'reimbursementOONOptions': '80th',
              'isGradedCoinsurance': false,
              'numberOfGradedYears': 70,
              'coinsurances': [
                {
                  'coinsuranceGradedYear': 1,
                  'coinsuranceServiceType': 'Preventive',
                  'coinsuranceINAmount': 0.8,
                  'coinsuranceOONAmount': 0.8
                },
                {
                  'coinsuranceServiceType': 'Basic',
                  'coinsuranceINAmount': 0.5,
                  'coinsuranceOONAmount': 0.5
                },
                {
                  'coinsuranceServiceType': 'Major',
                  'coinsuranceINAmount': 0.5,
                  'coinsuranceOONAmount': 0.5
                }
              ]
            },
            'orthodonticCoverage': {
              'orthoAvailability': 'ChildOnly',
              'orthoChildAgeLimit': '19',
              'orthoWaitingPeriod': 12,
              'orthoDeductibleType': 'None',
              'orthoAnnualDeductible': {
                'appliesTo': 'Orthodontics'
              },
              'orthoLifetimeDeductible': {
                'appliesTo': 'Orthodontics'
              },
              'orthoCoinsuranceIN': 0.5,
              'orthoCoinsuranceOON': 0.5,
              'orthoMaximumType': 'Lifetime',
              'orthoAnnualMaximum': {
                'appliesTo': 'Orthodontics'
              },
              'orthoLifetimeMaximum': {
                'inNetworkAmount': 1000,
                'outOfNetworkAmount': 1000,
                'appliesTo': 'Orthodontics'
              }
            },
            'limitations': [
              {
                'limitationCategory': 'Basic',
                'limitationName': 'BitewingRadiographs',
                'limitationFrequency': '1in12Months'
              },
              {
                'limitationCategory': 'Major',
                'limitationName': 'Bleaching',
                'limitationFrequency': 'NotCovered'
              },
              {
                'limitationCategory': 'Preventive',
                'limitationName': 'BrushBiopsy',
                'limitationFrequency': '1in6Months'
              },
              {
                'limitationCategory': 'Major',
                'limitationName': 'CompositeFillings',
                'limitationFrequency': 'AnteriorTeethOnly'
              },
              {
                'limitationCategory': 'Preventive',
                'limitationName': 'CrownBuildups',
                'limitationFrequency': '1in120Months'
              },
              {
                'limitationCategory': 'Major',
                'limitationName': 'Crowns',
                'limitationFrequency': '1in120Months'
              },
              {
                'limitationCategory': 'Preventive',
                'limitationName': 'DentureAdjustments',
                'limitationFrequency': '1in12Months'
              },
              {
                'limitationCategory': 'Basic',
                'limitationName': 'DentureRebasesRelines',
                'limitationFrequency': '1in36Months'
              },
              {
                'limitationCategory': 'Preventive',
                'limitationName': 'Dentures',
                'limitationFrequency': '1in120Months'
              },
              {
                'limitationCategory': 'Major',
                'limitationName': 'Fillings',
                'limitationFrequency': '1in36Months'
              },
              {
                'limitationCategory': 'Basic',
                'limitationName': 'FillingsUnderNineteen',
                'limitationFrequency': '1in12Months'
              },
              {
                'limitationCategory': 'Major',
                'limitationName': 'FixedBridgework',
                'limitationFrequency': '1in120Months'
              },
              {
                'limitationCategory': 'Major',
                'limitationName': 'FluorideTreatment',
                'limitationFrequency': '1in6Months',
                'fluorideTreatmentAgeLimit': '14'
              },
              {
                'limitationCategory': 'Major',
                'limitationName': 'FullMouthDebridement',
                'limitationFrequency': '1perLifetime'
              },
              {
                'limitationCategory': 'Preventive',
                'limitationName': 'FullMouthRadiographs',
                'limitationFrequency': '1in60Months'
              },
              {
                'limitationCategory': 'Preventive',
                'limitationName': 'GeneralAnesthesia',
                'limitationFrequency': 'Covered'
              },
              {
                'limitationCategory': 'Basic',
                'limitationName': 'HarmfulHabitAppliance',
                'limitationFrequency': '1perLifetime',
                'harmfulHabitApplianceAgeLimit': '14'
              },
              {
                'limitationCategory': 'Basic',
                'limitationName': 'Implants',
                'limitationFrequency': 'NotCovered'
              },
              {
                'limitationCategory': 'Basic',
                'limitationName': 'InlaysOnlays',
                'limitationFrequency': '1in120Months'
              },
              {
                'limitationCategory': 'Basic',
                'limitationName': 'OcclusalAdjustments',
                'limitationFrequency': '1perLifetime'
              },
              {
                'limitationCategory': 'Major',
                'limitationName': 'OcclusalGuard',
                'limitationFrequency': '1perLifetime'
              },
              {
                'limitationCategory': 'Preventive',
                'limitationName': 'OralEvaluations',
                'limitationFrequency': '1in6Months'
              },
              {
                'limitationCategory': 'Basic',
                'limitationName': 'PeriodontalMaintenance',
                'limitationFrequency': 'CombinedWithProphylaxisFrequency'
              },
              {
                'limitationCategory': 'Basic',
                'limitationName': 'PeriodontalSurgery',
                'limitationFrequency': '1in36Months'
              },
              {
                'limitationCategory': 'Major',
                'limitationName': 'PostCore',
                'limitationFrequency': '1in120Months'
              },
              {
                'limitationCategory': 'Preventive',
                'limitationName': 'Prophylaxis',
                'limitationFrequency': '1in6Months'
              },
              {
                'limitationCategory': 'Major',
                'limitationName': 'RootCanalTreatment',
                'limitationFrequency': '1perLifetime'
              },
              {
                'limitationCategory': 'Major',
                'limitationName': 'ScalingRootPlaning',
                'limitationFrequency': '1in36Months'
              },
              {
                'limitationCategory': 'Preventive',
                'limitationName': 'Sealants',
                'limitationFrequency': '1in60Months',
                'sealantsAgeLimit': '14'
              },
              {
                'limitationCategory': 'Basic',
                'limitationName': 'SpaceMaintainers',
                'limitationFrequency': '1perLifetime',
                'spaceMaintainersAgeLimit': '14'
              },
              {
                'limitationCategory': 'Major',
                'limitationName': 'StainlessSteelCrowns',
                'limitationFrequency': '1in36Months',
                'stainlessSteelCrownsAgeLimit': '16'
              },
              {
                'limitationCategory': 'Basic',
                'limitationName': 'TissueConditioning',
                'limitationFrequency': '1in36Months'
              },
              {
                'limitationCategory': 'Preventive',
                'limitationName': 'Veneers',
                'limitationFrequency': '1in120Months'
              }
            ],
            'serviceCategories': [
              {
                'serviceCategoryName': 'AllOtherRadiographs',
                'serviceCategoryAppliesTo': 'Preventive'
              },
              {
                'serviceCategoryName': 'BitewingRadiographs',
                'serviceCategoryAppliesTo': 'Preventive'
              },
              {
                'serviceCategoryName': 'Crowns',
                'serviceCategoryAppliesTo': 'Major'
              },
              {
                'serviceCategoryName': 'DentureRepairs',
                'serviceCategoryAppliesTo': 'Major'
              },
              {
                'serviceCategoryName': 'Dentures',
                'serviceCategoryAppliesTo': 'Major'
              },
              {
                'serviceCategoryName': 'Fillings',
                'serviceCategoryAppliesTo': 'Basic'
              },
              {
                'serviceCategoryName': 'FixedBridgework',
                'serviceCategoryAppliesTo': 'Major'
              },
              {
                'serviceCategoryName': 'Fluorides',
                'serviceCategoryAppliesTo': 'Preventive'
              },
              {
                'serviceCategoryName': 'FullMouthRadiographs',
                'serviceCategoryAppliesTo': 'Preventive'
              },
              {
                'serviceCategoryName': 'GeneralAnesthesia',
                'serviceCategoryAppliesTo': 'Basic'
              },
              {
                'serviceCategoryName': 'ImplantServices',
                'serviceCategoryAppliesTo': 'Major'
              },
              {
                'serviceCategoryName': 'InlaysOnlays',
                'serviceCategoryAppliesTo': 'Major'
              },
              {
                'serviceCategoryName': 'NonSurgicalExtractions',
                'serviceCategoryAppliesTo': 'Basic'
              },
              {
                'serviceCategoryName': 'NonSurgicalPeriodontics',
                'serviceCategoryAppliesTo': 'Basic'
              },
              {
                'serviceCategoryName': 'OralEvaluations',
                'serviceCategoryAppliesTo': 'Preventive'
              },
              {
                'serviceCategoryName': 'OtherAdjunctiveServices',
                'serviceCategoryAppliesTo': 'Major'
              },
              {
                'serviceCategoryName': 'OtherDiagnosticServices',
                'serviceCategoryAppliesTo': 'Preventive'
              },
              {
                'serviceCategoryName': 'OtherEndodonticServices',
                'serviceCategoryAppliesTo': 'Basic'
              },
              {
                'serviceCategoryName': 'OtherOralSurgery',
                'serviceCategoryAppliesTo': 'Basic'
              },
              {
                'serviceCategoryName': 'OtherOrthodonticServices',
                'serviceCategoryAppliesTo': 'Orthodontics'
              },
              {
                'serviceCategoryName': 'OtherPeriodonticServices',
                'serviceCategoryAppliesTo': 'Basic'
              },
              {
                'serviceCategoryName': 'OtherPreventiveServices',
                'serviceCategoryAppliesTo': 'Preventive'
              },
              {
                'serviceCategoryName': 'OtherProsthodonticServices',
                'serviceCategoryAppliesTo': 'Major'
              },
              {
                'serviceCategoryName': 'OtherRestorativeServices',
                'serviceCategoryAppliesTo': 'Major'
              },
              {
                'serviceCategoryName': 'Prophylaxis',
                'serviceCategoryAppliesTo': 'Preventive'
              },
              {
                'serviceCategoryName': 'RootCanals',
                'serviceCategoryAppliesTo': 'Basic'
              },
              {
                'serviceCategoryName': 'Sealants',
                'serviceCategoryAppliesTo': 'Preventive'
              },
              {
                'serviceCategoryName': 'SpaceMaintainers',
                'serviceCategoryAppliesTo': 'Preventive'
              },
              {
                'serviceCategoryName': 'StainlessSteelCrowns',
                'serviceCategoryAppliesTo': 'Basic'
              },
              {
                'serviceCategoryName': 'SurgicalExtractions',
                'serviceCategoryAppliesTo': 'Basic'
              },
              {
                'serviceCategoryName': 'SurgicalPeriodontics',
                'serviceCategoryAppliesTo': 'Basic'
              },
              {
                'serviceCategoryName': 'TMJ',
                'serviceCategoryAppliesTo': 'Major'
              },
              {
                'serviceCategoryName': 'TreatmenttoControlHarmfulHabits',
                'serviceCategoryAppliesTo': 'Preventive'
              }
            ],
            'exclusions': {
              'isMissingToothCovered': true
            },
            'classes': [
              {
                'className': 'Class1',
                'classNumber': '1',
                'numberOfLives': 100
              }
            ]
          }
        ]
      },
      {
        'planName': 'Low',
        'coverages': [
          {
            'coverageCode': 'Dental Coverage 1',
            'censusType': 'Eligible',
            'assumedParticipationPercent': 0.31,
            'planCategory': 'PPO',
            'tiers': [
              'Individual',
              'IndividualAndSpouse',
              'IndividualAndChildren',
              'Family'
            ],
            'serviceTypes': [
              'Preventive',
              'Basic',
              'Major'
            ],
            'fundingStructure': {
              'fundingType': 'ASO',
              'contributionType': 'Voluntary',
              'contributionBasis': 'Percent',
              'participantContributionPercent': 1,
              'asoType': 'ATPwithCheck'
            },
            'childMaxAge': '26',
            'fullTimeStudentAge': '26',
            'preventiveWaitingPeriod': 0,
            'basicWaitingPeriod': 6,
            'majorWaitingPeriod': 12,
            'rateType': 'Tier',
            'rateBasis': 'PerEmployeePerMonth',
            'rateFormat': 'Composite',
            'deductibleDetails': {
              'deductibleAccumulationPeriod': 'BenefitYear',
              'isGradedDeductible': false,
              'deductibleServicesInNetwork': [
                'Preventive',
                'Basic',
                'Major'
              ],
              'deductibleServicesOutOfNetwork': [
                'Preventive',
                'Basic',
                'Major'
              ],
              'deductibles': [
                {
                  'deductibleType': 'IndividualAnnual',
                  'deductibleInNetworkAmount': 150,
                  'deductibleOutOfNetworkAmount': 150
                }
              ]
            },
            'maximumDetails': {
              'maximumAccumulationPeriod': 'BenefitYear',
              'isGradedMaximum': false,
              'isMaximumRollover': false,
              'dentalMaximums': [
                {
                  'maximumType': 'AnnualMaximum',
                  'maximumINAmount': 1500,
                  'maximumOONAmount': 1500
                }
              ],
              'maximumServicesInNetwork': [
                'Preventive',
                'Basic',
                'Major'
              ],
              'maximumServicesOutOfNetwork': [
                'Preventive',
                'Basic',
                'Major'
              ]
            },
            'coinsuranceDetails': {
              'reimbursementOONOptions': '80th',
              'isGradedCoinsurance': false,
              'numberOfGradedYears': 0,
              'coinsurances': [
                {
                  'coinsuranceGradedYear': 1,
                  'coinsuranceServiceType': 'Preventive',
                  'coinsuranceINAmount': 0.8,
                  'coinsuranceOONAmount': 0.8
                },
                {
                  'coinsuranceServiceType': 'Basic',
                  'coinsuranceINAmount': 0.5,
                  'coinsuranceOONAmount': 0.5
                },
                {
                  'coinsuranceServiceType': 'Major',
                  'coinsuranceINAmount': 0.5,
                  'coinsuranceOONAmount': 0.5
                }
              ]
            },
            'orthodonticCoverage': {
              'orthoAvailability': 'ChildOnly',
              'orthoChildAgeLimit': '19',
              'orthoWaitingPeriod': 12,
              'orthoDeductibleType': 'None',
              'orthoAnnualDeductible': {
                'appliesTo': 'Orthodontics'
              },
              'orthoLifetimeDeductible': {
                'appliesTo': 'Orthodontics'
              },
              'orthoCoinsuranceIN': 0.5,
              'orthoCoinsuranceOON': 0.5,
              'orthoMaximumType': 'Lifetime',
              'orthoAnnualMaximum': {
                'appliesTo': 'Orthodontics'
              },
              'orthoLifetimeMaximum': {
                'inNetworkAmount': 1500,
                'outOfNetworkAmount': 1500,
                'appliesTo': 'Orthodontics'
              }
            },
            'limitations': [
              {
                'limitationCategory': 'Basic',
                'limitationName': 'BitewingRadiographs',
                'limitationFrequency': '1in12Months'
              },
              {
                'limitationCategory': 'Major',
                'limitationName': 'Bleaching',
                'limitationFrequency': 'NotCovered'
              },
              {
                'limitationCategory': 'Preventive',
                'limitationName': 'BrushBiopsy',
                'limitationFrequency': '1in6Months'
              },
              {
                'limitationCategory': 'Major',
                'limitationName': 'CompositeFillings',
                'limitationFrequency': 'AnteriorTeethOnly'
              },
              {
                'limitationCategory': 'Preventive',
                'limitationName': 'CrownBuildups',
                'limitationFrequency': '1in120Months'
              },
              {
                'limitationCategory': 'Major',
                'limitationName': 'Crowns',
                'limitationFrequency': '1in120Months'
              },
              {
                'limitationCategory': 'Preventive',
                'limitationName': 'DentureAdjustments',
                'limitationFrequency': '1in12Months'
              },
              {
                'limitationCategory': 'Basic',
                'limitationName': 'DentureRebasesRelines',
                'limitationFrequency': '1in36Months'
              },
              {
                'limitationCategory': 'Preventive',
                'limitationName': 'Dentures',
                'limitationFrequency': '1in120Months'
              },
              {
                'limitationCategory': 'Major',
                'limitationName': 'Fillings',
                'limitationFrequency': '1in12Months'
              },
              {
                'limitationCategory': 'Basic',
                'limitationName': 'FillingsUnderNineteen',
                'limitationFrequency': '1in12Months'
              },
              {
                'limitationCategory': 'Major',
                'limitationName': 'FixedBridgework',
                'limitationFrequency': '1in120Months'
              },
              {
                'limitationCategory': 'Major',
                'limitationName': 'FluorideTreatment',
                'limitationFrequency': '1in6Months',
                'fluorideTreatmentAgeLimit': '14'
              },
              {
                'limitationCategory': 'Major',
                'limitationName': 'FullMouthDebridement',
                'limitationFrequency': '1perLifetime'
              },
              {
                'limitationCategory': 'Preventive',
                'limitationName': 'FullMouthRadiographs',
                'limitationFrequency': '1in12Months'
              },
              {
                'limitationCategory': 'Preventive',
                'limitationName': 'GeneralAnesthesia',
                'limitationFrequency': 'Covered'
              },
              {
                'limitationCategory': 'Basic',
                'limitationName': 'HarmfulHabitAppliance',
                'limitationFrequency': '1perLifetime',
                'harmfulHabitApplianceAgeLimit': '14'
              },
              {
                'limitationCategory': 'Basic',
                'limitationName': 'Implants',
                'limitationFrequency': 'NotCovered'
              },
              {
                'limitationCategory': 'Basic',
                'limitationName': 'InlaysOnlays',
                'limitationFrequency': '1in120Months'
              },
              {
                'limitationCategory': 'Basic',
                'limitationName': 'OcclusalAdjustments',
                'limitationFrequency': '1perLifetime'
              },
              {
                'limitationCategory': 'Major',
                'limitationName': 'OcclusalGuard',
                'limitationFrequency': '1perLifetime'
              },
              {
                'limitationCategory': 'Preventive',
                'limitationName': 'OralEvaluations',
                'limitationFrequency': '1in6Months'
              },
              {
                'limitationCategory': 'Basic',
                'limitationName': 'PeriodontalMaintenance',
                'limitationFrequency': 'CombinedWithProphylaxisFrequency'
              },
              {
                'limitationCategory': 'Basic',
                'limitationName': 'PeriodontalSurgery',
                'limitationFrequency': '1in36Months'
              },
              {
                'limitationCategory': 'Major',
                'limitationName': 'PostCore',
                'limitationFrequency': '1in120Months'
              },
              {
                'limitationCategory': 'Preventive',
                'limitationName': 'Prophylaxis',
                'limitationFrequency': '1in6Months'
              },
              {
                'limitationCategory': 'Major',
                'limitationName': 'RootCanalTreatment',
                'limitationFrequency': '1perLifetime'
              },
              {
                'limitationCategory': 'Major',
                'limitationName': 'ScalingRootPlaning',
                'limitationFrequency': '1in36Months'
              },
              {
                'limitationCategory': 'Preventive',
                'limitationName': 'Sealants',
                'limitationFrequency': '1in60Months',
                'sealantsAgeLimit': '14'
              },
              {
                'limitationCategory': 'Basic',
                'limitationName': 'SpaceMaintainers',
                'limitationFrequency': '1perLifetime',
                'spaceMaintainersAgeLimit': '14'
              },
              {
                'limitationCategory': 'Major',
                'limitationName': 'StainlessSteelCrowns',
                'limitationFrequency': '1in36Months',
                'stainlessSteelCrownsAgeLimit': '16'
              },
              {
                'limitationCategory': 'Basic',
                'limitationName': 'TissueConditioning',
                'limitationFrequency': '1in36Months'
              },
              {
                'limitationCategory': 'Preventive',
                'limitationName': 'Veneers',
                'limitationFrequency': '1in120Months'
              }
            ],
            'serviceCategories': [
              {
                'serviceCategoryName': 'AllOtherRadiographs',
                'serviceCategoryAppliesTo': 'Preventive'
              },
              {
                'serviceCategoryName': 'BitewingRadiographs',
                'serviceCategoryAppliesTo': 'Preventive'
              },
              {
                'serviceCategoryName': 'Crowns',
                'serviceCategoryAppliesTo': 'Major'
              },
              {
                'serviceCategoryName': 'DentureRepairs',
                'serviceCategoryAppliesTo': 'Major'
              },
              {
                'serviceCategoryName': 'Dentures',
                'serviceCategoryAppliesTo': 'Major'
              },
              {
                'serviceCategoryName': 'Fillings',
                'serviceCategoryAppliesTo': 'Basic'
              },
              {
                'serviceCategoryName': 'FixedBridgework',
                'serviceCategoryAppliesTo': 'Major'
              },
              {
                'serviceCategoryName': 'Fluorides',
                'serviceCategoryAppliesTo': 'Preventive'
              },
              {
                'serviceCategoryName': 'FullMouthRadiographs',
                'serviceCategoryAppliesTo': 'Preventive'
              },
              {
                'serviceCategoryName': 'GeneralAnesthesia',
                'serviceCategoryAppliesTo': 'Basic'
              },
              {
                'serviceCategoryName': 'ImplantServices',
                'serviceCategoryAppliesTo': 'Major'
              },
              {
                'serviceCategoryName': 'InlaysOnlays',
                'serviceCategoryAppliesTo': 'Major'
              },
              {
                'serviceCategoryName': 'NonSurgicalExtractions',
                'serviceCategoryAppliesTo': 'Basic'
              },
              {
                'serviceCategoryName': 'NonSurgicalPeriodontics',
                'serviceCategoryAppliesTo': 'Basic'
              },
              {
                'serviceCategoryName': 'OralEvaluations',
                'serviceCategoryAppliesTo': 'Preventive'
              },
              {
                'serviceCategoryName': 'OtherAdjunctiveServices',
                'serviceCategoryAppliesTo': 'Major'
              },
              {
                'serviceCategoryName': 'OtherDiagnosticServices',
                'serviceCategoryAppliesTo': 'Preventive'
              },
              {
                'serviceCategoryName': 'OtherEndodonticServices',
                'serviceCategoryAppliesTo': 'Basic'
              },
              {
                'serviceCategoryName': 'OtherOralSurgery',
                'serviceCategoryAppliesTo': 'Basic'
              },
              {
                'serviceCategoryName': 'OtherOrthodonticServices',
                'serviceCategoryAppliesTo': 'Orthodontics'
              },
              {
                'serviceCategoryName': 'OtherPeriodonticServices',
                'serviceCategoryAppliesTo': 'Basic'
              },
              {
                'serviceCategoryName': 'OtherPreventiveServices',
                'serviceCategoryAppliesTo': 'Preventive'
              },
              {
                'serviceCategoryName': 'OtherProsthodonticServices',
                'serviceCategoryAppliesTo': 'Major'
              },
              {
                'serviceCategoryName': 'OtherRestorativeServices',
                'serviceCategoryAppliesTo': 'Major'
              },
              {
                'serviceCategoryName': 'Prophylaxis',
                'serviceCategoryAppliesTo': 'Preventive'
              },
              {
                'serviceCategoryName': 'RootCanals',
                'serviceCategoryAppliesTo': 'Basic'
              },
              {
                'serviceCategoryName': 'Sealants',
                'serviceCategoryAppliesTo': 'Preventive'
              },
              {
                'serviceCategoryName': 'SpaceMaintainers',
                'serviceCategoryAppliesTo': 'Preventive'
              },
              {
                'serviceCategoryName': 'StainlessSteelCrowns',
                'serviceCategoryAppliesTo': 'Basic'
              },
              {
                'serviceCategoryName': 'SurgicalExtractions',
                'serviceCategoryAppliesTo': 'Basic'
              },
              {
                'serviceCategoryName': 'SurgicalPeriodontics',
                'serviceCategoryAppliesTo': 'Basic'
              },
              {
                'serviceCategoryName': 'TMJ',
                'serviceCategoryAppliesTo': 'Major'
              },
              {
                'serviceCategoryName': 'TreatmenttoControlHarmfulHabits',
                'serviceCategoryAppliesTo': 'Preventive'
              }
            ],
            'exclusions': {
              'isMissingToothCovered': true
            },
            'classes': [
              {
                'className': 'Class1',
                'classNumber': '1',
                'numberOfLives': 90
              }
            ]
          }
        ]
      }
    ],
    'rateGuaranteeMonths': 6,
    'commissions': [
      {
        'processingType': 'GroupHeapedPercent',
        'commissionSchedules': [
          {
            'lowerBound': 1,
            'upperBound': 1,
            'rate': 0.2,
            'denomination': 'PERCENTAGE'
          },
          {
            'lowerBound': 2,
            'upperBound': 5,
            'rate': 0.1,
            'denomination': 'PERCENTAGE'
          },
          {
            'lowerBound': 6,
            'rate': 0.01,
            'denomination': 'PERCENTAGE'
          }
        ]
      }
    ]
  },
  'ExperienceData': {
    'showExperienceRating': true,
    'periodBasis': [
      {
        'periodBasisType': 'Year'
      },
      {
        'periodBasisType': 'Month'
      }
    ],
    'trendAssumption': 1.03,
    'credibility': 1,
    'dataKind': {
      'experiencePeriods': [
        {
          'periodName': 'Current2021',
          'startDate': '2021-01-01',
          'endDate': '2021-12-31',
          'weight': 0.5,
          'numberOfMonths': 12
        },
        {
          'periodName': '1st Period',
          'startDate': '2020-01-01',
          'endDate': '2020-12-31',
          'weight': 0.3,
          'numberOfMonths': 12
        },
        {
          'periodName': '2nd Period',
          'startDate': '2019-01-01',
          'endDate': '2019-12-31',
          'weight': 0.2,
          'numberOfMonths': 12
        }
      ]
    },
    'ratesAndHistoricalInfo': [
      {
        'planName': 'High',
        'historicalInformation': [
          {
            'periodName': 'Current2021',
            'billedPremium': 60112,
            'exposure': 3572,
            'paidClaims': 40662,
            'fullyIncurredClaims': 44495.07771634615,
            'historicalInfoEntries': [
              {
                'planName': 'High',
                'periodDate': '2021-01-01',
                'billedPremium': 40662,
                'exposure': 3572,
                'paidClaims': 60112
              }
            ]
          },
          {
            'periodName': '1st Period',
            'billedPremium': 61312,
            'exposure': 3572,
            'paidClaims': 40662,
            'fullyIncurredClaims': 40905.972,
            'historicalInfoEntries': [
              {
                'planName': 'High',
                'periodDate': '2020-01-01',
                'billedPremium': 40662,
                'exposure': 3572,
                'paidClaims': 61312
              }
            ]
          },
          {
            'periodName': '2nd Period',
            'billedPremium': 29506,
            'exposure': 2461,
            'paidClaims': 20296,
            'fullyIncurredClaims': 20417.776,
            'historicalInfoEntries': [
              {
                'planName': 'High',
                'periodDate': '2019-01-01',
                'billedPremium': 20296,
                'exposure': 2461,
                'paidClaims': 29506
              }
            ]
          }
        ],
        'rates': [
          {
            'tier': 'Individual',
            'tierName': 'Individual',
            'tierRates': [
              {
                'periodName': 'Current2021',
                'rateValue': 21
              },
              {
                'periodName': '1st Period',
                'rateValue': 22
              },
              {
                'periodName': '2nd Period',
                'rateValue': 20.240000000000003
              }
            ]
          },
          {
            'tier': 'IndividualAndSpouse',
            'tierName': 'Individual + Spouse',
            'tierRates': [
              {
                'periodName': 'Current2021',
                'rateValue': 31
              },
              {
                'periodName': '1st Period',
                'rateValue': 41
              },
              {
                'periodName': '2nd Period',
                'rateValue': 37.72
              }
            ]
          },
          {
            'tier': 'IndividualAndChildren',
            'tierName': 'Individual + Child(ren)',
            'tierRates': [
              {
                'periodName': 'Current2021',
                'rateValue': 37
              },
              {
                'periodName': '1st Period',
                'rateValue': 44
              },
              {
                'periodName': '2nd Period',
                'rateValue': 40.480000000000007
              }
            ]
          },
          {
            'tier': 'Family',
            'tierName': 'Family',
            'tierRates': [
              {
                'periodName': 'Current2021',
                'rateValue': 50
              },
              {
                'periodName': '1st Period',
                'rateValue': 70
              },
              {
                'periodName': '2nd Period',
                'rateValue': 64.4
              }
            ]
          }
        ]
      },
      {
        'planName': 'Low',
        'historicalInformation': [
          {
            'periodName': 'Current2021',
            'billedPremium': 50112,
            'exposure': 2572,
            'paidClaims': 30662,
            'fullyIncurredClaims': 34495.07771634615,
            'historicalInfoEntries': [
              {
                'planName': 'High',
                'periodDate': '2021-01-01',
                'billedPremium': 30662,
                'exposure': 2572,
                'paidClaims': 50112
              }
            ]
          },
          {
            'periodName': '1st Period',
            'billedPremium': 51312,
            'exposure': 2572,
            'paidClaims': 30662,
            'fullyIncurredClaims': 30905.972,
            'historicalInfoEntries': [
              {
                'planName': 'High',
                'periodDate': '2020-01-01',
                'billedPremium': 30662,
                'exposure': 2572,
                'paidClaims': 51312
              }
            ]
          },
          {
            'periodName': '2nd Period',
            'billedPremium': 19506,
            'exposure': 1461,
            'paidClaims': 10296,
            'fullyIncurredClaims': 10417.776,
            'historicalInfoEntries': [
              {
                'planName': 'High',
                'periodDate': '2019-01-01',
                'billedPremium': 10296,
                'exposure': 1461,
                'paidClaims': 19506
              }
            ]
          }
        ],
        'rates': [
          {
            'tier': 'Individual',
            'tierName': 'Individual',
            'tierRates': [
              {
                'periodName': 'Current2021',
                'rateValue': 21
              },
              {
                'periodName': '1st Period',
                'rateValue': 22
              },
              {
                'periodName': '2nd Period',
                'rateValue': 20.240000000000003
              }
            ]
          },
          {
            'tier': 'IndividualAndSpouse',
            'tierName': 'Individual + Spouse',
            'tierRates': [
              {
                'periodName': 'Current2021',
                'rateValue': 31
              },
              {
                'periodName': '1st Period',
                'rateValue': 41
              },
              {
                'periodName': '2nd Period',
                'rateValue': 37.72
              }
            ]
          },
          {
            'tier': 'IndividualAndChildren',
            'tierName': 'Individual + Child(ren)',
            'tierRates': [
              {
                'periodName': 'Current2021',
                'rateValue': 37
              },
              {
                'periodName': '1st Period',
                'rateValue': 44
              },
              {
                'periodName': '2nd Period',
                'rateValue': 40.480000000000007
              }
            ]
          },
          {
            'tier': 'Family',
            'tierName': 'Family',
            'tierRates': [
              {
                'periodName': 'Current2021',
                'rateValue': 50
              },
              {
                'periodName': '1st Period',
                'rateValue': 70
              },
              {
                'periodName': '2nd Period',
                'rateValue': 64.4
              }
            ]
          }
        ]
      }
    ]
  }
}