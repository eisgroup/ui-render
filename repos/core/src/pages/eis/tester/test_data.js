import { cloneDeep } from 'utils-pack'

const DailyInformation = {
  Date: '2022-02-02',
  BilledPremium: 82000.00,
  Exposure: 82000.00,
  PaidClaims: 82000.00,
  CompletionFactor: 82000.00,
  FullyIncurredClaims: 82000.00,
  IBNR: 82000.00,
}

const HistoricalInformation = [
  {
    PeriodName: '1st Period',
    BilledPremium: 82000.00,
    Exposure: 82000.00,
    PaidClaims: 82000.00,
    CompletionFactor: 82000.00,
    FullyIncurredClaims: 82000.00,
    IBNR: 82000.00,
    DailyInformation: [
      cloneDeep(DailyInformation),
      cloneDeep(DailyInformation),
    ]
  },
  {
    PeriodName: '2nd Period',
    BilledPremium: 82000.00,
    Exposure: 82000.00,
    PaidClaims: 82000.00,
    CompletionFactor: 82000.00,
    FullyIncurredClaims: 82000.00,
    IBNR: 82000.00,
    DailyInformation: [
      cloneDeep(DailyInformation),
      cloneDeep(DailyInformation),
    ]
  }
]

export default {
  'UseExperienceRating': false,
  'PaidClaimsBasis': 'Year',
  'TrendAssumption': 1.03,
  'Credibility': 1,
  'ShowExperienceRating': true,
  'RatesAndExposure': [
    {
      PlanName: 'Plan 1',
      HistoricalInformation: cloneDeep(HistoricalInformation),
      Rates: [
        {
          'Tier': 'Individual',
          'ExposureCurrentPeriod': 77.00,
          'ManualRatesRenewalPeriod': 77.77,
          'ManualRatesCurrentPeriod': 77.00,
          'ChargeRates1stPeriod': 77.00,
          'ChargeRates2ndPeriod': 77.00,
          'ChargeRates3rdPeriod': 77.00,
        },
        {
          'Tier': 'Individual',
          'ExposureCurrentPeriod': 88.00,
          'ManualRatesRenewalPeriod': 88.88,
          'ManualRatesCurrentPeriod': 88.00,
          'ChargeRates1stPeriod': 88.00,
          'ChargeRates2ndPeriod': 88.00,
          'ChargeRates3rdPeriod': 88.88,
        },
      ],
    },
    {
      PlanName: 'Plan 2',
      HistoricalInformation: cloneDeep(HistoricalInformation),
      Rates: [
        {
          'Tier': 'Individual',
          'ExposureCurrentPeriod': 55.00,
          'ManualRatesRenewalPeriod': 55.55,
          'ManualRatesCurrentPeriod': 55.00,
          'ChargeRates1stPeriod': 55.00,
          'ChargeRates2ndPeriod': 55.00,
          'ChargeRates3rdPeriod': 55.00,
        },
        {
          'Tier': 'Individual',
          'ExposureCurrentPeriod': 44.00,
          'ManualRatesRenewalPeriod': 44.44,
          'ManualRatesCurrentPeriod': 44.00,
          'ChargeRates1stPeriod': 44.00,
          'ChargeRates2ndPeriod': 44.00,
          'ChargeRates3rdPeriod': 44.44,
        },
      ]
    },
  ],

  'dataKind': {
    'Period': [
      {
        'StartDate': '2021-02-04T14:35:52+00:00',
        'EndDate': '2022-02-03',
        'PeriodName': 'Current Period',
        'Weight': 0.5,
        'NumberOfMonth': 12
      },
      {
        'StartDate': '2020-02-04',
        'EndDate': '2021-02-03',
        'PeriodName': '1st Period',
        'Weight': 0.2,
        'NumberOfMonth': 12
      },
      {
        'StartDate': '2019-02-04',
        'EndDate': '2020-02-03',
        'PeriodName': '2nd Period',
        'Weight': 0.2,
        'NumberOfMonth': 12
      }
    ],
  }
}
