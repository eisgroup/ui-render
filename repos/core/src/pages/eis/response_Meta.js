export default {
  'view': 'Col',
  'items': [
    {
      'view': 'Table',
      'name': 'ratioByTierExpenses',
      'headers': [
        {
          'id': 'permissibleLossRatioPct',
          'label': 'Percent with 2 decimals',
          'renderCell': {
            'name': 'Percent',
            'decimals': 2
          }
        }
      ]
    },
    {
      'view': 'Title',
      'label': {
        'name': 'ratioByTierExpenses.0.permissibleLossRatioPct'
      },
      'renderLabel': {
        'name': 'Percent',
        'decimals': 2,
      }
    },
    {
      'view': 'Title',
      'label': 'Float with 3 decimals'
    },
    {
      'view': 'Text',
      'label': {
        'name': 'ratioByTierExpenses.0.permissibleLossRatioPct'
      },
      'renderLabel': {
        'name': 'Float',
        'decimals': 3,
      }
    }
  ]
}
