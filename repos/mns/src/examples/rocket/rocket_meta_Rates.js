export default {
  'view': 'VerticalLayout',
  'styles': 'padding-h-largest bg-info-light',
  'showIf': {
    'relativeData': false,
    'name': 'response.RatingDetails'
  },
  'items': [
    {
      '@class': 'org.openl.generated.beans.Layout',
      'view': 'VerticalLayout',
      'styles': 'margin-v-largest',
      'relativeData': false,
      'items': [
        {
          '@class': 'org.openl.generated.beans.Title',
          'view': 'Title',
          'label': 'Rate Information',
          'styles': 'padding'
        },
        {
          '@class': 'org.openl.generated.beans.Title',
          'view': 'Title',
          'label': 'Plans',
          'styles': 'padding'
        },
        {
          '@class': 'org.openl.generated.beans.Layout',
          'view': 'HorizontalLayout',
          'styles': 'padding-largest middle bg-neutral',
          'items': [
            {
              '@class': 'org.openl.generated.beans.Layout',
              'view': 'VerticalLayout',
              'styles': 'padding-largest middle bg-neutral',
              'items': [
                {
                  '@class': 'org.openl.generated.beans.Text',
                  'view': 'Text',
                  'children': {
                    'name': 'response.RatingDetails.Plans[0].PlanName',
                    'relativeData': null
                  },
                  'styles': 'h6'
                },
                {
                  '@class': 'org.openl.generated.beans.Table',
                  'view': 'Table',
                  'name': 'response.RatingDetails.Plans[0].Coverages[0].Classes[0].RatesAndPremiumByTier',
                  'headers': [
                    {
                      '@class': 'org.openl.generated.beans.TableHeader',
                      'id': 'TierName',
                      'label': 'Tier'
                    },
                    {
                      '@class': 'org.openl.generated.beans.TableHeader',
                      'id': 'NumberOfLives',
                      'label': 'Number Of Lives'
                    },
                    {
                      '@class': 'org.openl.generated.beans.TableHeader',
                      'id': 'ManualRate',
                      'label': 'Manual Rate',
                      'renderCell': {
                        '@class': 'org.openl.generated.beans.RenderCell',
                        'name': 'Currency'
                      }
                    },
                    {
                      '@class': 'org.openl.generated.beans.TableHeader',
                      'id': 'MonthlyPremium',
                      'label': 'Monthly Premium',
                      'renderCell': {
                        '@class': 'org.openl.generated.beans.RenderCell',
                        'name': 'Currency'
                      }
                    },
                    {
                      '@class': 'org.openl.generated.beans.TableHeader',
                      'id': 'AnnualPremium',
                      'label': 'Annual Premium',
                      'renderCell': {
                        '@class': 'org.openl.generated.beans.RenderCell',
                        'name': 'Currency'
                      }
                    }
                  ],
                  'relativeData': false,
                  'showIf': {}
                }
              ],
              'version': 'Plan1Layout'
            },
            {
              '@class': 'org.openl.generated.beans.Layout',
              'view': 'VerticalLayout',
              'styles': 'padding-largest middle bg-neutral',
              'items': [
                {
                  '@class': 'org.openl.generated.beans.Text',
                  'view': 'Text',
                  'children': {
                    'name': 'response.RatingDetails.Plans[1].PlanName',
                    'relativeData': null
                  },
                  'styles': 'h6'
                },
                {
                  '@class': 'org.openl.generated.beans.Table',
                  'view': 'Table',
                  'name': 'response.RatingDetails.Plans[1].Coverages[0].Classes[0].RatesAndPremiumByTier',
                  'headers': [
                    {
                      '@class': 'org.openl.generated.beans.TableHeader',
                      'id': 'TierName',
                      'label': 'Tier'
                    },
                    {
                      '@class': 'org.openl.generated.beans.TableHeader',
                      'id': 'NumberOfLives',
                      'label': 'Number Of Lives'
                    },
                    {
                      '@class': 'org.openl.generated.beans.TableHeader',
                      'id': 'ManualRate',
                      'label': 'Manual Rate',
                      'renderCell': {
                        '@class': 'org.openl.generated.beans.RenderCell',
                        'name': 'Currency'
                      }
                    },
                    {
                      '@class': 'org.openl.generated.beans.TableHeader',
                      'id': 'MonthlyPremium',
                      'label': 'Monthly Premium',
                      'renderCell': {
                        '@class': 'org.openl.generated.beans.RenderCell',
                        'name': 'Currency'
                      }
                    },
                    {
                      '@class': 'org.openl.generated.beans.TableHeader',
                      'id': 'AnnualPremium',
                      'label': 'Annual Premium',
                      'renderCell': {
                        '@class': 'org.openl.generated.beans.RenderCell',
                        'name': 'Currency'
                      }
                    }
                  ],
                  'relativeData': false,
                  'showIf': {}
                }
              ],
              'version': 'Plan2Layout'
            }
          ],
          'version': 'PlansLayout'
        }
      ],
      'version': 'RatingDetailsLayout'
    }
  ],
  'version': '0.20.1'
}