const a = {
  'plans': [
    {
      'planID': 'Golden',
      'coverages': [
        {
          'coverageID': 'STD Core', // Coverage Name
          'fundingStructure': {
            'contributionType': 'Non-contributory', // Contribution Type
            'requiredParticipationPrct': 0.25, // Contribution

            // Payor = Sponsor if Contribution Type = Non-Contributory
            // Payor = Sponsor/Participant if Contribution Type = Contributory
            // Payor = Participant if Contribution Type = Voluntary

            // Payment 1/12 - take all unique modes from sponsorPaymentMode and memberPaymentModes
            'sponsorPaymentMode': 1, // Payment
            'memberPaymentModes': [
              1,
              12
            ]
          },

          'rate': 0.7, // one value for both Manual and Quote rate
          'annualPremium': 12600, // Annual Premium

          // if Contribution Type = Contributory => Premium 12222/378
          'sponsorAnnualPremium': 12222,
          'memberAnnualPremium': 378,

          'classes': [
            {
              'classID': '1', // Class Name
              'numberOfLives': 10, // Number of Participants
              'totalVolume': 15000, // Total Volume
              'annualPremium': 12600, // Annual Premium
              'rate': 0.7, // Rate - to be added in UI
              // Payor - to be copied from Coverage level
              // Payment - to be copied from Coverage level

              // if Contribution Type = Contributory => Premium 12222/378
              'sponsorAnnualPremium': 12222,
              'memberAnnualPremium': 378,

              'rateCards': [
                {
                  'ageBandName': '<25', // subgroup name
                  'numberOfLives': 13, // number of Participants
                  'rate': 1.08, // Rate
                  'annualPremium': 1200,

                  // Payor - to be copied from Coverage level
                  // Payment - to be copied from Coverage level

                  // if Contribution Type = Contributory => Premium 12222/378
                  'sponsorAnnualPremium': 12222,
                  'memberAnnualPremium': 378,
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
